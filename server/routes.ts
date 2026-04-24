import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { aiClient, AI_CHAT_MODEL } from "./services/ai-client";
import {
  insertProductSchema,
  insertIoTDeviceSchema,
  insertEnterpriseConnectorSchema,
  insertLeadSchema,
  insertPartnerSchema,
  insertDemoConfigSchema,
  insertDemoBookingSchema,
  updatePartnerSchema,
  type TierInterest,
  type PartnerRole,
  type PartnerStatus,
} from "@shared/schema";
import { productService } from "./services/product-service";
import { qrService } from "./services/qr-service";
import { sendBookingConfirmation, sendTeamNotification, sendSAPAlertEmail } from "./services/email";
import { sendTransactionalEmail } from "./services/email-service";
import { identityService } from "./services/identity-service";
import { traceService } from "./services/trace-service";
import { aiService } from "./services/ai-service";
import { auditService } from "./services/audit-service";
import { iotService } from "./services/iot-service";
import { seedDemoData } from "./seed-demo-data";
import { authProvider, getCurrentUser } from "./auth";
import { authStorage } from "./integrations/auth/storage";
import { injectTenantId } from "./middleware/tenant";
import { getPartnerSessionState } from "./middleware/partner-session";
import { requireMasterAdmin, requireMasterAdminOrTeam } from "./middleware/require-admin";
import { tenantStorage, TenantStorage } from "./storage-tenant";
import { encryptSAPCredentials } from "./services/crypto-service";

/** Strips credential fields before returning a connector to the client. */
function redactConnectorForResponse<T extends { config?: unknown; credentialsCiphertext?: string | null }>(connector: T): T {
  const { credentialsCiphertext: _hidden, ...rest } = connector as any;
  const cfg = (connector.config ?? {}) as Record<string, unknown>;
  const redactedConfig: Record<string, unknown> = { ...cfg };
  for (const field of ["password", "oauthClientSecret"]) {
    if (redactedConfig[field] !== undefined) redactedConfig[field] = "***REDACTED***";
  }
  return { ...rest, config: redactedConfig } as T;
}
import { scanLimiter, formLimiter, identityLimiter, authLimiter, aiLimiter, apiLimiter } from "./middleware/rate-limit";
import { storage } from "./storage";
import { logger } from "./logger";

// isAuthenticated from the swappable provider
const { isAuthenticated } = authProvider;
import sapRoutes from "./routes/sap-routes";
import { applyFieldMappings, SAPODataClient } from "./services/sap-odata-client";
import { sapMockService } from "./services/sap-mock-service";
import { decryptSAPCredentials } from "./services/crypto-service";
import type { SAPConfig } from "@shared/schema";
import internalRoutes from "./routes/internal-routes";
import exportRoutes from "./routes/export-routes";
import productImportRoutes from "./routes/product-import-routes";
import bcrypt from "bcryptjs";
import multer from "multer";
import { importCSVFromBuffer } from "./services/csv-import-service";
import type { RequestHandler } from "express";

