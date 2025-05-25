import { requireAuth } from './auth';
import { handleOptions, withCors } from './middleware/cors';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 🌐 Dev logging
    console.log('[Worker] Method:', request.method);
    console.log('[Worker] Path:', pathname);
    console.log('[Worker] Origin:', request.headers.get('Origin'));

    // 🛑 Handle CORS preflight
    const corsResponse = handleOptions(request);
    if (corsResponse) return corsResponse;

    // 🛡️ Protected API route
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

    // 🧪 Debug route
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
    

    // 🚫 Catch-all
    return new Response('Not Found', { status: 404 });
  },
};
