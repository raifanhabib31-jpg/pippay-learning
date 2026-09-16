import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  ArrowRight, 
  Mail, 
  FileText, 
  Target, 
  AlertTriangle, 
  Sparkles, 
  Calculator,
  Search,
  ChevronRight,
  ChevronDown,
  Zap,
  CheckCircle2,
  Sliders,
  Flame
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
import { ProfileCustomizationModal } from './ProfileCustomizationModal';

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
  onSaveSettings: (settings: AppSettings) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  folders,
  materi,
  kisiKisi: _kisiKisi,
  quizResults: _quizResults = [],
  jadwal,
  settings,
  semesters,
  dailyGrades,
  onSaveSemesters,
  onSaveDailyGrades,
  setActiveTab,
  onSelectMateri,
  onSendEmailReminder,
  onSaveSettings,
}) => {
  const [activeAgendaFilter, setActiveAgendaFilter] = useState<'all' | 'ujian' | 'lomba' | 'organisasi'>('all');
  const [isAcademicModalOpen, setIsAcademicModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [targetIpkScore, setTargetIpkScore] = useState<number>(3.85);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Smart toggle states
  const [toggleStates, setToggleStates] = useState({
    dial: true,
    deviceMateri: true,
    deviceQuiz: true,
    deviceAgenda: true,
    deviceKisi: true,
  });

  const toggleSwitch = (key: keyof typeof toggleStates) => {
    setToggleStates(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculate Cumulative IPK
  const completedSemesters = semesters.filter(s => (s.status === 'completed' || s.status === 'active') && s.ips > 0);
  const totalSksCompleted = completedSemesters.reduce((acc, s) => acc + s.sks, 0);
  const totalSksPoints = completedSemesters.reduce((acc, s) => acc + (s.ips * s.sks), 0);
  const currentIpk = totalSksCompleted > 0 ? (totalSksPoints / totalSksCompleted).toFixed(2) : '0.00';
  const numericIpk = parseFloat(currentIpk);

  // Check if any semester has IPS < 3.5
  const underTargetSemesters = semesters.filter(s => s.status === 'completed' && s.ips < 3.50 && s.ips > 0);
  const hasIpsUnderTarget = underTargetSemesters.length > 0;

  // Upcoming schedules sorted by date
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

  // Study group / Community members
  const studyMembers = [
    { name: settings.userName ? settings.userName.split(' ')[0] : 'Scarlett', role: 'Mahasiswa (Admin)', avatar: '👩‍🎓', bg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' },
    { name: 'Nariya', role: 'AI Tutor', avatar: '🤖', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
    { name: 'Riya', role: 'Teman Belajar', avatar: '👩‍💻', bg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' },
    { name: 'Pak Dosen', role: 'Pembimbing', avatar: '👨‍🏫', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
    { name: 'Bu Dosen', role: 'Penguji', avatar: '👩‍🏫', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
  ];

  // Adjust Target IPK +/-
  const handleAdjustTarget = (delta: number) => {
    setTargetIpkScore(prev => {
      const next = parseFloat((prev + delta).toFixed(2));
      return Math.min(4.00, Math.max(2.00, next));
    });
  };

  // Calculate arc stroke for circular gauge (SVG semi-circle/circle)
  // Gauge range: 0.0 to 4.0
  const gaugePercent = Math.min(100, Math.max(0, (numericIpk / 4.0) * 100));
  const strokeDashoffset = 314 - (314 * (gaugePercent * 0.75)) / 100; // 270 deg arc

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Search Bar & Header Controls (Matches Reference Image Top Bar) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/80 dark:bg-dark-850/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-dark-border shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari materi kuliah, jadwal, atau latihan kuis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100/80 dark:bg-dark-900/90 border border-slate-200/60 dark:border-dark-border rounded-xl pl-9 pr-4 py-2 text-xs md:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/40 transition-all"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button 
            onClick={() => setActiveTab('pengaturan')}
            className="p-2 rounded-xl bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-750 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-dark-border transition-colors relative"
            title="Pengaturan"
          >
            <Sliders className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => setActiveTab('jadwal')}
            className="p-2 rounded-xl bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-750 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-dark-border transition-colors relative"
            title="Notifikasi & Agenda"
          >
            <Mail className="w-4 h-4" />
            {upcomingJadwal.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-orange text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {upcomingJadwal.length}
              </span>
            )}
          </button>

          <div 
            onClick={() => {
              setIsProfileModalOpen(true);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setIsProfileModalOpen(true);
              }
            }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-purple-50 dark:bg-dark-800 border border-purple-200/60 dark:border-dark-border cursor-pointer hover:bg-purple-100/70 dark:hover:bg-dark-750 transition-colors"
            title="Kustomisasi profil"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {(settings.userName || 'Scarlett').charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
                <span>{settings.userName || 'Scarlett'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isProfileModalOpen && (
        <ProfileCustomizationModal
          settings={settings}
          totalMateri={materi.length}
          totalFiles={materi.filter((item) => item.originalFileName).length}
          totalUjian={jadwal.filter((item) => item.type === 'ujian').length}
          onSave={(updatedSettings) => {
            onSaveSettings(updatedSettings);
            setIsProfileModalOpen(false);
          }}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}

      {/* Main Grid Layout: Center Area (8 cols on desktop) + Right Panel (4 cols on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= LEFT / MAIN CONTENT AREA (8 Cols) ================= */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Welcome Hero Banner Card (Style matches reference image pastel banner with cute artwork) */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-amber-100 via-orange-100 to-amber-50 dark:from-[#2a2216] dark:via-[#201c18] dark:to-dark-850 border border-amber-200/80 dark:border-amber-900/30 p-6 md:p-8 shadow-xs">
            {/* Background vector sun / circles */}
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-400/15 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
              <div className="md:col-span-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-200/60 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300/60 dark:border-amber-500/30">
                  <Flame className="w-3.5 h-3.5 text-accent-orange animate-bounce" />
                  <span>Workspace Belajar AI Aktif</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-amber-950 dark:text-amber-100 tracking-tight">
                  Halo, {settings.userName ? settings.userName.split(' ')[0] : 'Scarlett'}!
                </h1>

                <p className="text-xs md:text-sm text-amber-900/80 dark:text-amber-200/70 max-w-lg leading-relaxed">
                  Selamat Datang! Kualitas belajar prima dengan asisten AI. Modul kuliah, target IPK, & persiapan ujian terorganisir rapi hari ini.
                </p>

                {/* Status Badges (Weather / Academic metrics style) */}
                <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs text-amber-950 dark:text-amber-200 font-medium">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 dark:bg-dark-900/70 rounded-xl border border-amber-200/60 dark:border-dark-border shadow-2xs">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">🌡️ +{currentIpk}</span>
                    <span className="text-slate-600 dark:text-slate-300">IPK Kumulatif</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 dark:bg-dark-900/70 rounded-xl border border-amber-200/60 dark:border-dark-border shadow-2xs">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">☁️ AI Gemini</span>
                    <span className="text-slate-600 dark:text-slate-300">Siap Meringkas</span>
                  </div>
                </div>
              </div>

              {/* Graphic Illustration (Student walking with dog in sunny campus) */}
              <div className="md:col-span-4 flex justify-center md:justify-end">
                <div className="relative w-36 h-36 md:w-44 md:h-44 flex items-center justify-center">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-linear-to-tr from-amber-300/40 to-orange-400/30 flex items-center justify-center relative overflow-hidden shadow-inner">
                    {/* SVG Graphic Mascot / Student Walking with Dog */}
                    <svg viewBox="0 0 200 200" className="w-full h-full p-2">
                      <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="2" strokeDasharray="4 4" />
                      {/* Sun */}
                      <circle cx="150" cy="45" r="16" fill="#FBBF24" opacity="0.9" />
                      {/* Cloud */}
                      <path d="M40 70 q10 -15 25 -5 q10 -10 20 0 q15 -5 15 10 h-60 z" fill="#FFFFFF" opacity="0.8" />
                      {/* Student Body Walking */}
                      <circle cx="105" cy="80" r="14" fill="#3B82F6" />
                      <circle cx="105" cy="74" r="9" fill="#FDE68A" />
                      {/* Scarf */}
                      <path d="M96 86 C105 84, 112 88, 120 84 C116 95, 102 96, 96 86 Z" fill="#EF4444" />
                      {/* Coat / Torso */}
                      <path d="M96 90 L114 90 L118 135 L92 135 Z" fill="#F59E0B" />
                      {/* Legs */}
                      <line x1="100" y1="135" x2="90" y2="170" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
                      <line x1="110" y1="135" x2="124" y2="165" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
                      {/* Leash */}
                      <path d="M112 110 Q 75 140 60 155" fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="2 2" />
                      {/* Pet Dog */}
                      <ellipse cx="50" cy="155" rx="14" ry="10" fill="#D97706" />
                      <circle cx="42" cy="148" r="7" fill="#D97706" />
                      <path d="M40 144 L36 140" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
                      <line x1="45" y1="162" x2="45" y2="175" stroke="#92400E" strokeWidth="3.5" strokeLinecap="round" />
                      <line x1="55" y1="162" x2="55" y2="175" stroke="#92400E" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>





          {/* Dial / Circular Speedometer Controller Card (Living Room Temperature style from reference) */}
          <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-border rounded-3xl p-6 shadow-xs relative overflow-hidden">
            {/* Header with Title & ON Switch */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-dark-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white">
                    Target & Capaian IPK Kumulatif
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Monitor indeks prestasi semester 1-10 dengan kalkulasi SKS otomatis.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase hidden sm:inline">
                  {toggleStates.dial ? 'ON' : 'OFF'}
                </span>
                <div 
                  onClick={() => toggleSwitch('dial')}
                  className={`w-10 h-6 rounded-full flex items-center p-0.5 transition-colors cursor-pointer ${
                    toggleStates.dial ? 'bg-purple-600' : 'bg-slate-300 dark:bg-dark-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                    toggleStates.dial ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            </div>

            {/* Circular Dial Body with Left [-] Button and Right [+] Button */}
            <div className="py-6 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
              {/* Left Minus Button */}
              <button
                onClick={() => handleAdjustTarget(-0.05)}
                className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-dark-border flex items-center justify-center text-xl font-bold shadow-2xs active:scale-95 transition-all"
                title="Kurangi Target IPK"
              >
                –
              </button>

              {/* Min value label */}
              <div className="text-center hidden sm:block">
                <div className="text-xs font-bold text-slate-400">2.00</div>
                <div className="text-[10px] text-slate-400">Min</div>
              </div>

              {/* Circular Gauge Centerpiece */}
              <div className="relative w-52 h-52 flex items-center justify-center">
                {/* SVG Dial Arc */}
                <svg className="w-full h-full transform -rotate-135" viewBox="0 0 120 120">
                  {/* Background Track */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="currentColor"
                    className="text-slate-100 dark:text-dark-750"
                    strokeWidth="8"
                    strokeDasharray="235.6"
                    strokeDashoffset="58.9"
                    strokeLinecap="round"
                  />
                  {/* Active Gradient Arc */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="url(#purpleGradient)"
                    strokeWidth="8"
                    strokeDasharray="235.6"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                  <defs>
                    <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#A855F7" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Inner Dial Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 dark:text-purple-400">
                    {Number(currentIpk) >= 3.50 ? 'Cumlaude' : 'IPK Saat Ini'}
                  </span>
                  <div className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight my-0.5">
                    {currentIpk}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Target: <b className="text-purple-600 dark:text-purple-300">{targetIpkScore.toFixed(2)}</b>
                  </span>
                </div>
              </div>

              {/* Max value label */}
              <div className="text-center hidden sm:block">
                <div className="text-xs font-bold text-purple-600 dark:text-purple-400">4.00</div>
                <div className="text-[10px] text-slate-400">Max</div>
              </div>

              {/* Right Plus Button (Purple vibrant button from reference) */}
              <button
                onClick={() => handleAdjustTarget(0.05)}
                className="w-12 h-12 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center text-xl font-bold active:scale-95 transition-all"
                title="Tambah Target IPK"
              >
                +
              </button>
            </div>

            {/* Bottom Actions for Dial */}
            <div className="pt-4 border-t border-slate-100 dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Total <b>{totalSksCompleted}</b> SKS lulus dari perkiraan 144 SKS program sarjana.</span>
              </div>
              <button
                onClick={() => setIsAcademicModalOpen(true)}
                className="px-4 py-2 bg-purple-100 dark:bg-purple-950/60 hover:bg-purple-200 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold rounded-xl border border-purple-200 dark:border-purple-800/40 flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Buka Tracker Semester 1-10 →</span>
              </button>
            </div>
          </div>

          {/* AI Alert Warning if IPS < 3.5 */}
          {hasIpsUnderTarget && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-900 dark:text-amber-300">
                    Peringatan Akademik: Terdapat Semester dengan IPS &lt; 3.50 ({underTargetSemesters.map(s => `Semester ${s.semester} = ${s.ips.toFixed(2)}`).join(', ')})
                  </div>
                  <p className="text-amber-800/80 dark:text-slate-300 text-[11px] mt-0.5">
                    AI telah menyiapkan evaluasi & strategi pemulihan jam belajar untuk menjaga target IPK Anda.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAcademicModalOpen(true)}
                className="px-4 py-2 bg-linear-to-r from-amber-600 to-accent-orange hover:from-amber-500 hover:to-accent-orangeHover text-white rounded-xl font-bold text-[11px] shadow-md flex items-center justify-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buka Evaluasi AI</span>
              </button>
            </div>
          )}

          {/* Grid: Ringkasan Materi Terbaru & Agenda Mendatang */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recent Materi */}
            <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    <h3 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">Materi Terbaru</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('materi')}
                    className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>Lihat Semua</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {recentMateri.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 space-y-2">
                    <p>Belum ada ringkasan materi.</p>
                    <button
                      onClick={() => setActiveTab('materi')}
                      className="px-3 py-1.5 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-lg font-medium text-xs"
                    >
                      + Unggah Modul
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-dark-border mt-2">
                    {recentMateri.map((m) => {
                      const folder = folders.find(f => f.id === m.folderId);
                      return (
                        <div
                          key={m.id}
                          onClick={() => onSelectMateri(m)}
                          className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-dark-800/60 px-2 rounded-xl cursor-pointer transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300">
                                {folder?.name || 'Mata Kuliah'}
                              </span>
                              <span className="text-[10px] text-slate-400">{m.fileType.toUpperCase()}</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                              {m.title}
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(m.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Agenda */}
            <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent-orange" />
                    <h3 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">Agenda Terdekat</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('jadwal')}
                    className="text-[11px] font-semibold text-accent-orange hover:underline flex items-center gap-0.5"
                  >
                    <span>Buka Kalender</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Sub-filter tabs */}
                <div className="flex gap-1 pt-2 pb-1 overflow-x-auto text-[10px]">
                  {[
                    { id: 'all', label: `Semua (${upcomingJadwal.length})` },
                    { id: 'ujian', label: `Ujian (${upcomingExams.length})` },
                    { id: 'lomba', label: `Lomba (${upcomingLomba.length})` },
                    { id: 'organisasi', label: `Organisasi (${upcomingOrg.length})` },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setActiveAgendaFilter(f.id as any)}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                        activeAgendaFilter === f.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {filteredUpcoming.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 space-y-2">
                    <p>Belum ada agenda mendatang.</p>
                    <button
                      onClick={() => setActiveTab('jadwal')}
                      className="px-3 py-1.5 bg-orange-100 dark:bg-orange-950/60 text-accent-orange rounded-lg font-medium text-xs"
                    >
                      + Buat Agenda
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-dark-border mt-1">
                    {filteredUpcoming.slice(0, 3).map((j) => (
                      <div
                        key={j.id}
                        className="py-2 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-dark-800/60 px-2 rounded-xl transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                            {j.title}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {j.date} • {j.courseName}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] font-bold text-accent-orange bg-orange-50 dark:bg-orange-950/40 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-800/30">
                            {getDaysRemaining(j.date)}
                          </span>
                          <button
                            onClick={() => onSendEmailReminder(j)}
                            className="p-1 rounded-md bg-slate-100 dark:bg-dark-800 hover:bg-purple-600 text-slate-600 dark:text-slate-300 hover:text-white transition-colors"
                            title="Kirim Pengingat Email"
                          >
                            <Mail className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE PANEL (4 Cols on Desktop) ================= */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* "My Devices" -> "Akses Cepat Modul" (4 Colorful Cards Grid: Purple, Yellow, Coral, Teal) */}
          <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-border rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                Akses Modul & Fitur
              </h3>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-dark-800 px-2 py-0.5 rounded-md border border-purple-200 dark:border-dark-border">
                  ON ▾
                </span>
                <button 
                  onClick={() => setActiveTab('materi')}
                  aria-label="Lihat Semua Materi"
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2x2 Colorful Device Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Card 1: Purple (Modul Kuliah) */}
              <div 
                onClick={() => setActiveTab('materi')}
                className="bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white p-3.5 rounded-2xl shadow-md shadow-purple-900/10 cursor-pointer transition-all transform active:scale-95 flex flex-col justify-between min-h-[95px]"
              >
                <div className="flex items-center justify-between">
                  <BookOpen className="w-4 h-4 text-white/90" />
                  <div 
                    onClick={(e) => { e.stopPropagation(); toggleSwitch('deviceMateri'); }}
                    className="w-7 h-4 rounded-full bg-white/30 flex items-center p-0.5 cursor-pointer"
                  >
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${toggleStates.deviceMateri ? 'translate-x-3' : 'translate-x-0'}`} />
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-purple-200">ON</span>
                  <div className="text-xs font-bold truncate">Mata Kuliah</div>
                </div>
              </div>

              {/* Card 2: Warm Gold / Yellow (Latihan Kuis) */}
              <div 
                onClick={() => setActiveTab('latihan')}
                className="bg-[#F59E0B] hover:bg-[#d97706] text-white p-3.5 rounded-2xl shadow-md shadow-amber-900/10 cursor-pointer transition-all transform active:scale-95 flex flex-col justify-between min-h-[95px]"
              >
                <div className="flex items-center justify-between">
                  <Zap className="w-4 h-4 text-white/90" />
                  <div 
                    onClick={(e) => { e.stopPropagation(); toggleSwitch('deviceQuiz'); }}
                    className="w-7 h-4 rounded-full bg-white/30 flex items-center p-0.5 cursor-pointer"
                  >
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${toggleStates.deviceQuiz ? 'translate-x-3' : 'translate-x-0'}`} />
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-200">ON</span>
                  <div className="text-xs font-bold truncate">AI Quiz Hub</div>
                </div>
              </div>

              {/* Card 3: Soft Coral / Orange (Agenda & Jadwal) */}
              <div 
                onClick={() => setActiveTab('jadwal')}
                className="bg-[#FF7675] hover:bg-[#fa5a58] text-white p-3.5 rounded-2xl shadow-md shadow-rose-900/10 cursor-pointer transition-all transform active:scale-95 flex flex-col justify-between min-h-[95px]"
              >
                <div className="flex items-center justify-between">
                  <Calendar className="w-4 h-4 text-white/90" />
                  <div 
                    onClick={(e) => { e.stopPropagation(); toggleSwitch('deviceAgenda'); }}
                    className="w-7 h-4 rounded-full bg-white/30 flex items-center p-0.5 cursor-pointer"
                  >
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${toggleStates.deviceAgenda ? 'translate-x-3' : 'translate-x-0'}`} />
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-rose-200">ON</span>
                  <div className="text-xs font-bold truncate">Jadwal Kuliah</div>
                </div>
              </div>

              {/* Card 4: Teal / Cyan (Kisi-Kisi Ujian) */}
              <div 
                onClick={() => setActiveTab('ujian')}
                className="bg-[#00CEC9] hover:bg-[#00b5b0] text-white p-3.5 rounded-2xl shadow-md shadow-teal-900/10 cursor-pointer transition-all transform active:scale-95 flex flex-col justify-between min-h-[95px]"
              >
                <div className="flex items-center justify-between">
                  <Target className="w-4 h-4 text-white/90" />
                  <div 
                    onClick={(e) => { e.stopPropagation(); toggleSwitch('deviceKisi'); }}
                    className="w-7 h-4 rounded-full bg-white/30 flex items-center p-0.5 cursor-pointer"
                  >
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${toggleStates.deviceKisi ? 'translate-x-3' : 'translate-x-0'}`} />
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-teal-100">ON</span>
                  <div className="text-xs font-bold truncate">Prediksi Ujian</div>
                </div>
              </div>
            </div>
          </div>

          {/* "Members" Section (Avatar Circles from reference) */}
          <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-border rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                Grup Belajar & AI Tutor
              </h3>
              <button 
                onClick={() => setActiveTab('pengaturan')}
                aria-label="Buka Pengaturan Akun"
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Horizontal Avatar List */}
            <div className="grid grid-cols-5 gap-2 pt-1 text-center">
              {studyMembers.map((m, idx) => (
                <div key={idx} className="flex flex-col items-center group cursor-pointer">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base border border-slate-200/80 dark:border-dark-border shadow-2xs group-hover:scale-110 transition-transform ${m.bg}`}>
                    <span>{m.avatar}</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1 truncate max-w-[54px]">
                    {m.name}
                  </div>
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[54px]">
                    {m.role.split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* "Power Consumed" / "Grafik Jam Belajar & Performa" (Spline Area Chart from reference) */}
          <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-border rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                Grafik Jam Belajar & Nilai
              </h3>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-dark-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-dark-border">
                  📅 Bulan ▾
                </span>
                <button 
                  onClick={() => setIsAcademicModalOpen(true)}
                  aria-label="Buka Tracker Nilai"
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Subtitle / Metric */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-orange"></span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Aktivitas Belajar</span>
              </div>
              <span className="font-extrabold text-accent-orange">
                73% Capaian Target
              </span>
            </div>

            {/* Smooth SVG Spline Area Chart matching reference */}
            <div className="relative pt-2">
              <div className="flex items-end justify-between h-32 w-full relative">
                {/* Background Grid Lines & Y-axis */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-slate-400">
                  <div className="border-b border-dashed border-slate-100 dark:border-dark-border w-full flex justify-between pr-1">
                    <span>75%</span>
                  </div>
                  <div className="border-b border-dashed border-slate-100 dark:border-dark-border w-full flex justify-between pr-1">
                    <span>50%</span>
                  </div>
                  <div className="border-b border-dashed border-slate-100 dark:border-dark-border w-full flex justify-between pr-1">
                    <span>25%</span>
                  </div>
                  <div className="w-full flex justify-between pr-1">
                    <span>0</span>
                  </div>
                </div>

                {/* SVG Curve Line & Gradient Area */}
                <svg className="w-full h-full relative z-10 overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
                  <defs>
                    <linearGradient id="chartFill" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#F97316" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Area fill */}
                  <path
                    d="M 0,70 Q 30,85 60,60 T 120,65 T 180,55 T 240,30 Q 270,40 300,75 L 300,100 L 0,100 Z"
                    fill="url(#chartFill)"
                  />

                  {/* Stroke Line */}
                  <path
                    d="M 0,70 Q 30,85 60,60 T 120,65 T 180,55 T 240,30 Q 270,40 300,75"
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Highlight Point on Peak (July) */}
                  <circle cx="240" cy="30" r="5" fill="#F97316" stroke="#FFFFFF" strokeWidth="2" />
                </svg>
              </div>

              {/* X-axis Month Labels */}
              <div className="flex justify-between text-[9px] text-slate-400 font-medium pt-2 px-1">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>Mei</span>
                <span>Jun</span>
                <span className="font-bold text-accent-orange">Jul</span>
                <span>Agu</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Performance Modal */}
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
