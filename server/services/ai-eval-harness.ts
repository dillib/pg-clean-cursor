/**
 * AI Eval Harness — enforces output quality for bulk DPP enrichment.
 *
 * Three concerns:
 *
 * 1. OUTPUT SCHEMA VALIDATION
 *    Every AI response is validated against a strict Zod schema before
 *    any field reaches the database. Malformed or unexpected AI output
 *    is rejected — not silently coerced.
 *
 * 2. CONFIDENCE THRESHOLDS
 *    Regulated DPP fields (materials, carbonFootprint, etc.) have a minimum
 *    server-side confidence requirement. The client can raise the bar but
 *    cannot lower it. Low-confidence suggestions are returned to the user
 *    for manual review rather than being auto-accepted.
 *
 * 3. GOLDEN TEST SUITE
 *    A fixed set of known product inputs → expected output mappings.
 *    Run `npx tsx server/services/ai-eval-harness.ts` to evaluate the
 *    current model. If accuracy drops below MIN_ACCURACY, CI fails.
 *
 * 4. PROVENANCE TAGGING
 *    Every field that comes from AI is tagged with source="ai_accepted"
 *    plus the run's confidence score. Human overrides are tagged "human".
 */

import { z } from "zod";
import type { FieldProvenanceMap } from "@shared/schema";

// ─── 1. Strict AI output schema ───────────────────────────────────────────────

const AISuggestionSchema = z.object({
  value: z.union([z.string(), z.number()]),
  reason: z.string().max(500),
  confidence: z.number().min(0).max(1),
});

const AIFlagSchema = z.object({
  field: z.string(),
  message: z.string().max(500),
  severity: z.enum(["info", "warning", "error"]).default("warning"),
});

const AIRowResultSchema = z.object({
  rowIndex: z.number().int().min(0),
  suggestions: z.record(z.string(), AISuggestionSchema).default({}),
  flags: z.array(AIFlagSchema).default([]),
});

export const AIEnrichmentResponseSchema = z.object({
  rows: z.array(AIRowResultSchema),
});

export type AIEnrichmentResponse = z.infer<typeof AIEnrichmentResponseSchema>;
export type AIRowResult = z.infer<typeof AIRowResultSchema>;
export type AISuggestion = z.infer<typeof AISuggestionSchema>;

// ─── 2. Per-field confidence thresholds ───────────────────────────────────────
// Regulated fields require higher confidence before auto-accept.
// The frontend may show a higher bar, but this is the server floor.

export const FIELD_CONFIDENCE_THRESHOLDS: Record<string, number> = {
  // Regulated — require high confidence
  carbonFootprint:        0.80,
  materials:              0.80,
  recyclingInstructions:  0.75,
  repairabilityScore:     0.75,
  warrantyInfo:           0.70,
  // Optional enrichment — more lenient
  productCategory:        0.60,
  countryOfOrigin:        0.65,
  description:            0.60,
};

const SERVER_MIN_CONFIDENCE = 0.60; // Floor for any field regardless of type

/**
 * Validates raw AI JSON output against the schema.
 * Returns { success: true, data } or { success: false, error }.
 */
