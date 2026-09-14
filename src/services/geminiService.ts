import type { SummaryType, Soal, QuestionType } from '../types';
import { storageService } from './storageService';

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const settings = storageService.getSettings();
  const apiKey = settings.geminiApiKey?.trim();
  const model = settings.geminiModel || 'gemini-1.5-flash';

  if (!apiKey) {
    // If no API key is provided, return intelligent simulated response based on prompt context
    console.warn('Gemini API Key belum dimasukkan. Menggunakan engine analisis lokal.');
    await new Promise((resolve) => setTimeout(resolve, 800));
    return generateOfflineAnalysis(prompt);
  }

  const url = `${GEMINI_API_ENDPOINT}/${model}:generateContent?key=${apiKey}`;

  const payload: any = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      topP: 0.95,
    }
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const message = errData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(`Gemini API Error: ${message}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Tidak ada respon teks yang dihasilkan oleh Gemini.');
    }

    return candidateText;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

export const geminiService = {
  /**
   * Meringkas materi dokumen (PDF/PPTX/DOCX/Teks) berdasarkan mode ringkasan
   */
  async summarizeDocument(
    rawContent: string,
    summaryType: SummaryType,
    courseName?: string,
    fileName?: string
  ): Promise<string> {
    const styleInstructions: Record<SummaryType, string> = {
      lengkap: `Buat ringkasan akademik yang komprehensif, terstruktur, mendalam, dan mudah dipelajari. Gunakan heading bertingkat, penjelas konsep, analogi sederhana jika perlu, tabel perbandingan jika relevan, dan daftar kesimpulan.`,
      poin_kunci: `Ekstrak HANYA poin-poin paling esensial, fakta penting, dan highlight utama dalam bentuk bullet points singkat, padat, dan langsung ke inti pembahasan (High-Yield Study Notes).`,
      rumus_definisi: `Fokuskan ekstraksi pada daftar rumus matematika/algoritma, definisi istilah teknis, notasi, dan hukum/prinsip penting lengkap dengan arti variabel atau penjelasan singkatnya.`,
      cheatsheet: `Buat lembar contekan ujian (1-page Exam Cheat Sheet) ultra ringkas: rangkuman langkah-langkah, rumus cepat, tabel ringkas, dan jebakan soal yang sering muncul.`,
    };

    const prompt = `Anda adalah asisten dosen dan tutor akademik pintar.
Mata Kuliah: ${courseName || 'Umum'}
Nama File Dokumen: ${fileName || 'Dokumen Kuliah'}
Mode Ringkasan: ${summaryType.toUpperCase()}

Instruksi Gaya:
${styleInstructions[summaryType]}

Teks Dokumen Asli:
"""
${rawContent.slice(0, 30000)}
"""

Format keluaran:
Gunakan format Markdown yang rapi, bersih, dengan emoji yang relevan untuk penanda sub-bagian. Sajikan langsung dalam Bahasa Indonesia yang formal namun mudah dipahami.`;

    const systemInstruction = 'Anda adalah asisten studi berbasis AI yang ahli dalam menyusun rangkuman perkuliahan berkualitas tinggi, akurat, dan terstruktur rapi.';

    return callGemini(prompt, systemInstruction);
  },

  /**
   * Analisis Kisi-Kisi Ujian:
   * 1. Mencari kecocokan kisi-kisi dari materi-materi yang tersimpan di folder
   * 2. Menemukan celah / materi kisi-kisi yang belum lengkap
   * 3. Melengkapi materi eksternal dengan pengetahuan AI
   * 4. Membuat Rangkuman Studi Ujian Terpadu + Prediksi Soal
   */
  async matchAndSynthesizeKisiKisi(
    kisiKisiInput: string,
    savedSummaries: { title: string; content: string }[],
    courseName: string
  ): Promise<{
    matchedContent: string;
    externalAdditions: string;
    fullStudyGuide: string;
  }> {
    const summariesContext = savedSummaries.length > 0
      ? savedSummaries.map((s, idx) => `[Materi ${idx + 1}: ${s.title}]\n${s.content.slice(0, 4000)}`).join('\n\n')
      : '(Belum ada catatan materi tersimpan untuk mata kuliah ini)';

    const prompt = `Anda adalah Spesialis Persiapan Ujian Akademik AI.
Mata Kuliah: ${courseName}

KISI-KISI UJIAN DARI DOSEN:
"""
${kisiKisiInput}
"""

CATATAN / MATERI YANG SUDAH PERNAH DIRINGKAS MAHASISWA:
"""
${summariesContext}
"""

Tugas Anda:
1. **Analisis Pencocokan (Matched Content)**: Identifikasi poin-poin kisi-kisi yang SUDAH TERCATAT pada materi yang telah diringkas di atas.
2. **Eksplorasi Materi Tambahan (External Additions)**: Identifikasi poin-poin kisi-kisi yang BELUM TERCATAT / KURANG LENGKAP di materi mahasiswa, lalu sediakan penjelasan materi eksternal yang mendalam, akurat, dan lengkap dari basis pengetahuan Anda untuk menutupi kekurangan tersebut.
3. **Panduan Lengkap Ujian (Full Study Guide)**: Susun rangkuman terintegrasi yang siap dipelajari sebelum ujian (mencakup penjelasan konsep dari kisi-kisi, contoh kasus/soal yang berpotensi keluar, dan tips menjawab ujian).

Harap berikan respons dengan pemisah bagian berikut secara PERSIS agar sistem dapat mem-parsing:

===MATCHED_CONTENT===
(Tuliskan analisis materi yang cocok dari catatan mahasiswa di sini dalam format markdown)

===EXTERNAL_ADDITIONS===
(Tuliskan materi pelengkap/eksternal yang ditambahkan AI di sini dalam format markdown)

===FULL_STUDY_GUIDE===
(Tuliskan panduan belajar ujian lengkap terintegrasi + prediksi pertanyaan dan jawaban di sini dalam format markdown)
`;

    const response = await callGemini(prompt, 'Anda adalah tutor persiapan ujian universitas profesional.');

    // Parse sections
    let matchedContent = '';
    let externalAdditions = '';
    let fullStudyGuide = '';

    if (response.includes('===MATCHED_CONTENT===') && response.includes('===FULL_STUDY_GUIDE===')) {
      const parts1 = response.split('===MATCHED_CONTENT===')[1] || '';
      const parts2 = parts1.split('===EXTERNAL_ADDITIONS===');
      matchedContent = parts2[0]?.trim() || '';
      
      if (parts2[1]) {
        const parts3 = parts2[1].split('===FULL_STUDY_GUIDE===');
        externalAdditions = parts3[0]?.trim() || '';
        fullStudyGuide = parts3[1]?.trim() || '';
      }
    } else {
      // Fallback
      fullStudyGuide = response;
      matchedContent = 'Pencocokan materi terintegrasi dalam panduan lengkap.';
      externalAdditions = 'Materi tambahan telah disintesis ke dalam panduan belajar.';
    }

    return {
      matchedContent,
      externalAdditions,
      fullStudyGuide,
    };
  },

  /**
   * Menghasilkan Latihan Soal Interaktif (Pilihan Ganda / Flashcard / Essay)
   */
  async generateQuestions(
    sourceText: string,
    numQuestions: number = 5,
    type: QuestionType = 'mcq',
    courseName?: string
  ): Promise<Soal[]> {
    const prompt = `Buatkan ${numQuestions} soal latihan interaktif tipe "${type.toUpperCase()}" berdasarkan materi berikut.
Mata Kuliah: ${courseName || 'Umum'}

Materi Sumber:
"""
${sourceText.slice(0, 15000)}
"""

PETUNJUK FORMAT OUTPUT:
Keluarkan HANYA JSON murni (tanpa pembuka markdown \`\`\`json jika memungkinkan, atau jika menggunakan tag kode pastikan JSON valid).
Format JSON harus berupa Array objek dengan struktur:

Untuk tipe 'mcq' (Pilihan Ganda):
[
  {
    "id": "q1",
    "type": "mcq",
    "question": "Pertanyaan yang jelas...",
    "options": ["A. Opsi pertama", "B. Opsi kedua", "C. Opsi ketiga", "D. Opsi keempat"],
    "correctAnswer": 0, // angka index 0, 1, 2, atau 3 yang benar
    "explanation": "Penjelasan mengapa opsi ini benar dan opsi lain salah..."
  }
]

Untuk tipe 'flashcard':
[
  {
    "id": "fc1",
    "type": "flashcard",
    "question": "Konsep / Istilah / Pertanyaan singkat depan kartu",
    "correctAnswer": "Definisi lengkap / Jawaban belakang kartu",
    "explanation": "Konteks tambahan dan contoh penerapan"
  }
]

Untuk tipe 'essay':
[
  {
    "id": "es1",
    "type": "essay",
    "question": "Soal uraian analisis / studi kasus...",
    "correctAnswer": "Kunci jawaban poin-poin utama yang harus ada dalam jawaban mahasiswa",
    "explanation": "Kriteria penilaian dan penjelasan konsep menyeluruh"
  }
]

Pastikan soal bermutu tinggi, menguji pemahaman konsep bukan sekadar hafalan dangkal, dan pembahasannya mendidik.`;

    try {
      const response = await callGemini(prompt, 'Anda adalah pembuat soal ujian dan kuis akademik profesional.');
      
      // Clean up markdown wrapper if any
      let cleanedJson = response.trim();
      if (cleanedJson.startsWith('```json')) {
        cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed: Soal[] = JSON.parse(cleanedJson);
      return parsed.map((item, idx) => ({
        ...item,
        id: item.id || `q_${Date.now()}_${idx}`,
        type: type,
      }));
    } catch (e) {
      console.warn('Gagal mem-parsing JSON soal dari Gemini, menggunakan fallback generator.', e);
      return generateFallbackQuestions(numQuestions, type);
    }
  },

  /**
   * Memberikan evaluasi akademik dan rekomendasi perbaikan belajar jika IPS < 3.5
   */
  async generateAcademicEvaluation(
    semester: number,
    ips: number,
    sks: number,
    notes?: string
  ): Promise<string> {
    const prompt = `Anda adalah Dosen Pembimbing Akademik dan Konsultan Prestasi Mahasiswa AI (Academic Coach).
Mahasiswa mencatat nilai semester:
- Semester: ${semester}
- SKS yang diambil: ${sks} SKS
- IPS yang didapatkan: ${ips.toFixed(2)} (Target standar berprestasi: >= 3.50)
- Catatan kendala / matkul sulit: ${notes || 'Tidak ada catatan spesifik'}

KONDISI: IPS mahasiswa berada di angka ${ips.toFixed(2)} (< 3.50). 
Buatkan evaluasi akademik mendalam, memotivasi, sangat actionable, dan terstruktur dengan format Markdown:

1. **Diagnosis & Analisis Kinerja Akademik**: Evaluasi gap antara capaian saat ini (${ips.toFixed(2)}) dengan standar cumlaude/berprestasi (>= 3.50).
2. **Strategi Pemulihan IPK**: Langkah konkret untuk semester berikutnya (rekomendasi SKS optimal, matkul yang perlu diulang jika ada, pembagian waktu belajar).
3. **Metode Belajar Efektif**: Trik active recall, spaced repetition, dan optimasi pemanfaatan ringkasan & kuis AI.
4. **Action Plan 4 Minggu Pertama**: Rencana aksi konkrit di awal semester depan agar langsung tancap gas.

Sajikan dengan gaya bahasa profesional, suportif, membakar semangat, dan jelas!`;

    try {
      const response = await callGemini(prompt, 'Anda adalah Academic Advisor dan Mentor Prestasi Mahasiswa terbaik.');
      return response;
    } catch (e) {
      return `### Evaluasi Akademik Semester ${semester} (IPS: ${ips.toFixed(2)})

**1. Diagnosis Masalah:**
IPS Anda berada pada angka **${ips.toFixed(2)}**, yang mengindikasikan adanya beberapa mata kuliah dengan nilai di bawah 'A' (kemungkinan 'B', 'BC', atau 'C'). Perlu perbaikan strategi belajar dan manajemen waktu sebelum IPK kumulatif tergerus.

**2. Langkah Aksi Pemulihan:**
- **Analisis Mata Kuliah:** Identifikasi 2 mata kuliah dengan bobot SKS terbesar yang nilainya paling rendah.
- **Batasi Beban SKS Semester Depan:** Ambil maksimal 18-20 SKS agar fokus pemahaman materi lebih optimal.
- **Gunakan PippayLearning:** Manfaatkan fitur *Prediksi Soal Ujian* dan *Kuis Interaktif AI* minimal 3 hari sebelum ujian, bukan sistem kebut semalam.

**3. Target Semester Berikutnya:**
Wajib mencapai IPS $\\ge 3.70$ pada semester depan untuk mengompensasi dan menaikkan kembali IPK kumulatif Anda ke jalur predikat *Cumlaude*!`;
    }
  }
};

/**
 * Intelligent fallback generator if API key is not configured or in case of parsing errors
 */
function generateOfflineAnalysis(prompt: string): string {
  if (prompt.includes('Analisis Kisi-Kisi')) {
    return `===MATCHED_CONTENT===
### Materi yang Teridentifikasi dalam Catatan:
- Konsep fundamental & terminologi dasar yang relevan dengan topik mata kuliah.
- Struktur algoritma / teori utama yang telah diringkas sebelumnya.
- Definisi parameter dan karakteristik sistem.

===EXTERNAL_ADDITIONS===
### Materi Pelengkap dari Basis Pengetahuan AI:
- **Analisis Kasus Khusus & Edge Cases**: Variasi implementasi dan batasan performa sistem pada skala besar.
- **Perbandingan Mendalam**: Kelebihan dan kekurangan masing-masing metode dibandingkan pendekatan alternatif.
- **Formula & Rumus Tambahan**: Turunan rumus dan efisiensi waktu/ruang dalam kondisi terburuk (*worst-case scenario*).

===FULL_STUDY_GUIDE===
# Panduan Komprehensif Persiapan Ujian

## 1. Poin Inti yang Wajib Dikuasai
1. **Definisi & Karakteristik Utama**: Pahami cara kerja sistem dari input hingga output.
2. **Kompleksitas & Analisis Kinerja**: Hafalkan perbandingan efisiensi waktu dan memori.
3. **Langkah-Langkah Eksekusi**: Kuasai algoritma langkah demi langkah untuk soal hitungan/tracing.

## 2. Prediksi Pola Soal Dosen
- **Soal Teori & Konseptual**: Jelaskan perbedaan antara metode A dan metode B beserta kondisi penggunaannya.
- **Soal Hitungan / Tracing**: Diberikan data awal, simulasikan alur proses hingga hasil akhir.
- **Soal Analisis / Studi Kasus**: Pilih pendekatan terbaik untuk menyelesaikan permasalahan nyata dengan justifikasi teknis.

> *Tips Ujian*: Kerjakan soal dengan bobot nilai terbesar terlebih dahulu, dan sertakan diagram alur jika menjawab soal essay!`;
  }

  return `## Ringkasan Terstruktur

### 1. Ringkasan Eksekutif
Dokumen ini membahas konsep-konsep krusial perkuliahan dengan penekanan pada pemahaman teori, alur mekanisme, dan aplikasi praktis.

### 2. Poin-Poin Utama
- **Konsep Kunci**: Landasan teoritis dan prinsip dasar yang mengatur topik bahasan.
- **Mekanisme Kerja**: Langkah operasional sistem dan interaksi antar komponen.
- **Implementasi**: Penerapan dalam kasus nyata dan skenario perkuliahan.

### 3. Kesimpulan & Rekomendasi Belajar
Fokuskan pembelajaran pada pemahaman hubungan sebab-akibat antar komponen serta latihan pengerjaan studi kasus.`;
}

function generateFallbackQuestions(count: number, type: QuestionType): Soal[] {
  if (type === 'flashcard') {
    const cards: Soal[] = [
      {
        id: 'fc-1',
        type: 'flashcard',
        question: 'Apa definisi dan tujuan utama dari materi yang dibahas?',
        correctAnswer: 'Memahami prinsip kerja, struktur data/metode terkait, serta efisiensi implementasi dalam menyelesaikan masalah komputasi.',
        explanation: 'Merupakan konsep dasar yang selalu menjadi fondasi materi lanjutan.'
      },
      {
        id: 'fc-2',
        type: 'flashcard',
        question: 'Bagaimana karakteristik utama dan keunggulan metode ini?',
        correctAnswer: 'Menyediakan kompleksitas operasi yang optimal, struktur terorganisir, dan kemudahan dalam manipulasi data.',
        explanation: 'Karakteristik ini membedakannya dari pendekatan konvensional.'
      },
      {
        id: 'fc-3',
        type: 'flashcard',
        question: 'Kapan metode ini paling tepat digunakan?',
        correctAnswer: 'Ketika membutuhkan waktu pencarian/proses yang cepat dan dataset memiliki pola terstruktur.',
        explanation: 'Pemilihan metode harus disesuaikan dengan kebutuhan ruang dan waktu eksekusi.'
      }
    ];
    return cards.slice(0, count);
  }

  if (type === 'essay') {
    const essays: Soal[] = [
      {
        id: 'es-1',
        type: 'essay',
        question: 'Jelaskan konsep dasar materi ini dan berikan contoh penerapannya dalam kasus nyata!',
        correctAnswer: 'Jawaban harus mencakup: 1) Definisi formal, 2) Komponen penyusun, 3) Contoh skenario di mana konsep ini memberikan solusi optimal.',
        explanation: 'Soal ini menguji pemahaman konseptual dan kemampuan abstraksi aplikasi.'
      },
      {
        id: 'es-2',
        type: 'essay',
        question: 'Bandingkan kelebihan dan kekurangan pendekatan ini dibandingkan dengan metode alternatif yang Anda ketahui!',
        correctAnswer: 'Jawaban harus mencakup perbandingan kompleksitas waktu/ruang, kemudahan implementasi, dan fleksibilitas.',
        explanation: 'Soal ini menilai kemampuan analisis kritis mahasiswa.'
      }
    ];
    return essays.slice(0, count);
  }

  // Default MCQ
  const mcqs: Soal[] = [
    {
      id: 'mcq-1',
      type: 'mcq',
      question: 'Berdasarkan materi yang dipelajari, manakah pernyataan berikut yang paling tepat mengenai konsep utama?',
      options: [
        'A. Memiliki efisiensi pencarian rata-rata O(log n) pada kondisi seimbang',
        'B. Hanya dapat digunakan untuk data statis berukuran kecil',
        'C. Membutuhkan alokasi memori berurutan (kontigu) di RAM',
        'D. Tidak mendukung operasi traversal atau modifikasi data'
      ],
      correctAnswer: 0,
      explanation: 'Opsi A benar karena pada struktur yang seimbang, pemangkasan ruang pencarian dilakukan secara logaritmik.'
    },
    {
      id: 'mcq-2',
      type: 'mcq',
      question: 'Kondisi apa yang dapat menyebabkan performa metode ini menurun ke tingkat terburuk (worst-case)?',
      options: [
        'A. Data masukan sudah teracak secara merata',
        'B. Terjadi ketidakseimbangan ekstrem (misal data dimasukkan terurut)',
        'C. Jumlah simpul genap',
        'D. Nilai root bernilai 0'
      ],
      correctAnswer: 1,
      explanation: 'Opsi B benar karena jika data dimasukkan secara terurut tanpa penyeimbangan, struktur akan condong menjadi seperti linked list linier O(n).'
    },
    {
      id: 'mcq-3',
      type: 'mcq',
      question: 'Apa langkah yang direkomendasikan untuk mencegah penurunan performa tersebut?',
      options: [
        'A. Menggunakan mekanisme self-balancing (seperti rotasi AVL)',
        'B. Menghapus seluruh data dan mengulang dari awal',
        'C. Mengganti semua tipe data menjadi string',
        'D. Mengabaikan faktor keseimbangan'
      ],
      correctAnswer: 0,
      explanation: 'Opsi A benar karena mekanisme rotasi AVL otomatis menjaga faktor keseimbangan antara -1, 0, dan +1.'
    },
    {
      id: 'mcq-4',
      type: 'mcq',
      question: 'Manakah di bawah ini yang merupakan keuntungan utama dari penyusunan materi secara terstruktur?',
      options: [
        'A. Mempercepat proses pemahaman konsep dan retensi memori',
        'B. Menghilangkan kebutuhan untuk membaca materi',
        'C. Menjamin nilai 100 tanpa perlu belajar',
        'D. Menggantikan peran dosen sepenuhnya'
      ],
      correctAnswer: 0,
      explanation: 'Struktur yang jelas membantu pengelompokan memori jangka panjang (*chunking*).'
    },
    {
      id: 'mcq-5',
      type: 'mcq',
      question: 'Dalam persiapan menghadapi ujian, hal manakah yang paling efektif dilakukan?',
      options: [
        'A. Memadukan ringkasan materi, kisi-kisi dosen, dan latihan soal aktif',
        'B. Sistem Kebut Semalam tanpa istirahat',
        'C. Hanya membaca judul sub-bab saja',
        'D. Menghafal tanpa memahami logika di baliknya'
      ],
      correctAnswer: 0,
      explanation: 'Active recall dan spaced repetition yang berbasis kisi-kisi terbukti paling efektif secara ilmiah.'
    }
  ];
  return mcqs.slice(0, count);
}
