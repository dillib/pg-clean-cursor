import { describe, it, expect } from "vitest";
import {
  safeParseJSON,
  validateHealthScore,
  validateNextBestActions,
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
