import { storage } from "../storage";
import { eventBus } from "../events/event-bus";
import type { Identity, InsertIdentity } from "@shared/schema";
import { randomUUID } from "crypto";

export class IdentityService {
  async getIdentity(id: string): Promise<Identity | undefined> {
    return storage.getIdentity(id);
  }

  async getIdentityByProductId(productId: string): Promise<Identity | undefined> {
    return storage.getIdentityByProductId(productId);
  }

  async getIdentityBySerialNumber(serialNumber: string): Promise<Identity | undefined> {
    return storage.getIdentityBySerialNumber(serialNumber);
  }

  async createIdentity(productId: string, options?: { gtin?: string; batchId?: string }): Promise<Identity> {
    const serialNumber = this.generateSerialNumber();
    
    const identityData: InsertIdentity = {
      productId,
      serialNumber,
      gtin: options?.gtin || null,
      batchId: options?.batchId || null,
      identityType: "product",
      metadata: {},
      isValid: true,
    };

    const identity = await storage.createIdentity(identityData);

    await eventBus.publish({
      type: "com.photonictag.identity.assigned",
      source: "identity-service",
      data: identity,
      subject: productId,
    });

    return identity;
  }

  async validateIdentity(serialNumber: string): Promise<{ valid: boolean; identity?: Identity }> {
    const identity = await storage.getIdentityBySerialNumber(serialNumber);
    
    if (!identity) {
      return { valid: false };
    }

    return { valid: identity.isValid, identity };
  }

  private generateSerialNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = randomUUID().split("-")[0].toUpperCase();
    return `PHT-${timestamp}-${random}`;
  }
}

export const identityService = new IdentityService();
