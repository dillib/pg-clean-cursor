import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// AUTH (from Replit Auth integration)
// ============================================
import { users, sessions, type User, type UpsertUser } from "./models/auth";
export { users, sessions, type User, type UpsertUser };

// ============================================
// ROLES (for RBAC)
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

// ============================================
// PRODUCTS & DIGITAL PRODUCT PASSPORTS
// ============================================

export interface OwnershipEntry {
  owner: string;
  date: string;
  action: string;
}

export interface MaterialBreakdown {
  material: string;
  percentage: number;
  recyclable: boolean;
}

export interface ServiceCenter {
  name: string;
  location: string;
  contact?: string;
}

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // === 1. PRODUCT IDENTIFICATION ===
  productName: text("product_name").notNull(),
  productCategory: text("product_category"),
  modelNumber: text("model_number"),
  sku: text("sku"),
  manufacturer: text("manufacturer").notNull(),
  manufacturerAddress: text("manufacturer_address"),
  countryOfOrigin: text("country_of_origin"),
  batchNumber: text("batch_number").notNull(),
  lotNumber: text("lot_number"),
  
  // === 2. MATERIALS & COMPOSITION ===
  materials: text("materials").notNull(),
  materialBreakdown: jsonb("material_breakdown").$type<MaterialBreakdown[]>().default([]),
  recycledContentPercent: integer("recycled_content_percent"),
  recyclabilityPercent: integer("recyclability_percent"),
  hazardousMaterials: text("hazardous_materials"),
  
  // === 3. ENVIRONMENTAL IMPACT ===
  carbonFootprint: integer("carbon_footprint").notNull(),
  waterUsage: integer("water_usage"),
  energyConsumption: integer("energy_consumption"),
  environmentalCertifications: jsonb("environmental_certifications").$type<string[]>().default([]),
  
  // === 4. DURABILITY & REPAIRABILITY ===
  repairabilityScore: integer("repairability_score").notNull(),
  expectedLifespanYears: integer("expected_lifespan_years"),
  sparePartsAvailable: boolean("spare_parts_available"),
  repairInstructions: text("repair_instructions"),
  serviceCenters: jsonb("service_centers").$type<ServiceCenter[]>().default([]),
  warrantyInfo: text("warranty_info").notNull(),
  
  // === 5. OWNERSHIP & LIFECYCLE ===
  dateOfManufacture: timestamp("date_of_manufacture"),
  dateOfFirstSale: timestamp("date_of_first_sale"),
  ownershipHistory: jsonb("ownership_history").$type<OwnershipEntry[]>().default([]),
  
  // === 6. COMPLIANCE & CERTIFICATIONS ===
  ceMarking: boolean("ce_marking"),
  safetyCertifications: jsonb("safety_certifications").$type<string[]>().default([]),
  
  // === 7. END-OF-LIFE & RECYCLING ===
  recyclingInstructions: text("recycling_instructions").notNull(),
  disassemblyInstructions: text("disassembly_instructions"),
  hazardWarnings: text("hazard_warnings"),
  takeBackPrograms: jsonb("take_back_programs").$type<string[]>().default([]),
  
  // === SYSTEM FIELDS ===
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
// IOT DEVICES (NFC, RFID, BLE Tags)
// ============================================

export type IoTDeviceType = "nfc" | "rfid" | "ble" | "qr" | "optical";
export type IoTDeviceStatus = "active" | "inactive" | "lost" | "damaged";

export interface IoTSensorReading {
  timestamp: string;
  temperature?: number;
  humidity?: number;
  shock?: boolean;
  location?: { lat: number; lng: number };
  batteryLevel?: number;
  customData?: Record<string, unknown>;
}

export const iotDevices = pgTable("iot_devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id).notNull(),
  deviceType: text("device_type").$type<IoTDeviceType>().notNull(),
  deviceId: text("device_id").notNull().unique(),
  manufacturer: text("manufacturer"),
  model: text("model"),
  firmwareVersion: text("firmware_version"),
  status: text("status").$type<IoTDeviceStatus>().default("active").notNull(),
  lastReading: jsonb("last_reading").$type<IoTSensorReading>(),
  lastSeenAt: timestamp("last_seen_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertIoTDeviceSchema = createInsertSchema(iotDevices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastSeenAt: true,
});

