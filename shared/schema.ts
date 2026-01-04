import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Product schema for Digital Product Passports
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productName: text("product_name").notNull(),
  manufacturer: text("manufacturer").notNull(),
  batchNumber: text("batch_number").notNull(),
  materials: text("materials").notNull(),
  carbonFootprint: integer("carbon_footprint").notNull(), // kg CO2e
  repairabilityScore: integer("repairability_score").notNull(), // 1-10
  warrantyInfo: text("warranty_info").notNull(),
  ownershipHistory: jsonb("ownership_history").$type<OwnershipEntry[]>().default([]),
  recyclingInstructions: text("recycling_instructions").notNull(),
  productImage: text("product_image"), // URL or base64
  qrCodeData: text("qr_code_data"), // QR code as data URL
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export interface OwnershipEntry {
  owner: string;
  date: string;
  action: string;
}

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  qrCodeData: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// AI Response types
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
