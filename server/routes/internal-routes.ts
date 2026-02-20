import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { aiService } from "../services/ai-service";
import { productService } from "../services/product-service";
import { qrService } from "../services/qr-service";
import { identityService } from "../services/identity-service";
import { traceService } from "../services/trace-service";
import {
  insertCustomerAccountSchema,
  insertSupportTicketSchema,
  insertPersonaTemplateSchema,
  insertDemoInstanceSchema,
  type TicketPriority,
  type TicketCategory,
  type ActionStatus,
} from "@shared/schema";
import { MASTER_ADMIN_EMAILS } from "@shared/models/auth";
import { authStorage } from "../replit_integrations/auth/storage";
import OpenAI from "openai";
import type { RequestHandler } from "express";

const router = Router();

const isAdminUser: RequestHandler = async (req, res, next) => {
  try {
    const sessionUser = req.user as any;
    if (!sessionUser?.claims?.sub) {
      return res.status(403).json({ error: "Admin access required" });
    }
    const dbUser = await authStorage.getUser(sessionUser.claims.sub);
    if (!dbUser || !dbUser.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  } catch (error) {
    return res.status(403).json({ error: "Admin access required" });
  }
};

router.use(isAdminUser);

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

async function aiChat(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });
  return response.choices[0]?.message?.content || "{}";
}

// ==========================================
// CUSTOMER ACCOUNTS
// ==========================================

router.get("/accounts", async (req: Request, res: Response) => {
  try {
    const accounts = await storage.getAllCustomerAccounts();
    res.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

router.get("/accounts/:id", async (req: Request, res: Response) => {
  try {
    const account = await storage.getCustomerAccount(req.params.id);
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch account" });
  }
});

router.post("/accounts", async (req: Request, res: Response) => {
  try {
    const parsed = insertCustomerAccountSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
    const account = await storage.createCustomerAccount(parsed.data);
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ error: "Failed to create account" });
  }
});

router.patch("/accounts/:id", async (req: Request, res: Response) => {
  try {
    const account = await storage.updateCustomerAccount(req.params.id, req.body);
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: "Failed to update account" });
  }
});

router.delete("/accounts/:id", async (req: Request, res: Response) => {
  try {
    const success = await storage.deleteCustomerAccount(req.params.id);
    if (!success) return res.status(404).json({ error: "Account not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete account" });
  }
});

