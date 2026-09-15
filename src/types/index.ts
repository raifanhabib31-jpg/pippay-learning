export interface Folder {
  id: string;
  name: string; // contoh: "Struktur Data & Algoritma"
  code?: string; // contoh: "IF2110"
  color: string; // solid color e.g. "indigo", "emerald", "amber", "rose", "teal", "slate"
  icon?: string;
  description?: string;
  createdAt: string;
}

export type SummaryType = 'lengkap' | 'poin_kunci' | 'rumus_definisi' | 'cheatsheet';

export interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string;
  summary?: string;
  keyPoints?: string[];
  durationMinutes?: number;
  isCompleted?: boolean;
}

export interface Materi {
  id: string;
  folderId: string;
  title: string;
  description?: string;
  fileType: 'pdf' | 'pptx' | 'docx' | 'txt' | 'text';
  originalFileName?: string;
  fileSize?: string;
  rawContent: string;
  summary: string;
  summaryType: SummaryType;
  chapters?: Chapter[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface KisiKisiItem {
  id: string;
  folderId: string;
  title: string;
  rawInput: string; // input kisi-kisi dari dosen
  matchedContent: string; // materi yang cocok dari materi yang tersimpan
  externalAdditions: string; // materi tambahan dari AI untuk melengkapi yang kurang
  fullStudyGuide: string; // gabungan komprehensif siap dipelajari
  potentialQuestions?: {
    question: string;
    answerHint: string;
  }[];
  createdAt: string;
}

export type QuestionType = 'mcq' | 'essay' | 'flashcard';

export interface Soal {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // untuk mcq (biasanya 4 opsi: A, B, C, D)
  correctAnswer: string | number; // index (0..3) atau text jawaban
  explanation: string; // pembahasan komprehensif dari AI
}

export interface QuizResult {
  id: string;
  title: string;
  folderId?: string;
  totalQuestions: number;
  correctCount: number;
  score: number;
  userAnswers: Record<string, string | number>;
  questions: Soal[];
  completedAt: string;
}

export type JadwalType = 'kuliah' | 'tugas' | 'ujian' | 'belajar' | 'organisasi' | 'lomba' | 'kegiatan';

export interface JadwalReschedule {
  originalDate: string;
  newDate: string;
  newTime: string;
  reason?: string;
}

export interface Jadwal {
  id: string;
  title: string;
  courseName: string; // Nama Mata Kuliah / Organisasi / Nama Lomba
  folderId?: string;
  type: JadwalType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  locationOrLink?: string;
  notes?: string;
  reminderSent: boolean;
  reminderSentH1?: boolean; // Penanda pengingat H-1 sudah terkirim otomatis
  userEmail?: string;
  isRecurring?: boolean; // Rutin berulang tiap minggu ke depan
  dayOfWeek?: string; // Hari rutin misal "Senin", "Selasa", dst
  rescheduledForWeek?: JadwalReschedule; // Ganti jadwal khusus minggu ini
}

// Academic Tracker Types (Semester 1 to 10)
export interface SemesterRecord {
  semester: number; // 1 - 10
  sks: number;
  ips: number; // 0.00 - 4.00
  status: 'completed' | 'active' | 'planned';
  aiEvaluation?: string; // Evaluasi AI jika IPS < 3.5
  notes?: string;
}

export type GradeCategory = 'tugas' | 'kuis' | 'praktikum' | 'proyek' | 'uts' | 'uas';

export interface DailyGradeItem {
  id: string;
  courseName: string;
  category: GradeCategory;
  title: string;
  score: number; // 0 - 100
  maxScore: number; // default 100
  weight: number; // Bobot % (misal 15)
  date: string;
  notes?: string;
}

export interface AppSettings {
  geminiApiKey: string;
  geminiModel: string;
  userName: string;
  userTitle?: string; // contoh: "Mahasiswa Berprestasi"
  userUniversity?: string; // contoh: "Universitas Indonesia"
  userBio?: string;
  userEmail: string;
  autoH1Reminder?: boolean; // Otomatis kirim email H-1 sebelum agenda
  emailProvider?: 'resend' | 'emailjs' | 'simulation';
  resendApiKey?: string;
  resendSenderEmail?: string;
  emailJsServiceId?: string;
  emailJsTemplateId?: string;
  emailJsPublicKey?: string;
}

export type TabType = 'dashboard' | 'materi' | 'ujian' | 'latihan' | 'jadwal' | 'pengaturan';
