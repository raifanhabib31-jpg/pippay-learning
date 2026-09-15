/**
 * Cloudflare Pages Function: /api/send-email
 * Server-side proxy to Resend API — bypasses CORS.
 * Env var: VITE_RESEND_API_KEY (set in Cloudflare Pages dashboard)
 */

interface Env {
  VITE_RESEND_API_KEY?: string;
}

interface EmailPayload {
  apiKey?: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // CORS headers so the browser fetch succeeds
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const payload: EmailPayload = await request.json();

    // Use key from payload first, then fall back to server env var
    const apiKey = (payload.apiKey?.trim()) || env.VITE_RESEND_API_KEY || '';

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'Resend API key tidak ditemukan.' }),
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

    const data = await resendRes.json() as Record<string, unknown>;

    if (!resendRes.ok) {
      const errMsg = (data.message as string) || `HTTP ${resendRes.status}`;
      return new Response(
        JSON.stringify({ success: false, message: errMsg }),
        { status: resendRes.status, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return new Response(
      JSON.stringify({ success: false, message: msg }),
      { status: 500, headers: corsHeaders }
    );
  }
};

// Handle preflight OPTIONS request
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
