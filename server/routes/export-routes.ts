import { Router, Request, Response } from "express";
import pptxgen from "pptxgenjs";
const PptxGenJS = (pptxgen as any).default || pptxgen;
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, PageBreak, ShadingType, TabStopType, TabStopPosition } from "docx";

const router = Router();

const PRIMARY_COLOR = "0066CC";
const DARK_BG = "1A1A2E";
const LIGHT_BG = "F0F4F8";
const TEXT_DARK = "1A1A2E";
const TEXT_LIGHT = "FFFFFF";
const ACCENT_GREEN = "10B981";
const ACCENT_RED = "EF4444";

router.get("/api/export/presentation.pptx", async (_req: Request, res: Response) => {
  try {
    const pptx = new PptxGenJS();
    pptx.author = "PhotonicTag";
    pptx.company = "PhotonicTag GmbH";
    pptx.title = "PhotonicTag - AI-Powered Digital Product Passport Platform";
    pptx.subject = "EU ESPR Compliance Solution";
    pptx.layout = "LAYOUT_WIDE";

    // Slide 1: Title
    let slide = pptx.addSlide();
    slide.background = { color: DARK_BG };
    slide.addText("PhotonicTag", { x: 0.8, y: 1.2, w: 11, h: 1.2, fontSize: 48, bold: true, color: TEXT_LIGHT, fontFace: "Arial" });
    slide.addText("Identity, at the speed of light.", { x: 0.8, y: 2.5, w: 11, h: 0.8, fontSize: 28, color: PRIMARY_COLOR, fontFace: "Arial", italic: true });
    slide.addText("AI-Powered Digital Product Passport Platform\nEU ESPR Regulation (EU) 2024/1781 Compliance", { x: 0.8, y: 3.6, w: 9, h: 1.0, fontSize: 16, color: "AAAAAA", fontFace: "Arial" });
    slide.addText("CONFIDENTIAL — For authorized recipients only", { x: 0.8, y: 6.5, w: 11, h: 0.4, fontSize: 10, color: "666666", fontFace: "Arial" });

    // Slide 2: The Problem
    slide = pptx.addSlide();
    slide.background = { color: TEXT_LIGHT };
    slide.addText("The Regulatory Challenge", { x: 0.8, y: 0.4, w: 11, h: 0.8, fontSize: 32, bold: true, color: TEXT_DARK, fontFace: "Arial" });
    slide.addText("The EU Ecodesign for Sustainable Products Regulation (ESPR) mandates Digital Product Passports across all product categories by 2030. Non-compliance penalties reach €100,000+ per violation with EU market access restrictions.", { x: 0.8, y: 1.3, w: 11, h: 0.8, fontSize: 14, color: "555555", fontFace: "Arial" });

    const timeline = [
      { date: "Feb 2027", category: "Batteries", desc: "Industrial and EV batteries require Digital Product Passports under EU Battery Regulation", color: ACCENT_RED },
      { date: "2028", category: "Textiles & Electronics", desc: "Textiles, electronics, and ICT products must carry DPPs with material composition and repairability data", color: "F59E0B" },
      { date: "2029", category: "Furniture & Construction", desc: "Furniture, construction materials, and chemicals require full lifecycle documentation", color: PRIMARY_COLOR },
      { date: "2030", category: "All Categories", desc: "Universal DPP mandate across all product categories under ESPR (EU) 2024/1781", color: PRIMARY_COLOR },
    ];
    timeline.forEach((t, i) => {
      const y = 2.4 + i * 1.0;
      slide.addShape(pptx.ShapeType.roundRect, { x: 0.8, y, w: 1.4, h: 0.7, fill: { color: t.color }, rectRadius: 0.1 });
      slide.addText(t.date, { x: 0.8, y, w: 1.4, h: 0.7, fontSize: 12, bold: true, color: TEXT_LIGHT, align: "center", valign: "middle", fontFace: "Arial" });
      slide.addText(t.category, { x: 2.4, y, w: 3, h: 0.35, fontSize: 13, bold: true, color: TEXT_DARK, fontFace: "Arial" });
      slide.addText(t.desc, { x: 2.4, y: y + 0.3, w: 9.5, h: 0.4, fontSize: 11, color: "666666", fontFace: "Arial" });
    });

    // Slide 3: Platform Capabilities
    slide = pptx.addSlide();
    slide.background = { color: TEXT_LIGHT };
    slide.addText("Platform Capabilities", { x: 0.8, y: 0.4, w: 11, h: 0.7, fontSize: 32, bold: true, color: TEXT_DARK, fontFace: "Arial" });
    slide.addText("Six integrated modules covering the full Digital Product Passport lifecycle", { x: 0.8, y: 1.1, w: 11, h: 0.5, fontSize: 14, color: "555555", fontFace: "Arial" });

    const caps = [
      { title: "Digital Product Passports", desc: "EU ESPR-compliant product identity with tamper-proof QR codes linking physical products to their complete digital profile." },
      { title: "Anti-Counterfeiting", desc: "Physics-rooted identity signatures that cannot be forged, cloned, or reproduced. Verifiable via any smartphone." },
      { title: "IoT & Smart Tagging", desc: "NFC, RFID, and BLE device management for real-time product tracking and sensor data throughout the supply chain." },
      { title: "AI Sustainability Intelligence", desc: "Automated carbon footprint scoring, circularity assessment (A+ to F), repair guides, and risk analysis." },
      { title: "SAP & ERP Integration", desc: "Bidirectional sync with SAP S/4HANA, ECC, and Business One. Automated field mapping and conflict resolution." },
      { title: "Supply Chain Traceability", desc: "End-to-end visibility from raw material sourcing to end-of-life recycling with CloudEvents audit trail." },
    ];
    caps.forEach((c, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.8 + col * 3.8;
      const y = 1.9 + row * 2.2;
      slide.addShape(pptx.ShapeType.roundRect, { x, y, w: 3.5, h: 1.9, fill: { color: "FFFFFF" }, line: { color: "DDDDDD", width: 1 }, rectRadius: 0.1, shadow: { type: "outer", blur: 4, offset: 2, color: "00000020" } });
      slide.addText(c.title, { x: x + 0.2, y: y + 0.15, w: 3.1, h: 0.45, fontSize: 13, bold: true, color: PRIMARY_COLOR, fontFace: "Arial" });
      slide.addText(c.desc, { x: x + 0.2, y: y + 0.6, w: 3.1, h: 1.1, fontSize: 10, color: "555555", fontFace: "Arial" });
    });

    // Slide 4: Why PhotonicTag
    slide = pptx.addSlide();
    slide.background = { color: DARK_BG };
    slide.addText("Why PhotonicTag", { x: 0.8, y: 0.4, w: 11, h: 0.7, fontSize: 32, bold: true, color: TEXT_LIGHT, fontFace: "Arial" });

    const diffs = [
      { title: "Go live in weeks, not months", desc: "Pre-built templates, automated data mapping, and guided onboarding." },
      { title: "Physics-rooted identity", desc: "Beyond simple QR codes — tamper-proof signatures grounded in physical properties." },
      { title: "SAP-native integration", desc: "Bidirectional sync with existing SAP material master data. No rip-and-replace." },
      { title: "AI-powered automation", desc: "Sustainability scoring, repair guides, risk assessment generated automatically." },
      { title: "Consumer-facing transparency", desc: "Public-facing scan page with DPP data, accessible via QR code on any mobile device." },
      { title: "Enterprise-grade security", desc: "RBAC, encrypted sessions, audit logging, and GDPR-compliant data handling." },
    ];
    diffs.forEach((d, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.8 + col * 5.8;
      const y = 1.5 + row * 1.5;
      slide.addText("✓", { x, y, w: 0.4, h: 0.4, fontSize: 18, bold: true, color: ACCENT_GREEN, fontFace: "Arial" });
      slide.addText(d.title, { x: x + 0.4, y, w: 5, h: 0.35, fontSize: 14, bold: true, color: TEXT_LIGHT, fontFace: "Arial" });
      slide.addText(d.desc, { x: x + 0.4, y: y + 0.35, w: 5, h: 0.5, fontSize: 11, color: "AAAAAA", fontFace: "Arial" });
    });

    // Slide 5: Target Industries
    slide = pptx.addSlide();
    slide.background = { color: TEXT_LIGHT };
    slide.addText("Target Industries & Deadlines", { x: 0.8, y: 0.4, w: 11, h: 0.7, fontSize: 32, bold: true, color: TEXT_DARK, fontFace: "Arial" });

    const industries = [
      { name: "Batteries & Energy Storage", examples: "Industrial batteries, EV batteries, portable power", deadline: "Feb 2027" },
      { name: "Textiles & Fashion", examples: "Apparel, technical textiles, footwear, accessories", deadline: "2028" },
      { name: "Consumer Electronics", examples: "Smartphones, laptops, IoT devices, wearables", deadline: "2028" },
      { name: "Automotive & EV", examples: "EV components, parts, accessories", deadline: "2028" },
      { name: "Furniture & Home", examples: "Office furniture, home furnishings, mattresses", deadline: "2029" },
      { name: "Industrial Packaging", examples: "Cardboard, biodegradable packaging, reusable containers", deadline: "2029" },
    ];
    const tableRows: any[][] = [
      [
        { text: "Industry", options: { bold: true, fontSize: 12, color: TEXT_LIGHT, fill: { color: PRIMARY_COLOR }, fontFace: "Arial" } },
        { text: "Product Examples", options: { bold: true, fontSize: 12, color: TEXT_LIGHT, fill: { color: PRIMARY_COLOR }, fontFace: "Arial" } },
        { text: "Deadline", options: { bold: true, fontSize: 12, color: TEXT_LIGHT, fill: { color: PRIMARY_COLOR }, fontFace: "Arial", align: "center" } },
      ],
    ];
    industries.forEach((ind, i) => {
      const bg = i % 2 === 0 ? "F8FAFC" : "FFFFFF";
      tableRows.push([
        { text: ind.name, options: { fontSize: 11, color: TEXT_DARK, fill: { color: bg }, fontFace: "Arial", bold: true } },
        { text: ind.examples, options: { fontSize: 10, color: "555555", fill: { color: bg }, fontFace: "Arial" } },
        { text: ind.deadline, options: { fontSize: 11, color: ind.deadline.includes("2027") ? ACCENT_RED : PRIMARY_COLOR, fill: { color: bg }, fontFace: "Arial", bold: true, align: "center" } },
      ]);
    });
    slide.addTable(tableRows, { x: 0.8, y: 1.3, w: 11.4, colW: [3.5, 5.5, 2.4], border: { type: "solid", pt: 0.5, color: "DDDDDD" } });

    // Slide 6: Technical Architecture
    slide = pptx.addSlide();
    slide.background = { color: TEXT_LIGHT };
    slide.addText("Technical Architecture", { x: 0.8, y: 0.4, w: 11, h: 0.7, fontSize: 32, bold: true, color: TEXT_DARK, fontFace: "Arial" });

    const stackItems = [
      ["Frontend", "React + TypeScript + Vite"],
      ["Backend", "Node.js + Express"],
      ["Database", "PostgreSQL + Drizzle ORM"],
      ["AI Engine", "OpenAI GPT-4o"],
      ["Authentication", "OAuth 2.0 / OIDC + RBAC"],
      ["Events", "CloudEvents Bus"],
      ["IoT Support", "NFC / RFID / BLE"],
      ["Integration", "SAP S/4HANA, ECC, Business One"],
    ];
    const stackRows: any[][] = [
      [
        { text: "Component", options: { bold: true, fontSize: 12, color: TEXT_LIGHT, fill: { color: DARK_BG }, fontFace: "Arial" } },
        { text: "Technology", options: { bold: true, fontSize: 12, color: TEXT_LIGHT, fill: { color: DARK_BG }, fontFace: "Arial" } },
      ],
    ];
    stackItems.forEach(([comp, tech], i) => {
      const bg = i % 2 === 0 ? "F8FAFC" : "FFFFFF";
      stackRows.push([
        { text: comp, options: { fontSize: 11, color: "555555", fill: { color: bg }, fontFace: "Arial" } },
        { text: tech, options: { fontSize: 11, color: TEXT_DARK, fill: { color: bg }, fontFace: "Arial", bold: true } },
      ]);
    });
    slide.addTable(stackRows, { x: 0.8, y: 1.3, w: 5.2, colW: [2, 3.2], border: { type: "solid", pt: 0.5, color: "DDDDDD" } });

    const security = [
      "GDPR-compliant data processing",
      "Role-based access control (3 tiers)",
      "Encrypted session management",
      "CloudEvents audit trail",
      "Tamper-proof product identity",
      "SOC 2 Type II ready architecture",
    ];
    slide.addText("Security & Compliance", { x: 7, y: 1.3, w: 5.5, h: 0.5, fontSize: 16, bold: true, color: TEXT_DARK, fontFace: "Arial" });
    security.forEach((s, i) => {
      slide.addText(`✓  ${s}`, { x: 7, y: 2.0 + i * 0.55, w: 5.5, h: 0.4, fontSize: 12, color: "333333", fontFace: "Arial" });
    });

    // Slide 7: Internal Operations
    slide = pptx.addSlide();
    slide.background = { color: DARK_BG };
    slide.addText("Internal Operations Platform", { x: 0.8, y: 0.4, w: 11, h: 0.7, fontSize: 32, bold: true, color: TEXT_LIGHT, fontFace: "Arial" });
    slide.addText("Comprehensive back-office system for managing the entire product identity lifecycle", { x: 0.8, y: 1.1, w: 11, h: 0.5, fontSize: 14, color: "AAAAAA", fontFace: "Arial" });

    const ops = [
      { title: "AI-Driven CRM", desc: "Customer account management with AI health scoring (0-100), next-best-action generation, MRR tracking, at-risk detection, and Excel bulk import." },
      { title: "Demo Factory", desc: "One-click demo generation from 6 industry templates or custom AI prompts. Per-demo credentials, shareable URLs." },
      { title: "Support Triage", desc: "AI-powered ticket categorization with automatic priority suggestion, tag generation, and summary analysis." },
      { title: "Platform Ops", desc: "Real-time health monitoring with uptime tracking, memory usage, entity counts, and auto-refresh." },
    ];
    ops.forEach((o, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.8 + col * 5.8;
      const y = 2.0 + row * 2.2;
      slide.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.4, h: 1.8, fill: { color: "252545" }, line: { color: "333366", width: 1 }, rectRadius: 0.1 });
      slide.addText(o.title, { x: x + 0.3, y: y + 0.15, w: 4.8, h: 0.45, fontSize: 14, bold: true, color: PRIMARY_COLOR, fontFace: "Arial" });
      slide.addText(o.desc, { x: x + 0.3, y: y + 0.6, w: 4.8, h: 1.0, fontSize: 10, color: "BBBBBB", fontFace: "Arial" });
    });

    // Slide 8: Pricing Overview
    slide = pptx.addSlide();
    slide.background = { color: TEXT_LIGHT };
    slide.addText("Pricing Overview", { x: 0.8, y: 0.4, w: 11, h: 0.7, fontSize: 32, bold: true, color: TEXT_DARK, fontFace: "Arial" });

    const tiers = [
      { name: "Free", products: "Up to 100", price: "€0/mo", features: "Basic DPP, QR codes, public scan pages" },
      { name: "Starter", products: "Up to 1,000", price: "Contact us", features: "DPP + analytics, enhanced QR, priority support" },
      { name: "Growth", products: "Up to 10,000", price: "Contact us", features: "AI insights, IoT integration, team management" },
      { name: "Enterprise", products: "Unlimited", price: "Custom", features: "SAP integration, SSO, dedicated support, SLAs" },
    ];
    tiers.forEach((t, i) => {
      const x = 0.5 + i * 3.1;
      const isEnterprise = t.name === "Enterprise";
      slide.addShape(pptx.ShapeType.roundRect, { x, y: 1.5, w: 2.8, h: 4.5, fill: { color: isEnterprise ? DARK_BG : "FFFFFF" }, line: { color: isEnterprise ? PRIMARY_COLOR : "DDDDDD", width: isEnterprise ? 2 : 1 }, rectRadius: 0.1 });
      slide.addText(t.name, { x, y: 1.7, w: 2.8, h: 0.5, fontSize: 18, bold: true, color: isEnterprise ? TEXT_LIGHT : TEXT_DARK, align: "center", fontFace: "Arial" });
      slide.addText(t.price, { x, y: 2.3, w: 2.8, h: 0.5, fontSize: 16, bold: true, color: PRIMARY_COLOR, align: "center", fontFace: "Arial" });
      slide.addText(t.products + " products", { x, y: 2.9, w: 2.8, h: 0.4, fontSize: 11, color: isEnterprise ? "AAAAAA" : "666666", align: "center", fontFace: "Arial" });
      slide.addText(t.features, { x: x + 0.2, y: 3.5, w: 2.4, h: 2.0, fontSize: 10, color: isEnterprise ? "BBBBBB" : "555555", fontFace: "Arial" });
    });
    slide.addText("Annual billing: 20% discount  •  All prices exclude VAT", { x: 0.8, y: 6.3, w: 11, h: 0.3, fontSize: 10, color: "888888", fontFace: "Arial", align: "center" });

    // Slide 9: CTA
    slide = pptx.addSlide();
    slide.background = { color: DARK_BG };
    slide.addText("Ready to get compliant?", { x: 0.8, y: 1.5, w: 11, h: 1.0, fontSize: 40, bold: true, color: TEXT_LIGHT, align: "center", fontFace: "Arial" });
    slide.addText("Schedule a personalized demo to see how PhotonicTag can help your\norganization meet EU DPP requirements ahead of the deadline.", { x: 1.5, y: 2.8, w: 10, h: 1.0, fontSize: 16, color: "AAAAAA", align: "center", fontFace: "Arial" });
    slide.addShape(pptx.ShapeType.roundRect, { x: 4.2, y: 4.2, w: 4.6, h: 0.8, fill: { color: PRIMARY_COLOR }, rectRadius: 0.15 });
    slide.addText("Schedule a Demo →", { x: 4.2, y: 4.2, w: 4.6, h: 0.8, fontSize: 18, bold: true, color: TEXT_LIGHT, align: "center", valign: "middle", fontFace: "Arial" });
    slide.addText("PhotonicTag GmbH  •  contact@photonictag.com  •  www.photonictag.com", { x: 0.8, y: 6.3, w: 11, h: 0.4, fontSize: 10, color: "666666", fontFace: "Arial", align: "center" });

    const data = await pptx.write({ outputType: "nodebuffer" }) as Buffer;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    res.setHeader("Content-Disposition", "attachment; filename=PhotonicTag_Presentation.pptx");
    res.send(data);
  } catch (err: any) {
    console.error("PPT generation error:", err);
    res.status(500).json({ error: "Failed to generate presentation" });
  }
});

