import { describe, it, expect, beforeAll } from "vitest";
import {
  encryptSecret,
  decryptSecret,
  encryptSAPCredentials,
  decryptSAPCredentials,
  safeEqual,
} from "../../server/services/crypto-service";

beforeAll(() => {
  process.env.CONNECTOR_ENCRYPTION_KEY =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
});

describe("crypto-service", () => {
  it("round-trips a plaintext string", () => {
    const secret = "hunter2-SAP-p@ssword";
    const blob = encryptSecret(secret);
    expect(blob).not.toContain(secret);
    expect(blob.split(":")).toHaveLength(3);
    expect(decryptSecret(blob)).toBe(secret);
  });

  it("produces different ciphertext for the same plaintext (random IV)", () => {
    const a = encryptSecret("same");
    const b = encryptSecret("same");
    expect(a).not.toBe(b);
  });

  it("detects ciphertext tampering via the GCM auth tag", () => {
    const blob = encryptSecret("x");
    const [iv, ct, tag] = blob.split(":");
    // Flip one bit in the ciphertext
    const tamperedCt = Buffer.from(ct, "base64");
    tamperedCt[0] = tamperedCt[0] ^ 0x01;
    const tampered = [iv, tamperedCt.toString("base64"), tag].join(":");
    expect(() => decryptSecret(tampered)).toThrow();
  });

  it("splits SAP credentials out of the config JSONB", () => {
    const config = {
      systemType: "S4HANA",
      hostname: "sap.example.com",
      username: "PT_SYNC",
      password: "super-secret",
      oauthClientSecret: "oauth-secret",
    };
    const { redactedConfig, credentialsCiphertext } = encryptSAPCredentials(config);

    expect(redactedConfig.hostname).toBe("sap.example.com");
    expect(redactedConfig.username).toBe("PT_SYNC");
    expect(redactedConfig.password).toBeUndefined();
    expect(redactedConfig.oauthClientSecret).toBeUndefined();

    expect(credentialsCiphertext).toBeTruthy();
    const merged = decryptSAPCredentials(redactedConfig, credentialsCiphertext);
    expect(merged.password).toBe("super-secret");
    expect(merged.oauthClientSecret).toBe("oauth-secret");
    expect(merged.hostname).toBe("sap.example.com");
  });

  it("returns null ciphertext when no sensitive fields are present", () => {
    const { credentialsCiphertext } = encryptSAPCredentials({
      systemType: "S4HANA",
      hostname: "mock",
    });
    expect(credentialsCiphertext).toBeNull();
  });

  it("safeEqual behaves like ===", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });

  it("rejects a malformed key", () => {
    const original = process.env.CONNECTOR_ENCRYPTION_KEY;
    process.env.CONNECTOR_ENCRYPTION_KEY = "tooshort";
    expect(() => encryptSecret("x")).toThrow(/must decode to 32 bytes/);
    process.env.CONNECTOR_ENCRYPTION_KEY = original;
  });
});
