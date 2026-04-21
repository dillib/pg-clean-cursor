export type EmailType =
  | "lead-confirm"
  | "demo-booking-confirm"
  | "partner-invite"
  | "admin-alert";

interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function render(type: EmailType, data: Record<string, unknown>): RenderedEmail {
  const name = esc((data.name as string) ?? "there");
  const appUrl =
    (typeof data.appUrl === "string" && data.appUrl) ||
    process.env.APP_BASE_URL ||
    "https://photonictag.com";

  switch (type) {
    case "lead-confirm": {
      const subject = "Thanks for reaching out to PhotonicTag";
      const html =
        `<p>Hi ${name},</p>` +
        `<p>Thanks for contacting PhotonicTag. We received your enquiry and a member of our team will reply within one business day.</p>` +
        `<p>In the meantime you can explore our <a href="${esc(appUrl)}">Digital Product Passport platform</a>.</p>` +
        `<p>— The PhotonicTag team</p>`;
      const text =
        `Hi ${name},\n\n` +
        `Thanks for contacting PhotonicTag. We received your enquiry and a team member will reply within one business day.\n\n` +
        `Learn more: ${appUrl}\n\n— The PhotonicTag team`;
      return { subject, html, text };
    }
    case "demo-booking-confirm": {
      const slot = esc((data.slot as string) ?? "your scheduled time");
      const subject = `Your PhotonicTag demo is confirmed — ${slot}`;
      const html =
        `<p>Hi ${name},</p>` +
        `<p>Your PhotonicTag demo is confirmed for <strong>${slot}</strong>.</p>` +
        `<p>We'll send the video-call link before the session starts.</p>` +
        `<p>— The PhotonicTag team</p>`;
      const text =
        `Hi ${name},\n\n` +
        `Your PhotonicTag demo is confirmed for ${slot}.\n` +
        `We'll send the video-call link before the session starts.\n\n— The PhotonicTag team`;
      return { subject, html, text };
    }
    case "partner-invite": {
      const subject = "You've been invited to the PhotonicTag partner portal";
      const html =
        `<p>Hi ${name},</p>` +
        `<p>You've been invited to join the PhotonicTag partner portal.</p>` +
        `<p>Sign in at <a href="${esc(appUrl)}/partner/login">${esc(appUrl)}/partner/login</a> using the credentials provided by your PhotonicTag contact.</p>` +
        `<p>— The PhotonicTag team</p>`;
      const text =
        `Hi ${name},\n\n` +
        `You've been invited to the PhotonicTag partner portal.\n` +
        `Sign in: ${appUrl}/partner/login\n\n— The PhotonicTag team`;
      return { subject, html, text };
    }
    case "admin-alert": {
      const message = esc((data.message as string) ?? "An admin alert was triggered.");
      const subject = `PhotonicTag admin alert: ${String(data.title ?? "attention required")}`;
      const html =
        `<p><strong>PhotonicTag admin alert</strong></p>` +
        `<p>${message}</p>` +
        `<p>Open the <a href="${esc(appUrl)}/admin">admin console</a> for details.</p>`;
      const text =
        `PhotonicTag admin alert\n\n${message}\n\nAdmin console: ${appUrl}/admin`;
      return { subject, html, text };
    }
  }
}

/** Sends a transactional email via Brevo; stubs to console when BREVO_API_KEY is unset. */
export async function sendTransactionalEmail(
  type: EmailType,
  to: string,
  data: Record<string, unknown>,
): Promise<void> {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.log(`[email:stub] would send ${type} to ${to}`);
      return;
    }

    const sender =
      process.env.BREVO_SENDER_EMAIL || "no-reply@photonictag.com";

    const { subject, html, text } = render(type, data);

    // Dynamic import so the SDK isn't required at import-time and tests can mock it.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const brevo: any = await import("@getbrevo/brevo");
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      apiKey,
    );

    const payload = new brevo.SendSmtpEmail();
    payload.sender = { email: sender, name: "PhotonicTag" };
    payload.to = [{ email: to }];
    payload.subject = subject;
    payload.htmlContent = html;
    payload.textContent = text;

    await apiInstance.sendTransacEmail(payload);
    console.log(`[email] sent ${type} to ${to}`);
  } catch (err) {
    console.error(`[email] failed to send ${type} to ${to}:`, err);
  }
}