interface ProposalRequest {
  language: string;
  customerName: string;
  customerIndustry: string;
  contactPerson: string;
  contactEmail: string;
  productsScope: string;
  estimatedProducts: string;
  sapSystem: string;
  timeline: string;
  tier: string;
  customNotes: string;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    title: "Proof of Concept Proposal",
    subtitle: "PhotonicTag — AI-Powered Digital Product Passport Platform",
    confidential: "CONFIDENTIAL — This document contains proprietary information intended solely for the recipient.",
    prepared: "Prepared for",
    preparedBy: "Prepared by",
    date: "Date",
    ref: "Reference",
    toc: "Table of Contents",
    execSummary: "1. Executive Summary",
    execBody: "PhotonicTag proposes a Proof of Concept (POC) engagement to demonstrate full EU Digital Product Passport (DPP) compliance under the Ecodesign for Sustainable Products Regulation (ESPR), Regulation (EU) 2024/1781. This POC will validate the platform's capability to generate, manage, and distribute compliant Digital Product Passports integrated with the customer's existing enterprise systems.",
    scope: "2. Scope of Work",
    scopeIntro: "The following scope defines the POC engagement deliverables:",
    scopeItems: [
      "Data audit and field mapping against ESPR-required DPP categories",
      "Configuration of product identity schemas per industry-specific requirements",
      "Integration with existing ERP/SAP systems for bidirectional data synchronization",
      "QR code generation linking physical products to their digital passports",
      "AI-powered sustainability scoring, circularity assessment, and compliance gap analysis",
      "IoT tag registration and sensor data capture (where applicable)",
      "Consumer-facing public scan page deployment",
      "Role-based access control configuration",
      "Compliance reporting and audit trail setup via CloudEvents",
    ].join("|"),
    techArch: "3. Technical Architecture",
    techBody: "PhotonicTag operates on a modern cloud-native architecture designed for enterprise-grade reliability, security, and scalability:",
    techItems: [
      "Frontend: React + TypeScript + Vite (responsive, mobile-optimized)",
      "Backend: Node.js + Express with RESTful JSON APIs",
      "Database: PostgreSQL with Drizzle ORM",
      "AI Engine: OpenAI GPT-4o for automated insights and compliance analysis",
      "Authentication: OAuth 2.0 / OIDC with three-tier role-based access control",
      "Events: CloudEvents bus for audit logging and traceability",
      "Integration: SAP S/4HANA, ECC, Business One connectors with field mapping",
    ].join("|"),
    sapIntegration: "4. SAP Integration",
    sapBody: "PhotonicTag provides enterprise-grade bidirectional integration with SAP systems:",
    sapItems: [
      "SAP S/4HANA via OData API — real-time material master synchronization",
      "SAP ECC via RFC and IDoc — batch and event-driven data exchange",
      "SAP Business One via API — lightweight integration for mid-market",
      "Automated field mapping: MATNR → SKU, MAKTX → Product Name, MTART → Category",
      "Conflict detection and resolution with side-by-side comparison interface",
      "Configurable sync modes: real-time, hourly, daily, or manual",
    ].join("|"),
    timeline: "5. Timeline & Milestones",
    timelineItems: [
      "Week 1-2: Data audit, field mapping, and environment setup",
      "Week 2-3: System integration and SAP connector configuration",
      "Week 3-4: Data population, product passport creation, AI insight generation",
      "Week 4-5: Testing, validation, compliance review",
      "Week 5-6: Go-live, training, and handover documentation",
    ].join("|"),
    deliverables: "6. Deliverables",
    deliverableItems: [
      "Fully configured PhotonicTag environment with customer product data",
      "Digital Product Passports for defined product scope with QR codes",
      "SAP integration connector configured and tested",
      "AI-generated sustainability analysis and compliance reports",
      "Consumer-facing public scan pages for each product",
      "Admin dashboard access with role-based permissions",
      "Technical documentation and user training materials",
      "POC validation report with go/no-go recommendation",
    ].join("|"),
    commercial: "7. Commercial Terms",
    commercialIntro: "This section outlines the commercial terms for the POC engagement:",
    investment: "POC Investment",
    duration: "Duration",
    durationValue: "4-6 weeks",
    support: "Support Level",
    supportValue: "Dedicated project lead with weekly status calls",
    successCriteria: "Success Criteria",
    successItems: [
      "Successful creation of DPPs for defined product scope",
      "Bidirectional SAP synchronization operational",
      "AI insights generated for all registered products",
      "Consumer-facing scan pages accessible and mobile-optimized",
      "Compliance gap analysis completed with remediation roadmap",
    ].join("|"),
    legal: "8. Legal Terms & Conditions",
    legalItems: [
      "Confidentiality: All information exchanged during the POC is strictly confidential and shall not be disclosed to third parties without prior written consent.",
      "Data Protection: All personal data processing complies with GDPR (Regulation (EU) 2016/679). PhotonicTag acts as Data Processor; the customer remains Data Controller. A Data Processing Agreement (DPA) will be executed prior to any data transfer.",
      "Intellectual Property: PhotonicTag retains all intellectual property rights to the platform, algorithms, and generated insights. The customer retains ownership of all product data provided during the POC.",
      "Liability: PhotonicTag's liability is limited to the POC investment amount. PhotonicTag shall not be liable for indirect, consequential, or incidental damages.",
      "Term & Termination: Either party may terminate the POC with 14 days' written notice. In case of early termination, fees are prorated based on completed milestones.",
      "Governing Law: This agreement is governed by the laws of the Federal Republic of Germany. Place of jurisdiction is Frankfurt am Main.",
      "Force Majeure: Neither party shall be liable for delays or failures in performance resulting from circumstances beyond reasonable control.",
      "Warranty: PhotonicTag warrants that the platform will perform substantially as described in this proposal during the POC period.",
    ].join("|"),
    nextSteps: "9. Next Steps",
    nextStepsItems: [
      "Review and approve this POC proposal",
      "Execute Data Processing Agreement (DPA) and NDA",
      "Designate a project contact and provide SAP system access details",
      "Kick-off meeting to align on timeline, scope, and success criteria",
      "Begin Week 1 data audit and environment provisioning",
    ].join("|"),
    signature: "Signatures",
    signatureFor: "For and on behalf of",
    signatureName: "Name:",
    signatureTitle: "Title:",
    signatureDate: "Date:",
    signatureLine: "Signature: ___________________________",
  },
  de: {
    title: "Proof of Concept Angebot",
    subtitle: "PhotonicTag — KI-gestützte Plattform für Digitale Produktpässe",
    confidential: "VERTRAULICH — Dieses Dokument enthält geschützte Informationen, die ausschließlich für den Empfänger bestimmt sind.",
    prepared: "Erstellt für",
    preparedBy: "Erstellt von",
    date: "Datum",
    ref: "Referenz",
    toc: "Inhaltsverzeichnis",
    execSummary: "1. Zusammenfassung",
    execBody: "PhotonicTag schlägt ein Proof of Concept (POC) Engagement vor, um die vollständige EU-Konformität für Digitale Produktpässe (DPP) gemäß der Ökodesign-Verordnung für nachhaltige Produkte (ESPR), Verordnung (EU) 2024/1781, zu demonstrieren. Dieses POC validiert die Fähigkeit der Plattform, konforme Digitale Produktpässe zu erstellen, zu verwalten und zu verteilen — integriert in die bestehenden Unternehmenssysteme des Kunden.",
    scope: "2. Leistungsumfang",
    scopeIntro: "Der folgende Umfang definiert die POC-Leistungen:",
    scopeItems: [
      "Datenprüfung und Feldzuordnung gemäß ESPR-Anforderungen für DPP-Kategorien",
      "Konfiguration von Produktidentitätsschemas nach branchenspezifischen Anforderungen",
      "Integration mit bestehenden ERP/SAP-Systemen für bidirektionale Datensynchronisation",
      "QR-Code-Generierung zur Verknüpfung physischer Produkte mit ihren digitalen Pässen",
      "KI-gestützte Nachhaltigkeitsbewertung, Zirkularitätsanalyse und Compliance-Lückenanalyse",
      "IoT-Tag-Registrierung und Sensordatenerfassung (sofern zutreffend)",
      "Bereitstellung öffentlicher Scan-Seiten für Verbraucher",
      "Konfiguration der rollenbasierten Zugriffskontrolle",
      "Compliance-Reporting und Audit-Trail-Einrichtung über CloudEvents",
    ].join("|"),
    techArch: "3. Technische Architektur",
    techBody: "PhotonicTag basiert auf einer modernen Cloud-nativen Architektur für unternehmensweite Zuverlässigkeit, Sicherheit und Skalierbarkeit:",
    techItems: [
      "Frontend: React + TypeScript + Vite (responsiv, mobiloptimiert)",
      "Backend: Node.js + Express mit RESTful JSON APIs",
      "Datenbank: PostgreSQL mit Drizzle ORM",
      "KI-Engine: OpenAI GPT-4o für automatisierte Analysen und Compliance-Prüfungen",
      "Authentifizierung: OAuth 2.0 / OIDC mit dreistufiger rollenbasierter Zugriffskontrolle",
      "Events: CloudEvents Bus für Audit-Logging und Rückverfolgbarkeit",
      "Integration: SAP S/4HANA, ECC, Business One Konnektoren mit Feldzuordnung",
    ].join("|"),
    sapIntegration: "4. SAP-Integration",
    sapBody: "PhotonicTag bietet unternehmensweite bidirektionale Integration mit SAP-Systemen:",
    sapItems: [
      "SAP S/4HANA über OData API — Echtzeit-Materialstammsynchronisation",
      "SAP ECC über RFC und IDoc — Batch- und ereignisgesteuerte Datenübertragung",
      "SAP Business One über API — schlanke Integration für den Mittelstand",
      "Automatische Feldzuordnung: MATNR → SKU, MAKTX → Produktname, MTART → Kategorie",
      "Konflikterkennung und -lösung mit Seite-an-Seite-Vergleichsoberfläche",
      "Konfigurierbare Synchronisationsmodi: Echtzeit, stündlich, täglich oder manuell",
    ].join("|"),
    timeline: "5. Zeitplan & Meilensteine",
    timelineItems: [
      "Woche 1-2: Datenprüfung, Feldzuordnung und Umgebungseinrichtung",
      "Woche 2-3: Systemintegration und SAP-Konnektor-Konfiguration",
      "Woche 3-4: Datenbefüllung, Produktpass-Erstellung, KI-Insight-Generierung",
      "Woche 4-5: Tests, Validierung, Compliance-Prüfung",
      "Woche 5-6: Go-Live, Schulung und Übergabedokumentation",
    ].join("|"),
    deliverables: "6. Liefergegenstände",
    deliverableItems: [
      "Vollständig konfigurierte PhotonicTag-Umgebung mit Kundenprodukten",
      "Digitale Produktpässe für definierten Produktumfang mit QR-Codes",
      "SAP-Integrations-Konnektor konfiguriert und getestet",
      "KI-generierte Nachhaltigkeitsanalyse und Compliance-Berichte",
      "Öffentliche Scan-Seiten für Verbraucher für jedes Produkt",
      "Admin-Dashboard-Zugang mit rollenbasierten Berechtigungen",
      "Technische Dokumentation und Schulungsunterlagen",
      "POC-Validierungsbericht mit Go/No-Go-Empfehlung",
    ].join("|"),
    commercial: "7. Kommerzielle Bedingungen",
    commercialIntro: "Dieser Abschnitt beschreibt die kommerziellen Bedingungen für das POC-Engagement:",
    investment: "POC-Investition",
    duration: "Laufzeit",
    durationValue: "4-6 Wochen",
    support: "Support-Level",
    supportValue: "Dedizierter Projektleiter mit wöchentlichen Statuscalls",
    successCriteria: "Erfolgskriterien",
    successItems: [
      "Erfolgreiche Erstellung von DPPs für den definierten Produktumfang",
      "Bidirektionale SAP-Synchronisation betriebsbereit",
      "KI-Insights für alle registrierten Produkte generiert",
      "Öffentliche Scan-Seiten erreichbar und mobiloptimiert",
      "Compliance-Lückenanalyse mit Maßnahmenplan abgeschlossen",
    ].join("|"),
    legal: "8. Rechtliche Bedingungen",
    legalItems: [
      "Vertraulichkeit: Alle während des POC ausgetauschten Informationen sind streng vertraulich und dürfen ohne vorherige schriftliche Zustimmung nicht an Dritte weitergegeben werden.",
      "Datenschutz: Die Verarbeitung personenbezogener Daten erfolgt DSGVO-konform (Verordnung (EU) 2016/679). PhotonicTag agiert als Auftragsverarbeiter; der Kunde bleibt Verantwortlicher. Ein Auftragsverarbeitungsvertrag (AVV) wird vor jeder Datenübertragung geschlossen.",
      "Geistiges Eigentum: PhotonicTag behält alle geistigen Eigentumsrechte an der Plattform, den Algorithmen und generierten Erkenntnissen. Der Kunde behält das Eigentum an allen während des POC bereitgestellten Produktdaten.",
      "Haftung: Die Haftung von PhotonicTag ist auf den POC-Investitionsbetrag begrenzt. PhotonicTag haftet nicht für indirekte, Folge- oder Nebenschäden.",
      "Laufzeit & Kündigung: Jede Partei kann das POC mit einer Frist von 14 Tagen schriftlich kündigen. Bei vorzeitiger Kündigung werden die Gebühren anteilig basierend auf abgeschlossenen Meilensteinen berechnet.",
      "Anwendbares Recht: Diese Vereinbarung unterliegt dem Recht der Bundesrepublik Deutschland. Gerichtsstand ist Frankfurt am Main.",
      "Höhere Gewalt: Keine Partei haftet für Verzögerungen oder Nichterfüllung aufgrund von Umständen außerhalb ihrer angemessenen Kontrolle.",
      "Gewährleistung: PhotonicTag gewährleistet, dass die Plattform während des POC-Zeitraums im Wesentlichen wie in diesem Angebot beschrieben funktioniert.",
    ].join("|"),
    nextSteps: "9. Nächste Schritte",
    nextStepsItems: [
      "Prüfung und Genehmigung dieses POC-Angebots",
      "Abschluss des Auftragsverarbeitungsvertrags (AVV) und der Geheimhaltungsvereinbarung (NDA)",
      "Benennung eines Projektansprechpartners und Bereitstellung der SAP-Systemzugangsdaten",
      "Kick-off-Meeting zur Abstimmung von Zeitplan, Umfang und Erfolgskriterien",
      "Start der Datenprüfung und Umgebungsbereitstellung in Woche 1",
    ].join("|"),
    signature: "Unterschriften",
    signatureFor: "Im Namen und Auftrag von",
    signatureName: "Name:",
    signatureTitle: "Titel:",
    signatureDate: "Datum:",
    signatureLine: "Unterschrift: ___________________________",
  },
  fr: {
    title: "Proposition de Preuve de Concept",
    subtitle: "PhotonicTag — Plateforme de Passeport Numérique des Produits Alimentée par l'IA",
    confidential: "CONFIDENTIEL — Ce document contient des informations propriétaires destinées uniquement au destinataire.",
    prepared: "Préparé pour",
    preparedBy: "Préparé par",
    date: "Date",
    ref: "Référence",
    toc: "Table des Matières",
    execSummary: "1. Résumé Exécutif",
    execBody: "PhotonicTag propose un engagement de Preuve de Concept (POC) pour démontrer la conformité complète aux Passeports Numériques des Produits (DPP) de l'UE en vertu du Règlement sur l'Écoconception des Produits Durables (ESPR), Règlement (UE) 2024/1781. Ce POC validera la capacité de la plateforme à générer, gérer et distribuer des Passeports Numériques des Produits conformes, intégrés aux systèmes d'entreprise existants du client.",
    scope: "2. Périmètre des Travaux",
    scopeIntro: "Le périmètre suivant définit les livrables de l'engagement POC :",
    scopeItems: [
      "Audit des données et mapping des champs selon les catégories DPP requises par l'ESPR",
      "Configuration des schémas d'identité produit selon les exigences sectorielles",
      "Intégration avec les systèmes ERP/SAP existants pour la synchronisation bidirectionnelle",
      "Génération de QR codes reliant les produits physiques à leurs passeports numériques",
      "Évaluation de durabilité, analyse de circularité et analyse des écarts de conformité par IA",
      "Enregistrement des tags IoT et capture des données de capteurs (le cas échéant)",
      "Déploiement des pages de scan publiques pour les consommateurs",
      "Configuration du contrôle d'accès basé sur les rôles",
      "Mise en place du reporting de conformité et du journal d'audit via CloudEvents",
    ].join("|"),
    techArch: "3. Architecture Technique",
    techBody: "PhotonicTag fonctionne sur une architecture cloud-native moderne conçue pour la fiabilité, la sécurité et l'évolutivité en entreprise :",
    techItems: [
      "Frontend : React + TypeScript + Vite (responsive, optimisé mobile)",
      "Backend : Node.js + Express avec APIs JSON RESTful",
      "Base de données : PostgreSQL avec Drizzle ORM",
      "Moteur IA : OpenAI GPT-4o pour l'analyse automatisée et la conformité",
      "Authentification : OAuth 2.0 / OIDC avec contrôle d'accès à trois niveaux",
      "Événements : Bus CloudEvents pour le journal d'audit et la traçabilité",
      "Intégration : Connecteurs SAP S/4HANA, ECC, Business One avec mapping des champs",
    ].join("|"),
    sapIntegration: "4. Intégration SAP",
    sapBody: "PhotonicTag fournit une intégration bidirectionnelle de niveau entreprise avec les systèmes SAP :",
    sapItems: [
      "SAP S/4HANA via API OData — synchronisation en temps réel des fiches articles",
      "SAP ECC via RFC et IDoc — échange de données par lots et événementiel",
      "SAP Business One via API — intégration légère pour le mid-market",
      "Mapping automatique : MATNR → SKU, MAKTX → Nom du Produit, MTART → Catégorie",
      "Détection et résolution des conflits avec interface de comparaison côte à côte",
      "Modes de synchronisation configurables : temps réel, horaire, quotidien ou manuel",
    ].join("|"),
    timeline: "5. Calendrier & Jalons",
    timelineItems: [
      "Semaine 1-2 : Audit des données, mapping des champs et mise en place de l'environnement",
      "Semaine 2-3 : Intégration système et configuration du connecteur SAP",
      "Semaine 3-4 : Population des données, création des passeports, génération des insights IA",
      "Semaine 4-5 : Tests, validation, revue de conformité",
      "Semaine 5-6 : Mise en production, formation et documentation de transfert",
    ].join("|"),
    deliverables: "6. Livrables",
    deliverableItems: [
      "Environnement PhotonicTag entièrement configuré avec les données produit du client",
      "Passeports Numériques des Produits pour le périmètre défini avec QR codes",
      "Connecteur d'intégration SAP configuré et testé",
      "Analyse de durabilité et rapports de conformité générés par IA",
      "Pages de scan publiques pour chaque produit",
      "Accès au tableau de bord admin avec permissions basées sur les rôles",
      "Documentation technique et supports de formation",
      "Rapport de validation POC avec recommandation go/no-go",
    ].join("|"),
    commercial: "7. Conditions Commerciales",
    commercialIntro: "Cette section décrit les conditions commerciales de l'engagement POC :",
    investment: "Investissement POC",
    duration: "Durée",
    durationValue: "4-6 semaines",
    support: "Niveau de Support",
    supportValue: "Chef de projet dédié avec appels de statut hebdomadaires",
    successCriteria: "Critères de Succès",
    successItems: [
      "Création réussie des DPP pour le périmètre produit défini",
      "Synchronisation SAP bidirectionnelle opérationnelle",
      "Insights IA générés pour tous les produits enregistrés",
      "Pages de scan publiques accessibles et optimisées mobile",
      "Analyse des écarts de conformité complétée avec feuille de route",
    ].join("|"),
    legal: "8. Conditions Juridiques",
    legalItems: [
      "Confidentialité : Toutes les informations échangées pendant le POC sont strictement confidentielles et ne doivent pas être divulguées à des tiers sans consentement écrit préalable.",
      "Protection des Données : Le traitement des données personnelles est conforme au RGPD (Règlement (UE) 2016/679). PhotonicTag agit en tant que Sous-traitant ; le client reste Responsable du traitement. Un Accord de Traitement des Données sera conclu avant tout transfert de données.",
      "Propriété Intellectuelle : PhotonicTag conserve tous les droits de propriété intellectuelle sur la plateforme, les algorithmes et les analyses générées. Le client conserve la propriété de toutes les données produit fournies pendant le POC.",
      "Responsabilité : La responsabilité de PhotonicTag est limitée au montant de l'investissement POC. PhotonicTag ne sera pas responsable des dommages indirects, consécutifs ou accessoires.",
      "Durée & Résiliation : Chaque partie peut résilier le POC avec un préavis écrit de 14 jours. En cas de résiliation anticipée, les frais sont calculés au prorata des jalons complétés.",
      "Droit Applicable : Ce contrat est régi par le droit de la République Fédérale d'Allemagne. Le tribunal compétent est Francfort-sur-le-Main.",
      "Force Majeure : Aucune partie ne sera responsable des retards ou défaillances résultant de circonstances indépendantes de sa volonté.",
      "Garantie : PhotonicTag garantit que la plateforme fonctionnera substantiellement comme décrit dans cette proposition pendant la période POC.",
    ].join("|"),
    nextSteps: "9. Prochaines Étapes",
    nextStepsItems: [
      "Examen et approbation de cette proposition POC",
      "Signature de l'Accord de Traitement des Données et du NDA",
      "Désignation d'un contact projet et fourniture des accès au système SAP",
      "Réunion de lancement pour aligner le calendrier, le périmètre et les critères de succès",
      "Début de l'audit des données et provisionnement de l'environnement en Semaine 1",
    ].join("|"),
    signature: "Signatures",
    signatureFor: "Pour et au nom de",
    signatureName: "Nom :",
    signatureTitle: "Titre :",
    signatureDate: "Date :",
    signatureLine: "Signature : ___________________________",
  },
  es: {
    title: "Propuesta de Prueba de Concepto",
    subtitle: "PhotonicTag — Plataforma de Pasaporte Digital de Producto Impulsada por IA",
    confidential: "CONFIDENCIAL — Este documento contiene información propietaria destinada únicamente al destinatario.",
    prepared: "Preparado para",
    preparedBy: "Preparado por",
    date: "Fecha",
    ref: "Referencia",
    toc: "Índice",
    execSummary: "1. Resumen Ejecutivo",
    execBody: "PhotonicTag propone un compromiso de Prueba de Concepto (POC) para demostrar el cumplimiento total del Pasaporte Digital de Producto (DPP) de la UE bajo el Reglamento de Ecodiseño para Productos Sostenibles (ESPR), Reglamento (UE) 2024/1781. Este POC validará la capacidad de la plataforma para generar, gestionar y distribuir Pasaportes Digitales de Producto conformes, integrados con los sistemas empresariales existentes del cliente.",
    scope: "2. Alcance del Trabajo",
    scopeIntro: "El siguiente alcance define los entregables del compromiso POC:",
    scopeItems: [
      "Auditoría de datos y mapeo de campos según categorías DPP requeridas por ESPR",
      "Configuración de esquemas de identidad de producto según requisitos sectoriales",
      "Integración con sistemas ERP/SAP existentes para sincronización bidireccional",
      "Generación de códigos QR vinculando productos físicos a sus pasaportes digitales",
      "Evaluación de sostenibilidad por IA, análisis de circularidad y análisis de brechas de cumplimiento",
      "Registro de etiquetas IoT y captura de datos de sensores (cuando aplique)",
      "Despliegue de páginas de escaneo públicas para consumidores",
      "Configuración del control de acceso basado en roles",
      "Configuración de informes de cumplimiento y registro de auditoría vía CloudEvents",
    ].join("|"),
    techArch: "3. Arquitectura Técnica",
    techBody: "PhotonicTag opera en una arquitectura cloud-native moderna diseñada para fiabilidad, seguridad y escalabilidad empresarial:",
    techItems: [
      "Frontend: React + TypeScript + Vite (responsive, optimizado para móvil)",
      "Backend: Node.js + Express con APIs JSON RESTful",
      "Base de datos: PostgreSQL con Drizzle ORM",
      "Motor IA: OpenAI GPT-4o para análisis automatizado y cumplimiento",
      "Autenticación: OAuth 2.0 / OIDC con control de acceso de tres niveles",
      "Eventos: Bus CloudEvents para registro de auditoría y trazabilidad",
      "Integración: Conectores SAP S/4HANA, ECC, Business One con mapeo de campos",
    ].join("|"),
    sapIntegration: "4. Integración SAP",
    sapBody: "PhotonicTag proporciona integración bidireccional de nivel empresarial con sistemas SAP:",
    sapItems: [
      "SAP S/4HANA vía API OData — sincronización en tiempo real de maestro de materiales",
      "SAP ECC vía RFC e IDoc — intercambio de datos por lotes y basado en eventos",
      "SAP Business One vía API — integración ligera para el mercado medio",
      "Mapeo automático: MATNR → SKU, MAKTX → Nombre del Producto, MTART → Categoría",
      "Detección y resolución de conflictos con interfaz de comparación lado a lado",
      "Modos de sincronización configurables: tiempo real, cada hora, diario o manual",
    ].join("|"),
    timeline: "5. Cronograma e Hitos",
    timelineItems: [
      "Semana 1-2: Auditoría de datos, mapeo de campos y configuración del entorno",
      "Semana 2-3: Integración de sistemas y configuración del conector SAP",
      "Semana 3-4: Población de datos, creación de pasaportes, generación de insights IA",
      "Semana 4-5: Pruebas, validación, revisión de cumplimiento",
      "Semana 5-6: Puesta en producción, formación y documentación de entrega",
    ].join("|"),
    deliverables: "6. Entregables",
    deliverableItems: [
      "Entorno PhotonicTag completamente configurado con datos del cliente",
      "Pasaportes Digitales de Producto para el alcance definido con códigos QR",
      "Conector de integración SAP configurado y probado",
      "Análisis de sostenibilidad e informes de cumplimiento generados por IA",
      "Páginas de escaneo públicas para cada producto",
      "Acceso al panel de administración con permisos basados en roles",
      "Documentación técnica y materiales de formación",
      "Informe de validación POC con recomendación go/no-go",
    ].join("|"),
    commercial: "7. Condiciones Comerciales",
    commercialIntro: "Esta sección describe las condiciones comerciales del compromiso POC:",
    investment: "Inversión POC",
    duration: "Duración",
    durationValue: "4-6 semanas",
    support: "Nivel de Soporte",
    supportValue: "Líder de proyecto dedicado con llamadas de estado semanales",
    successCriteria: "Criterios de Éxito",
    successItems: [
      "Creación exitosa de DPPs para el alcance de producto definido",
      "Sincronización SAP bidireccional operativa",
      "Insights IA generados para todos los productos registrados",
      "Páginas de escaneo públicas accesibles y optimizadas para móvil",
      "Análisis de brechas de cumplimiento completado con hoja de ruta",
    ].join("|"),
    legal: "8. Términos y Condiciones Legales",
    legalItems: [
      "Confidencialidad: Toda la información intercambiada durante el POC es estrictamente confidencial y no será divulgada a terceros sin consentimiento escrito previo.",
      "Protección de Datos: Todo el procesamiento de datos personales cumple con el RGPD (Reglamento (UE) 2016/679). PhotonicTag actúa como Encargado del Tratamiento; el cliente sigue siendo el Responsable del Tratamiento. Se ejecutará un Acuerdo de Tratamiento de Datos antes de cualquier transferencia.",
      "Propiedad Intelectual: PhotonicTag retiene todos los derechos de propiedad intelectual sobre la plataforma, algoritmos e insights generados. El cliente retiene la propiedad de todos los datos de producto proporcionados durante el POC.",
      "Responsabilidad: La responsabilidad de PhotonicTag se limita al monto de la inversión POC. PhotonicTag no será responsable de daños indirectos, consecuentes o incidentales.",
      "Plazo y Terminación: Cualquiera de las partes puede terminar el POC con 14 días de preaviso escrito. En caso de terminación anticipada, las tarifas se prorratean según los hitos completados.",
      "Ley Aplicable: Este acuerdo se rige por las leyes de la República Federal de Alemania. El tribunal competente es Frankfurt del Meno.",
      "Fuerza Mayor: Ninguna parte será responsable por retrasos o fallos en el cumplimiento resultantes de circunstancias fuera de su control razonable.",
      "Garantía: PhotonicTag garantiza que la plataforma funcionará sustancialmente como se describe en esta propuesta durante el período POC.",
    ].join("|"),
    nextSteps: "9. Próximos Pasos",
    nextStepsItems: [
      "Revisión y aprobación de esta propuesta POC",
      "Firma del Acuerdo de Tratamiento de Datos y NDA",
      "Designar un contacto de proyecto y proporcionar acceso al sistema SAP",
      "Reunión de inicio para alinear cronograma, alcance y criterios de éxito",
      "Inicio de la auditoría de datos y provisión del entorno en la Semana 1",
    ].join("|"),
    signature: "Firmas",
    signatureFor: "En nombre y representación de",
    signatureName: "Nombre:",
    signatureTitle: "Título:",
    signatureDate: "Fecha:",
    signatureLine: "Firma: ___________________________",
  },
};

