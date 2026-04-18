import { describe, it, expect } from "vitest";
import {
  computeAuditChainHash,
  verifyAuditEntry,
  fingerprintRecord,
} from "../../server/services/provenance-service";

describe("computeAuditChainHash", () => {
  const base = {
    previousHash: null,
    timestamp: "2024-01-01T00:00:00.000Z",
    action: "create",
    entityType: "product",
    entityId: "abc-123",
    newValue: { productName: "Test" },
  };

  it("produces a consistent 64-char hex string", () => {
    const hash = computeAuditChainHash(base);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("is deterministic for the same input", () => {
    expect(computeAuditChainHash(base)).toBe(computeAuditChainHash(base));
  });

  it("changes when any field changes", () => {
    const h1 = computeAuditChainHash(base);
    const h2 = computeAuditChainHash({ ...base, action: "update" });
    const h3 = computeAuditChainHash({ ...base, entityId: "different-id" });
    expect(h1).not.toBe(h2);
    expect(h1).not.toBe(h3);
    expect(h2).not.toBe(h3);
  });

  it("chains correctly — previous hash is incorporated", () => {
    const first = computeAuditChainHash(base);
    const second = computeAuditChainHash({ ...base, previousHash: first });
    expect(second).not.toBe(first);
  });
});

describe("verifyAuditEntry", () => {
  it("returns false for entries without chainHash", () => {
    expect(verifyAuditEntry({
      id: "1", userId: null, action: "create", entityType: "product",
      entityId: null, oldValue: null, newValue: null,
      ipAddress: null, userAgent: null, correlationId: null,
      timestamp: new Date(),
    } as any)).toBe(false);
  });

  it("returns true for a valid entry", () => {
    const timestamp = new Date("2024-01-01T00:00:00.000Z");
    const chainHash = computeAuditChainHash({
      previousHash: null,
      timestamp: timestamp.toISOString(),
      action: "create",
      entityType: "product",
      entityId: "abc",
      newValue: { productName: "X" },
    });
    expect(verifyAuditEntry({
      id: "1", userId: null, action: "create", entityType: "product",
      entityId: "abc", oldValue: null, newValue: { productName: "X" },
      ipAddress: null, userAgent: null, correlationId: null,
      timestamp,
      chainHash,
      previousChainHash: null,
    } as any)).toBe(true);
  });

  it("returns false when newValue is tampered", () => {
    const timestamp = new Date("2024-01-01T00:00:00.000Z");
    const chainHash = computeAuditChainHash({
      previousHash: null, timestamp: timestamp.toISOString(),
      action: "create", entityType: "product", entityId: "abc",
      newValue: { productName: "Original" },
    });
    expect(verifyAuditEntry({
      id: "1", userId: null, action: "create", entityType: "product",
      entityId: "abc", oldValue: null, newValue: { productName: "TAMPERED" },
      ipAddress: null, userAgent: null, correlationId: null,
      timestamp, chainHash, previousChainHash: null,
    } as any)).toBe(false);
  });
});

describe("fingerprintRecord", () => {
  it("produces the same hash regardless of key order", () => {
    const a = { b: 2, a: 1 };
    const b = { a: 1, b: 2 };
    expect(fingerprintRecord(a)).toBe(fingerprintRecord(b));
  });

  it("changes when any value changes", () => {
    const h1 = fingerprintRecord({ carbonFootprint: 100 });
    const h2 = fingerprintRecord({ carbonFootprint: 101 });
    expect(h1).not.toBe(h2);
  });
});
