import { storageService } from './storageService';

const PLAIN_TEXT_MATH_RULE = `
ATURAN FORMAT MATEMATIKA WAJIB: Tulis semua penjelasan dan rumus dalam teks biasa atau Markdown standar. Jangan gunakan sintaks LaTeX, KaTeX, delimiter matematika, atau tanda dolar ($). Gunakan simbol murni seperti /, *, +, -, =, <=, >=, dan ^; contoh: 45 / 2 = 22 sisa 1. Untuk pecahan gunakan (pembilang) / (penyebut).
`;

async function callOpenRouter(prompt: string, systemPrompt?: string, customApiKey?: string): Promise<string> {
  const settings = storageService.getSettings();
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'openrouter',
      apiKey: (customApiKey || settings.openRouterApiKey)?.trim(),
      model: settings.openRouterModel || 'deepseek/deepseek-chat',
      prompt: `${prompt}\n${PLAIN_TEXT_MATH_RULE}`,
      systemPrompt,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `OpenRouter API Error: HTTP ${response.status}`);
  if (!data.content) throw new Error('Tidak ada respon teks yang dihasilkan OpenRouter.');
  return data.content;
}

export const openRouterService = {
  callOpenRouter,

  async testConnection(customApiKey?: string): Promise<{ success: boolean; message: string }> {
    try {
      await callOpenRouter('Balas dengan satu kata: OK', undefined, customApiKey);
      return { success: true, message: 'Koneksi OpenRouter berhasil.' };
    } catch (error) {
      return { success: false, message: `Gagal terhubung ke OpenRouter: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  },
};