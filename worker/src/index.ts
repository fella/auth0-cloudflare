import { requireAuth } from './auth';

export default {
  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/protected') {
      return requireAuth(request, async (user) => {
        return new Response(JSON.stringify({
          message: '🔒 Protected route accessed!',
          user
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};
