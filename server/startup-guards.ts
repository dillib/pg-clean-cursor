import { getMasterAdminEmails } from "@shared/models/auth";

/**
 * Production-only checks so the process never binds without a master-admin allowlist.
 * Tests and local dev may omit MASTER_ADMIN_EMAILS; production must not.
 */
export function assertProductionTrustConfig(): void {
  if (process.env.NODE_ENV !== "production") return;
  if (getMasterAdminEmails().length > 0) return;
  throw new Error(
    "MASTER_ADMIN_EMAILS must be set in production to a non-empty comma-separated list of admin emails.",
  );
}
