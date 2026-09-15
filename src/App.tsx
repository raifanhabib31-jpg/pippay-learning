import { useState, useEffect } from 'react';
import type { 
  Folder, 
  Materi, 
  KisiKisiItem, 
  QuizResult, 
  Jadwal, 
  AppSettings, 
  TabType,
  SemesterRecord,
  DailyGradeItem,
  UserProfile
} from './types';
import { storageService } from './services/storageService';
import { emailService } from './services/emailService';
import type { SendEmailResult } from './services/emailService';
import { authService } from './services/authService';
import { LoginPage } from './components/Auth/LoginPage';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { MateriManager } from './components/Materi/MateriManager';
import { UjianManager } from './components/Ujian/UjianManager';
import { LatihanSoalManager } from './components/Latihan/LatihanSoalManager';
import { JadwalManager } from './components/Jadwal/JadwalManager';
import { SettingsManager } from './components/Pengaturan/SettingsManager';
import { CheckCircle2, X } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(
    () => authService.getCurrentUser()
  );
  
  // Theme state: default dark mode as requested by user comparing to pelajarin.ai
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('pippay_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('pippay_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // App state
  const [folders, setFolders] = useState<Folder[]>([]);
  const [materi, setMateri] = useState<Materi[]>([]);
  const [kisiKisiList, setKisiKisiList] = useState<KisiKisiItem[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [semesters, setSemesters] = useState<SemesterRecord[]>([]);
  const [dailyGrades, setDailyGrades] = useState<DailyGradeItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());

  // Deep link states between tabs
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [quizInitialContent, setQuizInitialContent] = useState<string>('');
  const [quizInitialTitle, setQuizInitialTitle] = useState<string>('');

  // Email reminder toast / modal from dashboard
  const [quickEmailResult, setQuickEmailResult] = useState<{
    isOpen: boolean;
    result: SendEmailResult | null;
  }>({
    isOpen: false,
    result: null,
  });

  // Load all initial data
  const loadData = () => {
    setFolders(storageService.getFolders());
    setMateri(storageService.getMateri());
    setKisiKisiList(storageService.getKisiKisi());
    setQuizResults(storageService.getQuizResults());
    setJadwalList(storageService.getJadwal());
    setSemesters(storageService.getSemesters());
    setDailyGrades(storageService.getDailyGrades());
    setSettings(storageService.getSettings());
  };

  // Check Google OAuth redirect callback on startup
  useEffect(() => {
    authService.handleOAuthCallback().then((user) => {
      if (user) {
        setCurrentUser(user);
        setActiveTab('dashboard');
      }
    });
  }, []);

  // Load data when user logs in
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  // Auth handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    // Clear app state
    setFolders([]);
    setMateri([]);
    setKisiKisiList([]);
    setQuizResults([]);
    setJadwalList([]);
    setSemesters([]);
    setDailyGrades([]);
    setActiveTab('dashboard');
  };

  // Auto H-1 reminder: runs once when jadwalList is first loaded
  const [h1CheckDone, setH1CheckDone] = useState(false);
  useEffect(() => {
    if (jadwalList.length === 0 || h1CheckDone) return;
    setH1CheckDone(true);
    emailService.checkAndSendH1AutoReminders(jadwalList).then(({ updatedJadwal, sentCount }) => {
      if (sentCount > 0) {
        setJadwalList(updatedJadwal);
        console.log(`[PippayLearning] ${sentCount} pengingat H-1 otomatis berhasil dikirim.`);
      }
    }).catch((err) => {
      console.warn('[PippayLearning] Gagal mengirim pengingat H-1 otomatis:', err);
    });
  }, [jadwalList, h1CheckDone]);

  // Handlers for Folder & Materi
  const handleSaveFolder = (newFolder: Folder) => {
    const updated = [...folders, newFolder];
    setFolders(updated);
    storageService.saveFolders(updated);
  };

  const handleDeleteFolder = (id: string) => {
    const updatedFolders = folders.filter(f => f.id !== id);
    const updatedMateri = materi.filter(m => m.folderId !== id);
    setFolders(updatedFolders);
    setMateri(updatedMateri);
    storageService.saveFolders(updatedFolders);
    storageService.saveMateri(updatedMateri);
    if (selectedFolderId === id) setSelectedFolderId(null);
  };

  const handleSaveMateri = (newMateri: Materi) => {
    const existingIdx = materi.findIndex(m => m.id === newMateri.id);
    let updated: Materi[];
    if (existingIdx >= 0) {
      updated = [...materi];
      updated[existingIdx] = newMateri;
    } else {
      updated = [newMateri, ...materi];
    }
    setMateri(updated);
    storageService.saveMateri(updated);
  };

  const handleDeleteMateri = (id: string) => {
    const updated = materi.filter(m => m.id !== id);
    setMateri(updated);
    storageService.saveMateri(updated);
  };

  // Handlers for Kisi-Kisi
  const handleSaveKisiKisi = (item: KisiKisiItem) => {
    const existingIdx = kisiKisiList.findIndex(k => k.id === item.id);
    let updated: KisiKisiItem[];
    if (existingIdx >= 0) {
      updated = [...kisiKisiList];
      updated[existingIdx] = item;
    } else {
      updated = [item, ...kisiKisiList];
    }
    setKisiKisiList(updated);
    storageService.saveKisiKisi(updated);
  };

  const handleDeleteKisiKisi = (id: string) => {
    const updated = kisiKisiList.filter(k => k.id !== id);
    setKisiKisiList(updated);
    storageService.saveKisiKisi(updated);
  };

  // Handlers for Quiz
  const handleSaveQuizResult = (result: QuizResult) => {
    const updated = [result, ...quizResults];
    setQuizResults(updated);
    storageService.saveQuizResults(updated);
  };

  // Handlers for Jadwal
  const handleSaveJadwal = (item: Jadwal) => {
    const existingIdx = jadwalList.findIndex(j => j.id === item.id);
    let updated: Jadwal[];
    if (existingIdx >= 0) {
      updated = [...jadwalList];
      updated[existingIdx] = item;
    } else {
      updated = [...jadwalList, item];
    }
    setJadwalList(updated);
    storageService.saveJadwal(updated);
  };

  const handleDeleteJadwal = (id: string) => {
    const updated = jadwalList.filter(j => j.id !== id);
    setJadwalList(updated);
    storageService.saveJadwal(updated);
  };

  // Handlers for Semesters & Daily Grades
  const handleSaveSemesters = (updated: SemesterRecord[]) => {
    setSemesters(updated);
    storageService.saveSemesters(updated);
  };

  const handleSaveDailyGrades = (updated: DailyGradeItem[]) => {
    setDailyGrades(updated);
    storageService.saveDailyGrades(updated);
  };

  // Handlers for Settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
  };

  // Cross-component navigations
  const handleStartQuizFromMateri = (m: Materi) => {
    setQuizInitialContent(m.summary || m.rawContent);
    setQuizInitialTitle(`Kuis: ${m.title}`);
    setActiveTab('latihan');
  };

  const handleStartQuizFromExamContent = (text: string, title: string) => {
    setQuizInitialContent(text);
    setQuizInitialTitle(`Kuis: ${title}`);
    setActiveTab('latihan');
  };

  const handleQuickSendEmail = async (jadwal: Jadwal) => {
    try {
      const result = await emailService.sendJadwalReminder(jadwal, settings.userEmail);
      handleSaveJadwal({ ...jadwal, reminderSent: true });
      setQuickEmailResult({ isOpen: true, result });
    } catch (e: any) {
      alert('Gagal mengirim email: ' + e.message);
    }
  };

  const upcomingExamsCount = jadwalList.filter(j => j.type === 'ujian').length;

  const tabLabels: Record<TabType, string> = {
    dashboard: 'Dashboard Utama',
    ujian: 'Prediksi Soal Ujian',
    materi: 'Mata Pelajaran',
    latihan: 'Latihan Soal AI',
    jadwal: 'Jadwal & Pengingat',
    pengaturan: 'Pengaturan'
  };

  // Show Login Page if not authenticated
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className={`flex min-h-screen ${theme === 'dark' ? 'bg-dark-900 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Fixed Pelajarin-style Sidebar with Mascot Logo */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasApiKey={Boolean(settings.geminiApiKey?.trim())}
        totalMateri={materi.length}
        totalJadwal={jadwalList.length}
        totalUjian={upcomingExamsCount}
        theme={theme}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white/90 dark:bg-dark-900/90 backdrop-blur-md border-b border-slate-200 dark:border-dark-border px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="md:hidden shrink-0">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-9 h-9 object-contain drop-shadow-md"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Pippay
              </span>
              <span className="text-slate-400 dark:text-slate-600">/</span>
              <span className="text-xs font-bold text-slate-800 dark:text-white">
                {tabLabels[activeTab]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Minimalist clean header without user badge */}
          </div>
        </header>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 flex-1">
          {activeTab === 'dashboard' && (
            <Dashboard
              folders={folders}
              materi={materi}
              kisiKisi={kisiKisiList}
              quizResults={quizResults}
              jadwal={jadwalList}
              settings={settings}
              semesters={semesters}
              dailyGrades={dailyGrades}
              onSaveSemesters={handleSaveSemesters}
              onSaveDailyGrades={handleSaveDailyGrades}
              setActiveTab={setActiveTab}
              onOpenFolder={(fId) => setSelectedFolderId(fId)}
              onSelectMateri={(m) => {
                setSelectedFolderId(m.folderId);
                setActiveTab('materi');
              }}
              onSendEmailReminder={handleQuickSendEmail}
            />
          )}

          {activeTab === 'ujian' && (
            <UjianManager
              folders={folders}
              materi={materi}
              kisiKisiList={kisiKisiList}
              onSaveKisiKisi={handleSaveKisiKisi}
              onDeleteKisiKisi={handleDeleteKisiKisi}
              onStartQuizFromContent={handleStartQuizFromExamContent}
            />
          )}

          {activeTab === 'materi' && (
            <MateriManager
              folders={folders}
              materi={materi}
              selectedFolderId={selectedFolderId}
              setSelectedFolderId={setSelectedFolderId}
              onSaveMateri={handleSaveMateri}
              onDeleteMateri={handleDeleteMateri}
              onSaveFolder={handleSaveFolder}
              onDeleteFolder={handleDeleteFolder}
              onStartQuizFromMateri={handleStartQuizFromMateri}
            />
          )}

          {activeTab === 'latihan' && (
            <LatihanSoalManager
              folders={folders}
              materi={materi}
              initialContent={quizInitialContent}
              initialTitle={quizInitialTitle}
              quizResults={quizResults}
              onSaveQuizResult={handleSaveQuizResult}
            />
          )}

          {activeTab === 'jadwal' && (
            <JadwalManager
              jadwalList={jadwalList}
              folders={folders}
              settings={settings}
              onSaveJadwal={handleSaveJadwal}
              onDeleteJadwal={handleDeleteJadwal}
            />
          )}

          {activeTab === 'pengaturan' && (
            <SettingsManager
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onRefreshData={loadData}
            />
          )}
        </div>
      </main>

      {/* Quick Email Result Modal */}
      {quickEmailResult.isOpen && quickEmailResult.result && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-850 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-dark-border space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Pengingat Jadwal Terkirim</h3>
              </div>
              <button
                onClick={() => setQuickEmailResult({ isOpen: false, result: null })}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-750"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-xs text-emerald-200">
              {quickEmailResult.result.message}
            </div>

            {quickEmailResult.result.previewContent && (
              <div className="space-y-2 border border-dark-border rounded-xl p-3 bg-dark-900">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Preview Email Pengingat:</div>
                <div className="text-xs font-bold text-white">
                  Subjek: <span className="font-normal text-slate-300">{quickEmailResult.result.previewContent.subject}</span>
                </div>
                <div className="mt-2 p-3 bg-dark-950 border border-dark-border rounded-lg text-xs text-slate-300 whitespace-pre-line font-mono max-h-48 overflow-y-auto">
                  {quickEmailResult.result.previewContent.body}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setQuickEmailResult({ isOpen: false, result: null })}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
