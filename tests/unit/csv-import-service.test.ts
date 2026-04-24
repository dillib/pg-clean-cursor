/**
 * csv-import-service + applyFieldMappingsToRecord — pure-logic coverage.
 *
 * Sources under test:
 *   - server/services/sap-odata-client.ts → applyFieldMappingsToRecord(source, mappings, baseDefaults?)
 *   - server/services/csv-import-service.ts → parseSpreadsheetBuffer, applyMappingsToRows, importCSVFromBuffer
 *
 * No mocks: these are pure functions over Buffer input. CSVs are constructed
 * inline as multi-line strings and wrapped with `Buffer.from(...)` so the test
 * needs no fixture files. The `xlsx` library auto-detects CSV from buffer
 * content and is already a project dependency.
 *
 * Mapping to ticket-#0005 behaviour table is noted on each `it(...)`.
 */
import { describe, it, expect } from "vitest";
import type { FieldMapping } from "@shared/schema";
import { applyFieldMappingsToRecord } from "../../server/services/sap-odata-client";
import {
  parseSpreadsheetBuffer,
  applyMappingsToRows,
  importCSVFromBuffer,
} from "../../server/services/csv-import-service";

describe("applyFieldMappingsToRecord()", () => {
  // Behaviour #1
  it("maps a single sourceField → targetField with no defaults", () => {
    const mappings: FieldMapping[] = [
      { sourceField: "foo", targetField: "productName" },
    ];

    const result = applyFieldMappingsToRecord({ foo: "bar" }, mappings);

    expect(result).toEqual({ productName: "bar" });
  });

  // Behaviour #2
  it("merges baseDefaults so mappings overlay (and don't drop) defaults", () => {
    const mappings: FieldMapping[] = [
      { sourceField: "foo", targetField: "productName" },
    ];

    const result = applyFieldMappingsToRecord(
      { foo: "bar" },
      mappings,
      { description: "fallback" },
    );

    expect(result).toEqual({
      description: "fallback",
      productName: "bar",
    });
  });

  // Behaviour #3
  it("applies the 'uppercase' transformation to the mapped value", () => {
    const mappings: FieldMapping[] = [
      { sourceField: "name", targetField: "productName", transformation: "uppercase" },
    ];

    const result = applyFieldMappingsToRecord({ name: "abc" }, mappings);

    expect(result).toEqual({ productName: "ABC" });
  });

  // Behaviour #4
  it("ignores a mapping whose sourceField is whitespace-only", () => {
    const mappings: FieldMapping[] = [
      { sourceField: "   ", targetField: "productName" },
      { sourceField: "name", targetField: "productName" },
    ];

    const result = applyFieldMappingsToRecord({ name: "real" }, mappings);

    // The whitespace mapping is filtered out before iteration; only the real
    // mapping contributes. The result has exactly one key.
    expect(result).toEqual({ productName: "real" });
  });

  // Behaviour #5
  it("ignores a mapping whose sourceField is absent from the source record", () => {
    const mappings: FieldMapping[] = [
      { sourceField: "missing", targetField: "productName" },
    ];

    const result = applyFieldMappingsToRecord({ name: "abc" }, mappings);

    // No defaults, no successful mappings → empty object, with no
    // accidentally-present targetField key.
    expect(result).toEqual({});
    expect(Object.prototype.hasOwnProperty.call(result, "productName")).toBe(false);
  });
});

