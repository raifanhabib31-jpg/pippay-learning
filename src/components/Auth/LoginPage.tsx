import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  ChevronLeft, 
  ChevronRight
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
  const [, setIsLoading] = useState(false);

  // Quote slide index for right illustration panel
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      quote: "Finally, all your work in one place.",
      highlight: "Workspace Belajar AI",
      timeOfDay: "Dusk Chill"
    },
    {
      quote: "Smart Dual-Agent AI with Gemini & OpenRouter.",
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

  // Mount Official Google Identity Services (GSI)
  React.useEffect(() => {
    const clientId = authService.getGoogleClientId();
    if (clientId && typeof (window as any).google !== 'undefined' && (window as any).google.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response.credential) {
              setIsLoading(true);
              authService.loginWithGoogleCredential(response.credential).then((user) => {
                setIsLoading(false);
                onLoginSuccess(user);
              }).catch((err) => {
                setIsLoading(false);
                console.error(err);
              });
            }
          },
        });
        const container = document.getElementById('google-gsi-native-btn');
        if (container) {
          (window as any).google.accounts.id.renderButton(container, {
            theme: theme === 'dark' ? 'filled_black' : 'outline',
            size: 'large',
            shape: 'pill',
          });
        }
      } catch (e) {
        console.warn('Google GSI init notice:', e);
      }
    }
  }, [theme, onLoginSuccess]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden bg-gradient-to-br from-[#c99587] via-[#a8746b] to-[#734b5f] dark:from-[#140f21] dark:via-[#0e0a19] dark:to-[#08060f] transition-colors duration-300 select-none">
      
      {/* Background ambient lighting effects */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-500/20 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-amber-500/20 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Theme Toggle */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
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

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Akses aplikasi menggunakan autentikasi Google resmi.
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-slate-200 dark:border-dark-border" />
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Or continue with
            </span>
            <div className="flex-1 border-t border-slate-200 dark:border-dark-border" />
          </div>

          {/* Official Google Identity Services button */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div id="google-gsi-native-btn" className="empty:hidden" />
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

    </div>
  );
};
