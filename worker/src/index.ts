import { requireAuth } from './auth';
import { handleOptions, withCors } from './middleware/cors';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // ✅ Handle CORS preflight
    const corsResponse = handleOptions(request);
    if (corsResponse) return corsResponse;

    // 🔐 Protected route
    if (pathname === '/api/protected') {
      return requireAuth(request, async (user) => {
        const json = JSON.stringify({
          message: '🔒 Protected route accessed!',
          user
        });

        return withCors(
          new Response(JSON.stringify({ message: '🔒 Protected route accessed!', user }), {
            headers: { 'Content-Type': 'application/json' }
          }),
          request
        );
      });
    }

    // 🧪 Dev route
    if (pathname === '/debug/token') {
      return withCors(
        new Response(JSON.stringify({
          message: '🔍 Debug Info',
          headers: Object.fromEntries(request.headers)
        }), {
          headers: { 'Content-Type': 'application/json' }
        }),
        request
      );
    }

    return new Response('Not Found', { status: 404 });
  }
};
