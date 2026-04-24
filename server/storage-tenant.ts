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
import {
  products,
  auditLogs,
  enterpriseConnectors,
  integrationSyncLogs,
  traceEvents,
  iotDevices,
  dppRegionalExtensions,
  productPassports,
  identities,
  qrCodes,
  aiInsights,
  dppAiInsights,
  customerAccounts,
  accountActivities,
  nextBestActions,
  demoInstances,
  personaTemplates,
  supportTickets,
  platformMetrics,
  leads,
  leadActivities,
} from "@shared/schema";
import type {
  InsertProduct,
  Product,
  InsertAuditLog,
  AuditLog,
  InsertTraceEvent,
  TraceEvent,
  CustomerAccount,
  InsertCustomerAccount,
  AccountActivity,
  InsertAccountActivity,
  NextBestAction,
  InsertNextBestAction,
  DemoInstance,
  InsertDemoInstance,
  PersonaTemplate,
  InsertPersonaTemplate,
  SupportTicket,
  InsertSupportTicket,
  Lead,
  InsertLead,
  LeadActivity,
  InsertLeadActivity,
  ActionStatus,
  DppRegionalExtension,
  InsertDppRegionalExtension,
  RegionCode,
  InsertEnterpriseConnector,
  EnterpriseConnector,
  InsertIntegrationSyncLog,
  IntegrationSyncLog,
} from "@shared/schema";
import { storage, type IStorage } from "./storage";
import { getTenantId } from "./middleware/tenant";
import { computeLeadStatsFromLeads } from "./lead-stats";

/**
 * Sets the Postgres session variable for RLS enforcement.
 * Called at the start of any transaction touching tenant-scoped tables.
 */
