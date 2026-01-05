import { eventBus } from "./event-bus";
import { qrService } from "../services/qr-service";
import { identityService } from "../services/identity-service";
import { traceService } from "../services/trace-service";
import type { Product, CloudEvent } from "@shared/schema";

export function setupEventHandlers(): void {
  console.log("[EventHandlers] Setting up event-driven workflows...");

  eventBus.subscribe<Product>(
    "com.photonictag.product.created",
    async (event: CloudEvent<Product>) => {
      const product = event.data;
      console.log(`[EventHandler] ProductCreated: Generating QR and Identity for ${product.productName}`);

      try {
        await qrService.generateQRCode(product.id);
        console.log(`[EventHandler] QR code generated for product ${product.id}`);
      } catch (error) {
        console.error(`[EventHandler] Failed to generate QR for product ${product.id}:`, error);
      }

      try {
        await identityService.createIdentity(product.id, {
          batchId: product.batchNumber,
        });
        console.log(`[EventHandler] Identity created for product ${product.id}`);
      } catch (error) {
        console.error(`[EventHandler] Failed to create identity for product ${product.id}:`, error);
      }

      try {
        await traceService.recordManufactured(product.id, product.manufacturer);
        console.log(`[EventHandler] Initial trace event recorded for product ${product.id}`);
      } catch (error) {
        console.error(`[EventHandler] Failed to record trace event for product ${product.id}:`, error);
      }
    }
  );

  eventBus.subscribe<Product>(
    "com.photonictag.product.updated",
    async (event: CloudEvent<Product>) => {
      const product = event.data;
      console.log(`[EventHandler] ProductUpdated: ${product.productName}`);
    }
  );

  eventBus.subscribe<{ qrCodeId: string; productId: string; scanUrl: string }>(
    "com.photonictag.qr.generated",
    async (event) => {
      console.log(`[EventHandler] QRGenerated: ${event.data.scanUrl}`);
    }
  );

  eventBus.subscribe<unknown>(
    "com.photonictag.identity.assigned",
    async (event) => {
      console.log(`[EventHandler] IdentityAssigned for product ${event.subject}`);
    }
  );

  eventBus.subscribe<unknown>(
    "com.photonictag.trace.recorded",
    async (event) => {
      console.log(`[EventHandler] TraceRecorded for product ${event.subject}`);
    }
  );

  eventBus.subscribe<{ insightId: string; productId: string; insightType: string }>(
    "com.photonictag.ai.insights_generated",
    async (event) => {
      console.log(`[EventHandler] AIInsightsGenerated: ${event.data.insightType} for product ${event.data.productId}`);
    }
  );

  console.log("[EventHandlers] Event-driven workflows initialized");
}
