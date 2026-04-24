/**
 * verifyAuditChain — coverage for the audit chain integrity verifier.
 *
 * Source under test: server/services/audit-integrity-service.ts
 *
 * Mocks `../../server/storage` so we can inject crafted AuditLog arrays.
 * Uses the REAL `computeAuditChainHash` from `provenance-service.ts` so
 * fixture chain hashes match what the verifier re-computes (the HMAC key
 * comes from `tests/setup.ts` → `AUDIT_CHAIN_HMAC_KEY=test-hmac-key`).
 *
 * `storage.getAuditLogs` is documented as returning DESC by timestamp; the
 * service reverses to ASC for the chain walk. We therefore build fixtures in
 * ASC order, then `.reverse()` before returning from the mock so the storage
 * contract is honoured.
 *
 * Mapping to ticket-#0009 behaviour table is noted on each `it(...)`.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AuditLog } from "@shared/schema";
import { computeAuditChainHash } from "../../server/services/provenance-service";

const getAuditLogsMock = vi.fn();

vi.mock("../../server/storage", () => ({
  storage: {
    getAuditLogs: (...args: unknown[]) => getAuditLogsMock(...args),
  },
}));

// Import AFTER vi.mock so the service binds to the mocked storage.
import { verifyAuditChain } from "../../server/services/audit-integrity-service";

type ChainEntry = AuditLog & {
  chainHash: string | null;
  previousChainHash: string | null;
};

/**
 * Build a fully-populated AuditLog row. Caller supplies the variable bits
 * (timestamp, action, entityId, newValue, previousChainHash); we compute the
 * chainHash with the real provenance helper unless `chainHash` is overridden.
 */
function makeEntry(opts: {
  id: string;
  timestamp: Date;
  action?: string;
  entityType?: string;
  entityId?: string | null;
  newValue?: Record<string, unknown> | null;
  previousChainHash?: string | null;
  chainHashOverride?: string | null;
}): ChainEntry {
  const action = opts.action ?? "create";
  const entityType = opts.entityType ?? "product";
  const entityId = opts.entityId ?? "p1";
  const newValue = opts.newValue ?? null;
  const previousChainHash = opts.previousChainHash ?? null;

  const computed = computeAuditChainHash({
    previousHash: previousChainHash,
    timestamp: opts.timestamp.toISOString(),
    action,
    entityType,
    entityId,
    newValue,
  });

  const chainHash =
    opts.chainHashOverride === undefined ? computed : opts.chainHashOverride;

  return {
    id: opts.id,
    tenantId: "default",
    userId: null,
    action: action as AuditLog["action"],
    entityType,
    entityId,
    oldValue: null,
    newValue,
    ipAddress: null,
    userAgent: null,
    correlationId: null,
    timestamp: opts.timestamp,
    chainHash,
    previousChainHash,
    recordFingerprint: null,
    tsaToken: null,
    tsaUrl: null,
    dataSource: null,
  } as ChainEntry;
}

/** storage.getAuditLogs returns DESC by timestamp — reverse the ASC fixture. */
function asDesc(asc: ChainEntry[]): ChainEntry[] {
  return [...asc].reverse();
}

