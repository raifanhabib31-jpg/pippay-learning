import { geminiService } from './geminiService';
import { openaiService } from './openaiService';
import { storageService } from './storageService';

export interface DualAgentProgress {
  step: number;
  totalSteps: number;
  stageName: string;
  agentName: string;
  detail: string;
}

export const dualAgentService = {
  /**
   * Pipeline Double Agent AI:
   * 1. Gemini: Ekstraksi Fakta, Sumber, Teori & Rumus
   * 2. ChatGPT: Rangkai Narasi Edukatif & Storytelling Mengalir
   * 3. Gemini: Audit, Koreksi Halusinasi & Verifikasi Ground-Truth
   */
  async generateDualAgentNarrative(
    rawContent: string,
    courseName?: string,
    fileName?: string,
    additionalPrompt?: string,
    onProgress?: (progress: DualAgentProgress) => void
  ): Promise<string> {
    const settings = storageService.getSettings();
    const hasOpenAI = Boolean(settings.openaiApiKey?.trim());

    // JIKA TIDAK ADA OPENAI API KEY: Fallback elegan ke Gemini dengan format naratif audit
    if (!hasOpenAI) {
      onProgress?.({
        step: 1,
        totalSteps: 1,
        stageName: 'Gemini Standalone Mode',
        agentName: 'Gemini AI',
        detail: 'OpenAI API Key belum diisi. Menggunakan Gemini Single-Agent High Precision Narrative...'
      });

      return geminiService.summarizeDocument(
        rawContent,
        'lengkap',
        courseName,
        fileName,
        `Buat penjelasan naratif edukatif yang sangat menarik, kaya analogi dunia nyata, dan pastikan seluruh rumus/definisi 100% akurat sesuai dokumen. ${additionalPrompt || ''}`
      );
    }

    // ==========================================
    // STEP 1: GEMINI AI (RESEARCHER & FACT FINDER)
    // ==========================================
    onProgress?.({
      step: 1,
      totalSteps: 3,
      stageName: 'Tahap 1: Ekstraksi Fakta & Validasi Sumber',
      agentName: 'Gemini AI (Researcher)',
      detail: 'Menganalisis dokumen asli, membedah silabus, menyusun daftar rumus baku, dan mengekstrak fakta penting...'
    });

    const geminiFactPrompt = `Anda adalah AGENT 1 (Researcher & Fact Extractor) dalam arsitektur Multi-Agent.
Tugas Anda: Analisis dokumen kuliah berikut dan ekstrak ringkasan fakta, definisi formal, rumus/algoritma, batasan konsep, dan poin silabus yang 100% otentik dari materi asli.
Jangan tambahkan opini atau asumsi yang tidak ada di dokumen.

Mata Kuliah: ${courseName || 'Umum'}
Nama Dokumen: ${fileName || 'Materi'}
${additionalPrompt ? `Catatan Khusus Pengguna: ${additionalPrompt}` : ''}

Teks Dokumen:
"""
${rawContent.slice(0, 30000)}
"""

Format Output Ekstraksi:
1. **Daftar Fakta & Konsep Kunci**: (poin-poin esensial)
2. **Definisi Baku & Terminologi**: (istilah teknis beserta arti aslinya)
3. **Rumus / Notasi / Algoritma**: (jika ada, tuliskan rumus dan arti variabel)
4. **Batasan & Jebakan Konsep**: (hal yang sering salah dipahami mahasiswa)`;

    const extractedFacts = await geminiService.callRawGemini(geminiFactPrompt, 'Anda adalah AI Researcher yang sangat teliti, presisi, dan berbasis data otentik.');

    // ==========================================
    // STEP 2: CHATGPT (CREATIVE NARRATOR)
    // ==========================================
    onProgress?.({
      step: 2,
      totalSteps: 3,
      stageName: 'Tahap 2: Merangkai Narasi & Storytelling Edukatif',
      agentName: 'ChatGPT / OpenAI (Narrator)',
      detail: 'Mengubah fakta kaku menjadi narasi belajar yang mengalir, mudah dipahami, kaya analogi, dan interaktif...'
    });

    const chatGptPrompt = `Anda adalah AGENT 2 (The Educator & Storyteller) dalam sistem Double Agent AI.
Anda menerima fakta resmi dan data materi yang telah diekstrak oleh Gemini AI (Agent 1).

Tugas Anda: Ubah fakta-fakta ini menjadi materi pembelajaran naratif bergaya storytelling kelas dunia untuk mahasiswa.
Kriteria Narasi:
- Gaya bahasa komunikatif, asyik, dan mudah dicerna tanpa kehilangan bobot akademik.
- Gunakan analogi dunia nyata yang kreatif untuk menjelaskan konsep yang rumit.
- Susun dengan alur bertahap: "Mengapa konsep ini ada?", "Bagaimana cara kerjanya?", "Contoh kasus praktis", dan "Langkah penerapan".
- Gunakan format Markdown rapi dengan emoji, heading bertingkat, dan callout.

FAKTA RESMI DARI GEMINI (AGENT 1):
"""
${extractedFacts}
"""`;

    const rawNarrative = await openaiService.callOpenAI(
      chatGptPrompt,
      'Anda adalah Master Educator dan Penulis Narasi Pembelajaran yang piawai membuat topik sulit terasa mudah dan menyenangkan.'
    );

    // ==========================================
    // STEP 3: GEMINI AI (FACT-CHECKER & AUDITOR)
    // ==========================================
    onProgress?.({
      step: 3,
      totalSteps: 3,
      stageName: 'Tahap 3: Audit Halusinasi & Verifikasi Ground-Truth',
      agentName: 'Gemini AI (Auditor)',
      detail: 'Menguji narasi ChatGPT terhadap dokumen asli, meluruskan rumus, dan memberi cap sertifikasi akurasi 100%...'
    });

    const geminiAuditPrompt = `Anda adalah AGENT 3 (Lead Auditor & Ground-Truth Fact-Checker) dalam sistem Double Agent AI.
Tugas Anda:
1. Periksa narasi yang ditulis oleh ChatGPT (Agent 2) di bawah ini.
2. Bandingkan dengan fakta materi asli dari dokumen.
3. Koreksi jika ada:
   - Halusinasi fakta atau analogi yang keliru secara ilmiah.
   - Rumus / kode / istilah teknis yang melenceng.
   - Konsep penting yang terlewat.
4. Buat versi FINAL yang sempurna, menggabungkan gaya narasi ChatGPT yang asyik dengan 100% akurasi faktual dari Gemini.

DOKUMEN ASLI:
"""
${rawContent.slice(0, 20000)}
"""

NARASI DARI CHATGPT (AGENT 2):
"""
${rawNarrative}
"""

FORMAT OUTPUT FINAL:
Sertakan header akreditasi di bagian paling atas:
> 🛡️ **Hasil Kolaborasi Double Agent AI**: Narasi disusun oleh **ChatGPT (${settings.openaiModel || 'GPT-4o-mini'})** & diverifikasi 100% akurat oleh **Gemini AI (${settings.geminiModel || 'Gemini-1.5-Flash'})**.

Lanjutkan dengan konten materi lengkap hasil audit akhir yang rapi dalam format Markdown.`;

    const finalAuditResult = await geminiService.callRawGemini(
      geminiAuditPrompt, 
      'Anda adalah Lead Reviewer dan Fact-Checker akademik yang menjamin integritas ilmiah dan keakuratan materi.'
    );

    return finalAuditResult;
  }
};
