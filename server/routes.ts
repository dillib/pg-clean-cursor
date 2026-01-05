import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { insertProductSchema } from "@shared/schema";
import { productService } from "./services/product-service";
import { qrService } from "./services/qr-service";
import { identityService } from "./services/identity-service";
import { traceService } from "./services/trace-service";
import { aiService } from "./services/ai-service";
import { auditService } from "./services/audit-service";
import { storage } from "./storage";
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ==========================================
  // PRODUCT ENDPOINTS
  // ==========================================
  
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const products = await productService.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const product = await productService.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req: Request, res: Response) => {
    try {
      const parsed = insertProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid product data", details: parsed.error.issues });
      }

      const product = await productService.createProduct(parsed.data);
      
      await auditService.logCreate("product", product.id, product as unknown as Record<string, unknown>);
      
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const existingProduct = await productService.getProduct(req.params.id);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      const parsed = insertProductSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid product data", details: parsed.error.issues });
      }

      const product = await productService.updateProduct(req.params.id, parsed.data);
      
      if (product) {
        await auditService.logUpdate(
          "product", 
          product.id, 
          existingProduct as unknown as Record<string, unknown>,
          product as unknown as Record<string, unknown>
        );
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const existingProduct = await productService.getProduct(req.params.id);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      const deleted = await productService.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      await auditService.logDelete("product", req.params.id, existingProduct as unknown as Record<string, unknown>);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // ==========================================
  // IDENTITY ENDPOINTS
  // ==========================================
  
  app.get("/api/identities/:id", async (req: Request, res: Response) => {
    try {
      const identity = await identityService.getIdentity(req.params.id);
      if (!identity) {
        return res.status(404).json({ error: "Identity not found" });
      }
      res.json(identity);
    } catch (error) {
      console.error("Error fetching identity:", error);
      res.status(500).json({ error: "Failed to fetch identity" });
    }
  });

  app.get("/api/products/:productId/identity", async (req: Request, res: Response) => {
    try {
      const identity = await identityService.getIdentityByProductId(req.params.productId);
      if (!identity) {
        return res.status(404).json({ error: "Identity not found for this product" });
      }
      res.json(identity);
    } catch (error) {
      console.error("Error fetching identity:", error);
      res.status(500).json({ error: "Failed to fetch identity" });
    }
  });

  app.post("/api/identities/validate", async (req: Request, res: Response) => {
    try {
      const { serialNumber } = req.body;
      const result = await identityService.validateIdentity(serialNumber);
      res.json(result);
    } catch (error) {
      console.error("Error validating identity:", error);
      res.status(500).json({ error: "Failed to validate identity" });
    }
  });

  // ==========================================
  // QR CODE ENDPOINTS
  // ==========================================
  
  app.get("/api/products/:productId/qr", async (req: Request, res: Response) => {
    try {
      const qrCode = await qrService.getQRCodeByProductId(req.params.productId);
      if (!qrCode) {
        return res.status(404).json({ error: "QR code not found for this product" });
      }
      res.json(qrCode);
    } catch (error) {
      console.error("Error fetching QR code:", error);
      res.status(500).json({ error: "Failed to fetch QR code" });
    }
  });

  app.post("/api/products/:productId/qr/regenerate", async (req: Request, res: Response) => {
    try {
      const product = await productService.getProduct(req.params.productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      const qrCode = await qrService.regenerateQRCode(req.params.productId);
      res.json(qrCode);
    } catch (error) {
      console.error("Error regenerating QR code:", error);
      res.status(500).json({ error: "Failed to regenerate QR code" });
    }
  });

  app.post("/api/qr/:id/scan", async (req: Request, res: Response) => {
    try {
      const qrCode = await qrService.recordScan(req.params.id);
      if (!qrCode) {
        return res.status(404).json({ error: "QR code not found" });
      }
      res.json(qrCode);
    } catch (error) {
      console.error("Error recording scan:", error);
      res.status(500).json({ error: "Failed to record scan" });
    }
  });

  // ==========================================
  // TRACE EVENT ENDPOINTS
  // ==========================================
  
  app.get("/api/products/:productId/trace", async (req: Request, res: Response) => {
    try {
      const events = await traceService.getProductTimeline(req.params.productId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching trace events:", error);
      res.status(500).json({ error: "Failed to fetch trace events" });
    }
  });

  app.post("/api/products/:productId/trace", async (req: Request, res: Response) => {
    try {
      const { eventType, actor, location, description, metadata } = req.body;
      
      const event = await traceService.recordEvent(
        req.params.productId,
        eventType,
        actor,
        { location, description, metadata }
      );
      
      res.status(201).json(event);
    } catch (error) {
      console.error("Error recording trace event:", error);
      res.status(500).json({ error: "Failed to record trace event" });
    }
  });

  // ==========================================
  // AI ENDPOINTS
  // ==========================================
  
  app.get("/api/products/:productId/insights", async (req: Request, res: Response) => {
    try {
      const insights = await aiService.getInsightsByProductId(req.params.productId);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ error: "Failed to fetch insights" });
    }
  });

  app.post("/api/ai/summarize", async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const result = await aiService.generateSummary(product);
      res.json(result);
    } catch (error) {
      console.error("Error generating summary:", error);
      res.status(500).json({ error: "Failed to generate summary" });
    }
  });

  app.post("/api/ai/sustainability", async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const result = await aiService.generateSustainabilityInsight(product);
      res.json(result);
    } catch (error) {
      console.error("Error generating sustainability insights:", error);
      res.status(500).json({ error: "Failed to generate sustainability insights" });
    }
  });

  app.post("/api/ai/repair-summary", async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const result = await aiService.generateRepairSummary(product);
      res.json(result);
    } catch (error) {
      console.error("Error generating repair summary:", error);
      res.status(500).json({ error: "Failed to generate repair summary" });
    }
  });

  // ==========================================
  // AUDIT LOG ENDPOINTS
  // ==========================================
  
  app.get("/api/audit-logs", async (req: Request, res: Response) => {
    try {
      const { entityType, entityId } = req.query;
      const logs = await auditService.getAuditLogs(
        entityType as string | undefined,
        entityId as string | undefined
      );
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  return httpServer;
}
