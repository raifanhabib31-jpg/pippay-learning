import React, { useState } from 'react';
import { 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Calculator, 
  Loader2, 
  FileText 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { SemesterRecord, DailyGradeItem, GradeCategory } from '../../types';
import { geminiService } from '../../services/geminiService';

interface AcademicTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  semesters: SemesterRecord[];
  dailyGrades: DailyGradeItem[];
  onSaveSemesters: (semesters: SemesterRecord[]) => void;
  onSaveDailyGrades: (grades: DailyGradeItem[]) => void;
}

export const AcademicTrackerModal: React.FC<AcademicTrackerModalProps> = ({
  isOpen,
  onClose,
  semesters,
  dailyGrades,
  onSaveSemesters,
  onSaveDailyGrades,
}) => {
  const [activeTab, setActiveTab] = useState<'semesters' | 'daily'>('semesters');

  // Semester editing states
  const [localSemesters, setLocalSemesters] = useState<SemesterRecord[]>(semesters);
  const [selectedSemesterForAi, setSelectedSemesterForAi] = useState<SemesterRecord | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Daily grades states
  const [localDailyGrades, setLocalDailyGrades] = useState<DailyGradeItem[]>(dailyGrades);
  const [isAddGradeOpen, setIsAddGradeOpen] = useState(false);
  const [courseFilter, setCourseFilter] = useState<string>('all');

  // New grade form
  const [newCourseName, setNewCourseName] = useState('');
  const [newCategory, setNewCategory] = useState<GradeCategory>('tugas');
  const [newTitle, setNewTitle] = useState('');
  const [newScore, setNewScore] = useState<number>(90);
  const [newWeight, setNewWeight] = useState<number>(15);
  const [newNotes, setNewNotes] = useState('');

  if (!isOpen) return null;

  // Calculate Cumulative IPK
  const completedSemesters = localSemesters.filter(s => (s.status === 'completed' || s.status === 'active') && s.ips > 0);
  const totalSksCompleted = completedSemesters.reduce((acc, s) => acc + s.sks, 0);
  const totalSksPoints = completedSemesters.reduce((acc, s) => acc + (s.ips * s.sks), 0);
  const currentIpk = totalSksCompleted > 0 ? (totalSksPoints / totalSksCompleted).toFixed(2) : '0.00';

  const handleUpdateSemester = (idx: number, field: keyof SemesterRecord, value: any) => {
    const updated = [...localSemesters];
    updated[idx] = { ...updated[idx], [field]: value };
    setLocalSemesters(updated);
    onSaveSemesters(updated);
  };

  const handleGenerateAiEvaluation = async (s: SemesterRecord) => {
    setAiLoading(true);
    setSelectedSemesterForAi(s);

    try {
      const evaluation = await geminiService.generateAcademicEvaluation(
        s.semester,
        s.ips,
        s.sks,
        s.notes
      );

      const updated = localSemesters.map(item => 
        item.semester === s.semester ? { ...item, aiEvaluation: evaluation } : item
      );
      setLocalSemesters(updated);
      onSaveSemesters(updated);
      setSelectedSemesterForAi({ ...s, aiEvaluation: evaluation });
    } catch (e: any) {
      alert('Gagal menghasilkan evaluasi AI: ' + e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddDailyGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim() || !newTitle.trim()) return;

    const newItem: DailyGradeItem = {
      id: 'dg-' + Date.now(),
      courseName: newCourseName.trim(),
      category: newCategory,
      title: newTitle.trim(),
      score: Number(newScore),
      maxScore: 100,
      weight: Number(newWeight),
      date: new Date().toISOString().split('T')[0],
      notes: newNotes.trim() || undefined,
    };

    const updated = [newItem, ...localDailyGrades];
    setLocalDailyGrades(updated);
    onSaveDailyGrades(updated);

    // Reset form
    setIsAddGradeOpen(false);
    setNewTitle('');
    setNewNotes('');
  };

  const handleDeleteDailyGrade = (id: string) => {
    const updated = localDailyGrades.filter(g => g.id !== id);
    setLocalDailyGrades(updated);
    onSaveDailyGrades(updated);
  };

  const uniqueCourses = Array.from(new Set(localDailyGrades.map(g => g.courseName)));
  const filteredGrades = localDailyGrades.filter(g => courseFilter === 'all' ? true : g.courseName === courseFilter);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-dark-850 border border-dark-border rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col text-slate-100 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-orange/15 border border-accent-orange/30 flex items-center justify-center text-accent-orange shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Tracker Akademik & IPK / IPS</h2>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Semester 1 – 10
                </span>
              </div>
              <p className="text-xs text-slate-400">Pantau indeks prestasi, evaluasi cerdas AI, dan tracker nilai harian tugas.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* IPK Summary Badge */}
            <div className="px-4 py-2 bg-dark-800 rounded-xl border border-dark-border flex items-center gap-3">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">IPK Kumulatif</div>
                <div className="text-lg font-bold text-accent-orange leading-tight">{currentIpk}</div>
              </div>
              <div className="h-6 w-px bg-dark-border"></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Total SKS</div>
                <div className="text-lg font-bold text-white leading-tight">{totalSksCompleted}</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-750 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex border-b border-dark-border bg-dark-900 px-5 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('semesters')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-colors ${
              activeTab === 'semesters'
                ? 'border-accent-orange text-accent-orange bg-dark-850'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Rekap IPS & IPK (Semester 1–10)</span>
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-colors ${
              activeTab === 'daily'
                ? 'border-purple-400 text-purple-300 bg-dark-850'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Tracker Nilai Harian (Tugas, Kuis, UTS)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {activeTab === 'semesters' ? (
            <div className="space-y-5">
              {/* Semester 1 to 10 Table */}
              <div className="bg-dark-900 border border-dark-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-dark-800 text-slate-300 font-semibold border-b border-dark-border">
                      <tr>
                        <th className="p-3.5">Semester</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Beban SKS</th>
                        <th className="p-3.5">IPS (0 - 4.00)</th>
                        <th className="p-3.5">Keterangan / Mata Kuliah Inti</th>
                        <th className="p-3.5 text-right">Evaluasi AI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border">
                      {localSemesters.map((s, idx) => {
                        const isUnderTarget = s.status === 'completed' && s.ips < 3.50 && s.ips > 0;
                        return (
                          <tr 
                            key={s.semester} 
                            className={`hover:bg-dark-850/60 transition-colors ${
                              isUnderTarget ? 'bg-amber-950/20' : ''
                            }`}
                          >
                            <td className="p-3.5 font-bold text-white whitespace-nowrap">
                              Semester {s.semester}
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              <select
                                value={s.status}
                                onChange={(e) => handleUpdateSemester(idx, 'status', e.target.value)}
                                className="bg-dark-800 border border-dark-border rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                              >
                                <option value="completed">Selesai (Completed)</option>
                                <option value="active">Sedang Berjalan (Active)</option>
                                <option value="planned">Direncanakan (Planned)</option>
                              </select>
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              <input
                                type="number"
                                min={0}
                                max={24}
                                value={s.sks}
                                onChange={(e) => handleUpdateSemester(idx, 'sks', Number(e.target.value))}
                                className="w-16 bg-dark-800 border border-dark-border rounded-lg px-2 py-1 text-xs text-slate-200 text-center focus:outline-none focus:border-purple-500"
                              />
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  max={4}
                                  value={s.ips}
                                  onChange={(e) => handleUpdateSemester(idx, 'ips', Number(e.target.value))}
                                  className={`w-20 font-bold border rounded-lg px-2.5 py-1 text-xs text-center focus:outline-none ${
                                    isUnderTarget 
                                      ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                                      : 'bg-dark-800 border-dark-border text-white focus:border-purple-500'
                                  }`}
                                />
                                {isUnderTarget && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>&lt; 3.50</span>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3.5 min-w-[200px]">
                              <input
                                type="text"
                                placeholder="Mata kuliah tersulit / target IP"
                                value={s.notes || ''}
                                onChange={(e) => handleUpdateSemester(idx, 'notes', e.target.value)}
                                className="w-full bg-dark-800 border border-dark-border rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                              />
                            </td>
                            <td className="p-3.5 text-right whitespace-nowrap">
                              {isUnderTarget ? (
                                <button
                                  onClick={() => handleGenerateAiEvaluation(s)}
                                  disabled={aiLoading}
                                  className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-accent-orange hover:from-amber-500 hover:to-accent-orangeHover text-white rounded-lg font-bold text-[11px] shadow-md flex items-center gap-1.5 ml-auto transition-all transform active:scale-95"
                                >
                                  {aiLoading && selectedSemesterForAi?.semester === s.semester ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-3.5 h-3.5" />
                                  )}
                                  <span>{s.aiEvaluation ? 'Lihat Evaluasi AI' : 'Minta Evaluasi AI'}</span>
                                </button>
                              ) : s.ips >= 3.50 && s.status === 'completed' ? (
                                <span className="text-[11px] font-semibold text-emerald-400 flex items-center justify-end gap-1">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Memenuhi Standar</span>
                                </span>
                              ) : (
                                <span className="text-slate-500 text-[11px]">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Active AI Evaluation Panel if selected */}
              {selectedSemesterForAi && selectedSemesterForAi.aiEvaluation && (
                <div className="bg-dark-850 border border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-dark-border">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-sm text-white">
                        Rencana Perbaikan & Evaluasi AI (Semester {selectedSemesterForAi.semester} - IPS {selectedSemesterForAi.ips.toFixed(2)})
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedSemesterForAi(null)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Tutup
                    </button>
                  </div>
                  <div className="prose-custom text-xs">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedSemesterForAi.aiEvaluation}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Daily Grades Tracker */
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-400">Filter Mata Kuliah:</span>
                  <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="bg-dark-800 border border-dark-border rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">Semua Mata Kuliah ({localDailyGrades.length} nilai)</option>
                    {uniqueCourses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setIsAddGradeOpen(true)}
                  className="px-4 py-2 bg-accent-orange hover:bg-accent-orangeHover text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Nilai Harian</span>
                </button>
              </div>

              {/* Add Grade Form Modal/Drawer */}
              {isAddGradeOpen && (
                <form onSubmit={handleAddDailyGrade} className="bg-dark-900 border border-purple-500/40 rounded-2xl p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between pb-2 border-b border-dark-border">
                    <h4 className="font-bold text-xs text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-accent-orange" />
                      <span>Input Nilai Tugas / Kuis / Praktikum</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddGradeOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Nama Mata Kuliah *</label>
                      <input
                        type="text"
                        placeholder="Contoh: Basis Data, Struktur Data"
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        className="w-full bg-dark-800 border border-dark-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Kategori Nilai</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as GradeCategory)}
                        className="w-full bg-dark-800 border border-dark-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      >
                        <option value="tugas">Tugas Kuliah</option>
                        <option value="kuis">Kuis Mingguan</option>
                        <option value="praktikum">Praktikum / Lab</option>
                        <option value="proyek">Proyek Akhir</option>
                        <option value="uts">Ujian Tengah Semester (UTS)</option>
                        <option value="uas">Ujian Akhir Semester (UAS)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Judul / Deskripsi Tugas *</label>
                      <input
                        type="text"
                        placeholder="Contoh: Tugas 1 - Normalisasi & Indexing"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-dark-800 border border-dark-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Nilai (0 - 100) *</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={newScore}
                          onChange={(e) => setNewScore(Number(e.target.value))}
                          className="w-full bg-dark-800 border border-dark-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 text-center font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Bobot Nilai (%)</label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={newWeight}
                          onChange={(e) => setNewWeight(Number(e.target.value))}
                          className="w-full bg-dark-800 border border-dark-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-dark-border">
                    <button
                      type="button"
                      onClick={() => setIsAddGradeOpen(false)}
                      className="px-4 py-2 bg-dark-800 hover:bg-dark-750 text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-accent-orange hover:bg-accent-orangeHover text-white rounded-xl text-xs font-bold shadow-md"
                    >
                      Simpan Nilai
                    </button>
                  </div>
                </form>
              )}

              {/* Daily Grades Grid */}
              {filteredGrades.length === 0 ? (
                <div className="border border-dashed border-dark-border rounded-2xl p-8 text-center text-xs text-slate-400 space-y-2">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                  <p>Belum ada nilai harian tercatat.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredGrades.map((g) => (
                    <div
                      key={g.id}
                      className="p-4 bg-dark-900 border border-dark-border hover:border-purple-500/40 rounded-2xl flex flex-col justify-between shadow-sm space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {g.category} • Bobot {g.weight}%
                          </span>
                          <span className="text-xs text-slate-500">{g.date}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{g.title}</h4>
                        <p className="text-xs text-accent-orange font-semibold">{g.courseName}</p>
                        {g.notes && (
                          <p className="text-[11px] text-slate-400 bg-dark-850 p-2 rounded-lg border border-dark-border/60">
                            {g.notes}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-dark-border flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-xl font-bold ${
                            g.score >= 85 ? 'text-emerald-400' : g.score >= 70 ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {g.score}
                          </span>
                          <span className="text-xs text-slate-500">/ 100</span>
                        </div>

                        <button
                          onClick={() => handleDeleteDailyGrade(g.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-dark-800 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
