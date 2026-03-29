import type { Express, Request, Response } from "express";
import { type Server } from "http";
import OpenAI from "openai";
import { insertProductSchema, insertIoTDeviceSchema, insertEnterpriseConnectorSchema, insertLeadSchema, insertPartnerSchema, insertDemoConfigSchema, insertDemoBookingSchema } from "@shared/schema";
import { productService } from "./services/product-service";
import { qrService } from "./services/qr-service";
import { sendBookingConfirmation, sendTeamNotification } from "./services/email";
import { identityService } from "./services/identity-service";
import { traceService } from "./services/trace-service";
import { aiService } from "./services/ai-service";
import { auditService } from "./services/audit-service";
import { iotService } from "./services/iot-service";
import { seedDemoData } from "./seed-demo-data";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { storage } from "./storage";
import sapRoutes from "./routes/sap-routes";
import internalRoutes from "./routes/internal-routes";
import exportRoutes from "./routes/export-routes";
import bcrypt from "bcryptjs";
import type { RequestHandler } from "express";

const isAuthenticatedOrTeam: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  if (user && req.isAuthenticated?.() && user.expires_at) {
    const now = Math.floor(Date.now() / 1000);
    if (now <= user.expires_at) {
      return next();
    }
  }

  const partnerId = (req.session as any)?.partnerId;
  if (partnerId) {
    return next();
  }

  return res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await setupAuth(app);
  registerAuthRoutes(app);
  
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
      
      await qrService.generateQRCode(product.id);
      
      await identityService.createIdentity(product.id);
      
      await traceService.recordEvent(product.id, "manufactured", product.manufacturer, {
        description: `Product ${product.productName} registered in PhotonicTag`,
        location: { name: product.manufacturer },
      });
      
      await auditService.logCreate("product", product.id, product as unknown as Record<string, unknown>);
      
      const updatedProduct = await productService.getProduct(product.id);
      
      res.status(201).json(updatedProduct);
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
      
      const existingQR = await qrService.getQRCodeByProductId(req.params.productId);
      const qrCode = await qrService.regenerateQRCode(req.params.productId);
      
      await auditService.logUpdate(
        "qr_code",
        qrCode.id,
        existingQR as unknown as Record<string, unknown>,
        qrCode as unknown as Record<string, unknown>
      );
      
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
      
      await auditService.logCreate("trace_event", event.id, event as unknown as Record<string, unknown>);
      
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
      const product = await productService.getProduct(productId);
      
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
      const product = await productService.getProduct(productId);
      
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
      const product = await productService.getProduct(productId);
      
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

  app.post("/api/ai/circularity", async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const product = await productService.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const result = await aiService.generateCircularityScore(product);
      res.json(result);
    } catch (error) {
      console.error("Error generating circularity score:", error);
      res.status(500).json({ error: "Failed to generate circularity score" });
    }
  });

  app.post("/api/ai/risk-assessment", async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const product = await productService.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const result = await aiService.generateRiskAssessment(product);
      res.json(result);
    } catch (error) {
      console.error("Error generating risk assessment:", error);
      res.status(500).json({ error: "Failed to generate risk assessment" });
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

  // ==========================================
  // IOT DEVICE ENDPOINTS
  // ==========================================

  app.get("/api/iot/devices", async (req: Request, res: Response) => {
    try {
      const { productId } = req.query;
      let devices;
      if (productId) {
        devices = await iotService.getDevicesByProductId(productId as string);
      } else {
        devices = await iotService.getAllDevices();
      }
      res.json(devices);
    } catch (error) {
      console.error("Error fetching IoT devices:", error);
      res.status(500).json({ error: "Failed to fetch IoT devices" });
    }
  });

  app.get("/api/iot/devices/:id", async (req: Request, res: Response) => {
    try {
      const device = await iotService.getDevice(req.params.id);
      if (!device) {
        return res.status(404).json({ error: "IoT device not found" });
      }
      res.json(device);
    } catch (error) {
      console.error("Error fetching IoT device:", error);
      res.status(500).json({ error: "Failed to fetch IoT device" });
    }
  });

  app.post("/api/iot/devices", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const parsed = insertIoTDeviceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid IoT device data", details: parsed.error.issues });
      }

      const device = await iotService.registerDevice(parsed.data);
      
      await auditService.logCreate("iot_device", device.id, device as unknown as Record<string, unknown>);
      
      res.status(201).json(device);
    } catch (error) {
      console.error("Error registering IoT device:", error);
      res.status(500).json({ error: "Failed to register IoT device" });
    }
  });

  app.patch("/api/iot/devices/:id/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!status || !["active", "inactive", "lost", "damaged"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const device = await iotService.updateDeviceStatus(req.params.id, status);
      if (!device) {
        return res.status(404).json({ error: "IoT device not found" });
      }
      res.json(device);
    } catch (error) {
      console.error("Error updating IoT device status:", error);
      res.status(500).json({ error: "Failed to update IoT device status" });
    }
  });

  app.post("/api/iot/devices/:deviceId/reading", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { deviceId } = req.params;
      const reading = req.body;

      if (!reading.timestamp) {
        reading.timestamp = new Date().toISOString();
      }

      const device = await iotService.recordSensorReading(deviceId, reading);
      if (!device) {
        return res.status(404).json({ error: "IoT device not found" });
      }
      res.json(device);
    } catch (error) {
      console.error("Error recording sensor reading:", error);
      res.status(500).json({ error: "Failed to record sensor reading" });
    }
  });

  app.post("/api/iot/scan/:deviceId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { deviceId } = req.params;
      const { location } = req.body;

      const result = await iotService.scanDevice(deviceId, location);
      if (!result) {
        return res.status(404).json({ error: "IoT device not found" });
      }
      res.json(result);
    } catch (error) {
      console.error("Error scanning IoT device:", error);
      res.status(500).json({ error: "Failed to scan IoT device" });
    }
  });

  app.delete("/api/iot/devices/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const deleted = await iotService.deleteDevice(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "IoT device not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting IoT device:", error);
      res.status(500).json({ error: "Failed to delete IoT device" });
    }
  });

  // ==========================================
  // DPP REGIONAL EXTENSIONS
  // ==========================================

  app.get("/api/products/:productId/regional-extensions", async (req: Request, res: Response) => {
    try {
      const extensions = await storage.getRegionalExtensionsByProductId(req.params.productId);
      res.json(extensions);
    } catch (error) {
      console.error("Error fetching regional extensions:", error);
      res.status(500).json({ error: "Failed to fetch regional extensions" });
    }
  });

  app.get("/api/products/:productId/regional-extensions/:regionCode", async (req: Request, res: Response) => {
    try {
      const { productId, regionCode } = req.params;
      const extension = await storage.getRegionalExtensionByProductAndRegion(
        productId, 
        regionCode as any
      );
      if (!extension) {
        return res.status(404).json({ error: "Regional extension not found" });
      }
      res.json(extension);
    } catch (error) {
      console.error("Error fetching regional extension:", error);
      res.status(500).json({ error: "Failed to fetch regional extension" });
    }
  });

  app.post("/api/products/:productId/regional-extensions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const extension = await storage.createRegionalExtension({
        ...req.body,
        productId,
      });
      res.status(201).json(extension);
    } catch (error) {
      console.error("Error creating regional extension:", error);
      res.status(500).json({ error: "Failed to create regional extension" });
    }
  });

  app.patch("/api/regional-extensions/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const extension = await storage.updateRegionalExtension(req.params.id, req.body);
      if (!extension) {
        return res.status(404).json({ error: "Regional extension not found" });
      }
      res.json(extension);
    } catch (error) {
      console.error("Error updating regional extension:", error);
      res.status(500).json({ error: "Failed to update regional extension" });
    }
  });

  app.delete("/api/regional-extensions/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteRegionalExtension(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Regional extension not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting regional extension:", error);
      res.status(500).json({ error: "Failed to delete regional extension" });
    }
  });

  // ==========================================
  // ENTERPRISE INTEGRATIONS ENDPOINTS
  // ==========================================

  app.get("/api/integrations/connectors", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const connectors = await storage.getAllEnterpriseConnectors();
      res.json(connectors);
    } catch (error) {
      console.error("Error fetching connectors:", error);
      res.status(500).json({ error: "Failed to fetch connectors" });
    }
  });

  app.get("/api/integrations/connectors/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const connector = await storage.getEnterpriseConnector(req.params.id);
      if (!connector) {
        return res.status(404).json({ error: "Connector not found" });
      }
      res.json(connector);
    } catch (error) {
      console.error("Error fetching connector:", error);
      res.status(500).json({ error: "Failed to fetch connector" });
    }
  });

  app.post("/api/integrations/connectors", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const parsed = insertEnterpriseConnectorSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid connector data", details: parsed.error.issues });
      }
      const connector = await storage.createEnterpriseConnector(parsed.data);
      res.status(201).json(connector);
    } catch (error) {
      console.error("Error creating connector:", error);
      res.status(500).json({ error: "Failed to create connector" });
    }
  });

  app.patch("/api/integrations/connectors/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const connector = await storage.updateEnterpriseConnector(req.params.id, req.body);
      if (!connector) {
        return res.status(404).json({ error: "Connector not found" });
      }
      res.json(connector);
    } catch (error) {
      console.error("Error updating connector:", error);
      res.status(500).json({ error: "Failed to update connector" });
    }
  });

  app.delete("/api/integrations/connectors/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteEnterpriseConnector(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Connector not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting connector:", error);
      res.status(500).json({ error: "Failed to delete connector" });
    }
  });

  app.post("/api/integrations/connectors/:id/test", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const connector = await storage.getEnterpriseConnector(req.params.id);
      if (!connector) {
        return res.status(404).json({ error: "Connector not found" });
      }
      
      // Simulate connection test (in production, this would actually test the SAP connection)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await storage.updateEnterpriseConnector(req.params.id, { status: "active" as const });
      res.json({ success: true, message: "Connection successful" });
    } catch (error) {
      console.error("Error testing connector:", error);
      res.status(500).json({ error: "Connection test failed" });
    }
  });

  app.post("/api/integrations/connectors/:id/sync", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const connector = await storage.getEnterpriseConnector(req.params.id);
      if (!connector) {
        return res.status(404).json({ error: "Connector not found" });
      }
      
      // Create sync log
      const syncLog = await storage.createIntegrationSyncLog({
        connectorId: connector.id,
        syncType: "manual",
        status: "running",
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 0,
        startedAt: new Date(),
      });
      
      // Simulate sync (in production, this would pull data from SAP)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update sync log as completed
      await storage.updateIntegrationSyncLog(syncLog.id, {
        status: "completed",
        recordsProcessed: 10,
        recordsCreated: 5,
        recordsUpdated: 5,
        completedAt: new Date(),
      });
      
      // Update connector with last sync info
      await storage.updateEnterpriseConnector(connector.id, {
        lastSyncAt: new Date(),
        lastSyncStatus: "completed",
        productsSynced: (connector.productsSynced || 0) + 10,
      } as any);
      
      res.json({ success: true, message: "Sync completed", syncLogId: syncLog.id });
    } catch (error) {
      console.error("Error syncing connector:", error);
      res.status(500).json({ error: "Sync failed" });
    }
  });

  app.get("/api/integrations/connectors/:id/logs", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const logs = await storage.getSyncLogsByConnectorId(req.params.id);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching sync logs:", error);
      res.status(500).json({ error: "Failed to fetch sync logs" });
    }
  });

  // ==========================================
  // ADMIN/DEMO ENDPOINTS
  // ==========================================
  
  app.post("/api/admin/seed-demo-data", async (req: Request, res: Response) => {
    try {
      await seedDemoData();
      res.json({ success: true, message: "Demo data seeded successfully" });
    } catch (error) {
      console.error("Error seeding demo data:", error);
      res.status(500).json({ error: "Failed to seed demo data" });
    }
  });

  // ==========================================
  // LEADS CRM ENDPOINTS
  // ==========================================

  // Public endpoint for contact form submissions
  app.post("/api/leads", async (req: Request, res: Response) => {
    try {
      const parsed = insertLeadSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid lead data", details: parsed.error.issues });
      }

      // Check for existing lead with same email
      const existingLead = await storage.getLeadByEmail(parsed.data.email);
      if (existingLead) {
        // Update existing lead instead of creating duplicate
        const updatedLead = await storage.updateLead(existingLead.id, {
          message: parsed.data.message,
          tierInterest: parsed.data.tierInterest,
          estimatedVolume: parsed.data.estimatedVolume,
          company: parsed.data.company,
          jobTitle: parsed.data.jobTitle,
          notes: existingLead.notes 
            ? `${existingLead.notes}\n\n---\nNew inquiry: ${parsed.data.message || 'No message'}` 
            : parsed.data.message,
        });
        return res.json({ success: true, lead: updatedLead, isExisting: true });
      }

      const lead = await storage.createLead(parsed.data);
      
      // Log the activity
      await storage.createLeadActivity({
        leadId: lead.id,
        activityType: "note_added",
        description: `Lead created from ${parsed.data.source || 'contact_form'}`,
      });

      res.status(201).json({ success: true, lead });
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ error: "Failed to submit form" });
    }
  });

  // Protected CRM endpoints (accessible by admin OR team auth)
  app.get("/api/leads", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const leads = await storage.getAllLeads();
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/stats", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const stats = await storage.getLeadStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching lead stats:", error);
      res.status(500).json({ error: "Failed to fetch lead stats" });
    }
  });

  app.get("/api/leads/:id", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ error: "Failed to fetch lead" });
    }
  });

  app.patch("/api/leads/:id", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      const updatedLead = await storage.updateLead(req.params.id, req.body);
      
      // Log status changes
      if (req.body.status && req.body.status !== lead.status) {
        await storage.createLeadActivity({
          leadId: lead.id,
          activityType: "status_changed",
          description: `Status changed from ${lead.status} to ${req.body.status}`,
          metadata: { oldStatus: lead.status, newStatus: req.body.status },
        });
      }

      res.json(updatedLead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteLead(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ error: "Failed to delete lead" });
    }
  });

  app.get("/api/leads/:id/activities", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const activities = await storage.getLeadActivities(req.params.id);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching lead activities:", error);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  app.post("/api/leads/:id/activities", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      const activity = await storage.createLeadActivity({
        leadId: req.params.id,
        ...req.body,
      });
      res.status(201).json(activity);
    } catch (error) {
      console.error("Error creating lead activity:", error);
      res.status(500).json({ error: "Failed to create activity" });
    }
  });

  // ==========================================
  // PARTNER AUTH ENDPOINTS
  // ==========================================

  app.post("/api/team/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const partner = await storage.getPartnerByEmail(email);
      if (!partner) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (partner.status !== "active") {
        return res.status(403).json({ error: "Account is inactive" });
      }

      const valid = await bcrypt.compare(password, partner.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      await storage.updatePartner(partner.id, { lastLoginAt: new Date() });

      (req.session as any).partnerId = partner.id;
      (req.session as any).partnerRole = partner.role;

      const { passwordHash, ...safePartner } = partner;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Login failed" });
        }
        res.json({ success: true, partner: safePartner });
      });
    } catch (error) {
      console.error("Partner login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/team/me", async (req: Request, res: Response) => {
    try {
      const partnerId = (req.session as any)?.partnerId;
      if (!partnerId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const partner = await storage.getPartner(partnerId);
      if (!partner || partner.status !== "active") {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { passwordHash, ...safePartner } = partner;
      res.json(safePartner);
    } catch (error) {
      console.error("Partner auth check error:", error);
      res.status(500).json({ error: "Auth check failed" });
    }
  });

  app.post("/api/team/logout", async (req: Request, res: Response) => {
    (req.session as any).partnerId = undefined;
    (req.session as any).partnerRole = undefined;
    res.json({ success: true });
  });

  // ==========================================
  // PARTNER MANAGEMENT ENDPOINTS (Protected - Admin Only)
  // ==========================================

  app.get("/api/partners", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const allPartners = await storage.getAllPartners();
      const safePartners = allPartners.map(({ passwordHash, ...p }) => p);
      res.json(safePartners);
    } catch (error) {
      console.error("Error fetching partners:", error);
      res.status(500).json({ error: "Failed to fetch partners" });
    }
  });

  app.post("/api/partners", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const parsed = insertPartnerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid partner data", details: parsed.error.issues });
      }

      const existing = await storage.getPartnerByEmail(parsed.data.email);
      if (existing) {
        return res.status(409).json({ error: "Partner with this email already exists" });
      }

      const passwordHash = await bcrypt.hash(parsed.data.password, 10);
      const { password, ...rest } = parsed.data;

      const partner = await storage.createPartner({
        ...rest,
        passwordHash,
      });

      const { passwordHash: _, ...safePartner } = partner;
      res.status(201).json(safePartner);
    } catch (error) {
      console.error("Error creating partner:", error);
      res.status(500).json({ error: "Failed to create partner" });
    }
  });

  app.patch("/api/partners/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const updates: any = { ...req.body };

      if (updates.password) {
        updates.passwordHash = await bcrypt.hash(updates.password, 10);
        delete updates.password;
      }

      const partner = await storage.updatePartner(req.params.id, updates);
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }

      const { passwordHash, ...safePartner } = partner;
      res.json(safePartner);
    } catch (error) {
      console.error("Error updating partner:", error);
      res.status(500).json({ error: "Failed to update partner" });
    }
  });

  app.delete("/api/partners/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const success = await storage.deletePartner(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Partner not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting partner:", error);
      res.status(500).json({ error: "Failed to delete partner" });
    }
  });

  // ==========================================
  // DEMO CONFIG ENDPOINTS (Protected - Admin Only)
  // ==========================================

  app.get("/api/demo-configs", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const configs = await storage.getAllDemoConfigs();
      res.json(configs);
    } catch (error) {
      console.error("Error fetching demo configs:", error);
      res.status(500).json({ error: "Failed to fetch demo configs" });
    }
  });

  app.post("/api/demo-configs", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const parsed = insertDemoConfigSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid demo config", details: parsed.error.issues });
      }

      const config = await storage.createDemoConfig(parsed.data);

      // Generate products using AI in the background
      generateDemoProducts(config.id, parsed.data.prompt, parsed.data.industry).catch(err => {
        console.error("Error generating demo products:", err);
      });

      res.status(201).json(config);
    } catch (error) {
      console.error("Error creating demo config:", error);
      res.status(500).json({ error: "Failed to create demo config" });
    }
  });

  app.delete("/api/demo-configs/:id", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteDemoConfig(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Demo config not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting demo config:", error);
      res.status(500).json({ error: "Failed to delete demo config" });
    }
  });

  app.patch("/api/demo-configs/:id", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const { demoEmail, demoPassword } = req.body;
      const updates: Record<string, any> = {};
      if (demoEmail !== undefined) updates.demoEmail = demoEmail;
      if (demoPassword !== undefined) updates.demoPassword = demoPassword;
      const config = await storage.updateDemoConfig(req.params.id, updates);
      if (!config) return res.status(404).json({ error: "Demo config not found" });
      res.json(config);
    } catch (error) {
      console.error("Error updating demo config:", error);
      res.status(500).json({ error: "Failed to update demo config" });
    }
  });

  // ==========================================
  // DEMO BOOKING ENDPOINTS
  // ==========================================

  // GET /api/demo-slots — returns available 30-min slots for the next 14 days (Mon–Fri 09:00–17:00 CET)
  // Optional query param: ?startDate=<ISO8601> to paginate/offset the window; defaults to now.
  app.get("/api/demo-slots", async (req: Request, res: Response) => {
    try {
      const now = new Date();
      let startDate = now;
      if (typeof req.query.startDate === "string" && req.query.startDate) {
        const parsed = new Date(req.query.startDate);
        if (!isNaN(parsed.getTime()) && parsed > now) {
          startDate = parsed;
        }
      }
      const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
      const bookedSlots = await storage.getBookedSlots(startDate, endDate);
      const slots = getAvailableSlots(startDate, bookedSlots);
      res.json({ slots: slots.map(s => s.toISOString()) });
    } catch (error) {
      console.error("Error fetching demo slots:", error);
      res.status(500).json({ error: "Failed to fetch demo slots" });
    }
  });

  // GET /api/demo-bookings — admin-only, lists all bookings
  app.get("/api/demo-bookings", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const bookings = await storage.getAllDemoBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching demo bookings:", error);
      res.status(500).json({ error: "Failed to fetch demo bookings" });
    }
  });

  // POST /api/demo-bookings — create a booking and upsert a lead
  app.post("/api/demo-bookings", async (req: Request, res: Response) => {
    try {
      const parsed = insertDemoBookingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid booking data", details: parsed.error.issues });
      }

      const slot = new Date(parsed.data.slotDatetime);

      // Validate slot is within Mon–Fri 09:00–16:30 CET window and next 14 days
      if (!isValidSlot(slot)) {
        return res.status(400).json({ error: "Invalid slot. Please choose a weekday slot between 9:00 and 17:00 CET within the next 14 days." });
      }

      // Verify the slot has not already been booked
      const slotEnd = new Date(slot.getTime() + 30 * 60 * 1000);
      const bookedSlots = await storage.getBookedSlots(slot, slotEnd);
      const isBooked = bookedSlots.some(s => s.getTime() === slot.getTime());
      if (isBooked) {
        return res.status(409).json({ error: "This slot is no longer available. Please choose another time." });
      }

      // Create the booking
      const booking = await storage.createDemoBooking(parsed.data);

      // Upsert a lead record with status demo_scheduled
      try {
        const nameParts = parsed.data.name.trim().split(/\s+/);
        const firstName = nameParts[0] || parsed.data.name;
        const lastName = nameParts.slice(1).join(" ") || "-";

        const existingLead = await storage.getLeadByEmail(parsed.data.email);
        if (existingLead) {
          await storage.updateLead(existingLead.id, {
            status: "demo_scheduled",
            company: parsed.data.company || existingLead.company,
          });
          await storage.updateDemoBookingLeadId(booking.id, existingLead.id);
        } else {
          const newLead = await storage.createLead({
            firstName,
            lastName,
            email: parsed.data.email,
            company: parsed.data.company || undefined,
            status: "demo_scheduled",
            source: "demo_request",
            tierInterest: "poc",
            message: `Demo booked for ${parsed.data.interestArea} on ${slot.toISOString()}`,
          });
          await storage.updateDemoBookingLeadId(booking.id, newLead.id);
        }
      } catch (leadErr) {
        console.error("Failed to upsert lead for booking:", leadErr);
      }

      res.status(201).json(booking);

      // Fire-and-forget emails — do not block the response
      const emailData = {
        id: booking.id,
        name: booking.name,
        email: booking.email,
        company: booking.company,
        interestArea: booking.interestArea,
        slotDatetime: new Date(booking.slotDatetime),
      };
      sendBookingConfirmation(emailData).catch((err) =>
        console.error("[Email] Failed to send booking confirmation:", err)
      );
      sendTeamNotification(emailData).catch((err) =>
        console.error("[Email] Failed to send team notification:", err)
      );
    } catch (error) {
      console.error("Error creating demo booking:", error);
      res.status(500).json({ error: "Failed to create demo booking" });
    }
  });

  // PATCH /api/demo-bookings/:id/status — update booking status (admin)
  app.patch("/api/demo-bookings/:id/status", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!["pending", "confirmed", "cancelled"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const booking = await storage.updateDemoBookingStatus(req.params.id, status);
      if (!booking) {
        return res.status(404).json({ error: "Demo booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Error updating demo booking status:", error);
      res.status(500).json({ error: "Failed to update demo booking status" });
    }
  });

  // GET /api/demo-bookings/:id/calendar.ics — ICS file download
  app.get("/api/demo-bookings/:id/calendar.ics", async (req: Request, res: Response) => {
    try {
      const booking = await storage.getDemoBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Demo booking not found" });
      }

      const icsContent = generateICS(booking);
      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="demo-booking-${booking.id}.ics"`);
      res.send(icsContent);
    } catch (error) {
      console.error("Error generating ICS:", error);
      res.status(500).json({ error: "Failed to generate calendar file" });
    }
  });

  app.get("/api/demo-configs/:id", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const config = await storage.getDemoConfig(req.params.id);
      if (!config) {
        return res.status(404).json({ error: "Demo config not found" });
      }
      res.json(config);
    } catch (error) {
      console.error("Error fetching demo config:", error);
      res.status(500).json({ error: "Failed to fetch demo config" });
    }
  });

  // ==========================================
  // INTERNAL ADMIN ENDPOINTS (Protected - Admin Only)
  // ==========================================
  app.use("/api/internal", isAuthenticatedOrTeam, internalRoutes);

  // ==========================================
  // SAP INTEGRATION ENDPOINTS (Protected)
  // ==========================================
  app.use("/api/sap", isAuthenticated, sapRoutes);
  app.use(exportRoutes);

  return httpServer;
}

async function generateDemoProducts(configId: string, prompt: string, industry: string) {
  try {
    const systemPrompt = `You are a product data generator for Digital Product Passports (DPP) under EU ESPR Regulation 2024/1781. Generate realistic product data for the ${industry} industry.

Return a JSON array of 3 products. Each product must have:
- productName: realistic product name
- productCategory: "${industry}"
- modelNumber: realistic model number
- sku: realistic SKU
- manufacturer: realistic manufacturer name
- countryOfOrigin: realistic country
- batchNumber: realistic batch number
- materials: comma-separated list of materials
- carbonFootprint: number (kg CO2e)
- repairabilityScore: number 1-10
- warrantyInfo: warranty text
- recyclingInstructions: recycling guidance text
- recycledContentPercent: number 0-100
- recyclabilityPercent: number 0-100

Respond ONLY with a valid JSON array, no markdown.`;

    const openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    let products: any[] = [];
    try {
      const content = response.choices[0]?.message?.content || "[]";
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      products = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      await storage.updateDemoConfig(configId, { status: "failed" });
      return;
    }

    // Create actual products in the database
    for (const p of products) {
      try {
        await productService.createProduct({
          productName: p.productName || `${industry} Product`,
          productCategory: p.productCategory || industry,
          modelNumber: p.modelNumber || "",
          sku: p.sku || "",
          manufacturer: p.manufacturer || "Demo Manufacturer",
          countryOfOrigin: p.countryOfOrigin || "Germany",
          batchNumber: p.batchNumber || `DEMO-${Date.now()}`,
          materials: p.materials || "Various materials",
          carbonFootprint: p.carbonFootprint || 50,
          repairabilityScore: p.repairabilityScore || 7,
          warrantyInfo: p.warrantyInfo || "Standard warranty",
          recyclingInstructions: p.recyclingInstructions || "Contact manufacturer for recycling",
          recycledContentPercent: p.recycledContentPercent,
          recyclabilityPercent: p.recyclabilityPercent,
        });
      } catch (err) {
        console.error("Error creating demo product:", err);
      }
    }

    await storage.updateDemoConfig(configId, {
      status: "ready",
      generatedProducts: products,
    });
  } catch (error) {
    console.error("Error in generateDemoProducts:", error);
    await storage.updateDemoConfig(configId, { status: "failed" });
  }
}

// ============================================
// DEMO BOOKING HELPERS
// ============================================

/**
 * Returns available 30-minute booking slots for the next 14 days.
 * Business hours: Mon–Fri, 09:00–17:00 CET (UTC+1, no DST adjustment).
 * Slots start on the hour and half-hour; the last slot starts at 16:30 CET.
 */
function getAvailableSlots(startDate: Date, bookedSlots: Date[]): Date[] {
  const slots: Date[] = [];
  const bookedMs = new Set(bookedSlots.map(s => s.getTime()));
  const now = new Date();

  for (let day = 0; day < 14; day++) {
    const base = new Date(startDate);
    base.setDate(base.getDate() + day);

    // Use the calendar date from the base date (local server date)
    const year = base.getFullYear();
    const month = base.getMonth();
    const date = base.getDate();

    // Determine day-of-week in CET: CET = UTC+1, so we check the wall-clock date at UTC+1
    const cetMidnight = new Date(Date.UTC(year, month, date, 0, 0, 0, 0));
    const cetDayOfWeek = new Date(cetMidnight.getTime() + 60 * 60 * 1000).getDay();
    if (cetDayOfWeek === 0 || cetDayOfWeek === 6) continue;

    // Generate 30-min slots from 09:00 to 16:30 CET (last start), i.e. 08:00–15:30 UTC
    for (let hour = 9; hour < 17; hour++) {
      for (const minute of [0, 30]) {
        // 16:30 CET is the last allowed start (slot ends at 17:00 CET)
        if (hour === 16 && minute > 30) continue;
        if (hour === 17) continue;

        // Slot time in UTC: CET = UTC+1 means CET hour:minute = UTC (hour-1):minute
        const slot = new Date(Date.UTC(year, month, date, hour - 1, minute, 0, 0));

        if (slot <= now) continue;
        if (bookedMs.has(slot.getTime())) continue;

        slots.push(slot);
      }
    }
  }

  return slots;
}

/**
 * Returns true if the given slot is a valid bookable time:
 * - Within the next 14 days from now
 * - Mon–Fri 09:00–16:30 CET (start time), slots on the half-hour
 * - In the future
 */
function isValidSlot(slot: Date): boolean {
  const now = new Date();
  if (slot <= now) return false;
  if (slot.getTime() > now.getTime() + 14 * 24 * 60 * 60 * 1000) return false;

  // CET = UTC+1; compute CET wall-clock time
  const cetHour = slot.getUTCHours() + 1; // CET = UTC+1
  const cetMinute = slot.getUTCMinutes();

  // Day-of-week in CET (shift UTC date by +1 hour before reading day)
  const cetTs = new Date(slot.getTime() + 60 * 60 * 1000);
  const dayOfWeek = cetTs.getUTCDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;

  // Hours 09:00–16:30 CET, minutes must be 0 or 30
  if (cetMinute !== 0 && cetMinute !== 30) return false;
  if (cetHour < 9) return false;
  if (cetHour > 16) return false;
  if (cetHour === 16 && cetMinute > 30) return false;

  return true;
}

/** Escape text for ICS per RFC 5545: backslash, semicolon, comma, and newlines must be escaped. */
function escapeICS(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function generateICS(booking: { id: string; name: string; email: string; company?: string | null; interestArea: string; slotDatetime: Date }): string {
  const start = new Date(booking.slotDatetime);
  const end = new Date(start.getTime() + 30 * 60 * 1000);

  const formatDT = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const uid = `demo-booking-${booking.id}@photonictag.com`;
  const summary = escapeICS(`PhotonicTag Demo \u2014 ${booking.name}`);
  const description = escapeICS(
    `Demo scheduled with PhotonicTag\nInterest area: ${booking.interestArea}\nCompany: ${booking.company || 'N/A'}\nContact: ${booking.email}`
  );

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PhotonicTag//Demo Scheduling//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDT(new Date())}`,
    `DTSTART:${formatDT(start)}Z`,
    `DTEND:${formatDT(end)}Z`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'ORGANIZER:mailto:demo@photonictag.com',
    `ATTENDEE;RSVP=TRUE:mailto:${booking.email}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
