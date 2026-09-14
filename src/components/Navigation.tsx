import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  HelpCircle, 
  Calendar, 
  Settings, 
  Sparkles,
  Key,
  Sun,
  Moon,
  Info,
  X
} from 'lucide-react';
import type { TabType } from '../types';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  hasApiKey: boolean;
  totalMateri: number;
  totalJadwal: number;
  totalUjian: number;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  hasApiKey,
  totalMateri,
  totalJadwal,
  totalUjian,
  theme,
  toggleTheme,
}) => {
  const [showHelpModal, setShowHelpModal] = useState(false);

  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      badgeColor: undefined,
    },
    {
      id: 'ujian' as TabType,
      label: 'Ujian & Prediksi',
      icon: GraduationCap,
      badge: totalUjian > 0 ? `${totalUjian}` : null,
      badgeColor: 'bg-accent-orange text-white',
    },
    {
      id: 'materi' as TabType,
      label: 'Mata Pelajaran',
      icon: BookOpen,
      badge: totalMateri > 0 ? totalMateri : null,
      badgeColor: 'bg-purple-600/30 text-purple-300 border border-purple-500/30',
    },
    {
      id: 'latihan' as TabType,
      label: 'Latihan Soal',
      icon: HelpCircle,
      badge: 'AI Quiz',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
    {
      id: 'jadwal' as TabType,
      label: 'Jadwal & Reminder',
      icon: Calendar,
      badge: totalJadwal > 0 ? totalJadwal : null,
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    },
    {
      id: 'pengaturan' as TabType,
      label: 'Pengaturan',
      icon: Settings,
      badge: !hasApiKey ? 'Set Key' : null,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
  ];

  return (
    <>
      <aside className="w-64 bg-dark-900 dark:bg-dark-900 light:bg-slate-900 text-slate-100 flex flex-col shrink-0 h-screen sticky top-0 border-r border-dark-border light:border-slate-800 z-40 select-none">
        {/* Brand Header with custom Mascot Logo */}
        <div className="p-4 border-b border-dark-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-dark-800 border border-purple-500/40 p-0.5 flex items-center justify-center shrink-0 shadow-md shadow-purple-900/20 overflow-hidden group">
            <img 
              src="/logo.png" 
              alt="PippayLearning Mascot" 
              className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-200"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base tracking-tight text-white truncate">
                PippayLearning
              </h1>
            </div>
            <p className="text-[11px] text-purple-300 font-medium">Asisten Belajar Cerdas AI</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-3.5 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            MENU
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-purple-600 text-white font-semibold shadow-lg shadow-purple-900/30'
                    : 'text-slate-300 hover:bg-dark-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold tracking-wide ${
                      item.badgeColor || (isActive ? 'bg-purple-700 text-white' : 'bg-dark-800 text-slate-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Actions & Controls */}
        <div className="p-3 border-t border-dark-border space-y-2 bg-dark-950/60">
          {/* Bantuan */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <Info className="w-4 h-4 text-slate-400" />
            <span>Bantuan & Panduan</span>
          </button>

          {/* Mode Malam / Terang Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-purple-400" />
              )}
              <span>{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
            </div>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-dark-800 border border-dark-border text-slate-400">
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* API Key Status Footer */}
          <div
            onClick={() => setActiveTab('pengaturan')}
            className={`cursor-pointer p-2.5 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
              hasApiKey
                ? 'bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 border border-purple-500/30'
                : 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-200 border border-amber-600/40'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${hasApiKey ? 'bg-purple-600/30 text-purple-300' : 'bg-amber-500/20 text-amber-400'}`}>
              <Key className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate text-[11px]">
                {hasApiKey ? 'Gemini AI Aktif' : 'API Key Belum Diisi'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {hasApiKey ? 'Model siap digunakan' : 'Klik untuk hubungkan'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-850 border border-dark-border rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-white">Panduan Penggunaan PippayLearning</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-750"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-dark-800 rounded-xl border border-dark-border">
                <p className="font-semibold text-purple-300 mb-1">1. Ringkas Materi Kuliah</p>
                <p className="text-slate-400">Masuk ke tab <b>Mata Pelajaran</b>, buat folder per mata kuliah, dan unggah file materi (PDF, PPTX, DOCX, TXT) untuk diringkas otomatis oleh Gemini AI.</p>
              </div>

              <div className="p-3 bg-dark-800 rounded-xl border border-dark-border">
                <p className="font-semibold text-accent-orange mb-1">2. Analisis Kisi-Kisi & Ujian</p>
                <p className="text-slate-400">Di menu <b>Ujian</b>, masukkan kisi-kisi dari dosen. AI akan mencari dan mencocokkan materi relevan dari catatan Anda dan melengkapi topik yang belum ada.</p>
              </div>

              <div className="p-3 bg-dark-800 rounded-xl border border-dark-border">
                <p className="font-semibold text-emerald-400 mb-1">3. Latihan Soal Interaktif</p>
                <p className="text-slate-400">Hasilkan kuis pilihan ganda, essay, atau flashcard untuk menguji kesiapan ujian secara instan.</p>
              </div>

              <div className="p-3 bg-dark-800 rounded-xl border border-dark-border">
                <p className="font-semibold text-blue-400 mb-1">4. Jadwal Kuliah, Organisasi, & Lomba</p>
                <p className="text-slate-400">Catat agenda kuliah rutin, opsi ganti jadwal khusus minggu ini, rapat BEM, dan deadline lomba dengan pengingat email.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
