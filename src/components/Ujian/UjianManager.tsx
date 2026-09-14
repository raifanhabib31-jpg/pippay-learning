import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  CheckCircle2, 
  Globe, 
  HelpCircle, 
  Copy, 
  Check, 
  Trash2, 
  Search, 
  Target, 
  ArrowLeft, 
  X, 
  Loader2 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Folder, Materi, KisiKisiItem } from '../../types';
import { geminiService } from '../../services/geminiService';

interface UjianManagerProps {
  folders: Folder[];
  materi: Materi[];
  kisiKisiList: KisiKisiItem[];
  onSaveKisiKisi: (item: KisiKisiItem) => void;
  onDeleteKisiKisi: (id: string) => void;
  onStartQuizFromContent: (text: string, title: string) => void;
}

export const UjianManager: React.FC<UjianManagerProps> = ({
  folders,
  materi,
  kisiKisiList,
  onSaveKisiKisi,
  onDeleteKisiKisi,
  onStartQuizFromContent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>(folders[0]?.id || '');
  const [examTitle, setExamTitle] = useState('');
  const [kisiKisiInput, setKisiKisiInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeItem, setActiveItem] = useState<KisiKisiItem | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'guide' | 'matched' | 'external'>('guide');
  const [copied, setCopied] = useState(false);

  // Available notes for selected folder
  const relatedNotes = materi.filter(m => m.folderId === selectedFolderId);

  const filteredList = kisiKisiList.filter(item => {
    const matchesSearch = searchQuery 
      ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.rawInput.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesSearch;
  });

  const handleAnalyze = async () => {
    if (!kisiKisiInput.trim()) {
      alert('Masukkan kisi-kisi atau topik ujian dari dosen terlebih dahulu.');
      return;
    }

    setIsAnalyzing(true);

    try {
      const targetCourse = folders.find(f => f.id === selectedFolderId)?.name || 'Mata Kuliah';
      const summariesPayload = relatedNotes.map(n => ({
        title: n.title,
        content: n.summary || n.rawContent,
      }));

      const analysis = await geminiService.matchAndSynthesizeKisiKisi(
        kisiKisiInput.trim(),
        summariesPayload,
        targetCourse
      );

      const newItem: KisiKisiItem = {
        id: 'kisi-' + Date.now(),
        folderId: selectedFolderId,
        title: examTitle.trim() || `Prediksi Soal: ${targetCourse}`,
        rawInput: kisiKisiInput.trim(),
        matchedContent: analysis.matchedContent,
        externalAdditions: analysis.externalAdditions,
        fullStudyGuide: analysis.fullStudyGuide,
        createdAt: new Date().toISOString(),
      };

      onSaveKisiKisi(newItem);
      setActiveItem(newItem);
      setKisiKisiInput('');
      setExamTitle('');
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Gagal menganalisis kisi-kisi: ' + (err.message || 'Pastikan API Key sudah diset di Pengaturan'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (!activeItem) return;
    const content = activeResultTab === 'guide' 
      ? activeItem.fullStudyGuide 
      : activeResultTab === 'matched' 
      ? activeItem.matchedContent 
      : activeItem.externalAdditions;

    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Detail View of a Selected Prediction */}
      {activeItem ? (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-dark-850 border border-dark-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveItem(null)}
                className="p-2 bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white rounded-xl border border-dark-border transition-colors"
                title="Kembali ke Daftar Prediksi"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent-orange/20 text-accent-orange border border-accent-orange/30">
                    {folders.find(f => f.id === activeItem.folderId)?.name || 'Mata Kuliah'}
                  </span>
                  <span className="text-xs text-slate-400">
                    Dibuat {new Date(activeItem.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">{activeItem.title}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onStartQuizFromContent(activeItem.fullStudyGuide, activeItem.title)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-purple-900/30 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Buat Kuis Latihan</span>
              </button>
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 bg-dark-800 hover:bg-dark-750 text-slate-200 rounded-xl text-xs font-medium border border-dark-border flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
              <button
                onClick={() => {
                  if (confirm('Hapus hasil prediksi ujian ini?')) {
                    onDeleteKisiKisi(activeItem.id);
                    setActiveItem(null);
                  }
                }}
                className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-xl border border-rose-800/40 transition-colors"
                title="Hapus"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Original Input Banner */}
          <div className="bg-dark-850/80 border border-dark-border rounded-xl p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Kisi-kisi Dosen yang Dianalisis:
            </div>
            <div className="text-xs text-slate-300 font-mono whitespace-pre-wrap bg-dark-900 p-3 rounded-lg border border-dark-border/80">
              {activeItem.rawInput}
            </div>
          </div>

          {/* Output Tabs */}
          <div className="bg-dark-850 border border-dark-border rounded-2xl overflow-hidden shadow-sm">
            <div className="flex border-b border-dark-border bg-dark-900/80 px-4 pt-3 gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveResultTab('guide')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-colors whitespace-nowrap ${
                  activeResultTab === 'guide'
                    ? 'border-accent-orange text-accent-orange bg-dark-850'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>Rangkuman Komprehensif Siap Ujian</span>
              </button>
              <button
                onClick={() => setActiveResultTab('matched')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-colors whitespace-nowrap ${
                  activeResultTab === 'matched'
                    ? 'border-purple-400 text-purple-300 bg-dark-850'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Materi yang Cocok dari Catatan</span>
              </button>
              <button
                onClick={() => setActiveResultTab('external')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-colors whitespace-nowrap ${
                  activeResultTab === 'external'
                    ? 'border-cyan-400 text-cyan-300 bg-dark-850'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Materi Tambahan Eksternal AI</span>
              </button>
            </div>

            <div className="p-6">
              <div className="prose-custom max-w-none">
                {activeResultTab === 'guide' && (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeItem.fullStudyGuide}
                  </ReactMarkdown>
                )}
                {activeResultTab === 'matched' && (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeItem.matchedContent || '_Tidak ada catatan lokal yang cocok langsung._'}
                  </ReactMarkdown>
                )}
                {activeResultTab === 'external' && (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeItem.externalAdditions || '_Semua kisi-kisi sudah tercakup dalam materi lokal Anda._'}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Main Prediksi Ujian List View (Pelajarin Style) */
        <div className="space-y-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Prediksi Soal Ujian
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Unggah soal ujian atau kisi-kisi dosen, biarkan AI memprediksi soal & materi kunci jawaban.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-accent-orange hover:bg-accent-orangeHover text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 transition-all transform active:scale-95 shrink-0"
            >
              <Target className="w-4 h-4" />
              <span>Buat Prediksi</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari koleksi atau kisi-kisi ujian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-850 border border-dark-border rounded-full pl-11 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent-orange transition-colors"
            />
          </div>

          {/* List or Empty State */}
          {filteredList.length === 0 ? (
            /* Empty state matching pelajarin.ai screenshot 1 */
            <div className="border border-dashed border-dark-border/80 rounded-3xl p-12 md:p-16 flex flex-col items-center justify-center text-center space-y-4 bg-dark-900/40">
              <div className="w-14 h-14 rounded-2xl bg-accent-orange/10 border border-accent-orange/30 flex items-center justify-center text-accent-orange shadow-inner">
                <Target className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-base font-bold text-white">Belum ada prediksi ujian</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Unggah soal ujian lama atau masukkan kisi-kisi dosen — AI akan memprediksi soal yang mungkin keluar lengkap dengan materi & kunci jawaban.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-2 px-5 py-2.5 bg-accent-orange hover:bg-accent-orangeHover text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-950/40 transition-all transform active:scale-95"
              >
                <Target className="w-4 h-4" />
                <span>Buat Prediksi Pertama</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredList.map((item) => {
                const folder = folders.find(f => f.id === item.folderId);
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className="bg-dark-850 hover:bg-dark-800 border border-dark-border hover:border-accent-orange/60 rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-lg hover:shadow-orange-950/20"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent-orange/15 text-accent-orange border border-accent-orange/20">
                          {folder?.name || 'Mata Kuliah'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-accent-orange transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {item.rawInput}
                      </p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-dark-border flex items-center justify-between text-xs">
                      <span className="text-purple-300 font-medium text-[11px] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI Study Guide
                      </span>
                      <span className="text-accent-orange font-semibold text-[11px]">
                        Buka Detail →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Buat Prediksi Soal Ujian */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-850 border border-dark-border rounded-2xl max-w-xl w-full p-6 text-slate-100 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent-orange/20 border border-accent-orange/30 flex items-center justify-center text-accent-orange">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Buat Prediksi Soal Ujian</h3>
                  <p className="text-[11px] text-slate-400">Sintesis kisi-kisi dosen dengan materi catatan & AI</p>
                </div>
              </div>
              <button
                onClick={() => !isAnalyzing && setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-750"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Mata Kuliah */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Pilih Mata Kuliah Terkait
                </label>
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-accent-orange"
                >
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} {f.code ? `(${f.code})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  AI akan mencari dari {relatedNotes.length} materi yang tersimpan di mata kuliah ini.
                </p>
              </div>

              {/* Judul Ujian */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Judul Prediksi / Ujian (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kisi-Kisi UTS Semester 4 / Prediksi UAS"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent-orange"
                />
              </div>

              {/* Input Kisi-Kisi */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Kisi-Kisi atau Topik Ujian dari Dosen
                </label>
                <textarea
                  rows={6}
                  placeholder="Contoh:&#10;1. Normalisasi database (1NF sampai 3NF)&#10;2. Perbedaan inner join, left join, full outer join&#10;3. Soal hitungan indexing B-Tree&#10;4. Konsep ACID transaction"
                  value={kisiKisiInput}
                  onChange={(e) => setKisiKisiInput(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-border rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent-orange font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-dark-border">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-dark-800 hover:bg-dark-750 text-slate-300 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-5 py-2 bg-accent-orange hover:bg-accent-orangeHover text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-950/40 transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menganalisis & Mencocokkan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Mulai Analisis AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
