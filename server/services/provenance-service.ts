/**
 * Provenance Service — cryptographic integrity for DPP records.
 *
 * Two complementary mechanisms:
 *
 * 1. AUDIT HASH CHAIN
 *    Each audit log entry includes a SHA-256 hash of:
 *      (previousHash | timestamp | action | entityType | entityId | payload)
 *    This creates an append-only chain where any tampering of a record
 *    breaks the chain from that point forward. Verifiable without a TSA.
 *
 * 2. eIDAS-COMPATIBLE TIMESTAMPS (stub → production path)
 *    For regulated disclosures the hash is submitted to a RFC 3161
 *    Timestamp Authority. The TSA response (token) is stored alongside
 *    the record and can be independently verified.
 *
 *    Currently: SHA-256 commitment only (no external TSA call).
 *    To activate: set TSA_URL and optionally TSA_POLICY_OID in env.
 *    Compatible TSAs: DigiCert, GlobalSign, HARICA (eIDAS-qualified).
 *
 * 3. W3C Verifiable Credentials (planned)
 *    The `issueVerifiableCredential()` stub will wrap a DPP record in a
 *    W3C VC signed with the manufacturer's DID. Fields noted with TODO below.
 */
import { createHash, createHmac } from "crypto";
import type { AuditLog, InsertAuditLog } from "@shared/schema";

// HMAC key for the audit chain — must be kept secret and stable.
// Rotate by re-hashing the entire chain (offline process).
function getChainKey(): string {
  return process.env.AUDIT_CHAIN_HMAC_KEY ?? "dev-insecure-key-change-in-prod";
}

/**
 * Computes the chain hash for a new audit log entry.
 *
 *   hash = HMAC-SHA256(
 *     key    = AUDIT_CHAIN_HMAC_KEY,
 *     message = previousHash || timestamp || action || entityType || entityId || payloadHash
 *   )
 *
 * The HMAC is keyed so the chain can only be extended by parties who hold
 * the key — an attacker who gains read access to the DB cannot forge entries.
 */
export function computeAuditChainHash(params: {
  previousHash: string | null;
  timestamp: string;
  action: string;
  entityType: string;
  entityId: string | null;
  newValue: Record<string, unknown> | null;
}): string {
  const payloadHash = params.newValue
    ? createHash("sha256").update(JSON.stringify(params.newValue)).digest("hex")
    : "null";

  const message = [
    params.previousHash ?? "genesis",
    params.timestamp,
    params.action,
    params.entityType,
    params.entityId ?? "null",
    payloadHash,
  ].join("|");

  return createHmac("sha256", getChainKey()).update(message).digest("hex");
}

/**
 * Verify an audit log entry against its declared chain hash.
 * Returns true if the entry is intact; false if tampered.
 */
export function verifyAuditEntry(entry: AuditLog & { chainHash?: string; previousChainHash?: string }): boolean {
  if (!entry.chainHash) return false; // legacy entry without provenance

  const expected = computeAuditChainHash({
    previousHash: entry.previousChainHash ?? null,
    timestamp: entry.timestamp.toISOString(),
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId ?? null,
    newValue: (entry.newValue as Record<string, unknown>) ?? null,
  });

  return expected === entry.chainHash;
}

/**
 * Returns a canonical SHA-256 fingerprint of a DPP record payload.
 * Store this alongside any regulated field to prove the value at a point in time.
 */
export function fingerprintRecord(record: Record<string, unknown>): string {
  const canonical = JSON.stringify(record, Object.keys(record).sort());
  return createHash("sha256").update(canonical).digest("hex");
}

/**
 * RFC 3161 Timestamp Authority stub.
 *
 * To activate real eIDAS-qualified timestamps:
 *   1. Set TSA_URL (e.g. http://timestamp.digicert.com or http://timestamp.harica.gr)
 *   2. Optionally set TSA_POLICY_OID for a specific trust policy
 *   3. The returned `tsaToken` (DER-encoded) should be stored in the record
 *
 * Verification:
 *   openssl ts -verify -in <token.tsr> -data <record.json> -CAfile <tsa-cert.pem>
 */
export async function requestTimestamp(dataHash: string): Promise<{
  timestamp: string;
  tsaToken: string | null;
  tsaUrl: string | null;
}> {
  const now = new Date().toISOString();
  const tsaUrl = process.env.TSA_URL ?? null;

  if (!tsaUrl) {
    // No TSA configured — return a local commitment (not eIDAS-qualified)
    return { timestamp: now, tsaToken: null, tsaUrl: null };
  }

  // TODO: implement RFC 3161 TimeStampReq/TimeStampResp over HTTP
  // const tsq = buildTimeStampRequest(dataHash, process.env.TSA_POLICY_OID);
  // const resp = await fetch(tsaUrl, { method: "POST", body: tsq, headers: { "Content-Type": "application/timestamp-query" } });
  // const token = Buffer.from(await resp.arrayBuffer()).toString("base64");
  // return { timestamp: now, tsaToken: token, tsaUrl };

  console.warn("[Provenance] TSA_URL set but RFC 3161 client not yet implemented");
  return { timestamp: now, tsaToken: null, tsaUrl };
}

/**
 * W3C Verifiable Credential stub.
 * Will wrap a DPP product record as a VC signed with the issuer's DID.
 * Framework: @digitalbazaar/vc + Ed25519Signature2020
 */
export async function issueVerifiableCredential(_productId: string): Promise<null> {
  // TODO: implement W3C VC issuance
  // 1. Load product + regional extensions
  // 2. Build VC document (type: DigitalProductPassport)
  // 3. Sign with Ed25519 key stored in DID_PRIVATE_KEY env
  // 4. Return VC JSON-LD document
  console.warn("[Provenance] W3C VC issuance not yet implemented");
  return null;
}
