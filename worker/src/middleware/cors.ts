// CORS middleware for Cloudflare Workers

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://staging.harvest.org',
  'https://auth0-worker.webdept.workers.dev',
];

// ✅ Helper function: check if origin is allowed
function isAllowedOrigin(origin: string): boolean {
  return ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.harvest.org');
}

// ✅ Handle preflight requests
export function handleOptions(request: Request): Response | null {
  const origin = request.headers.get('Origin') || '';
  console.log('[CORS] Origin allowed:', origin);

  if (request.method !== 'OPTIONS') return null;

  if (!isAllowedOrigin(origin)) {
    return new Response('Forbidden: Origin not allowed', { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    },
  });
}

// ✅ Wrap response with CORS headers
export function withCors(response: Response, request: Request): Response {
  const origin = request.headers.get('Origin') || '';
  const headers = new Headers(response.headers);

  if (isAllowedOrigin(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