export type InsertIoTDevice = z.infer<typeof insertIoTDeviceSchema>;
export type IoTDevice = typeof iotDevices.$inferSelect;

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
// MODULAR DPP - REGIONAL EXTENSIONS
// ============================================

export type RegionCode = "EU" | "CN" | "US" | "IN" | "UK" | "JP" | "KR" | "ASEAN" | "OTHER";

export interface EUExtensionData {
  espr: {
    productCategory: string;
    complianceStatus: "compliant" | "pending" | "non_compliant";
    dppVersion: string;
    validFrom?: string;
    validUntil?: string;
  };
  batteryRegulation?: {
    batteryType: "ev" | "industrial" | "portable" | "light_means_of_transport";
    stateOfHealth?: number;
    carbonFootprintClass?: string;
    cobaltSourcingDueDiligence?: boolean;
    recycledContentCobalt?: number;
    recycledContentLithium?: number;
    recycledContentNickel?: number;
  };
  reach?: {
    scipId?: string;
    svhcPresent: boolean;
    svhcSubstances?: string[];
  };
  ceMarking: boolean;
  eprRegistrationId?: string;
  repairabilityIndex?: number;
}

export interface ChinaExtensionData {
  ccc: {
    certificateNumber?: string;
    required: boolean;
    validUntil?: string;
    certificationBody?: string;
  };
  gbStandards: {
    applicableStandards: string[];
    complianceStatus: "compliant" | "pending" | "non_compliant";
  };
  dualCarbon?: {
    carbonIntensity?: number;
    carbonQuotaStatus?: string;
    greenProductCertified?: boolean;
  };
  chinaRoHS?: {
    compliant: boolean;
    restrictedSubstances?: string[];
    exemptions?: string[];
  };
  recyclerRegistration?: {
    registeredRecyclers: string[];
    collectionNetwork?: string;
  };
}

export interface USExtensionData {
  ftc: {
    madeInUSAClaim: boolean;
    greenGuidesCompliant: boolean;
    substantiationDocuments?: string[];
  };
  stateEPR: {
    registeredStates: string[];
    eprProgramIds: Record<string, string>;
  };
  secClimate?: {
    scope3Included: boolean;
    climateDisclosureStatus?: string;
  };
  californiaCompliance?: {
    prop65Warning: boolean;
    prop65Chemicals?: string[];
    sbCompliance?: string[];
  };
}

export interface IndiaExtensionData {
  bis: {
    registrationNumber?: string;
    required: boolean;
    productCategory?: string;
    validUntil?: string;
  };
  eWasteRules?: {
    categoryCode?: string;
    proMembership?: string;
    collectionTargetPercent?: number;
  };
  epr: {
    registrationNumber?: string;
    obligationType?: string;
    targetYear?: number;
  };
  madeInIndia?: {
    localContentPercent?: number;
    manufacturingLocation?: string;
  };
}

export interface RegionalExtensionPayload {
  EU?: EUExtensionData;
  CN?: ChinaExtensionData;
  US?: USExtensionData;
  IN?: IndiaExtensionData;
  OTHER?: Record<string, unknown>;
}

