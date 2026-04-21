/**
 * Zod schemas for CRM AI output validation.
 *
 * Same pattern as server/services/ai-eval-harness.ts applies to DPP enrichment —
 * but for the internal CRM AI endpoints (health score, next-best-action).
 *
 * Async background jobs (demo provisioning, ticket triage) must use the same
 * safeParseJSON → validate* pattern — never raw JSON.parse on model output.
 */

import { z } from "zod";

// ─── Health scoring ────────────────────────────────────────────────────────

export const HealthScoreFactorSchema = z.object({
  name: z.string().min(1).max(200),
  impact: z.enum(["positive", "negative", "neutral"]),
  detail: z.string().max(1000),
});

export const HealthScoreOutputSchema = z.object({
  healthScore: z.number().min(0).max(100),
  trend: z.enum(["improving", "stable", "declining"]),
  factors: z.array(HealthScoreFactorSchema).max(20),
  riskLevel: z.enum(["low", "medium", "high"]),
});

export type HealthScoreOutput = z.infer<typeof HealthScoreOutputSchema>;

export function validateHealthScore(
  raw: unknown
): { success: true; data: HealthScoreOutput } | { success: false; error: string } {
  const parsed = HealthScoreOutputSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
  }
  return { success: true, data: parsed.data };
}

// ─── Next best actions ─────────────────────────────────────────────────────

export const NextBestActionSchema = z.object({
  action: z.string().min(1).max(500),
  reasoning: z.string().min(1).max(2000),
  priority: z.enum(["low", "medium", "high", "critical"]),
  category: z.string().min(1).max(100),
});

export const NextBestActionsOutputSchema = z.object({
  actions: z.array(NextBestActionSchema).min(1).max(10),
});

export type NextBestActionsOutput = z.infer<typeof NextBestActionsOutputSchema>;

export function validateNextBestActions(
  raw: unknown
): { success: true; data: NextBestActionsOutput } | { success: false; error: string } {
  const parsed = NextBestActionsOutputSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
  }
  return { success: true, data: parsed.data };
}

// ─── Safe JSON.parse wrapper ───────────────────────────────────────────────

export function safeParseJSON(raw: string): { success: true; data: unknown } | { success: false; error: string } {
  try {
    return { success: true, data: JSON.parse(raw) };
  } catch (err) {
    return {
      success: false,
      error: `Invalid JSON from AI: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

// ─── Demo provisioning (async background job) ───────────────────────────────

/** One DPP-style product row from the demo AI generator. Bounds reject oversized payloads early. */
export const DemoProvisioningProductSchema = z.object({
  productName: z.coerce.string().trim().min(1).max(500),
  productCategory: z.coerce.string().trim().max(200),
  modelNumber: z.coerce.string().max(200),
  sku: z.coerce.string().max(200),
  manufacturer: z.coerce.string().trim().min(1).max(300),
  countryOfOrigin: z.coerce.string().trim().max(120),
  batchNumber: z.coerce.string().trim().max(200),
  materials: z.coerce.string().trim().min(1).max(8000),
  carbonFootprint: z.coerce.number().finite(),
  repairabilityScore: z.coerce.number().int().min(1).max(10),
  warrantyInfo: z.coerce.string().trim().max(2000),
  recyclingInstructions: z.coerce.string().trim().max(4000),
  recycledContentPercent: z.coerce.number().min(0).max(100).optional(),
  recyclabilityPercent: z.coerce.number().min(0).max(100).optional(),
});

export const DemoProvisioningOutputSchema = z.object({
  /** Capped for performance / DoS safety; handler may only materialize a subset. */
  products: z.array(DemoProvisioningProductSchema).min(1).max(10),
});

export type DemoProvisioningOutput = z.infer<typeof DemoProvisioningOutputSchema>;

export function validateDemoProvisioningOutput(
  raw: unknown
): { success: true; data: DemoProvisioningOutput } | { success: false; error: string } {
  const parsed = DemoProvisioningOutputSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
  }
  return { success: true, data: parsed.data };
}

// ─── Support ticket triage (async background job) ───────────────────────────

export const TicketTriageOutputSchema = z.object({
  summary: z.coerce.string().trim().min(1).max(4000),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  category: z.enum(["billing", "technical", "integration", "compliance", "feature_request", "general"]),
  tags: z.array(z.coerce.string().trim().max(80)).max(40).default([]),
});

export type TicketTriageOutput = z.infer<typeof TicketTriageOutputSchema>;

export function validateTicketTriageOutput(
  raw: unknown
): { success: true; data: TicketTriageOutput } | { success: false; error: string } {
  const parsed = TicketTriageOutputSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
  }
  return { success: true, data: parsed.data };
}
