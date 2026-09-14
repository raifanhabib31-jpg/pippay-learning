import emailjs from '@emailjs/browser';
import type { Jadwal, AppSettings } from '../types';
import { storageService } from './storageService';

export interface SendEmailResult {
  success: boolean;
  message: string;
  previewContent?: {
    to: string;
    subject: string;
    body: string;
  };
}

export const emailService = {
  /**
   * Mengirim pengingat jadwal kuliah/ujian ke alamat email pengguna
   */
  async sendJadwalReminder(jadwal: Jadwal, targetEmail?: string): Promise<SendEmailResult> {
    const settings: AppSettings = storageService.getSettings();
    const recipientEmail = targetEmail || jadwal.userEmail || settings.userEmail || 'user@example.com';
    const userName = settings.userName || 'Mahasiswa';

    const typeLabels: Record<string, string> = {
      ujian: 'PENGINGAT UJIAN',
      tugas: 'DEADLINE TUGAS',
      kuliah: 'JADWAL KULIAH',
      belajar: 'SESI BELAJAR',
    };

    const subject = `[PippayLearning] ${typeLabels[jadwal.type] || 'Pengingat'}: ${jadwal.title} (${jadwal.courseName})`;
    
    const body = `Halo ${userName},

Ini adalah pengingat otomatis dari asisten belajar PippayLearning Anda:

Agenda: ${jadwal.title}
Mata Kuliah: ${jadwal.courseName}
Tanggal: ${jadwal.date}
Waktu: ${jadwal.time} WIB
Lokasi / Link: ${jadwal.locationOrLink || '-'}
Catatan Tambahan:
${jadwal.notes || 'Tidak ada catatan tambahan.'}

---
Tips Belajar:
- Luangkan waktu 30-45 menit untuk meninjau kembali ringkasan materi di PippayLearning.
- Kerjakan kuis latihan soal sebelum waktu ujian/pertemuan dimulai.

Semangat belajarnya!
PippayLearning AI Assistant`;

    // Check if EmailJS is configured
    if (settings.emailJsServiceId && settings.emailJsTemplateId && settings.emailJsPublicKey) {
      try {
        await emailjs.send(
          settings.emailJsServiceId,
          settings.emailJsTemplateId,
          {
            to_email: recipientEmail,
            to_name: userName,
            subject: subject,
            agenda_title: jadwal.title,
            course_name: jadwal.courseName,
            date_time: `${jadwal.date} pukul ${jadwal.time}`,
            location: jadwal.locationOrLink || '-',
            notes: jadwal.notes || '-',
            message: body,
          },
          settings.emailJsPublicKey
        );

        return {
          success: true,
          message: `Email pengingat berhasil dikirim ke ${recipientEmail} via EmailJS!`,
          previewContent: { to: recipientEmail, subject, body }
        };
      } catch (error) {
        console.error('EmailJS sending error:', error);
        return {
          success: false,
          message: `Gagal mengirim via EmailJS: ${error instanceof Error ? error.message : 'Error'}. Cek konfigurasi di menu Pengaturan.`,
          previewContent: { to: recipientEmail, subject, body }
        };
      }
    }

    // Fallback simulation with preview
    return {
      success: true,
      message: `Pengingat berhasil dijadwalkan & disimulasikan ke ${recipientEmail}. (Untuk pengiriman riil otomatis ke inbox Anda, masukkan EmailJS Service ID & Public Key di menu Pengaturan).`,
      previewContent: {
        to: recipientEmail,
        subject,
        body,
      }
    };
  }
};
