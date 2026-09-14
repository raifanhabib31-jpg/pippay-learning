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
  Award 
} from 'lucide-react';
import type { AppSettings } from '../../types';
import { storageService } from '../../services/storageService';

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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
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
        alert('Format file cadangan tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Pengaturan & Kustomisasi Profil
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Personalisasi profil akademik, konfigurasi model Google Gemini AI, dan kelola cadangan data.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Profil Mahasiswa & Kustomisasi Status */}
        <div className="bg-dark-850 border border-dark-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-dark-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-accent-orange/20 border border-accent-orange/30 flex items-center justify-center text-accent-orange">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Profil & Gelar Pengguna</h3>
                <p className="text-[11px] text-purple-300">Ubah nama, status, dan target prestasi Anda</p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-accent-orange/15 text-accent-orange border border-accent-orange/30 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>{formData.userTitle || 'Mahasiswa Berprestasi'}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Nama Lengkap / Panggilan *
              </label>
              <input
                type="text"
                placeholder="Contoh: Alex Pratama"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className="w-full bg-dark-800 border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent-orange"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Status / Gelar Profil (Custom)
              </label>
              <input
                type="text"
                placeholder="Contoh: Mahasiswa Berprestasi / Juara Hackathon"
                value={formData.userTitle || ''}
                onChange={(e) => setFormData({ ...formData, userTitle: e.target.value })}
                className="w-full bg-dark-800 border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent-orange font-medium"
              />
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {['Mahasiswa Berprestasi', 'Juara Hackathon', 'Calon Cumlaude', 'Ketua Organisasi', 'Riset AI Lead'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFormData({ ...formData, userTitle: preset })}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-dark-800 hover:bg-dark-750 text-slate-400 hover:text-white border border-dark-border transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Universitas / Jurusan / Fakultas
              </label>
              <input
                type="text"
                placeholder="Contoh: Ilmu Komputer - Universitas Indonesia"
                value={formData.userUniversity || ''}
                onChange={(e) => setFormData({ ...formData, userUniversity: e.target.value })}
                className="w-full bg-dark-800 border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent-orange"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Email Utama Penerima Pengingat
              </label>
              <input
                type="email"
                placeholder="nama@kampus.ac.id"
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                className="w-full bg-dark-800 border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent-orange"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Bio / Target & Motto Belajar
            </label>
            <input
              type="text"
              placeholder="Contoh: Fokus IPK 3.85+, aktif riset AI & submit 3 kompetisi nasional semester ini."
              value={formData.userBio || ''}
              onChange={(e) => setFormData({ ...formData, userBio: e.target.value })}
              className="w-full bg-dark-800 border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent-orange"
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
                <h3 className="font-bold text-sm text-white">Google Gemini AI Engine (Dukungan Gemini Plus / Pro / Flash)</h3>
                <p className="text-[11px] text-purple-300 font-medium">Mendukung semua versi model Gemini dari Google AI Studio & Gemini Plus</p>
              </div>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent-orange hover:underline flex items-center gap-1 font-semibold"
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
                    placeholder="Contoh: gemini-3.1-pro, gemini-3.6-flash, gemini-3.5-flash-lite, atau fine-tuned model"
                    value={formData.geminiModel}
                    onChange={(e) => setFormData({ ...formData, geminiModel: e.target.value.trim() })}
                    className="w-full bg-dark-800 border border-dark-border rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    Sistem akan memanggil API Google Gemini menggunakan model ID yang Anda masukkan di atas.
                  </p>
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

        {/* Section 3: Cadangan Data */}
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
            className="px-6 py-2.5 bg-accent-orange hover:bg-accent-orangeHover text-white font-bold rounded-xl text-xs shadow-lg shadow-orange-950/40 transition-all transform active:scale-95"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
};
