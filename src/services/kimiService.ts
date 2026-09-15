import { storageService } from './storageService';

const MOONSHOT_API_ENDPOINT = 'https://api.moonshot.cn/v1/chat/completions';

export interface KimiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const kimiService = {
  /**
   * Panggil API Kimi AI (Moonshot AI) secara langsung
   */
  async callKimi(
    prompt: string,
    systemPrompt: string = 'Anda adalah Kimi AI, edukator dan narator pembelajaran yang komunikatif, ramah, dan sangat ahli menjelaskan konsep rumit menjadi analogi intuitif.'
  ): Promise<string> {
    const settings = storageService.getSettings();
    const apiKey = settings.kimiApiKey?.trim();
    const model = settings.kimiModel || 'moonshot-v1-8k';

    if (!apiKey) {
      throw new Error('Kimi AI (Moonshot) API Key belum dikonfigurasi di menu Pengaturan.');
    }

    const messages: KimiMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    try {
      const response = await fetch(MOONSHOT_API_ENDPOINT, {
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
        throw new Error(`Kimi AI Error: ${message}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Tidak ada respon teks yang dihasilkan oleh Kimi AI.');
      }

      return content;
    } catch (error: any) {
      console.error('Error calling Kimi AI API:', error);
      throw error;
    }
  },

  /**
   * Menguji koneksi Kimi AI (Moonshot) API Key
   */
  async testConnection(apiKey: string, model: string = 'moonshot-v1-8k'): Promise<{ success: boolean; message: string }> {
    if (!apiKey?.trim()) {
      return { success: false, message: 'Kimi API Key tidak boleh kosong.' };
    }

    try {
      const response = await fetch(MOONSHOT_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: model || 'moonshot-v1-8k',
          messages: [
            { role: 'user', content: 'Halo Kimi, berikan salam 1 kalimat pendek untuk tes koneksi PippayLearning.' }
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
      const reply = data.choices?.[0]?.message?.content || 'Koneksi Kimi AI berhasil!';
      return { success: true, message: `Berhasil! Respon Kimi: "${reply.trim()}"` };
    } catch (err: any) {
      return { success: false, message: `Koneksi gagal: ${err.message}` };
    }
  }
};
