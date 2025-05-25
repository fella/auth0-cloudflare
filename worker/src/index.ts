import { handleAuth, requireAuth } from './auth';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/protected') {
      return requireAuth(request, async () => {
        return new Response(JSON.stringify({ message: 'Secure API response ✅' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      });
    }

    return new Response('Not found', { status: 404 });
  }
};
