import { storageService } from './storageService';

const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const openaiService = {
  /**
   * Panggil API ChatGPT OpenAI secara langsung
   */
  async callOpenAI(
    prompt: string,
    systemPrompt: string = 'Anda adalah edukator dan narator pembelajaran yang komunikatif, ramah, dan sangat ahli menjelaskan konsep rumit menjadi analogi intuitif.'
  ): Promise<string> {
    const settings = storageService.getSettings();
    const apiKey = settings.openaiApiKey?.trim();
    const model = settings.openaiModel || 'gpt-4o-mini';

    if (!apiKey) {
      throw new Error('OpenAI API Key belum dikonfigurasi di menu Pengaturan.');
    }

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    try {
      const response = await fetch(OPENAI_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(`OpenAI API Error: ${message}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Tidak ada respon teks yang dihasilkan oleh OpenAI.');
      }

      return content;
    } catch (error: any) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  },

  /**
   * Menguji koneksi OpenAI API Key
   */
  async testConnection(apiKey: string, model: string = 'gpt-4o-mini'): Promise<{ success: boolean; message: string }> {
    if (!apiKey?.trim()) {
      return { success: false, message: 'API Key tidak boleh kosong.' };
    }

    try {
      const response = await fetch(OPENAI_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: [
            { role: 'user', content: 'Halo, berikan salam 1 kalimat pendek untuk tes koneksi PippayLearning.' }
          ],
          max_tokens: 30,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          message: errorData.error?.message || `Gagal terhubung (${response.status}: ${response.statusText})` 
        };
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || 'Koneksi berhasil!';
      return { success: true, message: `Berhasil! Respon: "${reply.trim()}"` };
    } catch (err: any) {
      return { success: false, message: `Koneksi gagal: ${err.message}` };
    }
  }
};
