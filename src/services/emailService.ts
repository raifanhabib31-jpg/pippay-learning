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

function formatResendSender(sender?: string): string {
  if (!sender || !sender.trim()) {
    return 'PippayLearning <onboarding@resend.dev>';
  }
  const clean = sender.trim();
  if (
    clean.includes('@gmail.com') ||
    clean.includes('@yahoo.com') ||
    clean.includes('@outlook.com') ||
    clean.includes('@hotmail.com')
  ) {
    return 'PippayLearning <onboarding@resend.dev>';
  }
  if (!clean.includes('<') && clean.includes('@')) {
    return `PippayLearning <${clean}>`;
  }
  return clean;
}

async function sendViaResendEndpoint(
  apiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<{ success: boolean; message: string }> {
  const safeSender = formatResendSender(from);

  // Try Netlify serverless proxy first (bypasses CORS restrictions)
  try {
    const netlifyRes = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, from: safeSender, to, subject, html, text })
    });

    if (netlifyRes.ok) {
      return { success: true, message: 'Berhasil dikirim via Resend serverless function.' };
    }

    const netlifyErr = await netlifyRes.json().catch(() => ({}));
    if (netlifyRes.status !== 404 && netlifyRes.status !== 405) {
      throw new Error(netlifyErr.message || `HTTP ${netlifyRes.status}`);
    }
  } catch (proxyError: any) {
    console.warn('Proxy route failed, trying direct endpoint:', proxyError);
  }

  // Fallback: Direct Resend API
  const directRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text
    })
  });

  if (!directRes.ok) {
    const errData = await directRes.json().catch(() => ({}));
    throw new Error(errData.message || `HTTP ${directRes.status}: ${directRes.statusText}`);
  }

  return { success: true, message: 'Berhasil dikirim via Resend Direct API.' };
}

export const emailService = {
  /**
   * Mengirim pengingat jadwal kuliah/ujian ke alamat email pengguna (Resend / EmailJS / Simulasi)
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
      organisasi: 'AGENDA ORGANISASI',
      lomba: 'DEADLINE LOMBA'
    };

    const subject = `[PippayLearning] ${typeLabels[jadwal.type] || 'Pengingat'}: ${jadwal.title} (${jadwal.courseName})`;
    
    const body = `Halo ${userName},

Ini adalah pengingat otomatis dari asisten belajar PippayLearning Anda:

Agenda: ${jadwal.title}
Mata Kuliah / Kegiatan: ${jadwal.courseName}
Tanggal: ${jadwal.date}
Waktu: ${jadwal.time} WIB
Lokasi / Link: ${jadwal.locationOrLink || '-'}
Catatan Tambahan:
${jadwal.notes || 'Tidak ada catatan tambahan.'}

---
Tips Belajar:
- Luangkan waktu 30-45 menit untuk meninjau kembali ringkasan materi di PippayLearning.
- Kerjakan kuis latihan soal sebelum waktu pertemuan dimulai.

Semangat belajarnya!
PippayLearning AI Assistant`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f0f15; color: #f1f5f9; border-radius: 16px; border: 1px solid #282838;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #a855f7; font-size: 24px; margin: 0;">PippayLearning</h1>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Personal Academic & Study Assistant</p>
        </div>
        
        <div style="background: #181824; border: 1px solid #333348; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <span style="display: inline-block; padding: 4px 10px; background: rgba(168, 85, 247, 0.2); color: #c084fc; border-radius: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
            ${typeLabels[jadwal.type] || 'Pengingat'}
          </span>
          <h2 style="color: #ffffff; font-size: 18px; margin: 12px 0 6px 0;">${jadwal.title}</h2>
          <p style="color: #cbd5e1; font-size: 13px; margin: 0;">Mata Kuliah: <strong>${jadwal.courseName}</strong></p>
        </div>

        <div style="background: #12121c; border-radius: 12px; padding: 16px; font-size: 13px; line-height: 1.6; color: #cbd5e1; margin-bottom: 20px;">
          <p style="margin: 0 0 8px 0;"><strong>Tanggal:</strong> ${jadwal.date}</p>
          <p style="margin: 0 0 8px 0;"><strong>Waktu:</strong> ${jadwal.time} WIB</p>
          <p style="margin: 0 0 8px 0;"><strong>Lokasi / Link:</strong> ${jadwal.locationOrLink || '-'}</p>
          <p style="margin: 0;"><strong>Catatan:</strong> ${jadwal.notes || '-'}</p>
        </div>

        <div style="text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #282838; padding-top: 16px;">
          Email ini dikirim otomatis oleh PippayLearning via Resend API.
        </div>
      </div>
    `;

    // 1. Try Resend API
    const resendKey = settings.resendApiKey?.trim();
    if (resendKey) {
      const sender = settings.resendSenderEmail?.trim() || 'PippayLearning <onboarding@resend.dev>';
      try {
        await sendViaResendEndpoint(resendKey, sender, recipientEmail, subject, htmlContent, body);
        return {
          success: true,
          message: `Email pengingat berhasil dikirim ke ${recipientEmail} via Resend API!`,
          previewContent: { to: recipientEmail, subject, body }
        };
      } catch (error: any) {
        console.error('Resend API error:', error);
        return {
          success: false,
          message: `Gagal mengirim via Resend: ${error.message}. Periksa Resend API Key Anda di menu Pengaturan.`,
          previewContent: { to: recipientEmail, subject, body }
        };
      }
    }

    // 2. Check if EmailJS is configured
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

    // 3. Fallback simulation with preview
    return {
      success: true,
      message: `Pengingat berhasil disimulasikan ke ${recipientEmail}. Masukkan Resend API Key di menu Pengaturan untuk pengiriman riil.`,
      previewContent: {
        to: recipientEmail,
        subject,
        body,
      }
    };
  },

  /**
   * Mengirim tes email untuk memvalidasi Resend API Key
   */
  async testResendApiKey(apiKey: string, toEmail: string, fromEmail?: string): Promise<{ success: boolean; message: string }> {
    const sender = fromEmail?.trim() || 'PippayLearning <onboarding@resend.dev>';
    const subject = '[PippayLearning] Tes Koneksi Resend API Berhasil!';
    const html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #0f0f15; color: #f1f5f9; border-radius: 16px;">
        <h2 style="color: #a855f7;">Koneksi Resend API Berhasil!</h2>
        <p style="color: #cbd5e1; font-size: 14px;">Selamat! Resend API Key Anda telah terhubung dengan PippayLearning. Sekarang semua pengingat jadwal kuliah dan ujian akan otomatis terkirim ke email Anda.</p>
      </div>
    `;
    const text = 'Selamat! Resend API Key Anda telah terhubung dengan PippayLearning.';

    try {
      await sendViaResendEndpoint(apiKey, sender, toEmail, subject, html, text);
      return {
        success: true,
        message: `Email tes berhasil dikirim ke ${toEmail} via Resend!`
      };
    } catch (e: any) {
      return {
        success: false,
        message: `Gagal mengirim email tes: ${e.message}`
      };
    }
  }
};
