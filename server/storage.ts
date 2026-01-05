import { eq, desc, and } from "drizzle-orm";
import { db } from "./db";
import {
  type User,
  type InsertUser,
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
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
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
}

export const storage = new DatabaseStorage();
