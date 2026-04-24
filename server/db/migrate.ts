/**
 * Lightweight SQL migration runner for trigger / function / view DDL that
 * Drizzle Kit doesn't manage (Drizzle only diffs table schema).
 *
 * Reads `server/db/sql/*.sql` in lexical order, runs each via the existing
 * pg pool. Tracks applied filenames in `_pt_sql_migrations` so each migration
 * runs exactly once per database.
 *
 * The audit-log trigger is the inaugural use case (regulator-grade
 * append-only enforcement) — see 001_audit_logs_append_only.sql.
 *
 * In the test environment (NODE_ENV=test) this is a no-op so the unit suite
 * doesn't require a live DB. The integration / E2E suites bring their own
 * DB and call runSqlMigrations() in their global setup.
 */
import { readdir, readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../db";
import { logger } from "../logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQL_DIR = path.join(__dirname, "sql");
const MIGRATIONS_TABLE = "_pt_sql_migrations";

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      filename text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}

async function appliedMigrations(): Promise<Set<string>> {
  const { rows } = await pool.query<{ filename: string }>(
    `SELECT filename FROM ${MIGRATIONS_TABLE};`,
  );
  return new Set(rows.map(r => r.filename));
}

export async function runSqlMigrations(opts?: { force?: boolean }): Promise<{ applied: string[]; skipped: string[] }> {
  if (process.env.NODE_ENV === "test" && !opts?.force) {
    return { applied: [], skipped: [] };
  }

  await ensureMigrationsTable();
  const already = await appliedMigrations();

  let entries: string[];
  try {
    entries = (await readdir(SQL_DIR)).filter(f => f.endsWith(".sql")).sort();
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      logger.info({ dir: SQL_DIR }, "[Migrations] sql dir not found — nothing to apply");
      return { applied: [], skipped: [] };
    }
    throw err;
  }

  const applied: string[] = [];
  const skipped: string[] = [];

  for (const filename of entries) {
    if (already.has(filename) && !opts?.force) {
      skipped.push(filename);
      continue;
    }

    const sql = await readFile(path.join(SQL_DIR, filename), "utf8");
    logger.info({ filename }, "[Migrations] applying SQL migration");

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        `INSERT INTO ${MIGRATIONS_TABLE} (filename) VALUES ($1)
         ON CONFLICT (filename) DO NOTHING;`,
        [filename],
      );
      await client.query("COMMIT");
      applied.push(filename);
      logger.info({ filename }, "[Migrations] applied");
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      logger.error({ filename, err }, "[Migrations] failed");
      throw err;
    } finally {
      client.release();
    }
  }

  return { applied, skipped };
}