router.get("/accounts/:id/activities", async (req: Request, res: Response) => {
  try {
    const activities = await storage.getAccountActivities(req.params.id);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

router.post("/accounts/:id/activities", async (req: Request, res: Response) => {
  try {
    const activity = await storage.createAccountActivity({
      accountId: req.params.id,
      activityType: req.body.activityType,
      description: req.body.description,
      metadata: req.body.metadata || {},
    });
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: "Failed to create activity" });
  }
});

// ==========================================
// AI HEALTH SCORING
// ==========================================

router.post("/accounts/:id/health-score", async (req: Request, res: Response) => {
  try {
    const account = await storage.getCustomerAccount(req.params.id);
    if (!account) return res.status(404).json({ error: "Account not found" });

    const activities = await storage.getAccountActivities(req.params.id);
    const tickets = await storage.getAllSupportTickets();
    const accountTickets = tickets.filter(t => t.accountId === req.params.id);

    const result = await aiChat(
      `You are an AI account health analyzer for a B2B SaaS platform (PhotonicTag - Digital Product Passport platform).
Calculate a health score (0-100) based on the account data and activity patterns.
Consider: activity frequency, support ticket volume/severity, product usage, contract status.
Respond in JSON: { "healthScore": number, "trend": "improving"|"stable"|"declining", "factors": [{"name": string, "impact": "positive"|"negative"|"neutral", "detail": string}], "riskLevel": "low"|"medium"|"high" }`,
      `Account: ${account.companyName}
Tier: ${account.tier}, Status: ${account.status}, MRR: $${account.mrr || 0}
Products: ${account.productCount}, Industry: ${account.industry || 'Unknown'}
Contract: ${account.contractStartDate ? 'Active' : 'No contract'}
Recent activities (last 30): ${activities.slice(0, 30).map(a => a.activityType).join(', ') || 'None'}
Support tickets: ${accountTickets.length} total, ${accountTickets.filter(t => t.status === 'open').length} open`
    );

    const parsed = JSON.parse(result);
    await storage.updateCustomerAccount(req.params.id, { healthScore: parsed.healthScore });
    res.json(parsed);
  } catch (error) {
    console.error("Error calculating health score:", error);
    res.status(500).json({ error: "Failed to calculate health score" });
  }
});

// ==========================================
// AI NEXT BEST ACTION
// ==========================================

router.get("/accounts/:id/actions", async (req: Request, res: Response) => {
  try {
    const actions = await storage.getNextBestActions(req.params.id);
    res.json(actions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch actions" });
  }
});

router.post("/accounts/:id/generate-actions", async (req: Request, res: Response) => {
  try {
    const account = await storage.getCustomerAccount(req.params.id);
    if (!account) return res.status(404).json({ error: "Account not found" });

    const activities = await storage.getAccountActivities(req.params.id);

    const result = await aiChat(
      `You are a strategic sales advisor for PhotonicTag (B2B Digital Product Passport platform).
Generate 3 actionable next-best-action recommendations for the sales team.
Focus on: upsell opportunities, churn prevention, engagement, compliance support.
Respond in JSON: { "actions": [{"action": string, "reasoning": string, "priority": "low"|"medium"|"high"|"critical", "category": string}] }`,
      `Account: ${account.companyName}
Industry: ${account.industry || 'Unknown'}, Tier: ${account.tier}
Status: ${account.status}, Health Score: ${account.healthScore}/100
MRR: $${account.mrr || 0}, Products: ${account.productCount}
Contract end: ${account.contractEndDate || 'No contract'}
Last activity: ${account.lastActivityAt || 'Never'}
Recent activities: ${activities.slice(0, 10).map(a => `${a.activityType}: ${a.description || ''}`).join('; ') || 'None'}`
    );

    const parsed = JSON.parse(result);
    const createdActions = [];
    for (const action of parsed.actions || []) {
      const created = await storage.createNextBestAction({
        accountId: req.params.id,
        action: action.action,
        reasoning: action.reasoning,
        priority: action.priority,
        category: action.category,
        status: "pending",
      });
      createdActions.push(created);
    }
    res.json(createdActions);
  } catch (error) {
    console.error("Error generating actions:", error);
    res.status(500).json({ error: "Failed to generate actions" });
  }
});

router.patch("/actions/:id/status", async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const action = await storage.updateNextBestActionStatus(req.params.id, status as ActionStatus);
    if (!action) return res.status(404).json({ error: "Action not found" });
    res.json(action);
  } catch (error) {
    res.status(500).json({ error: "Failed to update action" });
  }
});

router.get("/actions/pending", async (req: Request, res: Response) => {
  try {
    const actions = await storage.getAllPendingActions();
    res.json(actions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending actions" });
  }
});

// ==========================================
// DEMO FACTORY - PERSONA TEMPLATES
// ==========================================

router.get("/personas", async (req: Request, res: Response) => {
  try {
    const templates = await storage.getAllPersonaTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch persona templates" });
  }
});

router.post("/personas", async (req: Request, res: Response) => {
  try {
    const parsed = insertPersonaTemplateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
    const template = await storage.createPersonaTemplate(parsed.data);
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ error: "Failed to create persona template" });
  }
});

// ==========================================
// DEMO FACTORY - DEMO INSTANCES
// ==========================================

router.get("/demos", async (req: Request, res: Response) => {
  try {
    const instances = await storage.getAllDemoInstances();
    res.json(instances);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch demo instances" });
  }
});

router.get("/demos/:id", async (req: Request, res: Response) => {
  try {
    const instance = await storage.getDemoInstance(req.params.id);
    if (!instance) return res.status(404).json({ error: "Demo instance not found" });
    res.json(instance);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch demo instance" });
  }
});

