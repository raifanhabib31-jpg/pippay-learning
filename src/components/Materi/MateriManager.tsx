import React, { useState } from 'react';
import { 
  Folder as FolderIcon, 
  FileText, 
  Upload, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  CheckCircle2, 
  Circle, 
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
  Loader2, 
  Layers, 
  Share2, 
  FileDown, 
  BookOpen, 
  Edit3, 
  GitFork, 
  Calendar, 
  BookMarked
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Folder, Materi, SummaryType, Chapter } from '../../types';
import { parseDocumentFile } from '../../services/fileParser';
import { geminiService } from '../../services/geminiService';

/* ─── ImageGallery: tampilan galeri gambar halaman dokumen ─── */
const ImageGallery: React.FC<{ images: string[]; title: string }> = ({ images, title }) => {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);
  const prev = () => setLightboxIdx((i) => (i !== null ? (i - 1 + images.length) % images.length : 0));
  const next = () => setLightboxIdx((i) => (i !== null ? (i + 1) % images.length : 0));

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxIdx === null) return;
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIdx]);

  return (
    <div className="bg-dark-850 border border-dark-border rounded-2xl p-6 md:p-8 space-y-5 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-dark-border">
        <div>
          <h2 className="text-lg font-bold text-white">Galeri Gambar Dokumen</h2>
          <p className="text-xs text-slate-400 mt-0.5">{images.length} halaman/slide dari "{title}" — klik gambar untuk perbesar</p>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
          {images.length} Gambar
        </span>
      </div>

      {/* Grid gambar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((src, idx) => (
          <button
            key={idx}
            onClick={() => openLightbox(idx)}
            className="group relative rounded-xl overflow-hidden border border-dark-border hover:border-amber-500/60 transition-all bg-dark-800 aspect-[3/4] focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <img
              src={src}
              alt={`Halaman ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold bg-black/60 px-2 py-1 rounded-lg">
                🔍 Perbesar
              </span>
            </div>
            <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold bg-black/70 text-slate-200 px-1.5 py-0.5 rounded-md">
              {idx + 1}
            </span>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 md:left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Image */}
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIdx]}
              alt={`Halaman ${lightboxIdx + 1}`}
              className="max-h-[82vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
            />
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-300 font-semibold bg-white/10 px-3 py-1 rounded-full">
                Halaman {lightboxIdx + 1} / {images.length}
              </span>
              <button
                onClick={closeLightbox}
                className="text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors"
              >
                ✕ Tutup
              </button>
            </div>
          </div>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 md:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};


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
  const [activeTab, setActiveTab] = useState<'bab' | 'dokumen' | 'mindmap' | 'gambar'>('bab');
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  
  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isEditChapterModalOpen, setIsEditChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Partial<Chapter> | null>(null);

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
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExtractingChapters, setIsExtractingChapters] = useState(false);

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
  const currentFolder = folders.find(f => f.id === (selectedMateri ? selectedMateri.folderId : selectedFolderId));
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

    let extractedImages: string[] = [];

    try {
      if (uploadType === 'file' && selectedFile) {
        setStatusMessage('Mengekstrak teks & gambar dari file ' + selectedFile.name + '...');
        const parsed = await parseDocumentFile(selectedFile);
        contentToSummarize = parsed.text;
        fileType = parsed.fileType;
        originalName = parsed.fileName;
        fileSize = parsed.fileSize;
        extractedImages = parsed.images || [];
      } else {
        contentToSummarize = rawTextInput.trim();
        fileType = 'text';
        originalName = 'Catatan Manual';
        fileSize = `${(contentToSummarize.length / 1024).toFixed(1)} KB`;
      }

      if (!contentToSummarize || contentToSummarize.length < 20) {
        throw new Error('Konten teks terlalu pendek atau tidak dapat diekstrak.');
      }

      const targetCourse = folders.find(f => f.id === targetFolderId)?.name || 'Umum';
      
      setStatusMessage('Gemini AI sedang menganalisis & merangkum...');
      const summaryResult = await geminiService.summarizeDocument(
        contentToSummarize,
        summaryMode,
        targetCourse,
        title,
        additionalPrompt.trim() || undefined
      );

      setStatusMessage('Menyusun Bab & Sub-Bab terstruktur...');
      const chaptersResult = await geminiService.extractChaptersFromContent(
        contentToSummarize,
        title,
        targetCourse,
        additionalPrompt.trim() || undefined
      );

      const description = summaryResult.split('\n\n')[0]?.replace(/[#*_`]/g, '').trim() || 
        `Materi perkuliahan ${title} untuk mata kuliah ${targetCourse}.`;

      const newMateriItem: Materi = {
        id: 'm-' + Date.now(),
        folderId: targetFolderId,
        title,
        description,
        fileType,
        originalFileName: originalName,
        fileSize,
        rawContent: contentToSummarize,
        summary: summaryResult,
        summaryType: summaryMode,
        chapters: chaptersResult,
        images: extractedImages.length > 0 ? extractedImages : undefined,
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
      setAdditionalPrompt('');
    } catch (err: any) {
      alert('Gagal memproses dokumen: ' + (err.message || 'Error'));
    } finally {
      setIsSummarizing(false);
      setStatusMessage('');
    }
  };

  const handleExtractChapters = async () => {
    if (!selectedMateri) return;
    setIsExtractingChapters(true);
    try {
      const targetCourse = currentFolder?.name || 'Umum';
      const chapters = await geminiService.extractChaptersFromContent(
        selectedMateri.rawContent || selectedMateri.summary,
        selectedMateri.title,
        targetCourse
      );
      
      const updated: Materi = {
        ...selectedMateri,
        chapters,
        updatedAt: new Date().toISOString()
      };
      
      onSaveMateri(updated);
      setSelectedMateri(updated);
    } catch (e: any) {
      alert('Gagal mengekstrak bab: ' + e.message);
    } finally {
      setIsExtractingChapters(false);
    }
  };

  const handleToggleChapterCompletion = (chapterId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedMateri || !selectedMateri.chapters) return;
    
    const updatedChapters = selectedMateri.chapters.map(ch => 
      ch.id === chapterId ? { ...ch, isCompleted: !ch.isCompleted } : ch
    );
    
    const updatedMateri = {
      ...selectedMateri,
      chapters: updatedChapters,
      updatedAt: new Date().toISOString()
    };
    
    onSaveMateri(updatedMateri);
    setSelectedMateri(updatedMateri);
    if (activeChapter && activeChapter.id === chapterId) {
      setActiveChapter({ ...activeChapter, isCompleted: !activeChapter.isCompleted });
    }
  };

  const handleSaveChapterEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMateri || !editingChapter || !editingChapter.title) return;

    const currentChapters = selectedMateri.chapters || [];
    let updatedChapters: Chapter[];

    if (editingChapter.id) {
      // Edit existing
      updatedChapters = currentChapters.map(ch => 
        ch.id === editingChapter.id ? ({ ...ch, ...editingChapter } as Chapter) : ch
      );
    } else {
      // Add new chapter
      const newChap: Chapter = {
        id: 'c-' + Date.now(),
        number: currentChapters.length + 1,
        title: editingChapter.title,
        summary: editingChapter.summary || 'Ringkasan sub-bab.',
        content: editingChapter.content || `Penjelasan materi untuk ${editingChapter.title}`,
        keyPoints: editingChapter.keyPoints || ['Pahami konsep utama sub-bab ini.'],
        durationMinutes: editingChapter.durationMinutes || 5,
        isCompleted: false
      };
      updatedChapters = [...currentChapters, newChap];
    }

    const updatedMateri = {
      ...selectedMateri,
      chapters: updatedChapters,
      updatedAt: new Date().toISOString()
    };

    onSaveMateri(updatedMateri);
    setSelectedMateri(updatedMateri);
    setIsEditChapterModalOpen(false);
    setEditingChapter(null);
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (!selectedMateri || !selectedMateri.chapters) return;
    if (!confirm('Hapus sub-bab ini?')) return;

    const filtered = selectedMateri.chapters
      .filter(ch => ch.id !== chapterId)
      .map((ch, idx) => ({ ...ch, number: idx + 1 }));

    const updatedMateri = {
      ...selectedMateri,
      chapters: filtered,
      updatedAt: new Date().toISOString()
    };

    onSaveMateri(updatedMateri);
    setSelectedMateri(updatedMateri);
    if (activeChapter?.id === chapterId) {
      setActiveChapter(null);
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
        const textToRead = activeChapter ? activeChapter.content : selectedMateri.summary;
        const cleanText = textToRead.replace(/[#*_`$]/g, '');
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

  const handleExportPDF = () => {
    window.print();
  };

  const handleShare = () => {
    if (!selectedMateri) return;
    const shareText = `[PippayLearning] Materi: ${selectedMateri.title}\nMata Kuliah: ${currentFolder?.name || '-'}\n\n${selectedMateri.description || selectedMateri.summary.slice(0, 300)}`;
    navigator.clipboard.writeText(shareText);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const chaptersList = selectedMateri?.chapters || [];
  const completedChaptersCount = chaptersList.filter(c => c.isCompleted).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. PELAJARIN.AI-STYLE DOCUMENT & SUB-BAB VIEW */}
      {selectedMateri ? (
        <div className="space-y-6">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setSelectedMateri(null);
                setActiveChapter(null);
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke {currentFolder ? currentFolder.name : 'Dashboard'}</span>
            </button>
          </div>

          {/* Main Title & Executive Header Card */}
          <div className="bg-dark-850 border border-dark-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
            {/* Badges & Meta */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {currentFolder?.name || 'Mata Kuliah'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-dark-750 text-slate-300 border border-dark-border">
                  {chaptersList.length} bab
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1.5 ml-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(selectedMateri.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>

              {/* Top Right Quick Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleExtractChapters}
                  disabled={isExtractingChapters}
                  className="p-2 bg-dark-800 hover:bg-dark-750 disabled:opacity-50 text-purple-300 hover:text-purple-200 rounded-xl border border-purple-500/30 transition-colors"
                  title="Ekstrak / Susun Ulang Bab dengan AI"
                >
                  {isExtractingChapters ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    if (confirm('Hapus materi ini?')) {
                      onDeleteMateri(selectedMateri.id);
                      setSelectedMateri(null);
                    }
                  }}
                  className="p-2 bg-dark-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-xl border border-dark-border hover:border-rose-800/40 transition-colors"
                  title="Hapus Materi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {selectedMateri.title}
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
                {selectedMateri.description || selectedMateri.summary.slice(0, 220) + '...'}
              </p>
            </div>

            {/* Quick Action Pills (Matching Screenshot) */}
            <div className="flex items-center gap-2.5 flex-wrap pt-2 border-t border-dark-border/60">
              <button
                onClick={() => onStartQuizFromMateri(selectedMateri)}
                className="px-4 py-2 bg-dark-800 hover:bg-dark-750 text-slate-200 hover:text-white rounded-full text-xs font-semibold border border-dark-border flex items-center gap-2 transition-all hover:border-purple-500/50"
              >
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Flashcards</span>
              </button>

              <button
                onClick={() => onStartQuizFromMateri(selectedMateri)}
                className="px-4 py-2 bg-dark-800 hover:bg-dark-750 text-slate-200 hover:text-white rounded-full text-xs font-semibold border border-dark-border flex items-center gap-2 transition-all hover:border-purple-500/50"
              >
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                <span>Kuis</span>
              </button>

              <button
                onClick={() => setActiveTab(activeTab === 'mindmap' ? 'bab' : 'mindmap')}
                className={`px-4 py-2 rounded-full text-xs font-semibold border flex items-center gap-2 transition-all ${
                  activeTab === 'mindmap'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/30'
                    : 'bg-dark-800 hover:bg-dark-750 text-slate-200 border-dark-border hover:border-purple-500/50'
                }`}
              >
                <GitFork className="w-3.5 h-3.5 text-purple-300" />
                <span>Mind Map</span>
              </button>

              <button
                onClick={() => setActiveTab(activeTab === 'dokumen' ? 'bab' : 'dokumen')}
                className={`px-4 py-2 rounded-full text-xs font-semibold border flex items-center gap-2 transition-all ${
                  activeTab === 'dokumen'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/30'
                    : 'bg-dark-800 hover:bg-dark-750 text-slate-200 border-dark-border hover:border-purple-500/50'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-purple-300" />
                <span>Dokumen Lengkap</span>
              </button>

              {/* Tab Gambar — hanya muncul jika materi punya images */}
              {selectedMateri.images && selectedMateri.images.length > 0 && (
                <button
                  onClick={() => setActiveTab(activeTab === 'gambar' ? 'bab' : 'gambar')}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border flex items-center gap-2 transition-all ${
                    activeTab === 'gambar'
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-900/30'
                      : 'bg-dark-800 hover:bg-dark-750 text-slate-200 border-dark-border hover:border-amber-500/50'
                  }`}
                >
                  <BookMarked className="w-3.5 h-3.5 text-amber-300" />
                  <span>Gambar ({selectedMateri.images.length})</span>
                </button>
              )}

              <button
                onClick={handleShare}
                className="px-4 py-2 bg-dark-800 hover:bg-dark-750 text-slate-200 hover:text-white rounded-full text-xs font-semibold border border-dark-border flex items-center gap-2 transition-all hover:border-purple-500/50"
              >
                {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
                <span>{shareCopied ? 'Tersalin' : 'Bagikan'}</span>
              </button>

              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-dark-800 hover:bg-dark-750 text-slate-200 hover:text-white rounded-full text-xs font-semibold border border-dark-border flex items-center gap-2 transition-all hover:border-purple-500/50"
              >
                <FileDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Ekspor PDF</span>
              </button>

              <button
                onClick={handleSpeakSummary}
                className={`px-4 py-2 rounded-full text-xs font-semibold border flex items-center gap-2 transition-all ${
                  isSpeaking ? 'bg-amber-600 text-white border-amber-500' : 'bg-dark-800 hover:bg-dark-750 text-slate-200 border-dark-border'
                }`}
                title={isSpeaking ? 'Hentikan Audio' : 'Dengarkan Ringkasan'}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-slate-400" />}
                <span>{isSpeaking ? 'Hentikan Audio' : 'Dengarkan'}</span>
              </button>
            </div>
          </div>

          {/* VIEW TAB 1: BAB / SUB-BAB LIST (Screenshot View) */}
          {activeTab === 'bab' && (
            <div className="space-y-4">
              {/* Bab Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white tracking-tight">Bab</h2>
                  <span className="text-xs font-semibold text-slate-400">
                    ({completedChaptersCount} dari {chaptersList.length} Selesai)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingChapter({});
                      setIsEditChapterModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-dark-border flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Bab</span>
                  </button>
                  <button
                    onClick={() => {
                      if (chaptersList.length > 0) {
                        setEditingChapter(chaptersList[0]);
                        setIsEditChapterModalOpen(true);
                      }
                    }}
                    className="px-3 py-1.5 bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-dark-border flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Ubah</span>
                  </button>
                </div>
              </div>

              {/* Chapters List Cards */}
              <div className="space-y-2.5">
                {chaptersList.length > 0 ? (
                  chaptersList.map((chapter) => (
                    <div
                      key={chapter.id}
                      onClick={() => setActiveChapter(chapter)}
                      className={`group flex items-center justify-between p-4 md:p-5 rounded-2xl border transition-all cursor-pointer ${
                        chapter.isCompleted
                          ? 'bg-dark-850/90 border-dark-border hover:border-purple-500/50 hover:bg-dark-800'
                          : 'bg-dark-850 border-dark-border hover:border-purple-500/60 hover:bg-dark-800'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Number Badge */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                          chapter.isCompleted
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-dark-750 text-slate-300 border border-dark-border group-hover:bg-purple-600 group-hover:text-white'
                        }`}>
                          {chapter.number}
                        </div>

                        {/* Title & Summary */}
                        <div className="min-w-0 space-y-0.5">
                          <h3 className="text-sm md:text-base font-semibold text-slate-100 group-hover:text-purple-300 transition-colors truncate">
                            {chapter.title}
                          </h3>
                          {chapter.summary && (
                            <p className="text-xs text-slate-400 line-clamp-1">
                              {chapter.summary}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Action: Completed Checkmark & Duration */}
                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        {chapter.durationMinutes && (
                          <span className="text-[11px] text-slate-500 hidden sm:inline-block">
                            {chapter.durationMinutes} mnt baca
                          </span>
                        )}
                        <button
                          onClick={(e) => handleToggleChapterCompletion(chapter.id, e)}
                          className="p-1 rounded-lg transition-transform hover:scale-110"
                          title={chapter.isCompleted ? 'Tandai belum selesai' : 'Tandai selesai dibaca'}
                        >
                          {chapter.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-dark-850 border border-dark-border rounded-2xl space-y-3">
                    <BookMarked className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-sm font-semibold text-slate-300">Belum ada daftar Bab terstruktur</p>
                    <button
                      onClick={handleExtractChapters}
                      disabled={isExtractingChapters}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-purple-900/30"
                    >
                      {isExtractingChapters ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>Susun Bab Otomatis dengan AI</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW TAB 2: DOKUMEN LENGKAP */}
          {activeTab === 'dokumen' && (
            <div className="bg-dark-850 border border-dark-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-dark-border">
                <h2 className="text-lg font-bold text-white">Ringkasan Dokumen Lengkap</h2>
                <button
                  onClick={handleCopySummary}
                  className="px-3 py-1.5 bg-dark-800 hover:bg-dark-750 text-slate-200 rounded-xl text-xs font-medium border border-dark-border flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Tersalin' : 'Salin Semua Teks'}</span>
                </button>
              </div>

              <div className="prose-custom max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedMateri.summary || selectedMateri.rawContent}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* VIEW TAB 3: MIND MAP CONCEPT NODES */}
          {activeTab === 'mindmap' && (
            <div className="bg-dark-850 border border-dark-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-dark-border">
                <div>
                  <h2 className="text-lg font-bold text-white">Peta Konsep (Mind Map Structure)</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Struktur hierarki materi dan hubungan sub-bab perkuliahan</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chaptersList.map((chapter) => (
                  <div 
                    key={chapter.id}
                    onClick={() => setActiveChapter(chapter)}
                    className="p-5 bg-dark-800 border border-dark-border hover:border-purple-500/50 rounded-2xl space-y-3 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Bab {chapter.number}
                      </span>
                      {chapter.isCompleted && (
                        <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Selesai
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white">{chapter.title}</h3>
                    <p className="text-xs text-slate-400">{chapter.summary}</p>
                    
                    {chapter.keyPoints && chapter.keyPoints.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-dark-border/60">
                        {chapter.keyPoints.map((kp, i) => (
                          <div key={i} className="text-[11px] text-slate-300 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1 flex-shrink-0" />
                            <span>{kp}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW TAB 4: GALERI GAMBAR DOKUMEN */}
          {activeTab === 'gambar' && selectedMateri.images && selectedMateri.images.length > 0 && (
            <ImageGallery images={selectedMateri.images} title={selectedMateri.title} />
          )}

          {/* 2. INTERACTIVE SUB-BAB READER MODAL / DRAWER */}
          {activeChapter && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-dark-900 border border-dark-border rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-scale-in">
                {/* Modal Reader Header */}
                <div className="p-6 border-b border-dark-border flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                        Bab {activeChapter.number} dari {chaptersList.length}
                      </span>
                      <span>•</span>
                      <span>{activeChapter.durationMinutes || 5} menit baca</span>
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-white truncate">
                      {activeChapter.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleChapterCompletion(activeChapter.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                        activeChapter.isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-dark-800 text-slate-300 border-dark-border hover:bg-dark-750'
                      }`}
                    >
                      {activeChapter.isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4" />}
                      <span>{activeChapter.isCompleted ? 'Selesai Dibaca' : 'Tandai Selesai'}</span>
                    </button>

                    <button
                      onClick={() => setActiveChapter(null)}
                      className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-dark-800 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Modal Reader Body */}
                <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
                  {/* Summary Callout */}
                  {activeChapter.summary && (
                    <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-2xl text-xs text-purple-200 leading-relaxed">
                      <strong className="text-purple-300 block mb-1">Rangkuman Singkat:</strong>
                      {activeChapter.summary}
                    </div>
                  )}

                  {/* Chapter Markdown Content */}
                  <div className="prose-custom max-w-none text-slate-200">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {activeChapter.content}
                    </ReactMarkdown>
                  </div>

                  {/* Key Takeaways Box */}
                  {activeChapter.keyPoints && activeChapter.keyPoints.length > 0 && (
                    <div className="p-5 bg-dark-800 border border-dark-border rounded-2xl space-y-2.5">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-purple-400" />
                        <span>Poin Kunci yang Wajib Dipahami</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {activeChapter.keyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Modal Reader Footer Navigation */}
                <div className="p-5 border-t border-dark-border flex items-center justify-between bg-dark-850/50 rounded-b-3xl">
                  <button
                    disabled={activeChapter.number <= 1}
                    onClick={() => {
                      const prevChap = chaptersList.find(c => c.number === activeChapter.number - 1);
                      if (prevChap) setActiveChapter(prevChap);
                    }}
                    className="px-4 py-2 bg-dark-800 hover:bg-dark-750 disabled:opacity-30 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-dark-border transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Bab Sebelumnya</span>
                  </button>

                  <button
                    onClick={() => onStartQuizFromMateri(selectedMateri)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-900/30 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Latihan Soal Bab Ini</span>
                  </button>

                  <button
                    disabled={activeChapter.number >= chaptersList.length}
                    onClick={() => {
                      const nextChap = chaptersList.find(c => c.number === activeChapter.number + 1);
                      if (nextChap) setActiveChapter(nextChap);
                    }}
                    className="px-4 py-2 bg-dark-800 hover:bg-dark-750 disabled:opacity-30 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-dark-border transition-colors"
                  >
                    <span>Bab Selanjutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. EDIT / ADD CHAPTER MODAL */}
          {isEditChapterModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-dark-900 border border-dark-border rounded-3xl w-full max-w-xl p-6 md:p-8 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-dark-border pb-4">
                  <h3 className="text-lg font-bold text-white">
                    {editingChapter?.id ? 'Ubah Bab' : 'Tambah Bab Baru'}
                  </h3>
                  <button
                    onClick={() => setIsEditChapterModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-dark-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveChapterEdit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Judul Bab / Sub-Bab *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingChapter?.title || ''}
                      onChange={(e) => setEditingChapter(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Contoh: Primary Key dan Candidate Key"
                      className="w-full px-4 py-2.5 bg-dark-800 border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Ringkasan Singkat (1-2 kalimat)
                    </label>
                    <input
                      type="text"
                      value={editingChapter?.summary || ''}
                      onChange={(e) => setEditingChapter(prev => ({ ...prev, summary: e.target.value }))}
                      placeholder="Ringkasan poin yang dipelajari..."
                      className="w-full px-4 py-2.5 bg-dark-800 border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Isi Penjelasan Materi (Format Markdown) *
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={editingChapter?.content || ''}
                      onChange={(e) => setEditingChapter(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Tuliskan penjelasan materi lengkap di sini..."
                      className="w-full px-4 py-2.5 bg-dark-800 border border-dark-border rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 leading-relaxed font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-dark-border">
                    {editingChapter?.id ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteChapter(editingChapter.id!)}
                        className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-xl text-xs font-semibold border border-rose-800/40 flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Bab</span>
                      </button>
                    ) : <div />}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditChapterModalOpen(false)}
                        className="px-4 py-2 bg-dark-800 hover:bg-dark-750 text-slate-300 rounded-xl text-xs font-semibold"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-900/30"
                      >
                        Simpan Bab
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
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
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {currentFolder.code || 'Mata Kuliah'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {folderMateriList.length} Catatan Tersimpan
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-0.5">{currentFolder.name}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setTargetFolderId(currentFolder.id);
                  setIsUploadModalOpen(true);
                }}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40 transition-colors"
              >
                <FileUp className="w-4 h-4" />
                <span>Unggah / Tambah Materi</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Hapus mata kuliah "${currentFolder.name}" beserta seluruh materinya?`)) {
                    onDeleteFolder(currentFolder.id);
                    setSelectedFolderId(null);
                  }
                }}
                className="p-2.5 bg-dark-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-xl border border-dark-border hover:border-rose-800/40 transition-colors"
                title="Hapus Mata Kuliah"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid List Materi */}
          {folderMateriList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folderMateriList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedMateri(item)}
                  className="bg-dark-850 border border-dark-border hover:border-purple-500/50 rounded-2xl p-5 space-y-4 cursor-pointer transition-all hover:shadow-lg hover:shadow-purple-950/20 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-2.5 rounded-xl bg-dark-800 text-purple-400 border border-dark-border group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-dark-750 text-slate-300 border border-dark-border">
                      {item.chapters?.length || 0} Bab
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {item.description || item.summary.slice(0, 100)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-dark-border/60 text-[11px] text-slate-400">
                    <span>{new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                    <span className="text-purple-400 font-semibold group-hover:underline">Buka Bab & Materi →</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-dark-850 border border-dark-border rounded-2xl space-y-3">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">Belum ada materi untuk mata kuliah ini</p>
              <button
                onClick={() => {
                  setTargetFolderId(currentFolder.id);
                  setIsUploadModalOpen(true);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Unggah Dokumen PDF / Catatan Pertama</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* 3. ROOT VIEW: ALL FOLDERS / SUBJECTS GRID */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Mata Pelajaran & Ringkasan Materi</h1>
              <p className="text-xs text-slate-400 mt-1">
                Pilih mata kuliah untuk melihat catatan, susunan bab, kuis, dan analisis AI.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsFolderModalOpen(true)}
                className="px-4 py-2.5 bg-dark-800 hover:bg-dark-750 text-slate-200 rounded-xl text-xs font-semibold border border-dark-border flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4 text-purple-400" />
                <span>Tambah Mata Kuliah</span>
              </button>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-950/40 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ringkas Materi AI</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari mata kuliah atau kode matkul..."
              className="w-full pl-10 pr-4 py-2.5 bg-dark-850 border border-dark-border rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Folders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedFolders.map((folder) => {
              const count = materi.filter(m => m.folderId === folder.id).length;
              return (
                <div
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className="bg-dark-850 border border-dark-border hover:border-purple-500/50 rounded-2xl p-5 space-y-4 cursor-pointer transition-all hover:shadow-lg hover:shadow-purple-950/20 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-2xl bg-dark-800 text-purple-400 border border-dark-border group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <FolderIcon className="w-6 h-6" />
                    </div>
                    {folder.code && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-dark-750 text-slate-300 border border-dark-border">
                        {folder.code}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                      {folder.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {folder.description || 'Tidak ada deskripsi mata kuliah.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-dark-border/60 text-xs text-slate-400">
                    <span>{count} Materi / Bab</span>
                    <span className="text-purple-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                      Buka Materi →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-2 bg-dark-800 disabled:opacity-30 rounded-xl text-slate-300 border border-dark-border"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400 px-2">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-2 bg-dark-800 disabled:opacity-30 rounded-xl text-slate-300 border border-dark-border"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. MODAL UNGGAH & RINGKAS MATERI BARU */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-border rounded-3xl w-full max-w-xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-dark-border pb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Ringkas Materi & Susun Bab AI</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-dark-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Folder Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Pilih Mata Kuliah / Folder *
                </label>
                <select
                  value={targetFolderId}
                  onChange={(e) => setTargetFolderId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-border rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name} {f.code ? `(${f.code})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Summary Mode Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Format Ringkasan AI
                </label>
                <select
                  value={summaryMode}
                  onChange={(e) => setSummaryMode(e.target.value as SummaryType)}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-border rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="lengkap">Lengkap & Komprehensif (Rekomendasi)</option>
                  <option value="poin_kunci">Poin-Poin Kunci Saja</option>
                  <option value="rumus_definisi">Fokus Rumus & Definisi</option>
                  <option value="cheatsheet">Cheatsheet Cepat Ujian</option>
                </select>
              </div>

              {/* Upload Type Toggle */}
              <div className="flex rounded-xl bg-dark-800 p-1 border border-dark-border text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setUploadType('file')}
                  className={`flex-1 py-2 rounded-lg transition-colors ${
                    uploadType === 'file' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Unggah Dokumen (PDF, PPTX, DOCX)
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('text')}
                  className={`flex-1 py-2 rounded-lg transition-colors ${
                    uploadType === 'text' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tempel Teks / Catatan Manual
                </button>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Judul Materi (Opsional)
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Contoh: Desain Database Relasional"
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-border rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* File Dropzone or Textarea */}
              {uploadType === 'file' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    File Dokumen Kuliah *
                  </label>
                  <label className="border-2 border-dashed border-dark-border hover:border-purple-500/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-dark-850 transition-colors">
                    <FileUp className="w-8 h-8 text-purple-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      {selectedFile ? selectedFile.name : 'Klik untuk memilih file PDF, PPTX, DOCX, TXT'}
                    </span>
                    <span className="text-[11px] text-slate-400">Maksimal 25 MB</span>
                    <input
                      type="file"
                      accept=".pdf,.pptx,.docx,.txt"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Isi Catatan Kuliah *
                  </label>
                  <textarea
                    rows={6}
                    value={rawTextInput}
                    onChange={(e) => setRawTextInput(e.target.value)}
                    placeholder="Tempel materi kuliah, slide rangkuman, atau catatan dosen Anda di sini..."
                    className="w-full px-4 py-2.5 bg-dark-800 border border-dark-border rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
                  />
                </div>
              )}

              {/* Additional Prompt */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Instruksi Tambahan untuk AI <span className="text-slate-500 font-normal">(Opsional)</span>
                </label>
                <textarea
                  rows={2}
                  value={additionalPrompt}
                  onChange={(e) => setAdditionalPrompt(e.target.value)}
                  placeholder="Contoh: Fokus ke rumus dan teorema saja. Tambahkan contoh soal di tiap bab. Gunakan bahasa yang lebih sederhana..."
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-border rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed resize-none"
                />
              </div>

              {/* Status or loader */}
              {isSummarizing && (
                <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-2xl flex items-center gap-3 text-xs text-purple-200">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400 flex-shrink-0" />
                  <span>{statusMessage || 'Sedang memproses dengan Gemini AI...'}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-dark-border">
                <button
                  type="button"
                  disabled={isSummarizing}
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-dark-800 hover:bg-dark-750 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSummarizing}
                  onClick={handleProcessDocument}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-950/40"
                >
                  {isSummarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Mulai Ringkas & Susun Bab</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL TAMBAH FOLDER MATA KULIAH */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-border rounded-3xl w-full max-w-md p-6 md:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <h3 className="text-lg font-bold text-white">Tambah Mata Kuliah Baru</h3>
              <button
                onClick={() => setIsFolderModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-dark-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Mata Kuliah *
                </label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Contoh: Desain Basis Data"
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-border rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kode Mata Kuliah (Opsional)
                </label>
                <input
                  type="text"
                  value={newFolderCode}
                  onChange={(e) => setNewFolderCode(e.target.value)}
                  placeholder="Contoh: IF2220"
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-border rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Deskripsi / Topik Utama
                </label>
                <input
                  type="text"
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  placeholder="Contoh: SQL, Relasi, Normalisasi 1NF-3NF"
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-border rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-dark-border">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-4 py-2 bg-dark-800 hover:bg-dark-750 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-900/30"
                >
                  Buat Mata Kuliah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
