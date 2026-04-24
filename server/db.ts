import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { logger } from "./logger";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

function poolOptions(connectionString: string) {
  return {
    connectionString,
    max: parseInt(process.env.PG_POOL_MAX ?? "20", 10),
    min: 2,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined,
  } as const;
}

const pool = new pg.Pool(poolOptions(process.env.DATABASE_URL));

pool.on("error", (err) => {
  logger.error({ err: err.message }, "[PgPool] Unexpected error on idle client");
});

export const db = drizzle(pool, { schema });
export { pool };

/** Parsed `DB_REGION_MAP` JSON: `{ "eu-west-1": "postgres://...", ... }`. Null if unset or invalid. */
export function parseDbRegionMap(): Record<string, string> | null {
  const raw = process.env.DB_REGION_MAP;
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
  } catch {
    logger.warn("[db] DB_REGION_MAP is not valid JSON — ignoring");
  }
  return null;
}

const regionalPools = new Map<string, pg.Pool>();
const regionalDbs = new Map<string, NodePgDatabase<typeof schema>>();

/**
 * Cell-based routing stub (PLAN PR-11): returns a Drizzle client for the given
 * region when `DB_REGION_MAP` is set; otherwise returns the default `db`.
 */
export function getDbForRegion(region: string): NodePgDatabase<typeof schema> {
  const map = parseDbRegionMap();
  const url = map?.[region] ?? process.env.DATABASE_URL!;
  if (url === process.env.DATABASE_URL && !map?.[region]) {
    return db;
  }
  let p = regionalPools.get(url);
  if (!p) {
    p = new pg.Pool(poolOptions(url));
    p.on("error", (err) => {
      logger.error({ err: err.message, url: url.replace(/:[^:@/]+@/, ":****@") }, "[PgPool] regional pool error");
    });
    regionalPools.set(url, p);
  }
  let d = regionalDbs.get(url);
  if (!d) {
    d = drizzle(p, { schema });
    regionalDbs.set(url, d);
  }
  return d;
}
