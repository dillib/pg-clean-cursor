import { useState, useEffect } from "react";

const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE",
  "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV",
  "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
]);

export type CurrencyCode = "EUR" | "USD";

interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  isEU: boolean;
  loading: boolean;
  setCurrency: (code: CurrencyCode) => void;
}

const CACHE_KEY = "pt_currency_country";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function getCached(): { countryCode: string; ts: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function setCache(countryCode: string) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ countryCode, ts: Date.now() }));
  } catch {}
}

const OVERRIDE_KEY = "pt_currency_override";

export function useCurrency(): CurrencyInfo {
  const [isEU, setIsEU] = useState(false);
  const [loading, setLoading] = useState(true);
  const [override, setOverride] = useState<CurrencyCode | null>(() => {
    try {
      return (localStorage.getItem(OVERRIDE_KEY) as CurrencyCode) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      const cached = getCached();
      if (cached) {
        if (!cancelled) {
          setIsEU(EU_COUNTRIES.has(cached.countryCode));
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4000) });
        if (!res.ok) throw new Error("geo failed");
        const data = await res.json();
        const countryCode: string = data.country_code ?? "";
        setCache(countryCode);
        if (!cancelled) {
          setIsEU(EU_COUNTRIES.has(countryCode));
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    detect();
    return () => { cancelled = true; };
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    try {
      localStorage.setItem(OVERRIDE_KEY, code);
    } catch {}
    setOverride(code);
  };

  const detectedCode: CurrencyCode = isEU ? "EUR" : "USD";
  const code: CurrencyCode = override ?? detectedCode;

  return {
    code,
    symbol: code === "EUR" ? "€" : "$",
    isEU: code === "EUR",
    loading,
    setCurrency,
  };
}
