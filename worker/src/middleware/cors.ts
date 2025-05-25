// CORS middleware for Cloudflare Workers

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'https://staging.harvest.org',
    'https://auth0-worker.webdept.workers.dev',
  ];
  
  export function handleOptions(request: Request): Response | null {
    if (request.method !== 'OPTIONS') return null;
  
    const origin = request.headers.get('Origin') || '';
    if (!ALLOWED_ORIGINS.includes(origin)) {
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
  
  export function withCors(response: Response, request: Request): Response {
    const origin = request.headers.get('Origin') || '';
    const headers = new Headers(response.headers);
  
    if (ALLOWED_ORIGINS.includes(origin)) {
      headers.set('Access-Control-Allow-Origin', origin);
      headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      headers.set('Access-Control-Max-Age', '86400');
      headers.set('Vary', 'Origin');
    }
  
    return new Response(response.body, {
      status: response.status,
      headers,
    });
  }
  