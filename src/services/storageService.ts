import type { 
  Folder, 
  Materi, 
  KisiKisiItem, 
  QuizResult, 
  Jadwal, 
  AppSettings, 
  SemesterRecord, 
  DailyGradeItem 
} from '../types';

const STORAGE_KEYS = {
  FOLDERS: 'pippay_folders',
  MATERI: 'pippay_materi',
  KISIKISI: 'pippay_kisikisi',
  QUIZ_RESULTS: 'pippay_quiz_results',
  JADWAL: 'pippay_jadwal',
  SETTINGS: 'pippay_settings',
  SEMESTERS: 'pippay_semesters_1_10',
  DAILY_GRADES: 'pippay_daily_grades',
};

const DEFAULT_FOLDERS: Folder[] = [
  {
    id: 'f-1',
    name: 'Struktur Data & Algoritma',
    code: 'IF2110',
    color: 'indigo',
    icon: 'Layers',
    description: 'Pohon Biner, Graf, Kompleksitas Waktu, Sorting, Dynamic Programming',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'f-2',
    name: 'Kecerdasan Buatan & ML',
    code: 'IF3140',
    color: 'emerald',
    icon: 'Brain',
    description: 'Neural Networks, Regresi, Decision Trees, Prompt Engineering',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'f-3',
    name: 'Basis Data & SQL',
    code: 'IF2220',
    color: 'amber',
    icon: 'Database',
    description: 'Normalisasi, Indexing B-Tree, ACID Transaksi, Query Optimization',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

const DEFAULT_MATERI: Materi[] = [
  {
    id: 'm-1',
    folderId: 'f-1',
    title: 'Konsep Dasar Binary Search Tree (BST) & AVL',
    fileType: 'pdf',
    originalFileName: 'Materi_BST_AVL_Pertemuan_4.pdf',
    fileSize: '1.4 MB',
    rawContent: `Binary Search Tree (BST) adalah struktur data pohon biner di mana setiap simpul memiliki nilai kunci. Nilai kunci simpul kiri selalu lebih kecil dari simpul induk, dan nilai kunci simpul kanan selalu lebih besar. Kompleksitas pencarian rata-rata adalah O(log n), namun kasus terburuk (skewed tree) bisa mencapai O(n). Untuk mengatasi ini, digunakan AVL Tree (Self-Balancing Binary Search Tree) dengan faktor keseimbangan (Balance Factor) yang berada pada rentang {-1, 0, 1}. Rotasi yang digunakan adalah Single Rotation (Left-Left, Right-Right) dan Double Rotation (Left-Right, Right-Left).`,
    summary: `## Rangkuman Eksekutif: Binary Search Tree (BST) & AVL Tree

### 1. Definisi Binary Search Tree (BST)
- **Struktur**: Pohon biner terurut di mana untuk setiap simpul $N$:
  - Semua simpul di *subtree* kiri memiliki nilai $< N$.
  - Semua simpul di *subtree* kanan memiliki nilai $> N$.
- **Kompleksitas Waktu**:
  - *Best & Average Case*: $\\mathcal{O}(\\log n)$ untuk operasi Search, Insert, dan Delete.
  - *Worst Case*: $\\mathcal{O}(n)$ jika pohon condong (degenerate/skewed seperti linked list).

---

### 2. AVL Tree (Pohon Seimbang Otomatis)
AVL Tree dinamai dari penemunya (Adelson-Velsky & Landis). Tujuannya memastikan tinggi pohon tetap $\\mathcal{O}(\\log n)$.

- **Balance Factor (BF)**:
  $$\\text{BF}(N) = \\text{Tinggi}(Subtree Kiri) - \\text{Tinggi}(Subtree Kanan)$$
  Simpul dikatakan seimbang jika $\\text{BF} \\in \\{-1, 0, +1\\}$.

### 3. Tipe Rotasi AVL
1. **Left-Left (LL)** $\\rightarrow$ Lakukan **Right Rotation**.
2. **Right-Right (RR)** $\\rightarrow$ Lakukan **Left Rotation**.
3. **Left-Right (LR)** $\\rightarrow$ Lakukan Left Rotation pada anak kiri, lalu Right Rotation pada simpul induk.
4. **Right-Left (RL)** $\\rightarrow$ Lakukan Right Rotation pada anak kanan, lalu Left Rotation pada simpul induk.

---
### Poin Kunci Ujian:
- Selalu periksa nilai Balance Factor dari daun ke akar setelah proses *insert* atau *delete*.
- In-order traversal pada BST selalu menghasilkan urutan data terurut secara menaik (*ascending*).`,
    summaryType: 'lengkap',
    tags: ['BST', 'AVL Tree', 'Sorting', 'Algoritma'],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  }
];

const DEFAULT_JADWAL: Jadwal[] = [
  {
    id: 'j-1',
    title: 'Ujian Tengah Semester (UTS)',
    courseName: 'Struktur Data & Algoritma',
    folderId: 'f-1',
    type: 'ujian',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '08:30',
    locationOrLink: 'Ruang Lab Komputer 301',
    notes: 'Bawa kartu ujian. Materi fokus ke AVL Tree, Red-Black, dan Graf.',
    reminderSent: false,
  },
  {
    id: 'j-lomba-1',
    title: 'Deadline Submission Proposal Gemastik / Hackathon AI',
    courseName: 'Kompetisi Nasional Gemastik',
    type: 'lomba',
    date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    time: '23:59',
    locationOrLink: 'https://gemastik.kemdikbud.go.id',
    notes: 'Kirim final proposal ide AI, wireframe UI, dan video pitch 3 menit.',
    reminderSent: false,
  },
  {
    id: 'j-org-1',
    title: 'Rapat Pleno Proker & Koordinasi Divisi Riset',
    courseName: 'Himpunan Mahasiswa / BEM',
    type: 'organisasi',
    date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    time: '19:00',
    locationOrLink: 'Sekretariat Himpunan / Zoom',
    notes: 'Presentasi timeline acara dan persiapan sponsorship.',
    reminderSent: false,
  }
];

// Default Semester Data from Semester 1 to Semester 10
const DEFAULT_SEMESTERS: SemesterRecord[] = [
  { semester: 1, sks: 20, ips: 3.85, status: 'completed', notes: 'Kalkulus 1, Dasar Pemrograman, Matdis' },
  { semester: 2, sks: 21, ips: 3.78, status: 'completed', notes: 'Aljabar Linier, Algoritma Pemrograman, Arsitektur Komputer' },
  { semester: 3, sks: 20, ips: 3.42, status: 'completed', notes: 'Struktur Data, Sistem Operasi, Probabilitas', aiEvaluation: '**Evaluasi AI:** Pada semester 3, IPS Anda berada di angka **3.42** (< 3.50). Mata kuliah Struktur Data & Sistem Operasi memiliki tingkat kesulitan tinggi. Rekomendasi: Pertajam latihan coding soal algoritmik dan gunakan simulasi kuis PippayLearning untuk menaikkan kembali IPS di semester berikutnya.' },
  { semester: 4, sks: 22, ips: 3.90, status: 'active', notes: 'Basis Data, Kecerdasan Buatan, Jaringan Komputer' },
  { semester: 5, sks: 20, ips: 0.00, status: 'planned', notes: 'Machine Learning, Rekayasa Perangkat Lunak, Kriptografi' },
  { semester: 6, sks: 20, ips: 0.00, status: 'planned', notes: 'Magang Industri / Proyek Riset AI' },
  { semester: 7, sks: 18, ips: 0.00, status: 'planned', notes: 'Metodologi Penelitian, Tugas Akhir 1' },
  { semester: 8, sks: 6, ips: 0.00, status: 'planned', notes: 'Sidang Skripsi & Wisuda' },
  { semester: 9, sks: 0, ips: 0.00, status: 'planned', notes: 'Semester Tambahan (Opsional)' },
  { semester: 10, sks: 0, ips: 0.00, status: 'planned', notes: 'Semester Tambahan (Opsional)' },
];

const DEFAULT_DAILY_GRADES: DailyGradeItem[] = [
  {
    id: 'dg-1',
    courseName: 'Basis Data & SQL',
    category: 'tugas',
    title: 'Tugas 1: ERD & Relational Schema Mapping',
    score: 95,
    maxScore: 100,
    weight: 10,
    date: new Date(Date.now() - 86400000 * 6).toISOString().split('T')[0],
    notes: 'Desain normalisasi 3NF sempurna.'
  },
  {
    id: 'dg-2',
    courseName: 'Basis Data & SQL',
    category: 'kuis',
    title: 'Kuis 1: SQL Joins, Subqueries & Group By',
    score: 90,
    maxScore: 100,
    weight: 15,
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    notes: 'Kuasai subquery correlated.'
  },
  {
    id: 'dg-3',
    courseName: 'Struktur Data & Algoritma',
    category: 'praktikum',
    title: 'Praktikum 3: Binary Search Tree Insertion & Rotation',
    score: 88,
    maxScore: 100,
    weight: 20,
    date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
    notes: 'Waktu eksekusi lolos test case.'
  },
  {
    id: 'dg-4',
    courseName: 'Kecerdasan Buatan & ML',
    category: 'tugas',
    title: 'Tugas Proyek: Fine-tuning Gemini Prompt & Classifier',
    score: 98,
    maxScore: 100,
    weight: 25,
    date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
    notes: 'Akurasi model 96.4%.'
  }
];

const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  geminiModel: 'gemini-1.5-flash',
  userName: 'Alex Pratama',
  userTitle: 'Mahasiswa Berprestasi',
  userUniversity: 'Fakultas Ilmu Komputer',
  userBio: 'Target IPK 3.85+, aktif riset AI & juara kompetisi nasional.',
  userEmail: '',
  emailJsServiceId: '',
  emailJsTemplateId: '',
  emailJsPublicKey: '',
};

export const storageService = {
  getFolders(): Folder[] {
    const data = localStorage.getItem(STORAGE_KEYS.FOLDERS);
    if (!data) {
      this.saveFolders(DEFAULT_FOLDERS);
      return DEFAULT_FOLDERS;
    }
    return JSON.parse(data);
  },

  saveFolders(folders: Folder[]) {
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  },

  getMateri(): Materi[] {
    const data = localStorage.getItem(STORAGE_KEYS.MATERI);
    if (!data) {
      this.saveMateri(DEFAULT_MATERI);
      return DEFAULT_MATERI;
    }
    return JSON.parse(data);
  },

  saveMateri(materi: Materi[]) {
    localStorage.setItem(STORAGE_KEYS.MATERI, JSON.stringify(materi));
  },

  getKisiKisi(): KisiKisiItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.KISIKISI);
    return data ? JSON.parse(data) : [];
  },

  saveKisiKisi(items: KisiKisiItem[]) {
    localStorage.setItem(STORAGE_KEYS.KISIKISI, JSON.stringify(items));
  },

  getQuizResults(): QuizResult[] {
    const data = localStorage.getItem(STORAGE_KEYS.QUIZ_RESULTS);
    return data ? JSON.parse(data) : [];
  },

  saveQuizResults(results: QuizResult[]) {
    localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(results));
  },

  getJadwal(): Jadwal[] {
    const data = localStorage.getItem(STORAGE_KEYS.JADWAL);
    if (!data) {
      this.saveJadwal(DEFAULT_JADWAL);
      return DEFAULT_JADWAL;
    }
    return JSON.parse(data);
  },

  saveJadwal(jadwal: Jadwal[]) {
    localStorage.setItem(STORAGE_KEYS.JADWAL, JSON.stringify(jadwal));
  },

  getSemesters(): SemesterRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.SEMESTERS);
    if (!data) {
      this.saveSemesters(DEFAULT_SEMESTERS);
      return DEFAULT_SEMESTERS;
    }
    return JSON.parse(data);
  },

  saveSemesters(semesters: SemesterRecord[]) {
    localStorage.setItem(STORAGE_KEYS.SEMESTERS, JSON.stringify(semesters));
  },

  getDailyGrades(): DailyGradeItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_GRADES);
    if (!data) {
      this.saveDailyGrades(DEFAULT_DAILY_GRADES);
      return DEFAULT_DAILY_GRADES;
    }
    return JSON.parse(data);
  },

  saveDailyGrades(grades: DailyGradeItem[]) {
    localStorage.setItem(STORAGE_KEYS.DAILY_GRADES, JSON.stringify(grades));
  },

  getSettings(): AppSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      this.saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  },

  saveSettings(settings: AppSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  exportAllData(): string {
    const backup = {
      folders: this.getFolders(),
      materi: this.getMateri(),
      kisiKisi: this.getKisiKisi(),
      quizResults: this.getQuizResults(),
      jadwal: this.getJadwal(),
      semesters: this.getSemesters(),
      dailyGrades: this.getDailyGrades(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importAllData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.folders) this.saveFolders(data.folders);
      if (data.materi) this.saveMateri(data.materi);
      if (data.kisiKisi) this.saveKisiKisi(data.kisiKisi);
      if (data.quizResults) this.saveQuizResults(data.quizResults);
      if (data.jadwal) this.saveJadwal(data.jadwal);
      if (data.semesters) this.saveSemesters(data.semesters);
      if (data.dailyGrades) this.saveDailyGrades(data.dailyGrades);
      if (data.settings) this.saveSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Import data failed:', e);
      return false;
    }
  }
};
