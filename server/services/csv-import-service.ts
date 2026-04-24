/**
 * CSV import service — the second-revenue connector path.
 *
 * Parses an uploaded CSV/XLSX file, applies the connector's user-configured
 * FieldMappings (same engine as SAP), and produces an array of partial
 * PhotonicTag product records ready for insert.
 *
 * Designed to feed the same insert path SAP uses: the route handler is
 * responsible for tenant scoping, conflict detection vs. existing products,
 * and writing to integrationSyncLogs. This service stays pure transformation.
 */
import * as XLSX from "xlsx";
import type { FieldMapping } from "@shared/schema";
import { applyFieldMappingsToRecord } from "./sap-odata-client";

export interface CSVParseResult {
  headers: string[];
  rows: Record<string, unknown>[];
}

export interface CSVImportResult {
  parsed: number;        // rows parsed from the file
  mapped: number;        // rows that produced at least one mapped field
  records: Record<string, unknown>[]; // mapped product records ready for insert
  errors: string[];      // per-row error messages (truncated at 50)
}

const MAX_ERRORS = 50;

/**
 * Parse a CSV or XLSX file buffer into a flat header + rows structure.
 * Uses the existing xlsx dependency (already used by product-import-routes)
 * so we don't add a new parser. Throws on malformed input.
 */
export function parseSpreadsheetBuffer(buffer: Buffer, filename?: string): CSVParseResult {
  // xlsx auto-detects format from content; filename hint helps for ambiguous bytes.
  const workbook = XLSX.read(buffer, { type: "buffer", raw: false, codepage: 65001 });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("File contains no sheets");
  }
  const sheet = workbook.Sheets[firstSheetName];

  // header: 1 returns array-of-arrays; we manually extract headers + rows so
  // we keep header strings as-is (preserving case for FieldMapping.sourceField
  // lookups, which match exactly).
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
  if (aoa.length === 0) {
    return { headers: [], rows: [] };
  }
  const headers = (aoa[0] as unknown[]).map(h => String(h ?? "").trim());
  const rows: Record<string, unknown>[] = [];
  for (let i = 1; i < aoa.length; i++) {
    const row = aoa[i] as unknown[];
    if (!row || row.every(c => c === "" || c == null)) continue; // skip blank rows
    const obj: Record<string, unknown> = {};
    for (let h = 0; h < headers.length; h++) {
      if (headers[h]) obj[headers[h]] = row[h] ?? "";
    }
    rows.push(obj);
  }
  return { headers, rows };
}

/**
 * Take parsed rows + a connector's FieldMapping[] and produce mapped product
 * records. Rows that produce zero mapped fields are counted as errors but do
 * not throw.
 */
export function applyMappingsToRows(
  rows: Record<string, unknown>[],
  mappings: FieldMapping[],
): CSVImportResult {
  const errors: string[] = [];
  const records: Record<string, unknown>[] = [];
  let mapped = 0;

  rows.forEach((row, idx) => {
    try {
      const record = applyFieldMappingsToRecord(row, mappings);
      if (Object.keys(record).length === 0) {
        if (errors.length < MAX_ERRORS) {
          errors.push(`Row ${idx + 2}: no fields mapped — check your column mapping`);
        }
        return;
      }
      records.push(record);
      mapped++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (errors.length < MAX_ERRORS) {
        errors.push(`Row ${idx + 2}: ${msg}`);
      }
    }
  });

  return {
    parsed: rows.length,
    mapped,
    records,
    errors,
  };
}

/**
 * One-shot helper: parse + map. The route handler then takes records and
 * writes them via storage.createProduct() under the tenant scope.
 */
export function importCSVFromBuffer(
  buffer: Buffer,
  mappings: FieldMapping[],
  filename?: string,
): CSVImportResult {
  const parsed = parseSpreadsheetBuffer(buffer, filename);
  if (parsed.rows.length === 0) {
    return { parsed: 0, mapped: 0, records: [], errors: ["File contains no data rows"] };
  }
  if (mappings.length === 0) {
    return {
      parsed: parsed.rows.length,
      mapped: 0,
      records: [],
      errors: ["No field mappings configured for this connector — set sourceField → targetField pairs in connector settings"],
    };
  }
  return applyMappingsToRows(parsed.rows, mappings);
}
