import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  HelpCircle, 
  Settings, 
  Sparkles, 
  Key, 
  Sun, 
  Moon, 
  Info, 
  X,
  LogOut,
  Mail,
  Clock,
  MapPin
} from 'lucide-react';
import type { TabType, UserProfile } from '../types';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  hasApiKey: boolean;
  totalMateri: number;
  totalJadwal: number;
  totalUjian: number;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onLogout?: () => void;
  currentUser?: UserProfile | null;
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
  onLogout,
  currentUser,
}) => {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      shortLabel: 'Home',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'materi' as TabType,
      label: 'Mata Pelajaran',
      shortLabel: 'Materi',
      icon: Mail, // matching the envelope icon in reference image
      badge: totalMateri > 0 ? totalMateri : null,
    },
    {
      id: 'jadwal' as TabType,
      label: 'Jadwal Kuliah',
      shortLabel: 'Jadwal',
      icon: Clock, // matching the clock icon in reference image
      badge: totalJadwal > 0 ? totalJadwal : null,
    },
    {
      id: 'ujian' as TabType,
      label: 'Prediksi Ujian',
      shortLabel: 'Ujian',
      icon: MapPin, // matching the pin icon in reference image
      badge: totalUjian > 0 ? totalUjian : null,
    },
    {
      id: 'latihan' as TabType,
      label: 'Latihan Soal',
      shortLabel: 'Kuis',
      icon: HelpCircle,
      badge: null,
    },
    {
      id: 'pengaturan' as TabType,
      label: 'Pengaturan',
      shortLabel: 'Setelan',
      icon: Settings, // matching the gear icon in reference image
      badge: !hasApiKey ? '!' : null,
    },
  ];

  return (
    <>
      {/* ================= DESKTOP MINIMALIST RAIL SIDEBAR (Visible md and up) ================= */}
      <aside className="hidden md:flex w-20 lg:w-24 bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100 flex-col shrink-0 h-screen sticky top-0 border-r border-slate-100 dark:border-dark-border z-40 select-none shadow-[2px_0_12px_-4px_rgba(0,0,0,0.03)] items-center py-6 justify-between transition-colors duration-200">
        
        {/* Top Logo / Avatar Badge */}
        <div className="flex flex-col items-center group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="relative flex items-center justify-center transition-all duration-300 group-hover:scale-110">
            {/* Mascot / App Logo - bigger, no border */}
            <img 
              src="/logo.png" 
              alt="PippayLearning Mascot" 
              className="w-14 h-14 lg:w-16 lg:h-16 object-contain drop-shadow-lg"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {/* Glowing gradient indicator on logo */}
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-tr from-purple-600 to-amber-500 border-2 border-white dark:border-dark-900" />
          </div>
        </div>

        {/* Navigation Items (Vertical Icon & Text Rail) */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-7 w-full my-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <div 
                key={item.id}
                className="relative w-full flex items-center justify-center"
                onMouseEnter={() => setHoveredTab(item.id)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex flex-col items-center justify-center py-1 transition-all duration-200 group ${
                    isActive
                      ? 'text-purple-600 dark:text-purple-400 font-bold'
                      : 'text-slate-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
                  title={item.label}
                >
                  {/* If Active: Show clean text with dot below (as in reference image), or Icon + Text */}
                  {isActive ? (
                    <div className="flex flex-col items-center transition-all scale-105 animate-in fade-in zoom-in-95 duration-200">
                      <span className="text-xs font-bold tracking-tight text-purple-600 dark:text-purple-400">
                        {item.shortLabel}
                      </span>
                      {/* Active tiny dot indicator */}
                      <span className="w-1 h-1 rounded-full bg-purple-600 dark:bg-purple-400 mt-1 shadow-xs" />
                    </div>
                  ) : (
                    /* Inactive: Clean minimalist icon */
                    <div className="p-2 rounded-xl transition-all duration-200 group-hover:scale-110 group-hover:bg-purple-50 dark:group-hover:bg-dark-800">
                      <Icon className="w-5 h-5 stroke-[1.75]" />
                    </div>
                  )}

                  {/* Badge Counter */}
                  {item.badge && !isActive && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-accent-orange text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Right Edge Active Vertical Bar Indicator (Exact as in reference image) */}
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-600 dark:bg-purple-400 rounded-l-full shadow-xs" />
                )}

                {/* Sleek Tooltip for Inactive items on hover */}
                {hoveredTab === item.id && !isActive && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white dark:bg-dark-750 text-[11px] font-medium rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none animate-in fade-in slide-in-from-left-2 duration-150">
                    {item.label}
                    {item.badge && ` (${item.badge})`}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Utility Actions (Theme Toggle, Help, API Key, Exit) */}
        <div className="flex flex-col items-center space-y-4 w-full pt-4 border-t border-slate-100 dark:border-dark-border">
          
          {/* User Avatar Badge */}
          {currentUser && (
            <div className="relative group cursor-default" title={currentUser.name}>
              <div className="w-9 h-9 rounded-2xl overflow-hidden border-2 border-purple-200 dark:border-purple-500/40 shadow-sm ring-2 ring-transparent group-hover:ring-purple-400/40 transition-all duration-200">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-purple-600 text-white font-bold text-sm flex items-center justify-center">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {/* Online indicator */}
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-dark-900" />
              {/* Name tooltip */}
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <div className="font-bold">{currentUser.name}</div>
                <div className="text-slate-400 text-[10px]">{currentUser.email}</div>
              </div>
            </div>
          )}
          
          {/* Gemini API Key Status Indicator */}
          <button
            onClick={() => setActiveTab('pengaturan')}
            className={`p-2 rounded-xl transition-all duration-200 relative group ${
              hasApiKey
                ? 'text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-dark-800'
                : 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 animate-pulse'
            }`}
            title={hasApiKey ? 'Gemini AI Aktif' : 'API Key Belum Diisi'}
          >
            <Key className="w-4 h-4 stroke-[1.75]" />
            <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-dark-800 transition-all duration-200 group"
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 stroke-[1.75]" />
            ) : (
              <Moon className="w-4 h-4 text-slate-500 group-hover:text-purple-600 stroke-[1.75]" />
            )}
          </button>

          {/* Help & Guide Modal Trigger */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-dark-800 transition-all duration-200"
            title="Panduan Aplikasi"
          >
            <Info className="w-4 h-4 stroke-[1.75]" />
          </button>

          {/* Exit / Sign Out Icon (As shown at bottom of reference image) */}
          <button
            onClick={() => {
              if (onLogout) {
                if (window.confirm('Apakah Anda yakin ingin keluar dari sesi belajar ini?')) {
                  onLogout();
                }
              } else {
                setActiveTab('dashboard');
              }
            }}
            className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-dark-800 transition-all duration-200"
            title="Keluar / Logout Akun"
          >
            <LogOut className="w-4 h-4 stroke-[1.75]" />
          </button>
        </div>
      </aside>

      {/* ================= MOBILE BOTTOM NAVIGATION BAR (Visible on phones < md) ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-dark-900/95 backdrop-blur-md border-t border-slate-100 dark:border-dark-border px-3 py-2 flex items-center justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive 
                  ? 'text-purple-600 dark:text-purple-400 font-bold' 
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {isActive ? (
                <div className="flex flex-col items-center scale-105">
                  <span className="text-[11px] font-bold tracking-tight text-purple-600 dark:text-purple-400">
                    {item.shortLabel}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-purple-600 dark:bg-purple-400 mt-0.5" />
                </div>
              ) : (
                <div className="p-1">
                  <Icon className="w-5 h-5 stroke-[1.75]" />
                </div>
              )}

              {item.badge && !isActive && (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-accent-orange ring-2 ring-white dark:ring-dark-900" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-border rounded-3xl max-w-lg w-full p-6 text-slate-800 dark:text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-600/20 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Panduan PippayLearning</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-750"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-3 bg-slate-50 dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-dark-border">
                <p className="font-semibold text-purple-600 dark:text-purple-300 mb-1">1. Ringkas Materi Kuliah</p>
                <p className="text-slate-500 dark:text-slate-400">Masuk ke tab <b>Mata Pelajaran</b>, buat folder per mata kuliah, dan unggah file materi (PDF, PPTX, DOCX, TXT) untuk diringkas otomatis oleh Gemini AI.</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-dark-border">
                <p className="font-semibold text-accent-orange mb-1">2. Analisis Kisi-Kisi & Ujian</p>
                <p className="text-slate-500 dark:text-slate-400">Di menu <b>Ujian</b>, masukkan kisi-kisi dari dosen. AI akan mencari dan mencocokkan materi relevan dari catatan Anda dan melengkapi topik yang belum ada.</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-dark-border">
                <p className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">3. Latihan Soal Interaktif</p>
                <p className="text-slate-500 dark:text-slate-400">Hasilkan kuis pilihan ganda, essay, atau flashcard untuk menguji kesiapan ujian secara instan.</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-dark-border">
                <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">4. Jadwal Kuliah & Pengingat H-1</p>
                <p className="text-slate-500 dark:text-slate-400">Catat agenda kuliah, ujian, & lomba. Pengingat email otomatis akan terkirim H-1 sebelum acara dimulai.</p>
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
