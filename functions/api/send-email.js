/**
 * Cloudflare Pages Function: POST /api/send-email
 * Server-side proxy ke Resend API — menghindari CORS.
 */
export async function onRequestPost({ request, env }) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const payload = await request.json();
    const apiKey = (payload.apiKey && payload.apiKey.trim()) || (env && env.VITE_RESEND_API_KEY) || '';

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'Resend API key tidak ditemukan di server.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: payload.from || 'PippayLearning <onboarding@resend.dev>',
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    const data = await resendRes.json();

    if (!resendRes.ok) {
      return new Response(
        JSON.stringify({ success: false, message: data.message || `Resend error: ${resendRes.status}` }),
        { status: resendRes.status, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err instanceof Error ? err.message : 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

/** Handle preflight OPTIONS */
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
