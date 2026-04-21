import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import pinoHttp from "pino-http";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { setupEventHandlers } from "./events/handlers";
import { storage } from "./storage";
import { seedDemoData } from "./seed-demo-data";
import bcrypt from "bcryptjs";
import { scheduleConnectorSync } from "./services/sap-odata-client";
import { startReminderScheduler } from "./services/reminder-scheduler";
import { describeAIProvider } from "./services/ai-client";
import { hostPolicyMiddleware } from "./middleware/host-policy";
import { logger } from "./logger";
import {
  httpRequestDuration,
  httpRequestsTotal,
  register as metricsRegister,
} from "./metrics";
import type { SAPConfig } from "@shared/schema";

logger.info({ aiProvider: describeAIProvider() }, "[startup] AI provider");

const app = express();
const httpServer = createServer(app);

// Structured request logging. Trim serializers so we don't dump full bodies
// (which can contain PII / secrets) — headers are redacted via logger config.
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: (req as any).id,
          method: req.method,
          url: req.url,
          remoteAddress: req.remoteAddress,
          remotePort: req.remotePort,
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
  }),
);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Prometheus metrics endpoint. Gated behind METRICS_TOKEN; if the env var
// is not set the endpoint is disabled (404) entirely.
app.get("/metrics", async (req, res) => {
  const expected = process.env.METRICS_TOKEN;
  if (!expected) {
    res.status(404).end();
    return;
  }
  const provided = req.header("x-metrics-token");
  if (provided !== expected) {
    res.status(404).end();
    return;
  }
  try {
    res.set("Content-Type", metricsRegister.contentType);
    res.end(await metricsRegister.metrics());
  } catch (err) {
    (req as any).log?.error?.({ err }, "metrics scrape failed");
    res.status(500).end();
  }
});

// Metrics: record duration + count for every request. Uses `req.route?.path`
// when available so cardinality stays bounded (not the raw URL).
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    const route = (req as any).route?.path || req.baseUrl || req.path || "unknown";
    const labels = {
      method: req.method,
      route: typeof route === "string" ? route : String(route),
      status: String(res.statusCode),
    };
    end(labels);
    httpRequestsTotal.inc(labels);
  });
  next();
});

// Serve stock images from attached_assets directory
app.use("/assets", express.static(path.resolve(process.cwd(), "attached_assets")));

// Gate ops vs customer paths by host. Defaults to HOST_MODE=any (no-op)
// until HOST_MODE / APP_HOSTS / OPS_HOSTS are set in prod — Phase 1 of the
// three-system separation ships the capability without flipping the switch.
app.use(hostPolicyMiddleware());

// Legacy helper kept for backwards compatibility with existing call sites.
// New code should use `logger` / `req.log` directly.
export function log(message: string, source = "express") {
  logger.info({ source }, message);
}

