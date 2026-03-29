import nodemailer from "nodemailer";

interface BookingEmailData {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  interestArea: string;
  slotDatetime: Date;
}

function isSmtpConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function formatSlotCET(slot: Date): string {
  const cetMs = slot.getTime() + 1 * 60 * 60 * 1000;
  const d = new Date(cetMs);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const day = days[d.getUTCDay()];
  const date = d.getUTCDate();
  const month = months[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const hours = d.getUTCHours().toString().padStart(2, "0");
  const minutes = d.getUTCMinutes().toString().padStart(2, "0");
  const endMs = cetMs + 30 * 60 * 1000;
  const endD = new Date(endMs);
  const endHours = endD.getUTCHours().toString().padStart(2, "0");
  const endMinutes = endD.getUTCMinutes().toString().padStart(2, "0");
  return `${day}, ${date} ${month} ${year} · ${hours}:${minutes}–${endHours}:${endMinutes} CET`;
}

function escapeICS(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function generateICS(booking: BookingEmailData): string {
  const start = new Date(booking.slotDatetime);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const formatDT = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const uid = `demo-booking-${booking.id}@photonictag.com`;
  const summary = escapeICS(`PhotonicTag Demo — ${booking.name}`);
  const description = escapeICS(
    `Demo scheduled with PhotonicTag\nInterest area: ${booking.interestArea}\nCompany: ${booking.company || "N/A"}\nContact: ${booking.email}\n\nA PhotonicTag team member will send a video call link before the session.`
  );
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PhotonicTag//Demo Scheduling//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatDT(new Date())}Z`,
    `DTSTART:${formatDT(start)}Z`,
    `DTEND:${formatDT(end)}Z`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    "ORGANIZER;CN=PhotonicTag:mailto:demo@photonictag.com",
    `ATTENDEE;RSVP=TRUE;CN=${escapeICS(booking.name)}:mailto:${booking.email}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export async function sendBookingConfirmation(booking: BookingEmailData): Promise<void> {
  if (!isSmtpConfigured()) {
    console.log("[Email] SMTP not configured — skipping booking confirmation email for", booking.email);
    return;
  }

  const slotLabel = formatSlotCET(booking.slotDatetime);
  const from = process.env.SMTP_FROM || "PhotonicTag <demo@photonictag.com>";
  const icsContent = generateICS(booking);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8f8f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#0a0a0a;padding:32px 40px;">
            <span style="color:#FDB813;font-size:20px;font-weight:700;letter-spacing:1px;">PhotonicTag</span>
            <span style="color:#666;font-size:13px;margin-left:12px;">Identity, at the speed of light.</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 8px;color:#0a0a0a;font-size:24px;">Your demo is confirmed!</h1>
            <p style="margin:0 0 32px;color:#555;font-size:16px;">Hi ${booking.name}, we're looking forward to showing you what PhotonicTag can do.</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;border-radius:6px;margin-bottom:32px;">
              <tr>
                <td style="padding:24px;">
                  <p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Date &amp; Time</p>
                  <p style="margin:0 0 20px;color:#0a0a0a;font-size:18px;font-weight:600;">${slotLabel}</p>
                  <p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Topic</p>
                  <p style="margin:0 0 20px;color:#0a0a0a;font-size:16px;">${booking.interestArea}</p>
                  ${booking.company ? `<p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Company</p><p style="margin:0;color:#0a0a0a;font-size:16px;">${booking.company}</p>` : ""}
                </td>
              </tr>
            </table>

            <p style="margin:0 0 16px;color:#555;font-size:15px;">
              The <strong>.ics calendar file</strong> is attached — open it to add this event directly to your calendar (works with Outlook, Apple Calendar, and Google Calendar).
            </p>
            <p style="margin:0 0 32px;color:#555;font-size:15px;">
              A member of our team will send you a video call link before the session. If you need to reschedule, just <a href="https://photonictag.com/book-demo" style="color:#FDB813;">book a new slot</a> or reply to this email.
            </p>

            <hr style="border:none;border-top:1px solid #eee;margin:0 0 24px;">
            <p style="margin:0;color:#999;font-size:13px;">PhotonicTag · Digital Product Passports · EU ESPR Compliance</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const transporter = createTransporter();
  await transporter.sendMail({
    from,
    to: booking.email,
    subject: `Your PhotonicTag demo is confirmed — ${slotLabel}`,
    html,
    attachments: [
      {
        filename: "photonictag-demo.ics",
        content: icsContent,
        contentType: "text/calendar; charset=utf-8; method=REQUEST",
      },
    ],
  });

  console.log("[Email] Booking confirmation sent to", booking.email);
}

export async function sendTeamNotification(booking: BookingEmailData): Promise<void> {
  if (!isSmtpConfigured()) {
    console.log("[Email] SMTP not configured — skipping team notification for booking", booking.id);
    return;
  }
  const notifyEmail = process.env.NOTIFY_EMAIL;
  if (!notifyEmail) {
    console.log("[Email] NOTIFY_EMAIL not set — skipping team notification");
    return;
  }

  const slotLabel = formatSlotCET(booking.slotDatetime);
  const from = process.env.SMTP_FROM || "PhotonicTag <demo@photonictag.com>";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8f8f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#FDB813;padding:20px 40px;">
            <span style="color:#0a0a0a;font-size:18px;font-weight:700;">New Demo Booking</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:0 0 16px;color:#555;font-size:13px;text-transform:uppercase;letter-spacing:1px;width:140px;">Name</td>
                <td style="padding:0 0 16px;color:#0a0a0a;font-size:15px;font-weight:600;">${booking.name}</td>
              </tr>
              <tr>
                <td style="padding:0 0 16px;color:#555;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Email</td>
                <td style="padding:0 0 16px;"><a href="mailto:${booking.email}" style="color:#FDB813;">${booking.email}</a></td>
              </tr>
              ${booking.company ? `<tr><td style="padding:0 0 16px;color:#555;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Company</td><td style="padding:0 0 16px;color:#0a0a0a;font-size:15px;">${booking.company}</td></tr>` : ""}
              <tr>
                <td style="padding:0 0 16px;color:#555;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Interest</td>
                <td style="padding:0 0 16px;color:#0a0a0a;font-size:15px;">${booking.interestArea}</td>
              </tr>
              <tr>
                <td style="padding:0 0 0;color:#555;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Slot</td>
                <td style="padding:0 0 0;color:#0a0a0a;font-size:16px;font-weight:700;">${slotLabel}</td>
              </tr>
            </table>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
            <a href="https://photonictag.com/crm" style="display:inline-block;background:#0a0a0a;color:#FDB813;text-decoration:none;padding:12px 24px;border-radius:4px;font-weight:600;font-size:14px;">View in CRM →</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const transporter = createTransporter();
  await transporter.sendMail({
    from,
    to: notifyEmail,
    subject: `New demo booked: ${booking.name}${booking.company ? ` (${booking.company})` : ""} — ${slotLabel}`,
    html,
  });

  console.log("[Email] Team notification sent to", notifyEmail);
}