// CSV/XLSX upload via memory storage — 10 MB limit. Per-tenant rate limit lives
// at the route level; the connector enum (csv) is what gates the upload path.
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const isAuthenticatedOrTeam: RequestHandler = async (req, res, next) => {
  try {
    if (getCurrentUser(req)) return next();

    const partnerState = await getPartnerSessionState(req);
    if (partnerState === "valid") return next();
    if (partnerState === "invalid") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.status(401).json({ message: "Unauthorized" });
  } catch (err) {
    next(err);
  }
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await authProvider.setup(app);

  // Current-user endpoint — provider-agnostic, backed by the active AuthProvider.
  app.get("/api/auth/user", authProvider.isAuthenticated, async (req: Request, res: Response) => {
    try {
      const current = getCurrentUser(req);
      if (!current) return res.status(401).json({ message: "Unauthorized" });
      const dbUser = await authStorage.getUser(current.id);
      // isAdmin is session-derived (master-admin email allowlist); the users
      // table row is not kept in sync with that allowlist, so always prefer
      // the session value so the frontend can gate UI correctly.
      res.json({ ...(dbUser ?? {}), ...current, isAdmin: current.isAdmin });
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error fetching user");
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Tenant context on all requests (no-op if unauthenticated)
  app.use(injectTenantId);
  // Global API rate limit — catch-all before any endpoint
  app.use("/api/", apiLimiter);
  
  // ==========================================
  // SEO: SITEMAP + ROBOTS
  // ==========================================

  app.get("/sitemap.xml", (_req: Request, res: Response) => {
    const baseUrl = "https://www.photonictag.com";
    const today = new Date().toISOString().split("T")[0];

    const pages = [
      { url: "/", priority: "1.0", changefreq: "weekly" },
      { url: "/pricing", priority: "0.9", changefreq: "monthly" },
      { url: "/integrations", priority: "0.8", changefreq: "monthly" },
      { url: "/contact", priority: "0.8", changefreq: "monthly" },
      { url: "/book-demo", priority: "0.8", changefreq: "monthly" },
      { url: "/faqs", priority: "0.7", changefreq: "monthly" },
      { url: "/docs", priority: "0.7", changefreq: "weekly" },
      { url: "/privacy", priority: "0.3", changefreq: "yearly" },
      { url: "/terms", priority: "0.3", changefreq: "yearly" },
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=86400");
    res.send(xml);
  });

  // PRODUCT ENDPOINTS
  // ==========================================

  // Public demo catalog — returns only the seeded "default" tenant's products.
  // Used by marketing pages (demo gallery, use-cases) and the public scan page's
  // "explore more" rail. Separate from /api/products so unauthed requests never
  // see a tenant's real catalog.
  app.get("/api/public/demo-products", async (_req: Request, res: Response) => {
    try {
      const demoStore = new TenantStorage("default");
      const products = await demoStore.getAllProducts();
      res.json(products);
    } catch (error) {
      logger.error({ err: error }, "Error fetching demo products");
      res.status(500).json({ error: "Failed to fetch demo products" });
    }
  });

  // ── Public tenant theme — used by the consumer scan page to apply white-
  // label branding (logo, primary color, brand name). Returns ONLY the
  // public-safe view defined in shared/schema.ts PublicTenantTheme — never
  // leaks tenant administrative metadata. Unauth-friendly so the scan page
  // can render before any session exists.
  app.get("/api/public/tenants/:tenantId/theme", async (req: Request, res: Response) => {
    try {
      const theme = await storage.getPublicTenantTheme(req.params.tenantId);
      if (!theme) return res.status(404).json({ error: "Tenant not found" });
      // Cache for 5 minutes — theme changes rarely; reduces scan-page TTFB.
      res.set("Cache-Control", "public, max-age=300, s-maxage=300");
      res.json(theme);
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error fetching public tenant theme");
      res.status(500).json({ error: "Failed to fetch tenant theme" });
    }
  });

  // ── Update tenant white-label theme — admin only, scoped to caller's tenant.
  // Master admins can edit any tenant; regular admins only their own.
  app.patch("/api/tenants/:tenantId/theme", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const callerUser = await authProvider.getCurrentUser(req);
      if (!callerUser) return res.status(401).json({ error: "Unauthorized" });

      const callerTenantId = (callerUser as { tenantId?: string }).tenantId;
      const { isMasterAdminEmail } = await import("@shared/models/auth");
      const isMaster = isMasterAdminEmail(callerUser.email);

      if (!isMaster && callerTenantId !== req.params.tenantId) {
        return res.status(403).json({ error: "Cannot edit another tenant's theme" });
      }

      const body = req.body as Record<string, unknown>;
      const allowedKeys = ["brandName", "primaryColor", "primaryColorInk", "logoUrl", "tagline"] as const;
      const cleaned: Record<string, unknown> = {};
      for (const k of allowedKeys) {
        if (k in body) cleaned[k] = body[k];
      }

      const updated = await storage.updateTenantTheme(req.params.tenantId, cleaned);
      if (!updated) return res.status(404).json({ error: "Tenant not found" });

      const publicTheme = await storage.getPublicTenantTheme(req.params.tenantId);
      res.json(publicTheme);
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error updating tenant theme");
      res.status(500).json({ error: "Failed to update tenant theme" });
    }
  });

  app.get("/api/products", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const scoped = tenantStorage(req);
      const products = await scoped.getAllProducts();
      res.json(products);
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error fetching products");
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
      ((req as any).log ?? logger).error({ err: error }, "Error fetching product");
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const parsed = insertProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid product data", details: parsed.error.issues });
      }

      const scoped = tenantStorage(req);
      const product = await productService.createProduct(parsed.data, scoped);

      await qrService.generateQRCode(product.id);

      await identityService.createIdentity(product.id);

      await traceService.recordEvent(product.id, "manufactured", product.manufacturer, {
        description: `Product ${product.productName} registered in PhotonicTag`,
        location: { name: product.manufacturer },
      });

      await auditService.logCreate("product", product.id, product as unknown as Record<string, unknown>);

      const updatedProduct = await productService.getProduct(product.id, scoped);

      res.status(201).json(updatedProduct);
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error creating product");
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const scoped = tenantStorage(req);
      const existingProduct = await productService.getProduct(req.params.id, scoped);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      const parsed = insertProductSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid product data", details: parsed.error.issues });
      }

      const product = await productService.updateProduct(req.params.id, parsed.data, scoped);

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
      ((req as any).log ?? logger).error({ err: error }, "Error updating product");
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const scoped = tenantStorage(req);
      const existingProduct = await productService.getProduct(req.params.id, scoped);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      const deleted = await productService.deleteProduct(req.params.id, scoped);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }

      await auditService.logDelete("product", req.params.id, existingProduct as unknown as Record<string, unknown>);

      res.status(204).send();
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error deleting product");
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
      ((req as any).log ?? logger).error({ err: error }, "Error fetching identity");
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
      ((req as any).log ?? logger).error({ err: error }, "Error fetching identity");
      res.status(500).json({ error: "Failed to fetch identity" });
    }
  });

  app.post("/api/identities/validate", identityLimiter, async (req: Request, res: Response) => {
    try {
      const { serialNumber } = req.body;
      const result = await identityService.validateIdentity(serialNumber);
      res.json(result);
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error validating identity");
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
      ((req as any).log ?? logger).error({ err: error }, "Error fetching QR code");
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
      ((req as any).log ?? logger).error({ err: error }, "Error regenerating QR code");
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
      ((req as any).log ?? logger).error({ err: error }, "Error recording scan");
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
      ((req as any).log ?? logger).error({ err: error }, "Error fetching trace events");
      res.status(500).json({ error: "Failed to fetch trace events" });
    }
  });

  app.post("/api/products/:productId/trace", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
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
      ((req as any).log ?? logger).error({ err: error }, "Error recording trace event");
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
      ((req as any).log ?? logger).error({ err: error }, "Error fetching insights");
      res.status(500).json({ error: "Failed to fetch insights" });
    }
  });

  app.post("/api/ai/summarize", aiLimiter, async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const product = await productService.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const result = await aiService.generateSummary(product);
      res.json(result);
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error generating summary");
      res.status(500).json({ error: "Failed to generate summary" });
    }
  });

  app.post("/api/ai/sustainability", aiLimiter, async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const product = await productService.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const result = await aiService.generateSustainabilityInsight(product);
      res.json(result);
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error generating sustainability insights");
      res.status(500).json({ error: "Failed to generate sustainability insights" });
    }
  });

  app.post("/api/ai/repair-summary", aiLimiter, async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const product = await productService.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const result = await aiService.generateRepairSummary(product);
      res.json(result);
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error generating repair summary");
      res.status(500).json({ error: "Failed to generate repair summary" });
    }
  });

  app.post("/api/ai/circularity", aiLimiter, async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const product = await productService.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const result = await aiService.generateCircularityScore(product);
      res.json(result);
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error generating circularity score");
      res.status(500).json({ error: "Failed to generate circularity score" });
    }
  });

  app.post("/api/ai/risk-assessment", aiLimiter, async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const product = await productService.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const result = await aiService.generateRiskAssessment(product);
      res.json(result);
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error generating risk assessment");
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
      ((req as any).log ?? logger).error({ err: error }, "Error fetching audit logs");
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
      ((req as any).log ?? logger).error({ err: error }, "Error fetching IoT devices");
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
      ((req as any).log ?? logger).error({ err: error }, "Error fetching IoT device");
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
      ((req as any).log ?? logger).error({ err: error }, "Error registering IoT device");
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
      ((req as any).log ?? logger).error({ err: error }, "Error updating IoT device status");
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
      ((req as any).log ?? logger).error({ err: error }, "Error recording sensor reading");
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
      ((req as any).log ?? logger).error({ err: error }, "Error scanning IoT device");
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
      ((req as any).log ?? logger).error({ err: error }, "Error deleting IoT device");
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
      ((req as any).log ?? logger).error({ err: error }, "Error fetching regional extensions");
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
      ((req as any).log ?? logger).error({ err: error }, "Error fetching regional extension");
      res.status(500).json({ error: "Failed to fetch regional extension" });
    }
  });

  app.post("/api/products/:productId/regional-extensions", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      // Tenant-scoped ownership check: prevents tenant A from attaching a
      // regional extension to tenant B's product.
      const product = await tenantStorage(req).getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const extension = await tenantStorage(req).createRegionalExtension({
        ...req.body,
        productId,
      });
      res.status(201).json(extension);
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error creating regional extension");
      res.status(500).json({ error: "Failed to create regional extension" });
    }
  });

  app.patch("/api/regional-extensions/:id", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const extension = await tenantStorage(req).updateRegionalExtension(req.params.id, req.body);
      if (!extension) {
        return res.status(404).json({ error: "Regional extension not found" });
      }
      res.json(extension);
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error updating regional extension");
      res.status(500).json({ error: "Failed to update regional extension" });
    }
  });

  app.delete("/api/regional-extensions/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const deleted = await tenantStorage(req).deleteRegionalExtension(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Regional extension not found" });
      }
      res.status(204).send();
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error deleting regional extension");
      res.status(500).json({ error: "Failed to delete regional extension" });
    }
  });

  // ==========================================
  // SCAN INTELLIGENCE & CONSUMER REGISTRATION
  // ==========================================

  // Record a scan — public, no auth; rate-limited per IP
  app.post("/api/products/:productId/scan", scanLimiter, async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const product = await storage.getProduct(productId);
      if (!product) return res.status(404).json({ error: "Product not found" });

      // sessionId comes from the client for deduplication, but isUnique is
      // computed server-side — never trust the client to declare itself unique.
      const rawSessionId = (req.headers["x-session-id"] as string) || (req.body?.sessionId as string) || null;
      const sessionId = rawSessionId ? rawSessionId.slice(0, 128) : null;
      const userAgent = (req.headers["user-agent"] || "").slice(0, 255);
      const referrer = (req.headers.referer || "").slice(0, 255);
      const acceptLang = req.headers["accept-language"] || "";
      const country = acceptLang.match(/[a-z]{2}-([A-Z]{2})/)?.[1] || null;

      // isUnique: true only when we have a sessionId AND this session hasn't
      // scanned this product before. The storage layer enforces this.
      const previousScan = sessionId
        ? await storage.findProductScanBySession(productId, sessionId)
        : null;
      const isUnique = !!sessionId && !previousScan;

      const scan = await storage.recordProductScan({
        productId,
        country,
        userAgent,
        referrer,
        sessionId,
        isUnique,
      });
      res.status(201).json({ id: scan.id });
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error recording scan");
      res.status(500).json({ error: "Failed to record scan" });
    }
  });

  // Get scan analytics — authenticated
  app.get("/api/products/:productId/scan-analytics", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      // Tenant-scoped ownership check before revealing scan/registration data
      // for this product.
      const owned = await tenantStorage(req).getProduct(productId);
      if (!owned) {
        return res.status(404).json({ error: "Product not found" });
      }
      const [stats, recent, byDay, registrations] = await Promise.all([
        storage.getProductScanStats(productId),
        storage.getRecentProductScans(productId, 20),
        storage.getScansByDay(productId, 30),
        storage.getProductRegistrations(productId),
      ]);
      res.json({ stats, recent, byDay, registrations });
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error fetching scan analytics");
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Consumer product registration — public, rate limited
  app.post("/api/products/:productId/register", formLimiter, async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const product = await storage.getProduct(productId);
      if (!product) return res.status(404).json({ error: "Product not found" });

      const { ownerName, ownerEmail, purchaseDate, purchaseLocation, notes, warrantyActivated, marketingOptIn } = req.body;
      if (!ownerName || !ownerEmail) return res.status(400).json({ error: "Name and email are required" });

      const reg = await storage.createProductRegistration({
        productId,
        ownerName: String(ownerName),
        ownerEmail: String(ownerEmail),
        purchaseDate: purchaseDate || null,
        purchaseLocation: purchaseLocation || null,
        notes: notes || null,
        warrantyActivated: warrantyActivated !== false,
        marketingOptIn: marketingOptIn === true,
      });
      res.status(201).json({ id: reg.id, message: "Product registered successfully" });
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error registering product");
      res.status(500).json({ error: "Failed to register product" });
    }
  });

  // Get registrations for a product — authenticated
  app.get("/api/products/:productId/registrations", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const owned = await tenantStorage(req).getProduct(req.params.productId);
      if (!owned) {
        return res.status(404).json({ error: "Product not found" });
      }
      const registrations = await storage.getProductRegistrations(req.params.productId);
      res.json(registrations);
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error fetching registrations");
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  });

  // PLM bulk-import, batch creation & QR export routes (auth required)
  app.use("/api/products", isAuthenticatedOrTeam, productImportRoutes);

  // ==========================================
  // ENTERPRISE INTEGRATIONS ENDPOINTS
  // ==========================================

  app.get("/api/integrations/connectors", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const connectors = await tenantStorage(req).getAllEnterpriseConnectors();
      res.json(connectors.map(redactConnectorForResponse));
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error fetching connectors");
      res.status(500).json({ error: "Failed to fetch connectors" });
    }
  });

  app.get("/api/integrations/connectors/:id", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const connector = await tenantStorage(req).getEnterpriseConnector(req.params.id);
      if (!connector) {
        return res.status(404).json({ error: "Connector not found" });
      }
      res.json(redactConnectorForResponse(connector));
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error fetching connector");
      res.status(500).json({ error: "Failed to fetch connector" });
    }
  });

  app.post("/api/integrations/connectors", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const parsed = insertEnterpriseConnectorSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid connector data", details: parsed.error.issues });
      }
      // Split sensitive credentials out of the plaintext config JSONB and
      // store them as an AES-256-GCM ciphertext in credentialsCiphertext.
      const rawConfig = (parsed.data.config ?? {}) as Record<string, unknown>;
      const { redactedConfig, credentialsCiphertext } = encryptSAPCredentials(rawConfig);
      const connector = await tenantStorage(req).createEnterpriseConnector({
        ...parsed.data,
        config: redactedConfig,
        ...(credentialsCiphertext ? { credentialsCiphertext } : {}),
      } as any);
      res.status(201).json(redactConnectorForResponse(connector));
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error creating connector");
      res.status(500).json({ error: "Failed to create connector" });
    }
  });

  app.patch("/api/integrations/connectors/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Tenant-ownership gate: refuse to patch a connector from another tenant.
      const owned = await tenantStorage(req).getEnterpriseConnector(req.params.id);
      if (!owned) {
        return res.status(404).json({ error: "Connector not found" });
      }
      const body = { ...(req.body ?? {}) } as Record<string, unknown>;
      // Never allow the client to set credentialsCiphertext directly —
      // always derive it from the config payload.
      delete body.credentialsCiphertext;
      // tenantId is server-controlled; prevent client reassignment.
      delete body.tenantId;
      if (body.config && typeof body.config === "object") {
        const { redactedConfig, credentialsCiphertext } = encryptSAPCredentials(
          body.config as Record<string, unknown>
        );
        body.config = redactedConfig;
        if (credentialsCiphertext) body.credentialsCiphertext = credentialsCiphertext;
      }
      const connector = await tenantStorage(req).updateEnterpriseConnector(req.params.id, body as any);
      if (!connector) {
        return res.status(404).json({ error: "Connector not found" });
      }
      res.json(redactConnectorForResponse(connector));
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error updating connector");
      res.status(500).json({ error: "Failed to update connector" });
    }
  });

  app.delete("/api/integrations/connectors/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Tenant-ownership gate before delete.
      const owned = await tenantStorage(req).getEnterpriseConnector(req.params.id);
      if (!owned) {
        return res.status(404).json({ error: "Connector not found" });
      }
      const deleted = await tenantStorage(req).deleteEnterpriseConnector(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Connector not found" });
      }
      res.status(204).send();
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error deleting connector");
      res.status(500).json({ error: "Failed to delete connector" });
    }
  });

  app.post("/api/integrations/connectors/:id/test", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const connector = await tenantStorage(req).getEnterpriseConnector(req.params.id);
      if (!connector) {
        return res.status(404).json({ error: "Connector not found" });
      }
      
      // Simulate connection test (in production, this would actually test the SAP connection)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await tenantStorage(req).updateEnterpriseConnector(req.params.id, { status: "active" as const });
      res.json({ success: true, message: "Connection successful" });
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error testing connector");
      res.status(500).json({ error: "Connection test failed" });
    }
  });

  app.post("/api/integrations/connectors/:id/sync", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const scoped = tenantStorage(req);
      const connector = await scoped.getEnterpriseConnector(req.params.id);
      if (!connector) {
        return res.status(404).json({ error: "Connector not found" });
      }

      const fieldMappings = (connector.fieldMappings ?? []) as import("@shared/schema").FieldMapping[];

      // Create sync log
      const syncLog = await scoped.createIntegrationSyncLog({
        connectorId: connector.id,
        syncType: "manual",
        status: "running",
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 0,
        startedAt: new Date(),
      });

      // Resolve a SAPODataClient from the connector's persisted config — real
      // OData when hostname is real, mock fallback when hostname contains
      // "mock" / "demo.sap.example.com". This is the user-visible sync the
      // platform page promises; without this routing, connecting a real S/4
      // tenant would silently fall through to seeded mock data.
      const decryptedConfig = decryptSAPCredentials(
        (connector.config ?? {}) as Record<string, unknown>,
        connector.credentialsCiphertext ?? null,
      ) as unknown as SAPConfig;
      const client = new SAPODataClient(decryptedConfig);

      let created = 0, updated = 0, failed = 0;
      const errors: string[] = [];
      let usedMock = false;
      try {
        const fetched = await client.fetchMaterialsAsSAPMaterial({ top: 200 });
        usedMock = fetched.usedMock;
        const materials = fetched.materials
          .filter(m => m.syncStatus === "pending" && !m.photonicTagId)
          .slice(0, 20);

        const existingProducts = await scoped.getAllProducts();

        for (const material of materials) {
          try {
            const mappedData = fieldMappings.length
              ? applyFieldMappings(material, fieldMappings)
              : sapMockService.mapToPhotonicTagProduct(material);

            const existing = existingProducts.find(p => p.modelNumber === material.MARA.MATNR);
            if (existing) {
              await scoped.updateProduct(existing.id, mappedData);
              sapMockService.linkToPhotonicTag(material.MARA.MATNR, existing.id);
              updated++;
            } else {
              const md = mappedData as Record<string, unknown>;
            const rawDate = md.dateOfManufacture;
            const dateOfManufacture = rawDate instanceof Date
              ? rawDate
              : rawDate ? new Date(rawDate as string) : undefined;
            const insertData = {
                ...mappedData,
                description: `Imported from SAP Material ${material.MARA.MATNR}`,
                materials: md.materials as string || "",
                safetyCertifications: [],
                carbonFootprint: Math.round(Number(md.carbonFootprint ?? 0)),
                repairabilityScore: Math.round(Number(md.repairabilityScore ?? 0)),
                warrantyInfo: md.warrantyInfo as string || "",
                recyclingInstructions: md.recyclingInstructions as string || "",
                dateOfManufacture,
              };
              const newProduct = await scoped.createProduct(insertData as unknown as import("@shared/schema").InsertProduct);
              sapMockService.linkToPhotonicTag(material.MARA.MATNR, newProduct.id);
              created++;
            }
          } catch (err) {
            const e = err as Error;
            const errMsg = `${material.MARA.MATNR}: ${e.message}`;
            ((req as any).log ?? logger).error({ errMsg }, "[Connector Sync] Material error");
            errors.push(errMsg);
            failed++;
          }
        }
      } catch (err) {
        ((req as any).log ?? logger).error({ err }, "[Connector Sync] Error");
      }

      const total = created + updated + failed;

      await scoped.updateIntegrationSyncLog(syncLog.id, {
        status: failed > 0 && created + updated === 0 ? "failed" : "completed",
        recordsProcessed: total,
        recordsCreated: created,
        recordsUpdated: updated,
        recordsFailed: failed,
        completedAt: new Date(),
        ...(failed > 0 ? { errorMessage: `${failed} record(s) failed to sync` } : {}),
      });

      await scoped.updateEnterpriseConnector(connector.id, {
        lastSyncAt: new Date(),
        lastSyncStatus: failed > 0 && total === failed ? "error" : "completed",
        productsSynced: (connector.productsSynced || 0) + created + updated,
      } as any);

      // Check alert thresholds and send email if exceeded
      const sapConfig = connector.config as import("@shared/schema").SAPConfig;
      const alertThreshold = sapConfig?.alertThresholdConsecutiveFailures;
      const alertEmailTo = sapConfig?.alertEmailTo;
      if (alertThreshold && alertEmailTo) {
        const recentLogs = await scoped.getSyncLogsByConnectorId(connector.id);
        const last10 = recentLogs.slice(0, 10);
        const recentFailureCount = last10.filter(l => l.status === "failed").length;
        if (recentFailureCount >= alertThreshold) {
          const recentErrors = last10
            .filter(l => l.status === "failed" && l.errorMessage)
            .map(l => l.errorMessage!)
            .slice(0, 5);
          try {
            await sendSAPAlertEmail({
              connectorName: connector.name,
              failureCount: recentFailureCount,
              threshold: alertThreshold,
              recentErrors,
              alertEmailTo,
            });
          } catch (emailErr) {
            ((req as any).log ?? logger).error({ err: emailErr }, "[SAP Alert] Failed to send alert email");
          }
        }
      }

      res.json({
        success: true,
        message: `Sync completed: ${created} created, ${updated} updated, ${failed} failed`,
        syncLogId: syncLog.id,
        created, updated, failed,
        fieldMappingsUsed: fieldMappings.length,
        firstError: errors[0] ?? null,
        usedMock,
      });
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error syncing connector");
      res.status(500).json({ error: "Sync failed" });
    }
  });

  app.get("/api/integrations/connectors/:id/logs", isAuthenticatedOrTeam, async (req: Request, res: Response) => {
    try {
      const scoped = tenantStorage(req);
      const owned = await scoped.getEnterpriseConnector(req.params.id);
      if (!owned) {
        return res.status(404).json({ error: "Connector not found" });
      }
      const logs = await scoped.getSyncLogsByConnectorId(req.params.id);
      res.json(logs);
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error fetching sync logs");
      res.status(500).json({ error: "Failed to fetch sync logs" });
    }
  });

  // ── Audit chain integrity (regulator-grade verification) ─────────────────
  // Walks every audit_log entry and proves: (1) every chainHash recomputes
  // from row content; (2) chain links are intact; (3) genesis is null.
  // Pairs with the DB-level append-only trigger
  // (server/db/sql/001_audit_logs_append_only.sql). Designed to be the
  // compliance pitch for EU Battery Reg Article 65 + India BWM Rules.
  app.get("/api/audit/integrity", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { entityType, entityId } = req.query as { entityType?: string; entityId?: string };
      const { verifyAuditChain } = await import("./services/audit-integrity-service");
      const report = await verifyAuditChain({ entityType, entityId });
      res.status(report.passed ? 200 : 409).json(report);
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Audit integrity check failed");
      res.status(500).json({ error: "Integrity check failed", details: String(error) });
    }
  });

  // ── CSV-lite connector upload ─────────────────────────────────────────────
  // Brief 2026-17 opportunity #3 — second-revenue connector path. Accepts a
  // CSV/XLSX file for any connector with connectorType === "csv", parses it,
  // applies the connector's fieldMappings, inserts the resulting products
  // under tenant scope, and writes one row to integrationSyncLogs.
  app.post(
    "/api/integrations/connectors/:id/upload",
    isAuthenticatedOrTeam,
    csvUpload.single("file"),
    async (req: Request, res: Response) => {
      try {
        const scoped = tenantStorage(req);
        const connector = await scoped.getEnterpriseConnector(req.params.id);
        if (!connector) {
          return res.status(404).json({ error: "Connector not found" });
        }
        if (connector.connectorType !== "csv") {
          return res.status(400).json({
            error: `Upload is only supported for csv connectors (this connector is ${connector.connectorType})`,
          });
        }
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded — send multipart/form-data with field 'file'" });
        }

        const fieldMappings = (connector.fieldMappings ?? []) as import("@shared/schema").FieldMapping[];

        const syncLog = await scoped.createIntegrationSyncLog({
          connectorId: connector.id,
          syncType: "manual",
          status: "running",
          recordsProcessed: 0,
          recordsCreated: 0,
          recordsUpdated: 0,
          recordsFailed: 0,
          startedAt: new Date(),
        });

        const importResult = importCSVFromBuffer(req.file.buffer, fieldMappings, req.file.originalname);

        let created = 0;
        let updated = 0;
        let failed = 0;
        const insertErrors: string[] = [];

        for (const record of importResult.records) {
          try {
            const md = record as Record<string, unknown>;
            const rawDate = md.dateOfManufacture;
            const dateOfManufacture =
              rawDate instanceof Date ? rawDate
              : rawDate ? new Date(rawDate as string)
              : undefined;
            const insertData = {
              ...record,
              description: typeof md.description === "string" ? md.description : `Imported from CSV (${connector.name})`,
              materials: typeof md.materials === "string" ? md.materials : "",
              safetyCertifications: Array.isArray(md.safetyCertifications) ? md.safetyCertifications : [],
              carbonFootprint: md.carbonFootprint != null ? Math.round(Number(md.carbonFootprint)) : 0,
              repairabilityScore: md.repairabilityScore != null ? Math.round(Number(md.repairabilityScore)) : 0,
              warrantyInfo: typeof md.warrantyInfo === "string" ? md.warrantyInfo : "",
              recyclingInstructions: typeof md.recyclingInstructions === "string" ? md.recyclingInstructions : "",
              dateOfManufacture,
            };
            const modelKey = md.modelNumber as string | undefined;
            const existing = modelKey
              ? (await scoped.getAllProducts()).find(p => p.modelNumber === modelKey)
              : undefined;
            if (existing) {
              await scoped.updateProduct(existing.id, record);
              updated++;
            } else {
              await scoped.createProduct(insertData as unknown as import("@shared/schema").InsertProduct);
              created++;
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            failed++;
            if (insertErrors.length < 50) insertErrors.push(msg);
          }
        }

        const totalProcessed = created + updated + failed;
        const allErrors = [...importResult.errors, ...insertErrors].slice(0, 50);

        await scoped.updateIntegrationSyncLog(syncLog.id, {
          status: failed > 0 && created + updated === 0 ? "failed" : "completed",
          recordsProcessed: totalProcessed,
          recordsCreated: created,
          recordsUpdated: updated,
          recordsFailed: failed,
          completedAt: new Date(),
          ...(allErrors.length > 0 ? { errorMessage: allErrors.slice(0, 5).join("; ") } : {}),
        });

        await scoped.updateEnterpriseConnector(connector.id, {
          lastSyncAt: new Date(),
          lastSyncStatus: failed > 0 && totalProcessed === failed ? "error" : "completed",
          productsSynced: (connector.productsSynced || 0) + created + updated,
        } as any);

        res.json({
          success: true,
          syncLogId: syncLog.id,
          parsed: importResult.parsed,
          mapped: importResult.mapped,
          created,
          updated,
          failed,
          fieldMappingsUsed: fieldMappings.length,
          firstError: allErrors[0] ?? null,
          errors: allErrors,
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        ((req as any).log ?? logger).error({ err: error }, "Error uploading CSV to connector");
        res.status(500).json({ error: "CSV upload failed", details: msg });
      }
    },
  );

  // ==========================================
  // ADMIN/DEMO ENDPOINTS
  // ==========================================
  
  app.post("/api/admin/seed-demo-data", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      await seedDemoData();
      res.json({ success: true, message: "Demo data seeded successfully" });
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error seeding demo data");
      res.status(500).json({ error: "Failed to seed demo data" });
    }
  });

  // ==========================================
  // LEADS CRM ENDPOINTS
  // ==========================================

  // Public endpoint for contact form submissions — rate limited
  app.post("/api/leads", formLimiter, async (req: Request, res: Response) => {
    try {
      // Coerce ISO date strings to Date objects for timestamp fields
      const body = { ...req.body };
      if (typeof body.assessmentCompletedAt === "string" && body.assessmentCompletedAt) {
        body.assessmentCompletedAt = new Date(body.assessmentCompletedAt);
      }
      if (typeof body.nextFollowUp === "string" && body.nextFollowUp) {
        body.nextFollowUp = new Date(body.nextFollowUp);
      }
      const parsed = insertLeadSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid lead data", details: parsed.error.issues });
      }

      // Check for existing lead with same email
      const existingLead = await storage.getLeadByEmail(parsed.data.email, "default");
      if (existingLead) {
        // Update existing lead instead of creating duplicate
        const updatedLead = await storage.updateLead(existingLead.id, {
          message: parsed.data.message,
          tierInterest: parsed.data.tierInterest as TierInterest,
          estimatedVolume: parsed.data.estimatedVolume,
          company: parsed.data.company,
          jobTitle: parsed.data.jobTitle,
          notes: existingLead.notes 
            ? `${existingLead.notes}\n\n---\nNew inquiry: ${parsed.data.message || 'No message'}` 
            : parsed.data.message,
        }, "default");
        return res.json({ success: true, lead: updatedLead, isExisting: true });
      }

      const lead = await storage.createLead(parsed.data);

      // Log the activity
      await storage.createLeadActivity({
        leadId: lead.id,
        activityType: "note_added",
        description: `Lead created from ${parsed.data.source || 'contact_form'}`,
      });

      await sendTransactionalEmail("lead-confirm", lead.email, {
        name: `${lead.firstName} ${lead.lastName}`.trim(),
      });

      res.status(201).json({ success: true, lead });
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error creating lead");
      res.status(500).json({ error: "Failed to submit form" });
    }
  });

  // Protected CRM endpoints (accessible by master admin OR team/partner session)
  app.get("/api/leads", requireMasterAdminOrTeam, async (req: Request, res: Response) => {
    try {
      const leads = await tenantStorage(req).getAllLeads();
      res.json(leads);
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error fetching leads");
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/stats", requireMasterAdminOrTeam, async (req: Request, res: Response) => {
    try {
      const stats = await tenantStorage(req).getLeadStats();
      res.json(stats);
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error fetching lead stats");
      res.status(500).json({ error: "Failed to fetch lead stats" });
    }
  });

  app.get("/api/leads/:id", requireMasterAdminOrTeam, async (req: Request, res: Response) => {
    try {
      const lead = await tenantStorage(req).getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error fetching lead");
      res.status(500).json({ error: "Failed to fetch lead" });
    }
  });

  app.patch("/api/leads/:id", requireMasterAdminOrTeam, async (req: Request, res: Response) => {
    try {
      const lead = await tenantStorage(req).getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      const updatedLead = await tenantStorage(req).updateLead(req.params.id, req.body);
      
      // Log status changes
      if (req.body.status && req.body.status !== lead.status) {
        await tenantStorage(req).createLeadActivity({
          leadId: lead.id,
          activityType: "status_changed",
          description: `Status changed from ${lead.status} to ${req.body.status}`,
          metadata: { oldStatus: lead.status, newStatus: req.body.status },
        });
      }

      res.json(updatedLead);
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error updating lead");
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", requireMasterAdminOrTeam, async (req: Request, res: Response) => {
    try {
      const success = await tenantStorage(req).deleteLead(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json({ success: true });
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error deleting lead");
      res.status(500).json({ error: "Failed to delete lead" });
    }
  });

  app.get("/api/leads/:id/activities", requireMasterAdminOrTeam, async (req: Request, res: Response) => {
    try {
      const activities = await tenantStorage(req).getLeadActivities(req.params.id);
      res.json(activities);
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error fetching lead activities");
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  app.post("/api/leads/:id/activities", requireMasterAdminOrTeam, async (req: Request, res: Response) => {
    try {
      const lead = await tenantStorage(req).getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      const activity = await tenantStorage(req).createLeadActivity({
        leadId: req.params.id,
        ...req.body,
      });
      res.status(201).json(activity);
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Error creating lead activity");
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
          ((req as any).log ?? logger).error({ err }, "Session save error");
          return res.status(500).json({ error: "Login failed" });
        }
        res.json({ success: true, partner: safePartner });
      });
    } catch (error) {
      ((req as any).log ?? logger).error({ err: error }, "Partner login error");
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
      ((req as any).log ?? logger).error({ err: error }, "Partner auth check error");
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

  app.get("/api/partners", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const allPartners = await storage.getAllPartners();
      const safePartners = allPartners.map(({ passwordHash, ...p }) => p);
      res.json(safePartners);
    } catch (error) {
      console.error("Error fetching partners:", error);
      res.status(500).json({ error: "Failed to fetch partners" });
    }
  });

  app.post("/api/partners", requireMasterAdmin, async (req: Request, res: Response) => {
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
        email: rest.email,
        firstName: rest.firstName,
        lastName: rest.lastName,
        company: rest.company ?? null,
        role: (rest.role ?? "demo_viewer") as PartnerRole,
        status: (rest.status ?? "active") as PartnerStatus,
        passwordHash,
      });

      await sendTransactionalEmail("partner-invite", partner.email, {
        name: `${partner.firstName} ${partner.lastName}`.trim(),
        company: partner.company ?? undefined,
      });

      const { passwordHash: _, ...safePartner } = partner;
      res.status(201).json(safePartner);
    } catch (error) {
      console.error("Error creating partner:", error);
      res.status(500).json({ error: "Failed to create partner" });
    }
  });

  app.patch("/api/partners/:id", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const parsed = updatePartnerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid update data", details: parsed.error.issues });
      }

      const { password, ...rest } = parsed.data;
      const safeUpdates: Record<string, unknown> = { ...rest };

      if (password) {
        safeUpdates.passwordHash = await bcrypt.hash(password, 10);
      }

      const partner = await storage.updatePartner(req.params.id, safeUpdates as any);
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

  app.delete("/api/partners/:id", requireMasterAdmin, async (req: Request, res: Response) => {
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

  app.get("/api/demo-configs", requireMasterAdminOrTeam, async (req: Request, res: Response) => {
    try {
      const configs = await storage.getAllDemoConfigs();
      res.json(configs);
    } catch (error) {
      console.error("Error fetching demo configs:", error);
      res.status(500).json({ error: "Failed to fetch demo configs" });
    }
  });

  app.post("/api/demo-configs", requireMasterAdminOrTeam, async (req: Request, res: Response) => {
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

  app.delete("/api/demo-configs/:id", requireMasterAdminOrTeam, async (req: Request, res: Response) => {
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

  app.patch("/api/demo-configs/:id", requireMasterAdminOrTeam, async (req: Request, res: Response) => {
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
  app.get("/api/demo-bookings", requireMasterAdminOrTeam, async (req: Request, res: Response) => {
    try {
      const bookings = await storage.getAllDemoBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching demo bookings:", error);
      res.status(500).json({ error: "Failed to fetch demo bookings" });
    }
  });

  // POST /api/demo-bookings — create a booking and upsert a lead; rate limited
  app.post("/api/demo-bookings", formLimiter, async (req: Request, res: Response) => {
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

        const existingLead = await storage.getLeadByEmail(parsed.data.email, "default");
        if (existingLead) {
          await storage.updateLead(existingLead.id, {
            status: "demo_scheduled",
            company: parsed.data.company || existingLead.company,
          }, "default");
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
        userTimezone: booking.userTimezone,
      };
      sendBookingConfirmation(emailData).catch((err) =>
        console.error("[Email] Failed to send booking confirmation:", err)
      );
      sendTeamNotification(emailData).catch((err) =>
        console.error("[Email] Failed to send team notification:", err)
      );
      void sendTransactionalEmail("demo-booking-confirm", booking.email, {
        name: booking.name,
        slot: new Date(booking.slotDatetime).toISOString(),
        interestArea: booking.interestArea,
      });
    } catch (error) {
      console.error("Error creating demo booking:", error);
      res.status(500).json({ error: "Failed to create demo booking" });
    }
  });

  // PATCH /api/demo-bookings/:id/status — update booking status (admin)
  app.patch("/api/demo-bookings/:id/status", requireMasterAdminOrTeam, async (req: Request, res: Response) => {
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

  app.get("/api/demo-configs/:id", requireMasterAdminOrTeam, async (req: Request, res: Response) => {
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
  app.use("/api/internal", requireMasterAdminOrTeam, internalRoutes);

  // ==========================================
  // SAP INTEGRATION ENDPOINTS (Protected)
  // ==========================================
  app.use("/api/sap", isAuthenticated, sapRoutes);
  // Export endpoints (PPTX/DOCX) contain internal pricing, roadmap, and proposal content
  // — restricted to authenticated team/admin users only.
  app.use("/api/export", requireMasterAdminOrTeam, exportRoutes);

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

    const response = await aiClient.chat.completions.create({
      model: AI_CHAT_MODEL,
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
