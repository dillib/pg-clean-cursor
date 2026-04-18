import { describe, it, expect } from "vitest";
import {
  validateAIOutput,
  enforceConfidenceThresholds,
  buildAIProvenanceEntries,
  FIELD_CONFIDENCE_THRESHOLDS,
} from "../../server/services/ai-eval-harness";

describe("validateAIOutput", () => {
  it("accepts valid output", () => {
    const result = validateAIOutput({
      rows: [{
        rowIndex: 0,
        suggestions: {
          materials: { value: "Steel", reason: "Industrial pump", confidence: 0.9 },
        },
        flags: [],
      }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects output missing the rows key", () => {
    const result = validateAIOutput({ data: [] });
    expect(result.success).toBe(false);
  });

  it("rejects confidence values outside [0,1]", () => {
    const result = validateAIOutput({
      rows: [{
        rowIndex: 0,
        suggestions: { materials: { value: "X", reason: "Y", confidence: 1.5 } },
        flags: [],
      }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-array rows", () => {
    expect(validateAIOutput({ rows: "not-an-array" }).success).toBe(false);
  });
});

describe("enforceConfidenceThresholds", () => {
  const makeRow = (field: string, confidence: number) => ({
    rowIndex: 0,
    suggestions: { [field]: { value: "test", reason: "reason", confidence } },
    flags: [],
  });

  it("accepts suggestions above the threshold", () => {
    const threshold = FIELD_CONFIDENCE_THRESHOLDS.carbonFootprint; // 0.80
    const { acceptedSuggestions, rejectedFields } = enforceConfidenceThresholds(
      makeRow("carbonFootprint", threshold + 0.05)
    );
    expect(Object.keys(acceptedSuggestions)).toContain("carbonFootprint");
    expect(rejectedFields).toHaveLength(0);
  });

  it("rejects suggestions below the threshold", () => {
    const threshold = FIELD_CONFIDENCE_THRESHOLDS.carbonFootprint; // 0.80
    const { acceptedSuggestions, rejectedFields } = enforceConfidenceThresholds(
      makeRow("carbonFootprint", threshold - 0.05)
    );
    expect(Object.keys(acceptedSuggestions)).not.toContain("carbonFootprint");
    expect(rejectedFields).toHaveLength(1);
    expect(rejectedFields[0].field).toBe("carbonFootprint");
  });

  it("applies the correct threshold per field", () => {
    const materialsThreshold = FIELD_CONFIDENCE_THRESHOLDS.materials;
    const descriptionThreshold = FIELD_CONFIDENCE_THRESHOLDS.description;
    // A confidence that passes description but not materials
    const confidence = (materialsThreshold + descriptionThreshold) / 2 - 0.01;

    const row = {
      rowIndex: 0,
      suggestions: {
        materials: { value: "Steel", reason: "r", confidence },
        description: { value: "A pump", reason: "r", confidence },
      },
      flags: [],
    };
    const { acceptedSuggestions, rejectedFields } = enforceConfidenceThresholds(row);
    if (confidence >= descriptionThreshold) {
      expect(Object.keys(acceptedSuggestions)).toContain("description");
    }
    if (confidence < materialsThreshold) {
      expect(rejectedFields.map(r => r.field)).toContain("materials");
    }
  });
});

describe("buildAIProvenanceEntries", () => {
  it("tags each accepted field with source=ai_accepted", () => {
    const suggestions = {
      materials: { value: "Steel", reason: "r", confidence: 0.9 },
      carbonFootprint: { value: 150, reason: "r", confidence: 0.85 },
    };
    const provenance = buildAIProvenanceEntries(suggestions, "run-123");
    expect(provenance.materials.source).toBe("ai_accepted");
    expect(provenance.materials.confidence).toBe(0.9);
    expect(provenance.carbonFootprint.source).toBe("ai_accepted");
    expect(provenance.materials.by).toContain("run-123");
  });

  it("includes an ISO timestamp", () => {
    const provenance = buildAIProvenanceEntries(
      { materials: { value: "X", reason: "r", confidence: 0.9 } },
      "run-abc"
    );
    expect(() => new Date(provenance.materials.at).toISOString()).not.toThrow();
  });
});
