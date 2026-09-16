const jsonHeaders = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

function response(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

export async function onRequest(context) {
  const { request, env } = context;
  const userId = request.headers.get('X-User-Id')?.trim();

  if (!userId) {
    return response({ success: false, message: 'User identity tidak ditemukan.' }, 401);
  }

  if (!env.SETTINGS_KV) {
    return response({ success: false, message: 'SETTINGS_KV belum dikonfigurasi di Cloudflare Pages.' }, 503);
  }

  const key = `settings:${userId}`;

  if (request.method === 'GET') {
    const settings = await env.SETTINGS_KV.get(key, 'json');
    return response({ success: true, settings: settings || null });
  }

  if (request.method === 'PUT') {
    try {
      const settings = await request.json();
      if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
        return response({ success: false, message: 'Format settings tidak valid.' }, 400);
      }

      await env.SETTINGS_KV.put(key, JSON.stringify(settings));
      return response({ success: true });
    } catch (error) {
      return response({ success: false, message: error instanceof Error ? error.message : 'Gagal menyimpan settings.' }, 400);
    }
  }

  return response({ success: false, message: `Method ${request.method} not allowed` }, 405);
}
