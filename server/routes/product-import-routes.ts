import { Router, type Request, type Response } from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import { storage } from "../storage";
import { qrService } from "../services/qr-service";
import { insertProductSchema } from "@shared/schema";
import type { RequestHandler } from "express";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// ─── Column name aliases → internal field names ───────────────────────────
const PRODUCT_COLUMN_MAP: Record<string, string> = {
  // Product name
  "product name": "productName", "productname": "productName", "name": "productName",
  "product": "productName", "produkt": "productName",
  // Category
  "category": "productCategory", "product category": "productCategory",
  "productcategory": "productCategory", "type": "productCategory",
  // Manufacturer
  "manufacturer": "manufacturer", "brand": "manufacturer", "vendor": "manufacturer",
  "hersteller": "manufacturer", "oem": "manufacturer",
  // Model
  "model": "modelNumber", "model number": "modelNumber", "modelnumber": "modelNumber",
  "model no": "modelNumber", "part number": "modelNumber", "partnumber": "modelNumber",
  // SKU
  "sku": "sku", "article number": "sku", "article no": "sku", "artikelnummer": "sku",
  // Batch
  "batch": "batchNumber", "batch number": "batchNumber", "batchnumber": "batchNumber",
  "batch no": "batchNumber", "lot": "batchNumber", "charge": "batchNumber",
  // Lot
  "lot number": "lotNumber", "lotnumber": "lotNumber", "lot no": "lotNumber",
  // Country
  "country": "countryOfOrigin", "country of origin": "countryOfOrigin",
  "origin": "countryOfOrigin", "herkunft": "countryOfOrigin",
  // Materials
  "materials": "materials", "material": "materials", "composition": "materials",
  "material composition": "materials", "werkstoffe": "materials",
  // Carbon
  "carbon": "carbonFootprint", "carbon footprint": "carbonFootprint",
  "co2": "carbonFootprint", "co2 kg": "carbonFootprint", "carbonfootprint": "carbonFootprint",
  // Repairability
  "repairability": "repairabilityScore", "repairability score": "repairabilityScore",
  "repair score": "repairabilityScore", "repairabilityscore": "repairabilityScore",
  // Lifespan
  "lifespan": "expectedLifespanYears", "expected lifespan": "expectedLifespanYears",
  "lifespan years": "expectedLifespanYears", "years": "expectedLifespanYears",
  // Recycled content
  "recycled content": "recycledContentPercent", "recycled %": "recycledContentPercent",
  "recycledcontent": "recycledContentPercent",
  // Recyclability
  "recyclability": "recyclabilityPercent", "recyclable %": "recyclabilityPercent",
  // Warranty
  "warranty": "warrantyInfo", "warranty info": "warrantyInfo", "garantie": "warrantyInfo",
  // Recycling instructions
  "recycling": "recyclingInstructions", "recycling instructions": "recyclingInstructions",
  "disposal": "recyclingInstructions", "entsorgung": "recyclingInstructions",
  // Description
  "description": "description", "beschreibung": "description",
  // Business unit
  "business unit": "businessUnit", "businessunit": "businessUnit",
  "unit": "businessUnit", "division": "businessUnit", "department": "businessUnit",
  "abteilung": "businessUnit", "werk": "businessUnit", "site": "businessUnit",
  // Water / Energy
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

// Coerce numeric fields
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
  // Default required fields
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

// ─── POST /api/products/bulk-import ─────────────────────────────────────
router.post("/bulk-import", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (rawRows.length === 0) {
      return res.status(400).json({ error: "File is empty or has no data rows" });
    }

    // Build column mapping
    const headers = Object.keys(rawRows[0]);
    const mapping: Record<string, string> = {};
    for (const h of headers) {
      const norm = normalizeHeader(h);
      if (PRODUCT_COLUMN_MAP[norm]) mapping[h] = PRODUCT_COLUMN_MAP[norm];
    }

    // Preview mode — return first 5 rows + detected mapping
    const preview = req.query.preview === "true";
    if (preview) {
      return res.json({
        totalRows: rawRows.length,
        headers,
        mapping,
        preview: rawRows.slice(0, 5).map(r => mapRow(r, mapping)),
      });
    }

    // Full import
    const importBatchId = `IMPORT-${Date.now()}`;
    const businessUnitOverride = (req.body?.businessUnit as string) || undefined;
    const results = {
      created: 0, skipped: 0, failed: 0,
      errors: [] as string[],
      importBatchId,
      productIds: [] as string[],
    };

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const mapped = mapRow(row, mapping);

      if (!mapped.productName && !mapped.manufacturer) {
        results.skipped++;
        continue;
      }

      const coerced = coerceProduct({
        ...mapped,
        businessUnit: businessUnitOverride || mapped.businessUnit || undefined,
        importBatchId,
      });

      try {
        const parsed = insertProductSchema.safeParse(coerced);
        if (!parsed.success) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: ${parsed.error.issues.map(e => e.message).join(", ")}`);
          continue;
        }
        const product = await storage.createProduct(parsed.data);
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

// ─── POST /api/products/batch ─────────────────────────────────────────────
router.post("/batch", async (req: Request, res: Response) => {
  try {
    const { products: items, businessUnit, importBatchId: batchIdParam } = req.body as {
      products: Record<string, any>[];
      businessUnit?: string;
      importBatchId?: string;
    };

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "products must be a non-empty array" });
    }
    if (items.length > 5000) {
      return res.status(400).json({ error: "Maximum 5000 products per batch request" });
    }

    const importBatchId = batchIdParam || `API-BATCH-${Date.now()}`;
    const results = {
      created: [] as { id: string; productName: string; batchNumber: string; qrUrl: string }[],
      failed: [] as { index: number; error: string }[],
      importBatchId,
    };

    for (let i = 0; i < items.length; i++) {
      const raw = coerceProduct({ ...items[i], businessUnit: businessUnit || items[i].businessUnit, importBatchId });
      try {
        const parsed = insertProductSchema.safeParse(raw);
        if (!parsed.success) {
          results.failed.push({ index: i, error: parsed.error.issues.map(e => e.message).join(", ") });
          continue;
        }
        const product = await storage.createProduct(parsed.data);
        const qrRecord = await qrService.generateQRCode(product.id);
        results.created.push({
          id: product.id,
          productName: product.productName,
          batchNumber: product.batchNumber,
          qrUrl: `/product/${product.id}`,
        });
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
// Returns a printable HTML page with all QR codes for the given product IDs
router.post("/qr-export", async (req: Request, res: Response) => {
  try {
    const { productIds, importBatchId } = req.body as {
      productIds?: string[];
      importBatchId?: string;
    };

    let ids: string[] = productIds || [];

    // If importBatchId given, fetch all products from that batch
    if (importBatchId && ids.length === 0) {
      const allProducts = await storage.getAllProducts();
      ids = allProducts
        .filter((p: any) => p.importBatchId === importBatchId)
        .map((p: any) => p.id);
    }

    if (ids.length === 0) {
      return res.status(400).json({ error: "Provide productIds or importBatchId" });
    }
    if (ids.length > 1000) {
      return res.status(400).json({ error: "Maximum 1000 QR codes per export" });
    }

    // Fetch all products and their QR codes
    const items: { name: string; batch: string; sku: string; qr: string; id: string }[] = [];
    for (const id of ids) {
      try {
        const product = await storage.getProduct(id);
        if (!product) continue;
        let qrData = product.qrCodeData;
        if (!qrData) {
          const qrRecord = await qrService.generateQRCode(id);
          qrData = qrRecord?.qrCodeData || "";
        }
        items.push({
          id,
          name: product.productName,
          batch: product.batchNumber,
          sku: product.sku || "",
          qr: qrData || "",
        });
      } catch (_) { /* skip individual failures */ }
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PhotonicTag QR Export — ${items.length} products</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #111; }
    .header { padding: 20px 24px; border-bottom: 2px solid #FFD400; display: flex; align-items: center; gap: 12px; }
    .header h1 { font-size: 18px; font-weight: 700; }
    .header p { font-size: 13px; color: #555; margin-top: 2px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; padding: 24px; }
    .card { border: 1px solid #e5e5e5; border-radius: 8px; padding: 12px; text-align: center; break-inside: avoid; }
    .card img { width: 120px; height: 120px; display: block; margin: 0 auto 8px; }
    .card .name { font-size: 11px; font-weight: 600; margin-bottom: 3px; word-break: break-word; }
    .card .meta { font-size: 10px; color: #666; font-family: monospace; }
    .footer { padding: 16px 24px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #888; text-align: center; }
    @media print {
      .header { page-break-after: avoid; }
      .card { break-inside: avoid; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>PhotonicTag — QR Code Export</h1>
      <p>${items.length} products · Generated ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}${importBatchId ? ` · Batch: ${importBatchId}` : ""}</p>
    </div>
  </div>
  <div class="grid">
    ${items.map(item => `
    <div class="card">
      ${item.qr ? `<img src="${item.qr}" alt="QR code for ${item.name}" />` : `<div style="width:120px;height:120px;background:#f5f5f5;margin:0 auto 8px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#999;">No QR</div>`}
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
