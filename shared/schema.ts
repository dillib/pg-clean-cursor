import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// USERS & ROLES
// ============================================

export const roles = pgTable("roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
});

export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  roleId: varchar("role_id").references(() => roles.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ============================================
// PRODUCTS & DIGITAL PRODUCT PASSPORTS
// ============================================

export interface OwnershipEntry {
  owner: string;
  date: string;
  action: string;
}

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productName: text("product_name").notNull(),
  manufacturer: text("manufacturer").notNull(),
  batchNumber: text("batch_number").notNull(),
  materials: text("materials").notNull(),
  carbonFootprint: integer("carbon_footprint").notNull(),
  repairabilityScore: integer("repairability_score").notNull(),
  warrantyInfo: text("warranty_info").notNull(),
  ownershipHistory: jsonb("ownership_history").$type<OwnershipEntry[]>().default([]),
  recyclingInstructions: text("recycling_instructions").notNull(),
  productImage: text("product_image"),
  qrCodeData: text("qr_code_data"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  qrCodeData: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Product Passports - Extended DPP information
export const productPassports = pgTable("product_passports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id).notNull(),
  version: integer("version").default(1).notNull(),
  complianceData: jsonb("compliance_data").$type<Record<string, unknown>>().default({}),
  certifications: jsonb("certifications").$type<string[]>().default([]),
  environmentalDeclarations: jsonb("environmental_declarations").$type<Record<string, unknown>>().default({}),
  endOfLifeInstructions: text("end_of_life_instructions"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertProductPassportSchema = createInsertSchema(productPassports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProductPassport = z.infer<typeof insertProductPassportSchema>;
export type ProductPassport = typeof productPassports.$inferSelect;

// ============================================
// IDENTITIES
// ============================================

export const identities = pgTable("identities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id).notNull(),
  serialNumber: text("serial_number").notNull().unique(),
  gtin: text("gtin"),
  batchId: text("batch_id"),
  identityType: text("identity_type").default("product").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  isValid: boolean("is_valid").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertIdentitySchema = createInsertSchema(identities).omit({
  id: true,
  createdAt: true,
});

export type InsertIdentity = z.infer<typeof insertIdentitySchema>;
export type Identity = typeof identities.$inferSelect;

// ============================================
// QR CODES
// ============================================

export const qrCodes = pgTable("qr_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id).notNull(),
  identityId: varchar("identity_id").references(() => identities.id),
  qrData: text("qr_data").notNull(),
  qrImageUrl: text("qr_image_url"),
  format: text("format").default("png").notNull(),
  size: integer("size").default(256).notNull(),
  scanCount: integer("scan_count").default(0).notNull(),
  lastScannedAt: timestamp("last_scanned_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertQRCodeSchema = createInsertSchema(qrCodes).omit({
  id: true,
  createdAt: true,
  scanCount: true,
  lastScannedAt: true,
});

export type InsertQRCode = z.infer<typeof insertQRCodeSchema>;
export type QRCode = typeof qrCodes.$inferSelect;

// ============================================
// TRACE EVENTS (Supply Chain)
// ============================================

export type TraceEventType = 
  | "manufactured"
  | "shipped"
  | "received"
  | "transferred"
  | "inspected"
  | "repaired"
  | "recycled"
  | "disposed"
  | "custom";

export interface TraceLocation {
  name: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
}

export const traceEvents = pgTable("trace_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id).notNull(),
  eventType: text("event_type").$type<TraceEventType>().notNull(),
  actor: text("actor").notNull(),
  location: jsonb("location").$type<TraceLocation>(),
  description: text("description"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  parentEventId: varchar("parent_event_id"),
  timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertTraceEventSchema = createInsertSchema(traceEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertTraceEvent = z.infer<typeof insertTraceEventSchema>;
export type TraceEvent = typeof traceEvents.$inferSelect;

// ============================================
// AI INSIGHTS
// ============================================

export type AIInsightType = 
  | "summary"
  | "sustainability"
  | "repair"
  | "circularity"
  | "risk_assessment";

export const aiInsights = pgTable("ai_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id).notNull(),
  insightType: text("insight_type").$type<AIInsightType>().notNull(),
  content: jsonb("content").$type<Record<string, unknown>>().notNull(),
  confidence: integer("confidence"),
  model: text("model"),
  promptTokens: integer("prompt_tokens"),
  completionTokens: integer("completion_tokens"),
  isStale: boolean("is_stale").default(false).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  expiresAt: timestamp("expires_at"),
});

export const insertAIInsightSchema = createInsertSchema(aiInsights).omit({
  id: true,
  createdAt: true,
});

export type InsertAIInsight = z.infer<typeof insertAIInsightSchema>;
export type AIInsight = typeof aiInsights.$inferSelect;

// ============================================
// AUDIT LOGS
// ============================================

export type AuditAction = 
  | "create"
  | "update"
  | "delete"
  | "view"
  | "export"
  | "login"
  | "logout";

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: text("action").$type<AuditAction>().notNull(),
  entityType: text("entity_type").notNull(),
  entityId: varchar("entity_id"),
  oldValue: jsonb("old_value").$type<Record<string, unknown>>(),
  newValue: jsonb("new_value").$type<Record<string, unknown>>(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  correlationId: varchar("correlation_id"),
  timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// ============================================
// EVENTS (CloudEvents format for event bus)
// ============================================

export interface CloudEvent<T = unknown> {
  specversion?: string;
  id: string;
  source: string;
  type: string;
  time: string;
  datacontenttype: string;
  data: T;
  subject?: string;
  correlationid?: string;
}

export type EventType =
  | "com.photonictag.product.created"
  | "com.photonictag.product.updated"
  | "com.photonictag.product.deleted"
  | "com.photonictag.qr.generated"
  | "com.photonictag.identity.assigned"
  | "com.photonictag.trace.recorded"
  | "com.photonictag.ai.insights_generated";

// ============================================
// AI RESPONSE TYPES (kept for API compatibility)
// ============================================

export interface AISummary {
  summary: string;
  keyFeatures: string[];
}

export interface SustainabilityInsight {
  overallScore: number;
  carbonAnalysis: string;
  circularityRecommendations: string[];
  improvements: string[];
}

export interface RepairSummary {
  repairabilityRating: string;
  repairInstructions: string[];
  commonIssues: string[];
  partsAvailability: string;
}
