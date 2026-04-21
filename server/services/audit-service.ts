import { storage } from "../storage";
import type { AuditLog, InsertAuditLog, AuditAction } from "@shared/schema";
import { computeAuditChainHash, fingerprintRecord, requestTimestamp } from "./provenance-service";

export class AuditService {
  /**
   * Cached tip of the chain — avoids a DB query on every write.
   * Initialized lazily; reset on process restart (safe — the DB is the source of truth).
   */
  private chainTip: string | null | undefined = undefined;

  private async getChainTip(): Promise<string | null> {
    if (this.chainTip !== undefined) return this.chainTip;
    const logs = await storage.getAuditLogs();
    const latest = logs[0]; // ordered desc by timestamp
    const tip: string | null = latest?.chainHash ?? null;
    this.chainTip = tip;
    return tip;
  }

  async log(
    action: AuditAction,
    entityType: string,
    entityId?: string,
    options?: {
      userId?: string;
      oldValue?: Record<string, unknown>;
      newValue?: Record<string, unknown>;
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
      dataSource?: "human" | "sap_sync" | "ai_accepted" | "system";
    }
  ): Promise<AuditLog> {
    const timestamp = new Date().toISOString();
    const previousHash = await this.getChainTip();

    const chainHash = computeAuditChainHash({
      previousHash,
      timestamp,
      action,
      entityType,
      entityId: entityId ?? null,
      newValue: options?.newValue ?? null,
    });

    const recordFingerprint = options?.newValue
      ? fingerprintRecord(options.newValue)
      : null;

    // Request TSA timestamp for regulated entities (products, trace events)
    const regulatedEntities = ["product", "trace_event", "dpp_regional_extension"];
    const { tsaToken, tsaUrl } = regulatedEntities.includes(entityType)
      ? await requestTimestamp(recordFingerprint ?? chainHash)
      : { tsaToken: null, tsaUrl: null };

    const logData: InsertAuditLog = {
      userId: options?.userId ?? null,
      action,
      entityType,
      entityId: entityId ?? null,
      oldValue: options?.oldValue ?? null,
      newValue: options?.newValue ?? null,
      ipAddress: options?.ipAddress ?? null,
      userAgent: options?.userAgent ?? null,
      correlationId: options?.correlationId ?? null,
      // Provenance fields
      chainHash,
      previousChainHash: previousHash,
      recordFingerprint,
      tsaToken,
      tsaUrl,
      dataSource: options?.dataSource ?? "system",
    } as any;

    const log = await storage.createAuditLog(logData);
    this.chainTip = chainHash;
    return log;
  }

  async getAuditLogs(entityType?: string, entityId?: string): Promise<AuditLog[]> {
    return storage.getAuditLogs(entityType, entityId);
  }

  async logCreate(
    entityType: string,
    entityId: string,
    newValue: Record<string, unknown>,
    options?: { userId?: string; correlationId?: string; dataSource?: "human" | "sap_sync" | "ai_accepted" | "system" }
  ): Promise<AuditLog> {
    return this.log("create", entityType, entityId, { ...options, newValue });
  }

  async logUpdate(
    entityType: string,
    entityId: string,
    oldValue: Record<string, unknown>,
    newValue: Record<string, unknown>,
    options?: { userId?: string; correlationId?: string; dataSource?: "human" | "sap_sync" | "ai_accepted" | "system" }
  ): Promise<AuditLog> {
    return this.log("update", entityType, entityId, { ...options, oldValue, newValue });
  }

  async logDelete(
    entityType: string,
    entityId: string,
    oldValue: Record<string, unknown>,
    options?: { userId?: string; correlationId?: string }
  ): Promise<AuditLog> {
    return this.log("delete", entityType, entityId, { ...options, oldValue });
  }

  async logView(
    entityType: string,
    entityId: string,
    options?: { userId?: string; correlationId?: string }
  ): Promise<AuditLog> {
    return this.log("view", entityType, entityId, options);
  }
}

export const auditService = new AuditService();