export function validateAIOutput(raw: unknown):
  | { success: true; data: AIEnrichmentResponse }
  | { success: false; error: string }
{
  const result = AIEnrichmentResponseSchema.safeParse(raw);
  if (result.success) return { success: true, data: result.data };
  return {
    success: false,
    error: `AI output schema validation failed: ${result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
  };
}

/**
 * Filters suggestions to only those meeting the confidence threshold.
 * Suggestions below the threshold are moved to flags for human review.
 */
export function enforceConfidenceThresholds(row: AIRowResult): {
  acceptedSuggestions: Record<string, AISuggestion>;
  rejectedFields: Array<{ field: string; confidence: number; threshold: number; value: AISuggestion["value"] }>;
} {
  const acceptedSuggestions: Record<string, AISuggestion> = {};
  const rejectedFields: Array<{ field: string; confidence: number; threshold: number; value: AISuggestion["value"] }> = [];

  for (const [field, suggestion] of Object.entries(row.suggestions)) {
    const threshold = FIELD_CONFIDENCE_THRESHOLDS[field] ?? SERVER_MIN_CONFIDENCE;
    if (suggestion.confidence >= threshold) {
      acceptedSuggestions[field] = suggestion;
    } else {
      rejectedFields.push({
        field,
        confidence: suggestion.confidence,
        threshold,
        value: suggestion.value,
      });
    }
  }

  return { acceptedSuggestions, rejectedFields };
}

/**
 * Builds a FieldProvenanceMap entry for each AI-accepted field.
 * Call this when writing confirmed AI suggestions to the product record.
 */
export function buildAIProvenanceEntries(
  acceptedSuggestions: Record<string, AISuggestion>,
  runId: string,
): FieldProvenanceMap {
  const now = new Date().toISOString();
  const provenance: FieldProvenanceMap = {};
  for (const [field, suggestion] of Object.entries(acceptedSuggestions)) {
    provenance[field] = {
      source: "ai_accepted",
      at: now,
      by: `ai-run:${runId}`,
      confidence: suggestion.confidence,
    };
  }
  return provenance;
}

/**
 * Builds provenance entries for human-provided fields.
 */
export function buildHumanProvenanceEntries(
  fields: string[],
  userId?: string,
): FieldProvenanceMap {
  const now = new Date().toISOString();
  const provenance: FieldProvenanceMap = {};
  for (const field of fields) {
    provenance[field] = { source: "human", at: now, by: userId };
  }
  return provenance;
}

// ─── 3. Golden test suite ─────────────────────────────────────────────────────

interface GoldenCase {
  input: {
    productName: string;
    manufacturer?: string;
    productCategory?: string;
    missingRequired: string[];
  };
  expected: {
    // Approximate expected values — compared with fuzzy matching
    materials?: { containsAny: string[] };
    carbonFootprint?: { min: number; max: number };
    repairabilityScore?: { min: number; max: number };
  };
  description: string;
}

export const GOLDEN_CASES: GoldenCase[] = [
  {
    description: "Industrial pump — should suggest steel/polymer materials and mid repairability",
    input: {
      productName: "Centrifugal Pump CPM-150",
      manufacturer: "Grundfos",
      productCategory: "Industrial Equipment",
      missingRequired: ["materials", "carbonFootprint", "repairabilityScore"],
    },
    expected: {
      materials: { containsAny: ["steel", "cast iron", "polymer", "stainless", "bronze"] },
      carbonFootprint: { min: 50, max: 2000 },
      repairabilityScore: { min: 5, max: 9 },
    },
  },
  {
    description: "Consumer smartphone — should suggest mixed materials and low repairability",
    input: {
      productName: "Smartphone Pro X",
      manufacturer: "Generic Electronics",
      productCategory: "Consumer Electronics",
      missingRequired: ["materials", "carbonFootprint", "repairabilityScore"],
    },
    expected: {
      materials: { containsAny: ["glass", "aluminum", "lithium", "plastic", "cobalt"] },
      carbonFootprint: { min: 30, max: 150 },
      repairabilityScore: { min: 2, max: 7 },
    },
  },
  {
    description: "Textile product — should suggest fabric materials",
    input: {
      productName: "Organic Cotton T-Shirt",
      manufacturer: "EcoWear",
      productCategory: "Textiles",
      missingRequired: ["materials", "recyclingInstructions"],
    },
    expected: {
      materials: { containsAny: ["cotton", "organic", "natural fiber", "polyester"] },
    },
  },
];

export interface EvalResult {
  totalCases: number;
  passed: number;
  failed: number;
  accuracy: number;
  details: Array<{ description: string; passed: boolean; reason?: string }>;
}

/**
 * Runs the AI model against the golden test suite and reports accuracy.
 * Import and call from a CLI script for CI integration.
 *
 * @param analyzeRow - function that calls the actual AI enrichment endpoint
 */
export async function runGoldenEval(
  analyzeRow: (input: GoldenCase["input"]) => Promise<AIRowResult | null>
): Promise<EvalResult> {
  const details: EvalResult["details"] = [];

  for (const tc of GOLDEN_CASES) {
    try {
      const result = await analyzeRow(tc.input);
      if (!result) {
        details.push({ description: tc.description, passed: false, reason: "No result returned" });
        continue;
      }

      let passed = true;
      const reasons: string[] = [];

      // Check materials
      if (tc.expected.materials) {
        const materials = String(result.suggestions.materials?.value ?? "").toLowerCase();
        const found = tc.expected.materials.containsAny.some(m => materials.includes(m.toLowerCase()));
        if (!found) {
          passed = false;
          reasons.push(`materials "${materials}" did not contain any of: ${tc.expected.materials.containsAny.join(", ")}`);
        }
      }

      // Check carbonFootprint range
      if (tc.expected.carbonFootprint) {
        const val = Number(result.suggestions.carbonFootprint?.value);
        if (isNaN(val) || val < tc.expected.carbonFootprint.min || val > tc.expected.carbonFootprint.max) {
          passed = false;
          reasons.push(`carbonFootprint ${val} outside expected range [${tc.expected.carbonFootprint.min}, ${tc.expected.carbonFootprint.max}]`);
        }
      }

      // Check repairabilityScore range
      if (tc.expected.repairabilityScore) {
        const val = Number(result.suggestions.repairabilityScore?.value);
        if (isNaN(val) || val < tc.expected.repairabilityScore.min || val > tc.expected.repairabilityScore.max) {
          passed = false;
          reasons.push(`repairabilityScore ${val} outside expected range [${tc.expected.repairabilityScore.min}, ${tc.expected.repairabilityScore.max}]`);
        }
      }

      details.push({ description: tc.description, passed, reason: reasons.join("; ") || undefined });
    } catch (err) {
      details.push({ description: tc.description, passed: false, reason: String(err) });
    }
  }

  const passed = details.filter(d => d.passed).length;
  return {
    totalCases: GOLDEN_CASES.length,
    passed,
    failed: GOLDEN_CASES.length - passed,
    accuracy: GOLDEN_CASES.length > 0 ? passed / GOLDEN_CASES.length : 0,
    details,
  };
}

/** Minimum acceptable accuracy to pass CI. Lower and the AI is considered unreliable. */
export const MIN_EVAL_ACCURACY = 0.80;
