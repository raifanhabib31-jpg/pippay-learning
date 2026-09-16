import { storageService } from './storageService';

async function callOpenRouter(prompt: string, systemPrompt?: string): Promise<string> {
  const settings = storageService.getSettings();
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'openrouter',
      apiKey: settings.openRouterApiKey?.trim(),
      model: settings.openRouterModel || 'deepseek/deepseek-chat',
      prompt,
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

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await callOpenRouter('Balas dengan satu kata: OK');
      return { success: true, message: 'Koneksi OpenRouter berhasil.' };
    } catch (error) {
      return { success: false, message: `Gagal terhubung ke OpenRouter: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  },
};