import { eventBus } from "./event-bus";
import { qrService } from "../services/qr-service";
import { identityService } from "../services/identity-service";
import { traceService } from "../services/trace-service";
import { logger } from "../logger";
import type { Product, CloudEvent } from "@shared/schema";

export function setupEventHandlers(): void {
  logger.info("[EventHandlers] Setting up event-driven workflows...");

  eventBus.subscribe<Product>(
    "com.photonictag.product.created",
    async (event: CloudEvent<Product>) => {
      const product = event.data;
      logger.info(
        { productId: product.id, productName: product.productName },
        "[EventHandler] ProductCreated: Generating QR and Identity",
      );

      try {
        await qrService.generateQRCode(product.id);
        logger.info({ productId: product.id }, "[EventHandler] QR code generated");
      } catch (error) {
        logger.error({ err: error, productId: product.id }, "[EventHandler] Failed to generate QR");
      }

      try {
        await identityService.createIdentity(product.id, {
          batchId: product.batchNumber,
        });
        logger.info({ productId: product.id }, "[EventHandler] Identity created");
      } catch (error) {
        logger.error({ err: error, productId: product.id }, "[EventHandler] Failed to create identity");
      }

      try {
        await traceService.recordManufactured(product.id, product.manufacturer);
        logger.info({ productId: product.id }, "[EventHandler] Initial trace event recorded");
      } catch (error) {
        logger.error({ err: error, productId: product.id }, "[EventHandler] Failed to record trace event");
      }
    }
  );

  eventBus.subscribe<Product>(
    "com.photonictag.product.updated",
    async (event: CloudEvent<Product>) => {
      const product = event.data;
      logger.info({ productName: product.productName }, "[EventHandler] ProductUpdated");
    }
  );

  eventBus.subscribe<{ qrCodeId: string; productId: string; scanUrl: string }>(
    "com.photonictag.qr.generated",
    async (event) => {
      logger.info({ scanUrl: event.data.scanUrl }, "[EventHandler] QRGenerated");
    }
  );

  eventBus.subscribe<unknown>(
    "com.photonictag.identity.assigned",
    async (event) => {
      logger.info({ productId: event.subject }, "[EventHandler] IdentityAssigned");
    }
  );

  eventBus.subscribe<unknown>(
    "com.photonictag.trace.recorded",
    async (event) => {
      logger.info({ productId: event.subject }, "[EventHandler] TraceRecorded");
    }
  );

  eventBus.subscribe<{ insightId: string; productId: string; insightType: string }>(
    "com.photonictag.ai.insights_generated",
    async (event) => {
      logger.info(
        { insightType: event.data.insightType, productId: event.data.productId },
        "[EventHandler] AIInsightsGenerated",
      );
    }
  );

  logger.info("[EventHandlers] Event-driven workflows initialized");
}
