import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // Sized for a single-instance Node process.
  // With PgBouncer in transaction mode (recommended for prod), max can be lower.
  max: parseInt(process.env.PG_POOL_MAX ?? "20", 10),
  min: 2,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  // ssl: trust DB_SSL env to override (Neon, RDS, etc. require SSL)
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined,
});

pool.on("error", (err) => {
  console.error("[PgPool] Unexpected error on idle client:", err.message);
});

export const db = drizzle(pool, { schema });
export { pool };