describe("parseSpreadsheetBuffer()", () => {
  // Behaviour #6
  it("parses a small inline CSV into headers + rows", () => {
    const csv = "sku,name,weight\nA-001,Widget,1.5\nA-002,Gadget,2.0\n";

    const result = parseSpreadsheetBuffer(Buffer.from(csv), "in.csv");

    expect(result.headers).toEqual(["sku", "name", "weight"]);
    expect(result.rows.length).toBe(2);
    // xlsx auto-coerces numeric-looking cells to numbers even with raw:false
    // (raw controls formatting, not type detection). We assert the *actual*
    // behaviour the production code produces — string identifiers stay string,
    // numeric columns come back as numbers. Downstream transformations
    // (`number`, `trim`, etc.) should normalise these consistently.
    expect(result.rows[0]).toEqual({ sku: "A-001", name: "Widget", weight: 1.5 });
    expect(result.rows[1]).toEqual({ sku: "A-002", name: "Gadget", weight: 2 });
  });

  // Behaviour #7
  it("skips a fully blank row in the middle/end of the file", () => {
    // Two real rows + a trailing all-empty row (",,") which the parser must drop.
    const csv = "sku,name,weight\nA-001,Widget,1.5\nA-002,Gadget,2.0\n,,\n";

    const result = parseSpreadsheetBuffer(Buffer.from(csv));

    expect(result.headers).toEqual(["sku", "name", "weight"]);
    expect(result.rows.length).toBe(2);
    expect(result.rows.map(r => r.sku)).toEqual(["A-001", "A-002"]);
  });

  // Behaviour #8 — see "Bug log" in agent report.
  // The ticket asserts that `parseSpreadsheetBuffer(Buffer.from(""))` throws
  // `Error("File contains no sheets")`. In practice xlsx synthesises a default
  // `Sheet1` for an empty buffer, so the `!firstSheetName` guard never trips
  // and the function returns `{ headers: [], rows: [] }`. The downstream
  // protection lives in `importCSVFromBuffer` (covered by behaviour #12, the
  // "File contains no data rows" branch), so the user-visible error path is
  // intact even though the inner throw is unreachable. We assert the *actual*
  // behaviour here so the test is honest; the divergence from the ticket is
  // logged in the agent report rather than fixed (per ticket hard rules).
  it("returns no usable rows for an empty buffer (xlsx synthesises Sheet1)", () => {
    const result = parseSpreadsheetBuffer(Buffer.from(""));

    // xlsx fabricates a single-cell Sheet1 from a zero-byte buffer. Header
    // comes back as [""] (one empty column name) — not the [] the ticket
    // expected — and there are no data rows. The downstream "no data rows"
    // branch in importCSVFromBuffer is what protects users in practice.
    expect(result.rows).toEqual([]);
    expect(result.headers.every(h => h === "")).toBe(true);
  });
});

describe("applyMappingsToRows()", () => {
  // Behaviour #9
  it("emits a 'no fields mapped' error per row when nothing maps, and reports mapped=0", () => {
    const rows = [
      { sku: "A-001", name: "Widget" },
      { sku: "A-002", name: "Gadget" },
    ];
    // sourceField doesn't match any key in the rows → every row produces an
    // empty mapped record → every row is reported as a 'no fields mapped' error.
    const mappings: FieldMapping[] = [
      { sourceField: "doesNotExist", targetField: "productName" },
    ];

    const result = applyMappingsToRows(rows, mappings);

    expect(result.parsed).toBe(2);
    expect(result.mapped).toBe(0);
    expect(result.records).toEqual([]);
    expect(result.errors.length).toBe(2);
    // First data row is row 2 in spreadsheet terms (header occupies row 1).
    expect(result.errors[0]).toMatch(/^Row 2: no fields mapped/);
    expect(result.errors[1]).toMatch(/^Row 3: no fields mapped/);
  });
});

describe("importCSVFromBuffer()", () => {
  // Behaviour #10
  it("happy path: parses CSV and produces mapped records with no errors", () => {
    const csv = "sku,name\nA-001,Widget\nA-002,Gadget\n";
    const mappings: FieldMapping[] = [
      { sourceField: "sku", targetField: "productCode" },
      { sourceField: "name", targetField: "productName" },
    ];

    const result = importCSVFromBuffer(Buffer.from(csv), mappings, "in.csv");

    expect(result.parsed).toBe(2);
    expect(result.mapped).toBe(2);
    expect(result.errors).toEqual([]);
    expect(result.records).toEqual([
      { productCode: "A-001", productName: "Widget" },
      { productCode: "A-002", productName: "Gadget" },
    ]);
  });

  // Behaviour #11
  it("returns a 'no field mappings configured' error when mappings is empty", () => {
    const csv = "sku,name\nA-001,Widget\nA-002,Gadget\n";

    const result = importCSVFromBuffer(Buffer.from(csv), [], "in.csv");

    expect(result.parsed).toBe(2);
    expect(result.mapped).toBe(0);
    expect(result.records).toEqual([]);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toMatch(/no field mappings configured/i);
  });

  // Behaviour #12
  it("returns a 'no data rows' error when the CSV has only a header row", () => {
    const csv = "sku,name\n";
    const mappings: FieldMapping[] = [
      { sourceField: "sku", targetField: "productCode" },
    ];

    const result = importCSVFromBuffer(Buffer.from(csv), mappings, "empty.csv");

    expect(result).toEqual({
      parsed: 0,
      mapped: 0,
      records: [],
      errors: ["File contains no data rows"],
    });
  });
});
