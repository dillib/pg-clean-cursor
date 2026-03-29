import nodemailer from "nodemailer";

export interface BookingEmailData {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  interestArea: string;
  slotDatetime: Date;
  userTimezone?: string | null;
}

export function isSmtpConfigured(): boolean {
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

const CET_TZ = "Europe/Berlin";

function formatInTz(slot: Date, tz: string, includeDate = true): string {
  const end = new Date(slot.getTime() + 30 * 60 * 1000);
  const dateOpts: Intl.DateTimeFormatOptions = {
    timeZone: tz,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const timeOpts: Intl.DateTimeFormatOptions = {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  const tzAbbr =
    new Intl.DateTimeFormat("en", { timeZone: tz, timeZoneName: "short" })
      .formatToParts(slot)
      .find(p => p.type === "timeZoneName")?.value ?? tz;
  const startTime = new Intl.DateTimeFormat("en-GB", timeOpts).format(slot);
  const endTime = new Intl.DateTimeFormat("en-GB", timeOpts).format(end);
  if (includeDate) {
    const dateStr = new Intl.DateTimeFormat("en-GB", dateOpts).format(slot);
    return `${dateStr} · ${startTime}–${endTime} ${tzAbbr}`;
  }
  return `${startTime}–${endTime} ${tzAbbr}`;
}

/** Returns the primary slot label for emails.
 *  If the user's timezone is known and differs from CET, shows local time first with CET in brackets.
 *  Otherwise shows CET only. */
function formatSlotForEmail(slot: Date, userTimezone?: string | null): string {
  const cetLabel = formatInTz(slot, CET_TZ);
  if (!userTimezone || userTimezone === CET_TZ || userTimezone.startsWith("Europe/")) {
    return cetLabel;
  }
  const localLabel = formatInTz(slot, userTimezone);
  const cetTimeOnly = formatInTz(slot, CET_TZ, false);
  return `${localLabel}<br><span style="font-size:13px;color:#888;">(= ${cetTimeOnly})</span>`;
}

/** Plain-text slot label (no HTML) for subject lines and plain contexts. */
function formatSlotPlain(slot: Date, userTimezone?: string | null): string {
  if (!userTimezone || userTimezone === CET_TZ || userTimezone.startsWith("Europe/")) {
    return formatInTz(slot, CET_TZ);
  }
  const local = formatInTz(slot, userTimezone);
  const cetTime = formatInTz(slot, CET_TZ, false);
  return `${local} (= ${cetTime})`;
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
    "ORGANIZER;CN=PhotonicTag:mailto:sales@photonictag.com",
    `ATTENDEE;RSVP=TRUE;CN=${escapeICS(booking.name)}:mailto:${booking.email}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

// ─── Shared layout helpers ───────────────────────────────────────────────────

function emailHeader(accentLine: string) {
  return `
  <tr>
    <td style="background:#0f0f0f;padding:28px 40px;border-bottom:3px solid #FDB813;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <span style="color:#FDB813;font-size:18px;font-weight:700;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">PhotonicTag</span>
          </td>
          <td align="right">
            <span style="color:#666;font-size:11px;font-family:Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;">${accentLine}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function emailFooter() {
  return `
  <tr>
    <td style="background:#0f0f0f;padding:20px 40px;border-top:1px solid #222;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0;color:#555;font-size:11px;font-family:Arial,sans-serif;line-height:1.6;">
              PhotonicTag GmbH &nbsp;·&nbsp; Digital Product Passports &nbsp;·&nbsp; EU ESPR Compliance<br>
              Questions? Reply to this email or visit <a href="https://photonictag.com" style="color:#FDB813;text-decoration:none;">photonictag.com</a>
            </p>
          </td>
          <td align="right">
            <span style="color:#333;font-size:10px;font-family:Arial,sans-serif;letter-spacing:1px;">IDENTITY, AT THE SPEED OF LIGHT.</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function slotCard(slotLabel: string, interestArea: string, company?: string | null) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;border-radius:6px;border-left:4px solid #FDB813;margin-bottom:28px;">
    <tr>
      <td style="padding:20px 24px;">
        <p style="margin:0 0 4px;color:#999;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-family:Arial,sans-serif;">Date &amp; Time</p>
        <p style="margin:0 0 16px;color:#0f0f0f;font-size:17px;font-weight:700;font-family:Arial,sans-serif;">${slotLabel}</p>
        <p style="margin:0 0 4px;color:#999;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-family:Arial,sans-serif;">Topic</p>
        <p style="margin:0${company ? " 0 16px" : ""};color:#0f0f0f;font-size:15px;font-family:Arial,sans-serif;">${interestArea}</p>
        ${company ? `<p style="margin:0 0 4px;color:#999;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-family:Arial,sans-serif;">Company</p><p style="margin:0;color:#0f0f0f;font-size:15px;font-family:Arial,sans-serif;">${company}</p>` : ""}
      </td>
    </tr>
  </table>`;
}

function wrapEmail(bodyRows: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f0f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.12);">
        ${bodyRows}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Confirmation Email ───────────────────────────────────────────────────────

export async function sendBookingConfirmation(booking: BookingEmailData): Promise<void> {
  if (!isSmtpConfigured()) {
    console.log("[Email] SMTP not configured — skipping confirmation email for", booking.email);
    return;
  }

  const slotLabelHtml = formatSlotForEmail(booking.slotDatetime, booking.userTimezone);
  const slotLabelPlain = formatSlotPlain(booking.slotDatetime, booking.userTimezone);
  const from = process.env.SMTP_FROM || "PhotonicTag <sales@photonictag.com>";
  const icsContent = generateICS(booking);

  const body = `
    ${emailHeader("Demo Confirmation")}
    <tr>
      <td style="padding:36px 40px 28px;">
        <h1 style="margin:0 0 6px;color:#0f0f0f;font-size:26px;font-weight:700;font-family:Arial,sans-serif;">You're confirmed!</h1>
        <p style="margin:0 0 28px;color:#555;font-size:15px;font-family:Arial,sans-serif;line-height:1.6;">
          Hi ${booking.name}, we're looking forward to showing you what PhotonicTag can do. Your 30-minute demo is locked in below.
        </p>
        ${slotCard(slotLabelHtml, booking.interestArea, booking.company)}
        <p style="margin:0 0 8px;color:#0f0f0f;font-size:14px;font-weight:700;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">What to expect</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#444;font-size:14px;font-family:Arial,sans-serif;">
              ✦ &nbsp;A live walkthrough of the PhotonicTag platform tailored to your interest area
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#444;font-size:14px;font-family:Arial,sans-serif;">
              ✦ &nbsp;A real Digital Product Passport demo with EU ESPR compliance fields
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#444;font-size:14px;font-family:Arial,sans-serif;">
              ✦ &nbsp;Q&amp;A on SAP integration, data flows, and your specific use case
            </td>
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbf0;border-radius:6px;margin-bottom:28px;">
          <tr>
            <td style="padding:16px 20px;">
              <p style="margin:0;color:#7a5c00;font-size:13px;font-family:Arial,sans-serif;line-height:1.6;">
                📎 &nbsp;The <strong>.ics calendar file</strong> is attached to this email. Open it to add this event to Outlook, Apple Calendar, or Google Calendar with one click.<br>
                📹 &nbsp;A <strong>video call link</strong> will be sent to you before the session.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:0;color:#888;font-size:13px;font-family:Arial,sans-serif;">
          Need to reschedule? <a href="https://photonictag.com/book-demo" style="color:#FDB813;text-decoration:none;font-weight:600;">Book a new slot →</a>
        </p>
      </td>
    </tr>
    ${emailFooter()}`;

  const transporter = createTransporter();
  await transporter.sendMail({
    from,
    to: booking.email,
    subject: `Confirmed: Your PhotonicTag demo — ${slotLabelPlain}`,
    html: wrapEmail(body),
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

// ─── Reminder Email ───────────────────────────────────────────────────────────

export async function sendReminderEmail(
  booking: BookingEmailData,
  type: "24h" | "1h"
): Promise<void> {
  if (!isSmtpConfigured()) {
    console.log(`[Email] SMTP not configured — skipping ${type} reminder for`, booking.email);
    return;
  }

  const slotLabelHtml = formatSlotForEmail(booking.slotDatetime, booking.userTimezone);
  const slotLabelPlain = formatSlotPlain(booking.slotDatetime, booking.userTimezone);
  const from = process.env.SMTP_FROM || "PhotonicTag <sales@photonictag.com>";
  const icsContent = generateICS(booking);

  const is1h = type === "1h";
  const timeLabel = is1h ? "in 1 hour" : "tomorrow";
  const subjectPrefix = is1h ? "Starting in 1 hour" : "Reminder: Tomorrow";

  const body = `
    ${emailHeader(is1h ? "Starting Soon" : "Demo Reminder")}
    <tr>
      <td style="padding:36px 40px 28px;">
        ${is1h
          ? `<div style="display:inline-block;background:#FDB813;color:#0f0f0f;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;font-family:Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Starting in 1 hour</div>`
          : `<div style="display:inline-block;background:#f0f0f0;color:#555;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;font-family:Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Demo Tomorrow</div>`
        }
        <h1 style="margin:0 0 6px;color:#0f0f0f;font-size:24px;font-weight:700;font-family:Arial,sans-serif;">
          Your PhotonicTag demo is ${timeLabel}
        </h1>
        <p style="margin:0 0 28px;color:#555;font-size:15px;font-family:Arial,sans-serif;line-height:1.6;">
          Hi ${booking.name}, this is a friendly reminder about your upcoming PhotonicTag demo session.
        </p>
        ${slotCard(slotLabelHtml, booking.interestArea, booking.company)}
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbf0;border-radius:6px;margin-bottom:28px;">
          <tr>
            <td style="padding:16px 20px;">
              <p style="margin:0;color:#7a5c00;font-size:13px;font-family:Arial,sans-serif;line-height:1.8;">
                ${is1h
                  ? "📹 &nbsp;Check your inbox for the <strong>video call link</strong> from our team.<br>📎 &nbsp;The calendar invite attached to your confirmation email has all the details."
                  : "📎 &nbsp;Your <strong>calendar invite</strong> is attached to your original confirmation email.<br>📹 &nbsp;A <strong>video call link</strong> will be sent to you before the session starts."
                }
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:0;color:#888;font-size:13px;font-family:Arial,sans-serif;">
          Need to reschedule? <a href="https://photonictag.com/book-demo" style="color:#FDB813;text-decoration:none;font-weight:600;">Book a new slot →</a>
        </p>
      </td>
    </tr>
    ${emailFooter()}`;

  const transporter = createTransporter();
  await transporter.sendMail({
    from,
    to: booking.email,
    subject: `${subjectPrefix}: PhotonicTag demo — ${slotLabelPlain}`,
    html: wrapEmail(body),
    ...(type === "24h" && {
      attachments: [
        {
          filename: "photonictag-demo.ics",
          content: icsContent,
          contentType: "text/calendar; charset=utf-8; method=REQUEST",
        },
      ],
    }),
  });

  console.log(`[Email] ${type} reminder sent to`, booking.email);
}

// ─── Team Notification Email ──────────────────────────────────────────────────

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

  const slotLabelPlain = formatSlotPlain(booking.slotDatetime, booking.userTimezone);
  const from = process.env.SMTP_FROM || "PhotonicTag <sales@photonictag.com>";

  const body = `
    ${emailHeader("New Booking Alert")}
    <tr>
      <td style="padding:32px 40px;">
        <h1 style="margin:0 0 6px;color:#0f0f0f;font-size:22px;font-weight:700;font-family:Arial,sans-serif;">New demo booked</h1>
        <p style="margin:0 0 24px;color:#555;font-size:14px;font-family:Arial,sans-serif;">A prospect has scheduled a demo through the website.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:28px;">
          ${[
            ["Name", booking.name],
            ["Email", `<a href="mailto:${booking.email}" style="color:#FDB813;text-decoration:none;">${booking.email}</a>`],
            ...(booking.company ? [["Company", booking.company]] : []),
            ["Interest Area", booking.interestArea],
            ["Slot", `<strong>${slotLabelPlain}</strong>`],
          ].map(([label, value]) => `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;width:120px;font-family:Arial,sans-serif;">${label}</td>
            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#0f0f0f;font-size:14px;font-family:Arial,sans-serif;">${value}</td>
          </tr>`).join("")}
        </table>
        <a href="https://photonictag.com/crm" style="display:inline-block;background:#FDB813;color:#0f0f0f;text-decoration:none;padding:12px 28px;border-radius:4px;font-weight:700;font-size:13px;font-family:Arial,sans-serif;letter-spacing:0.5px;">View in CRM →</a>
      </td>
    </tr>
    ${emailFooter()}`;

  const transporter = createTransporter();
  await transporter.sendMail({
    from,
    to: notifyEmail,
    subject: `New demo booked: ${booking.name}${booking.company ? ` (${booking.company})` : ""} — ${slotLabelPlain}`,
    html: wrapEmail(body),
  });

  console.log("[Email] Team notification sent to", notifyEmail);
}
