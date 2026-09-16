const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers });
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return json({ success: false, message: 'Method not allowed' }, 405);

  try {
    const { provider = 'gemini', prompt, systemPrompt, model, apiKey } = await request.json();
    if (typeof prompt !== 'string' || !prompt.trim()) return json({ success: false, message: 'Prompt wajib diisi.' }, 400);

    if (provider === 'openrouter') {
      const openRouterApiKey = typeof apiKey === 'string' && apiKey.trim() ? apiKey.trim() : env.OPENROUTER_API_KEY;
      if (!openRouterApiKey) return json({ success: false, message: 'OpenRouter API Key belum dikonfigurasi di Pengaturan atau Cloudflare.' }, 503);
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openRouterApiKey}`,
          'HTTP-Referer': request.headers.get('Origin') || 'https://pippay-learning.pages.dev',
          'X-Title': 'Pippay Learning',
        },
        body: JSON.stringify({
          model: model || 'deepseek/deepseek-chat',
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
        }),
      });
      const data = await response.json();
      if (!response.ok) return json({ success: false, message: data.error?.message || `OpenRouter HTTP ${response.status}` }, response.status);
      return json({ success: true, content: data.choices?.[0]?.message?.content || '' });
    }

    const geminiApiKey = typeof apiKey === 'string' && apiKey.trim() ? apiKey.trim() : env.GEMINI_API_KEY;
    if (!geminiApiKey) return json({ success: false, message: 'Gemini API Key belum dikonfigurasi di Pengaturan atau Cloudflare.' }, 503);
    const geminiModel = model || 'gemini-1.5-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        ...(systemPrompt ? { systemInstruction: { parts: [{ text: systemPrompt }] } } : {}),
        generationConfig: { temperature: 0.3, topP: 0.95 },
      }),
    });
    const data = await response.json();
    if (!response.ok) return json({ success: false, message: data.error?.message || `Gemini HTTP ${response.status}` }, response.status);
    return json({ success: true, content: data.candidates?.[0]?.content?.parts?.[0]?.text || '' });
  } catch (error) {
    return json({ success: false, message: error instanceof Error ? error.message : 'AI request gagal.' }, 500);
  }
}