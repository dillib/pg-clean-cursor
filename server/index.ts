import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { setupEventHandlers } from "./events/handlers";
import { storage } from "./storage";
import { seedDemoData } from "./seed-demo-data";
import bcrypt from "bcryptjs";

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
