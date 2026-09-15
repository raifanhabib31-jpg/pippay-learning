import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Key, 
  User, 
  Loader2, 
  Award,
  Mail,
  Send
} from 'lucide-react';
import type { AppSettings } from '../../types';
import { storageService } from '../../services/storageService';
import { emailService } from '../../services/emailService';

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
  const [showApiKey, setShowApiKey] = useState(false);
  const [showResendKey, setShowResendKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
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
    if (!formData.geminiApiKey.trim()) {
      setTestStatus('Masukkan Gemini API Key terlebih dahulu.');
      return;
    }

    setIsTesting(true);
    setTestStatus(null);

    const modelName = formData.geminiModel || 'gemini-1.5-flash';

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${formData.geminiApiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Balas dengan satu kata: OK' }] }]
          }),
        }
      );

      if (response.ok) {
        setTestStatus(`Koneksi Berhasil! Model ${modelName} aktif dan siap digunakan.`);
      } else {
        const data = await response.json().catch(() => ({}));
        setTestStatus(`Gagal terhubung (${modelName}): ${data.error?.message || 'Kunci API tidak valid atau model tidak tersedia.'}`);
      }
    } catch (e: any) {
      setTestStatus(`Gagal terhubung: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestResendEmail = async () => {
    if (!formData.resendApiKey?.trim()) {
      setEmailTestStatus('Masukkan Resend API Key terlebih dahulu.');
      return;
    }
    if (!formData.userEmail?.trim()) {
      setEmailTestStatus('Masukkan Alamat Email Pengguna terlebih dahulu.');
      return;
    }

    setIsTestingEmail(true);
    setEmailTestStatus(null);

    const res = await emailService.testResendApiKey(
      formData.resendApiKey,
      formData.userEmail,
      formData.resendSenderEmail
    );

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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Pengaturan & Konfigurasi API</h1>
        <p className="text-xs text-slate-400 mt-1">
          Kelola profil Mahasiswa Berprestasi, Gemini AI Key, Resend Email API, dan pencadangan data lokal.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Profil Mahasiswa */}
        <div className="bg-dark-850 border border-dark-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-dark-border">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Profil & Gelar Prestasi Mahasiswa</h3>
              <p className="text-[11px] text-slate-400">Sesuaikan nama, predikat pencapaian, dan universitas Anda</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Nama Mahasiswa *
              </label>
              <input
                type="text"
                required
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className="w-full bg-dark-800 border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Gelar / Status Prestasi</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Mahasiswa Berprestasi Utama"
                value={formData.userTitle || 'Mahasiswa Berprestasi'}
                onChange={(e) => setFormData({ ...formData, userTitle: e.target.value })}
                className="w-full bg-dark-800 border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Universitas / Institut
              </label>
              <input
                type="text"
                placeholder="Contoh: Institut Teknologi Bandung"
                value={formData.userUniversity || ''}
                onChange={(e) => setFormData({ ...formData, userUniversity: e.target.value })}
                className="w-full bg-dark-800 border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Alamat Email Pengguna (Tujuan Notifikasi Jadwal) *
              </label>
              <input
                type="email"
                required
                placeholder="nama@kampus.ac.id"
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                className="w-full bg-dark-800 border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
              Bio / Target & Motto Belajar
            </label>
            <input
              type="text"
              placeholder="Contoh: Fokus IPK 3.85+, aktif riset AI & submit 3 kompetisi nasional semester ini."
              value={formData.userBio || ''}
              onChange={(e) => setFormData({ ...formData, userBio: e.target.value })}
              className="w-full bg-dark-800 border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Section 2: Gemini AI API Key & Model Selector */}
        <div className="bg-dark-850 border border-dark-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-dark-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Google Gemini AI Engine</h3>
                <p className="text-[11px] text-purple-300 font-medium">Mendukung semua model Gemini (Gemini 3.1 Pro, 3.6 Flash, 3.5 Flash Lite, 2.5, 1.5)</p>
              </div>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Dapatkan API Key Gratis</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Gemini API Key *
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="AIzaSy..."
                  value={formData.geminiApiKey}
                  onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
                  className="w-full bg-dark-800 border border-dark-border rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Kunci API disimpan hanya di memori browser lokal (LocalStorage) Anda secara aman.
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-3">
              <label className="block text-slate-300 font-semibold">
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
                  className="w-full bg-dark-800 border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <optgroup label="Versi Gemini 3 & Gemini Plus">
                    <option value="gemini-3.1-pro">Gemini 3.1 Pro (Kecerdasan Penalaran Tertinggi)</option>
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
                    disabled={isTesting || !formData.geminiApiKey}
                    className="w-full py-2.5 px-4 bg-dark-800 hover:bg-dark-750 text-slate-200 rounded-xl font-semibold border border-dark-border flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                  >
                    {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-purple-400" />}
                    <span>Uji Koneksi Model Ini</span>
                  </button>
                </div>
              </div>

              {/* Custom Model Input if selected */}
              {isCustomModel && (
                <div className="p-3 bg-dark-900 border border-purple-500/40 rounded-xl space-y-1.5">
                  <label className="block text-[11px] font-semibold text-purple-300">
                    Ketik Identifier Model Custom Gemini Anda:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: gemini-3.1-pro, gemini-3.6-flash, gemini-3.5-flash-lite"
                    value={formData.geminiModel}
                    onChange={(e) => setFormData({ ...formData, geminiModel: e.target.value.trim() })}
                    className="w-full bg-dark-800 border border-dark-border rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}
            </div>

            {testStatus && (
              <div className={`p-3 rounded-xl border text-xs ${
                testStatus.includes('Berhasil') 
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              }`}>
                {testStatus}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Resend Email API & Notifikasi */}
        <div className="bg-dark-850 border border-dark-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-dark-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Resend Email API (Pengiriman Email Otomatis)</h3>
                <p className="text-[11px] text-slate-400">Kirim notifikasi jadwal kuliah & deadline langsung ke inbox email Anda</p>
              </div>
            </div>
            <a
              href="https://resend.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Dapatkan Resend API Key</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Resend API Key (re_...)
              </label>
              <div className="relative">
                <input
                  type={showResendKey ? 'text' : 'password'}
                  placeholder="re_123456789abcdef..."
                  value={formData.resendApiKey || ''}
                  onChange={(e) => setFormData({ ...formData, resendApiKey: e.target.value.trim() })}
                  className="w-full bg-dark-800 border border-dark-border rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowResendKey(!showResendKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showResendKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Dapatkan API Key di <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">resend.com/api-keys</a> (Gratis 3.000 email/bulan).
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Email Pengirim (Sender Email)
              </label>
              <input
                type="text"
                placeholder="PippayLearning <onboarding@resend.dev>"
                value={formData.resendSenderEmail || ''}
                onChange={(e) => setFormData({ ...formData, resendSenderEmail: e.target.value })}
                className="w-full bg-dark-800 border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Gunakan default <code className="text-emerald-400 font-mono">PippayLearning &lt;onboarding@resend.dev&gt;</code> untuk testing, atau gunakan domain email Anda sendiri.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestResendEmail}
                disabled={isTestingEmail || !formData.resendApiKey}
                className="px-4 py-2.5 bg-dark-800 hover:bg-dark-750 text-slate-200 rounded-xl font-semibold border border-dark-border flex items-center gap-2 transition-colors disabled:opacity-40 text-xs"
              >
                {isTestingEmail ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <Send className="w-4 h-4 text-emerald-400" />}
                <span>Tes Kirim Email ke {formData.userEmail || 'Email Anda'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowEmailJsConfig(!showEmailJsConfig)}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                {showEmailJsConfig ? 'Sembunyikan Opsi EmailJS' : 'Gunakan Alternatif EmailJS'}
              </button>
            </div>

            {emailTestStatus && (
              <div className={`p-3 rounded-xl border text-xs ${
                emailTestStatus.includes('berhasil') || emailTestStatus.includes('Berhasil')
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              }`}>
                {emailTestStatus}
              </div>
            )}

            {/* EmailJS Alternative Form */}
            {showEmailJsConfig && (
              <div className="p-4 bg-dark-900 border border-dark-border rounded-2xl space-y-3 pt-4 mt-3">
                <h4 className="text-xs font-bold text-white">Konfigurasi Alternatif: EmailJS</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 font-semibold mb-1">Service ID</label>
                    <input
                      type="text"
                      placeholder="service_xxx"
                      value={formData.emailJsServiceId || ''}
                      onChange={(e) => setFormData({ ...formData, emailJsServiceId: e.target.value })}
                      className="w-full bg-dark-800 border border-dark-border rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 font-semibold mb-1">Template ID</label>
                    <input
                      type="text"
                      placeholder="template_xxx"
                      value={formData.emailJsTemplateId || ''}
                      onChange={(e) => setFormData({ ...formData, emailJsTemplateId: e.target.value })}
                      className="w-full bg-dark-800 border border-dark-border rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 font-semibold mb-1">Public Key</label>
                    <input
                      type="text"
                      placeholder="public_xxx"
                      value={formData.emailJsPublicKey || ''}
                      onChange={(e) => setFormData({ ...formData, emailJsPublicKey: e.target.value })}
                      className="w-full bg-dark-800 border border-dark-border rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Cadangan Data */}
        <div className="bg-dark-850 border border-dark-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-dark-border">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Cadangan & Pemulihan Data</h3>
              <p className="text-[11px] text-slate-400">Ekspor atau impor seluruh catatan, jadwal, dan IPK lokal Anda</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExportData}
              className="px-4 py-2.5 bg-dark-800 hover:bg-dark-750 text-slate-200 rounded-xl text-xs font-semibold border border-dark-border flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Unduh Cadangan JSON</span>
            </button>

            <label className="px-4 py-2.5 bg-dark-800 hover:bg-dark-750 text-slate-200 rounded-xl text-xs font-semibold border border-dark-border flex items-center gap-2 transition-colors cursor-pointer">
              <Upload className="w-4 h-4 text-purple-400" />
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
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profil & Pengaturan Berhasil Disimpan!</span>
            </div>
          ) : (
            <div></div>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-950/40 transition-all transform active:scale-95"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
};
