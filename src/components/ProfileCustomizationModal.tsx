import React, { useState } from 'react';
import { BookOpen, FileText, Trophy, User, X } from 'lucide-react';
import type { AppSettings } from '../types';

interface ProfileCustomizationModalProps {
  settings: AppSettings;
  totalMateri: number;
  totalFiles: number;
  totalUjian: number;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export const ProfileCustomizationModal: React.FC<ProfileCustomizationModalProps> = ({
  settings,
  totalMateri,
  totalFiles,
  totalUjian,
  onSave,
  onClose,
}) => {
  const [form, setForm] = useState<AppSettings>(settings);
  const update = (field: keyof AppSettings, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const initial = (form.userName || 'P').charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm p-4 sm:p-8">
      <div className="mx-auto w-full max-w-2xl space-y-4 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profil</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Kelola informasi dan preferensi akun Anda</p>
          </div>
          <button type="button" onClick={onClose} title="Tutup" className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-dark-border dark:bg-dark-900">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-400 text-3xl font-light text-white">{initial}</div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white">{form.userName || 'Pengguna Pippay'}</h3>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{form.userEmail || 'Email belum diatur'}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{form.userTitle || 'Mahasiswa'}{form.userUniversity ? ` · ${form.userUniversity}` : ''}</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Catatan', value: totalMateri, icon: BookOpen, color: 'text-orange-500 bg-orange-500/10' },
            { label: 'Total File', value: totalFiles, icon: FileText, color: 'text-cyan-500 bg-cyan-500/10' },
            { label: 'Prediksi Ujian', value: totalUjian, icon: Trophy, color: 'text-yellow-500 bg-yellow-500/10' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-dark-border dark:bg-dark-900">
              <div className={`mb-2 flex h-7 w-7 items-center justify-center rounded-lg ${color}`}><Icon className="h-4 w-4" /></div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{label}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>

        <form className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-dark-border dark:bg-dark-900" onSubmit={(event) => { event.preventDefault(); onSave(form); }}>
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-dark-border">
            <User className="h-4 w-4 text-purple-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">Pengaturan Profil</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama
              <input required value={form.userName} onChange={(event) => update('userName', event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-800 dark:border-dark-border dark:bg-dark-800 dark:text-white" />
            </label>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Gelar / Status
              <input value={form.userTitle || ''} onChange={(event) => update('userTitle', event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-800 dark:border-dark-border dark:bg-dark-800 dark:text-white" />
            </label>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Universitas / Institut
              <input value={form.userUniversity || ''} onChange={(event) => update('userUniversity', event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-800 dark:border-dark-border dark:bg-dark-800 dark:text-white" />
            </label>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Notifikasi
              <input required type="email" value={form.userEmail} onChange={(event) => update('userEmail', event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-800 dark:border-dark-border dark:bg-dark-800 dark:text-white" />
            </label>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 sm:col-span-2">Bio / Motto Belajar
              <textarea rows={3} value={form.userBio || ''} onChange={(event) => update('userBio', event.target.value)} className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-800 dark:border-dark-border dark:bg-dark-800 dark:text-white" />
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-dark-border">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-dark-800">Batal</button>
            <button type="submit" className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500">Simpan Profil</button>
          </div>
        </form>
      </div>
    </div>
  );
};