export const dppRegionalExtensions = pgTable("dpp_regional_extensions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id).notNull(),
  regionCode: text("region_code").$type<RegionCode>().notNull(),
  schemaVersion: text("schema_version").default("1.0").notNull(),
  complianceStatus: text("compliance_status").$type<"compliant" | "pending" | "non_compliant" | "not_applicable">().default("pending").notNull(),
  payload: jsonb("payload").$type<RegionalExtensionPayload>().default({}).notNull(),
  validatedAt: timestamp("validated_at"),
  validatedBy: varchar("validated_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertDppRegionalExtensionSchema = createInsertSchema(dppRegionalExtensions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDppRegionalExtension = z.infer<typeof insertDppRegionalExtensionSchema>;
export type DppRegionalExtension = typeof dppRegionalExtensions.$inferSelect;

// Zod schemas for regional extension validation
export const euExtensionSchema = z.object({
  espr: z.object({
    productCategory: z.string(),
    complianceStatus: z.enum(["compliant", "pending", "non_compliant"]),
    dppVersion: z.string(),
    validFrom: z.string().optional(),
    validUntil: z.string().optional(),
  }),
  batteryRegulation: z.object({
    batteryType: z.enum(["ev", "industrial", "portable", "light_means_of_transport"]),
    stateOfHealth: z.number().optional(),
    carbonFootprintClass: z.string().optional(),
    cobaltSourcingDueDiligence: z.boolean().optional(),
    recycledContentCobalt: z.number().optional(),
    recycledContentLithium: z.number().optional(),
    recycledContentNickel: z.number().optional(),
  }).optional(),
  reach: z.object({
    scipId: z.string().optional(),
    svhcPresent: z.boolean(),
    svhcSubstances: z.array(z.string()).optional(),
  }).optional(),
  ceMarking: z.boolean(),
  eprRegistrationId: z.string().optional(),
  repairabilityIndex: z.number().optional(),
});

export const chinaExtensionSchema = z.object({
  ccc: z.object({
    certificateNumber: z.string().optional(),
    required: z.boolean(),
    validUntil: z.string().optional(),
    certificationBody: z.string().optional(),
  }),
  gbStandards: z.object({
    applicableStandards: z.array(z.string()),
    complianceStatus: z.enum(["compliant", "pending", "non_compliant"]),
  }),
  dualCarbon: z.object({
    carbonIntensity: z.number().optional(),
    carbonQuotaStatus: z.string().optional(),
    greenProductCertified: z.boolean().optional(),
  }).optional(),
  chinaRoHS: z.object({
    compliant: z.boolean(),
    restrictedSubstances: z.array(z.string()).optional(),
    exemptions: z.array(z.string()).optional(),
  }).optional(),
  recyclerRegistration: z.object({
    registeredRecyclers: z.array(z.string()),
    collectionNetwork: z.string().optional(),
  }).optional(),
});

export const usExtensionSchema = z.object({
  ftc: z.object({
    madeInUSAClaim: z.boolean(),
    greenGuidesCompliant: z.boolean(),
    substantiationDocuments: z.array(z.string()).optional(),
  }),
  stateEPR: z.object({
    registeredStates: z.array(z.string()),
    eprProgramIds: z.record(z.string()),
  }),
  secClimate: z.object({
    scope3Included: z.boolean(),
    climateDisclosureStatus: z.string().optional(),
  }).optional(),
  californiaCompliance: z.object({
    prop65Warning: z.boolean(),
    prop65Chemicals: z.array(z.string()).optional(),
    sbCompliance: z.array(z.string()).optional(),
  }).optional(),
});

export const indiaExtensionSchema = z.object({
  bis: z.object({
    registrationNumber: z.string().optional(),
    required: z.boolean(),
    productCategory: z.string().optional(),
    validUntil: z.string().optional(),
  }),
  eWasteRules: z.object({
    categoryCode: z.string().optional(),
    proMembership: z.string().optional(),
    collectionTargetPercent: z.number().optional(),
  }).optional(),
  epr: z.object({
    registrationNumber: z.string().optional(),
    obligationType: z.string().optional(),
    targetYear: z.number().optional(),
  }),
  madeInIndia: z.object({
    localContentPercent: z.number().optional(),
    manufacturingLocation: z.string().optional(),
  }).optional(),
});

// ============================================
// ENHANCED AI INSIGHTS (with cache invalidation)
// ============================================

export const dppAiInsights = pgTable("dpp_ai_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id).notNull(),
  insightType: text("insight_type").$type<AIInsightType>().notNull(),
  content: jsonb("content").$type<Record<string, unknown>>().notNull(),
  confidence: integer("confidence"),
  modelVersion: text("model_version"),
  modelName: text("model_name"),
  inputHash: text("input_hash"),
  sourceSnapshot: jsonb("source_snapshot").$type<Record<string, unknown>>(),
  promptTokens: integer("prompt_tokens"),
  completionTokens: integer("completion_tokens"),
  isStale: boolean("is_stale").default(false).notNull(),
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  expiresAt: timestamp("expires_at"),
});

export const insertDppAiInsightSchema = createInsertSchema(dppAiInsights).omit({
  id: true,
  createdAt: true,
  version: true,
});

export type InsertDppAiInsight = z.infer<typeof insertDppAiInsightSchema>;
export type DppAiInsight = typeof dppAiInsights.$inferSelect;

// ============================================
// DPP MODULE SUMMARY (Unified view helper types)
// ============================================

export interface DppModuleSummary {
  coreIdentity: {
    id: string;
    productName: string;
    manufacturer: string;
    countryOfOrigin?: string;
    batchNumber: string;
    lotNumber?: string;
  };
  productInfo: {
    category?: string;
    modelNumber?: string;
    sku?: string;
    manufacturerAddress?: string;
  };
  materials: {
    description: string;
    breakdown: MaterialBreakdown[];
    hazardousMaterials?: string;
  };
  sustainability: {
    carbonFootprint: number;
    waterUsage?: number;
    energyConsumption?: number;
    recycledContentPercent?: number;
    recyclabilityPercent?: number;
    environmentalCertifications: string[];
  };
  durability: {
    repairabilityScore: number;
    expectedLifespanYears?: number;
    sparePartsAvailable?: boolean;
    warrantyInfo: string;
    serviceCenters: ServiceCenter[];
  };
  lifecycle: {
    dateOfManufacture?: Date;
    dateOfFirstSale?: Date;
    ownershipHistory: OwnershipEntry[];
  };
  endOfLife: {
    recyclingInstructions: string;
    disassemblyInstructions?: string;
    hazardWarnings?: string;
    takeBackPrograms: string[];
  };
  compliance: {
    ceMarking?: boolean;
    safetyCertifications: string[];
  };
  aiInsights: {
    summary?: AISummary;
    sustainability?: SustainabilityInsight;
    repair?: RepairSummary;
    circularity?: CircularityScore;
    riskAssessment?: RiskAssessment;
  };
  regionalExtensions: {
    EU?: EUExtensionData;
    CN?: ChinaExtensionData;
    US?: USExtensionData;
    IN?: IndiaExtensionData;
  };
}

// ============================================
// ENTERPRISE INTEGRATIONS
// ============================================

export type ConnectorType = "sap" | "oracle" | "microsoft_dynamics" | "siemens" | "infor" | "custom";
export type ConnectorStatus = "active" | "inactive" | "error" | "pending";
export type SyncDirection = "inbound" | "outbound" | "bidirectional";

export interface SAPConfig {
  systemType: "S4HANA" | "ECC" | "Business_One";
  hostname: string;
  port: number;
  client: string;
  systemId: string;
  apiType: "OData" | "RFC" | "IDoc";
  oauthEnabled: boolean;
  syncFrequency: "realtime" | "hourly" | "daily" | "manual";
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
}

export const enterpriseConnectors = pgTable("enterprise_connectors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  connectorType: text("connector_type").$type<ConnectorType>().notNull(),
  status: text("status").$type<ConnectorStatus>().default("inactive").notNull(),
  syncDirection: text("sync_direction").$type<SyncDirection>().default("inbound").notNull(),
  config: jsonb("config").$type<SAPConfig | Record<string, unknown>>().default({}).notNull(),
  fieldMappings: jsonb("field_mappings").$type<FieldMapping[]>().default([]),
  lastSyncAt: timestamp("last_sync_at"),
  lastSyncStatus: text("last_sync_status"),
  productsSynced: integer("products_synced").default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertEnterpriseConnectorSchema = createInsertSchema(enterpriseConnectors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastSyncAt: true,
  lastSyncStatus: true,
  productsSynced: true,
});

export type InsertEnterpriseConnector = z.infer<typeof insertEnterpriseConnectorSchema>;
export type EnterpriseConnector = typeof enterpriseConnectors.$inferSelect;

export const integrationSyncLogs = pgTable("integration_sync_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  connectorId: varchar("connector_id").references(() => enterpriseConnectors.id).notNull(),
  syncType: text("sync_type").$type<"full" | "delta" | "manual">().notNull(),
  status: text("status").$type<"running" | "completed" | "failed">().notNull(),
  recordsProcessed: integer("records_processed").default(0),
  recordsCreated: integer("records_created").default(0),
  recordsUpdated: integer("records_updated").default(0),
  recordsFailed: integer("records_failed").default(0),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertIntegrationSyncLogSchema = createInsertSchema(integrationSyncLogs).omit({
  id: true,
  completedAt: true,
});

export type InsertIntegrationSyncLog = z.infer<typeof insertIntegrationSyncLogSchema>;
export type IntegrationSyncLog = typeof integrationSyncLogs.$inferSelect;

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

export interface CircularityScore {
  score: number;
  grade: string;
  recyclabilityAnalysis: string;
  materialEfficiency: string;
  endOfLifeOptions: string[];
  recommendations: string[];
}

export interface RiskAssessment {
  overallRisk: "Low" | "Medium" | "High";
  riskFlags: Array<{
    type: string;
    severity: "Low" | "Medium" | "High";
    description: string;
  }>;
  dataCompleteness: number;
  counterfeitRisk: string;
  complianceIssues: string[];
  recommendations: string[];
}

// ============================================
// LEADS & CRM (Market Validation)
// ============================================

export type LeadStatus = "new" | "contacted" | "demo_scheduled" | "qualified" | "won" | "lost";
export type LeadSource = "pricing_page" | "contact_form" | "demo_request" | "waitlist" | "referral" | "other";
export type TierInterest = "poc" | "starter" | "growth" | "enterprise";

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Contact Info
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  jobTitle: text("job_title"),
  
  // Lead Qualification
  tierInterest: text("tier_interest").$type<TierInterest>().default("poc").notNull(),
  estimatedVolume: text("estimated_volume"),
  message: text("message"),
  
  // Pipeline Tracking
  status: text("status").$type<LeadStatus>().default("new").notNull(),
  source: text("source").$type<LeadSource>().default("contact_form").notNull(),
  
  // Follow-up
  notes: text("notes"),
  nextFollowUp: timestamp("next_follow_up"),
  assignedTo: varchar("assigned_to"),
  
  // Timestamps
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  convertedAt: timestamp("converted_at"),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  convertedAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// Lead Activity Log (for tracking interactions)
export type LeadActivityType = "email_sent" | "call_made" | "demo_booked" | "note_added" | "status_changed" | "tier_changed";

export const leadActivities = pgTable("lead_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => leads.id).notNull(),
  activityType: text("activity_type").$type<LeadActivityType>().notNull(),
  description: text("description"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertLeadActivitySchema = createInsertSchema(leadActivities).omit({
  id: true,
  createdAt: true,
});

export type InsertLeadActivity = z.infer<typeof insertLeadActivitySchema>;
export type LeadActivity = typeof leadActivities.$inferSelect;

// ============================================
// PARTNERS (Sales Partners & Demo Access)
// ============================================

export type PartnerRole = "sales_partner" | "reseller" | "consultant" | "demo_viewer";
export type PartnerStatus = "active" | "inactive" | "pending";

export const partners = pgTable("partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  company: text("company"),
  role: text("role").$type<PartnerRole>().default("demo_viewer").notNull(),
  status: text("status").$type<PartnerStatus>().default("active").notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
  passwordHash: true,
}).extend({
  password: z.string().min(6),
});

export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;

// ============================================
// DEMO CONFIGURATIONS (Custom demos for clients)
// ============================================

export const demoConfigs = pgTable("demo_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  prompt: text("prompt").notNull(),
  generatedProducts: jsonb("generated_products").$type<Record<string, unknown>[]>().default([]),
  createdBy: varchar("created_by"),
  status: text("status").$type<"generating" | "ready" | "failed">().default("generating").notNull(),
  demoEmail: text("demo_email"),
  demoPassword: text("demo_password"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertDemoConfigSchema = createInsertSchema(demoConfigs).omit({
  id: true,
  createdAt: true,
  generatedProducts: true,
  status: true,
});

export type InsertDemoConfig = z.infer<typeof insertDemoConfigSchema>;
export type DemoConfig = typeof demoConfigs.$inferSelect;

// ============================================
// INTERNAL CRM - CUSTOMER ACCOUNTS
// ============================================

export type AccountStatus = "prospect" | "active" | "churning" | "churned" | "paused";
export type AccountTier = "poc" | "starter" | "growth" | "enterprise";

export const customerAccounts = pgTable("customer_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  industry: text("industry"),
  tier: text("tier").$type<AccountTier>().default("poc").notNull(),
  status: text("status").$type<AccountStatus>().default("prospect").notNull(),
  healthScore: integer("health_score").default(50),
  productCount: integer("product_count").default(0),
  lastActivityAt: timestamp("last_activity_at"),
  contractStartDate: timestamp("contract_start_date"),
  contractEndDate: timestamp("contract_end_date"),
  mrr: integer("mrr").default(0),
  notes: text("notes"),
  leadId: varchar("lead_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertCustomerAccountSchema = createInsertSchema(customerAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCustomerAccount = z.infer<typeof insertCustomerAccountSchema>;
export type CustomerAccount = typeof customerAccounts.$inferSelect;

// ============================================
// ACCOUNT ACTIVITIES
// ============================================

export type AccountActivityType = "login" | "product_created" | "scan" | "api_call" | "support_ticket" | "demo_viewed" | "integration_sync" | "export" | "note_added";

export const accountActivities = pgTable("account_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").references(() => customerAccounts.id).notNull(),
  activityType: text("activity_type").$type<AccountActivityType>().notNull(),
  description: text("description"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertAccountActivitySchema = createInsertSchema(accountActivities).omit({
  id: true,
  createdAt: true,
});

export type InsertAccountActivity = z.infer<typeof insertAccountActivitySchema>;
export type AccountActivity = typeof accountActivities.$inferSelect;

// ============================================
// AI NEXT BEST ACTIONS
// ============================================

export type ActionPriority = "low" | "medium" | "high" | "critical";
export type ActionStatus = "pending" | "completed" | "dismissed" | "snoozed";

export const nextBestActions = pgTable("next_best_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").references(() => customerAccounts.id).notNull(),
  action: text("action").notNull(),
  reasoning: text("reasoning").notNull(),
  priority: text("priority").$type<ActionPriority>().default("medium").notNull(),
  status: text("status").$type<ActionStatus>().default("pending").notNull(),
  category: text("category"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertNextBestActionSchema = createInsertSchema(nextBestActions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertNextBestAction = z.infer<typeof insertNextBestActionSchema>;
export type NextBestAction = typeof nextBestActions.$inferSelect;

// ============================================
// DEMO FACTORY - DEMO INSTANCES
// ============================================

export type DemoInstanceStatus = "provisioning" | "active" | "expired" | "deactivated";

export const demoInstances = pgTable("demo_instances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  prospectName: text("prospect_name").notNull(),
  prospectEmail: text("prospect_email"),
  prospectCompany: text("prospect_company"),
  industry: text("industry").notNull(),
  personaTemplate: text("persona_template"),
  status: text("status").$type<DemoInstanceStatus>().default("provisioning").notNull(),
  productIds: jsonb("product_ids").$type<string[]>().default([]),
  iotDeviceIds: jsonb("iot_device_ids").$type<string[]>().default([]),
  demoUrl: text("demo_url"),
  expiresAt: timestamp("expires_at"),
  provisionedBy: varchar("provisioned_by"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertDemoInstanceSchema = createInsertSchema(demoInstances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  productIds: true,
  iotDeviceIds: true,
  demoUrl: true,
  status: true,
});

export type InsertDemoInstance = z.infer<typeof insertDemoInstanceSchema>;
export type DemoInstance = typeof demoInstances.$inferSelect;

// ============================================
// DEMO FACTORY - PERSONA TEMPLATES
// ============================================

export const personaTemplates = pgTable("persona_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  description: text("description"),
  sampleProducts: jsonb("sample_products").$type<Record<string, unknown>[]>().default([]),
  iotConfig: jsonb("iot_config").$type<Record<string, unknown>>().default({}),
  productCount: integer("product_count").default(3),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPersonaTemplateSchema = createInsertSchema(personaTemplates).omit({
  id: true,
  createdAt: true,
});

export type InsertPersonaTemplate = z.infer<typeof insertPersonaTemplateSchema>;
export type PersonaTemplate = typeof personaTemplates.$inferSelect;

// ============================================
// SUPPORT TICKETS
// ============================================

export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketStatus = "open" | "in_progress" | "waiting_on_customer" | "resolved" | "closed";
export type TicketCategory = "billing" | "technical" | "integration" | "compliance" | "feature_request" | "general";

export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id"),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  submitterEmail: text("submitter_email").notNull(),
  submitterName: text("submitter_name"),
  priority: text("priority").$type<TicketPriority>().default("medium").notNull(),
  status: text("status").$type<TicketStatus>().default("open").notNull(),
  category: text("category").$type<TicketCategory>().default("general").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  aiSummary: text("ai_summary"),
  aiSuggestedPriority: text("ai_suggested_priority").$type<TicketPriority>(),
  aiSuggestedCategory: text("ai_suggested_category").$type<TicketCategory>(),
  aiSuggestedTags: jsonb("ai_suggested_tags").$type<string[]>().default([]),
  assignedTo: varchar("assigned_to"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
  aiSummary: true,
  aiSuggestedPriority: true,
  aiSuggestedCategory: true,
  aiSuggestedTags: true,
});

export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

// ============================================
// PLATFORM METRICS (Ops Monitoring)
// ============================================

export const platformMetrics = pgTable("platform_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metricType: text("metric_type").notNull(),
  value: integer("value").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  recordedAt: timestamp("recorded_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});
