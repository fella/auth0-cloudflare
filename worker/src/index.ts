export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
      const origin = request.headers.get('Origin') || '';
      console.log('[Test] OPTIONS from:', origin);

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

    return new Response('OK');
  },
};


/*
import { requireAuth } from './auth';
import { handleOptions, withCors } from './middleware/cors';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const origin = request.headers.get('Origin') || '';

    // 🌐 Dev logging
    console.log('[Worker] Method:', request.method);
    console.log('[Worker] Path:', pathname);
    console.log('[Worker] Origin:', origin);

    // 🛑 Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      const corsResponse = handleOptions(request);
      return corsResponse || new Response('CORS not allowed', { status: 403 });
    }

    // 🔒 Protected API route
    if (pathname === '/api/protected') {
      return requireAuth(request, async (user) => {
        const data = {
          message: '🔒 Protected route accessed!',
          user,
        };
        return withCors(
          new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' },
          }),
          request
        );
      });
    }

    // 🧪 Debug route to inspect headers
    if (pathname === '/debug/token') {
      const debugData = {
        message: '🔍 Debug Info',
        headers: Object.fromEntries(request.headers),
      };
      return withCors(
        new Response(JSON.stringify(debugData), {
          headers: { 'Content-Type': 'application/json' },
        }),
        request
      );
    }

    // 👤 Authenticated user identity
    if (pathname === '/api/whoami') {
      return requireAuth(request, async (user) => {
        const whoami = {
          sub: user.sub,
          email: user.email,
          roles: user['https://auth.harvest.org/roles'] || [],
          wp_role: user['https://auth.harvest.org/wp_role'] || null,
          group: user['https://auth.harvest.org/group'] || null,
        };

        return withCors(
          new Response(JSON.stringify({ message: '🙋 Who Am I', whoami }), {
            headers: { 'Content-Type': 'application/json' },
          }),
          request
        );
      });
    }

    // 🚫 Not found — apply CORS headers
    return withCors(
      new Response('Not Found', { status: 404 }),
      request
    );
  },
};
*/
