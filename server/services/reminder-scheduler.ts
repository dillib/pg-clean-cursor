import { storage } from "../storage";
import { sendReminderEmail, isSmtpConfigured } from "./email";
import type { DemoBooking } from "@shared/schema";

const CHECK_INTERVAL_MS = 10 * 60 * 1000; // every 10 minutes

function hoursUntil(slot: Date): number {
  return (new Date(slot).getTime() - Date.now()) / (60 * 60 * 1000);
}

async function processReminders(): Promise<void> {
  if (!isSmtpConfigured()) return;

  let bookings: DemoBooking[];
  try {
    bookings = await storage.getUpcomingBookingsForReminders();
  } catch (err) {
    console.error("[ReminderScheduler] Failed to fetch bookings:", err);
    return;
  }

  for (const booking of bookings) {
    const hours = hoursUntil(booking.slotDatetime);
    const emailData = {
      id: booking.id,
      name: booking.name,
      email: booking.email,
      company: booking.company,
      interestArea: booking.interestArea,
      slotDatetime: new Date(booking.slotDatetime),
      userTimezone: booking.userTimezone,
    };

    // 24h reminder: send when 22–26h before the slot (window accounts for 10-min check cadence)
    if (hours <= 26 && hours >= 22 && !booking.reminder24hSentAt) {
      try {
        await sendReminderEmail(emailData, "24h");
        await storage.markReminder24hSent(booking.id);
        console.log(`[ReminderScheduler] 24h reminder sent for booking ${booking.id}`);
      } catch (err) {
        console.error(`[ReminderScheduler] Failed to send 24h reminder for ${booking.id}:`, err);
      }
    }

    // 1h reminder: send when 0.75–1.5h before the slot
    if (hours <= 1.5 && hours >= 0.75 && !booking.reminder1hSentAt) {
      try {
        await sendReminderEmail(emailData, "1h");
        await storage.markReminder1hSent(booking.id);
        console.log(`[ReminderScheduler] 1h reminder sent for booking ${booking.id}`);
      } catch (err) {
        console.error(`[ReminderScheduler] Failed to send 1h reminder for ${booking.id}:`, err);
      }
    }
  }
}

export function startReminderScheduler(): void {
  console.log("[ReminderScheduler] Starting — checking every 10 minutes");
  // Run once immediately on startup to catch any missed reminders
  processReminders().catch(console.error);
  setInterval(() => {
    processReminders().catch(console.error);
  }, CHECK_INTERVAL_MS);
}
