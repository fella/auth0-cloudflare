import { jwtVerify, decodeProtectedHeader, importJWK, JWTPayload } from 'jose';

const AUTH0_DOMAIN = 'https://auth.harvest.org';
const AUTH0_AUDIENCE = 'https://api.harvest.org';

// 🔁 In-memory JWKS cache (per Worker instance)
let cachedJWKS: Record<string, CryptoKey> = {};

async function getPublicKeyForToken(token: string): Promise<CryptoKey> {
  const { kid } = decodeProtectedHeader(token);
  if (cachedJWKS[kid]) return cachedJWKS[kid];

  const jwksUri = `${AUTH0_DOMAIN}/.well-known/jwks.json`;
  const res = await fetch(jwksUri);
  const { keys } = await res.json();

  const jwk = keys.find((key: any) => key.kid === kid);
  if (!jwk) throw new Error(`JWK with kid ${kid} not found`);

  const key = await importJWK(jwk, 'RS256');
  cachedJWKS[kid] = key;
  return key;
}

function validateClaims(payload: JWTPayload): void {
  const now = Math.floor(Date.now() / 1000);

  // 🔐 Reject expired tokens
  if (!payload.exp || payload.exp < now) {
    throw new Error('Token expired');
  }

  // ✅ Validate issuer and audience
  if (payload.iss !== `${AUTH0_DOMAIN}/`) {
    throw new Error(`Invalid issuer: ${payload.iss}`);
  }

  if (
    typeof payload.aud === 'string' &&
    payload.aud !== AUTH0_AUDIENCE
  ) {
    throw new Error(`Invalid audience: ${payload.aud}`);
  }

  if (
    Array.isArray(payload.aud) &&
    !payload.aud.includes(AUTH0_AUDIENCE)
  ) {
    throw new Error(`Audience mismatch: ${payload.aud.join(', ')}`);
  }

  // 🛂 Optional: Enforce required roles or groups
  const roles = payload['https://auth.harvest.org/roles'];
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    throw new Error('Missing required roles');
  }

  const group = payload['https://auth.harvest.org/group'];
  if (!group) {
    throw new Error('Missing group');
  }
}

export async function requireAuth(
  request: Request,
  next: (user: JWTPayload) => Promise<Response>
): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Unauthorized: Missing Bearer token', { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const publicKey = await getPublicKeyForToken(token);

    const { payload } = await jwtVerify(token, publicKey, {
      issuer: `${AUTH0_DOMAIN}/`,
      audience: AUTH0_AUDIENCE,
    });

    validateClaims(payload);

    console.log('[Auth] Token verified for user:', payload.sub);
    return next(payload);
  } catch (err: any) {
    console.error('[Auth] JWT verification failed:', err.message);
    return new Response(`Forbidden: ${err.message}`, { status: 403 });
  }
}