router.post("/demos/provision", async (req: Request, res: Response) => {
  try {
    const { prospectName, prospectEmail, prospectCompany, industry, personaTemplate } = req.body;
    if (!prospectName || !industry) {
      return res.status(400).json({ error: "prospectName and industry are required" });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const instance = await storage.createDemoInstance({
      prospectName,
      prospectEmail,
      prospectCompany,
      industry,
      personaTemplate,
      expiresAt,
      provisionedBy: (req.user as any)?.id || "admin",
    });

    provisionDemoAsync(instance.id, industry, prospectName).catch(err => {
      console.error("Error provisioning demo:", err);
    });

    res.status(201).json(instance);
  } catch (error) {
    console.error("Error creating demo instance:", error);
    res.status(500).json({ error: "Failed to provision demo" });
  }
});

async function provisionDemoAsync(instanceId: string, industry: string, prospectName: string) {
  try {
    const result = await aiChat(
      `You are a product data generator for Digital Product Passports (DPP) under EU ESPR Regulation 2024/1781. Generate realistic product data for the ${industry} industry for a prospect named "${prospectName}".
Return a JSON object with "products" array of 3 products. Each product must have: productName, productCategory, modelNumber, sku, manufacturer, countryOfOrigin, batchNumber, materials, carbonFootprint (number), repairabilityScore (1-10), warrantyInfo, recyclingInstructions, recycledContentPercent (0-100), recyclabilityPercent (0-100).`,
      `Generate 3 realistic ${industry} products for a demo environment.`
    );

    const parsed = JSON.parse(result);
    const productIds: string[] = [];

    for (const p of parsed.products || []) {
      try {
        const product = await productService.createProduct({
          productName: p.productName || `${industry} Demo Product`,
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
          recyclingInstructions: p.recyclingInstructions || "Contact manufacturer",
          recycledContentPercent: p.recycledContentPercent,
          recyclabilityPercent: p.recyclabilityPercent,
        });
        await qrService.generateQRCode(product.id);
        await identityService.createIdentity(product.id);
        productIds.push(product.id);
      } catch (err) {
        console.error("Error creating demo product:", err);
      }
    }

    await storage.updateDemoInstance(instanceId, {
      status: "active",
      productIds,
      demoUrl: `/scan/demo`,
    });
  } catch (error) {
    console.error("Demo provisioning failed:", error);
    await storage.updateDemoInstance(instanceId, { status: "expired" });
  }
}

router.patch("/demos/:id", async (req: Request, res: Response) => {
  try {
    const instance = await storage.updateDemoInstance(req.params.id, req.body);
    if (!instance) return res.status(404).json({ error: "Demo instance not found" });
    res.json(instance);
  } catch (error) {
    res.status(500).json({ error: "Failed to update demo instance" });
  }
});

router.delete("/demos/:id", async (req: Request, res: Response) => {
  try {
    const success = await storage.deleteDemoInstance(req.params.id);
    if (!success) return res.status(404).json({ error: "Demo instance not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete demo instance" });
  }
});

// ==========================================
// SUPPORT TICKETS
// ==========================================

router.get("/tickets", async (req: Request, res: Response) => {
  try {
    const tickets = await storage.getAllSupportTickets();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

router.get("/tickets/:id", async (req: Request, res: Response) => {
  try {
    const ticket = await storage.getSupportTicket(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ticket" });
  }
});

router.post("/tickets", async (req: Request, res: Response) => {
  try {
    const parsed = insertSupportTicketSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data", details: parsed.error.issues });

    const ticket = await storage.createSupportTicket(parsed.data);

    triageTicketAsync(ticket.id, ticket.subject, ticket.description).catch(err => {
      console.error("Error triaging ticket:", err);
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: "Failed to create ticket" });
  }
});

async function triageTicketAsync(ticketId: string, subject: string, description: string) {
  try {
    const result = await aiChat(
      `You are an AI support triage agent for PhotonicTag (Digital Product Passport platform).
Analyze the support ticket and provide:
1. A concise summary
2. Suggested priority (low, medium, high, urgent)
3. Category (billing, technical, integration, compliance, feature_request, general)
4. Relevant tags (array of strings with # prefix, e.g., "#SAP", "#Compliance")
Respond in JSON: { "summary": string, "priority": "low"|"medium"|"high"|"urgent", "category": string, "tags": string[] }`,
      `Subject: ${subject}\nDescription: ${description}`
    );

    const parsed = JSON.parse(result);
    await storage.updateSupportTicket(ticketId, {
      aiSummary: parsed.summary,
      aiSuggestedPriority: parsed.priority as TicketPriority,
      aiSuggestedCategory: parsed.category as TicketCategory,
      aiSuggestedTags: parsed.tags || [],
    });
  } catch (error) {
    console.error("Ticket triage failed:", error);
  }
}

router.patch("/tickets/:id", async (req: Request, res: Response) => {
  try {
    const updates = { ...req.body };
    if (updates.status === "resolved") updates.resolvedAt = new Date();
    const ticket = await storage.updateSupportTicket(req.params.id, updates);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: "Failed to update ticket" });
  }
});

// ==========================================
// PLATFORM OPS & MONITORING
// ==========================================

router.get("/ops/health", async (req: Request, res: Response) => {
  try {
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();
    const allProducts = await storage.getAllProducts();
    const allAccounts = await storage.getAllCustomerAccounts();
    const allTickets = await storage.getAllSupportTickets();
    const allDemos = await storage.getAllDemoInstances();

    res.json({
      status: "healthy",
      uptime: Math.floor(uptime),
      uptimeFormatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
      },
      counts: {
        products: allProducts.length,
        accounts: allAccounts.length,
        tickets: allTickets.length,
        openTickets: allTickets.filter(t => t.status === "open" || t.status === "in_progress").length,
        activeDemos: allDemos.filter(d => d.status === "active").length,
        totalDemos: allDemos.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch health data" });
  }
});

router.get("/ops/metrics", async (req: Request, res: Response) => {
  try {
    const { type, limit } = req.query;
    const metrics = await storage.getMetrics(
      type as string | undefined,
      limit ? parseInt(limit as string) : 100
    );
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

router.post("/ops/metrics", async (req: Request, res: Response) => {
  try {
    const { metricType, value, metadata } = req.body;
    await storage.recordMetric(metricType, value, metadata);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to record metric" });
  }
});

// ==========================================
// SEED DEFAULT PERSONA TEMPLATES
// ==========================================

router.post("/personas/seed-defaults", async (req: Request, res: Response) => {
  try {
    const existing = await storage.getAllPersonaTemplates();
    if (existing.length > 0) {
      return res.json({ message: "Templates already exist", count: existing.length });
    }

    const defaults = [
      { name: "Automotive", industry: "Automotive", description: "EV battery packs, charging units, and automotive components with EU Battery Regulation compliance data", productCount: 3, isDefault: true },
      { name: "Textiles & Fashion", industry: "Textiles", description: "Sustainable fashion items with material composition, water usage, and supply chain traceability", productCount: 3, isDefault: true },
      { name: "Consumer Electronics", industry: "Electronics", description: "Smart devices and IoT sensors with repairability scores and e-waste recycling data", productCount: 3, isDefault: true },
      { name: "Industrial Batteries", industry: "Batteries", description: "Industrial battery cells with carbon footprint data, recycled content, and state-of-health tracking", productCount: 3, isDefault: true },
      { name: "Packaging", industry: "Packaging", description: "Sustainable packaging solutions with recyclability data and material sourcing information", productCount: 3, isDefault: true },
      { name: "Furniture", industry: "Furniture", description: "Office and home furniture with wood sourcing certifications, VOC data, and disassembly instructions", productCount: 3, isDefault: true },
    ];

    const created = [];
    for (const d of defaults) {
      const template = await storage.createPersonaTemplate(d);
      created.push(template);
    }
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Failed to seed templates" });
  }
});

export default router;