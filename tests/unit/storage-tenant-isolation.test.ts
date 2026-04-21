/**
 * Cross-tenant isolation — end-to-end behavior of TenantStorage.
 *
 * The existing tenant-storage.test.ts asserts that the factory hands out a
 * scoped proxy with the right tenantId. This file goes one level deeper: with
 * the Drizzle db mocked to an in-memory table, verify that a read/update/delete
 * issued by tenant T2 CANNOT touch a row owned by tenant T1, and vice versa.
 *
 * We mock the `eq`, `and` helpers so the queries emitted by TenantStorage are
 * captured as plain predicate trees, and run those predicates against a small
 * in-memory Map. If TenantStorage ever forgets its tenant filter on a read or
 * write path, these tests break — which is exactly the regression guard we want.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------- in-memory table ----------
type Row = Record<string, any>;
const table = new Map<string, Row>();

function resetTable() {
  table.clear();
}

// ---------- predicate plumbing ----------
// Mock drizzle-orm so eq/and return tagged objects we can evaluate in memory.
// `desc` is a no-op tag used only to satisfy orderBy.
vi.mock("drizzle-orm", () => {
  const eq = (col: any, val: any) => ({ _op: "eq", col, val });
  const and = (...conds: any[]) => ({ _op: "and", conds });
  const desc = (col: any) => ({ _op: "desc", col });
  const sql: any = (strings: TemplateStringsArray, ...values: any[]) => ({
    _op: "sql",
    strings,
    values,
  });
  sql.raw = (s: string) => ({ _op: "sql-raw", s });
  return { eq, and, desc, sql };
});

function matches(row: Row, predicate: any): boolean {
  if (!predicate) return true;
  if (predicate._op === "eq") {
    const key = predicate.col?.name ?? predicate.col?._name ?? predicate.col;
    return row[key] === predicate.val;
  }
  if (predicate._op === "and") {
    return predicate.conds.every((c: any) => matches(row, c));
  }
  return true;
}

// ---------- fake column handles ----------
// TenantStorage references products.id and products.tenantId. Our mocked drizzle
// ignores the table shape; we only need an object with a `name` that lines up
// with the row's key. The real drizzle column objects have a `name` property.
const productsTable = {
  id: { name: "id" },
  tenantId: { name: "tenantId" },
  createdAt: { name: "createdAt" },
};

vi.mock("@shared/schema", () => ({
  products: productsTable,
  auditLogs: { tenantId: { name: "tenantId" }, entityType: { name: "entityType" }, entityId: { name: "entityId" }, timestamp: { name: "timestamp" } },
  enterpriseConnectors: { id: { name: "id" }, tenantId: { name: "tenantId" } },
  integrationSyncLogs: {},
  traceEvents: {},
  iotDevices: {},
  dppRegionalExtensions: {},
  productPassports: {},
  identities: {},
  qrCodes: {},
  aiInsights: {},
  dppAiInsights: {},
}));

// ---------- fake db ----------
function buildSelect() {
  let pred: any = null;
  const chain: any = {
    from: (_t: any) => chain,
    where: (p: any) => {
      pred = p;
      return chain;
    },
    orderBy: (_c: any) => {
      // resolves the query
      return Array.from(table.values()).filter((r) => matches(r, pred));
    },
    then: (onOk: any, onErr?: any) => {
      // await chain (without orderBy) → resolve to filtered rows
      try {
        const rows = Array.from(table.values()).filter((r) => matches(r, pred));
        return Promise.resolve(rows).then(onOk, onErr);
      } catch (e) {
        return Promise.reject(e).catch(onErr);
      }
    },
  };
  return chain;
}

function buildInsert(_t: any) {
  let payload: Row | null = null;
  const chain: any = {
    values: (v: Row) => {
      payload = { ...v };
      if (!payload.id) payload.id = `auto-${Date.now()}-${Math.random()}`;
      return chain;
    },
    returning: async () => {
      if (!payload) return [];
      table.set(payload.id, payload);
      return [payload];
    },
  };
  return chain;
}

function buildUpdate(_t: any) {
  let patch: Row = {};
  let pred: any = null;
  const chain: any = {
    set: (p: Row) => {
      patch = p;
      return chain;
    },
    where: (p: any) => {
      pred = p;
      return chain;
    },
    returning: async () => {
      const updated: Row[] = [];
      for (const [k, row] of table) {
        if (matches(row, pred)) {
          const next = { ...row, ...patch };
          table.set(k, next);
          updated.push(next);
        }
      }
      return updated;
    },
  };
  return chain;
}

function buildDelete(_t: any) {
  let pred: any = null;
  const chain: any = {
    where: (p: any) => {
      pred = p;
      // drizzle returns a QueryResult-ish object with rowCount
      const toDelete: string[] = [];
      for (const [k, row] of table) if (matches(row, pred)) toDelete.push(k);
      for (const k of toDelete) table.delete(k);
      return Promise.resolve({ rowCount: toDelete.length });
    },
  };
  return chain;
}

vi.mock("../../server/db", () => ({
  db: {
    select: () => buildSelect(),
    insert: (t: any) => buildInsert(t),
    update: (t: any) => buildUpdate(t),
    delete: (t: any) => buildDelete(t),
    execute: async () => ({}),
  },
  pool: {},
}));

// The base `storage` singleton is pulled in for the .base getter; the storage
// module itself imports a lot of routes indirectly. Stub it to keep the test
// isolated and fast.
vi.mock("../../server/storage", () => ({
  storage: { getProduct: () => null },
}));

// ---------- tests ----------
describe("TenantStorage cross-tenant isolation", () => {
  beforeEach(() => resetTable());

  async function seed() {
    const { TenantStorage } = await import("../../server/storage-tenant");
    const t1 = new TenantStorage("tenant-1");
    const t2 = new TenantStorage("tenant-2");
    const p1 = await t1.createProduct({ productName: "T1 Widget" } as any);
    const p2 = await t2.createProduct({ productName: "T2 Widget" } as any);
    return { t1, t2, p1, p2 };
  }

  it("createProduct tags the row with the caller's tenantId", async () => {
    const { p1, p2 } = await seed();
    expect(p1.tenantId).toBe("tenant-1");
    expect(p2.tenantId).toBe("tenant-2");
  });

  it("tenant-2 cannot read tenant-1's product by id", async () => {
    const { t2, p1 } = await seed();
    const leaked = await t2.getProduct(p1.id);
    expect(leaked).toBeUndefined();
  });

  it("tenant-2 cannot update tenant-1's product", async () => {
    const { t2, p1 } = await seed();
    const result = await t2.updateProduct(p1.id, { productName: "HACKED" } as any);
    expect(result).toBeUndefined();
    // Original row is untouched.
    expect(table.get(p1.id)?.productName).toBe("T1 Widget");
  });

  it("tenant-2 cannot delete tenant-1's product", async () => {
    const { t2, p1 } = await seed();
    const ok = await t2.deleteProduct(p1.id);
    expect(ok).toBe(false);
    expect(table.has(p1.id)).toBe(true);
  });

  it("tenant-1 can read, update, and delete its own product", async () => {
    const { t1, p1 } = await seed();
    const read = await t1.getProduct(p1.id);
    expect(read?.productName).toBe("T1 Widget");

    const updated = await t1.updateProduct(p1.id, { productName: "T1 v2" } as any);
    expect(updated?.productName).toBe("T1 v2");

    const deleted = await t1.deleteProduct(p1.id);
    expect(deleted).toBe(true);
    expect(table.has(p1.id)).toBe(false);
  });

  it("getAllProducts returns only the caller's rows", async () => {
    const { t1, t2 } = await seed();
    const t1Rows = await t1.getAllProducts();
    const t2Rows = await t2.getAllProducts();
    expect(t1Rows).toHaveLength(1);
    expect(t2Rows).toHaveLength(1);
    expect(t1Rows[0].tenantId).toBe("tenant-1");
    expect(t2Rows[0].tenantId).toBe("tenant-2");
  });
});
