import { storage } from "../storage";
import type { AuditLog, InsertAuditLog, AuditAction } from "@shared/schema";

export class AuditService {
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
    }
  ): Promise<AuditLog> {
    const logData: InsertAuditLog = {
      userId: options?.userId || null,
      action,
      entityType,
      entityId: entityId || null,
      oldValue: options?.oldValue || null,
      newValue: options?.newValue || null,
      ipAddress: options?.ipAddress || null,
      userAgent: options?.userAgent || null,
      correlationId: options?.correlationId || null,
    };

    return storage.createAuditLog(logData);
  }

  async getAuditLogs(entityType?: string, entityId?: string): Promise<AuditLog[]> {
    return storage.getAuditLogs(entityType, entityId);
  }

  async logCreate(entityType: string, entityId: string, newValue: Record<string, unknown>, options?: { userId?: string; correlationId?: string }): Promise<AuditLog> {
    return this.log("create", entityType, entityId, { ...options, newValue });
  }

  async logUpdate(entityType: string, entityId: string, oldValue: Record<string, unknown>, newValue: Record<string, unknown>, options?: { userId?: string; correlationId?: string }): Promise<AuditLog> {
    return this.log("update", entityType, entityId, { ...options, oldValue, newValue });
  }

  async logDelete(entityType: string, entityId: string, oldValue: Record<string, unknown>, options?: { userId?: string; correlationId?: string }): Promise<AuditLog> {
    return this.log("delete", entityType, entityId, { ...options, oldValue });
  }

  async logView(entityType: string, entityId: string, options?: { userId?: string; correlationId?: string }): Promise<AuditLog> {
    return this.log("view", entityType, entityId, options);
  }
}

export const auditService = new AuditService();
