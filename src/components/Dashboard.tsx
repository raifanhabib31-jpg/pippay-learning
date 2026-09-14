import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Plus, 
  ArrowRight, 
  Mail, 
  FileText, 
  Target, 
  Trophy, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  Calculator 
} from 'lucide-react';
import type { 
  Folder, 
  Materi, 
  KisiKisiItem, 
  QuizResult, 
  Jadwal, 
  TabType, 
  AppSettings, 
  SemesterRecord, 
  DailyGradeItem 
} from '../types';
import { AcademicTrackerModal } from './Academic/AcademicTrackerModal';

interface DashboardProps {
  folders: Folder[];
  materi: Materi[];
  kisiKisi: KisiKisiItem[];
  quizResults?: QuizResult[];
  jadwal: Jadwal[];
  settings: AppSettings;
  semesters: SemesterRecord[];
  dailyGrades: DailyGradeItem[];
  onSaveSemesters: (semesters: SemesterRecord[]) => void;
  onSaveDailyGrades: (grades: DailyGradeItem[]) => void;
  setActiveTab: (tab: TabType) => void;
  onOpenFolder?: (folderId: string) => void;
  onSelectMateri: (materi: Materi) => void;
  onSendEmailReminder: (jadwal: Jadwal) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  folders,
  materi,
  kisiKisi,
  jadwal,
  settings,
  semesters,
  dailyGrades,
  onSaveSemesters,
  onSaveDailyGrades,
  setActiveTab,
  onSelectMateri,
  onSendEmailReminder,
}) => {
  const [activeAgendaFilter, setActiveAgendaFilter] = useState<'all' | 'ujian' | 'lomba' | 'organisasi'>('all');
  const [isAcademicModalOpen, setIsAcademicModalOpen] = useState(false);

  // Calculate Cumulative IPK
  const completedSemesters = semesters.filter(s => (s.status === 'completed' || s.status === 'active') && s.ips > 0);
  const totalSksCompleted = completedSemesters.reduce((acc, s) => acc + s.sks, 0);
  const totalSksPoints = completedSemesters.reduce((acc, s) => acc + (s.ips * s.sks), 0);
  const currentIpk = totalSksCompleted > 0 ? (totalSksPoints / totalSksCompleted).toFixed(2) : '0.00';

  // Check if any semester has IPS < 3.5
  const underTargetSemesters = semesters.filter(s => s.status === 'completed' && s.ips < 3.50 && s.ips > 0);
  const hasIpsUnderTarget = underTargetSemesters.length > 0;

  // Sort upcoming schedules by date
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingJadwal = [...jadwal]
    .filter(j => j.date >= todayStr)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const filteredUpcoming = activeAgendaFilter === 'all' 
    ? upcomingJadwal 
    : upcomingJadwal.filter(j => j.type === activeAgendaFilter);

  const upcomingExams = upcomingJadwal.filter(j => j.type === 'ujian');
  const upcomingLomba = upcomingJadwal.filter(j => j.type === 'lomba');
  const upcomingOrg = upcomingJadwal.filter(j => j.type === 'organisasi');
  const recentMateri = [...materi].reverse().slice(0, 4);

  // Helper for countdown
  const getDaysRemaining = (dateStr: string) => {
    const target = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hari ini!';
    if (diffDays === 1) return 'Besok';
    if (diffDays < 0) return 'Terlewat';
    return `${diffDays} hari lagi`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome Card */}
      <div className="bg-dark-850 border border-dark-border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow background accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-orange animate-pulse"></span>
              Workspace Belajar AI Aktif
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-accent-orange/15 text-accent-orange border border-accent-orange/30">
              <Award className="w-3.5 h-3.5" />
              <span>{settings.userTitle || 'Mahasiswa Berprestasi'}</span>
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Selamat Datang, {settings.userName || 'Alex Pratama'}
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {settings.userBio || 'Ringkas modul kuliah, evaluasi target IPK/IPS Semester 1-10, pantau tugas & lomba, serta analisis kisi-kisi ujian dengan Gemini AI.'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap md:flex-col gap-2.5 relative z-10 shrink-0">
          <button
            onClick={() => setActiveTab('materi')}
            className="flex items-center justify-center gap-2 bg-accent-orange hover:bg-accent-orangeHover text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-orange-950/40 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Ringkas Materi Baru</span>
          </button>
          <button
            onClick={() => setIsAcademicModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-purple-950/40 transition-all transform active:scale-95"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Tracker IPK/IPS & Nilai</span>
          </button>
        </div>
      </div>

      {/* Academic Performance Widget (IPK / IPS Tracker Semester 1 - 10) */}
      <div className="bg-dark-850 border border-dark-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-dark-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Target & Performa IPK / IPS</h3>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Semester 1 – 10
                </span>
              </div>
              <p className="text-xs text-slate-400">Kalkulator otomatis SKS, indeks prestasi, dan evaluasi cerdas AI.</p>
            </div>
          </div>

          <button
            onClick={() => setIsAcademicModalOpen(true)}
            className="px-4 py-2 bg-dark-800 hover:bg-dark-750 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-dark-border flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Calculator className="w-3.5 h-3.5 text-accent-orange" />
            <span>Kelola Nilai & Semester →</span>
          </button>
        </div>

        {/* IPK Gauge & Semester 1-10 Pills */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
          {/* IPK Score Card */}
          <div className="p-4 bg-dark-900 rounded-xl border border-dark-border flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">IPK Kumulatif Saat Ini</div>
              <div className="text-3xl font-bold text-accent-orange mt-0.5">{currentIpk}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {Number(currentIpk) >= 3.50 ? 'Jalur Cumlaude (Sangat Memuaskan)' : 'Perlu Peningkatan Strategi'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">SKS Lulus</div>
              <div className="text-xl font-bold text-white mt-0.5">{totalSksCompleted}</div>
              <div className="text-[10px] text-purple-300 font-mono">dari ~144 SKS</div>
            </div>
          </div>

          {/* Semester 1 to 10 Visual Bars */}
          <div className="lg:col-span-3 grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {semesters.map((s) => {
              const isBelow = s.status === 'completed' && s.ips < 3.50 && s.ips > 0;
              const isCompleted = s.status === 'completed' && s.ips >= 3.50;
              const isActive = s.status === 'active';

              return (
                <div
                  key={s.semester}
                  onClick={() => setIsAcademicModalOpen(true)}
                  className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                    isBelow
                      ? 'bg-amber-950/40 border-amber-500/60 hover:bg-amber-950/60'
                      : isCompleted
                      ? 'bg-emerald-950/30 border-emerald-500/40 hover:bg-emerald-950/50'
                      : isActive
                      ? 'bg-purple-950/40 border-purple-500 hover:bg-purple-950/60'
                      : 'bg-dark-900 border-dark-border opacity-50 hover:opacity-100'
                  }`}
                  title={`Semester ${s.semester}: IPS ${s.ips.toFixed(2)} (${s.sks} SKS)`}
                >
                  <div className="text-[10px] font-bold text-slate-400">S{s.semester}</div>
                  <div className={`text-xs font-bold mt-1 ${
                    isBelow ? 'text-amber-400 font-extrabold' : isCompleted ? 'text-emerald-400' : isActive ? 'text-purple-300' : 'text-slate-500'
                  }`}>
                    {s.ips > 0 ? s.ips.toFixed(2) : '-'}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">{s.sks}sks</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Evaluation Banner if IPS < 3.5 */}
        {hasIpsUnderTarget && (
          <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-amber-300">
                  Peringatan Akademik: Terdapat Semester dengan IPS &lt; 3.50 ({underTargetSemesters.map(s => `Semester ${s.semester} = ${s.ips.toFixed(2)}`).join(', ')})
                </div>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  AI telah menyiapkan rencana evaluasi & strategi pemulihan jam belajar untuk menaikkan kembali IPK Anda.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAcademicModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-accent-orange hover:from-amber-500 hover:to-accent-orangeHover text-white rounded-lg font-bold text-[11px] shadow-md flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Buka Evaluasi AI</span>
            </button>
          </div>
        )}
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveTab('materi')}
          className="bg-dark-850 hover:bg-dark-800 border border-dark-border hover:border-purple-500/50 rounded-2xl p-5 cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Mata Pelajaran</span>
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{folders.length}</span>
            <span className="text-xs text-slate-400">folder kuliah</span>
          </div>
          <p className="text-[11px] text-purple-300 mt-1">{materi.length} dokumen tersimpan</p>
        </div>

        <div 
          onClick={() => setIsAcademicModalOpen(true)}
          className="bg-dark-850 hover:bg-dark-800 border border-dark-border hover:border-emerald-500/50 rounded-2xl p-5 cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Nilai Harian (Tugas)</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:scale-105 transition-transform">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">{dailyGrades.length}</span>
            <span className="text-xs text-slate-400">tugas dinilai</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">
            Rata-rata: {dailyGrades.length > 0 ? (dailyGrades.reduce((acc, g) => acc + g.score, 0) / dailyGrades.length).toFixed(1) : 0}/100
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('jadwal')}
          className="bg-dark-850 hover:bg-dark-800 border border-dark-border hover:border-amber-500/50 rounded-2xl p-5 cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lomba & Kompetisi</span>
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 group-hover:scale-105 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-300">{upcomingLomba.length}</span>
            <span className="text-xs text-slate-400">kompetisi aktif</span>
          </div>
          <p className="text-[11px] text-amber-400 mt-1">
            {upcomingLomba.length > 0 ? upcomingLomba[0].title.slice(0, 24) + '...' : 'Track lomba & hackathon'}
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('ujian')}
          className="bg-dark-850 hover:bg-dark-800 border border-dark-border hover:border-accent-orange/50 rounded-2xl p-5 cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Prediksi Ujian</span>
            <div className="p-2.5 rounded-xl bg-accent-orange/15 text-accent-orange border border-accent-orange/30 group-hover:scale-105 transition-transform">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{kisiKisi.length}</span>
            <span className="text-xs text-slate-400">analisis siap</span>
          </div>
          <p className="text-[11px] text-accent-orange mt-1">
            {upcomingExams.length > 0 ? `${upcomingExams.length} ujian terdaftar` : 'Prediksi soal AI'}
          </p>
        </div>
      </div>

      {/* Grid: Recent Materi & Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <div className="bg-dark-850 border border-dark-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-dark-border">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-sm text-white">Ringkasan Materi Terbaru</h3>
              </div>
              <button
                onClick={() => setActiveTab('materi')}
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentMateri.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-3">
                <p>Belum ada ringkasan materi.</p>
                <button
                  onClick={() => setActiveTab('materi')}
                  className="px-4 py-2 bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 rounded-xl font-medium border border-purple-500/40 transition-colors"
                >
                  Mulai Unggah Dokumen
                </button>
              </div>
            ) : (
              <div className="divide-y divide-dark-border mt-2">
                {recentMateri.map((m) => {
                  const folder = folders.find(f => f.id === m.folderId);
                  return (
                    <div
                      key={m.id}
                      onClick={() => onSelectMateri(m)}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-dark-800/60 px-2 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {folder?.name || 'Mata Kuliah'}
                          </span>
                          <span className="text-[10px] text-slate-500">{m.fileType.toUpperCase()}</span>
                        </div>
                        <p className="text-xs font-semibold text-white truncate hover:text-purple-300 transition-colors">
                          {m.title}
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-500 shrink-0">
                        {new Date(m.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Agenda / Schedule */}
        <div className="bg-dark-850 border border-dark-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-dark-border">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent-orange" />
                <h3 className="font-bold text-sm text-white">Agenda & Reminder Mendatang</h3>
              </div>
              <button
                onClick={() => setActiveTab('jadwal')}
                className="text-xs font-semibold text-accent-orange hover:text-amber-400 flex items-center gap-1 transition-colors"
              >
                <span>Buka Jadwal</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Sub-filter tabs */}
            <div className="flex gap-1.5 pt-3 pb-1 overflow-x-auto text-[11px]">
              {[
                { id: 'all', label: `Semua (${upcomingJadwal.length})` },
                { id: 'lomba', label: `Lomba (${upcomingLomba.length})` },
                { id: 'organisasi', label: `Organisasi (${upcomingOrg.length})` },
                { id: 'ujian', label: `Ujian (${upcomingExams.length})` },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveAgendaFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    activeAgendaFilter === f.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-dark-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filteredUpcoming.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-3">
                <p>Belum ada agenda mendatang pada kategori ini.</p>
                <button
                  onClick={() => setActiveTab('jadwal')}
                  className="px-4 py-2 bg-accent-orange/20 text-accent-orange hover:bg-accent-orange/30 rounded-xl font-medium border border-accent-orange/40 transition-colors"
                >
                  + Tambah Agenda
                </button>
              </div>
            ) : (
              <div className="divide-y divide-dark-border mt-1">
                {filteredUpcoming.slice(0, 4).map((j) => (
                  <div
                    key={j.id}
                    className="py-2.5 flex items-center justify-between gap-3 hover:bg-dark-800/60 px-2 rounded-xl transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          j.type === 'lomba'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : j.type === 'organisasi'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : j.type === 'ujian' 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {j.type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {j.date} {j.time && `• ${j.time}`}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white truncate">
                        {j.title}
                      </p>
                      <p className="text-[11px] text-purple-300 truncate">{j.courseName}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold text-accent-orange bg-accent-orange/10 px-2 py-0.5 rounded-md border border-accent-orange/20">
                        {getDaysRemaining(j.date)}
                      </span>
                      <button
                        onClick={() => onSendEmailReminder(j)}
                        className="p-1.5 rounded-lg bg-dark-800 hover:bg-purple-600 text-slate-300 hover:text-white transition-colors"
                        title="Kirim Pengingat Email Sekarang"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Academic Tracker Modal */}
      <AcademicTrackerModal
        isOpen={isAcademicModalOpen}
        onClose={() => setIsAcademicModalOpen(false)}
        semesters={semesters}
        dailyGrades={dailyGrades}
        onSaveSemesters={onSaveSemesters}
        onSaveDailyGrades={onSaveDailyGrades}
      />
    </div>
  );
};
