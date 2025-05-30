import { KeyLike, jwtVerify, decodeProtectedHeader, importJWK, JWTPayload } from 'jose';

const AUTH0_DOMAIN = 'https://auth.harvest.org';
const AUTH0_AUDIENCE = 'https://api.harvest.org';
const JWKS_CACHE_TTL = 3600_000; // 1 hour in milliseconds

// 🔁 In-memory JWKS cache with expiration
const cachedJWKS: Record<string, { key: KeyLike; expiresAt: number }> = {};

async function getPublicKeyForToken(token: string): Promise<KeyLike> {
  const { kid } = decodeProtectedHeader(token);

  if (!kid) {
    throw new Error('Token header missing kid');
  }

  const cached = cachedJWKS[kid];
  if (cached && cached.expiresAt > Date.now()) {
    return cached.key;
  }

  const jwksUri = `${AUTH0_DOMAIN}/.well-known/jwks.json`;
  const res = await fetch(jwksUri);
  const { keys } = await res.json();

  const jwk = keys.find((key: any) => key.kid === kid);
  if (!jwk) throw new Error(`JWK with kid ${kid} not found`);

  const key = await importJWK(jwk, 'RS256');

  if (!('type' in key)) {
    throw new Error('Imported key is not a valid KeyLike object');
  }
  cachedJWKS[kid] = {
    key,
    expiresAt: Date.now() + JWKS_CACHE_TTL,
  };

  return key;
}

function validateClaims(payload: JWTPayload): void {
  const now = Math.floor(Date.now() / 1000);

  // ⏰ Token expiration check
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

  // ✅ Enforce required role
  const roles = payload['https://auth.harvest.org/roles'] || [];
  if (!Array.isArray(roles) || !roles.includes('admin')) {
    throw new Error('Missing required admin role');
  }

  // ✅ Enforce group presence
  const group = payload['https://auth.harvest.org/group'];
  if (!group) {
    throw new Error('Missing group');
  }
}

// 🧼 Normalize custom claims for easier access
function normalizeClaims(payload: JWTPayload) {
  return {
    ...payload,
    roles: payload['https://auth.harvest.org/roles'] || [],
    group: payload['https://auth.harvest.org/group'] || null,
    wp_role: payload['https://auth.harvest.org/wp_role'] || null,
  };
}

export async function requireAuth(
  request: Request,
  next: (user: ReturnType<typeof normalizeClaims>) => Promise<Response>
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
    const user = normalizeClaims(payload);

    console.log('[Auth] Verified user:', user.sub);
    return next(user);
  } catch (err: any) {
    console.error('[Auth] JWT verification failed:', err.message);
    return new Response(`Forbidden: ${err.message}`, { status: 403 });
  }
}
