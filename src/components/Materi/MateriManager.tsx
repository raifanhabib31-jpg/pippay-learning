import React, { useState } from 'react';
import { 
  Folder as FolderIcon, 
  FileText, 
  Upload, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Search, 
  ArrowLeft, 
  HelpCircle, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  FileUp, 
  Loader2 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Folder, Materi, SummaryType } from '../../types';
import { parseDocumentFile } from '../../services/fileParser';
import { geminiService } from '../../services/geminiService';

interface MateriManagerProps {
  folders: Folder[];
  materi: Materi[];
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  onSaveMateri: (materi: Materi) => void;
  onDeleteMateri: (id: string) => void;
  onSaveFolder: (folder: Folder) => void;
  onDeleteFolder: (id: string) => void;
  onStartQuizFromMateri: (materi: Materi) => void;
}

export const MateriManager: React.FC<MateriManagerProps> = ({
  folders,
  materi,
  selectedFolderId,
  setSelectedFolderId,
  onSaveMateri,
  onDeleteMateri,
  onSaveFolder,
  onDeleteFolder,
  onStartQuizFromMateri,
}) => {
  const [selectedMateri, setSelectedMateri] = useState<Materi | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Upload modal states
  const [uploadType, setUploadType] = useState<'file' | 'text'>('file');
  const [targetFolderId, setTargetFolderId] = useState<string>(selectedFolderId || folders[0]?.id || '');
  const [docTitle, setDocTitle] = useState('');
  const [rawTextInput, setRawTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summaryMode, setSummaryMode] = useState<SummaryType>('lengkap');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // New folder modal states
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderCode, setNewFolderCode] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');

  // Filtering folders
  const filteredFolders = folders.filter(f => 
    searchQuery 
      ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) || (f.code && f.code.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  );

  // Pagination for folders
  const totalPages = Math.ceil(filteredFolders.length / itemsPerPage) || 1;
  const paginatedFolders = filteredFolders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Filtering materi inside active folder
  const currentFolder = folders.find(f => f.id === selectedFolderId);
  const folderMateriList = materi.filter(m => m.folderId === selectedFolderId);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: Folder = {
      id: 'f-' + Date.now(),
      name: newFolderName.trim(),
      code: newFolderCode.trim() || undefined,
      color: 'purple',
      description: newFolderDesc.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveFolder(newFolder);
    setIsFolderModalOpen(false);
    setNewFolderName('');
    setNewFolderCode('');
    setNewFolderDesc('');
  };

  const handleProcessDocument = async () => {
    if (!targetFolderId) {
      alert('Pilih folder mata kuliah terlebih dahulu.');
      return;
    }

    let contentToSummarize = '';
    let fileType: Materi['fileType'] = 'text';
    let originalName = '';
    let fileSize = '';
    const title = docTitle.trim() || (selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'Ringkasan Materi Baru');

    setIsSummarizing(true);

    try {
      if (uploadType === 'file' && selectedFile) {
        setStatusMessage('Mengekstrak teks dari file ' + selectedFile.name + '...');
        const parsed = await parseDocumentFile(selectedFile);
        contentToSummarize = parsed.text;
        fileType = parsed.fileType;
        originalName = parsed.fileName;
        fileSize = parsed.fileSize;
      } else {
        contentToSummarize = rawTextInput.trim();
        fileType = 'text';
        originalName = 'Catatan Manual';
        fileSize = `${(contentToSummarize.length / 1024).toFixed(1)} KB`;
      }

      if (!contentToSummarize || contentToSummarize.length < 20) {
        throw new Error('Konten teks terlalu pendek atau tidak dapat diekstrak.');
      }

      setStatusMessage('Gemini AI sedang menganalisis & membuat ringkasan...');
      const targetCourse = folders.find(f => f.id === targetFolderId)?.name || 'Umum';
      
      const summaryResult = await geminiService.summarizeDocument(
        contentToSummarize,
        summaryMode,
        targetCourse,
        title
      );

      const newMateriItem: Materi = {
        id: 'm-' + Date.now(),
        folderId: targetFolderId,
        title,
        fileType,
        originalFileName: originalName,
        fileSize,
        rawContent: contentToSummarize,
        summary: summaryResult,
        summaryType: summaryMode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSaveMateri(newMateriItem);
      setSelectedFolderId(targetFolderId);
      setSelectedMateri(newMateriItem);
      setIsUploadModalOpen(false);
      
      // Reset form
      setDocTitle('');
      setRawTextInput('');
      setSelectedFile(null);
    } catch (err: any) {
      alert('Gagal memproses dokumen: ' + (err.message || 'Error'));
    } finally {
      setIsSummarizing(false);
      setStatusMessage('');
    }
  };

  const handleCopySummary = () => {
    if (!selectedMateri) return;
    navigator.clipboard.writeText(selectedMateri.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeakSummary = () => {
    if (!selectedMateri) return;
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const cleanText = selectedMateri.summary.replace(/[#*_`]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'id-ID';
        utterance.rate = 1.0;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    } else {
      alert('Browser Anda tidak mendukung Text-to-Speech.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. DOCUMENT VIEW (Detail Ringkasan) */}
      {selectedMateri ? (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-dark-850 border border-dark-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedMateri(null)}
                className="p-2 bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white rounded-xl border border-dark-border transition-colors"
                title="Kembali ke Folder"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {currentFolder?.name || 'Mata Kuliah'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {selectedMateri.fileType.toUpperCase()} • {selectedMateri.fileSize || 'Dokumen'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">{selectedMateri.title}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => onStartQuizFromMateri(selectedMateri)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-purple-900/30 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Buat Soal Kuis</span>
              </button>

              <button
                onClick={handleSpeakSummary}
                className={`p-2 rounded-xl text-xs font-medium border border-dark-border transition-colors ${
                  isSpeaking ? 'bg-amber-600 text-white' : 'bg-dark-800 hover:bg-dark-750 text-slate-300'
                }`}
                title={isSpeaking ? 'Hentikan Suara' : 'Dengarkan Ringkasan (TTS)'}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={handleCopySummary}
                className="px-3 py-2 bg-dark-800 hover:bg-dark-750 text-slate-200 rounded-xl text-xs font-medium border border-dark-border flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Hapus materi ini?')) {
                    onDeleteMateri(selectedMateri.id);
                    setSelectedMateri(null);
                  }
                }}
                className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-xl border border-rose-800/40 transition-colors"
                title="Hapus Materi"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Markdown Content Card */}
          <div className="bg-dark-850 border border-dark-border rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="prose-custom max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedMateri.summary || selectedMateri.rawContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      ) : selectedFolderId && currentFolder ? (
        /* 2. FOLDER DETAIL VIEW (Daftar Materi dalam satu folder) */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedFolderId(null)}
                className="p-2 bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white rounded-xl border border-dark-border transition-colors"
                title="Kembali ke Daftar Mata Pelajaran"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-purple-300 font-semibold">Mata Pelajaran</span>
                  {currentFolder.code && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-dark-800 text-slate-400 border border-dark-border">
                      {currentFolder.code}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white">{currentFolder.name}</h1>
              </div>
            </div>

            <button
              onClick={() => {
                setTargetFolderId(currentFolder.id);
                setIsUploadModalOpen(true);
              }}
              className="px-4 py-2.5 bg-accent-orange hover:bg-accent-orangeHover text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-950/40 transition-all shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>Ringkas Materi Baru</span>
            </button>
          </div>

          {folderMateriList.length === 0 ? (
            <div className="border border-dashed border-dark-border/80 rounded-3xl p-12 text-center space-y-4 bg-dark-900/40">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Belum Ada Materi</h3>
                <p className="text-xs text-slate-400">Unggah slide PPTX, PDF modul, atau dokumen DOCX untuk diringkas AI.</p>
              </div>
              <button
                onClick={() => {
                  setTargetFolderId(currentFolder.id);
                  setIsUploadModalOpen(true);
                }}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Unggah Dokumen Pertama</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folderMateriList.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMateri(m)}
                  className="bg-dark-850 hover:bg-dark-800 border border-dark-border hover:border-purple-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between group shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {m.fileType.toUpperCase()}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(m.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {m.summary.replace(/[#*_`]/g, '')}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-dark-border flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">{m.fileSize || 'Tersimpan'}</span>
                    <span className="text-purple-400 font-semibold text-[11px]">Buka Materi →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 3. ROOT MATA PELAJARAN VIEW (Matches Pelajarin.ai Screenshot 2) */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Mata Pelajaran
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Kelola daftar mata pelajaran untuk mengorganisir catatan & ringkasan Anda.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsFolderModalOpen(true)}
                className="px-4 py-2.5 bg-accent-orange hover:bg-accent-orangeHover text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 transition-all transform active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari mata pelajaran..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-dark-850 border border-dark-border rounded-full pl-11 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent-orange transition-colors"
            />
          </div>

          {/* Grid of Folders */}
          {paginatedFolders.length === 0 ? (
            <div className="border border-dashed border-dark-border/80 rounded-3xl p-12 text-center space-y-4 bg-dark-900/40">
              <div className="w-12 h-12 rounded-2xl bg-accent-orange/10 border border-accent-orange/30 flex items-center justify-center text-accent-orange mx-auto">
                <FolderIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Belum Ada Mata Pelajaran</h3>
                <p className="text-xs text-slate-400">Buat folder mata kuliah untuk mulai menyimpan materi kuliah Anda.</p>
              </div>
              <button
                onClick={() => setIsFolderModalOpen(true)}
                className="px-5 py-2.5 bg-accent-orange hover:bg-accent-orangeHover text-white rounded-xl text-xs font-bold shadow-md transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Mata Pelajaran Pertama</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedFolders.map((folder, index) => {
                const count = materi.filter(m => m.folderId === folder.id).length;
                const isSelected = selectedFolderId === folder.id;
                return (
                  <div
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`bg-dark-850 hover:bg-dark-800 border rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between group shadow-sm relative ${
                      isSelected || index === 0
                        ? 'border-accent-orange shadow-lg shadow-orange-950/20'
                        : 'border-dark-border hover:border-purple-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Orange Folder Icon Badge */}
                      <div className="w-10 h-10 rounded-xl bg-accent-orange/15 border border-accent-orange/30 flex items-center justify-center text-accent-orange shadow-sm">
                        <FolderIcon className="w-5 h-5 fill-accent-orange text-accent-orange" />
                      </div>

                      {/* Action Icons */}
                      <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Hapus folder mata kuliah "${folder.name}" beserta seluruh materinya?`)) {
                              onDeleteFolder(folder.id);
                            }
                          }}
                          className="p-1.5 hover:bg-dark-750 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1">
                      <h3 className={`text-base font-bold transition-colors ${
                        isSelected || index === 0 ? 'text-accent-orange' : 'text-white group-hover:text-purple-300'
                      }`}>
                        {folder.name}
                      </h3>
                      {folder.code && (
                        <p className="text-xs text-slate-400 font-mono">{folder.code}</p>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-dark-border flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>{count} catatan</span>
                      </div>
                      <span className="text-purple-400 group-hover:translate-x-0.5 transition-transform text-[11px] font-semibold">
                        Buka →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {filteredFolders.length > 0 && (
            <div className="flex flex-col items-center justify-center gap-2 pt-4">
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-2 rounded-xl bg-dark-850 hover:bg-dark-800 disabled:opacity-30 border border-dark-border text-slate-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="w-8 h-8 rounded-xl bg-accent-orange text-white font-bold text-xs flex items-center justify-center shadow-md shadow-orange-950/40">
                  {currentPage}
                </div>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-2 rounded-xl bg-dark-850 hover:bg-dark-800 disabled:opacity-30 border border-dark-border text-slate-300 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Menampilkan {Math.min(filteredFolders.length, (currentPage - 1) * itemsPerPage + 1)}–{Math.min(filteredFolders.length, currentPage * itemsPerPage)} dari {filteredFolders.length}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal: Tambah Folder Mata Pelajaran */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-850 border border-dark-border rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent-orange/20 border border-accent-orange/30 flex items-center justify-center text-accent-orange">
                  <FolderIcon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-white">Tambah Mata Pelajaran</h3>
              </div>
              <button
                onClick={() => setIsFolderModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-750"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nama Mata Pelajaran / Kuliah *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Database, Sistem Operasi, Kalkulus"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent-orange"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Kode Mata Kuliah (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: CS201, IF2110"
                  value={newFolderCode}
                  onChange={(e) => setNewFolderCode(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent-orange font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Deskripsi Singkat (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Semester 4 - Dosen Pengampu Dr. Budi"
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent-orange"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-dark-border">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-4 py-2 bg-dark-800 hover:bg-dark-750 text-slate-300 rounded-xl font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent-orange hover:bg-accent-orangeHover text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ringkas Dokumen Baru */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-850 border border-dark-border rounded-2xl max-w-xl w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Ringkas Materi Baru dengan AI</h3>
                  <p className="text-[11px] text-slate-400">Dukung file PDF, PPTX, DOCX, TXT atau Input Teks</p>
                </div>
              </div>
              <button
                onClick={() => !isSummarizing && setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-750"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Folder Target */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mata Pelajaran Tujuan *
                </label>
                <select
                  value={targetFolderId}
                  onChange={(e) => setTargetFolderId(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name} {f.code ? `(${f.code})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Upload Tab Toggle */}
              <div className="flex p-1 bg-dark-900 rounded-xl border border-dark-border">
                <button
                  type="button"
                  onClick={() => setUploadType('file')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
                    uploadType === 'file' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Unggah File (PDF/PPTX/DOCX)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('text')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
                    uploadType === 'text' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Tempel Teks Manual</span>
                </button>
              </div>

              {/* Input Judul */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Judul Materi (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bab 3 - Relational Algebra & SQL Joins"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* File Upload Zone / Text Area */}
              {uploadType === 'file' ? (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Pilih File Modul / Slide
                  </label>
                  <div className="border border-dashed border-dark-border hover:border-purple-500 rounded-2xl p-6 text-center cursor-pointer bg-dark-900/50 hover:bg-dark-800/50 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.pptx,.docx,.txt"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                          if (!docTitle) setDocTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                        }
                      }}
                      className="hidden"
                      id="materi-file-upload"
                    />
                    <label htmlFor="materi-file-upload" className="cursor-pointer block space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-semibold text-white">
                        {selectedFile ? selectedFile.name : 'Klik untuk pilih file materi'}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Mendukung format .pdf, .pptx, .docx, .txt'}
                      </p>
                    </label>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Konten / Catatan Materi
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Tempelkan isi modul, rangkuman dosen, atau materi kuliah disini..."
                    value={rawTextInput}
                    onChange={(e) => setRawTextInput(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-border rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              )}

              {/* Mode Ringkasan */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Format Ringkasan AI
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'lengkap', label: 'Ringkasan Komprehensif', desc: 'Lengkap beserta penjelasan mendalam' },
                    { id: 'poin_kunci', label: 'Poin Kunci (Bullet Points)', desc: 'Fokus pada inti bahasan penting' },
                    { id: 'rumus_definisi', label: 'Rumus & Definisi', desc: 'Kumpulan konsep & rumus utama' },
                    { id: 'cheatsheet', label: 'Cheatsheet Kilat', desc: 'Format ringkas untuk review cepat' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setSummaryMode(mode.id as SummaryType)}
                      className={`p-2.5 rounded-xl border text-left transition-colors ${
                        summaryMode === mode.id
                          ? 'bg-purple-950/60 border-purple-500 text-white'
                          : 'bg-dark-800 border-dark-border text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-semibold text-xs text-slate-200">{mode.label}</div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {statusMessage && (
                <div className="p-3 bg-purple-950/50 border border-purple-500/30 rounded-xl text-purple-300 text-xs flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-dark-border">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                disabled={isSummarizing}
                className="px-4 py-2 bg-dark-800 hover:bg-dark-750 text-slate-300 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessDocument}
                disabled={isSummarizing || (uploadType === 'file' && !selectedFile) || (uploadType === 'text' && !rawTextInput.trim())}
                className="px-5 py-2 bg-accent-orange hover:bg-accent-orangeHover text-white rounded-xl font-bold shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSummarizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Mulai Ringkas AI</span>
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
