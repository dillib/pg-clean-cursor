import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { getMasterAdminEmails, isMasterAdminEmail } from "@shared/models/auth";

describe("master admin emails", () => {
  const original = process.env.MASTER_ADMIN_EMAILS;

  afterEach(() => {
    process.env.MASTER_ADMIN_EMAILS = original;
  });

  it("returns empty list when env is unset", () => {
    delete process.env.MASTER_ADMIN_EMAILS;
    expect(getMasterAdminEmails()).toEqual([]);
  });

  it("parses comma-separated emails and lowercases", () => {
    process.env.MASTER_ADMIN_EMAILS = "Alice@Example.com, bob@example.com";
    expect(getMasterAdminEmails()).toEqual([
      "alice@example.com",
      "bob@example.com",
    ]);
  });

  it("ignores empty entries", () => {
    process.env.MASTER_ADMIN_EMAILS = "a@x.com,, ,b@y.com";
    expect(getMasterAdminEmails()).toEqual(["a@x.com", "b@y.com"]);
  });

  it("isMasterAdminEmail is case-insensitive and null-safe", () => {
    process.env.MASTER_ADMIN_EMAILS = "admin@example.com";
    expect(isMasterAdminEmail("ADMIN@example.com")).toBe(true);
    expect(isMasterAdminEmail("other@example.com")).toBe(false);
    expect(isMasterAdminEmail(null)).toBe(false);
    expect(isMasterAdminEmail(undefined)).toBe(false);
    expect(isMasterAdminEmail("")).toBe(false);
  });
});
