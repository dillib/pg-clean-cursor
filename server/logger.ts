// Structured logger singleton for PhotonicTag.
//
// Usage:
//   import { logger } from "./logger";
//   logger.info({ productId }, "product created");
//
// In request handlers prefer `req.log` (attached by pino-http) so log lines
// automatically carry the request id.

import pino, { type Logger, type LoggerOptions } from "pino";

const level = process.env.LOG_LEVEL || "info";
const env = process.env.NODE_ENV || "dev";
const isProd = env === "production";

// Fields that must never leak to logs. Pino's redact paths support wildcards
// at any single level; we cover the common shapes (req headers, user payloads,
// nested config objects).
const redactPaths = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.headers['set-cookie']",
  "res.headers['set-cookie']",
  "*.password",
  "*.passwordHash",
  "*.token",
  "*.accessToken",
  "*.refreshToken",
  "*.sessionSecret",
  "*.apiKey",
  "*.api_key",
  "password",
  "passwordHash",
  "token",
  "sessionSecret",
  "apiKey",
];

const baseOptions: LoggerOptions = {
  level,
  base: {
    app: "photonictag",
    env,
  },
  redact: {
    paths: redactPaths,
    censor: "[REDACTED]",
    remove: false,
  },
  // Keep timestamp ISO so log aggregators get something sortable by default.
  timestamp: pino.stdTimeFunctions.isoTime,
};

function createLogger(): Logger {
  if (isProd) {
    return pino(baseOptions);
  }

  // Dev: try pino-pretty for human-friendly output. If it's not installed
  // (intentionally an optional devDep), fall back silently to JSON.
  try {
    // Resolve without importing so a missing module doesn't throw at import time.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require.resolve("pino-pretty");
    return pino({
      ...baseOptions,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss.l",
          ignore: "pid,hostname,app,env",
        },
      },
    });
  } catch {
    return pino(baseOptions);
  }
}

export const logger: Logger = createLogger();

export type { Logger };
