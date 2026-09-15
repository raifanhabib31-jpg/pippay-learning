import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles as SparklesIcon, 
  Play as PlayIcon, 
  CheckCircle2 as CheckCircleIcon, 
  XCircle as XCircleIcon, 
  Clock as ClockIcon, 
  Award as AwardIcon, 
  ArrowRight as ArrowRightIcon, 
  ArrowLeft as ArrowLeftIcon, 
  RotateCcw as RotateCcwIcon, 
  Loader2 as Loader2Icon, 
  Brain as BrainIcon, 
  History as HistoryIcon,
  Zap
} from 'lucide-react';
import type { Folder, Materi, Soal, QuestionType, QuizResult } from '../../types';
import { geminiService } from '../../services/geminiService';

interface LatihanSoalManagerProps {
  folders: Folder[];
  materi: Materi[];
  initialContent?: string;
  initialTitle?: string;
  quizResults: QuizResult[];
  onSaveQuizResult: (result: QuizResult) => void;
}

export const LatihanSoalManager: React.FC<LatihanSoalManagerProps> = ({
  folders,
  materi,
  initialContent,
  initialTitle,
  quizResults,
  onSaveQuizResult,
}) => {
  // Generator form state
  const [selectedFolderId, setSelectedFolderId] = useState<string>(folders[0]?.id || '');
  const [selectedMateriId, setSelectedMateriId] = useState<string>('');
  const [questionType, setQuestionType] = useState<QuestionType>('mcq');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [customSourceText, setCustomSourceText] = useState(initialContent || '');
  const [quizTitle, setQuizTitle] = useState(initialTitle || '');
  const [isGenerating, setIsGenerating] = useState(false);

  // Active Quiz Playing state
  const [activeQuestions, setActiveQuestions] = useState<Soal[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, any>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false); // for flashcard mode

  // Filter materials for selected folder
  const availableMateri = materi.filter(m => m.folderId === selectedFolderId);

  // Update initial content if provided from outside
  useEffect(() => {
    if (initialContent) {
      setCustomSourceText(initialContent);
    }
    if (initialTitle) {
      setQuizTitle(initialTitle);
    }
  }, [initialContent, initialTitle]);

  // Timer effect
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && !quizFinished) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, quizFinished]);

  const handleGenerateQuiz = async () => {
    let sourceContent = customSourceText.trim();

    if (!sourceContent && selectedMateriId) {
      const found = materi.find(m => m.id === selectedMateriId);
      if (found) {
        sourceContent = found.summary || found.rawContent;
      }
    } else if (!sourceContent && availableMateri.length > 0) {
      sourceContent = availableMateri.map(m => m.summary).join('\n\n');
    }

    if (!sourceContent) {
      alert('Silakan pilih materi atau masukkan teks sumber latihan soal.');
      return;
    }

    setIsGenerating(true);

    try {
      const courseName = folders.find(f => f.id === selectedFolderId)?.name;
      const questions = await geminiService.generateQuestions(
        sourceContent,
        questionCount,
        questionType,
        courseName
      );

      if (!questions || questions.length === 0) {
        throw new Error('Tidak ada soal yang berhasil dibuat.');
      }

      setActiveQuestions(questions);
      setCurrentIdx(0);
      setSelectedAnswers({});
      setShowExplanation({});
      setQuizFinished(false);
      setTimerSeconds(0);
      setIsTimerRunning(true);
      setIsFlipped(false);
    } catch (err: any) {
      alert('Gagal membuat soal latihan: ' + (err.message || 'Pastikan API Key terhubung di Pengaturan'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (optionIdx: number) => {
    if (selectedAnswers[currentIdx] !== undefined) return; // already answered

    setSelectedAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));
    setShowExplanation(prev => ({ ...prev, [currentIdx]: true }));
  };

  const handleFinishQuiz = () => {
    setIsTimerRunning(false);
    setQuizFinished(true);

    // Calculate score
    let correct = 0;
    activeQuestions.forEach((q, idx) => {
      if (q.type === 'mcq') {
        if (selectedAnswers[idx] === q.correctAnswer) {
          correct++;
        }
      } else {
        correct++;
      }
    });

    const scorePercentage = Math.round((correct / activeQuestions.length) * 100);

    // Save result
    const resultItem: QuizResult = {
      id: 'quiz-res-' + Date.now(),
      title: quizTitle || `Kuis: ${folders.find(f => f.id === selectedFolderId)?.name || 'Latihan Soal'}`,
      folderId: selectedFolderId,
      totalQuestions: activeQuestions.length,
      correctCount: correct,
      score: scorePercentage,
      userAnswers: selectedAnswers,
      questions: activeQuestions,
      completedAt: new Date().toISOString(),
    };

    onSaveQuizResult(resultItem);

    if (scorePercentage >= 70) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-purple-100 via-indigo-50 to-purple-50 dark:from-[#241a38] dark:via-[#1a1828] dark:to-dark-850 border border-purple-200/80 dark:border-purple-900/30 p-6 md:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-200/60 dark:bg-purple-500/20 text-purple-900 dark:text-purple-300 border border-purple-300/60 dark:border-purple-500/30">
            <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>AI Quiz Generator</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-purple-950 dark:text-purple-100 tracking-tight">
            Latihan Soal & Kuis Interaktif
          </h1>
          <p className="text-xs md:text-sm text-purple-900/80 dark:text-purple-200/70 max-w-xl">
            Uji pemahaman modul kuliahmu secara mandiri dengan kuis otomatis (Pilihan Ganda, Flashcard, & Uraian) berbasis Gemini AI.
          </p>
        </div>

        {activeQuestions.length > 0 && !quizFinished && (
          <div className="flex items-center gap-3 relative z-10">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/80 dark:bg-dark-900/90 rounded-2xl text-xs font-mono font-bold text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-dark-border shadow-xs">
              <ClockIcon className="w-4 h-4 text-accent-orange animate-pulse" />
              <span>{formatTimer(timerSeconds)}</span>
            </div>
            <button
              onClick={() => {
                if (confirm('Keluar dari kuis yang sedang berjalan?')) {
                  setActiveQuestions([]);
                  setIsTimerRunning(false);
                }
              }}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
            >
              Hentikan Kuis
            </button>
          </div>
        )}
      </div>

      {activeQuestions.length === 0 ? (
        /* Setup / Generator Screen */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Generator Config Card */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-border rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-dark-border">
              <SparklesIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Racik Soal Latihan Baru</h3>
            </div>

            {/* Folder / Course */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Pilih Mata Kuliah
              </label>
              <select
                value={selectedFolderId}
                onChange={(e) => {
                  setSelectedFolderId(e.target.value);
                  setSelectedMateriId('');
                }}
                disabled={isGenerating}
                className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-dark-border focus:outline-hidden focus:ring-2 focus:ring-purple-500/40 bg-slate-100 dark:bg-dark-800 text-slate-800 dark:text-slate-200"
              >
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name} {f.code ? `(${f.code})` : ''}</option>
                ))}
              </select>
            </div>

            {/* Specific Materi (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Pilih Catatan Materi Khusus (Opsional)
              </label>
              <select
                value={selectedMateriId}
                onChange={(e) => setSelectedMateriId(e.target.value)}
                disabled={isGenerating}
                className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-dark-border focus:outline-hidden focus:ring-2 focus:ring-purple-500/40 bg-slate-100 dark:bg-dark-800 text-slate-800 dark:text-slate-200"
              >
                <option value="">Semua materi dalam folder ini ({availableMateri.length} dokumen)</option>
                {availableMateri.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>

            {/* Custom Source Text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Atau Tempelkan Kisi-Kisi / Catatan Khusus
              </label>
              <textarea
                rows={4}
                placeholder="Tempel teks spesifik untuk dijadikan soal kuis..."
                value={customSourceText}
                onChange={(e) => setCustomSourceText(e.target.value)}
                disabled={isGenerating}
                className="w-full p-3 text-xs rounded-2xl border border-slate-200 dark:border-dark-border focus:outline-hidden focus:ring-2 focus:ring-purple-500/40 bg-slate-100 dark:bg-dark-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 font-mono"
              />
            </div>

            {/* Question Type & Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tipe Latihan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'mcq', label: 'Pilihan Ganda' },
                    { id: 'flashcard', label: 'Flashcard' },
                    { id: 'essay', label: 'Uraian' },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setQuestionType(t.id as QuestionType)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition-colors ${
                        questionType === t.id
                          ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/25'
                          : 'bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-dark-border hover:bg-slate-200 dark:hover:bg-dark-750'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jumlah Soal
                </label>
                <div className="flex gap-2">
                  {[3, 5, 10].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border text-center transition-colors ${
                        questionCount === cnt
                          ? 'bg-accent-orange text-white border-accent-orange shadow-md shadow-orange-950/20'
                          : 'bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-dark-border hover:bg-slate-200 dark:hover:bg-dark-750'
                      }`}
                    >
                      {cnt} Soal
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Action Button */}
            <div className="pt-3">
              <button
                onClick={handleGenerateQuiz}
                disabled={isGenerating}
                className="w-full py-3.5 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 transform active:scale-95 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                    <span>Gemini AI Sedang Meracik Soal...</span>
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-4 h-4" />
                    <span>Mulai Kuis Latihan AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Past Quiz Results Sidecard */}
          <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-border rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-dark-border">
                <HistoryIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Riwayat Skor Latihan</h3>
              </div>

              {quizResults.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                  <AwardIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p>Belum ada riwayat kuis.</p>
                  <p className="text-[11px] text-slate-400">Hasil latihan Anda akan tersimpan di sini.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-dark-border mt-2 max-h-96 overflow-y-auto pr-1">
                  {quizResults.map((r) => (
                    <div key={r.id} className="py-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-white truncate max-w-[160px]">{r.title}</span>
                        <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                          r.score >= 80 
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30' 
                            : r.score >= 60 
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                            : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                        }`}>
                          {r.score}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{r.correctCount}/{r.totalQuestions} Benar</span>
                        <span>{new Date(r.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : quizFinished ? (
        /* Quiz Summary Screen */
        <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-border rounded-3xl p-8 shadow-xs text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-orange-100 dark:bg-accent-orange/15 border border-orange-200 dark:border-accent-orange/30 flex items-center justify-center text-accent-orange mx-auto shadow-inner">
            <AwardIcon className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Sesi Kuis Selesai!</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {quizTitle || 'Latihan Soal AI'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-5 bg-slate-50 dark:bg-dark-800 rounded-3xl border border-slate-200 dark:border-dark-border text-center">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Skor</div>
              <div className="text-3xl font-extrabold text-accent-orange mt-1">
                {Math.round((Object.values(selectedAnswers).filter((ans, idx) => ans === activeQuestions[idx]?.correctAnswer).length / activeQuestions.length) * 100)}%
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Benar</div>
              <div className="text-3xl font-extrabold text-emerald-500 dark:text-emerald-400 mt-1">
                {Object.values(selectedAnswers).filter((ans, idx) => ans === activeQuestions[idx]?.correctAnswer).length} / {activeQuestions.length}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Waktu</div>
              <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-300 mt-1 font-mono">
                {formatTimer(timerSeconds)}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => setActiveQuestions([])}
              className="px-6 py-2.5 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold border border-slate-200 dark:border-dark-border transition-colors"
            >
              Kembali ke Menu
            </button>
            <button
              onClick={handleGenerateQuiz}
              className="px-6 py-2.5 bg-accent-orange hover:bg-accent-orangeHover text-white rounded-2xl text-xs font-bold shadow-lg shadow-orange-950/20 transition-colors flex items-center gap-2"
            >
              <RotateCcwIcon className="w-4 h-4" />
              <span>Coba Kuis Lain</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Quiz Question Screen */
        <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-border rounded-3xl p-6 md:p-8 shadow-xs space-y-6 max-w-3xl mx-auto">
          {/* Top Progress */}
          <div className="flex items-center justify-between text-xs pb-4 border-b border-slate-100 dark:border-dark-border">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Soal {currentIdx + 1} dari {activeQuestions.length}
            </span>
            <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 uppercase px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30">
              {activeQuestions[currentIdx]?.type.toUpperCase()}
            </span>
          </div>

          {/* Question Text */}
          <div className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
            {activeQuestions[currentIdx]?.question}
          </div>

          {/* Multiple Choice Options */}
          {activeQuestions[currentIdx]?.type === 'mcq' && activeQuestions[currentIdx]?.options && (
            <div className="space-y-3">
              {activeQuestions[currentIdx].options!.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentIdx] === optIdx;
                const isCorrect = activeQuestions[currentIdx].correctAnswer === optIdx;
                const hasAnswered = selectedAnswers[currentIdx] !== undefined;

                let optionStyle = 'bg-slate-50 dark:bg-dark-800 border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-300 hover:border-purple-500/60 hover:bg-purple-50/50 dark:hover:bg-dark-750';
                if (hasAnswered) {
                  if (isCorrect) {
                    optionStyle = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-200';
                  } else if (isSelected && !isCorrect) {
                    optionStyle = 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-800 dark:text-rose-200';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectAnswer(optIdx)}
                    disabled={hasAnswered}
                    className={`w-full p-4 rounded-2xl border text-left text-xs md:text-sm font-medium transition-all flex items-start gap-3 ${optionStyle}`}
                  >
                    <span className="w-6 h-6 rounded-xl bg-slate-200 dark:bg-dark-750 flex items-center justify-center font-bold text-xs shrink-0 text-slate-700 dark:text-slate-300">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="flex-1 mt-0.5">{opt}</span>
                    {hasAnswered && isCorrect && <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />}
                    {hasAnswered && isSelected && !isCorrect && <XCircleIcon className="w-5 h-5 text-rose-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Flashcard / Essay View */}
          {activeQuestions[currentIdx]?.type !== 'mcq' && (
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="p-8 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-3xl text-center cursor-pointer hover:border-purple-500/50 transition-all space-y-3"
            >
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isFlipped ? 'Kunci Jawaban / Penjelasan' : 'Klik kartu untuk melihat jawaban'}
              </div>
              <div className="text-sm font-semibold text-purple-700 dark:text-purple-200">
                {isFlipped ? activeQuestions[currentIdx].explanation : 'Pikirkan jawabannya, lalu klik kartu ini.'}
              </div>
            </div>
          )}

          {/* Explanation Banner */}
          {showExplanation[currentIdx] && activeQuestions[currentIdx]?.explanation && (
            <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 rounded-2xl space-y-1 text-xs text-slate-700 dark:text-slate-300">
              <div className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <BrainIcon className="w-4 h-4" />
                <span>Pembahasan AI:</span>
              </div>
              <p className="leading-relaxed">{activeQuestions[currentIdx].explanation}</p>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-dark-border">
            <button
              disabled={currentIdx === 0}
              onClick={() => {
                setCurrentIdx(prev => Math.max(0, prev - 1));
                setIsFlipped(false);
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-750 disabled:opacity-30 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            {currentIdx < activeQuestions.length - 1 ? (
              <button
                onClick={() => {
                  setCurrentIdx(prev => prev + 1);
                  setIsFlipped(false);
                }}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-colors"
              >
                <span>Selanjutnya</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinishQuiz}
                className="px-6 py-2.5 bg-accent-orange hover:bg-accent-orangeHover text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-950/20 transition-colors"
              >
                Selesaikan Kuis
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
