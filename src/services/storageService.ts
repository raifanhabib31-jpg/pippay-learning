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

import { authService } from './authService';

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

function getUserKey(baseKey: string): string {
  const user = authService.getCurrentUser();
  if (!user || !user.id) return baseKey;
  return `${baseKey}_${user.id}`;
}

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
    description: 'Materi ini membahas pohon biner terurut (BST), analisis kompleksitas best/worst case, perhitungan Balance Factor, dan teknik rotasi pohon seimbang AVL.',
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
    chapters: [
      {
        id: 'c-101',
        number: 1,
        title: 'Pengenalan & Definisi Binary Search Tree (BST)',
        summary: 'Konsep dasar pohon biner terurut dan aturan penempatan nilai pada simpul kiri dan kanan.',
        content: `### 1. Definisi Binary Search Tree (BST)\n\nBinary Search Tree (BST) adalah struktur data pohon biner hierarkis di mana setiap simpul $N$ memenuhi properti keterurutan:\n- Seluruh kunci pada *subtree* sebelah kiri simpul $N$ memiliki nilai yang **lebih kecil** daripada kunci $N$.\n- Seluruh kunci pada *subtree* sebelah kanan simpul $N$ memiliki nilai yang **lebih besar** daripada kunci $N$.\n- Baik *subtree* kiri maupun *subtree* kanan masing-masing juga harus merupakan Binary Search Tree.\n\n#### Manfaat Utama:\nStruktur ini memungkinkan operasi pencarian biner (*binary search*) langsung pada struktur pohon dinamis.`,
        keyPoints: ['Aturan nilai: Kiri < Root < Kanan', 'Dinamis: Memudahkan penambahan dan penghapusan data', 'In-order traversal menghasilkan data terurut menaik'],
        durationMinutes: 4,
        isCompleted: true,
      },
      {
        id: 'c-102',
        number: 2,
        title: 'Analisis Kompleksitas & Kasus Terburuk (Skewed Tree)',
        summary: 'Perbandingan efisiensi waktu operasi Search, Insert, dan Delete pada kondisi normal vs degenerasi pohon.',
        content: `### 2. Kompleksitas Waktu Operasi BST\n\nEfisiensi BST sangat dipengaruhi oleh ketinggian pohon ($h$):\n\n- **Kondisi Seimbang (Average / Best Case)**:\n  Tinggi pohon $h = \\log_2 n$. Waktu operasi pencarian, penyisipan, dan penghapusan bernilai $\\mathcal{O}(\\log n)$.\n\n- **Kondisi Terburuk (Worst Case / Skewed Tree)**:\n  Jika data dimasukkan dalam keadaan terurut (misal 1, 2, 3, 4, 5), pohon akan condong ke satu sisi (*degenerate*) menjadi mirip linked list. Tinggi pohon menjadi $h = n$, sehingga kompleksitasnya anjlok ke $\\mathcal{O}(n)$.`,
        keyPoints: ['Average case: O(log n)', 'Worst case: O(n) saat data urut masuk', 'Solusi: Mekanisme self-balancing'],
        durationMinutes: 5,
        isCompleted: true,
      },
      {
        id: 'c-103',
        number: 3,
        title: 'AVL Tree & Perhitungan Balance Factor',
        summary: 'Pohon seimbang otomatis pertama di dunia dan rumus Balance Factor (BF).',
        content: `### 3. Konsep AVL Tree & Balance Factor (BF)\n\nAVL Tree (diciptakan oleh GM Adelson-Velsky dan EM Landis pada 1962) adalah BST yang menjaga dirinya agar selalu seimbang secara otomatis setelah setiap operasi insert atau delete.\n\n#### Rumus Balance Factor:\n$$\\text{BF}(N) = \\text{Tinggi}(T_{\\text{kiri}}) - \\text{Tinggi}(T_{\\text{kanan}})$$\n\n#### Syarat Keseimbangan AVL:\nSebuah simpul dikatakan seimbang jika dan hanya jika:\n$$\\text{BF}(N) \\in \\{-1, 0, +1\\}$$\nJika nilai $\\text{BF} \\ge +2$ atau $\\text{BF} \\le -2$, maka terjadi *imbalance* dan pohon wajib dirotasi.`,
        keyPoints: ['Balance factor = Tinggi Kiri - Tinggi Kanan', 'Nilai valid BF: -1, 0, +1', 'Menjamin tinggi pohon selalu O(log n)'],
        durationMinutes: 6,
        isCompleted: false,
      },
      {
        id: 'c-104',
        number: 4,
        title: 'Teknik Rotasi AVL (Single & Double Rotation)',
        summary: 'Empat kasus ketidakseimbangan: Left-Left (LL), Right-Right (RR), Left-Right (LR), dan Right-Left (RL).',
        content: `### 4. Empat Jenis Rotasi AVL\n\n1. **Kasus Left-Left (LL)**: Penyisipan di anak kiri dari subtree kiri $\\rightarrow$ Solusi: **Single Right Rotation**.\n2. **Kasus Right-Right (RR)**: Penyisipan di anak kanan dari subtree kanan $\\rightarrow$ Solusi: **Single Left Rotation**.\n3. **Kasus Left-Right (LR)**: Penyisipan di anak kanan dari subtree kiri $\\rightarrow$ Solusi: **Double Rotation** (Left Rotation pada anak kiri, lalu Right Rotation pada simpul induk).\n4. **Kasus Right-Left (RL)**: Penyisipan di anak kiri dari subtree kanan $\\rightarrow$ Solusi: **Double Rotation** (Right Rotation pada anak kanan, lalu Left Rotation pada simpul induk).`,
        keyPoints: ['LL -> Right Rotation', 'RR -> Left Rotation', 'LR & RL -> Double Rotation', 'Pengecekan dimulai dari simpul daun ke arah akar'],
        durationMinutes: 7,
        isCompleted: false,
      },
      {
        id: 'c-105',
        number: 5,
        title: 'Ringkasan & Prediksi Soal Ujian',
        summary: 'Pola soal dosen pada UTS/UAS dan trik menghitung rotasi dengan cepat.',
        content: `### 5. Strategi Menjawab Soal Ujian BST & AVL\n\n- **Soal Tracing Data**: Biasanya diberikan 6-10 angka acak, lalu Anda diminta menggambar pohon AVL langkah demi langkah setiap kali ada angka baru yang masuk.\n- **Jebakan Ujian**: Lupa menghitung ulang Balance Factor dari simpul terbawah setelah melakukan rotasi.\n- **Kunci Sukses**: Lakukan In-order Traversal di akhir gambar untuk memastikan pohon biner Anda tetap terurut dengan benar!`,
        keyPoints: ['Hafalkan 4 kondisi rotasi', 'Selalu periksa traversal in-order', 'Hitung BF dari simpul terendah ke atas'],
        durationMinutes: 5,
        isCompleted: false,
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'm-2',
    folderId: 'f-3',
    title: 'Desain Database',
    description: 'Materi ini membahas konsep-konsep dasar desain database termasuk tipe data, kunci primer, kunci asing, entitas, relasi, serta prinsip-prinsip desain database yang baik.',
    fileType: 'pdf',
    originalFileName: 'Slide_Desain_Database_Relasional.pdf',
    fileSize: '2.8 MB',
    rawContent: `Desain database adalah proses menghasilkan skema konseptual, logis, dan fisik untuk sistem basis data. Mencakup pemahaman tipe data, primary key, candidate key, foreign key, entitas kuat dan lemah, kardinalitas relasi (one-to-one, one-to-many, many-to-many), composite primary key, serta integritas referensial antar tabel.`,
    summary: `## Rangkuman Eksekutif: Desain Database Relasional

### 1. Fondasi Desain Database
Desain database bertujuan mengorganisir data secara terstruktur, meminimalkan redundansi (*data redundancy*), serta menjamin integritas dan konsistensi data (*ACID properties*).

### 2. Elemen Kunci Relasional
- **Entitas & Atribut**: Representasi objek dunia nyata beserta karakteristik data yang melekat.
- **Kunci Relasional**:
  - *Primary Key (PK)*: Pengidentifikasi unik setiap baris pada tabel.
  - *Foreign Key (FK)*: Penghubung integritas referensial ke tabel induk.
- **Kardinalitas Relasi**: $1:1$, $1:N$, dan $M:N$ (memerlukan tabel persimpangan / junction table).`,
    summaryType: 'lengkap',
    tags: ['Database', 'SQL', 'Primary Key', 'Foreign Key', 'Relasi'],
    chapters: [
      {
        id: 'c-201',
        number: 1,
        title: 'Pengenalan Desain Database',
        summary: 'Pengantar konsep dasar desain database, tujuan, dan tahapan perancangan dari konseptual ke fisik.',
        content: `### 1. Pengenalan Desain Database\n\nDesain database adalah proses terstruktur untuk merencanakan, mengembangkan, dan memelihara sistem basis data agar mampu mendukung kebutuhan operasional organisasi secara efisien.\n\n#### Tahapan Utama Perancangan:\n1. **Perancangan Konseptual**: Memetakan entitas dan hubungan dunia nyata menggunakan *Entity Relationship Diagram (ERD)*.\n2. **Perancangan Logis**: Menerjemahkan ERD menjadi skema relasional (tabel, kolom, tipe data, dan kunci).\n3. **Perancangan Fisik**: Menentukan optimasi penyimpanan fisik pada DBMS seperti indeks (*B-Tree index*), partisi, dan konfigurasi memori.`,
        keyPoints: ['Tujuan: Mengurangi redundansi & menjaga integritas data', '3 Level perancangan: Konseptual, Logis, Fisik', 'ERD sebagai blueprint utama'],
        durationMinutes: 4,
        isCompleted: true,
      },
      {
        id: 'c-202',
        number: 2,
        title: 'Tipe Data dalam Database',
        summary: 'Klasifikasi tipe data numerik, teks, tanggal, boolean, dan best practice alokasi ukuran byte.',
        content: `### 2. Pemilihan Tipe Data yang Tepat\n\nMemilih tipe data yang efisien sangat menentukan performa query dan kapasitas storage:\n\n- **Numerik**: \`INT\`, \`BIGINT\`, \`DECIMAL(p,s)\` (wajib untuk data uang agar tidak mengalami floating-point error).\n- **Karakter / Teks**: \`CHAR(n)\` (panjang tetap seperti kode pos), \`VARCHAR(n)\` (panjang dinamis), dan \`TEXT\` (deskripsi panjang).\n- **Waktu**: \`DATE\`, \`TIMESTAMP WITH TIME ZONE\` (standar industri untuk logging transaksi).\n- **Boolean & Biner**: \`BOOLEAN\`, \`BLOB\` / \`JSONB\` (untuk semi-structured data).`,
        keyPoints: ['Gunakan DECIMAL untuk keuangan', 'VARCHAR lebih hemat ruang dibanding CHAR', 'TIMESTAMP WITH TIME ZONE untuk audit trail'],
        durationMinutes: 5,
        isCompleted: false,
      },
      {
        id: 'c-203',
        number: 3,
        title: 'Primary Key dan Candidate Key',
        summary: 'Konsep keunikan baris, pembedaan Candidate Key, Alternate Key, dan Primary Key.',
        content: `### 3. Primary Key & Candidate Key\n\n- **Candidate Key**: Kumpulan satu atau lebih kolom yang dapat mengidentifikasi setiap baris tabel secara unik tanpa duplikasi.\n- **Primary Key (PK)**: Satu Candidate Key terpilih yang dijadikan penanda identitas utama tabel. Syarat mutlak: **Unik** dan **NOT NULL**.\n- **Alternate Key**: Candidate Key yang tidak terpilih menjadi Primary Key (biasanya tetap diproteksi dengan constraint \`UNIQUE\`).`,
        keyPoints: ['Primary key wajib UNIQUE dan NOT NULL', 'Candidate key adalah semua kandidat penanda unik', 'Surrogate Key vs Natural Key'],
        durationMinutes: 6,
        isCompleted: false,
      },
      {
        id: 'c-204',
        number: 4,
        title: 'Foreign Key dan Integritas Referensial',
        summary: 'Menghubungkan tabel anak ke tabel induk serta aturan CASCADE, SET NULL, dan RESTRICT.',
        content: `### 4. Foreign Key (Kunci Asing)\n\nForeign Key (FK) adalah kolom pada suatu tabel yang merujuk pada Primary Key di tabel lain. FK berfungsi menegakkan **Integritas Referensial** (*Referential Integrity*).\n\n#### Aksi Integritas Referensial (\`ON DELETE\` / \`ON UPDATE\`):\n1. **CASCADE**: Jika data induk dihapus, seluruh data anak terkait otomatis ikut terhapus.\n2. **RESTRICT / NO ACTION**: Menolak penghapusan data induk jika masih ada baris anak yang mereferensikannya.\n3. **SET NULL**: Mengubah nilai foreign key pada data anak menjadi NULL saat data induk dihapus.`,
        keyPoints: ['FK menjamin data anak selalu valid', 'Constraint ON DELETE CASCADE vs RESTRICT', 'Mencegah timbulnya orphaned records'],
        durationMinutes: 6,
        isCompleted: false,
      },
      {
        id: 'c-205',
        number: 5,
        title: 'Entitas dalam Database',
        summary: 'Pengertian Strong Entity, Weak Entity, Atribut multivalued, dan Atribut turunan.',
        content: `### 5. Klasifikasi Entitas & Atribut\n\n- **Strong Entity**: Entitas mandiri yang memiliki Primary Key sendiri (misal: \`Mahasiswa\`, \`Dosen\`).\n- **Weak Entity**: Entitas yang keberadaannya bergantung pada entitas lain dan tidak memiliki primary key mandiri (misal: \`TanggunganMahasiswa\`).\n- **Atribut Turunan (Derived Attribute)**: Nilai yang dihitung dari atribut lain (misal: \`Umur\` dihitung dari \`Tanggal_Lahir\`). Sebaiknya tidak disimpan fisik di tabel.`,
        keyPoints: ['Strong entity vs Weak entity', 'Hindari menyimpan derived attribute di tabel', 'Partial key pada weak entity'],
        durationMinutes: 5,
        isCompleted: false,
      },
      {
        id: 'c-206',
        number: 6,
        title: 'Composite Primary Key pada Tabel Relasi',
        summary: 'Penggabungan dua atau lebih kolom sebagai primary key pada tabel transaksi dan relasi banyak-ke-banyak.',
        content: `### 6. Composite Primary Key\n\nComposite Key adalah Primary Key yang terdiri dari kombinasi 2 kolom atau lebih untuk menjamin keunikan relasi.\n\n#### Contoh Kasus:\nTabel \`KRS\` (Kartu Rencana Studi):\n\`\`\`sql\nCREATE TABLE krs (\n  nim VARCHAR(10),\n  kode_matkul VARCHAR(8),\n  semester INT,\n  nilai CHAR(2),\n  PRIMARY KEY (nim, kode_matkul, semester)\n);\n\`\`\`\nKombinasi \`(nim, kode_matkul, semester)\` mencegah seorang mahasiswa mengambil mata kuliah yang sama lebih dari satu kali dalam satu semester.`,
        keyPoints: ['Kombinasi multiple columns sebagai satu PK', 'Sering digunakan pada junction table M:N', 'Mencegah entri ganda pada relasi'],
        durationMinutes: 6,
        isCompleted: false,
      },
      {
        id: 'c-207',
        number: 7,
        title: 'Relasi Antar Tabel (1:1, 1:N, M:N)',
        summary: 'Kardinalitas relasi data, pembuatan junction table, dan desain relasi optimal.',
        content: `### 7. Tiga Tipe Kardinalitas Relasi\n\n1. **One-to-One (1:1)**: Satu baris tabel A berhubungan dengan tepat satu baris tabel B (misal: \`Mahasiswa\` dan \`KTP\`).\n2. **One-to-Many (1:N)**: Satu baris tabel A dapat memiliki banyak baris di tabel B (misal: 1 \`Dosen\` membimbing banyak \`Mahasiswa\`). FK diletakkan di sisi 'Many'.\n3. **Many-to-Many (M:N)**: Banyak baris A berelasi dengan banyak baris B (misal: \`Mahasiswa\` dan \`MataKuliah\`). **Wajib** dipecah menggunakan Junction Table (Bridge Table).`,
        keyPoints: ['1:N meletakkan FK pada tabel anak', 'M:N selalu membutuhkan junction table', 'Menghindari redundansi data'],
        durationMinutes: 7,
        isCompleted: false,
      },
      {
        id: 'c-208',
        number: 8,
        title: 'Prinsip Desain Database yang Baik & Normalisasi',
        summary: 'Ringkasan aturan 1NF, 2NF, 3NF untuk menghasilkan database yang scalable dan bebas anomali.',
        content: `### 8. Prinsip Desain Baik & Normalisasi\n\n- **Aturan 1NF**: Setiap kolom harus bersifat atomik (tidak ada nilai jamak dalam satu sel).\n- **Aturan 2NF**: Sudah 1NF dan tidak ada ketergantungan parsial (*partial dependency*) pada composite key.\n- **Aturan 3NF**: Sudah 2NF dan tidak ada ketergantungan transitif (*transitive dependency*) antar atribut non-kunci.\n\n#### Pencegahan 3 Anomali:\n1. *Insertion Anomaly*: Gagal memasukkan data karena ketiadaan data lain.\n2. *Deletion Anomaly*: Kehilangan data penting saat baris lain dihapus.\n3. *Update Anomaly*: Inkonsistensi data akibat pembaruan di banyak tempat.`,
        keyPoints: ['1NF: Nilai atomik', '2NF: Hilangkan partial dependency', '3NF: Hilangkan transitive dependency', 'Mencegah anomali insert/update/delete'],
        durationMinutes: 6,
        isCompleted: false,
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
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
  kimiApiKey: '',
  kimiModel: 'moonshot-v1-8k',
  userName: 'Raifan Habib',
  userTitle: 'Mahasiswa Berprestasi',
  userUniversity: 'Fakultas Ilmu Komputer',
  userBio: 'Fokus IPK 3.85+, aktif riset AI & kompetisi nasional.',
  userEmail: 'raifanhabib31@gmail.com',
  resendApiKey: '',
  resendSenderEmail: 'PippayLearning <onboarding@resend.dev>',
  emailJsServiceId: '',
  emailJsTemplateId: '',
  emailJsPublicKey: '',
};

// Fire-and-forget sync to Netlify Blobs (server-side storage for scheduled reminders)
function syncToServer(jadwal: Jadwal[], settings: AppSettings) {
  // Only sync when running in a real deployed environment (has /api/ route)
  fetch('/api/sync-jadwal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jadwal, settings }),
  }).catch(() => {
    // Silent fail - local dev doesn't have this endpoint
  });
}

export const storageService = {
  getFolders(): Folder[] {
    const key = getUserKey(STORAGE_KEYS.FOLDERS);
    const data = localStorage.getItem(key);
    if (!data) {
      this.saveFolders(DEFAULT_FOLDERS);
      return DEFAULT_FOLDERS;
    }
    return JSON.parse(data);
  },

  saveFolders(folders: Folder[]) {
    const key = getUserKey(STORAGE_KEYS.FOLDERS);
    localStorage.setItem(key, JSON.stringify(folders));
  },

  getMateri(): Materi[] {
    const key = getUserKey(STORAGE_KEYS.MATERI);
    const data = localStorage.getItem(key);
    if (!data) {
      this.saveMateri(DEFAULT_MATERI);
      return DEFAULT_MATERI;
    }
    return JSON.parse(data);
  },

  saveMateri(materi: Materi[]) {
    const key = getUserKey(STORAGE_KEYS.MATERI);
    localStorage.setItem(key, JSON.stringify(materi));
  },

  getKisiKisi(): KisiKisiItem[] {
    const key = getUserKey(STORAGE_KEYS.KISIKISI);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  saveKisiKisi(items: KisiKisiItem[]) {
    const key = getUserKey(STORAGE_KEYS.KISIKISI);
    localStorage.setItem(key, JSON.stringify(items));
  },

  getQuizResults(): QuizResult[] {
    const key = getUserKey(STORAGE_KEYS.QUIZ_RESULTS);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  saveQuizResults(results: QuizResult[]) {
    const key = getUserKey(STORAGE_KEYS.QUIZ_RESULTS);
    localStorage.setItem(key, JSON.stringify(results));
  },

  getJadwal(): Jadwal[] {
    const key = getUserKey(STORAGE_KEYS.JADWAL);
    const data = localStorage.getItem(key);
    if (!data) {
      this.saveJadwal(DEFAULT_JADWAL);
      return DEFAULT_JADWAL;
    }
    return JSON.parse(data);
  },

  saveJadwal(jadwal: Jadwal[]) {
    const key = getUserKey(STORAGE_KEYS.JADWAL);
    localStorage.setItem(key, JSON.stringify(jadwal));
    // Sync to server so scheduled H-1 reminder can access latest data
    const settings = this.getSettings();
    syncToServer(jadwal, settings);
  },

  getSemesters(): SemesterRecord[] {
    const key = getUserKey(STORAGE_KEYS.SEMESTERS);
    const data = localStorage.getItem(key);
    if (!data) {
      this.saveSemesters(DEFAULT_SEMESTERS);
      return DEFAULT_SEMESTERS;
    }
    return JSON.parse(data);
  },

  saveSemesters(semesters: SemesterRecord[]) {
    const key = getUserKey(STORAGE_KEYS.SEMESTERS);
    localStorage.setItem(key, JSON.stringify(semesters));
  },

  getDailyGrades(): DailyGradeItem[] {
    const key = getUserKey(STORAGE_KEYS.DAILY_GRADES);
    const data = localStorage.getItem(key);
    if (!data) {
      this.saveDailyGrades(DEFAULT_DAILY_GRADES);
      return DEFAULT_DAILY_GRADES;
    }
    return JSON.parse(data);
  },

  saveDailyGrades(grades: DailyGradeItem[]) {
    const key = getUserKey(STORAGE_KEYS.DAILY_GRADES);
    localStorage.setItem(key, JSON.stringify(grades));
  },

  getSettings(): AppSettings {
    const key = getUserKey(STORAGE_KEYS.SETTINGS);
    const data = localStorage.getItem(key);
    const currentUser = authService.getCurrentUser();

    const baseDefaults: AppSettings = {
      ...DEFAULT_SETTINGS,
      userName: currentUser?.name || DEFAULT_SETTINGS.userName,
      userEmail: currentUser?.email || DEFAULT_SETTINGS.userEmail,
      userUniversity: currentUser?.university || DEFAULT_SETTINGS.userUniversity,
    };

    if (!data) {
      this.saveSettings(baseDefaults);
      return baseDefaults;
    }
    const parsed = JSON.parse(data);
    if (!parsed.resendApiKey) {
      parsed.resendApiKey = DEFAULT_SETTINGS.resendApiKey;
    }
    if (!parsed.resendSenderEmail) {
      parsed.resendSenderEmail = DEFAULT_SETTINGS.resendSenderEmail;
    }
    if (!parsed.userEmail && currentUser?.email) {
      parsed.userEmail = currentUser.email;
    }
    return { ...baseDefaults, ...parsed };
  },

  saveSettings(settings: AppSettings) {
    const key = getUserKey(STORAGE_KEYS.SETTINGS);
    localStorage.setItem(key, JSON.stringify(settings));
    // Sync to server so scheduled reminder has latest API key + email
    const jadwal = this.getJadwal();
    syncToServer(jadwal, settings);
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
