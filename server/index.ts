import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { setupEventHandlers } from "./events/handlers";
import { storage } from "./storage";
import { seedDemoData } from "./seed-demo-data";
import bcrypt from "bcryptjs";
import { scheduleConnectorSync } from "./services/sap-odata-client";
import type { SAPConfig } from "@shared/schema";

const app = express();
const httpServer = createServer(app);

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

// Serve stock images from attached_assets directory
app.use("/assets", express.static(path.resolve(process.cwd(), "attached_assets")));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

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

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
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
