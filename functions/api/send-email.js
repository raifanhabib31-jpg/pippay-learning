/**
 * Cloudflare Pages Function: /api/send-email
 * Menggunakan onRequest (handles ALL methods) untuk kompatibilitas maksimal.
 */
export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: `Method ${request.method} not allowed` }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const payload = await request.json();

    const apiKey = typeof payload.apiKey === 'string' && payload.apiKey.trim()
      ? payload.apiKey.trim()
      : (env && env.RESEND_API_KEY) || '';

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'Resend API Key belum dikonfigurasi di Pengaturan atau Cloudflare.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const from = payload.from || 'PippayLearning <onboarding@resend.dev>';

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    const data = await resendRes.json();

    if (!resendRes.ok) {
      return new Response(
        JSON.stringify({ success: false, message: data.message || `Resend error ${resendRes.status}` }),
        { status: resendRes.status, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: corsHeaders }
    );
  }
}