(async () => {
  setupEventHandlers();
  
  await registerRoutes(httpServer, app);

  // Auto-seed demo data if database is empty
  try {
    const existingProducts = await storage.getAllProducts();
    if (existingProducts.length === 0) {
      log("No products found in database. Seeding demo data...");
      await seedDemoData();
      log("Demo data seeded successfully!");
    } else {
      log(`Database has ${existingProducts.length} products`);
    }
  } catch (error) {
    log(`Error checking/seeding demo data: ${error}`);
  }

  // Migrate old product images to new pro versions
  try {
    const imageMap: Record<string, string> = {
      "/assets/stock_images/lithium_ion_battery__913af259.jpg": "/assets/stock_images/battery_pack_pro.png",
      "/assets/stock_images/lithium_ion_battery__e9545ddb.jpg": "/assets/stock_images/battery_pack_pro.png",
      "/assets/stock_images/premium_merino_wool__c7ed7cc2.jpg": "/assets/stock_images/wool_sweater_pro.png",
      "/assets/stock_images/merino_wool_sweater__bf977340.jpg": "/assets/stock_images/wool_sweater_pro.png",
      "/assets/stock_images/smart_home_hub_devic_8ba94000.jpg": "/assets/stock_images/smarthome_hub_pro.png",
      "/assets/stock_images/eco_friendly_biodegr_38f4835c.jpg": "/assets/stock_images/packaging_container_pro.png",
      "/assets/stock_images/electric_vehicle_car_73ff6ee8.jpg": "/assets/stock_images/ev_charging_cable_pro.png",
      "/assets/stock_images/electric_vehicle_ev__bf4ed89b.jpg": "/assets/stock_images/ev_charging_cable_pro.png",
      "/assets/stock_images/premium_wireless_hea_9e631693.jpg": "/assets/stock_images/headphones_pro.png",
      "/assets/stock_images/premium_wireless_noi_6d22461d.jpg": "/assets/stock_images/headphones_pro.png",
      "/assets/stock_images/luxury_leather_handb_03681045.jpg": "/assets/stock_images/leather_tote_pro.png",
      "/assets/stock_images/luxury_leather_handb_0c8e215c.jpg": "/assets/stock_images/leather_tote_pro.png",
      "/assets/stock_images/smart_home_thermosta_3e0251e2.jpg": "/assets/stock_images/thermostat_pro.png",
      "/assets/stock_images/industrial_rubber_co_6782e308.jpg": "/assets/stock_images/conveyor_belt_pro.png",
      "/assets/stock_images/industrial_steel_con_6d4421ed.jpg": "/assets/stock_images/conveyor_roller_pro.png",
      "/assets/stock_images/hiking_backpack_outd_db06293e.jpg": "/assets/stock_images/leather_tote_pro.png",
      "/assets/stock_images/industrial_iot_senso_ecc9a791.jpg": "/assets/stock_images/conveyor_roller_pro.png",
    };
    const allProducts = await storage.getAllProducts();
    let migratedCount = 0;
    for (const product of allProducts) {
      if (product.productImage && imageMap[product.productImage]) {
        await storage.updateProduct(product.id, { productImage: imageMap[product.productImage] });
        migratedCount++;
      }
    }
    if (migratedCount > 0) log(`  Migrated ${migratedCount} product image(s) to new pro versions`);
  } catch (error) {
    log(`Error migrating product images: ${error}`);
  }

  try {
    const defaultAccounts = [
      { email: "demo@photonictag.com", firstName: "Demo", lastName: "User", company: "PhotonicTag Demo", role: "demo_viewer" as const, status: "active" as const, password: "demo2024" },
      { email: "team@photonictag.com", firstName: "Team", lastName: "Member", company: "PhotonicTag", role: "sales_partner" as const, status: "active" as const, password: "team2024" },
      { email: "admin@photonictag.com", firstName: "Admin", lastName: "User", company: "PhotonicTag", role: "consultant" as const, status: "active" as const, password: "admin2024" },
    ];
    for (const account of defaultAccounts) {
      const existing = await storage.getPartnerByEmail(account.email);
      const passwordHash = await bcrypt.hash(account.password, 10);
      if (!existing) {
        await storage.createPartner({
          email: account.email,
          firstName: account.firstName,
          lastName: account.lastName,
          company: account.company,
          role: account.role,
          status: account.status,
          passwordHash,
        });
        log(`  Created partner: ${account.email} (${account.role})`);
      } else {
        await storage.updatePartner(existing.id, { passwordHash });
        log(`  Reset password for: ${account.email}`);
      }
    }
    const allPartners = await storage.getAllPartners();
    log(`Partner accounts ready (${allPartners.length} total)`);
  } catch (error) {
    log(`Error seeding partner accounts: ${error}`);
  }

  // Seed a demo SAP connector if none exists
  try {
    const existingConnectors = await storage.getAllEnterpriseConnectors();
    const hasSap = existingConnectors.some(c => c.connectorType === "sap");
    if (!hasSap) {
      await storage.createEnterpriseConnector({
        name: "PhotonicTag Demo SAP (S/4HANA)",
        connectorType: "sap",
        status: "active",
        config: {
          systemType: "S4HANA", hostname: "demo.sap.example.com", port: 443,
          client: "100", systemId: "PT1", apiType: "OData",
          authMethod: "basic", username: "PTDEMO", password: "",
          oauthEnabled: false, syncDirection: "inbound",
          syncFrequency: "daily", scheduledSyncEnabled: false,
          scheduledSyncIntervalMinutes: 60, sslVerify: true,
        } as SAPConfig,
        fieldMappings: [
          { sourceField: "MATNR", targetField: "productName", transformation: "trim" },
          { sourceField: "MAKTX", targetField: "productCategory" },
          { sourceField: "WERKS", targetField: "manufacturer" },
          { sourceField: "CHARG", targetField: "batchNumber" },
          { sourceField: "MATNR_EXT", targetField: "sku" },
          { sourceField: "MATKL", targetField: "materials" },
        ],
      });
      log("SAP demo connector seeded");
    }
  } catch (error) {
    log(`[SAP Seed] Error seeding demo connector: ${error}`);
  }

  // Seed demo sync history logs for compelling dashboard demo
  try {
    const connectors = await storage.getAllEnterpriseConnectors();
    const sapConnector = connectors.find(c => c.connectorType === "sap");
    if (sapConnector) {
      const existingLogs = await storage.getSyncLogsByConnectorId(sapConnector.id);
      if (existingLogs.length < 5) {
        const now = Date.now();
        const DAY = 86_400_000;
        // 14-day demo history: mostly successful with 2 realistic failures
        const demoRuns: Array<{ daysAgo: number; status: "completed" | "failed"; processed: number; created: number; updated: number; failed: number; error?: string; syncType: "full" | "delta" | "manual" }> = [
          { daysAgo: 14, status: "completed", processed: 20, created: 20, updated: 0, failed: 0, syncType: "full" },
          { daysAgo: 13, status: "completed", processed: 3,  created: 0,  updated: 3,  failed: 0, syncType: "delta" },
          { daysAgo: 12, status: "completed", processed: 7,  created: 1,  updated: 6,  failed: 0, syncType: "delta" },
          { daysAgo: 11, status: "completed", processed: 5,  created: 0,  updated: 5,  failed: 0, syncType: "delta" },
          { daysAgo: 10, status: "failed",    processed: 0,  created: 0,  updated: 0,  failed: 0, syncType: "delta", error: "Connection timeout: SAP host unreachable after 30s" },
          { daysAgo: 9,  status: "completed", processed: 12, created: 2,  updated: 10, failed: 0, syncType: "full" },
          { daysAgo: 8,  status: "completed", processed: 4,  created: 0,  updated: 4,  failed: 0, syncType: "delta" },
          { daysAgo: 7,  status: "completed", processed: 8,  created: 1,  updated: 7,  failed: 0, syncType: "delta" },
          { daysAgo: 6,  status: "completed", processed: 6,  created: 0,  updated: 6,  failed: 0, syncType: "delta" },
          { daysAgo: 5,  status: "failed",    processed: 2,  created: 0,  updated: 0,  failed: 2, syncType: "delta", error: "OData error: UNAUTHORIZED — token expired, renewal needed" },
          { daysAgo: 4,  status: "completed", processed: 15, created: 3,  updated: 12, failed: 0, syncType: "full" },
          { daysAgo: 3,  status: "completed", processed: 5,  created: 0,  updated: 5,  failed: 0, syncType: "delta" },
          { daysAgo: 2,  status: "completed", processed: 9,  created: 2,  updated: 7,  failed: 0, syncType: "delta" },
          { daysAgo: 1,  status: "completed", processed: 4,  created: 0,  updated: 4,  failed: 0, syncType: "delta" },
        ];
        for (const run of demoRuns) {
          const startedAt = new Date(now - run.daysAgo * DAY - 5 * 60 * 1000); // started 5 min before "now - N days"
          const completedAt = new Date(startedAt.getTime() + (run.status === "failed" ? 30_000 : 45_000 + run.processed * 800));
          const inserted = await storage.createIntegrationSyncLog({
            connectorId: sapConnector.id,
            syncType: run.syncType,
            status: run.status,
            recordsProcessed: run.processed,
            recordsCreated: run.created,
            recordsUpdated: run.updated,
            recordsFailed: run.failed,
            errorMessage: run.error ?? null,
            startedAt,
          });
          await storage.updateIntegrationSyncLog(inserted.id, { completedAt });
        }
        log(`SAP demo sync history seeded (${demoRuns.length} runs)`);
      }
    }
  } catch (error) {
    log(`[SAP Seed] Error seeding sync history: ${error}`);
  }

  // Auto-start SAP sync schedulers for active connectors
  try {
    const connectors = await storage.getAllEnterpriseConnectors();
    const sapConnectors = connectors.filter(c => c.connectorType === "sap" && c.status === "active");
    for (const connector of sapConnectors) {
      const config = connector.config as SAPConfig;
      if (config?.scheduledSyncEnabled) {
        scheduleConnectorSync(connector.id, config, async (connectorId, client) => {
          try {
            const result = await client.fetchMaterials({ top: 100 });
            await storage.updateEnterpriseConnector(connectorId, {
              lastSyncStatus: result.error ? `error: ${result.error}` : "ok",
              productsSynced: result.totalCount,
            });
            log(`[SAPScheduler] Auto-sync ${connectorId}: ${result.materials.length} materials (mock: ${result.usedMock})`);
          } catch (err) {
            log(`[SAPScheduler] Auto-sync error for ${connectorId}: ${err}`);
          }
        });
        log(`[SAPScheduler] Started scheduler for connector: ${connector.name}`);
      }
    }
  } catch (error) {
    log(`[SAPScheduler] Error initializing schedulers: ${error}`);
  }

  // Start demo booking reminder scheduler
  startReminderScheduler();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Never re-throw after sending a response — that can trigger uncaughtException
    // and take down the process while hiding the real client-facing error.
    if (res.headersSent) {
      console.error("[Express] Error after headers sent:", err);
      return;
    }
    res.status(status).json({ message });
    if (status >= 500) {
      console.error("[Express] Server error:", err);
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
