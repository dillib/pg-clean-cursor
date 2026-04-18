/**
 * AI eval runner — calls the live AI endpoint against the golden test suite.
 * Run: npm run eval:ai
 * Exit code 1 if accuracy < MIN_EVAL_ACCURACY (blocks CI).
 */
import { aiClient, AI_CHAT_MODEL, describeAIProvider } from "../services/ai-client";
import {
  GOLDEN_CASES,
  MIN_EVAL_ACCURACY,
  runGoldenEval,
  validateAIOutput,
  enforceConfidenceThresholds,
  type AIRowResult,
} from "../services/ai-eval-harness";

console.log(`[eval] AI provider: ${describeAIProvider()}`);

async function analyzeRow(input: typeof GOLDEN_CASES[number]["input"]): Promise<AIRowResult | null> {
  const systemPrompt = `You are a Digital Product Passport (DPP) data specialist for EU ESPR Regulation 2024/1781.
Analyze product records and suggest values for missing fields. Base suggestions on product name, manufacturer, and category.

Rules:
- ONLY suggest values for fields listed as missing.
- carbonFootprint: integer kg CO2 equivalent over product lifecycle.
- repairabilityScore: integer 1–10 (10 = very easy to repair).
- materials: concise list of primary materials, e.g. "Stainless steel 316L, polypropylene seals".
- Confidence: 0.0–1.0 number.

Return ONLY this JSON — no markdown, no explanation. Strict shape:
- suggestions is an object keyed by field name; each entry MUST be { "value": string|number, "reason": string, "confidence": number between 0 and 1 }.
- flags is an array; each flag MUST be { "field": string, "message": string, "severity": "info" | "warning" | "error" }. Do not invent other severity values.
- "value" is a primitive (string or number). Never an object, array, or null.

{
  "rows": [
    {
      "rowIndex": 0,
      "suggestions": {
        "materials": { "value": "Stainless steel 316L, polypropylene seals", "reason": "Typical industrial pump build", "confidence": 0.85 }
      },
      "flags": []
    }
  ]
}`;

  const userPrompt = `Analyze this product record. Suggest values ONLY for its missing fields:

${JSON.stringify({
    rowIndex: 0,
    existingData: {
      productName: input.productName,
      manufacturer: input.manufacturer,
      productCategory: input.productCategory,
    },
    missingRequired: input.missingRequired,
  }, null, 2)}`;

  const response = await aiClient.chat.completions.create({
    model: AI_CHAT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const raw = JSON.parse(response.choices[0]?.message?.content ?? "{}");
  const validated = validateAIOutput(raw);
  if (!validated.success) {
    console.error("Schema validation failed:", validated.error);
    return null;
  }
  return validated.data.rows[0] ?? null;
}

async function main() {
  console.log(`\n🧪 Running AI eval against ${GOLDEN_CASES.length} golden test cases...\n`);

  const result = await runGoldenEval(analyzeRow);

  for (const d of result.details) {
    const icon = d.passed ? "✅" : "❌";
    console.log(`${icon} ${d.description}`);
    if (!d.passed && d.reason) console.log(`   → ${d.reason}`);
  }

  console.log(`\nAccuracy: ${result.passed}/${result.totalCases} (${(result.accuracy * 100).toFixed(0)}%)`);
  console.log(`Threshold: ${(MIN_EVAL_ACCURACY * 100).toFixed(0)}%`);

  if (result.accuracy < MIN_EVAL_ACCURACY) {
    console.error(`\n❌ Eval FAILED — accuracy ${(result.accuracy * 100).toFixed(0)}% < ${(MIN_EVAL_ACCURACY * 100).toFixed(0)}% minimum`);
    process.exit(1);
  }

  console.log(`\n✅ Eval PASSED`);
  process.exit(0);
}

main().catch(err => {
  console.error("Eval runner error:", err);
  process.exit(1);
});
