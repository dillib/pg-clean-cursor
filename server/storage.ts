import { eq, desc, and, gte, lte, or, isNull, ne } from "drizzle-orm";
import { db } from "./db";
import { computeLeadStatsFromLeads } from "./lead-stats";
import {
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Role,
  type InsertRole,
  type Identity,
  type InsertIdentity,
  type QRCode,
  type InsertQRCode,
  type TraceEvent,
  type InsertTraceEvent,
  type AIInsight,
  type InsertAIInsight,
  type AuditLog,
  type InsertAuditLog,
  type ProductPassport,
  type InsertProductPassport,
  type IoTDevice,
  type InsertIoTDevice,
  type IoTSensorReading,
  type IoTDeviceStatus,
  type DppRegionalExtension,
  type InsertDppRegionalExtension,
  type DppAiInsight,
  type InsertDppAiInsight,
  type AIInsightType,
  type RegionCode,
  type EnterpriseConnector,
  type InsertEnterpriseConnector,
  type IntegrationSyncLog,
  type InsertIntegrationSyncLog,
  type Lead,
  type InsertLead,
  type LeadActivity,
  type InsertLeadActivity,
  type LeadStatus,
  type Partner,
  type DemoConfig,
  type InsertDemoConfig,
  type CustomerAccount,
  type InsertCustomerAccount,
  type AccountActivity,
  type InsertAccountActivity,
  type NextBestAction,
  type InsertNextBestAction,
  type ActionStatus,
  type DemoInstance,
  type InsertDemoInstance,
  type DemoInstanceStatus,
  type PersonaTemplate,
  type InsertPersonaTemplate,
  type SupportTicket,
  type InsertSupportTicket,
  type TicketStatus,
  type DemoBooking,
  type InsertDemoBooking,
  type DemoBookingStatus,
  type ProductScan,
  type InsertProductScan,
  type ProductRegistration,
  type InsertProductRegistration,
  users,
  products,
  roles,
  identities,
  qrCodes,
  traceEvents,
  aiInsights,
  auditLogs,
  productPassports,
  iotDevices,
  dppRegionalExtensions,
  dppAiInsights,
  enterpriseConnectors,
  integrationSyncLogs,
  leads,
  leadActivities,
  partners,
  demoConfigs,
  customerAccounts,
  accountActivities,
  nextBestActions,
  demoInstances,
  personaTemplates,
  supportTickets,
  platformMetrics,
  demoBookings,
  productScans,
  productRegistrations,
  tenants,
  type Tenant,
  type TenantTheme,
  type PublicTenantTheme,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  
  // Products
  getProduct(id: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct> & { qrCodeData?: string | null }): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Roles
  getRole(id: string): Promise<Role | undefined>;
  getRoleByName(name: string): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  
  // Identities
  getIdentity(id: string): Promise<Identity | undefined>;
  getIdentityByProductId(productId: string): Promise<Identity | undefined>;
  getIdentityBySerialNumber(serialNumber: string): Promise<Identity | undefined>;
  createIdentity(identity: InsertIdentity): Promise<Identity>;
  
  // QR Codes
  getQRCode(id: string): Promise<QRCode | undefined>;
  getQRCodeByProductId(productId: string): Promise<QRCode | undefined>;
  createQRCode(qrCode: InsertQRCode): Promise<QRCode>;
  incrementQRScanCount(id: string): Promise<QRCode | undefined>;
  
  // Trace Events
  getTraceEvent(id: string): Promise<TraceEvent | undefined>;
  getTraceEventsByProductId(productId: string): Promise<TraceEvent[]>;
  createTraceEvent(event: InsertTraceEvent): Promise<TraceEvent>;
  
  // AI Insights
  getAIInsight(id: string): Promise<AIInsight | undefined>;
  getAIInsightsByProductId(productId: string): Promise<AIInsight[]>;
  createAIInsight(insight: InsertAIInsight): Promise<AIInsight>;
  markInsightStale(productId: string): Promise<void>;
  
  // Audit Logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(entityType?: string, entityId?: string): Promise<AuditLog[]>;
  
  // Product Passports
  getProductPassport(id: string): Promise<ProductPassport | undefined>;
  getProductPassportByProductId(productId: string): Promise<ProductPassport | undefined>;
  createProductPassport(passport: InsertProductPassport): Promise<ProductPassport>;
  updateProductPassport(id: string, updates: Partial<InsertProductPassport>): Promise<ProductPassport | undefined>;
  
  // IoT Devices
  getIoTDevice(id: string): Promise<IoTDevice | undefined>;
  getIoTDeviceByDeviceId(deviceId: string): Promise<IoTDevice | undefined>;
  getIoTDevicesByProductId(productId: string): Promise<IoTDevice[]>;
  getAllIoTDevices(): Promise<IoTDevice[]>;
  createIoTDevice(device: InsertIoTDevice): Promise<IoTDevice>;
  updateIoTDeviceStatus(id: string, status: IoTDeviceStatus): Promise<IoTDevice | undefined>;
  recordIoTReading(id: string, reading: IoTSensorReading): Promise<IoTDevice | undefined>;
  deleteIoTDevice(id: string): Promise<boolean>;

  // DPP Regional Extensions
  getRegionalExtension(id: string): Promise<DppRegionalExtension | undefined>;
  getRegionalExtensionsByProductId(productId: string): Promise<DppRegionalExtension[]>;
  getRegionalExtensionByProductAndRegion(productId: string, regionCode: RegionCode): Promise<DppRegionalExtension | undefined>;
  createRegionalExtension(extension: InsertDppRegionalExtension): Promise<DppRegionalExtension>;
  updateRegionalExtension(id: string, updates: Partial<InsertDppRegionalExtension>): Promise<DppRegionalExtension | undefined>;
  deleteRegionalExtension(id: string): Promise<boolean>;

  // DPP AI Insights (Enhanced)
  getDppAiInsight(id: string): Promise<DppAiInsight | undefined>;
  getDppAiInsightsByProductId(productId: string): Promise<DppAiInsight[]>;
  createDppAiInsight(insight: InsertDppAiInsight): Promise<DppAiInsight>;
  markDppInsightStale(productId: string): Promise<void>;
  getDppAiInsightByTypeAndProduct(productId: string, insightType: string): Promise<DppAiInsight | undefined>;

  // Enterprise Connectors
  getEnterpriseConnector(id: string): Promise<EnterpriseConnector | undefined>;
  getAllEnterpriseConnectors(): Promise<EnterpriseConnector[]>;
  createEnterpriseConnector(connector: InsertEnterpriseConnector): Promise<EnterpriseConnector>;
  updateEnterpriseConnector(id: string, updates: Partial<InsertEnterpriseConnector>): Promise<EnterpriseConnector | undefined>;
  deleteEnterpriseConnector(id: string): Promise<boolean>;

  // Integration Sync Logs
  getIntegrationSyncLog(id: string): Promise<IntegrationSyncLog | undefined>;
  getSyncLogsByConnectorId(connectorId: string): Promise<IntegrationSyncLog[]>;
  createIntegrationSyncLog(log: InsertIntegrationSyncLog): Promise<IntegrationSyncLog>;
  updateIntegrationSyncLog(id: string, updates: Partial<IntegrationSyncLog>): Promise<IntegrationSyncLog | undefined>;

  // Partners
  getPartner(id: string): Promise<Partner | undefined>;
  getPartnerByEmail(email: string): Promise<Partner | undefined>;
  getAllPartners(): Promise<Partner[]>;
  createPartner(partner: Omit<Partner, "id" | "createdAt" | "updatedAt" | "lastLoginAt">): Promise<Partner>;
  updatePartner(id: string, updates: Partial<Partner>): Promise<Partner | undefined>;
  deletePartner(id: string): Promise<boolean>;

  // Demo Configs
  getDemoConfig(id: string): Promise<DemoConfig | undefined>;
  getAllDemoConfigs(): Promise<DemoConfig[]>;
  createDemoConfig(config: InsertDemoConfig): Promise<DemoConfig>;
  updateDemoConfig(id: string, updates: Partial<DemoConfig>): Promise<DemoConfig | undefined>;
  deleteDemoConfig(id: string): Promise<boolean>;

  // Customer Accounts
  getCustomerAccount(id: string): Promise<CustomerAccount | undefined>;
  getAllCustomerAccounts(): Promise<CustomerAccount[]>;
  createCustomerAccount(account: InsertCustomerAccount): Promise<CustomerAccount>;
  updateCustomerAccount(id: string, updates: Partial<CustomerAccount>): Promise<CustomerAccount | undefined>;
  deleteCustomerAccount(id: string): Promise<boolean>;

  // Account Activities
  getAccountActivities(accountId: string): Promise<AccountActivity[]>;
  createAccountActivity(activity: InsertAccountActivity): Promise<AccountActivity>;

  // Next Best Actions
  getNextBestActions(accountId: string): Promise<NextBestAction[]>;
  getAllPendingActions(): Promise<NextBestAction[]>;
  createNextBestAction(action: InsertNextBestAction): Promise<NextBestAction>;
  updateNextBestActionStatus(id: string, status: ActionStatus): Promise<NextBestAction | undefined>;

  // Demo Instances
  getDemoInstance(id: string): Promise<DemoInstance | undefined>;
  getAllDemoInstances(): Promise<DemoInstance[]>;
  createDemoInstance(instance: InsertDemoInstance): Promise<DemoInstance>;
  updateDemoInstance(id: string, updates: Partial<DemoInstance>): Promise<DemoInstance | undefined>;
  deleteDemoInstance(id: string): Promise<boolean>;

  // Persona Templates
  getPersonaTemplate(id: string): Promise<PersonaTemplate | undefined>;
  getAllPersonaTemplates(): Promise<PersonaTemplate[]>;
  createPersonaTemplate(template: InsertPersonaTemplate): Promise<PersonaTemplate>;

  // Support Tickets
  getSupportTicket(id: string): Promise<SupportTicket | undefined>;
  getAllSupportTickets(): Promise<SupportTicket[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: string, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined>;

  // Platform Metrics
  recordMetric(
    metricType: string,
    value: number,
    metadata?: Record<string, unknown>,
    tenantId?: string
  ): Promise<void>;
  getMetrics(
    metricType?: string,
    limit?: number,
    tenantId?: string
  ): Promise<Array<{ metricType: string; value: number; metadata: Record<string, unknown> | null; recordedAt: Date }>>;

  // Demo Bookings
  getAllDemoBookings(): Promise<DemoBooking[]>;
  getDemoBooking(id: string): Promise<DemoBooking | undefined>;
  getBookedSlots(startDate: Date, endDate: Date): Promise<Date[]>;
  createDemoBooking(booking: InsertDemoBooking): Promise<DemoBooking>;
  updateDemoBookingStatus(id: string, status: DemoBookingStatus): Promise<DemoBooking | undefined>;
  updateDemoBookingLeadId(bookingId: string, leadId: string): Promise<void>;
  getUpcomingBookingsForReminders(): Promise<DemoBooking[]>;
  markReminder24hSent(id: string): Promise<void>;
  markReminder1hSent(id: string): Promise<void>;

  // Product Scans (Scan Intelligence)
  recordProductScan(scan: InsertProductScan): Promise<ProductScan>;
  findProductScanBySession(productId: string, sessionId: string): Promise<ProductScan | undefined>;
  getProductScanStats(productId: string): Promise<{ total: number; unique: number; last30Days: number }>;
  getRecentProductScans(productId: string, limit?: number): Promise<ProductScan[]>;
  getScansByDay(productId: string, days?: number): Promise<Array<{ date: string; count: number }>>;

  // Product Registrations (Consumer ownership)
  createProductRegistration(reg: InsertProductRegistration): Promise<ProductRegistration>;
  getProductRegistrations(productId: string): Promise<ProductRegistration[]>;

  // Tenants — white-label theme lives in tenants.settings.theme JSONB
  getTenant(id: string): Promise<Tenant | undefined>;
  getPublicTenantTheme(tenantId: string): Promise<PublicTenantTheme | undefined>;
  updateTenantTheme(tenantId: string, theme: Partial<TenantTheme>): Promise<Tenant | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  /** Legacy API name — `users` has no `username` column; matches email. */
  async getUserByUsername(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Products
  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products).orderBy(desc(products.createdAt));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values({
      ...insertProduct,
      ownershipHistory: insertProduct.ownershipHistory || [],
    }).returning();
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct> & { qrCodeData?: string | null }): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  // Roles
  async getRole(id: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role;
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.name, name));
    return role;
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    const [role] = await db.insert(roles).values(insertRole).returning();
    return role;
  }

  // Identities
  async getIdentity(id: string): Promise<Identity | undefined> {
    const [identity] = await db.select().from(identities).where(eq(identities.id, id));
    return identity;
  }

  async getIdentityByProductId(productId: string): Promise<Identity | undefined> {
    const [identity] = await db.select().from(identities).where(eq(identities.productId, productId));
    return identity;
  }

  async getIdentityBySerialNumber(serialNumber: string): Promise<Identity | undefined> {
    const [identity] = await db.select().from(identities).where(eq(identities.serialNumber, serialNumber));
    return identity;
  }

  async createIdentity(insertIdentity: InsertIdentity): Promise<Identity> {
    const [identity] = await db.insert(identities).values(insertIdentity).returning();
    return identity;
  }

  // QR Codes
  async getQRCode(id: string): Promise<QRCode | undefined> {
    const [qrCode] = await db.select().from(qrCodes).where(eq(qrCodes.id, id));
    return qrCode;
  }

  async getQRCodeByProductId(productId: string): Promise<QRCode | undefined> {
    const [qrCode] = await db.select().from(qrCodes).where(eq(qrCodes.productId, productId));
    return qrCode;
  }

  async createQRCode(insertQRCode: InsertQRCode): Promise<QRCode> {
    const [qrCode] = await db.insert(qrCodes).values(insertQRCode).returning();
    return qrCode;
  }

  async incrementQRScanCount(id: string): Promise<QRCode | undefined> {
    const existing = await this.getQRCode(id);
    if (!existing) return undefined;
    
    const [qrCode] = await db
      .update(qrCodes)
      .set({ 
        scanCount: existing.scanCount + 1, 
        lastScannedAt: new Date() 
      })
      .where(eq(qrCodes.id, id))
      .returning();
    return qrCode;
  }

  // Trace Events
  async getTraceEvent(id: string): Promise<TraceEvent | undefined> {
    const [event] = await db.select().from(traceEvents).where(eq(traceEvents.id, id));
    return event;
  }

  async getTraceEventsByProductId(productId: string): Promise<TraceEvent[]> {
    return db
      .select()
      .from(traceEvents)
      .where(eq(traceEvents.productId, productId))
      .orderBy(desc(traceEvents.timestamp));
  }

  async createTraceEvent(insertEvent: InsertTraceEvent): Promise<TraceEvent> {
    const [event] = await db.insert(traceEvents).values(insertEvent as typeof traceEvents.$inferInsert).returning();
    return event;
  }

  // AI Insights
  async getAIInsight(id: string): Promise<AIInsight | undefined> {
    const [insight] = await db.select().from(aiInsights).where(eq(aiInsights.id, id));
    return insight;
  }

  async getAIInsightsByProductId(productId: string): Promise<AIInsight[]> {
    return db
      .select()
      .from(aiInsights)
      .where(eq(aiInsights.productId, productId))
      .orderBy(desc(aiInsights.createdAt));
  }

  async createAIInsight(insertInsight: InsertAIInsight): Promise<AIInsight> {
    const [insight] = await db.insert(aiInsights).values(insertInsight as typeof aiInsights.$inferInsert).returning();
    return insight;
  }

  async markInsightStale(productId: string): Promise<void> {
    await db
      .update(aiInsights)
      .set({ isStale: true })
      .where(eq(aiInsights.productId, productId));
  }

  // Audit Logs
  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(insertLog as typeof auditLogs.$inferInsert).returning();
    return log;
  }

  async getAuditLogs(entityType?: string, entityId?: string): Promise<AuditLog[]> {
    const conditions = [];
    
    if (entityType) {
      conditions.push(eq(auditLogs.entityType, entityType));
    }
    if (entityId) {
      conditions.push(eq(auditLogs.entityId, entityId));
    }
    
    if (conditions.length > 0) {
      return db
        .select()
        .from(auditLogs)
        .where(and(...conditions))
        .orderBy(desc(auditLogs.timestamp));
    }
    
    return db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp));
  }

  // Product Passports
  async getProductPassport(id: string): Promise<ProductPassport | undefined> {
    const [passport] = await db.select().from(productPassports).where(eq(productPassports.id, id));
    return passport;
  }

  async getProductPassportByProductId(productId: string): Promise<ProductPassport | undefined> {
    const [passport] = await db
      .select()
      .from(productPassports)
      .where(eq(productPassports.productId, productId));
    return passport;
  }

  async createProductPassport(insertPassport: InsertProductPassport): Promise<ProductPassport> {
    const [passport] = await db.insert(productPassports).values(insertPassport).returning();
    return passport;
  }

  async updateProductPassport(id: string, updates: Partial<InsertProductPassport>): Promise<ProductPassport | undefined> {
    const [passport] = await db
      .update(productPassports)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(productPassports.id, id))
      .returning();
    return passport;
  }

  // IoT Devices
  async getIoTDevice(id: string): Promise<IoTDevice | undefined> {
    const [device] = await db.select().from(iotDevices).where(eq(iotDevices.id, id));
    return device;
  }

  async getIoTDeviceByDeviceId(deviceId: string): Promise<IoTDevice | undefined> {
    const [device] = await db.select().from(iotDevices).where(eq(iotDevices.deviceId, deviceId));
    return device;
  }

  async getIoTDevicesByProductId(productId: string): Promise<IoTDevice[]> {
    return db.select().from(iotDevices).where(eq(iotDevices.productId, productId));
  }

  async getAllIoTDevices(): Promise<IoTDevice[]> {
    return db.select().from(iotDevices).orderBy(desc(iotDevices.createdAt));
  }

  async createIoTDevice(insertDevice: InsertIoTDevice): Promise<IoTDevice> {
    const [device] = await db.insert(iotDevices).values(insertDevice as typeof iotDevices.$inferInsert).returning();
    return device;
  }

  async updateIoTDeviceStatus(id: string, status: IoTDeviceStatus): Promise<IoTDevice | undefined> {
    const [device] = await db
      .update(iotDevices)
      .set({ status, updatedAt: new Date() })
      .where(eq(iotDevices.id, id))
      .returning();
    return device;
  }

  async recordIoTReading(id: string, reading: IoTSensorReading): Promise<IoTDevice | undefined> {
    const [device] = await db
      .update(iotDevices)
      .set({ 
        lastReading: reading, 
        lastSeenAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(iotDevices.id, id))
      .returning();
    return device;
  }

  async deleteIoTDevice(id: string): Promise<boolean> {
    const result = await db.delete(iotDevices).where(eq(iotDevices.id, id)).returning();
    return result.length > 0;
  }

  // DPP Regional Extensions
  async getRegionalExtension(id: string): Promise<DppRegionalExtension | undefined> {
    const [extension] = await db.select().from(dppRegionalExtensions).where(eq(dppRegionalExtensions.id, id));
    return extension;
  }

  async getRegionalExtensionsByProductId(productId: string): Promise<DppRegionalExtension[]> {
    return db.select().from(dppRegionalExtensions).where(eq(dppRegionalExtensions.productId, productId));
  }

  async getRegionalExtensionByProductAndRegion(productId: string, regionCode: RegionCode): Promise<DppRegionalExtension | undefined> {
    const [extension] = await db
      .select()
      .from(dppRegionalExtensions)
      .where(and(
        eq(dppRegionalExtensions.productId, productId),
        eq(dppRegionalExtensions.regionCode, regionCode)
      ));
    return extension;
  }

  async createRegionalExtension(insertExtension: InsertDppRegionalExtension): Promise<DppRegionalExtension> {
    const [extension] = await db.insert(dppRegionalExtensions).values(insertExtension as typeof dppRegionalExtensions.$inferInsert).returning();
    return extension;
  }

  async updateRegionalExtension(id: string, updates: Partial<InsertDppRegionalExtension>): Promise<DppRegionalExtension | undefined> {
    const [extension] = await db
      .update(dppRegionalExtensions)
      .set({ ...updates, updatedAt: new Date() } as Record<string, unknown>)
      .where(eq(dppRegionalExtensions.id, id))
      .returning();
    return extension;
  }

  async deleteRegionalExtension(id: string): Promise<boolean> {
    const result = await db.delete(dppRegionalExtensions).where(eq(dppRegionalExtensions.id, id)).returning();
    return result.length > 0;
  }

  // DPP AI Insights (Enhanced)
  async getDppAiInsight(id: string): Promise<DppAiInsight | undefined> {
    const [insight] = await db.select().from(dppAiInsights).where(eq(dppAiInsights.id, id));
    return insight;
  }

  async getDppAiInsightsByProductId(productId: string): Promise<DppAiInsight[]> {
    return db.select().from(dppAiInsights).where(eq(dppAiInsights.productId, productId));
  }

  async createDppAiInsight(insertInsight: InsertDppAiInsight): Promise<DppAiInsight> {
    const [insight] = await db.insert(dppAiInsights).values(insertInsight as typeof dppAiInsights.$inferInsert).returning();
    return insight;
  }

  async markDppInsightStale(productId: string): Promise<void> {
    await db
      .update(dppAiInsights)
      .set({ isStale: true })
      .where(eq(dppAiInsights.productId, productId));
  }

  async getDppAiInsightByTypeAndProduct(productId: string, insightType: string): Promise<DppAiInsight | undefined> {
    const [insight] = await db
      .select()
      .from(dppAiInsights)
      .where(and(
        eq(dppAiInsights.productId, productId),
        eq(dppAiInsights.insightType, insightType as AIInsightType)
      ))
      .orderBy(desc(dppAiInsights.createdAt))
      .limit(1);
    return insight;
  }

  // Enterprise Connectors
  async getEnterpriseConnector(id: string): Promise<EnterpriseConnector | undefined> {
    const [connector] = await db.select().from(enterpriseConnectors).where(eq(enterpriseConnectors.id, id));
    return connector;
  }

  async getAllEnterpriseConnectors(): Promise<EnterpriseConnector[]> {
    return db.select().from(enterpriseConnectors).orderBy(desc(enterpriseConnectors.createdAt));
  }

  async createEnterpriseConnector(insertConnector: InsertEnterpriseConnector): Promise<EnterpriseConnector> {
    const [connector] = await db.insert(enterpriseConnectors).values(insertConnector as typeof enterpriseConnectors.$inferInsert).returning();
    return connector;
  }

  async updateEnterpriseConnector(id: string, updates: Partial<InsertEnterpriseConnector> & Record<string, unknown>): Promise<EnterpriseConnector | undefined> {
    const [connector] = await db
      .update(enterpriseConnectors)
      .set({ ...updates, updatedAt: new Date() } as typeof enterpriseConnectors.$inferInsert)
      .where(eq(enterpriseConnectors.id, id))
      .returning();
    return connector;
  }

  async deleteEnterpriseConnector(id: string): Promise<boolean> {
    const result = await db.delete(enterpriseConnectors).where(eq(enterpriseConnectors.id, id)).returning();
    return result.length > 0;
  }

  // Integration Sync Logs
  async getIntegrationSyncLog(id: string): Promise<IntegrationSyncLog | undefined> {
    const [log] = await db.select().from(integrationSyncLogs).where(eq(integrationSyncLogs.id, id));
    return log;
  }

  async getSyncLogsByConnectorId(connectorId: string): Promise<IntegrationSyncLog[]> {
    return db.select().from(integrationSyncLogs).where(eq(integrationSyncLogs.connectorId, connectorId)).orderBy(desc(integrationSyncLogs.startedAt));
  }

  async createIntegrationSyncLog(insertLog: InsertIntegrationSyncLog): Promise<IntegrationSyncLog> {
    const [log] = await db.insert(integrationSyncLogs).values(insertLog as typeof integrationSyncLogs.$inferInsert).returning();
    return log;
  }

  async updateIntegrationSyncLog(id: string, updates: Partial<IntegrationSyncLog>): Promise<IntegrationSyncLog | undefined> {
    const [log] = await db
      .update(integrationSyncLogs)
      .set(updates)
      .where(eq(integrationSyncLogs.id, id))
      .returning();
    return log;
  }

  // Leads CRM
  async getAllLeads(tenantId?: string): Promise<Lead[]> {
    if (tenantId !== undefined) {
      return db
        .select()
        .from(leads)
        .where(eq(leads.tenantId as any, tenantId))
        .orderBy(desc(leads.createdAt));
    }
    return db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async getLeadByEmail(email: string, tenantId = "default"): Promise<Lead | undefined> {
    const [lead] = await db
      .select()
      .from(leads)
      .where(and(eq(leads.email, email), eq(leads.tenantId as any, tenantId)));
    return lead;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const tenantId = (insertLead as { tenantId?: string }).tenantId ?? "default";
    const [lead] = await db
      .insert(leads)
      .values({ ...(insertLead as typeof leads.$inferInsert), tenantId } as typeof leads.$inferInsert)
      .returning();
    return lead;
  }

  async updateLead(id: string, updates: Partial<Lead>, restrictToTenantId?: string): Promise<Lead | undefined> {
    const cond =
      restrictToTenantId !== undefined
        ? and(eq(leads.id, id), eq(leads.tenantId as any, restrictToTenantId))
        : eq(leads.id, id);
    const [lead] = await db
      .update(leads)
      .set({ ...updates, updatedAt: new Date() } as typeof leads.$inferInsert)
      .where(cond)
      .returning();
    return lead;
  }

  async deleteLead(id: string, restrictToTenantId?: string): Promise<boolean> {
    const cond =
      restrictToTenantId !== undefined
        ? and(eq(leads.id, id), eq(leads.tenantId as any, restrictToTenantId))
        : eq(leads.id, id);
    const result = await db.delete(leads).where(cond).returning();
    return result.length > 0;
  }

  async getLeadsByStatus(status: LeadStatus, tenantId?: string): Promise<Lead[]> {
    if (tenantId !== undefined) {
      return db
        .select()
        .from(leads)
        .where(and(eq(leads.status, status), eq(leads.tenantId as any, tenantId)))
        .orderBy(desc(leads.createdAt));
    }
    return db.select().from(leads).where(eq(leads.status, status)).orderBy(desc(leads.createdAt));
  }

  // Lead Activities
  async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    return db.select().from(leadActivities).where(eq(leadActivities.leadId, leadId)).orderBy(desc(leadActivities.createdAt));
  }

  async createLeadActivity(insertActivity: InsertLeadActivity): Promise<LeadActivity> {
    const [activity] = await db.insert(leadActivities).values(insertActivity as typeof leadActivities.$inferInsert).returning();
    return activity;
  }

  // Lead Stats for VC Metrics
  async getLeadStats(tenantId?: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byTier: Record<string, number>;
    bySource: Record<string, number>;
    thisWeek: number;
    lastWeek: number;
  }> {
    const allLeads = await this.getAllLeads(tenantId);
    return computeLeadStatsFromLeads(allLeads);
  }

  // Partners
  async getPartner(id: string): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id));
    return partner;
  }

  async getPartnerByEmail(email: string): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.email, email));
    return partner;
  }

  async getAllPartners(): Promise<Partner[]> {
    return db.select().from(partners).orderBy(desc(partners.createdAt));
  }

  async createPartner(partner: Omit<Partner, "id" | "createdAt" | "updatedAt" | "lastLoginAt">): Promise<Partner> {
    const [created] = await db.insert(partners).values(partner as typeof partners.$inferInsert).returning();
    return created;
  }

  async updatePartner(id: string, updates: Partial<Partner>): Promise<Partner | undefined> {
    const [updated] = await db
      .update(partners)
      .set({ ...updates, updatedAt: new Date() } as typeof partners.$inferInsert)
      .where(eq(partners.id, id))
      .returning();
    return updated;
  }

  async deletePartner(id: string): Promise<boolean> {
    const result = await db.delete(partners).where(eq(partners.id, id)).returning();
    return result.length > 0;
  }

  // Demo Configs
  async getDemoConfig(id: string): Promise<DemoConfig | undefined> {
    const [config] = await db.select().from(demoConfigs).where(eq(demoConfigs.id, id));
    return config;
  }

  async getAllDemoConfigs(): Promise<DemoConfig[]> {
    return db.select().from(demoConfigs).orderBy(desc(demoConfigs.createdAt));
  }

  async createDemoConfig(config: InsertDemoConfig): Promise<DemoConfig> {
    const [created] = await db.insert(demoConfigs).values(config as typeof demoConfigs.$inferInsert).returning();
    return created;
  }

  async updateDemoConfig(id: string, updates: Partial<DemoConfig>): Promise<DemoConfig | undefined> {
    const [updated] = await db
      .update(demoConfigs)
      .set(updates as typeof demoConfigs.$inferInsert)
      .where(eq(demoConfigs.id, id))
      .returning();
    return updated;
  }

  async deleteDemoConfig(id: string): Promise<boolean> {
    const result = await db.delete(demoConfigs).where(eq(demoConfigs.id, id)).returning();
    return result.length > 0;
  }

  // Customer Accounts
  async getCustomerAccount(id: string): Promise<CustomerAccount | undefined> {
    const [account] = await db.select().from(customerAccounts).where(eq(customerAccounts.id, id));
    return account;
  }

  async getAllCustomerAccounts(): Promise<CustomerAccount[]> {
    return db.select().from(customerAccounts).orderBy(desc(customerAccounts.createdAt));
  }

  async createCustomerAccount(account: InsertCustomerAccount): Promise<CustomerAccount> {
    const tenantId = (account as { tenantId?: string }).tenantId ?? "default";
    const [created] = await db
      .insert(customerAccounts)
      .values({ ...(account as typeof customerAccounts.$inferInsert), tenantId } as typeof customerAccounts.$inferInsert)
      .returning();
    return created;
  }

  async updateCustomerAccount(id: string, updates: Partial<CustomerAccount>): Promise<CustomerAccount | undefined> {
    const [updated] = await db
      .update(customerAccounts)
      .set({ ...updates, updatedAt: new Date() } as typeof customerAccounts.$inferInsert)
      .where(eq(customerAccounts.id, id))
      .returning();
    return updated;
  }

  async deleteCustomerAccount(id: string): Promise<boolean> {
    const result = await db.delete(customerAccounts).where(eq(customerAccounts.id, id)).returning();
    return result.length > 0;
  }

  // Account Activities
  async getAccountActivities(accountId: string): Promise<AccountActivity[]> {
    return db.select().from(accountActivities).where(eq(accountActivities.accountId, accountId)).orderBy(desc(accountActivities.createdAt));
  }

  async createAccountActivity(activity: InsertAccountActivity): Promise<AccountActivity> {
    const tenantId = (activity as { tenantId?: string }).tenantId ?? "default";
    const [created] = await db
      .insert(accountActivities)
      .values({ ...(activity as typeof accountActivities.$inferInsert), tenantId } as typeof accountActivities.$inferInsert)
      .returning();
    return created;
  }

  // Next Best Actions
  async getNextBestActions(accountId: string): Promise<NextBestAction[]> {
    return db.select().from(nextBestActions).where(eq(nextBestActions.accountId, accountId)).orderBy(desc(nextBestActions.createdAt));
  }

  async getAllPendingActions(): Promise<NextBestAction[]> {
    return db.select().from(nextBestActions).where(eq(nextBestActions.status, "pending")).orderBy(desc(nextBestActions.createdAt));
  }

  async createNextBestAction(action: InsertNextBestAction): Promise<NextBestAction> {
    const tenantId = (action as { tenantId?: string }).tenantId ?? "default";
    const [created] = await db
      .insert(nextBestActions)
      .values({ ...(action as typeof nextBestActions.$inferInsert), tenantId } as typeof nextBestActions.$inferInsert)
      .returning();
    return created;
  }

  async updateNextBestActionStatus(id: string, status: ActionStatus): Promise<NextBestAction | undefined> {
    const updates: Record<string, unknown> = { status };
    if (status === "completed") updates.completedAt = new Date();
    const [updated] = await db
      .update(nextBestActions)
      .set(updates as typeof nextBestActions.$inferInsert)
      .where(eq(nextBestActions.id, id))
      .returning();
    return updated;
  }

  // Demo Instances
  async getDemoInstance(id: string): Promise<DemoInstance | undefined> {
    const [instance] = await db.select().from(demoInstances).where(eq(demoInstances.id, id));
    return instance;
  }

  async getAllDemoInstances(): Promise<DemoInstance[]> {
    return db.select().from(demoInstances).orderBy(desc(demoInstances.createdAt));
  }

  async createDemoInstance(instance: InsertDemoInstance): Promise<DemoInstance> {
    const tenantId = (instance as { tenantId?: string }).tenantId ?? "default";
    const [created] = await db
      .insert(demoInstances)
      .values({ ...(instance as typeof demoInstances.$inferInsert), tenantId } as typeof demoInstances.$inferInsert)
      .returning();
    return created;
  }

  async updateDemoInstance(id: string, updates: Partial<DemoInstance>): Promise<DemoInstance | undefined> {
    const [updated] = await db
      .update(demoInstances)
      .set({ ...updates, updatedAt: new Date() } as typeof demoInstances.$inferInsert)
      .where(eq(demoInstances.id, id))
      .returning();
    return updated;
  }

  async deleteDemoInstance(id: string): Promise<boolean> {
    const result = await db.delete(demoInstances).where(eq(demoInstances.id, id)).returning();
    return result.length > 0;
  }

  // Persona Templates
  async getPersonaTemplate(id: string): Promise<PersonaTemplate | undefined> {
    const [template] = await db.select().from(personaTemplates).where(eq(personaTemplates.id, id));
    return template;
  }

  async getAllPersonaTemplates(): Promise<PersonaTemplate[]> {
    return db.select().from(personaTemplates).orderBy(desc(personaTemplates.createdAt));
  }

  async createPersonaTemplate(template: InsertPersonaTemplate): Promise<PersonaTemplate> {
    const tenantId = (template as { tenantId?: string }).tenantId ?? "default";
    const [created] = await db
      .insert(personaTemplates)
      .values({ ...(template as typeof personaTemplates.$inferInsert), tenantId } as typeof personaTemplates.$inferInsert)
      .returning();
    return created;
  }

  // Support Tickets
  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return ticket;
  }

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    return db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const tenantId = (ticket as { tenantId?: string }).tenantId ?? "default";
    const [created] = await db
      .insert(supportTickets)
      .values({ ...(ticket as typeof supportTickets.$inferInsert), tenantId } as typeof supportTickets.$inferInsert)
      .returning();
    return created;
  }

  async updateSupportTicket(id: string, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const [updated] = await db
      .update(supportTickets)
      .set({ ...updates, updatedAt: new Date() } as typeof supportTickets.$inferInsert)
      .where(eq(supportTickets.id, id))
      .returning();
    return updated;
  }

  // Platform Metrics
  async recordMetric(
    metricType: string,
    value: number,
    metadata?: Record<string, unknown>,
    tenantId = "default"
  ): Promise<void> {
    await db.insert(platformMetrics).values({
      metricType,
      value,
      metadata: metadata || {},
      tenantId,
    } as typeof platformMetrics.$inferInsert);
  }

  async getMetrics(
    metricType?: string,
    limit: number = 100,
    tenantId?: string
  ): Promise<Array<{ metricType: string; value: number; metadata: Record<string, unknown> | null; recordedAt: Date }>> {
    const tenantCond =
      tenantId !== undefined ? eq(platformMetrics.tenantId as any, tenantId) : undefined;
    if (metricType && tenantCond) {
      return db
        .select()
        .from(platformMetrics)
        .where(and(eq(platformMetrics.metricType, metricType), tenantCond))
        .orderBy(desc(platformMetrics.recordedAt))
        .limit(limit);
    }
    if (metricType) {
      return db
        .select()
        .from(platformMetrics)
        .where(eq(platformMetrics.metricType, metricType))
        .orderBy(desc(platformMetrics.recordedAt))
        .limit(limit);
    }
    if (tenantCond) {
      return db
        .select()
        .from(platformMetrics)
        .where(tenantCond)
        .orderBy(desc(platformMetrics.recordedAt))
        .limit(limit);
    }
    return db.select().from(platformMetrics).orderBy(desc(platformMetrics.recordedAt)).limit(limit);
  }

  // Demo Bookings
  async getAllDemoBookings(): Promise<DemoBooking[]> {
    return db.select().from(demoBookings).orderBy(desc(demoBookings.slotDatetime));
  }

  async getDemoBooking(id: string): Promise<DemoBooking | undefined> {
    const [booking] = await db.select().from(demoBookings).where(eq(demoBookings.id, id));
    return booking;
  }

  async getBookedSlots(startDate: Date, endDate: Date): Promise<Date[]> {
    const bookings = await db.select({ slotDatetime: demoBookings.slotDatetime })
      .from(demoBookings)
      .where(
        and(
          gte(demoBookings.slotDatetime, startDate),
          lte(demoBookings.slotDatetime, endDate),
          or(
            eq(demoBookings.status, "pending" as DemoBookingStatus),
            eq(demoBookings.status, "confirmed" as DemoBookingStatus)
          )
        )
      );
    return bookings.map(b => b.slotDatetime);
  }

  async updateDemoBookingLeadId(bookingId: string, leadId: string): Promise<void> {
    await db
      .update(demoBookings)
      .set({ leadId, updatedAt: new Date() })
      .where(eq(demoBookings.id, bookingId));
  }

  async createDemoBooking(booking: InsertDemoBooking): Promise<DemoBooking> {
    const [created] = await db.insert(demoBookings).values(booking as typeof demoBookings.$inferInsert).returning();
    return created;
  }

  async updateDemoBookingStatus(id: string, status: DemoBookingStatus): Promise<DemoBooking | undefined> {
    const [updated] = await db
      .update(demoBookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(demoBookings.id, id))
      .returning();
    return updated;
  }

  async getUpcomingBookingsForReminders(): Promise<DemoBooking[]> {
    const now = new Date();
    const in26h = new Date(now.getTime() + 26 * 60 * 60 * 1000);
    return db
      .select()
      .from(demoBookings)
      .where(
        and(
          ne(demoBookings.status, "cancelled"),
          gte(demoBookings.slotDatetime, now),
          lte(demoBookings.slotDatetime, in26h)
        )
      );
  }

  async markReminder24hSent(id: string): Promise<void> {
    await db
      .update(demoBookings)
      .set({ reminder24hSentAt: new Date(), updatedAt: new Date() })
      .where(eq(demoBookings.id, id));
  }

  async markReminder1hSent(id: string): Promise<void> {
    await db
      .update(demoBookings)
      .set({ reminder1hSentAt: new Date(), updatedAt: new Date() })
      .where(eq(demoBookings.id, id));
  }

  // Product Scans
  async recordProductScan(scan: InsertProductScan): Promise<ProductScan> {
    const [created] = await db.insert(productScans).values(scan).returning();
    return created;
  }

  async findProductScanBySession(productId: string, sessionId: string): Promise<ProductScan | undefined> {
    const [scan] = await db.select().from(productScans)
      .where(and(eq(productScans.productId, productId), eq(productScans.sessionId, sessionId)))
      .limit(1);
    return scan;
  }

  async getProductScanStats(productId: string): Promise<{ total: number; unique: number; last30Days: number }> {
    const allScans = await db.select().from(productScans).where(eq(productScans.productId, productId));
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return {
      total: allScans.length,
      unique: allScans.filter(s => s.isUnique).length,
      last30Days: allScans.filter(s => s.scannedAt >= thirtyDaysAgo).length,
    };
  }

  async getRecentProductScans(productId: string, limit = 20): Promise<ProductScan[]> {
    return db.select().from(productScans)
      .where(eq(productScans.productId, productId))
      .orderBy(desc(productScans.scannedAt))
      .limit(limit);
  }

  async getScansByDay(productId: string, days = 30): Promise<Array<{ date: string; count: number }>> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const scans = await db.select().from(productScans)
      .where(and(eq(productScans.productId, productId), gte(productScans.scannedAt, since)));

    const buckets: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets[d.toISOString().slice(0, 10)] = 0;
    }
    for (const s of scans) {
      const key = s.scannedAt.toISOString().slice(0, 10);
      if (buckets[key] !== undefined) buckets[key]++;
    }
    return Object.entries(buckets).map(([date, count]) => ({ date, count }));
  }

  // Product Registrations
  async createProductRegistration(reg: InsertProductRegistration): Promise<ProductRegistration> {
    const [created] = await db.insert(productRegistrations).values(reg).returning();
    return created;
  }

  async getProductRegistrations(productId: string): Promise<ProductRegistration[]> {
    return db.select().from(productRegistrations)
      .where(eq(productRegistrations.productId, productId))
      .orderBy(desc(productRegistrations.registeredAt));
  }

  // ── Tenants ──────────────────────────────────────────────────────────────
  // White-label theme lives in tenants.settings.theme (JSONB) — no schema
  // change required. See shared/schema.ts TenantTheme.
  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  /**
   * Returns the public-safe view of a tenant's theme — the only fields the
   * unauthenticated consumer scan page is allowed to read. Returns null
   * defaults when the tenant has no theme configured (caller falls back to
   * platform defaults).
   */
  async getPublicTenantTheme(tenantId: string): Promise<PublicTenantTheme | undefined> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) return undefined;
    const settings = (tenant.settings ?? {}) as Record<string, unknown>;
    const theme = (settings.theme ?? {}) as TenantTheme;
    return {
      tenantId: tenant.id,
      brandName: theme.brandName ?? null,
      primaryColor: theme.primaryColor ?? null,
      primaryColorInk: theme.primaryColorInk ?? null,
      logoUrl: theme.logoUrl ?? null,
      tagline: theme.tagline ?? null,
    };
  }

  /**
   * Merge-update the theme block inside tenants.settings without clobbering
   * other settings keys. Empty-string values are normalised to undefined so
   * the UI can clear individual fields by sending "".
   */
  async updateTenantTheme(tenantId: string, theme: Partial<TenantTheme>): Promise<Tenant | undefined> {
    const existing = await this.getTenant(tenantId);
    if (!existing) return undefined;
    const settings = (existing.settings ?? {}) as Record<string, unknown>;
    const currentTheme = (settings.theme ?? {}) as TenantTheme;
    const cleaned: Partial<TenantTheme> = {};
    for (const [k, v] of Object.entries(theme)) {
      if (typeof v === "string" && v.trim() === "") continue;
      (cleaned as any)[k] = v;
    }
    const nextTheme: TenantTheme = { ...currentTheme, ...cleaned };
    const nextSettings = { ...settings, theme: nextTheme };
    const [updated] = await db
      .update(tenants)
      .set({ settings: nextSettings, updatedAt: new Date() })
      .where(eq(tenants.id, tenantId))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
