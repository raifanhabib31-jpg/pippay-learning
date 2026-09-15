import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  Mail, 
  MapPin, 
  Trash2, 
  CheckCircle2, 
  X,
  Trophy,
  Users,
  Repeat,
  ArrowRightLeft,
  Bell
} from 'lucide-react';
import type { Jadwal, JadwalType, JadwalReschedule, Folder, AppSettings } from '../../types';
import { emailService } from '../../services/emailService';
import type { SendEmailResult } from '../../services/emailService';

interface JadwalManagerProps {
  jadwalList: Jadwal[];
  folders: Folder[];
  settings: AppSettings;
  onSaveJadwal: (jadwal: Jadwal) => void;
  onDeleteJadwal: (id: string) => void;
}

export const JadwalManager: React.FC<JadwalManagerProps> = ({
  jadwalList,
  folders,
  settings,
  onSaveJadwal,
  onDeleteJadwal,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  
  // Reschedule modal state
  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    jadwal: Jadwal | null;
  }>({ isOpen: false, jadwal: null });
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Email result modal state
  const [emailResultModal, setEmailResultModal] = useState<{
    isOpen: boolean;
    result: SendEmailResult | null;
    jadwal: Jadwal | null;
  }>({
    isOpen: false,
    result: null,
    jadwal: null,
  });

  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [courseName, setCourseName] = useState(folders[0]?.name || '');
  const [type, setType] = useState<JadwalType>('ujian');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [notes, setNotes] = useState('');
  const [targetEmail, setTargetEmail] = useState(settings.userEmail || '');
  const [isRecurring, setIsRecurring] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState('Senin');

  const filteredJadwal = [...jadwalList]
    .filter(j => filterType === 'all' ? true : j.type === filterType)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const countLomba = jadwalList.filter(j => j.type === 'lomba').length;
  const countOrg = jadwalList.filter(j => j.type === 'organisasi').length;
  const countUjian = jadwalList.filter(j => j.type === 'ujian').length;

  const handleCreateJadwal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const newJadwal: Jadwal = {
      id: 'j-' + Date.now(),
      title: title.trim(),
      courseName: courseName || (type === 'lomba' ? 'Kompetisi' : type === 'organisasi' ? 'Organisasi' : 'Umum'),
      type,
      date,
      time,
      locationOrLink: locationOrLink.trim() || undefined,
      notes: notes.trim() || undefined,
      reminderSent: false,
      userEmail: targetEmail.trim() || undefined,
      isRecurring,
      dayOfWeek: isRecurring ? dayOfWeek : undefined,
    };

    onSaveJadwal(newJadwal);
    setIsAddModalOpen(false);

    // Reset
    setTitle('');
    setLocationOrLink('');
    setNotes('');
    setIsRecurring(false);
    setDayOfWeek('Senin');
  };

  const handleSendReminder = async (item: Jadwal) => {
    setIsSendingEmail(true);
    try {
      const result = await emailService.sendJadwalReminder(item, targetEmail || settings.userEmail);
      onSaveJadwal({ ...item, reminderSent: true });

      setEmailResultModal({
        isOpen: true,
        result,
        jadwal: item,
      });
    } catch (err: any) {
      alert('Gagal mengirim pengingat email: ' + (err.message || 'Error'));
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Handle reschedule for this week
  const openRescheduleModal = (jadwal: Jadwal) => {
    setRescheduleModal({ isOpen: true, jadwal });
    setRescheduleDate(jadwal.rescheduledForWeek?.newDate || '');
    setRescheduleTime(jadwal.rescheduledForWeek?.newTime || jadwal.time);
    setRescheduleReason(jadwal.rescheduledForWeek?.reason || '');
  };

  const handleSaveReschedule = () => {
    if (!rescheduleModal.jadwal || !rescheduleDate) return;

    const reschedule: JadwalReschedule = {
      originalDate: rescheduleModal.jadwal.date,
      newDate: rescheduleDate,
      newTime: rescheduleTime || rescheduleModal.jadwal.time,
      reason: rescheduleReason.trim() || undefined,
    };

    onSaveJadwal({
      ...rescheduleModal.jadwal,
      rescheduledForWeek: reschedule,
    });

    setRescheduleModal({ isOpen: false, jadwal: null });
    setRescheduleDate('');
    setRescheduleTime('');
    setRescheduleReason('');
  };

  const handleCancelReschedule = (jadwal: Jadwal) => {
    onSaveJadwal({
      ...jadwal,
      rescheduledForWeek: undefined,
    });
  };

  const getTypeBadge = (t: JadwalType) => {
    switch (t) {
      case 'lomba':
        return {
          label: 'Lomba & Kompetisi',
          style: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/40',
        };
      case 'organisasi':
        return {
          label: 'Organisasi & BEM',
          style: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/40',
        };
      case 'kegiatan':
        return {
          label: 'Kegiatan Luar Kampus',
          style: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/40',
        };
      case 'ujian':
        return {
          label: 'Ujian / UTS / UAS',
          style: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/40',
        };
      case 'tugas':
        return {
          label: 'Deadline Tugas',
          style: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/40',
        };
      case 'kuliah':
        return {
          label: 'Kuliah & Praktikum',
          style: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/40',
        };
      case 'belajar':
        return {
          label: 'Sesi Belajar Mandiri',
          style: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/40',
        };
      default:
        return {
          label: t,
          style: 'bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-dark-border',
        };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-rose-100 via-orange-50 to-amber-50 dark:from-[#2a1720] dark:via-[#1f1724] dark:to-dark-850 border border-rose-200/80 dark:border-rose-900/30 p-6 md:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-200/60 dark:bg-rose-500/20 text-rose-900 dark:text-rose-300 border border-rose-300/60 dark:border-rose-500/30">
            <Bell className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Pengingat Email H-1 Otomatis</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-rose-950 dark:text-rose-100 tracking-tight">
            Jadwal Kuliah, Organisasi & Lomba
          </h1>
          <p className="text-xs md:text-sm text-rose-900/80 dark:text-rose-200/70 max-w-xl">
            Pantau agenda akademik, rapat organisasi mahasiswa, submission lomba, dan kirimkan reminder otomatis ke email.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 bg-accent-orange hover:bg-accent-orangeHover text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-950/20 transition-all transform active:scale-95 shrink-0 relative z-10"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Agenda Baru</span>
        </button>
      </div>

      {/* Category Summary Badges (4 Rounded Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div 
          onClick={() => setFilterType('all')}
          className="p-4 bg-white dark:bg-dark-850 hover:bg-slate-50 dark:hover:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-3xl cursor-pointer transition-all shadow-2xs hover:shadow-xs"
        >
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Semua Agenda</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{jadwalList.length}</div>
        </div>
        <div 
          onClick={() => setFilterType('lomba')}
          className="p-4 bg-white dark:bg-dark-850 hover:bg-slate-50 dark:hover:bg-dark-800 border border-slate-200 dark:border-dark-border hover:border-amber-500/40 rounded-3xl cursor-pointer transition-all shadow-2xs hover:shadow-xs"
        >
          <div className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>Lomba & Kompetisi</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-300 mt-1">{countLomba}</div>
        </div>
        <div 
          onClick={() => setFilterType('organisasi')}
          className="p-4 bg-white dark:bg-dark-850 hover:bg-slate-50 dark:hover:bg-dark-800 border border-slate-200 dark:border-dark-border hover:border-purple-500/40 rounded-3xl cursor-pointer transition-all shadow-2xs hover:shadow-xs"
        >
          <div className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>Organisasi & BEM</span>
          </div>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-300 mt-1">{countOrg}</div>
        </div>
        <div 
          onClick={() => setFilterType('ujian')}
          className="p-4 bg-white dark:bg-dark-850 hover:bg-slate-50 dark:hover:bg-dark-800 border border-slate-200 dark:border-dark-border hover:border-rose-500/40 rounded-3xl cursor-pointer transition-all shadow-2xs hover:shadow-xs"
        >
          <div className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">Ujian & UTS/UAS</div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-300 mt-1">{countUjian}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1.5 bg-white dark:bg-dark-850 rounded-2xl border border-slate-200 dark:border-dark-border overflow-x-auto gap-1 shadow-2xs">
        {[
          { id: 'all', label: 'Semua Agenda' },
          { id: 'lomba', label: 'Lomba & Kompetisi' },
          { id: 'organisasi', label: 'Organisasi & BEM' },
          { id: 'kegiatan', label: 'Kegiatan Luar Kampus' },
          { id: 'ujian', label: 'Ujian & UTS' },
          { id: 'tugas', label: 'Deadline Tugas' },
          { id: 'kuliah', label: 'Kelas Kuliah' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === tab.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List / Empty State */}
      {filteredJadwal.length === 0 ? (
        <div className="border border-dashed border-slate-300 dark:border-dark-border/80 rounded-3xl p-12 text-center space-y-4 bg-white/60 dark:bg-dark-900/40">
          <div className="w-14 h-14 rounded-3xl bg-orange-100 dark:bg-accent-orange/10 border border-orange-200 dark:border-accent-orange/30 flex items-center justify-center text-accent-orange mx-auto">
            <CalendarIcon className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Belum Ada Agenda pada Kategori Ini</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tambahkan agenda ujian, rapat organisasi, atau jadwal lomba.</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-accent-orange hover:bg-accent-orangeHover text-white rounded-2xl text-xs font-bold shadow-md transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Agenda Baru</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJadwal.map((j) => {
            const badge = getTypeBadge(j.type);
            const hasReschedule = !!j.rescheduledForWeek;
            return (
              <div
                key={j.id}
                className={`bg-white dark:bg-dark-850 hover:bg-slate-50 dark:hover:bg-dark-800 border rounded-3xl p-5 transition-all flex flex-col justify-between shadow-2xs hover:shadow-md space-y-4 ${
                  hasReschedule
                    ? 'border-amber-500/50'
                    : 'border-slate-200 dark:border-dark-border hover:border-purple-500/50'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${badge.style}`}>
                      {badge.label}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-accent-orange" />
                      <span>{hasReschedule ? j.rescheduledForWeek!.newTime : (j.time || '09:00')}</span>
                    </div>
                  </div>

                  {/* Recurring badge */}
                  {j.isRecurring && (
                    <div className="flex items-center gap-1.5 text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-2 py-1 rounded-lg w-fit">
                      <Repeat className="w-3 h-3" />
                      <span>Rutin setiap {j.dayOfWeek}</span>
                    </div>
                  )}

                  {/* Reschedule notice */}
                  {hasReschedule && (
                    <div className="flex items-center justify-between gap-2 text-[10px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2 py-1.5 rounded-xl">
                      <div className="flex items-center gap-1.5">
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>
                          Jadwal diganti minggu ini: {new Date(j.rescheduledForWeek!.newDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })} pukul {j.rescheduledForWeek!.newTime}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCancelReschedule(j)}
                        className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 shrink-0"
                        title="Batalkan perubahan jadwal"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {hasReschedule && j.rescheduledForWeek?.reason && (
                    <p className="text-[10px] text-amber-700 dark:text-amber-400/70 italic pl-1">
                      Alasan: {j.rescheduledForWeek.reason}
                    </p>
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{j.title}</h3>
                    <p className="text-xs text-purple-600 dark:text-purple-300 font-semibold mt-0.5">{j.courseName}</p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {hasReschedule ? (
                          <>
                            <span className="line-through text-slate-400">
                              {new Date(j.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </span>
                            {' → '}
                            <span className="text-amber-600 dark:text-amber-300 font-semibold">
                              {new Date(j.rescheduledForWeek!.newDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </>
                        ) : (
                          new Date(j.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                        )}
                      </span>
                    </div>
                    {j.locationOrLink && (
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{j.locationOrLink}</span>
                      </div>
                    )}
                    {j.notes && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 bg-slate-50 dark:bg-dark-900 p-2 rounded-xl border border-slate-200 dark:border-dark-border/80">
                        {j.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-dark-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSendReminder(j)}
                      disabled={isSendingEmail}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        j.reminderSent
                          ? 'bg-slate-100 dark:bg-dark-800 text-emerald-600 dark:text-emerald-400 hover:bg-slate-200 dark:hover:bg-dark-750'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/25'
                      }`}
                      title="Kirimkan Pengingat ke Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{j.reminderSent ? 'Kirim Ulang' : 'Kirim Email'}</span>
                    </button>

                    {/* Reschedule button */}
                    {(j.isRecurring || j.type === 'kuliah') && (
                      <button
                        onClick={() => openRescheduleModal(j)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors bg-amber-100 dark:bg-amber-600/20 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-600/30 border border-amber-200 dark:border-amber-500/30"
                        title="Ganti jadwal khusus minggu ini"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Ganti Minggu Ini</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Hapus agenda ini?')) onDeleteJadwal(j.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-dark-750 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Tambah Jadwal & Reminder */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-border rounded-3xl max-w-lg w-full p-6 text-slate-800 dark:text-slate-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-orange-100 dark:bg-accent-orange/20 border border-orange-200 dark:border-accent-orange/30 flex items-center justify-center text-accent-orange">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Tambah Jadwal & Reminder</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Kuliah, Organisasi, Lomba, atau Kegiatan Luar</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-750"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJadwal} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Judul Agenda *</label>
                <input
                  type="text"
                  placeholder="Contoh: Submission Lomba Hackathon / Rapat BEM / UTS Basis Data"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-accent-orange/40"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kategori Agenda</label>
                  <select
                    value={type}
                    onChange={(e) => {
                      const newT = e.target.value as JadwalType;
                      setType(newT);
                      if (newT === 'lomba') setCourseName('Kompetisi Nasional');
                      else if (newT === 'organisasi') setCourseName('BEM / Himpunan');
                      else if (newT === 'kegiatan') setCourseName('Kegiatan Luar Kampus');
                    }}
                    className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-accent-orange/40"
                  >
                    <option value="lomba">Lomba & Kompetisi</option>
                    <option value="organisasi">Organisasi & BEM</option>
                    <option value="kegiatan">Kegiatan Luar Kampus</option>
                    <option value="ujian">Ujian / UTS / UAS</option>
                    <option value="tugas">Tugas / Deadline</option>
                    <option value="kuliah">Kuliah / Praktikum</option>
                    <option value="belajar">Sesi Belajar Mandiri</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Organisasi / Mata Kuliah</label>
                  <input
                    type="text"
                    placeholder="Contoh: Gemastik / BEM Fasilkom / IF2110"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-accent-orange/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tanggal *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-accent-orange/40"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Waktu (Jam)</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-accent-orange/40"
                  />
                </div>
              </div>

              {/* Recurring Weekly Toggle */}
              <div className="p-3.5 bg-slate-50 dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-border space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-dark-border bg-slate-100 dark:bg-dark-800 accent-purple-600"
                  />
                  <div className="flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">Jadwal Rutin Mingguan</span>
                  </div>
                </label>
                <p className="text-[10px] text-slate-500 pl-7">
                  Aktifkan untuk menjadikan jadwal ini berulang setiap minggu ke depan (sekali set, berlaku seterusnya).
                </p>

                {isRecurring && (
                  <div className="pl-7">
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Hari Rutin</label>
                    <select
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Senin">Senin</option>
                      <option value="Selasa">Selasa</option>
                      <option value="Rabu">Rabu</option>
                      <option value="Kamis">Kamis</option>
                      <option value="Jumat">Jumat</option>
                      <option value="Sabtu">Sabtu</option>
                      <option value="Minggu">Minggu</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Lokasi / Link Pendaftaran / Zoom</label>
                <input
                  type="text"
                  placeholder="Contoh: Ruang Rapat Himpunan / https://lomba.id / Zoom"
                  value={locationOrLink}
                  onChange={(e) => setLocationOrLink(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-accent-orange/40"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Catatan Tambahan & Persiapan</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Bawa draft proposal, materi presentasi 10 slide, kartu identitas"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl p-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-accent-orange/40"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Penerima Pengingat</label>
                <input
                  type="email"
                  placeholder="email.anda@kampus.ac.id"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-accent-orange/40"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent-orange hover:bg-accent-orangeHover text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ganti Jadwal Khusus Minggu Ini */}
      {rescheduleModal.isOpen && rescheduleModal.jadwal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-border rounded-3xl max-w-md w-full p-6 text-slate-800 dark:text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Ganti Jadwal Minggu Ini</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Perubahan hanya berlaku untuk minggu ini saja</p>
                </div>
              </div>
              <button
                onClick={() => setRescheduleModal({ isOpen: false, jadwal: null })}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-750"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info about original schedule */}
            <div className="p-3 bg-slate-50 dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-border space-y-1 text-xs">
              <div className="text-[10px] font-bold uppercase text-slate-400">Jadwal Asli</div>
              <div className="text-slate-900 dark:text-white font-semibold">{rescheduleModal.jadwal.title}</div>
              <div className="text-slate-500 dark:text-slate-400">
                {rescheduleModal.jadwal.courseName} — {new Date(rescheduleModal.jadwal.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })} pukul {rescheduleModal.jadwal.time}
              </div>
              {rescheduleModal.jadwal.isRecurring && (
                <div className="text-blue-600 dark:text-blue-300 flex items-center gap-1 mt-1">
                  <Repeat className="w-3 h-3" />
                  <span>Rutin setiap {rescheduleModal.jadwal.dayOfWeek}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tanggal Pengganti *</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Waktu Pengganti</label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Alasan Penggantian</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Dosen tidak dapat mengajar hari ini, kelas dipindahkan ke hari Rabu"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-border rounded-2xl p-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-dark-border">
              <button
                type="button"
                onClick={() => setRescheduleModal({ isOpen: false, jadwal: null })}
                className="px-4 py-2 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveReschedule}
                disabled={!rescheduleDate}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs shadow-md transition-colors"
              >
                Simpan Perubahan Jadwal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Hasil Pengiriman Email */}
      {emailResultModal.isOpen && emailResultModal.result && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-border rounded-3xl max-w-lg w-full p-6 text-slate-800 dark:text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-border pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Notifikasi Pengingat Terkirim</h3>
              </div>
              <button
                onClick={() => setEmailResultModal({ isOpen: false, result: null, jadwal: null })}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-750"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl text-xs text-emerald-800 dark:text-emerald-200">
              {emailResultModal.result.message}
            </div>

            {emailResultModal.result.previewContent && (
              <div className="space-y-2 border border-slate-200 dark:border-dark-border rounded-2xl p-3 bg-slate-50 dark:bg-dark-900">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Preview Format Email:</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Subjek: <span className="font-normal text-slate-700 dark:text-slate-300">{emailResultModal.result.previewContent.subject}</span>
                </div>
                <div className="p-3 bg-white dark:bg-dark-950 border border-slate-200 dark:border-dark-border rounded-xl text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line font-mono max-h-48 overflow-y-auto">
                  {emailResultModal.result.previewContent.body}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setEmailResultModal({ isOpen: false, result: null, jadwal: null })}
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
};
