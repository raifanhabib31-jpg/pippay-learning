import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Eye, 
  EyeOff, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Key,
  ExternalLink,
  ArrowRight,
  Check
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
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Google OAuth Client ID setup modal
  const [isClientIdModalOpen, setIsClientIdModalOpen] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(() => authService.getGoogleClientId());
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quote slide index for right illustration panel
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      quote: "Finally, all your work in one place.",
      highlight: "Workspace Belajar AI",
      timeOfDay: "Dusk Chill"
    },
    {
      quote: "Smart Dual-Agent AI with Gemini & Kimi.",
      highlight: "Rangkum & Prediksi Ujian",
      timeOfDay: "Night Focus"
    },
    {
      quote: "Stay ahead with automated H-1 exam reminders.",
      highlight: "IPK Maksimal & Terjadwal",
      timeOfDay: "Sunrise Motivation"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Primary action: Redirect to official Google Sign In
  const handleTriggerGoogleAuth = (optionalEmail?: string) => {
    setErrorMsg(null);
    const targetEmail = optionalEmail || emailInput;
    const clientId = authService.getGoogleClientId();

    if (clientId) {
      // Redirect langsung ke laman resmi Google Sign In (accounts.google.com)
      setIsLoading(true);
      const redirected = authService.redirectToGoogleOAuth(targetEmail);
      if (!redirected) {
        setIsLoading(false);
        setIsClientIdModalOpen(true);
      }
    } else {
      // Jika belum diset Google Client ID, buka dialog setup & instant login
      setIsClientIdModalOpen(true);
    }
  };

  // Form submit handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      handleTriggerGoogleAuth(emailInput.trim());
    } else {
      handleTriggerGoogleAuth();
    }
  };

  // Save Google Client ID & immediately redirect to Google OAuth
  const handleSaveClientIdAndRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientIdInput.trim()) return;

    authService.setGoogleClientId(clientIdInput.trim());
    setIsClientIdModalOpen(false);
    setIsLoading(true);
    authService.redirectToGoogleOAuth(emailInput);
  };

  // Instant direct login without Google Cloud project setup
  const handleInstantGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const email = emailInput.trim() || 'raifanhabib31@gmail.com';
      const user = await authService.loginWithGoogleDirect(email);
      setIsClientIdModalOpen(false);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden bg-gradient-to-br from-[#c99587] via-[#a8746b] to-[#734b5f] dark:from-[#140f21] dark:via-[#0e0a19] dark:to-[#08060f] transition-colors duration-300 select-none">
      
      {/* Background ambient lighting effects */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-500/20 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-amber-500/20 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Theme Toggle & Client ID Config */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <button
          onClick={() => setIsClientIdModalOpen(true)}
          className="p-3 rounded-2xl bg-white/80 dark:bg-dark-850/80 backdrop-blur-md border border-white/40 dark:border-dark-border text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 shadow-lg transition-all hover:scale-105 cursor-pointer"
          title="Konfigurasi Google OAuth Client ID"
        >
          <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </button>
        <button
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-white/80 dark:bg-dark-850/80 backdrop-blur-md border border-white/40 dark:border-dark-border text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 shadow-lg transition-all hover:scale-105 cursor-pointer"
          title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-purple-700" />}
        </button>
      </div>

      {/* Main Two-Column Card */}
      <div className="relative z-10 w-full max-w-4xl bg-[#f8f9fc] dark:bg-dark-900 border border-white/50 dark:border-dark-border rounded-[36px] shadow-2xl p-4 sm:p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        
        {/* ================= LEFT COLUMN: LOGIN FORM ================= */}
        <div className="px-3 sm:px-6 md:px-8 py-4 sm:py-6 flex flex-col justify-center space-y-6">
          
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Hello Again!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Let's get started with your learning space
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <input
                type="email"
                placeholder="Email (contoh: user@gmail.com)"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-white dark:bg-dark-800 border border-slate-200/90 dark:border-dark-border rounded-2xl px-4 py-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500/40 transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (opsional jika via Google)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-white dark:bg-dark-800 border border-slate-200/90 dark:border-dark-border rounded-2xl px-4 py-3.5 pr-11 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500/40 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Recovery Password Link */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleTriggerGoogleAuth()}
                className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
              >
                Recovery Password
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-[#8b5c6d] hover:bg-[#7a4e5e] dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-[#8b5c6d]/30 dark:shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Sign In with Google</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-slate-200 dark:border-dark-border" />
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Or continue with
            </span>
            <div className="flex-1 border-t border-slate-200 dark:border-dark-border" />
          </div>

          {/* Single Google Login Button (Direct Redirect to Google) */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => handleTriggerGoogleAuth()}
              disabled={isLoading}
              className="w-14 h-14 bg-white dark:bg-dark-800 hover:bg-slate-50 dark:hover:bg-dark-750 border border-slate-200/90 dark:border-dark-border rounded-2xl shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer group"
              title="Redirect ke Google Sign-In"
            >
              {/* Official Google SVG Icon */}
              <svg className="w-6 h-6 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
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
            </button>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: ARTISTIC ILLUSTRATION PANEL ================= */}
        <div className="relative h-80 sm:h-96 md:h-[480px] w-full rounded-[28px] overflow-hidden shadow-inner flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-b from-[#e3b5a4] via-[#b6899e] to-[#4a3b63] dark:from-[#3a204f] dark:via-[#21153a] dark:to-[#0f091f]">
          
          {/* Sun / Orb in background */}
          <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-amber-100/80 dark:bg-amber-300/40 blur-sm shadow-[0_0_50px_rgba(251,191,36,0.5)] pointer-events-none" />

          {/* Mountains & Scenic landscape vector art */}
          <svg className="absolute inset-0 w-full h-full object-cover pointer-events-none" viewBox="0 0 400 500" fill="none" preserveAspectRatio="none">
            {/* Distant Hills */}
            <path d="M0 260 Q 120 220, 240 250 T 400 230 L 400 500 L 0 500 Z" fill="#6c4d69" opacity="0.7" />
            
            {/* Mid Snowy Ridge */}
            <path d="M400 240 Q 300 260, 240 280 T 0 340 L 0 500 L 400 500 Z" fill="#8d739b" opacity="0.8" />
            <path d="M240 280 Q 280 270, 360 250 L 400 250 L 400 300 Q 320 330, 240 280 Z" fill="#d9d2e9" opacity="0.9" />

            {/* Foreground Cliff */}
            <path d="M400 300 C 320 320, 270 380, 250 500 L 400 500 Z" fill="#2d1e3d" />
            
            {/* Winter Trees Silhouette */}
            <g stroke="#1b1226" strokeWidth="2.5" strokeLinecap="round">
              <line x1="220" y1="440" x2="220" y2="380" />
              <line x1="220" y1="420" x2="205" y2="400" />
              <line x1="220" y1="410" x2="235" y2="395" />
              <line x1="220" y1="395" x2="210" y2="385" />
              <line x1="220" y1="390" x2="230" y2="380" />

              <line x1="280" y1="470" x2="280" y2="400" />
              <line x1="280" y1="450" x2="260" y2="430" />
              <line x1="280" y1="435" x2="295" y2="420" />
              <line x1="280" y1="420" x2="265" y2="410" />
              <line x1="280" y1="410" x2="290" y2="400" />

              <line x1="330" y1="480" x2="330" y2="430" />
              <line x1="330" y1="465" x2="315" y2="450" />
              <line x1="330" y1="450" x2="345" y2="440" />
            </g>

            <path d="M260 250 Q 280 230, 305 245" stroke="#2d1e3d" strokeWidth="3" fill="none" />
            <path d="M270 240 L 275 225 M 285 235 L 295 220 M 295 240 L 310 230" stroke="#2d1e3d" strokeWidth="2" strokeLinecap="round" />
          </svg>

          {/* Top Pill / Logo inside artwork */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/30 dark:bg-black/40 backdrop-blur-md border border-white/30 text-white text-[11px] font-bold tracking-wide">
              <span>✨ {slides[currentSlide].highlight}</span>
            </div>
          </div>

          {/* Bottom Content (Quote + Carousel Controls) */}
          <div className="relative z-10 space-y-4">
            <p className="text-white text-base sm:text-lg font-bold leading-snug drop-shadow-md max-w-xs transition-all duration-300">
              "{slides[currentSlide].quote}"
            </p>

            {/* Slider Arrow Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevSlide}
                className="w-8 h-8 rounded-full border border-white/60 bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90 cursor-pointer"
                title="Slide sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="w-8 h-8 rounded-full border border-white/60 bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90 cursor-pointer"
                title="Slide berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ================= GOOGLE OAUTH CONFIG / REDIRECT MODAL ================= */}
      {isClientIdModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181326] dark:bg-dark-900 border border-purple-900/40 dark:border-dark-border rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center gap-3.5 border-b border-purple-900/30 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-md shrink-0">
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Google Sign-In Redirect</h3>
                <p className="text-xs text-slate-400">Hubungkan akun Google resmi ke PippayLearning</p>
              </div>
            </div>

            {/* Opsi 1: Masukkan Google OAuth Client ID untuk Redirect Asli */}
            <form onSubmit={handleSaveClientIdAndRedirect} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-purple-300">
                  Google Client ID (OAuth 2.0 Web Client)
                </label>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
                >
                  Dapatkan Client ID <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <input
                type="text"
                placeholder="contoh: 123456789-abcdef.apps.googleusercontent.com"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                className="w-full bg-[#120d20] border border-purple-900/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500/50 font-mono"
              />

              <button
                type="submit"
                disabled={isLoading || !clientIdInput.trim()}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Simpan & Redirect ke Google</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-purple-900/30" />
              <span className="text-[10px] uppercase font-semibold text-slate-400">Atau Masuk Cepat</span>
              <div className="flex-1 border-t border-purple-900/30" />
            </div>

            {/* Opsi 2: Masuk Langsung Cepat tanpa Setup Google Cloud */}
            <button
              type="button"
              onClick={handleInstantGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 bg-[#23183d] hover:bg-[#2e1f52] border border-purple-500/30 text-slate-200 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Masuk Langsung dengan Akun {emailInput.trim() || 'Google'}</span>
            </button>

            {/* Modal Cancel Button */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setIsClientIdModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