describe("verifyAuditChain()", () => {
  beforeEach(() => {
    getAuditLogsMock.mockReset();
  });

  // Behaviour #1
  it("returns an all-zero passing report when the audit log is empty", async () => {
    getAuditLogsMock.mockResolvedValueOnce([]);

    const report = await verifyAuditChain();

    expect(report.totalEntries).toBe(0);
    expect(report.verifiedEntries).toBe(0);
    expect(report.legacyEntries).toBe(0);
    expect(report.passed).toBe(true);
    expect(report.failures).toEqual([]);
    expect(report.chainTip).toBeNull();
    expect(report.firstFailureAt).toBeUndefined();
    // generatedAt should be a valid ISO timestamp string.
    expect(() => new Date(report.generatedAt).toISOString()).not.toThrow();
  });

  // Behaviour #2
  it("verifies a single genesis entry and reports its chainHash as chainTip", async () => {
    const genesis = makeEntry({
      id: "g1",
      timestamp: new Date("2026-01-01T00:00:00.000Z"),
      action: "create",
      entityId: "p1",
      newValue: { name: "Widget" },
      previousChainHash: null,
    });
    getAuditLogsMock.mockResolvedValueOnce(asDesc([genesis]));

    const report = await verifyAuditChain();

    expect(report.totalEntries).toBe(1);
    expect(report.verifiedEntries).toBe(1);
    expect(report.legacyEntries).toBe(0);
    expect(report.passed).toBe(true);
    expect(report.failures).toEqual([]);
    expect(report.chainTip).toBe(genesis.chainHash);
  });

  // Behaviour #3
  it("verifies two correctly-chained entries with no failures", async () => {
    const first = makeEntry({
      id: "e1",
      timestamp: new Date("2026-01-01T00:00:00.000Z"),
      newValue: { name: "Widget" },
      previousChainHash: null,
    });
    const second = makeEntry({
      id: "e2",
      timestamp: new Date("2026-01-02T00:00:00.000Z"),
      action: "update",
      newValue: { name: "Widget v2" },
      previousChainHash: first.chainHash,
    });

    getAuditLogsMock.mockResolvedValueOnce(asDesc([first, second]));

    const report = await verifyAuditChain();

    expect(report.totalEntries).toBe(2);
    expect(report.verifiedEntries).toBe(2);
    expect(report.legacyEntries).toBe(0);
    expect(report.passed).toBe(true);
    expect(report.failures).toEqual([]);
    expect(report.chainTip).toBe(second.chainHash);
  });

  // Behaviour #4
  it("reports a hash_mismatch failure when newValue has been tampered with", async () => {
    // Build a legitimate entry (correct chainHash for the original payload).
    const original = makeEntry({
      id: "e1",
      timestamp: new Date("2026-01-01T00:00:00.000Z"),
      newValue: { name: "Original" },
      previousChainHash: null,
    });
    const originalChainHash = original.chainHash!;

    // Now tamper: swap newValue but KEEP the original chainHash. The verifier
    // should re-compute the hash from the tampered content and detect the
    // mismatch.
    const tampered: ChainEntry = {
      ...original,
      newValue: { name: "TAMPERED" },
    };

    getAuditLogsMock.mockResolvedValueOnce(asDesc([tampered]));

    const report = await verifyAuditChain();

    expect(report.passed).toBe(false);
    expect(report.failures.length).toBe(1);
    const failure = report.failures[0];
    expect(failure.kind).toBe("hash_mismatch");
    if (failure.kind !== "hash_mismatch") throw new Error("type narrow");
    expect(failure.entryId).toBe("e1");
    expect(failure.actual).toBe(originalChainHash);
    // The "expected" is what the verifier re-computed from the tampered content.
    const recomputed = computeAuditChainHash({
      previousHash: null,
      timestamp: tampered.timestamp.toISOString(),
      action: tampered.action,
      entityType: tampered.entityType,
      entityId: tampered.entityId ?? null,
      newValue: tampered.newValue as Record<string, unknown>,
    });
    expect(failure.expected).toBe(recomputed);
    expect(failure.expected).not.toBe(failure.actual);
    expect(failure.index).toBe(0);
    expect(report.firstFailureAt).toBe(0);
    // Tampered entry is not counted as verified.
    expect(report.verifiedEntries).toBe(0);
  });

  // Behaviour #5
  it("reports a chain_break when the second entry's previousChainHash doesn't match the first's chainHash", async () => {
    const first = makeEntry({
      id: "e1",
      timestamp: new Date("2026-01-01T00:00:00.000Z"),
      newValue: { name: "Widget" },
      previousChainHash: null,
    });
    // Construct second entry pointing to the WRONG previous hash. We compute
    // its own chainHash off the wrong-but-self-consistent previousHash so the
    // hash itself is internally valid — only the chain link is broken.
    const wrongPrev = "f".repeat(64);
    const second = makeEntry({
      id: "e2",
      timestamp: new Date("2026-01-02T00:00:00.000Z"),
      action: "update",
      newValue: { name: "Widget v2" },
      previousChainHash: wrongPrev,
    });

    getAuditLogsMock.mockResolvedValueOnce(asDesc([first, second]));

    const report = await verifyAuditChain();

    expect(report.passed).toBe(false);
    // Exactly one failure, of kind chain_break, on the second entry.
    const breaks = report.failures.filter(f => f.kind === "chain_break");
    expect(breaks.length).toBe(1);
    const brk = breaks[0];
    if (brk.kind !== "chain_break") throw new Error("type narrow");
    expect(brk.entryId).toBe("e2");
    expect(brk.expectedPrevious).toBe(first.chainHash); // the running tip
    expect(brk.actualPrevious).toBe(wrongPrev);
    expect(brk.index).toBe(1);
    expect(report.firstFailureAt).toBe(1);
    // The second entry's hash IS internally consistent → it's still counted as
    // verified for the hash check; only the chain link failed.
    expect(report.verifiedEntries).toBe(2);
  });

  // Behaviour #6
  it("counts legacy entries (chainHash === null) separately and continues the chain walk over them", async () => {
    const legacy: ChainEntry = makeEntry({
      id: "leg1",
      timestamp: new Date("2025-12-01T00:00:00.000Z"),
      newValue: { name: "Pre-chain entry" },
      previousChainHash: null,
      chainHashOverride: null, // legacy: no chainHash
    });
    const valid1 = makeEntry({
      id: "v1",
      timestamp: new Date("2026-01-01T00:00:00.000Z"),
      newValue: { name: "First chained" },
      previousChainHash: null, // genesis for the chain
    });
    const valid2 = makeEntry({
      id: "v2",
      timestamp: new Date("2026-01-02T00:00:00.000Z"),
      action: "update",
      newValue: { name: "Second chained" },
      previousChainHash: valid1.chainHash,
    });

    getAuditLogsMock.mockResolvedValueOnce(asDesc([legacy, valid1, valid2]));

    const report = await verifyAuditChain();

    expect(report.totalEntries).toBe(3);
    expect(report.legacyEntries).toBe(1);
    expect(report.verifiedEntries).toBe(2);
    expect(report.passed).toBe(true);
    expect(report.failures).toEqual([]);
    expect(report.chainTip).toBe(valid2.chainHash);
  });

  // Behaviour #7
  it("collects multiple failures and reports firstFailureAt as the earliest index", async () => {
    // Three entries, each broken in a different way:
    //   e1: tampered → hash_mismatch at index 0
    //   e2: wrong previousChainHash → chain_break at index 1
    //   e3: tampered → hash_mismatch at index 2
    const e1Original = makeEntry({
      id: "e1",
      timestamp: new Date("2026-01-01T00:00:00.000Z"),
      newValue: { name: "A" },
      previousChainHash: null,
    });
    const e1Tampered: ChainEntry = {
      ...e1Original,
      newValue: { name: "A-TAMPERED" }, // mismatch
    };

    const e2 = makeEntry({
      id: "e2",
      timestamp: new Date("2026-01-02T00:00:00.000Z"),
      action: "update",
      newValue: { name: "B" },
      previousChainHash: "0".repeat(64), // intentionally wrong link
    });

    const e3Original = makeEntry({
      id: "e3",
      timestamp: new Date("2026-01-03T00:00:00.000Z"),
      action: "update",
      newValue: { name: "C" },
      previousChainHash: e2.chainHash,
    });
    const e3Tampered: ChainEntry = {
      ...e3Original,
      newValue: { name: "C-TAMPERED" },
    };

    getAuditLogsMock.mockResolvedValueOnce(asDesc([e1Tampered, e2, e3Tampered]));

    const report = await verifyAuditChain();

    expect(report.passed).toBe(false);
    // We expect (at least) three distinct failures: the two hash_mismatches
    // and the one chain_break.
    expect(report.failures.length).toBeGreaterThanOrEqual(3);
    const kinds = report.failures.map(f => f.kind).sort();
    expect(kinds).toContain("hash_mismatch");
    expect(kinds).toContain("chain_break");
    // Cap is 50 — this report easily fits.
    expect(report.failures.length).toBeLessThanOrEqual(50);
    // Earliest failure is index 0 (the e1 tamper).
    expect(report.firstFailureAt).toBe(0);
    // chainTip is the last entry's stored chainHash, even when broken.
    expect(report.chainTip).toBe(e3Tampered.chainHash);
  });

  // Behaviour: confirm filter args are forwarded to storage.
  it("forwards entityType and entityId filters to storage.getAuditLogs", async () => {
    getAuditLogsMock.mockResolvedValueOnce([]);

    await verifyAuditChain({ entityType: "product", entityId: "abc" });

    expect(getAuditLogsMock).toHaveBeenCalledTimes(1);
    expect(getAuditLogsMock).toHaveBeenCalledWith("product", "abc");
  });
});
