import { describe, it, expect, afterEach } from "vitest";
import { parseDbRegionMap } from "../../server/db";

describe("parseDbRegionMap", () => {
  const original = process.env.DB_REGION_MAP;

  afterEach(() => {
    if (original === undefined) delete process.env.DB_REGION_MAP;
    else process.env.DB_REGION_MAP = original;
  });

  it("returns null when unset", () => {
    delete process.env.DB_REGION_MAP;
    expect(parseDbRegionMap()).toBeNull();
  });

  it("parses valid JSON object", () => {
    process.env.DB_REGION_MAP = JSON.stringify({ "eu-west-1": "postgres://eu", "us-east-1": "postgres://us" });
    expect(parseDbRegionMap()).toEqual({
      "eu-west-1": "postgres://eu",
      "us-east-1": "postgres://us",
    });
  });

  it("returns null for invalid JSON", () => {
    process.env.DB_REGION_MAP = "{not-json";
    expect(parseDbRegionMap()).toBeNull();
  });
});
