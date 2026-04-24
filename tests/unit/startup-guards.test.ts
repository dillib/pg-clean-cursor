import { describe, it, expect, afterEach } from "vitest";
import { assertProductionTrustConfig } from "../../server/startup-guards";

describe("assertProductionTrustConfig", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalMaster = process.env.MASTER_ADMIN_EMAILS;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.MASTER_ADMIN_EMAILS = originalMaster;
  });

  it("no-ops when not in production", () => {
    process.env.NODE_ENV = "development";
    delete process.env.MASTER_ADMIN_EMAILS;
    expect(() => assertProductionTrustConfig()).not.toThrow();
  });

  it("no-ops in production when MASTER_ADMIN_EMAILS is set", () => {
    process.env.NODE_ENV = "production";
    process.env.MASTER_ADMIN_EMAILS = "ops@example.com";
    expect(() => assertProductionTrustConfig()).not.toThrow();
  });

  it("throws in production when MASTER_ADMIN_EMAILS is missing", () => {
    process.env.NODE_ENV = "production";
    delete process.env.MASTER_ADMIN_EMAILS;
    expect(() => assertProductionTrustConfig()).toThrow(/MASTER_ADMIN_EMAILS/);
  });

  it("throws in production when MASTER_ADMIN_EMAILS is only whitespace/commas", () => {
    process.env.NODE_ENV = "production";
    process.env.MASTER_ADMIN_EMAILS = " , , ";
    expect(() => assertProductionTrustConfig()).toThrow(/MASTER_ADMIN_EMAILS/);
  });
});
