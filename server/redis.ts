/**
 * Shared Redis client — single connection reused across event bus and session store.
 *
 * Set REDIS_URL in env (e.g. redis://localhost:6379 or rediss://user:pass@host:6380).
 * If REDIS_URL is absent the system falls back to in-process mode for local dev.
 */
import Redis from "ioredis";

const url = process.env.REDIS_URL;

let _redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!url) return null;
  if (!_redis) {
    _redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 100, 3000),
      lazyConnect: false,
    });
    _redis.on("error", (err) => {
      console.error("[Redis] Connection error:", err.message);
    });
    _redis.on("connect", () => {
      console.log("[Redis] Connected to", url?.replace(/:\/\/.*@/, "://***@"));
    });
  }
  return _redis;
}

export function isRedisAvailable(): boolean {
  return !!url && getRedisClient()?.status === "ready";
}
