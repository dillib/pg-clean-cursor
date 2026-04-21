import { useCallback, useEffect, useState } from "react";

export const COOKIE_CONSENT_KEY = "photonictag:cookie-consent";

export type CookieConsent = {
  essential: true;
  analytics: boolean;
  consentedAt: string;
};

function readConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (
      parsed &&
      parsed.essential === true &&
      typeof parsed.analytics === "boolean" &&
      typeof parsed.consentedAt === "string"
    ) {
      return parsed as CookieConsent;
    }
    return null;
  } catch {
    return null;
  }
}

export function useCookieConsent() {
  const [consent, setConsentState] = useState<CookieConsent | null>(() => readConsent());

  // Keep state in sync across tabs/windows.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: StorageEvent) => {
      if (event.key === COOKIE_CONSENT_KEY) {
        setConsentState(readConsent());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const setConsent = useCallback((next: { analytics: boolean }) => {
    const record: CookieConsent = {
      essential: true,
      analytics: next.analytics,
      consentedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(record));
    } catch {
      // localStorage may be unavailable (private mode, quota); keep state in memory.
    }
    setConsentState(record);
  }, []);

  const resetConsent = useCallback(() => {
    try {
      window.localStorage.removeItem(COOKIE_CONSENT_KEY);
    } catch {
      // ignore
    }
    setConsentState(null);
  }, []);

  return { consent, setConsent, resetConsent };
}
