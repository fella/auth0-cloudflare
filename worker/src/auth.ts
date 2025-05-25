import { jwtVerify } from 'jose';

const AUTH0_DOMAIN = 'https://auth.harvest.org';
const AUTH0_AUDIENCE = 'https://api.harvest.org';

export async function requireAuth(request: Request, next: () => Promise<Response>): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const res = await fetch(`${AUTH0_DOMAIN}/.well-known/jwks.json`);
    const jwks = await res.json();

    const key = await crypto.subtle.importKey(
      'jwk',
      jwks.keys[0],
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const { payload } = await jwtVerify(token, key, {
      issuer: `${AUTH0_DOMAIN}/`,
      audience: AUTH0_AUDIENCE,
    });

    console.log('✅ Authenticated user:', payload.sub);
    return next();

  } catch (err) {
    console.error('❌ JWT verification failed:', err);
    return new Response('Unauthorized', { status: 403 });
  }
}
