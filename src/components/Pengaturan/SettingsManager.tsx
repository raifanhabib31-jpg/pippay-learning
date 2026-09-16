import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Key, 
  User, 
  Loader2, 
  Award,
  Mail,
  Send,
  Sliders
} from 'lucide-react';
import type { AppSettings } from '../../types';
import { storageService } from '../../services/storageService';
import { emailService } from '../../services/emailService';
import { openRouterService } from '../../services/openRouterService';

interface SettingsManagerProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onRefreshData: () => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  settings,
  onSaveSettings,
  onRefreshData,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [openRouterTestStatus, setOpenRouterTestStatus] = useState<string | null>(null);
  const [isOpenRouterTesting, setIsOpenRouterTesting] = useState(false);
  const [emailTestStatus, setEmailTestStatus] = useState<string | null>(null);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [showEmailJsConfig, setShowEmailJsConfig] = useState(false);

  const [isCustomModel, setIsCustomModel] = useState(
    !['gemini-3.1-pro', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'].includes(formData.geminiModel)
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestApiKey = async () => {
    setIsTesting(true);
    setTestStatus(null);

    const modelName = formData.geminiModel || 'gemini-1.5-flash';

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'gemini', model: modelName, prompt: 'Balas dengan satu kata: OK' }),
      });

      if (response.ok) {
        setTestStatus(`Koneksi Berhasil! Model ${modelName} aktif dan siap digunakan.`);
      } else {
        const data = await response.json().catch(() => ({}));
        setTestStatus(`Gagal terhubung (${modelName}): ${data.message || 'Model tidak tersedia.'}`);
      }
    } catch (e: any) {
      setTestStatus(`Gagal terhubung: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestOpenRouterKey = async () => {
    setIsOpenRouterTesting(true);
    setOpenRouterTestStatus(null);

    const res = await openRouterService.testConnection();

    setOpenRouterTestStatus(res.message);
    setIsOpenRouterTesting(false);
  };

  const handleTestResendEmail = async () => {
    if (!formData.userEmail?.trim()) {
      setEmailTestStatus('Masukkan Alamat Email Pengguna terlebih dahulu.');
      return;
    }

    setIsTestingEmail(true);
    setEmailTestStatus(null);

    const res = await emailService.testResendApiKey(formData.userEmail, formData.resendSenderEmail);

    setEmailTestStatus(res.message);
    setIsTestingEmail(false);
  };

  const handleExportData = () => {
    const jsonStr = storageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PippayLearning_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storageService.importAllData(content)) {
        alert('Data berhasil diimpor!');
        onRefreshData();
      } else {
        alert('Gagal mengimpor file. Pastikan format JSON sesuai.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-purple-100 via-indigo-50 to-purple-50 dark:from-[#241a38] dark:via-[#1a1828] dark:to-dark-850 border border-purple-200/80 dark:border-purple-900/30 p-6 md:p-8 shadow-xs">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-200/60 dark:bg-purple-500/20 text-purple-900 dark:text-purple-300 border border-purple-300/60 dark:border-purple-500/30">
            <Sliders className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Konfigurasi & Pengaturan Sistem</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-purple-950 dark:text-purple-100 tracking-tight">
            Pengaturan Akun & Engine AI
          </h1>
          <p className="text-xs md:text-sm text-purple-900/80 dark:text-purple-200/70 max-w-xl">
            Kelola profil mahasiswa, model Google Gemini AI, Resend Email API, dan pencadangan data lokal Anda.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Profil Mahasiswa */}
        <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-border rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-dark-border">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-600/20 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Profil & Gelar Prestasi Mahasiswa</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Sesuaikan nama, predikat pencapaian, dan universitas Anda</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                Nama Mahasiswa *
              </label>
              <input
                type="text"
                required
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/40"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Gelar / Status Prestasi</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Mahasiswa Berprestasi Utama"
                value={formData.userTitle || 'Mahasiswa Berprestasi'}
                onChange={(e) => setFormData({ ...formData, userTitle: e.target.value })}
                className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/40 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                Universitas / Institut
              </label>
              <input
                type="text"
                placeholder="Contoh: Institut Teknologi Bandung"
                value={formData.userUniversity || ''}
                onChange={(e) => setFormData({ ...formData, userUniversity: e.target.value })}
                className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/40"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                Alamat Email Pengguna (Tujuan Notifikasi Jadwal) *
              </label>
              <input
                type="email"
                required
                placeholder="nama@kampus.ac.id"
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 text-xs">
              Bio / Target & Motto Belajar
            </label>
            <input
              type="text"
              placeholder="Contoh: Fokus IPK 3.85+, aktif riset AI & submit 3 kompetisi nasional semester ini."
              value={formData.userBio || ''}
              onChange={(e) => setFormData({ ...formData, userBio: e.target.value })}
              className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/40"
            />
          </div>
        </div>

        {/* Section 2: Gemini AI API Key & Model Selector */}
        <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-border rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-dark-border">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-600/20 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Google Gemini AI Engine</h3>
                <p className="text-[11px] text-purple-600 dark:text-purple-300 font-medium">Mendukung semua model Gemini (Gemini 3.1 Pro, 3.6 Flash, 3.5 Flash Lite, 2.5, 1.5)</p>
              </div>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold self-start sm:self-auto"
            >
              <span>Dapatkan API Key Gratis</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Gemini API Key Anda</label>
              <input type="password" autoComplete="off" placeholder="AIza..." value={formData.geminiApiKey || ''} onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })} className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500/40" />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Key disimpan lokal di perangkat Anda dan hanya dikirim ke proxy API saat digunakan.</p>
            </div>
            <div className="rounded-2xl border border-purple-200 bg-purple-50 p-3 text-xs text-purple-800 dark:border-purple-500/30 dark:bg-purple-950/30 dark:text-purple-200">
              API Gemini memakai proxy server. Key custom Anda disimpan lokal dan tidak pernah masuk ke sinkronisasi cloud.
            </div>

            {/* Model Selection */}
            <div className="space-y-3">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                Pilih Versi Model Gemini AI
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={isCustomModel ? 'custom' : formData.geminiModel}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomModel(true);
                    } else {
                      setIsCustomModel(false);
                      setFormData({ ...formData, geminiModel: e.target.value });
                    }
                  }}
                  className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500/40"
                >
                  <optgroup label="Versi Gemini 3 & Gemini Plus">
                    <option value="gemini-3.1-pro">Gemini 3.1 Pro (Penalaran Tertinggi)</option>
                    <option value="gemini-3.6-flash">Gemini 3.6 Flash (Respon Super Kilat & Akurat)</option>
                    <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite (Hemat Kuota & Cepat)</option>
                  </optgroup>
                  <optgroup label="Versi Gemini 2.5 & 1.5">
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  </optgroup>
                  <option value="custom">Ketik Nama / Versi Model Sendiri (Custom)...</option>
                </select>

                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={handleTestApiKey}
                    disabled={isTesting}
                    className="w-full py-2.5 px-4 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-200 rounded-2xl font-semibold border border-slate-200 dark:border-dark-border flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                  >
                    {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                    <span>Uji Koneksi Model Ini</span>
                  </button>
                </div>
              </div>

              {/* Custom Model Input if selected */}
              {isCustomModel && (
                <div className="p-3 bg-slate-50 dark:bg-dark-900 border border-purple-300 dark:border-purple-500/40 rounded-2xl space-y-1.5">
                  <label className="block text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                    Ketik Identifier Model Custom Gemini Anda:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: gemini-3.1-pro, gemini-3.6-flash, gemini-3.5-flash-lite"
                    value={formData.geminiModel}
                    onChange={(e) => setFormData({ ...formData, geminiModel: e.target.value.trim() })}
                    className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
              )}
            </div>

            {testStatus && (
              <div className={`p-3 rounded-2xl border text-xs ${
                testStatus.includes('Berhasil') 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300' 
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'
              }`}>
                {testStatus}
              </div>
            )}
          </div>
        </div>

        {/* Section 2.5: OpenRouter Engine for Double-Agent Collaboration */}
        <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-border rounded-3xl p-6 md:p-8 shadow-xs space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-dark-border">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-cyan-100 dark:bg-cyan-500/20 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">OpenRouter AI Engine</h3>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold border border-cyan-200 dark:border-cyan-800/40">
                    Dual-Agent Partner
                  </span>
                </div>
                <p className="text-[11px] text-cyan-600 dark:text-cyan-300 font-medium">
                  Berfungsi sebagai <b>Narrator / Storyteller</b> dalam mode Double Agent AI
                </p>
              </div>
            </div>
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold self-start sm:self-auto"
            >
              <span>Dapatkan OpenRouter API Key</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">OpenRouter API Key Anda</label>
              <input type="password" autoComplete="off" placeholder="sk-or-v1-..." value={formData.openRouterApiKey || ''} onChange={(e) => setFormData({ ...formData, openRouterApiKey: e.target.value })} className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-cyan-500/40" />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Key custom digunakan lebih dahulu; secret Cloudflare menjadi fallback.</p>
            </div>
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-3 text-xs text-cyan-800 dark:border-cyan-500/30 dark:bg-cyan-950/30 dark:text-cyan-200">
              OpenRouter memakai proxy server. Key custom Anda disimpan lokal dan tidak pernah masuk ke sinkronisasi cloud.
            </div>

            {/* Model Selection for OpenRouter */}
            <div className="space-y-3">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                Pilih Model OpenRouter
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={formData.openRouterModel || 'deepseek/deepseek-chat'}
                  onChange={(e) => setFormData({ ...formData, openRouterModel: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/40"
                >
                  <option value="deepseek/deepseek-chat">DeepSeek Chat (Narasi & Penjelasan)</option>
                  <option value="deepseek/deepseek-r1">DeepSeek R1 (Analisis Mendalam)</option>
                  <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                </select>

                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={handleTestOpenRouterKey}
                    disabled={isOpenRouterTesting}
                    className="w-full py-2.5 px-4 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-200 rounded-2xl font-semibold border border-slate-200 dark:border-dark-border flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                  >
                    {isOpenRouterTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
                    <span>Uji Koneksi OpenRouter</span>
                  </button>
                </div>
              </div>
            </div>

            {openRouterTestStatus && (
              <div className={`p-3 rounded-2xl border text-xs ${
                openRouterTestStatus.includes('Berhasil')
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300' 
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'
              }`}>
                {openRouterTestStatus}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Resend Email API & Notifikasi */}
        <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-border rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-dark-border">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Resend Email API (Pengiriman Otomatis)</h3>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800/40">
                    Aktif Bawaan Sistem
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Pengiriman email pengingat jadwal kuliah & H-1 sudah aktif otomatis tanpa perlu konfigurasi</p>
              </div>
            </div>
            <a
              href="https://resend.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold self-start sm:self-auto"
            >
              <span>Dashboard Resend</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Resend API Key Anda</label>
              <input type="password" autoComplete="off" placeholder="re_..." value={formData.resendApiKey || ''} onChange={(e) => setFormData({ ...formData, resendApiKey: e.target.value })} className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40" />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Key custom digunakan untuk pengiriman email Anda; secret Cloudflare menjadi fallback.</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-200">
              Resend memakai proxy server. Key custom Anda disimpan lokal dan tidak pernah masuk ke sinkronisasi cloud.
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                  Email Pengirim (Sender Email)
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, resendSenderEmail: 'PippayLearning <onboarding@resend.dev>' })}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Gunakan Default (onboarding@resend.dev)
                </button>
              </div>
              <input
                type="text"
                placeholder="PippayLearning <onboarding@resend.dev>"
                value={formData.resendSenderEmail || ''}
                onChange={(e) => setFormData({ ...formData, resendSenderEmail: e.target.value })}
                className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                ⚠️ <strong>Catatan Resend:</strong> Gunakan default <code className="text-emerald-600 dark:text-emerald-400 font-mono">PippayLearning &lt;onboarding@resend.dev&gt;</code> kecuali jika Anda sudah memverifikasi domain pribadi di dashboard Resend.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <button
                type="button"
                onClick={handleTestResendEmail}
                disabled={isTestingEmail}
                className="px-4 py-2.5 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-200 rounded-2xl font-semibold border border-slate-200 dark:border-dark-border flex items-center gap-2 transition-colors disabled:opacity-40 text-xs"
              >
                {isTestingEmail ? <Loader2 className="w-4 h-4 animate-spin text-emerald-500" /> : <Send className="w-4 h-4 text-emerald-500" />}
                <span>Tes Kirim Email ke {formData.userEmail || 'Email Anda'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowEmailJsConfig(!showEmailJsConfig)}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline"
              >
                {showEmailJsConfig ? 'Sembunyikan Opsi EmailJS' : 'Gunakan Alternatif EmailJS'}
              </button>
            </div>

            {emailTestStatus && (
              <div className={`p-3 rounded-2xl border text-xs ${
                emailTestStatus.includes('berhasil') || emailTestStatus.includes('Berhasil')
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300' 
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'
              }`}>
                {emailTestStatus}
              </div>
            )}

            {/* EmailJS Alternative Form */}
            {showEmailJsConfig && (
              <div className="p-4 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-border rounded-2xl space-y-3 pt-4 mt-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Konfigurasi Alternatif: EmailJS</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-700 dark:text-slate-300 font-semibold mb-1">Service ID</label>
                    <input
                      type="text"
                      placeholder="service_xxx"
                      value={formData.emailJsServiceId || ''}
                      onChange={(e) => setFormData({ ...formData, emailJsServiceId: e.target.value })}
                      className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-700 dark:text-slate-300 font-semibold mb-1">Template ID</label>
                    <input
                      type="text"
                      placeholder="template_xxx"
                      value={formData.emailJsTemplateId || ''}
                      onChange={(e) => setFormData({ ...formData, emailJsTemplateId: e.target.value })}
                      className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-700 dark:text-slate-300 font-semibold mb-1">Public Key</label>
                    <input
                      type="text"
                      placeholder="public_xxx"
                      value={formData.emailJsPublicKey || ''}
                      onChange={(e) => setFormData({ ...formData, emailJsPublicKey: e.target.value })}
                      className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Cadangan Data */}
        <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-border rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-dark-border">
            <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Cadangan & Pemulihan Data</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Ekspor atau impor seluruh catatan, jadwal, dan IPK lokal Anda</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExportData}
              className="px-4 py-2.5 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-semibold border border-slate-200 dark:border-dark-border flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-blue-500" />
              <span>Unduh Cadangan JSON</span>
            </button>

            <label className="px-4 py-2.5 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-semibold border border-slate-200 dark:border-dark-border flex items-center gap-2 transition-colors cursor-pointer">
              <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Pulihkan dari File JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profil & Pengaturan Berhasil Disimpan!</span>
            </div>
          ) : (
            <div></div>
          )}

          <button
            type="submit"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-purple-600/30 transition-all transform active:scale-95 cursor-pointer"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
};
