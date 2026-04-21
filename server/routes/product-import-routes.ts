import { Router, type Request, type Response } from "express";
import { randomUUID } from "crypto";
import multer from "multer";
import * as XLSX from "xlsx";
import { aiClient, AI_CHAT_MODEL } from "../services/ai-client";
import { storage } from "../storage";
import { tenantStorage } from "../storage-tenant";
import { qrService } from "../services/qr-service";
import { insertProductSchema } from "@shared/schema";
import {
  validateAIOutput,
  enforceConfidenceThresholds,
  buildAIProvenanceEntries,
  buildHumanProvenanceEntries,
} from "../services/ai-eval-harness";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// ─── Column name aliases → internal field names ───────────────────────────
const PRODUCT_COLUMN_MAP: Record<string, string> = {
  "product name": "productName", "productname": "productName", "name": "productName",
  "product": "productName", "produkt": "productName",
  "category": "productCategory", "product category": "productCategory",
  "productcategory": "productCategory", "type": "productCategory",
  "manufacturer": "manufacturer", "brand": "manufacturer", "vendor": "manufacturer",
  "hersteller": "manufacturer", "oem": "manufacturer",
  "model": "modelNumber", "model number": "modelNumber", "modelnumber": "modelNumber",
  "model no": "modelNumber", "part number": "modelNumber", "partnumber": "modelNumber",
  "sku": "sku", "article number": "sku", "article no": "sku", "artikelnummer": "sku",
  "batch": "batchNumber", "batch number": "batchNumber", "batchnumber": "batchNumber",
  "batch no": "batchNumber", "lot": "batchNumber", "charge": "batchNumber",
  "lot number": "lotNumber", "lotnumber": "lotNumber", "lot no": "lotNumber",
  "country": "countryOfOrigin", "country of origin": "countryOfOrigin",
  "origin": "countryOfOrigin", "herkunft": "countryOfOrigin",
  "materials": "materials", "material": "materials", "composition": "materials",
  "material composition": "materials", "werkstoffe": "materials",
  "carbon": "carbonFootprint", "carbon footprint": "carbonFootprint",
  "co2": "carbonFootprint", "co2 kg": "carbonFootprint", "carbonfootprint": "carbonFootprint",
  "repairability": "repairabilityScore", "repairability score": "repairabilityScore",
  "repair score": "repairabilityScore", "repairabilityscore": "repairabilityScore",
  "lifespan": "expectedLifespanYears", "expected lifespan": "expectedLifespanYears",
  "lifespan years": "expectedLifespanYears", "years": "expectedLifespanYears",
  "recycled content": "recycledContentPercent", "recycled %": "recycledContentPercent",
  "recycledcontent": "recycledContentPercent",
  "recyclability": "recyclabilityPercent", "recyclable %": "recyclabilityPercent",
  "warranty": "warrantyInfo", "warranty info": "warrantyInfo", "garantie": "warrantyInfo",
  "recycling": "recyclingInstructions", "recycling instructions": "recyclingInstructions",
  "disposal": "recyclingInstructions", "entsorgung": "recyclingInstructions",
  "description": "description", "beschreibung": "description",
  "business unit": "businessUnit", "businessunit": "businessUnit",
  "unit": "businessUnit", "division": "businessUnit", "department": "businessUnit",
  "abteilung": "businessUnit", "werk": "businessUnit", "site": "businessUnit",
  "water": "waterUsage", "water usage": "waterUsage", "water l": "waterUsage",
  "energy": "energyConsumption", "energy kwh": "energyConsumption",
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[_\-]/g, " ").replace(/\s+/g, " ");
}

function mapRow(row: Record<string, any>, mapping: Record<string, string>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [origCol, targetField] of Object.entries(mapping)) {
    const val = row[origCol];
    if (val !== undefined && val !== null && val !== "") {
      out[targetField] = val;
    }
  }
  return out;
}

