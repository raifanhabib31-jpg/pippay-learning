import { getStore } from '@netlify/blobs';
import type { Config } from '@netlify/functions';

interface Jadwal {
  id: string;
  title: string;
  courseName: string;
  type: string;
  date: string;
  time: string;
  locationOrLink?: string;
  notes?: string;
  isRecurring?: boolean;
  dayOfWeek?: string;
  reminderSent?: boolean;
  reminderSentH1?: boolean;
}

interface AppSettings {
  resendApiKey?: string;
  resendSenderEmail?: string;
  userEmail?: string;
  userName?: string;
  autoH1Reminder?: boolean;
}

// Build Resend-safe sender
function formatSender(sender?: string): string {
  if (!sender?.trim()) return 'PippayLearning <onboarding@resend.dev>';
  const clean = sender.trim();
  if (
    clean.includes('@gmail.com') ||
    clean.includes('@yahoo.com') ||
    clean.includes('@outlook.com') ||
    clean.includes('@hotmail.com')
  ) {
    return 'PippayLearning <onboarding@resend.dev>';
  }
  if (!clean.includes('<') && clean.includes('@')) return `PippayLearning <${clean}>`;
  return clean;
}

async function sendEmail(apiKey: string, from: string, to: string, subject: string, html: string, text: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || `HTTP ${res.status}`);
  }
}

function buildEmailContent(jadwal: Jadwal, userName: string) {
  const typeLabels: Record<string, string> = {
    ujian: 'PENGINGAT UJIAN',
    tugas: 'DEADLINE TUGAS',
    kuliah: 'JADWAL KULIAH',
    belajar: 'SESI BELAJAR',
    organisasi: 'AGENDA ORGANISASI',
    lomba: 'DEADLINE LOMBA',
  };

  const label = typeLabels[jadwal.type] || 'Pengingat';
  const subject = `[PippayLearning] ${label}: ${jadwal.title} (${jadwal.courseName}) — BESOK!`;

  const text = `Halo ${userName},

Pengingat otomatis H-1 dari PippayLearning:

Agenda: ${jadwal.title}
Mata Kuliah / Kegiatan: ${jadwal.courseName}
Tanggal: ${jadwal.date}
Waktu: ${jadwal.time} WIB
Lokasi / Link: ${jadwal.locationOrLink || '-'}
Catatan: ${jadwal.notes || '-'}

Semangat belajarnya!
PippayLearning AI Assistant`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f0f15; color: #f1f5f9; border-radius: 16px; border: 1px solid #282838;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #a855f7; font-size: 24px; margin: 0;">PippayLearning</h1>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Personal Academic &amp; Study Assistant</p>
      </div>

      <div style="background: #1a1a2e; border: 1px solid #a855f7; border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: center;">
        <span style="font-size: 28px;">⏰</span>
        <h2 style="color: #c084fc; font-size: 16px; margin: 8px 0 4px 0;">Agenda Kamu BESOK!</h2>
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">Siapkan dirimu sekarang</p>
      </div>

      <div style="background: #181824; border: 1px solid #333348; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 10px; background: rgba(168, 85, 247, 0.2); color: #c084fc; border-radius: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
          ${label}
        </span>
        <h2 style="color: #ffffff; font-size: 18px; margin: 12px 0 6px 0;">${jadwal.title}</h2>
        <p style="color: #cbd5e1; font-size: 13px; margin: 0;">Mata Kuliah: <strong>${jadwal.courseName}</strong></p>
      </div>

      <div style="background: #12121c; border-radius: 12px; padding: 16px; font-size: 13px; line-height: 1.6; color: #cbd5e1; margin-bottom: 20px;">
        <p style="margin: 0 0 8px 0;"><strong>📅 Tanggal:</strong> ${jadwal.date}</p>
        <p style="margin: 0 0 8px 0;"><strong>⏱ Waktu:</strong> ${jadwal.time} WIB</p>
        <p style="margin: 0 0 8px 0;"><strong>📍 Lokasi / Link:</strong> ${jadwal.locationOrLink || '-'}</p>
        <p style="margin: 0;"><strong>📝 Catatan:</strong> ${jadwal.notes || '-'}</p>
      </div>

      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 14px; margin-bottom: 20px;">
        <p style="color: #6ee7b7; font-size: 13px; margin: 0; font-weight: 600;">💡 Tips Persiapan:</p>
        <ul style="color: #a7f3d0; font-size: 12px; margin: 8px 0 0 0; padding-left: 18px;">
          <li>Luangkan 30-45 menit untuk review ringkasan materi di PippayLearning</li>
          <li>Kerjakan kuis latihan soal untuk memantapkan pemahaman</li>
          <li>Pastikan semua keperluan (alat tulis, kartu ujian, dll.) sudah siap</li>
        </ul>
      </div>

      <div style="text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #282838; padding-top: 16px;">
        Email ini dikirim otomatis oleh PippayLearning Scheduled Reminder · Powered by Netlify
      </div>
    </div>
  `;

  return { subject, html, text };
}

// Scheduled: runs every day at 00:00 UTC (07:00 WIB)
export default async () => {
  console.log('[PippayLearning] Scheduled H-1 reminder check started:', new Date().toISOString());

  try {
    const store = getStore('pippay-data');

    // Load settings and jadwal from Netlify Blobs
    const settings: AppSettings = await store.get('settings', { type: 'json' }) ?? {};
    const jadwalList: Jadwal[] = await store.get('jadwal', { type: 'json' }) ?? [];

    // Check if auto reminder is enabled and API key exists
    if (settings.autoH1Reminder === false) {
      console.log('[PippayLearning] autoH1Reminder is disabled. Skipping.');
      return;
    }

    const resendKey = settings.resendApiKey?.trim();
    if (!resendKey) {
      console.log('[PippayLearning] No Resend API key configured. Skipping.');
      return;
    }

    const recipientEmail = settings.userEmail?.trim();
    if (!recipientEmail) {
      console.log('[PippayLearning] No recipient email configured. Skipping.');
      return;
    }

    // Compute tomorrow's date string (YYYY-MM-DD)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const tomorrowDayName = dayNames[tomorrow.getDay()];

    const from = formatSender(settings.resendSenderEmail);
    const userName = settings.userName || 'Mahasiswa';

    let sentCount = 0;
    let hasUpdates = false;
    const updatedJadwal = await Promise.all(
      jadwalList.map(async (item) => {
        const isTomorrow =
          item.date === tomorrowStr ||
          (item.isRecurring && item.dayOfWeek === tomorrowDayName);

        if (isTomorrow && !item.reminderSentH1) {
          try {
            console.log(`[PippayLearning] Sending H-1 reminder for: ${item.title}`);
            const { subject, html, text } = buildEmailContent(item, userName);
            await sendEmail(resendKey, from, recipientEmail, subject, html, text);
            sentCount++;
            hasUpdates = true;
            return { ...item, reminderSentH1: true };
          } catch (e: any) {
            console.error(`[PippayLearning] Failed to send reminder for ${item.title}:`, e.message);
          }
        }
        return item;
      })
    );

    // Save updated jadwal back to Blobs if any reminders were sent
    if (hasUpdates) {
      await store.setJSON('jadwal', updatedJadwal);
      console.log(`[PippayLearning] ${sentCount} H-1 reminder(s) sent successfully.`);
    } else {
      console.log('[PippayLearning] No H-1 reminders to send today.');
    }
  } catch (err: any) {
    console.error('[PippayLearning] Scheduled function error:', err.message);
  }
};

// Run every day at 00:00 UTC = 07:00 WIB
export const config: Config = {
  schedule: '0 0 * * *',
};
