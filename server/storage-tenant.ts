/**
 * TenantScopedStorage — wraps the base DatabaseStorage and applies tenant
 * filtering at the Drizzle layer (belt) with Postgres RLS as defense-in-depth
 * (suspenders).
 *
 * Usage:
 *   import { tenantStorage } from "./storage-tenant";
 *   const scoped = tenantStorage(req);           // inside a request handler
 *   const products = await scoped.getAllProducts(); // only this tenant's products
 *
 * The Postgres RLS policy (migration 001) catches any query that bypasses this
 * layer — e.g. if a route accidentally uses the raw `storage` singleton.
 */
import { sql } from "drizzle-orm";
import { eq, and, desc } from "drizzle-orm";
import type { Request } from "express";
import { db } from "./db";
import { products, auditLogs, enterpriseConnectors, integrationSyncLogs, traceEvents, iotDevices, dppRegionalExtensions, productPassports, identities, qrCodes, aiInsights, dppAiInsights } from "@shared/schema";
import type { InsertProduct, Product, InsertAuditLog, AuditLog, InsertTraceEvent, TraceEvent } from "@shared/schema";
import { storage, type IStorage } from "./storage";
import { getTenantId } from "./middleware/tenant";

/**
 * Sets the Postgres session variable for RLS enforcement.
 * Called at the start of any transaction touching tenant-scoped tables.
 */
export async function setTenantContext(tenantId: string): Promise<void> {
  await db.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantId}, TRUE)`);
}

/**
 * Returns a tenant-scoped storage proxy for the current request.
 * Falls back to the base storage for methods that don't need tenant scoping
 * (public lookups, non-tenant tables like leads/partners/demos).
 */
export function tenantStorage(req: Request): TenantStorage {
  const tenantId = getTenantId(req) ?? "default";
  return new TenantStorage(tenantId);
}

export class TenantStorage {
  constructor(private readonly tenantId: string) {}

  // ----------------------------------------
  // PRODUCTS — tenant-scoped
  // ----------------------------------------

  async getAllProducts(): Promise<Product[]> {
    return db.select()
      .from(products)
      .where(eq(products.tenantId as any, this.tenantId))
      .orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [row] = await db.select()
      .from(products)
      .where(and(
        eq(products.id, id),
        eq(products.tenantId as any, this.tenantId),
      ));
    return row;
  }

  async createProduct(data: InsertProduct): Promise<Product> {
    const [row] = await db.insert(products)
      .values({ ...data, tenantId: this.tenantId } as any)
      .returning();
    return row;
  }

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [row] = await db.update(products)
      .set(data as any)
      .where(and(
        eq(products.id, id),
        eq(products.tenantId as any, this.tenantId),
      ))
      .returning();
    return row;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products)
      .where(and(
        eq(products.id, id),
        eq(products.tenantId as any, this.tenantId),
      ));
    return (result as any).rowCount > 0;
  }

  // ----------------------------------------
  // AUDIT LOGS — tenant-scoped
  // ----------------------------------------

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [row] = await db.insert(auditLogs)
      .values({ ...log, tenantId: this.tenantId } as any)
      .returning();
    return row;
  }

  async getAuditLogs(entityType?: string, entityId?: string): Promise<AuditLog[]> {
    const conditions: any[] = [eq(auditLogs.tenantId as any, this.tenantId)];
    if (entityType) conditions.push(eq(auditLogs.entityType, entityType));
    if (entityId) conditions.push(eq(auditLogs.entityId, entityId));
    return db.select().from(auditLogs)
      .where(and(...conditions))
      .orderBy(desc(auditLogs.timestamp));
  }

  // ----------------------------------------
  // ENTERPRISE CONNECTORS — tenant-scoped
  // ----------------------------------------

  async getAllEnterpriseConnectors() {
    return db.select().from(enterpriseConnectors)
      .where(eq(enterpriseConnectors.tenantId as any, this.tenantId));
  }

  async getEnterpriseConnector(id: string) {
    const [row] = await db.select().from(enterpriseConnectors)
      .where(and(
        eq(enterpriseConnectors.id, id),
        eq(enterpriseConnectors.tenantId as any, this.tenantId),
      ));
    return row;
  }

  // ----------------------------------------
  // PASSTHROUGH — methods without tenant scope
  // (public lookups, non-tenant tables)
  // ----------------------------------------

  /** Returns the full IStorage for methods that are tenant-agnostic. */
  get base(): IStorage { return storage; }
}