function coerceProduct(data: Record<string, any>): Record<string, any> {
  const numericFields = [
    "carbonFootprint", "repairabilityScore", "expectedLifespanYears",
    "recycledContentPercent", "recyclabilityPercent", "waterUsage", "energyConsumption",
  ];
  for (const f of numericFields) {
    if (data[f] !== undefined) {
      const n = Number(data[f]);
      data[f] = isNaN(n) ? undefined : Math.round(n);
    }
  }
  if (!data.materials) data.materials = "See product documentation";
  if (!data.warrantyInfo) data.warrantyInfo = "Standard manufacturer warranty";
  if (!data.recyclingInstructions) data.recyclingInstructions = "Contact manufacturer for recycling guidance";
  if (!data.carbonFootprint) data.carbonFootprint = 0;
  if (!data.repairabilityScore) data.repairabilityScore = 5;
  if (!data.batchNumber) data.batchNumber = `IMPORT-${Date.now()}`;
  return data;
}

// ─── GET /api/products/import-template ───────────────────────────────────
router.get("/import-template", (_req: Request, res: Response) => {
  const headers = [
    "product_name", "category", "manufacturer", "model_number", "sku",
    "batch_number", "lot_number", "country_of_origin", "business_unit",
    "materials", "recycled_content_%", "recyclability_%",
    "carbon_footprint_kg_co2", "water_usage_L", "energy_kwh",
    "repairability_score_1_10", "lifespan_years",
    "warranty_info", "recycling_instructions", "description",
  ];
  const exampleRow = [
    "Industrial Pump X200", "Industrial Equipment", "Grundfos", "X200-A", "GRF-X200",
    "BATCH-2027-001", "LOT-A1", "Germany", "Fluid Systems BU",
    "Stainless steel, polypropylene", "15", "85",
    "320", "450", "180",
    "8", "15",
    "2 years parts and labour", "Disassemble and sort metals/plastics for recycling", "High-efficiency industrial pump",
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
  ws["!cols"] = headers.map(() => ({ wch: 22 }));
  XLSX.utils.book_append_sheet(wb, ws, "Products");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  res.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.set("Content-Disposition", `attachment; filename="photonictag-product-import-template.xlsx"`);
  res.send(buf);
});

// ─── POST /api/products/bulk-import ──────────────────────────────────────
// preview=true → returns mapping + first 5 rows + ALL mapped rows (for AI)
router.post("/bulk-import", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    if (rawRows.length === 0) return res.status(400).json({ error: "File is empty or has no data rows" });

    const headers = Object.keys(rawRows[0]);
    const mapping: Record<string, string> = {};
    for (const h of headers) {
      const norm = normalizeHeader(h);
      if (PRODUCT_COLUMN_MAP[norm]) mapping[h] = PRODUCT_COLUMN_MAP[norm];
    }

    // Preview mode — includes all mapped rows (up to 200) for AI analysis
    if (req.query.preview === "true") {
      const allMappedRows = rawRows
        .map(r => mapRow(r, mapping))
        .filter(r => r.productName || r.manufacturer);
      return res.json({
        totalRows: rawRows.length,
        headers,
        mapping,
        preview: allMappedRows.slice(0, 5),
        allMappedRows: allMappedRows.slice(0, 200), // capped for AI analysis
      });
    }

    // Standard (non-AI) full import
    const importBatchId = `IMPORT-${Date.now()}`;
    const businessUnitOverride = (req.body?.businessUnit as string) || undefined;
    const results = { created: 0, skipped: 0, failed: 0, errors: [] as string[], importBatchId, productIds: [] as string[] };
    const scoped = tenantStorage(req);

    for (let i = 0; i < rawRows.length; i++) {
      const mapped = mapRow(rawRows[i], mapping);
      if (!mapped.productName && !mapped.manufacturer) { results.skipped++; continue; }
      const coerced = coerceProduct({ ...mapped, businessUnit: businessUnitOverride || mapped.businessUnit || undefined, importBatchId });
      try {
        const parsed = insertProductSchema.safeParse(coerced);
        if (!parsed.success) { results.failed++; results.errors.push(`Row ${i + 2}: ${parsed.error.issues.map(e => e.message).join(", ")}`); continue; }
        const product = await scoped.createProduct(parsed.data);
        await qrService.generateQRCode(product.id);
        results.created++;
        results.productIds.push(product.id);
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Row ${i + 2}: ${err?.message || "Unknown error"}`);
      }
    }
    res.json(results);
  } catch (error: any) {
    console.error("Bulk import error:", error);
    res.status(500).json({ error: "Import failed", details: error?.message });
  }
});

// ─── POST /api/products/bulk-import/ai-analyze ───────────────────────────
// Takes pre-mapped rows, returns AI suggestions + quality flags per row.
// Only rows that need changes are returned — complete rows are omitted.
router.post("/bulk-import/ai-analyze", async (req: Request, res: Response) => {
  try {
    const { rows } = req.body as { rows: Record<string, any>[] };
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: "rows must be a non-empty array" });
    }

    // Identify which fields are missing per row — skip rows that are complete
    const REQUIRED_FIELDS = ["materials", "carbonFootprint", "repairabilityScore", "warrantyInfo", "recyclingInstructions"];
    const OPTIONAL_FIELDS = ["productCategory", "description", "countryOfOrigin"];

    const rowsForAI = rows.map((row, idx) => ({
      rowIndex: idx,
      data: row,
      missingRequired: REQUIRED_FIELDS.filter(f => !row[f] || row[f] === ""),
      missingOptional: OPTIONAL_FIELDS.filter(f => !row[f] || row[f] === ""),
    })).filter(r => r.missingRequired.length > 0 || r.missingOptional.length > 0 || !r.data.productName);

    if (rowsForAI.length === 0) {
      return res.json({ rows: [], stats: { analyzed: rows.length, enriched: 0, flagged: 0 } });
    }

    const systemPrompt = `You are a Digital Product Passport (DPP) data specialist for EU ESPR Regulation 2024/1781.
Analyze product records and suggest values for missing fields. Base suggestions on product name, manufacturer, and category.

Rules:
- ONLY suggest values for fields listed as missing. Never modify fields that already have values.
- carbonFootprint: integer kg CO2 equivalent over product lifecycle (0 means unknown — flag if product seems complex)
- repairabilityScore: 1–10 (10 = very easy to repair). Consumer electronics ~4–6, industrial equipment ~6–9.
- materials: concise list of primary materials, e.g. "Stainless steel 316L, polypropylene seals"
- warrantyInfo: typical period for this product type, e.g. "2 years parts and labour"
- recyclingInstructions: practical guidance, e.g. "Separate metals and plastics. Deliver to certified e-waste facility."
- Confidence: 0.9 = high certainty, 0.7–0.9 = medium, below 0.7 = low (mark clearly)

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
      "flags": [
        { "field": "carbonFootprint", "message": "Value of 0 seems low for this product type. Estimate: 200–400 kg CO2.", "severity": "warning" }
      ]
    }
  ]
}
Only include rows that need changes. Omit complete rows.`;

    const userPrompt = `Analyze these ${rowsForAI.length} product records. Suggest values ONLY for their missing fields:

${JSON.stringify(rowsForAI.map(r => ({
      rowIndex: r.rowIndex,
      existingData: r.data,
      missingRequired: r.missingRequired,
      missingOptional: r.missingOptional,
    })), null, 2)}`;

    const response = await aiClient.chat.completions.create({
      model: AI_CHAT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature = more consistent, factual suggestions
    });

    const raw = response.choices[0]?.message?.content || "{}";
    let rawParsed: unknown;
    try { rawParsed = JSON.parse(raw); } catch { rawParsed = { rows: [] }; }

    // Validate against strict schema — reject malformed AI output
    const validated = validateAIOutput(rawParsed);
    if (!validated.success) {
      console.error("[AI Import] Schema validation failed:", validated.error);
      return res.status(502).json({
        error: "AI returned malformed output. Please retry or import without AI.",
        details: validated.error,
      });
    }

    // Enforce per-field confidence thresholds server-side
    const runId = randomUUID();
    const processedRows = validated.data.rows.map(row => {
      const { acceptedSuggestions, rejectedFields } = enforceConfidenceThresholds(row);

      // Append low-confidence rejections as flags for human review
      const extraFlags = rejectedFields.map(r => ({
        field: r.field,
        message: `Confidence ${(r.confidence * 100).toFixed(0)}% is below the ${(r.threshold * 100).toFixed(0)}% threshold for this field. Suggested value: "${r.value}". Please review manually.`,
        severity: "warning" as const,
      }));

      return {
        ...row,
        suggestions: acceptedSuggestions,
        flags: [...row.flags, ...extraFlags],
        // Tag each accepted suggestion with provenance metadata
        provenance: buildAIProvenanceEntries(acceptedSuggestions, runId),
        runId,
      };
    });

    const flagged = processedRows.filter(r => r.flags.length > 0).length;
    const enriched = processedRows.filter(r => Object.keys(r.suggestions).length > 0).length;

    res.json({
      rows: processedRows,
      runId,
      stats: {
        analyzed: rows.length,
        enriched,
        flagged,
        skippedComplete: rows.length - rowsForAI.length,
      },
    });
  } catch (error: any) {
    console.error("AI analyze error:", error);
    res.status(500).json({ error: "AI analysis failed", details: error?.message });
  }
});

// ─── POST /api/products/bulk-import/confirmed ─────────────────────────────
// Accepts user-reviewed, AI-merged rows and creates products.
// This is called after the user has reviewed and confirmed AI suggestions.
router.post("/bulk-import/confirmed", async (req: Request, res: Response) => {
  try {
    const { rows, businessUnit, importBatchId: batchIdParam } = req.body as {
      rows: Record<string, any>[];
      businessUnit?: string;
      importBatchId?: string;
    };

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: "rows must be a non-empty array" });
    }

    const importBatchId = batchIdParam || `IMPORT-${Date.now()}`;
    const results = {
      created: 0, skipped: 0, failed: 0,
      errors: [] as string[],
      importBatchId,
      productIds: [] as string[],
    };
    const scoped = tenantStorage(req);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.productName && !row.manufacturer) { results.skipped++; continue; }

      // Build field provenance: AI-accepted fields tagged from row.provenance,
      // remaining fields tagged as human-entered.
      const aiProvenance: Record<string, any> = row.provenance ?? {};
      const humanFields = Object.keys(row).filter(
        k => !aiProvenance[k] && k !== "provenance" && k !== "runId"
      );
      const fieldProvenance = {
        ...buildHumanProvenanceEntries(humanFields),
        ...aiProvenance,
      };

      const coerced = coerceProduct({
        ...row,
        businessUnit: businessUnit || row.businessUnit || undefined,
        importBatchId,
        fieldProvenance,
      });

      try {
        const parsed = insertProductSchema.safeParse(coerced);
        if (!parsed.success) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: ${parsed.error.issues.map((e: any) => e.message).join(", ")}`);
          continue;
        }
        const product = await scoped.createProduct(parsed.data as any);
        await qrService.generateQRCode(product.id);
        results.created++;
        results.productIds.push(product.id);
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${err?.message || "Unknown error"}`);
      }
    }

    res.json(results);
  } catch (error: any) {
    console.error("Confirmed import error:", error);
    res.status(500).json({ error: "Import failed", details: error?.message });
  }
});

// ─── POST /api/products/batch ─────────────────────────────────────────────
router.post("/batch", async (req: Request, res: Response) => {
  try {
    const { products: items, businessUnit, importBatchId: batchIdParam } = req.body as {
      products: Record<string, any>[];
      businessUnit?: string;
      importBatchId?: string;
    };
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "products must be a non-empty array" });
    if (items.length > 5000) return res.status(400).json({ error: "Maximum 5000 products per batch request" });

    const importBatchId = batchIdParam || `API-BATCH-${Date.now()}`;
    const results = {
      created: [] as { id: string; productName: string; batchNumber: string; qrUrl: string }[],
      failed: [] as { index: number; error: string }[],
      importBatchId,
    };
    const scoped = tenantStorage(req);

    for (let i = 0; i < items.length; i++) {
      const raw = coerceProduct({ ...items[i], businessUnit: businessUnit || items[i].businessUnit, importBatchId });
      try {
        const parsed = insertProductSchema.safeParse(raw);
        if (!parsed.success) { results.failed.push({ index: i, error: parsed.error.issues.map((e: any) => e.message).join(", ") }); continue; }
        const product = await scoped.createProduct(parsed.data);
        await qrService.generateQRCode(product.id);
        results.created.push({ id: product.id, productName: product.productName, batchNumber: product.batchNumber, qrUrl: `/product/${product.id}` });
      } catch (err: any) {
        results.failed.push({ index: i, error: err?.message || "Unknown error" });
      }
    }
    res.status(207).json(results);
  } catch (error: any) {
    console.error("Batch creation error:", error);
    res.status(500).json({ error: "Batch creation failed", details: error?.message });
  }
});

// ─── POST /api/products/qr-export ─────────────────────────────────────────
router.post("/qr-export", async (req: Request, res: Response) => {
  try {
    const { productIds, importBatchId } = req.body as { productIds?: string[]; importBatchId?: string };
    let ids: string[] = productIds || [];

    const scoped = tenantStorage(req);
    if (importBatchId && ids.length === 0) {
      const allProducts = await scoped.getAllProducts();
      ids = allProducts.filter((p: any) => p.importBatchId === importBatchId).map((p: any) => p.id);
    }

    if (ids.length === 0) return res.status(400).json({ error: "Provide productIds or importBatchId" });
    if (ids.length > 1000) return res.status(400).json({ error: "Maximum 1000 QR codes per export" });

    const items: { name: string; batch: string; sku: string; qr: string; id: string }[] = [];
    for (const id of ids) {
      try {
        const product = await scoped.getProduct(id);
        if (!product) continue;
        let qrData = product.qrCodeData;
        if (!qrData) {
          const qrRecord = await qrService.generateQRCode(id);
          qrData = qrRecord?.qrData || "";
        }
        items.push({ id, name: product.productName, batch: product.batchNumber, sku: product.sku || "", qr: qrData || "" });
      } catch (_) {}
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PhotonicTag QR Export — ${items.length} products</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #111; }
    .header { padding: 20px 24px; border-bottom: 2px solid #FFD400; }
    .header h1 { font-size: 18px; font-weight: 700; }
    .header p { font-size: 13px; color: #555; margin-top: 2px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; padding: 24px; }
    .card { border: 1px solid #e5e5e5; border-radius: 8px; padding: 12px; text-align: center; break-inside: avoid; }
    .card img { width: 120px; height: 120px; display: block; margin: 0 auto 8px; }
    .card .name { font-size: 11px; font-weight: 600; margin-bottom: 3px; word-break: break-word; }
    .card .meta { font-size: 10px; color: #666; font-family: monospace; }
    .footer { padding: 16px 24px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #888; text-align: center; }
    @media print { .header { page-break-after: avoid; } .card { break-inside: avoid; } @page { margin: 12mm; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>PhotonicTag — QR Code Export</h1>
    <p>${items.length} products · ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}${importBatchId ? ` · Batch: ${importBatchId}` : ""}</p>
  </div>
  <div class="grid">
    ${items.map(item => `
    <div class="card">
      ${item.qr ? `<img src="${item.qr}" alt="QR for ${item.name}" />` : `<div style="width:120px;height:120px;background:#f5f5f5;margin:0 auto 8px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#999">No QR</div>`}
      <div class="name">${item.name}</div>
      <div class="meta">${item.batch}</div>
      ${item.sku ? `<div class="meta">${item.sku}</div>` : ""}
    </div>`).join("")}
  </div>
  <div class="footer">PhotonicTag — Identity, at the speed of light. · www.photonictag.com</div>
</body>
</html>`;
    res.set("Content-Type", "text/html");
    res.send(html);
  } catch (error: any) {
    console.error("QR export error:", error);
    res.status(500).json({ error: "QR export failed" });
  }
});

export default router;
