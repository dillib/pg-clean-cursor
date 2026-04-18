import rateLimit from "express-rate-limit";

const isProd = process.env.NODE_ENV === "production";

/**
 * Factory that skips limiting in test environments.
 */
function limiter(opts: Parameters<typeof rateLimit>[0]) {
  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "test",
    ...opts,
  });
}

/**
 * Public scan endpoint — highest abuse surface.
 * 60 scans/min per IP is generous for a real consumer but blocks bots.
 */
export const scanLimiter = limiter({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Too many scan requests. Please try again in a minute." },
});

/**
 * Public form submissions (leads, demo bookings, product registration).
 * 10/min per IP prevents spam without blocking legitimate users.
 */
export const formLimiter = limiter({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many submissions. Please wait a minute and try again." },
});

/**
 * Identity validation — serial number lookups.
 */
export const identityLimiter = limiter({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Too many validation requests." },
});

/**
 * Auth endpoints (login, callback) — brute-force protection.
 */
export const authLimiter = limiter({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { error: "Too many authentication attempts. Please try again later." },
});

/**
 * AI enrichment — expensive, so cap tightly.
 */
export const aiLimiter = limiter({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "AI request limit reached. Please wait a minute." },
});

/**
 * General authenticated API — generous, just prevents runaway clients.
 */
export const apiLimiter = limiter({
  windowMs: 60 * 1000,
  max: 300,
  message: { error: "API rate limit exceeded." },
});
