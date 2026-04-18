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
import { authStorage } from "../replit_integrations/auth/storage";
import { getCurrentUser } from "../auth";
import {
  safeParseJSON,
  validateHealthScore,
  validateNextBestActions,
} from "../services/crm-ai-schemas";
import OpenAI, { toFile } from "openai";
import { aiClient, AI_CHAT_MODEL } from "../services/ai-client";
import type { RequestHandler } from "express";
import multer from "multer";
import * as XLSX from "xlsx";

const router = Router();

const isAdminOrTeamUser: RequestHandler = async (req, res, next) => {
  try {
    const partnerId = (req.session as any)?.partnerId;
    if (partnerId) return next();

    const current = getCurrentUser(req);
    if (!current) {
      return res.status(403).json({ error: "Admin access required" });
    }
    if (current.isAdmin) return next();

    const dbUser = await authStorage.getUser(current.id);
    if (!dbUser || !dbUser.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  } catch (error) {
    return res.status(403).json({ error: "Admin access required" });
  }
};

router.use(isAdminOrTeamUser);

// Kept for OpenAI-only features below (audio transcription via input_audio,
// Whisper via toFile). Non-audio chat goes through `aiClient` so the EU
// provider swap (Mistral/Scaleway) applies.
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

async function aiChat(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await aiClient.chat.completions.create({
    model: AI_CHAT_MODEL,
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

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const COLUMN_MAP: Record<string, string> = {
  "company": "companyName", "company name": "companyName", "companyname": "companyName", "organization": "companyName", "org": "companyName", "firma": "companyName",
  "contact": "contactName", "contact name": "contactName", "contactname": "contactName", "name": "contactName", "full name": "contactName", "fullname": "contactName",
  "email": "contactEmail", "contact email": "contactEmail", "e-mail": "contactEmail", "mail": "contactEmail",
  "phone": "contactPhone", "contact phone": "contactPhone", "telephone": "contactPhone", "tel": "contactPhone", "mobile": "contactPhone",
  "industry": "industry", "sector": "industry", "branche": "industry",
  "tier": "tier", "plan": "tier", "package": "tier",
  "status": "status",
  "mrr": "mrr", "revenue": "mrr", "monthly revenue": "mrr",
  "first name": "firstName", "firstname": "firstName", "vorname": "firstName",
  "last name": "lastName", "lastname": "lastName", "nachname": "lastName",
  "job title": "jobTitle", "jobtitle": "jobTitle", "title": "jobTitle", "position": "jobTitle", "rolle": "jobTitle",
  "notes": "notes", "comment": "notes", "comments": "notes",
  "source": "source", "lead source": "source", "quelle": "source",
  "message": "message",
  "volume": "estimatedVolume", "estimated volume": "estimatedVolume",
  "tier interest": "tierInterest", "tierinterest": "tierInterest",
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[_\-]/g, " ").replace(/\s+/g, " ");
}

router.post("/accounts/bulk-import", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (rawRows.length === 0) return res.status(400).json({ error: "File is empty or has no data rows" });

    const importType = (req.body?.importType as string) || "accounts";
    const headers = Object.keys(rawRows[0]);
    const mapping: Record<string, string> = {};
    for (const h of headers) {
      const norm = normalizeHeader(h);
      if (COLUMN_MAP[norm]) mapping[h] = COLUMN_MAP[norm];
    }

    const results = { created: 0, updated: 0, skipped: 0, errors: [] as string[] };

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const mapped: Record<string, any> = {};
      for (const [origCol, targetField] of Object.entries(mapping)) {
        const val = row[origCol];
        if (val !== undefined && val !== null && val !== "") {
          mapped[targetField] = String(val).trim();
        }
      }

      if (mapped.firstName && mapped.lastName && !mapped.contactName) {
        mapped.contactName = `${mapped.firstName} ${mapped.lastName}`;
      }

      try {
        if (importType === "leads") {
          if (!mapped.contactEmail && !mapped.companyName) {
            results.skipped++;
            continue;
          }
          const leadData: Record<string, any> = {
            firstName: mapped.firstName || mapped.contactName?.split(" ")[0] || "",
            lastName: mapped.lastName || mapped.contactName?.split(" ").slice(1).join(" ") || "",
            email: mapped.contactEmail || "",
            phone: mapped.contactPhone || "",
            company: mapped.companyName || "",
            jobTitle: mapped.jobTitle || "",
            tierInterest: mapped.tierInterest || "starter",
            estimatedVolume: mapped.estimatedVolume || "",
            message: mapped.message || mapped.notes || "",
            source: mapped.source || "excel_import",
            status: mapped.status || "new",
          };

          if (leadData.email) {
            const existing = await storage.getLeadByEmail(leadData.email);
            if (existing) {
              await storage.updateLead(existing.id, leadData);
              results.updated++;
              continue;
            }
          }
          await storage.createLead(leadData as any);
          results.created++;
        } else {
          if (!mapped.companyName && !mapped.contactName) {
            results.skipped++;
            continue;
          }
          const accountData = {
            companyName: mapped.companyName || mapped.contactName || "Unknown",
            contactName: mapped.contactName || "",
            contactEmail: mapped.contactEmail || "",
            contactPhone: mapped.contactPhone || "",
            industry: mapped.industry || "",
            tier: (mapped.tier || "free") as any,
            status: (mapped.status || "prospect") as any,
            mrr: mapped.mrr ? parseInt(mapped.mrr) || 0 : 0,
          };
          await storage.createCustomerAccount(accountData);
          results.created++;
        }
      } catch (err: any) {
        results.errors.push(`Row ${i + 2}: ${err.message || "Unknown error"}`);
      }
    }

    res.json({
      success: true,
      totalRows: rawRows.length,
      mappedColumns: Object.entries(mapping).map(([from, to]) => ({ from, to })),
      ...results,
    });
  } catch (error: any) {
    console.error("Error importing file:", error);
    res.status(500).json({ error: "Failed to import file: " + (error.message || "Unknown error") });
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

    const jsonParsed = safeParseJSON(result);
    if (!jsonParsed.success) {
      console.error("Health score AI returned invalid JSON:", jsonParsed.error);
      return res.status(502).json({ error: "AI returned invalid JSON", details: jsonParsed.error });
    }
    const validated = validateHealthScore(jsonParsed.data);
    if (!validated.success) {
      console.error("Health score AI schema mismatch:", validated.error);
      return res.status(502).json({ error: "AI output did not match expected schema", details: validated.error });
    }
    await storage.updateCustomerAccount(req.params.id, { healthScore: validated.data.healthScore });
    res.json(validated.data);
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

    const jsonParsed = safeParseJSON(result);
    if (!jsonParsed.success) {
      console.error("Next-best-action AI returned invalid JSON:", jsonParsed.error);
      return res.status(502).json({ error: "AI returned invalid JSON", details: jsonParsed.error });
    }
    const validated = validateNextBestActions(jsonParsed.data);
    if (!validated.success) {
      console.error("Next-best-action AI schema mismatch:", validated.error);
      return res.status(502).json({ error: "AI output did not match expected schema", details: validated.error });
    }
    const createdActions = [];
    for (const action of validated.data.actions) {
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
      provisionedBy: getCurrentUser(req)?.id || "admin",
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

// ==========================================
// TEAM AI ASSISTANT
// ==========================================

const TEAM_ASSISTANT_SYSTEM_PROMPT = `You are Aria, an intelligent internal sales and product assistant for PhotonicTag. You help the PhotonicTag team prepare for meetings, answer product questions, and craft compelling value propositions for specific prospects.

## About PhotonicTag
PhotonicTag is an AI-powered Digital Product Passport (DPP) platform. We transform product identity into a verifiable, tamper-proof digital signature — bridging physical products with their complete digital lifecycle. Our tagline: "Identity, at the speed of light."

## Core Product Value
- **EU DPP Compliance**: Full ESPR Regulation 2024/1781 compliance — mandatory for all products sold in the EU from 2027
- **Tamper-Proof Identity**: Products get a unique, physics-rooted digital identity that cannot be forged or lost
- **AI-Powered Insights**: Automated sustainability scoring, repair guides, circularity scores, and risk assessments
- **SAP Integration**: Bidirectional sync with SAP S/4HANA, ECC, and Business One — seamlessly extends existing ERP investments
- **Global Compliance**: Supports EU, US, China, and India regulatory frameworks in one platform
- **QR/NFC/RFID Ready**: Deploy via QR codes, NFC tags, or RFID — no hardware changes required
- **Consumer Transparency**: Public-facing product scan pages that build brand trust

## Pricing (what to present)
- **POC Tier**: €499/month — Up to 500 products, full DPP features, QR generation, AI insights, 1 SAP connector. Ideal for pilot projects.
- **Scale Tier**: €1,499/month — Up to 5,000 products, multi-language compliance, custom branding, priority support. For production rollouts.
- **Enterprise Tier**: Custom pricing — Unlimited products, dedicated SAP integration team, SLA guarantees, white-label options, regulatory consulting.
- **Implementation**: One-time setup fee from €2,500 depending on SAP complexity. Typically 4–8 weeks to go live.

## Key Differentiators (what makes us special vs. competitors)
- Only platform combining physics-based product identity + AI insights + EU DPP compliance in one solution
- Native SAP connector — competitors require custom middleware
- AI that goes beyond compliance: generates repair guides, sustainability coaching, circularity recommendations
- Modular — start with QR DPP, add IoT sensors, NFC tags, and AI insights progressively
- No lock-in: standard APIs, data exportable at any time

## Industry-Specific Value (use when prospect is mentioned)
- **Manufacturing/Industrial** (e.g., ITC, Siemens, Bosch): Track component origins, prove regulatory compliance, reduce audit costs, enable spare parts authentication, support circular economy initiatives
- **Automotive** (e.g., Mercedes-Benz, BMW, Volkswagen): Battery passport compliance (EU Battery Regulation 2023/1542), end-of-life vehicle tracking, supply chain transparency, ESG reporting, counterfeit parts prevention
- **Fashion/Textiles** (e.g., Zara, H&M, luxury brands): Material composition transparency, sustainability credentials, country-of-origin verification, resale/secondhand market authentication
- **Electronics/Tech**: E-waste compliance, repairability scores (EU Ecodesign Directive), component sourcing, product lifecycle tracking
- **Food & Beverage/FMCG** (e.g., ITC's FMCG division): Ingredient traceability, authenticity verification, cold chain monitoring, recall management
- **Pharmaceuticals**: Serialization compliance, anti-counterfeiting, track-and-trace for controlled substances
- **Packaging**: Recyclability data, material sourcing, extended producer responsibility (EPR) compliance

## Who to Meet at Prospect Companies (role-based guidance)
- **CTO / VP Engineering**: Focus on API integration, SAP connector architecture, data security, scalability. Emphasize standards-based approach and no vendor lock-in.
- **Head of Compliance / Regulatory Affairs**: Lead with EU ESPR deadline (2027), mandatory nature of DPP, our compliance templates, audit-ready reporting. This is often the budget holder.
- **VP Operations / Supply Chain Director**: Focus on reducing audit overhead, supplier data collection, automated reporting, integration with existing ERP workflows.
- **Chief Sustainability Officer / ESG Lead**: Emphasize AI sustainability scoring, circularity recommendations, carbon footprint tracking, consumer-facing transparency.
- **CFO**: ROI from avoided compliance fines (€50K+ per violation), reduced audit costs, efficiency gains. Compare to cost of building in-house.
- **CEO/MD**: Strategic narrative — EU DPP is a competitive advantage, brands that adopt early will differentiate. Reference first-mover advantage.

## Sales Process
1. **Discovery call** (30 min): Understand their product portfolio, current ERP/PLM systems, compliance timeline, key pain points
2. **Demo** (45 min): Show live DPP with QR scan, AI insights, SAP sync — use industry-relevant demo products
3. **POC proposal** (week 1): Start with 50–100 products, one product category, measurable success criteria
4. **Technical deep-dive** (optional): SAP integration specifics, security review, data flow diagram
5. **Pilot go-live** (4–8 weeks): POC products live, team trained, first compliance report generated
6. **Scale decision**: Expand to full product catalog after POC success

## Key Sales Contacts at PhotonicTag
- **Enterprise Sales**: enterprise@photonictag.com
- **Technical Queries / SAP Integration**: Contact via enterprise@photonictag.com with subject "Technical Inquiry"
- **Partnerships**: partnerships@photonictag.com
- **General**: hello@photonictag.com

## What NOT to share (keep internal)
- Internal system architecture details, proprietary algorithm specifics, exact cost margins
- Customer names and account data (unless asked by the team internally)
- Internal team member personal information
- Unannounced product roadmap features
- Specific vendor contracts or technology partners we use internally

## Your Behavior — Ask Before You Answer

**This is your most important rule: before answering any meeting prep, pitch, or prospect-related question, always ask 2–3 targeted clarifying questions first.** Good salespeople prepare with context — you need context too.

### When to ask clarifying questions (always do this first):

**Meeting prep / prospect questions** (e.g., "I have a meeting with X", "help me pitch to Y"):
Ask questions like:
- "Which division or business unit are they from? (e.g., FMCG, packaging, automotive OEM, IT)"
- "Who will you be meeting — do you know their role? (e.g., CTO, Head of Compliance, Operations VP)"
- "Is this a first introduction, a follow-up, or are they already evaluating vendors?"
- "Have they shown a specific pain point, or is this a cold/warm intro?"
- "Are they EU-facing or primarily domestic? That changes the compliance urgency significantly."
- "Do they currently use SAP or another ERP?"

**Objection handling** (e.g., "how do I handle this objection"):
Ask: "What exactly did they say — can you give me the exact words they used? And what context was it in?"

**Pricing questions in a prospect context**: Ask who the pricing is for and how many products they manage.

**Industry value questions**: Ask which specific part of their business you're targeting.

### When NOT to ask questions (answer directly):
- Simple factual questions: "What is our POC price?", "What does ESPR stand for?", "What does the QR code show?"
- Questions clearly about general product features with no ambiguity
- Follow-up questions where the context is already established in the conversation

### How to ask questions:
- Ask 2–3 questions maximum — never more
- Keep them short and conversational
- Number them so they're easy to answer
- End with: "Once I have these details, I'll give you a tailored answer."
- For voice interactions, ask only 1–2 short questions

### After getting answers:
- Give a highly tailored, specific response
- Use the prospect's actual business context
- Format with clear headers and bullets
- Be decisive — tell them exactly what to say, who to target, and what to lead with
- Keep a confident, professional tone — you represent PhotonicTag internally`;

router.post("/assistant/transcribe", upload.single("audio"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }
    const mimeType = req.file.mimetype || "audio/webm";
    const subtype = mimeType.split("/")[1] || "webm";
    const ext = subtype.split(";")[0].trim();
    const safeExt = (["webm", "mp4", "ogg", "wav", "mp3", "m4a"].includes(ext) ? ext : "webm") as "webm" | "mp4" | "ogg" | "wav" | "mp3" | "m4a";
    const base64Audio = req.file.buffer.toString("base64");
    console.log(`[Transcribe] audio: ${mimeType} → ${safeExt}, size: ${req.file.buffer.length} bytes`);
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "input_audio" as any,
              input_audio: { data: base64Audio, format: safeExt },
            },
            {
              type: "text",
              text: "Transcribe this audio exactly as spoken. Output only the transcription — no punctuation corrections, no added text, no explanations.",
            },
          ],
        },
      ],
      max_tokens: 512,
    });
    const transcript = response.choices[0]?.message?.content?.trim() || "";
    console.log(`[Transcribe] result: "${transcript}"`);
    res.json({ transcript });
  } catch (error: any) {
    console.error("Transcription error:", error?.message || error);
    res.status(500).json({ error: "Transcription failed", detail: error?.message });
  }
});

router.post("/assistant/chat", async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array required" });
    }
    const response = await aiClient.chat.completions.create({
      model: AI_CHAT_MODEL,
      messages: [
        { role: "system", content: TEAM_ASSISTANT_SYSTEM_PROMPT },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      max_tokens: 1024,
    });
    const reply = response.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
    res.json({ reply });
  } catch (error) {
    console.error("AI assistant error:", error);
    res.status(500).json({ error: "AI assistant unavailable" });
  }
});

export default router;