import QRCode from "qrcode";
import { storage } from "../storage";
import { eventBus } from "../events/event-bus";
import type { QRCode as QRCodeType, InsertQRCode } from "@shared/schema";

export class QRService {
  async getQRCode(id: string): Promise<QRCodeType | undefined> {
    return storage.getQRCode(id);
  }

  async getQRCodeByProductId(productId: string): Promise<QRCodeType | undefined> {
    return storage.getQRCodeByProductId(productId);
  }

  async generateQRCode(productId: string, options?: { size?: number; format?: string }): Promise<QRCodeType> {
    const size = options?.size || 256;
    const format = options?.format || "png";
    
    const scanUrl = `${process.env.REPLIT_DEV_DOMAIN || "http://localhost:5000"}/product/${productId}`;
    
    const qrImageUrl = await QRCode.toDataURL(scanUrl, {
      width: size,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    const qrCodeData: InsertQRCode = {
      productId,
      qrData: scanUrl,
      qrImageUrl,
      format,
      size,
    };

    const qrCode = await storage.createQRCode(qrCodeData);

    await storage.updateProduct(productId, { qrCodeData: qrImageUrl });

    await eventBus.publish({
      type: "com.photonictag.qr.generated",
      source: "qr-service",
      data: { qrCodeId: qrCode.id, productId, scanUrl },
      subject: productId,
    });

    return qrCode;
  }

  async recordScan(qrCodeId: string): Promise<QRCodeType | undefined> {
    return storage.incrementQRScanCount(qrCodeId);
  }

  async regenerateQRCode(productId: string): Promise<QRCodeType> {
    return this.generateQRCode(productId);
  }
}

export const qrService = new QRService();