function buildProposalDoc(body: ProposalRequest): Buffer | Promise<Buffer> {
  const lang = translations[body.language] || translations.en;
  const today = new Date().toLocaleDateString(body.language === "de" ? "de-DE" : body.language === "fr" ? "fr-FR" : body.language === "es" ? "es-ES" : "en-GB", { year: "numeric", month: "long", day: "numeric" });
  const refNum = `PT-POC-${Date.now().toString(36).toUpperCase()}`;

  const tierPricing: Record<string, string> = {
    free: "€0 (Free Tier)",
    starter: "€2,500 - €5,000",
    growth: "€7,500 - €15,000",
    enterprise: "€20,000 - €50,000 (Custom)",
  };

  const sections: (Paragraph | Table)[] = [];

  const addHeading = (text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1) => {
    sections.push(new Paragraph({ text, heading: level, spacing: { before: 400, after: 200 } }));
  };

  const addBody = (text: string) => {
    sections.push(new Paragraph({ children: [new TextRun({ text, size: 22, font: "Calibri" })], spacing: { after: 150 } }));
  };

  const addBullet = (text: string) => {
    sections.push(new Paragraph({ children: [new TextRun({ text, size: 22, font: "Calibri" })], bullet: { level: 0 }, spacing: { after: 80 } }));
  };

  sections.push(new Paragraph({ spacing: { after: 600 } }));
  sections.push(new Paragraph({ children: [new TextRun({ text: lang.title, size: 48, bold: true, font: "Calibri", color: "0066CC" })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }));
  sections.push(new Paragraph({ children: [new TextRun({ text: lang.subtitle, size: 24, font: "Calibri", color: "555555", italics: true })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }));

  sections.push(new Paragraph({ children: [new TextRun({ text: `${lang.prepared}: ${body.customerName}`, size: 24, font: "Calibri" })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }));
  sections.push(new Paragraph({ children: [new TextRun({ text: `${lang.preparedBy}: PhotonicTag GmbH`, size: 24, font: "Calibri" })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }));
  sections.push(new Paragraph({ children: [new TextRun({ text: `${lang.date}: ${today}`, size: 24, font: "Calibri" })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }));
  sections.push(new Paragraph({ children: [new TextRun({ text: `${lang.ref}: ${refNum}`, size: 24, font: "Calibri" })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }));

  sections.push(new Paragraph({ children: [new TextRun({ text: lang.confidential, size: 18, font: "Calibri", color: "999999", italics: true })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }));

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  addHeading(lang.toc);
  const tocItems = [lang.execSummary, lang.scope, lang.techArch, lang.sapIntegration, lang.timeline, lang.deliverables, lang.commercial, lang.legal, lang.nextSteps];
  tocItems.forEach(item => addBody(item));

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  addHeading(lang.execSummary);
  addBody(lang.execBody);

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  addHeading(lang.scope);
  addBody(lang.scopeIntro);
  lang.scopeItems.split("|").forEach(item => addBullet(item));

  if (body.productsScope) {
    sections.push(new Paragraph({ spacing: { before: 200 } }));
    addBody(`Product Scope: ${body.productsScope}`);
  }
  if (body.estimatedProducts) {
    addBody(`Estimated Product Volume: ${body.estimatedProducts}`);
  }

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  addHeading(lang.techArch);
  addBody(lang.techBody);
  lang.techItems.split("|").forEach(item => addBullet(item));

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  addHeading(lang.sapIntegration);
  addBody(lang.sapBody);
  lang.sapItems.split("|").forEach(item => addBullet(item));
  if (body.sapSystem && body.sapSystem !== "none") {
    sections.push(new Paragraph({ spacing: { before: 200 } }));
    addBody(`Customer SAP Environment: ${body.sapSystem}`);
  }

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  addHeading(lang.timeline);
  lang.timelineItems.split("|").forEach(item => addBullet(item));
  if (body.timeline) {
    sections.push(new Paragraph({ spacing: { before: 200 } }));
    addBody(`Requested Timeline: ${body.timeline}`);
  }

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  addHeading(lang.deliverables);
  lang.deliverableItems.split("|").forEach(item => addBullet(item));

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  addHeading(lang.commercial);
  addBody(lang.commercialIntro);

  const commercialTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: lang.investment, bold: true, size: 22, font: "Calibri" })] })], width: { size: 30, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: tierPricing[body.tier] || tierPricing.enterprise, size: 22, font: "Calibri" })] })] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: lang.duration, bold: true, size: 22, font: "Calibri" })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: lang.durationValue, size: 22, font: "Calibri" })] })] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tier", bold: true, size: 22, font: "Calibri" })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: body.tier.charAt(0).toUpperCase() + body.tier.slice(1), size: 22, font: "Calibri" })] })] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: lang.support, bold: true, size: 22, font: "Calibri" })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: lang.supportValue, size: 22, font: "Calibri" })] })] }),
        ],
      }),
    ],
  });
  sections.push(commercialTable);

  sections.push(new Paragraph({ spacing: { before: 300 } }));
  addHeading(lang.successCriteria, HeadingLevel.HEADING_2);
  lang.successItems.split("|").forEach(item => addBullet(item));

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  addHeading(lang.legal);
  lang.legalItems.split("|").forEach(item => {
    const [title, ...rest] = item.split(": ");
    sections.push(new Paragraph({
      children: [
        new TextRun({ text: title + ": ", bold: true, size: 22, font: "Calibri" }),
        new TextRun({ text: rest.join(": "), size: 22, font: "Calibri" }),
      ],
      spacing: { after: 150 },
    }));
  });

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  addHeading(lang.nextSteps);
  lang.nextStepsItems.split("|").forEach((item, i) => addBullet(`${i + 1}. ${item}`));

  if (body.customNotes) {
    sections.push(new Paragraph({ spacing: { before: 300 } }));
    addHeading("Additional Notes", HeadingLevel.HEADING_2);
    addBody(body.customNotes);
  }

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  addHeading(lang.signature);
  sections.push(new Paragraph({ spacing: { before: 300 } }));

  [body.customerName, "PhotonicTag GmbH"].forEach(company => {
    sections.push(new Paragraph({ children: [new TextRun({ text: `${lang.signatureFor} ${company}`, size: 24, bold: true, font: "Calibri" })], spacing: { before: 400, after: 200 } }));
    sections.push(new Paragraph({ children: [new TextRun({ text: lang.signatureName + " ___________________________", size: 22, font: "Calibri" })], spacing: { after: 100 } }));
    sections.push(new Paragraph({ children: [new TextRun({ text: lang.signatureTitle + " ___________________________", size: 22, font: "Calibri" })], spacing: { after: 100 } }));
    sections.push(new Paragraph({ children: [new TextRun({ text: lang.signatureDate + " ___________________________", size: 22, font: "Calibri" })], spacing: { after: 100 } }));
    sections.push(new Paragraph({ children: [new TextRun({ text: lang.signatureLine, size: 22, font: "Calibri" })], spacing: { after: 300 } }));
  });

  const doc = new Document({
    creator: "PhotonicTag GmbH",
    title: `${lang.title} — ${body.customerName}`,
    description: "POC Validation Proposal",
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: sections,
    }],
  });

  return Packer.toBuffer(doc);
}

router.post("/api/export/proposal.docx", async (req: Request, res: Response) => {
  try {
    const body = req.body as ProposalRequest;
    if (!body.customerName || !body.language) {
      return res.status(400).json({ error: "Customer name and language are required" });
    }
    const buffer = await buildProposalDoc(body);
    const safeName = body.customerName.replace(/[^a-zA-Z0-9]/g, "_");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename=PhotonicTag_POC_Proposal_${safeName}.docx`);
    res.send(buffer);
  } catch (err: any) {
    console.error("DOCX generation error:", err);
    res.status(500).json({ error: "Failed to generate proposal" });
  }
});

export default router;
