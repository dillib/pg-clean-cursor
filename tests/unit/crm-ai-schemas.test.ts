import { describe, it, expect } from "vitest";
import {
  safeParseJSON,
  validateHealthScore,
  validateNextBestActions,
  validateDemoProvisioningOutput,
  validateTicketTriageOutput,
} from "../../server/services/crm-ai-schemas";

describe("safeParseJSON", () => {
  it("returns data for valid JSON", () => {
    const result = safeParseJSON('{"a": 1}');
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual({ a: 1 });
  });

  it("returns error for malformed JSON instead of throwing", () => {
    const result = safeParseJSON("{not json");
    expect(result.success).toBe(false);
  });
});

describe("validateHealthScore", () => {
  it("accepts a well-formed health score response", () => {
    const result = validateHealthScore({
      healthScore: 72,
      trend: "stable",
      factors: [{ name: "usage", impact: "positive", detail: "weekly logins up 20%" }],
      riskLevel: "low",
    });
    expect(result.success).toBe(true);
  });

  it("rejects out-of-range healthScore", () => {
    const result = validateHealthScore({
      healthScore: 150,
      trend: "stable",
      factors: [],
      riskLevel: "low",
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown trend enum value", () => {
    const result = validateHealthScore({
      healthScore: 50,
      trend: "wobbling",
      factors: [],
      riskLevel: "low",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing riskLevel", () => {
    const result = validateHealthScore({
      healthScore: 50,
      trend: "stable",
      factors: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown impact on a factor", () => {
    const result = validateHealthScore({
      healthScore: 50,
      trend: "stable",
      factors: [{ name: "x", impact: "weird", detail: "y" }],
      riskLevel: "low",
    });
    expect(result.success).toBe(false);
  });
});

describe("validateNextBestActions", () => {
  it("accepts a well-formed actions response", () => {
    const result = validateNextBestActions({
      actions: [
        {
          action: "Schedule QBR",
          reasoning: "Contract renewal in 60 days.",
          priority: "high",
          category: "renewal",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty actions array", () => {
    const result = validateNextBestActions({ actions: [] });
    expect(result.success).toBe(false);
  });

  it("rejects unknown priority", () => {
    const result = validateNextBestActions({
      actions: [
        { action: "x", reasoning: "y", priority: "urgent", category: "z" },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe("validateDemoProvisioningOutput", () => {
  const oneValidProduct = {
    productName: "Eco Bottle 500ml",
    productCategory: "Household",
    modelNumber: "EB-500",
    sku: "SKU-1",
    manufacturer: "GreenCo",
    countryOfOrigin: "DE",
    batchNumber: "B-001",
    materials: "Stainless steel, silicone",
    carbonFootprint: 12.5,
    repairabilityScore: 8,
    warrantyInfo: "2 years",
    recyclingInstructions: "Return to retailer",
    recycledContentPercent: 40,
    recyclabilityPercent: 90,
  };

  it("accepts one to three products", () => {
    const result = validateDemoProvisioningOutput({ products: [oneValidProduct] });
    expect(result.success).toBe(true);
  });

  it("rejects empty products array", () => {
    const result = validateDemoProvisioningOutput({ products: [] });
    expect(result.success).toBe(false);
  });

  it("rejects more than 10 products (DoS guard)", () => {
    const products = Array.from({ length: 11 }, () => ({ ...oneValidProduct, sku: Math.random().toString() }));
    const result = validateDemoProvisioningOutput({ products });
    expect(result.success).toBe(false);
  });

  it("rejects repairabilityScore out of range", () => {
    const result = validateDemoProvisioningOutput({
      products: [{ ...oneValidProduct, repairabilityScore: 11 }],
    });
    expect(result.success).toBe(false);
  });

  it("coerces numeric strings on sku for robustness", () => {
    const result = validateDemoProvisioningOutput({
      products: [{ ...oneValidProduct, sku: 12345 as unknown as string }],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.products[0].sku).toBe("12345");
  });
});

describe("validateTicketTriageOutput", () => {
  it("accepts a well-formed triage response", () => {
    const result = validateTicketTriageOutput({
      summary: "User cannot connect SAP.",
      priority: "high",
      category: "integration",
      tags: ["#SAP"],
    });
    expect(result.success).toBe(true);
  });

  it("defaults tags when omitted", () => {
    const result = validateTicketTriageOutput({
      summary: "Question about billing",
      priority: "low",
      category: "billing",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tags).toEqual([]);
  });

  it("rejects invalid category", () => {
    const result = validateTicketTriageOutput({
      summary: "x",
      priority: "medium",
      category: "sales",
      tags: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects too many tags", () => {
    const result = validateTicketTriageOutput({
      summary: "x",
      priority: "medium",
      category: "general",
      tags: Array.from({ length: 41 }, (_, i) => `t${i}`),
    });
    expect(result.success).toBe(false);
  });
});
