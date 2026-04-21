import { sql } from "drizzle-orm";
import { boolean, index, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

// Session storage table (connect-pg-simple / express-session).
// (IMPORTANT) Required for authenticated sessions — do not drop.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Master admin emails — sourced from MASTER_ADMIN_EMAILS env var (comma-separated).
// Resolved lazily so tests can override via process.env at runtime.
export function getMasterAdminEmails(): string[] {
  const raw = process.env.MASTER_ADMIN_EMAILS;
  if (!raw) return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);
}

export function isMasterAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getMasterAdminEmails().includes(email.toLowerCase());
}

// User storage table (OIDC profile upserts from WorkOS, etc.).
// (IMPORTANT) Required for auth — do not drop.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
