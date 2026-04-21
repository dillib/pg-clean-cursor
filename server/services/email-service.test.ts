import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Captures the last payload passed to sendTransacEmail across tests.
const lastPayload: { value: any } = { value: null };
const sendTransacEmail = vi.fn(async (payload: any) => {
  lastPayload.value = payload;
  return { response: { statusCode: 201 }, body: { messageId: "test" } };
});
const setApiKey = vi.fn();

class TransactionalEmailsApi {
  setApiKey = setApiKey;
  sendTransacEmail = sendTransacEmail;
}

class SendSmtpEmail {
  sender: any;
  to: any;
  subject: any;
  htmlContent: any;
  textContent: any;
}

vi.mock("@getbrevo/brevo", () => ({
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys: { apiKey: "apiKey" },
  SendSmtpEmail,
}));

import { sendTransactionalEmail, type EmailType } from "./email-service";

beforeEach(() => {
  sendTransacEmail.mockClear();
  setApiKey.mockClear();
  lastPayload.value = null;
  delete process.env.BREVO_API_KEY;
  delete process.env.BREVO_SENDER_EMAIL;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("email-service stub mode", () => {
  it("logs and does not throw when BREVO_API_KEY is unset", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await expect(
      sendTransactionalEmail("lead-confirm", "user@example.com", { name: "Ada" }),
    ).resolves.toBeUndefined();
    expect(sendTransacEmail).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      "[email:stub] would send lead-confirm to user@example.com",
    );
  });

  it("stubs for every EmailType without throwing", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const types: EmailType[] = [
      "lead-confirm",
      "demo-booking-confirm",
      "partner-invite",
      "admin-alert",
    ];
    for (const t of types) {
      await expect(
        sendTransactionalEmail(t, "x@example.com", { name: "Test" }),
      ).resolves.toBeUndefined();
    }
    expect(sendTransacEmail).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledTimes(types.length);
  });
});

describe("email-service live mode", () => {
  beforeEach(() => {
    process.env.BREVO_API_KEY = "test-key";
    process.env.BREVO_SENDER_EMAIL = "sender@photonictag.com";
  });

  const cases: Array<{ type: EmailType; data: Record<string, unknown> }> = [
    { type: "lead-confirm", data: { name: "Ada Lovelace" } },
    {
      type: "demo-booking-confirm",
      data: { name: "Bob", slot: "2026-05-01T10:00:00Z", interestArea: "DPP" },
    },
    { type: "partner-invite", data: { name: "Carol", company: "Acme" } },
    { type: "admin-alert", data: { title: "High errors", message: "rate spiked" } },
  ];

  for (const { type, data } of cases) {
    it(`sends ${type} with correct to + non-empty subject/body`, async () => {
      const to = `${type}@example.com`;
      await sendTransactionalEmail(type, to, data);

      expect(sendTransacEmail).toHaveBeenCalledTimes(1);
      expect(setApiKey).toHaveBeenCalledWith("apiKey", "test-key");

      const p = lastPayload.value;
      expect(p).toBeTruthy();
      expect(p.to).toEqual([{ email: to }]);
      expect(p.sender.email).toBe("sender@photonictag.com");
      expect(typeof p.subject).toBe("string");
      expect(p.subject.length).toBeGreaterThan(0);
      expect(typeof p.htmlContent).toBe("string");
      expect(p.htmlContent.length).toBeGreaterThan(0);
      expect(typeof p.textContent).toBe("string");
      expect(p.textContent.length).toBeGreaterThan(0);
    });
  }

  it("does not throw when the Brevo API rejects", async () => {
    sendTransacEmail.mockRejectedValueOnce(new Error("boom"));
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      sendTransactionalEmail("lead-confirm", "user@example.com", { name: "Z" }),
    ).resolves.toBeUndefined();
    expect(errSpy).toHaveBeenCalled();
  });
});
