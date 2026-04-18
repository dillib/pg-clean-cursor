/**
 * Crypto service — AES-256-GCM authenticated encryption for secrets at rest.
 *
 * Used by: enterprise_connectors.credentialsCiphertext
 * Key: CONNECTOR_ENCRYPTION_KEY env var, 32 bytes (64 hex chars)
 *
 * Format: base64(iv) + ":" + base64(ciphertext) + ":" + base64(authTag)
 *
 * GCM gives us both confidentiality and integrity (authTag detects tampering).
 * A 12-byte IV is the NIST-recommended size for GCM.
 */

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
} from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

function getKey(): Buffer {
  const raw = process.env.CONNECTOR_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "CONNECTOR_ENCRYPTION_KEY is not set — connector credentials cannot be encrypted or decrypted. " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  const key = Buffer.from(raw, "hex");
  if (key.length !== KEY_LENGTH) {
    throw new Error(
      `CONNECTOR_ENCRYPTION_KEY must decode to ${KEY_LENGTH} bytes (got ${key.length}). Expected 64 hex characters.`
    );
  }
  return key;
}

export function encryptSecret(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    iv.toString("base64"),
    ciphertext.toString("base64"),
    authTag.toString("base64"),
  ].join(":");
}

export function decryptSecret(blob: string): string {
  const key = getKey();
  const parts = blob.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid ciphertext format — expected iv:ciphertext:authTag");
  }
  const [ivB64, ciphertextB64, authTagB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const ciphertext = Buffer.from(ciphertextB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  if (iv.length !== IV_LENGTH) {
    throw new Error(`Invalid IV length — expected ${IV_LENGTH} bytes`);
  }
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

/** Fields stripped from the stored plaintext config JSONB once encryption is in place. */
const SENSITIVE_SAP_FIELDS = ["password", "oauthClientSecret"] as const;
export type SensitiveSAPField = (typeof SENSITIVE_SAP_FIELDS)[number];

export interface EncryptedSAPCredentials {
  password?: string;
  oauthClientSecret?: string;
}

/** Split a SAPConfig into a redacted version (safe for DB config column) + encrypted credentials blob. */
export function encryptSAPCredentials<T extends Record<string, unknown>>(
  config: T
): { redactedConfig: T; credentialsCiphertext: string | null } {
  const credentials: EncryptedSAPCredentials = {};
  const redacted = { ...config };
  let hasCredentials = false;

  for (const field of SENSITIVE_SAP_FIELDS) {
    const value = (config as Record<string, unknown>)[field];
    if (typeof value === "string" && value.length > 0) {
      credentials[field] = value;
      (redacted as Record<string, unknown>)[field] = undefined;
      hasCredentials = true;
    }
  }

  if (!hasCredentials) {
    return { redactedConfig: redacted as T, credentialsCiphertext: null };
  }

  return {
    redactedConfig: redacted as T,
    credentialsCiphertext: encryptSecret(JSON.stringify(credentials)),
  };
}

/** Merge a DB row's plaintext config with decrypted credentials. Returns a fresh object. */
export function decryptSAPCredentials<T extends Record<string, unknown>>(
  config: T,
  credentialsCiphertext: string | null | undefined
): T {
  if (!credentialsCiphertext) return { ...config };
  try {
    const decrypted = JSON.parse(decryptSecret(credentialsCiphertext)) as EncryptedSAPCredentials;
    return { ...config, ...decrypted };
  } catch (err) {
    // Do not leak the ciphertext, just surface that decryption failed.
    throw new Error(
      `Failed to decrypt connector credentials: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

/** Constant-time comparison helper — exported so callers don't reach for `===` on tokens. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
