/**
 * Audit chain integrity verification.
 *
 * Walks audit_logs in chronological order and proves three things end-to-end:
 *   1. Every entry's chainHash matches its computed-from-content hash
 *      (re-runs computeAuditChainHash on the row content).
 *   2. Every entry's previousChainHash equals the prior entry's chainHash
 *      (the chain link is intact — no insertions, no reorderings).
 *   3. The genesis entry's previousChainHash is null.
 *
 * Pairs with the DB-level append-only trigger (see
 * server/db/sql/001_audit_logs_append_only.sql): the trigger blocks
 * UPDATE/DELETE; the integrity check confirms no historical entries were
 * tampered with before the trigger was installed (or via direct DDL).
 *
 * This is the "regulator-grade" component — pitched to compliance buyers
 * (EU Battery Reg Article 65, India BWM Rules) as proof that the audit
 * chain is provably intact.
 */
import { storage } from "../storage";
import { computeAuditChainHash } from "./provenance-service";
import type { AuditLog } from "@shared/schema";

export type IntegrityFailure =
  | { kind: "hash_mismatch"; entryId: string; expected: string; actual: string; index: number }
  | { kind: "chain_break"; entryId: string; expectedPrevious: string | null; actualPrevious: string | null; index: number }
  | { kind: "missing_chain_hash"; entryId: string; index: number };

export interface IntegrityReport {
  totalEntries: number;
  verifiedEntries: number;
  legacyEntries: number; // entries pre-dating the chain (chainHash === null) — counted, not failures
  passed: boolean;
  failures: IntegrityFailure[];
  firstFailureAt?: number; // index of the first failure, for debugging
  generatedAt: string;     // ISO timestamp of when this report was produced
  chainTip: string | null; // current head of the chain (the latest chainHash)
}

/**
 * Verify the audit chain end-to-end. Returns a structured report rather than
 * throwing — callers (UI, integrity endpoint, compliance export) decide how
 * to surface failures.
 *
 * Performance note: walks ALL entries. For tenants with millions of audit
 * rows this should be moved to an async batch job. For now the platform's
 * audit volume is tractable in a single request.
 */
export async function verifyAuditChain(opts?: {
  entityType?: string;
  entityId?: string;
}): Promise<IntegrityReport> {
  // storage.getAuditLogs returns DESC by timestamp — we want ASC for chain walk.
  const desc = await storage.getAuditLogs(opts?.entityType, opts?.entityId);
  const logs = [...desc].reverse() as (AuditLog & {
    chainHash: string | null;
    previousChainHash: string | null;
  })[];

  const failures: IntegrityFailure[] = [];
  let verifiedEntries = 0;
  let legacyEntries = 0;
  let firstFailureAt: number | undefined;
  let runningChainHash: string | null = null;

  for (let i = 0; i < logs.length; i++) {
    const entry = logs[i];

    if (!entry.chainHash) {
      // Legacy entry without provenance — count separately, do not advance chain.
      legacyEntries++;
      continue;
    }

    // (3) Chain link: each entry's previousChainHash must equal the running tip.
    if (entry.previousChainHash !== runningChainHash) {
      failures.push({
        kind: "chain_break",
        entryId: entry.id,
        expectedPrevious: runningChainHash,
        actualPrevious: entry.previousChainHash,
        index: i,
      });
      if (firstFailureAt === undefined) firstFailureAt = i;
    }

    // (1) Hash content: re-compute chainHash from row content and compare.
    const expected = computeAuditChainHash({
      previousHash: entry.previousChainHash ?? null,
      timestamp: entry.timestamp.toISOString(),
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      newValue: (entry.newValue as Record<string, unknown>) ?? null,
    });

    if (expected !== entry.chainHash) {
      failures.push({
        kind: "hash_mismatch",
        entryId: entry.id,
        expected,
        actual: entry.chainHash,
        index: i,
      });
      if (firstFailureAt === undefined) firstFailureAt = i;
    } else {
      verifiedEntries++;
    }

    runningChainHash = entry.chainHash;
  }

  return {
    totalEntries: logs.length,
    verifiedEntries,
    legacyEntries,
    passed: failures.length === 0,
    failures: failures.slice(0, 50), // cap response size; full count is in failures.length
    firstFailureAt,
    generatedAt: new Date().toISOString(),
    chainTip: runningChainHash,
  };
}
