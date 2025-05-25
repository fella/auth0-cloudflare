import { jwtVerify } from 'jose';

const AUTH0_DOMAIN = 'https://auth.harvest.org';
const AUTH0_AUDIENCE = 'https://api.harvest.org';

export async function requireAuth(request: Request, next: (user: any) => Promise<Response>): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response('Unauthorized: Missing Bearer token', { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const jwksUri = `${AUTH0_DOMAIN}/.well-known/jwks.json`;
    const res = await fetch(jwksUri);
    const { keys } = await res.json();

    const key = await crypto.subtle.importKey(
      'jwk',
      keys[0],
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const { payload } = await jwtVerify(token, key, {
      issuer: `${AUTH0_DOMAIN}/`,
      audience: AUTH0_AUDIENCE,
    });

    console.log('[Auth] Verified token for user:', payload.sub);
    return next(payload);
  } catch (err) {
    console.error('[Auth] JWT verification failed:', err);
    return new Response('Forbidden: Invalid token', { status: 403 });
  }
}
