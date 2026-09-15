import { getStore } from '@netlify/blobs';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

export default async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
      status: 405,
      headers: CORS_HEADERS,
    });
  }

  try {
    const body = await req.json();
    const { jadwal, settings } = body;

    if (!jadwal || !settings) {
      return new Response(JSON.stringify({ message: 'Missing jadwal or settings in body.' }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    // Store jadwal + settings in Netlify Blobs (site-level store)
    const store = getStore('pippay-data');
    await store.setJSON('jadwal', jadwal);
    await store.setJSON('settings', settings);

    return new Response(JSON.stringify({ success: true, message: 'Data tersinkronisasi ke server.' }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
};
