import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  Sun, 
  Moon, 
  User, 
  Mail, 
  Loader2
} from 'lucide-react';
import type { UserProfile } from '../../types';
import { authService } from '../../services/authService';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  theme,
  toggleTheme,
}) => {
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  
  // Email Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('Universitas Indonesia');
  const [major, setMajor] = useState('Ilmu Komputer');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Google Sign-In click
  const handleGoogleClick = () => {
    setIsGoogleModalOpen(true);
  };

  // Submit Google simulation
  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await authService.loginWithGoogleDirect(googleEmailInput.trim());
      setIsGoogleModalOpen(false);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal login dengan Google');
    } finally {
      setIsLoading(false);
    }
  };

  // Preset demo google accounts for instant 1-click test
  const handleQuickDemoGoogle = async (demoEmail: string, demoName: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await authService.loginWithGoogleDirect(demoEmail, demoName);
      setIsGoogleModalOpen(false);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal login demo');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Direct Form
  const handleEmailFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Nama lengkap dan alamat email wajib diisi.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await authService.loginWithEmail(name, email, university, major);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat sesi belajar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden bg-gradient-to-br from-purple-50 via-slate-50 to-indigo-50 dark:from-dark-950 dark:via-dark-900 dark:to-[#161224] transition-colors duration-200 select-none">
      
      {/* Background ambient lighting effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-400/20 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Utilities (Theme Toggle) */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-white/80 dark:bg-dark-850/80 backdrop-blur-md border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 shadow-sm transition-all hover:scale-105"
          title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-purple-600" />}
        </button>
      </div>

      {/* Main Glassmorphic Auth Container */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Col: Brand Presentation & Value Propositions (Hidden on mobile or stacked) */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-3 p-2 pr-4 bg-white/80 dark:bg-dark-850/80 backdrop-blur-md rounded-2xl border border-purple-200/80 dark:border-purple-500/30 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-dark-800 border border-purple-300 dark:border-purple-500/40 p-1 flex items-center justify-center shrink-0 shadow-2xs">
              <img 
                src="/logo.png" 
                alt="PippayLearning Mascot" 
                className="w-full h-full object-contain"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            </div>
            <div className="text-left">
              <div className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">PippayLearning</div>
              <div className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">Workspace Belajar Mahasiswa AI</div>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Belajar Cerdas, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 bg-clip-text text-transparent">
                IPK Maksimal & Terorganisir
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Masuk untuk mengakses ruang belajar privat Anda. Setiap materi, kisi-kisi ujian, dan jadwal kuliah tersimpan aman di akun Anda.
            </p>
          </div>

          {/* Features Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-dark-850/70 backdrop-blur-md border border-slate-200/80 dark:border-dark-border shadow-2xs flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-white">Double Agent AI</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Gemini + Kimi AI Storyteller</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-dark-850/70 backdrop-blur-md border border-slate-200/80 dark:border-dark-border shadow-2xs flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-accent-orange">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-white">Prediksi Soal Ujian</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Pencocokan kisi-kisi dosen</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-dark-850/70 backdrop-blur-md border border-slate-200/80 dark:border-dark-border shadow-2xs flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-white">Pengingat H-1 Email</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Notifikasi jadwal & tugas</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-dark-850/70 backdrop-blur-md border border-slate-200/80 dark:border-dark-border shadow-2xs flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-white">Isolasi Data Mandiri</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Penyimpanan khusus per akun</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Interactive Login Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-white/95 dark:bg-dark-850/95 backdrop-blur-xl border border-slate-200/90 dark:border-dark-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Header Form */}
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Selamat Datang!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih metode masuk untuk membuka ruang belajar Anda
              </p>
            </div>

            {/* Error Message if any */}
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300">
                {errorMsg}
              </div>
            )}

            {/* Primary Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-white dark:bg-dark-800 hover:bg-slate-50 dark:hover:bg-dark-750 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm rounded-2xl border border-slate-300 dark:border-dark-border shadow-sm hover:shadow-md flex items-center justify-center gap-3 transition-all duration-200 active:scale-98 cursor-pointer group"
            >
              {/* Official Google SVG Icon */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Lanjutkan dengan Akun Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-slate-200 dark:border-dark-border" />
              <span className="text-[11px] uppercase font-semibold text-slate-400">atau data mahasiswa</span>
              <div className="flex-1 border-t border-slate-200 dark:border-dark-border" />
            </div>

            {/* Email / Student Form */}
            <form onSubmit={handleEmailFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Mahasiswa *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Raifan Habib"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Email Mahasiswa *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="nama@gmail.com atau @kampus.ac.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Universitas
                  </label>
                  <input
                    type="text"
                    placeholder="Universitas Indonesia"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jurusan / Program Studi
                  </label>
                  <input
                    type="text"
                    placeholder="Ilmu Komputer"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Buka Ruang Belajar Saya</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Privacy Note */}
            <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
              🔒 Data akun, modul, dan API Key tersimpan aman dan terisolasi secara privat di perangkat Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Google Login Simulation / Direct Modal */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-border rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-dark-border pb-3">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Pilih Akun Google</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Masuk ke PippayLearning</p>
              </div>
            </div>

            {/* Quick Demo Google Accounts */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Pilih akun cepat atau masukkan email:
              </p>
              
              <button
                type="button"
                onClick={() => handleQuickDemoGoogle('raifanhabib31@gmail.com', 'Raifan Habib')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                    R
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Raifan Habib</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">raifanhabib31@gmail.com</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white">
                  Utama
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoGoogle('alex.pratama@ui.ac.id', 'Alex Pratama')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-border hover:bg-slate-100 dark:hover:bg-dark-750 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                    A
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Alex Pratama</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">alex.pratama@ui.ac.id</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-dark-700 text-slate-600 dark:text-slate-300">
                  Akun Kampus
                </span>
              </button>
            </div>

            {/* Custom Google Email Input */}
            <form onSubmit={handleGoogleSubmit} className="space-y-2 pt-2 border-t border-slate-100 dark:border-dark-border">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Atau Ketik Email Google Anda:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="akunanda@gmail.com"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  className="flex-1 bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/40"
                />
                <button
                  type="submit"
                  disabled={isLoading || !googleEmailInput.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-40"
                >
                  Masuk
                </button>
              </div>
            </form>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
