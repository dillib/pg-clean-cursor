/**
 * Zod schemas for CRM AI output validation.
 *
 * Same pattern as server/services/ai-eval-harness.ts applies to DPP enrichment —
 * but for the internal CRM AI endpoints (health score, next-best-action).
 *
 * Every JSON.parse(aiResult) call in server/routes/internal-routes.ts should go
 * through validateHealthScore / validateNextBestActions instead.
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