export async function setTenantContext(tenantId: string): Promise<void> {
  await db.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantId}, TRUE)`);
}

/**
 * Returns a tenant-scoped storage proxy for the current request.
 * Partner sessions resolve to `partner:<id>`; authenticated users use `user.tenantId`.
 */
export function tenantStorage(req: Request): TenantStorage {
  const tenantId = getTenantId(req) ?? "default";
  return new TenantStorage(tenantId);
}

/** Explicit tenant id (e.g. background jobs) — same scoping as {@link tenantStorage}. */
export function storageForTenant(tenantId: string): TenantStorage {
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
  // CRM — tenant-scoped (internal console + partner sessions)
  // ----------------------------------------

  async getAllCustomerAccounts(): Promise<CustomerAccount[]> {
    return db
      .select()
      .from(customerAccounts)
      .where(eq(customerAccounts.tenantId as any, this.tenantId))
      .orderBy(desc(customerAccounts.createdAt));
  }

  async getCustomerAccount(id: string): Promise<CustomerAccount | undefined> {
    const [row] = await db
      .select()
      .from(customerAccounts)
      .where(and(eq(customerAccounts.id, id), eq(customerAccounts.tenantId as any, this.tenantId)));
    return row;
  }

  async createCustomerAccount(account: InsertCustomerAccount): Promise<CustomerAccount> {
    const [created] = await db
      .insert(customerAccounts)
      .values({ ...(account as any), tenantId: this.tenantId })
      .returning();
    return created;
  }

  async updateCustomerAccount(id: string, updates: Partial<CustomerAccount>): Promise<CustomerAccount | undefined> {
    const [updated] = await db
      .update(customerAccounts)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(and(eq(customerAccounts.id, id), eq(customerAccounts.tenantId as any, this.tenantId)))
      .returning();
    return updated;
  }

  async deleteCustomerAccount(id: string): Promise<boolean> {
    const result = await db
      .delete(customerAccounts)
      .where(and(eq(customerAccounts.id, id), eq(customerAccounts.tenantId as any, this.tenantId)))
      .returning();
    return result.length > 0;
  }

  async getAccountActivities(accountId: string): Promise<AccountActivity[]> {
    const owner = await this.getCustomerAccount(accountId);
    if (!owner) return [];
    return db
      .select()
      .from(accountActivities)
      .where(and(eq(accountActivities.accountId, accountId), eq(accountActivities.tenantId as any, this.tenantId)))
      .orderBy(desc(accountActivities.createdAt));
  }

  async createAccountActivity(activity: InsertAccountActivity): Promise<AccountActivity> {
    const owner = await this.getCustomerAccount(activity.accountId);
    if (!owner) {
      throw new Error("Account not found for this tenant");
    }
    const [created] = await db
      .insert(accountActivities)
      .values({ ...(activity as any), tenantId: this.tenantId })
      .returning();
    return created;
  }

  async getNextBestActions(accountId: string): Promise<NextBestAction[]> {
    const owner = await this.getCustomerAccount(accountId);
    if (!owner) return [];
    return db
      .select()
      .from(nextBestActions)
      .where(and(eq(nextBestActions.accountId, accountId), eq(nextBestActions.tenantId as any, this.tenantId)))
      .orderBy(desc(nextBestActions.createdAt));
  }

  async getAllPendingActions(): Promise<NextBestAction[]> {
    return db
      .select()
      .from(nextBestActions)
      .where(and(eq(nextBestActions.status, "pending"), eq(nextBestActions.tenantId as any, this.tenantId)))
      .orderBy(desc(nextBestActions.createdAt));
  }

  async createNextBestAction(action: InsertNextBestAction): Promise<NextBestAction> {
    const owner = await this.getCustomerAccount(action.accountId);
    if (!owner) {
      throw new Error("Account not found for this tenant");
    }
    const [created] = await db
      .insert(nextBestActions)
      .values({ ...(action as any), tenantId: this.tenantId })
      .returning();
    return created;
  }

  async updateNextBestActionStatus(id: string, status: ActionStatus): Promise<NextBestAction | undefined> {
    const updates: Record<string, unknown> = { status };
    if (status === "completed") updates.completedAt = new Date();
    const [updated] = await db
      .update(nextBestActions)
      .set(updates as any)
      .where(and(eq(nextBestActions.id, id), eq(nextBestActions.tenantId as any, this.tenantId)))
      .returning();
    return updated;
  }

  async getDemoInstance(id: string): Promise<DemoInstance | undefined> {
    const [row] = await db
      .select()
      .from(demoInstances)
      .where(and(eq(demoInstances.id, id), eq(demoInstances.tenantId as any, this.tenantId)));
    return row;
  }

  async getAllDemoInstances(): Promise<DemoInstance[]> {
    return db
      .select()
      .from(demoInstances)
      .where(eq(demoInstances.tenantId as any, this.tenantId))
      .orderBy(desc(demoInstances.createdAt));
  }

  async createDemoInstance(instance: InsertDemoInstance): Promise<DemoInstance> {
    const [created] = await db
      .insert(demoInstances)
      .values({ ...(instance as any), tenantId: this.tenantId })
      .returning();
    return created;
  }

  async updateDemoInstance(id: string, updates: Partial<DemoInstance>): Promise<DemoInstance | undefined> {
    const [updated] = await db
      .update(demoInstances)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(and(eq(demoInstances.id, id), eq(demoInstances.tenantId as any, this.tenantId)))
      .returning();
    return updated;
  }

  async deleteDemoInstance(id: string): Promise<boolean> {
    const result = await db
      .delete(demoInstances)
      .where(and(eq(demoInstances.id, id), eq(demoInstances.tenantId as any, this.tenantId)))
      .returning();
    return result.length > 0;
  }

  async getPersonaTemplate(id: string): Promise<PersonaTemplate | undefined> {
    const [row] = await db
      .select()
      .from(personaTemplates)
      .where(and(eq(personaTemplates.id, id), eq(personaTemplates.tenantId as any, this.tenantId)));
    return row;
  }

  async getAllPersonaTemplates(): Promise<PersonaTemplate[]> {
    return db
      .select()
      .from(personaTemplates)
      .where(eq(personaTemplates.tenantId as any, this.tenantId))
      .orderBy(desc(personaTemplates.createdAt));
  }

  async createPersonaTemplate(template: InsertPersonaTemplate): Promise<PersonaTemplate> {
    const [created] = await db
      .insert(personaTemplates)
      .values({ ...(template as any), tenantId: this.tenantId })
      .returning();
    return created;
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const [row] = await db
      .select()
      .from(supportTickets)
      .where(and(eq(supportTickets.id, id), eq(supportTickets.tenantId as any, this.tenantId)));
    return row;
  }

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    return db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.tenantId as any, this.tenantId))
      .orderBy(desc(supportTickets.createdAt));
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const [created] = await db
      .insert(supportTickets)
      .values({ ...(ticket as any), tenantId: this.tenantId })
      .returning();
    return created;
  }

  async updateSupportTicket(id: string, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const [updated] = await db
      .update(supportTickets)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(and(eq(supportTickets.id, id), eq(supportTickets.tenantId as any, this.tenantId)))
      .returning();
    return updated;
  }

  async recordMetric(metricType: string, value: number, metadata?: Record<string, unknown>): Promise<void> {
    await db.insert(platformMetrics).values({
      metricType,
      value,
      metadata: metadata || {},
      tenantId: this.tenantId,
    } as any);
  }

  async getMetrics(metricType?: string, limit = 100) {
    const tenantCond = eq(platformMetrics.tenantId as any, this.tenantId);
    if (metricType) {
      return db
        .select()
        .from(platformMetrics)
        .where(and(eq(platformMetrics.metricType, metricType), tenantCond))
        .orderBy(desc(platformMetrics.recordedAt))
        .limit(limit);
    }
    return db
      .select()
      .from(platformMetrics)
      .where(tenantCond)
      .orderBy(desc(platformMetrics.recordedAt))
      .limit(limit);
  }

  async getAllLeads(): Promise<Lead[]> {
    return db
      .select()
      .from(leads)
      .where(eq(leads.tenantId as any, this.tenantId))
      .orderBy(desc(leads.createdAt));
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const [row] = await db
      .select()
      .from(leads)
      .where(and(eq(leads.id, id), eq(leads.tenantId as any, this.tenantId)));
    return row;
  }

  async getLeadByEmail(email: string): Promise<Lead | undefined> {
    const [row] = await db
      .select()
      .from(leads)
      .where(and(eq(leads.email, email), eq(leads.tenantId as any, this.tenantId)));
    return row;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db
      .insert(leads)
      .values({ ...(insertLead as any), tenantId: this.tenantId })
      .returning();
    return lead;
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead | undefined> {
    const [lead] = await db
      .update(leads)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(and(eq(leads.id, id), eq(leads.tenantId as any, this.tenantId)))
      .returning();
    return lead;
  }

  async deleteLead(id: string): Promise<boolean> {
    const result = await db
      .delete(leads)
      .where(and(eq(leads.id, id), eq(leads.tenantId as any, this.tenantId)))
      .returning();
    return result.length > 0;
  }

  async getLeadStats() {
    const allLeads = await this.getAllLeads();
    return computeLeadStatsFromLeads(allLeads);
  }

  async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    const lead = await this.getLead(leadId);
    if (!lead) return [];
    return db
      .select()
      .from(leadActivities)
      .where(eq(leadActivities.leadId, leadId))
      .orderBy(desc(leadActivities.createdAt));
  }

  async createLeadActivity(insertActivity: InsertLeadActivity): Promise<LeadActivity> {
    const lead = await this.getLead(insertActivity.leadId);
    if (!lead) {
      throw new Error("Lead not found for this tenant");
    }
    const [activity] = await db.insert(leadActivities).values(insertActivity as any).returning();
    return activity;
  }

  // ----------------------------------------
  // DPP REGIONAL EXTENSIONS — tenant-scoped
  // ----------------------------------------

  async getRegionalExtension(id: string): Promise<DppRegionalExtension | undefined> {
    const [row] = await db
      .select()
      .from(dppRegionalExtensions)
      .where(
        and(
          eq(dppRegionalExtensions.id, id),
          eq(dppRegionalExtensions.tenantId as any, this.tenantId),
        ),
      );
    return row;
  }

  async getRegionalExtensionsByProductId(productId: string): Promise<DppRegionalExtension[]> {
    const product = await this.getProduct(productId);
    if (!product) return [];
    return db
      .select()
      .from(dppRegionalExtensions)
      .where(
        and(
          eq(dppRegionalExtensions.productId, productId),
          eq(dppRegionalExtensions.tenantId as any, this.tenantId),
        ),
      )
      .orderBy(desc(dppRegionalExtensions.updatedAt));
  }

  async getRegionalExtensionByProductAndRegion(
    productId: string,
    regionCode: RegionCode,
  ): Promise<DppRegionalExtension | undefined> {
    const product = await this.getProduct(productId);
    if (!product) return undefined;
    const [row] = await db
      .select()
      .from(dppRegionalExtensions)
      .where(
        and(
          eq(dppRegionalExtensions.productId, productId),
          eq(dppRegionalExtensions.regionCode, regionCode),
          eq(dppRegionalExtensions.tenantId as any, this.tenantId),
        ),
      );
    return row;
  }

  async createRegionalExtension(
    extension: InsertDppRegionalExtension,
  ): Promise<DppRegionalExtension> {
    const product = await this.getProduct(extension.productId);
    if (!product) {
      throw new Error("Product not found for this tenant");
    }
    const [row] = await db
      .insert(dppRegionalExtensions)
      .values({ ...(extension as any), tenantId: this.tenantId } as typeof dppRegionalExtensions.$inferInsert)
      .returning();
    return row;
  }

  async updateRegionalExtension(
    id: string,
    updates: Partial<InsertDppRegionalExtension>,
  ): Promise<DppRegionalExtension | undefined> {
    const existing = await this.getRegionalExtension(id);
    if (!existing) return undefined;
    const [row] = await db
      .update(dppRegionalExtensions)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(
        and(
          eq(dppRegionalExtensions.id, id),
          eq(dppRegionalExtensions.tenantId as any, this.tenantId),
        ),
      )
      .returning();
    return row;
  }

  async deleteRegionalExtension(id: string): Promise<boolean> {
    const result = await db
      .delete(dppRegionalExtensions)
      .where(
        and(
          eq(dppRegionalExtensions.id, id),
          eq(dppRegionalExtensions.tenantId as any, this.tenantId),
        ),
      )
      .returning();
    return result.length > 0;
  }

  async createEnterpriseConnector(insert: InsertEnterpriseConnector): Promise<EnterpriseConnector> {
    const [row] = await db
      .insert(enterpriseConnectors)
      .values({ ...(insert as any), tenantId: this.tenantId } as typeof enterpriseConnectors.$inferInsert)
      .returning();
    return row;
  }

  async updateEnterpriseConnector(
    id: string,
    updates: Partial<InsertEnterpriseConnector> & Record<string, unknown>,
  ): Promise<EnterpriseConnector | undefined> {
    const owned = await this.getEnterpriseConnector(id);
    if (!owned) return undefined;
    const [row] = await db
      .update(enterpriseConnectors)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(
        and(
          eq(enterpriseConnectors.id, id),
          eq(enterpriseConnectors.tenantId as any, this.tenantId),
        ),
      )
      .returning();
    return row;
  }

  async deleteEnterpriseConnector(id: string): Promise<boolean> {
    const owned = await this.getEnterpriseConnector(id);
    if (!owned) return false;
    const result = await db
      .delete(enterpriseConnectors)
      .where(
        and(
          eq(enterpriseConnectors.id, id),
          eq(enterpriseConnectors.tenantId as any, this.tenantId),
        ),
      )
      .returning();
    return result.length > 0;
  }

  async createIntegrationSyncLog(insert: InsertIntegrationSyncLog): Promise<IntegrationSyncLog> {
    const [row] = await db
      .insert(integrationSyncLogs)
      .values({ ...(insert as any), tenantId: this.tenantId } as typeof integrationSyncLogs.$inferInsert)
      .returning();
    return row;
  }

  async updateIntegrationSyncLog(
    id: string,
    updates: Partial<IntegrationSyncLog>,
  ): Promise<IntegrationSyncLog | undefined> {
    const [existing] = await db
      .select()
      .from(integrationSyncLogs)
      .where(
        and(eq(integrationSyncLogs.id, id), eq(integrationSyncLogs.tenantId as any, this.tenantId)),
      );
    if (!existing) return undefined;
    const [row] = await db
      .update(integrationSyncLogs)
      .set(updates as any)
      .where(
        and(eq(integrationSyncLogs.id, id), eq(integrationSyncLogs.tenantId as any, this.tenantId)),
      )
      .returning();
    return row;
  }

  async getSyncLogsByConnectorId(connectorId: string): Promise<IntegrationSyncLog[]> {
    const connector = await this.getEnterpriseConnector(connectorId);
    if (!connector) return [];
    return db
      .select()
      .from(integrationSyncLogs)
      .where(
        and(
          eq(integrationSyncLogs.connectorId, connectorId),
          eq(integrationSyncLogs.tenantId as any, this.tenantId),
        ),
      )
      .orderBy(desc(integrationSyncLogs.startedAt));
  }

  // ----------------------------------------
  // PASSTHROUGH — escape hatch (partners table, public lookups, etc.)
  // ----------------------------------------

  /** Returns the full IStorage for methods that are tenant-agnostic. */
  get base(): IStorage { return storage; }
}
