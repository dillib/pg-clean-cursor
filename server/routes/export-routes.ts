import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
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
    pptx.company = "PhotonicTag";
    pptx.title = "PhotonicTag — AI-Powered Digital Product Passport Platform";
    pptx.subject = "Enterprise Marketing Presentation";
    pptx.layout = "LAYOUT_WIDE";

    const BRAND_DARK = "0F172A";
    const BRAND_NAVY = "1E293B";
    const BRAND_CYAN = "2563EB";
    const BRAND_TEAL = "3B82F6";
    const BRAND_BLUE = "2563EB";
    const BRAND_LIGHT_BLUE = "DBEAFE";
    const CARD_DARK = "1E293B";
    const CARD_BORDER = "334155";
    const SUBTLE_TEXT = "94A3B8";
    const BODY_TEXT = "CBD5E1";
    const WHITE = "FFFFFF";
    const WARM_AMBER = "F59E0B";
    const DANGER_RED = "EF4444";
    const SUCCESS_GREEN = "10B981";

    const logoPath = path.resolve(process.cwd(), "server/assets/logo.png");
    const logoExists = fs.existsSync(logoPath);

    const addFooter = (s: any, dark = true) => {
      if (logoExists) {
        s.addImage({ path: logoPath, x: 0.3, y: 6.78, w: 0.35, h: 0.35 });
      }
      s.addText("PhotonicTag  •  Identity, at the speed of light.", { x: 0.75, y: 6.85, w: 8, h: 0.3, fontSize: 8, color: dark ? "4A5568" : "9CA3AF", fontFace: "Calibri" });
      s.addText("CONFIDENTIAL", { x: 10, y: 6.85, w: 2.5, h: 0.3, fontSize: 8, color: dark ? "4A5568" : "9CA3AF", fontFace: "Calibri", align: "right" });
    };

    // ====================================
    // SLIDE 1: TITLE — Premium dark opener
    // ====================================
    let slide = pptx.addSlide();
    slide.background = { color: BRAND_DARK };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.34, h: 7.5, fill: { color: BRAND_DARK } });
    slide.addShape(pptx.ShapeType.ellipse, { x: 8, y: -2, w: 8, h: 8, fill: { color: BRAND_NAVY } });
    slide.addShape(pptx.ShapeType.ellipse, { x: 9.5, y: 3, w: 5, h: 5, fill: { color: "162044" } });
    if (logoExists) {
      slide.addImage({ path: logoPath, x: 1.1, y: 1.0, w: 0.8, h: 0.8 });
    }
    slide.addShape(pptx.ShapeType.rect, { x: 1.1, y: 1.9, w: 0.08, h: 1.5, fill: { color: BRAND_CYAN } });
    slide.addText("Photonic", { x: 1.4, y: 1.5, w: 8, h: 0.9, fontSize: 52, bold: true, color: WHITE, fontFace: "Calibri" });
    slide.addText("Tag", { x: 1.4, y: 2.3, w: 8, h: 0.9, fontSize: 52, bold: true, color: BRAND_CYAN, fontFace: "Calibri" });
    slide.addText("Identity, at the speed of light.", { x: 1.1, y: 3.1, w: 8, h: 0.6, fontSize: 22, color: SUBTLE_TEXT, italic: true, fontFace: "Calibri" });
    slide.addText("AI-Powered Digital Product Passport Platform", { x: 1.1, y: 4.0, w: 7, h: 0.5, fontSize: 15, color: BODY_TEXT, fontFace: "Calibri" });
    slide.addText("EU ESPR Regulation (EU) 2024/1781 Compliance", { x: 1.1, y: 4.5, w: 7, h: 0.4, fontSize: 13, color: SUBTLE_TEXT, fontFace: "Calibri" });
    const statsBar = [
      { num: "100K+", label: "Products Tracked" },
      { num: "6", label: "AI Modules" },
      { num: "3", label: "SAP Connectors" },
      { num: "99.9%", label: "Uptime SLA" },
    ];
    statsBar.forEach((s, i) => {
      const x = 1.1 + i * 2.5;
      slide.addText(s.num, { x, y: 5.5, w: 2, h: 0.5, fontSize: 22, bold: true, color: BRAND_CYAN, fontFace: "Calibri" });
      slide.addText(s.label, { x, y: 5.95, w: 2, h: 0.3, fontSize: 10, color: SUBTLE_TEXT, fontFace: "Calibri" });
    });
    addFooter(slide);

    // ====================================
    // SLIDE 2: THE PROBLEM — Urgency slide
    // ====================================
    slide = pptx.addSlide();
    slide.background = { color: BRAND_DARK };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.34, h: 1.2, fill: { color: BRAND_NAVY } });
    slide.addText("THE REGULATORY CHALLENGE", { x: 0.8, y: 0.15, w: 10, h: 0.4, fontSize: 11, bold: true, color: BRAND_CYAN, fontFace: "Calibri", letterSpacing: 3 });
    slide.addText("EU Digital Product Passport Mandate", { x: 0.8, y: 0.5, w: 10, h: 0.6, fontSize: 28, bold: true, color: WHITE, fontFace: "Calibri" });
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.5, w: 5.5, h: 2.0, fill: { color: CARD_DARK }, line: { color: DANGER_RED, width: 1.5 }, rectRadius: 0.12 });
    slide.addText("⚠  NON-COMPLIANCE RISK", { x: 1.1, y: 1.65, w: 5, h: 0.4, fontSize: 12, bold: true, color: DANGER_RED, fontFace: "Calibri" });
    slide.addText("€100,000+ per violation\nEU market access restrictions\nProduct recalls & reputational damage\nSupply chain disruption", { x: 1.1, y: 2.1, w: 5, h: 1.2, fontSize: 12, color: BODY_TEXT, fontFace: "Calibri", lineSpacingMultiple: 1.4 });
    slide.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 1.5, w: 5.5, h: 2.0, fill: { color: CARD_DARK }, line: { color: SUCCESS_GREEN, width: 1.5 }, rectRadius: 0.12 });
    slide.addText("✓  THE OPPORTUNITY", { x: 7.1, y: 1.65, w: 5, h: 0.4, fontSize: 12, bold: true, color: SUCCESS_GREEN, fontFace: "Calibri" });
    slide.addText("First-mover competitive advantage\nConsumer trust & brand premium\nSupply chain transparency leadership\nSustainability scoring automation", { x: 7.1, y: 2.1, w: 5, h: 1.2, fontSize: 12, color: BODY_TEXT, fontFace: "Calibri", lineSpacingMultiple: 1.4 });
    slide.addText("ESPR COMPLIANCE TIMELINE", { x: 0.8, y: 3.8, w: 10, h: 0.35, fontSize: 11, bold: true, color: BRAND_CYAN, fontFace: "Calibri", letterSpacing: 2 });
    slide.addShape(pptx.ShapeType.rect, { x: 0.8, y: 4.3, w: 11.5, h: 0.04, fill: { color: CARD_BORDER } });
    const tl = [
      { date: "FEB 2027", cat: "Batteries & EV", desc: "Industrial and EV batteries under EU Battery Regulation", color: DANGER_RED, urgency: "URGENT" },
      { date: "2028", cat: "Textiles & Electronics", desc: "Material composition & repairability data required", color: WARM_AMBER, urgency: "UPCOMING" },
      { date: "2029", cat: "Furniture & Construction", desc: "Full lifecycle documentation mandatory", color: BRAND_BLUE, urgency: "PLANNED" },
      { date: "2030", cat: "All Product Categories", desc: "Universal DPP mandate (EU) 2024/1781", color: BRAND_TEAL, urgency: "UNIVERSAL" },
    ];
    tl.forEach((t, i) => {
      const y = 4.5 + i * 0.58;
      slide.addShape(pptx.ShapeType.ellipse, { x: 0.9, y: y + 0.05, w: 0.2, h: 0.2, fill: { color: t.color } });
      slide.addShape(pptx.ShapeType.roundRect, { x: 1.3, y, w: 1.6, h: 0.35, fill: { color: t.color }, rectRadius: 0.05 });
      slide.addText(t.date, { x: 1.3, y, w: 1.6, h: 0.35, fontSize: 9, bold: true, color: WHITE, align: "center", valign: "middle", fontFace: "Calibri" });
      slide.addText(t.cat, { x: 3.1, y, w: 3.5, h: 0.35, fontSize: 11, bold: true, color: WHITE, fontFace: "Calibri", valign: "middle" });
      slide.addText(t.desc, { x: 6.6, y, w: 4.5, h: 0.35, fontSize: 10, color: SUBTLE_TEXT, fontFace: "Calibri", valign: "middle" });
      slide.addText(t.urgency, { x: 11.2, y, w: 1.1, h: 0.35, fontSize: 8, bold: true, color: t.color, fontFace: "Calibri", align: "right", valign: "middle" });
    });
    addFooter(slide);

    // ====================================
    // SLIDE 3: SOLUTION OVERVIEW — What is PhotonicTag
    // ====================================
    slide = pptx.addSlide();
    slide.background = { color: WHITE };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.34, h: 0.08, fill: { color: BRAND_CYAN } });
    slide.addText("SOLUTION OVERVIEW", { x: 0.8, y: 0.3, w: 10, h: 0.35, fontSize: 11, bold: true, color: BRAND_TEAL, fontFace: "Calibri", letterSpacing: 3 });
    slide.addText("One Platform. Complete DPP Lifecycle.", { x: 0.8, y: 0.65, w: 10, h: 0.7, fontSize: 28, bold: true, color: BRAND_DARK, fontFace: "Calibri" });
    slide.addText("PhotonicTag transforms product identity into a physics-rooted, tamper-proof signature — bridging physical and digital worlds for trust, traceability, and transparency.", { x: 0.8, y: 1.35, w: 10, h: 0.6, fontSize: 13, color: "64748B", fontFace: "Calibri" });
    const modules = [
      { title: "Digital Product\nPassports", desc: "EU ESPR-compliant identity with tamper-proof QR codes linking to complete digital profiles.", num: "01", color: BRAND_BLUE },
      { title: "Anti-\nCounterfeiting", desc: "Physics-rooted signatures that cannot be forged, cloned, or reproduced.", num: "02", color: BRAND_TEAL },
      { title: "IoT & Smart\nTagging", desc: "NFC, RFID, BLE device management for real-time supply chain tracking.", num: "03", color: SUCCESS_GREEN },
      { title: "AI Sustainability\nIntelligence", desc: "Automated carbon scoring, circularity assessment (A+ to F), repair guides.", num: "04", color: "8B5CF6" },
      { title: "SAP & ERP\nIntegration", desc: "Bidirectional sync with S/4HANA, ECC, Business One. Zero rip-and-replace.", num: "05", color: WARM_AMBER },
      { title: "Supply Chain\nTraceability", desc: "End-to-end visibility from sourcing to end-of-life with audit trail.", num: "06", color: DANGER_RED },
    ];
    modules.forEach((m, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.8 + col * 3.9;
      const y = 2.2 + row * 2.3;
      slide.addShape(pptx.ShapeType.roundRect, { x, y, w: 3.6, h: 2.05, fill: { color: "F8FAFC" }, line: { color: "E2E8F0", width: 1 }, rectRadius: 0.1 });
      slide.addShape(pptx.ShapeType.roundRect, { x: x + 0.15, y: y + 0.15, w: 0.55, h: 0.35, fill: { color: m.color }, rectRadius: 0.06 });
      slide.addText(m.num, { x: x + 0.15, y: y + 0.15, w: 0.55, h: 0.35, fontSize: 10, bold: true, color: WHITE, align: "center", valign: "middle", fontFace: "Calibri" });
      slide.addText(m.title, { x: x + 0.15, y: y + 0.6, w: 3.3, h: 0.55, fontSize: 12, bold: true, color: BRAND_DARK, fontFace: "Calibri" });
      slide.addText(m.desc, { x: x + 0.15, y: y + 1.2, w: 3.3, h: 0.7, fontSize: 10, color: "64748B", fontFace: "Calibri" });
    });
    addFooter(slide, false);

    // ====================================
    // SLIDE 4: HOW IT WORKS — Process flow
    // ====================================
    slide = pptx.addSlide();
    slide.background = { color: BRAND_DARK };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.34, h: 1.2, fill: { color: BRAND_NAVY } });
    slide.addText("HOW IT WORKS", { x: 0.8, y: 0.15, w: 10, h: 0.35, fontSize: 11, bold: true, color: BRAND_CYAN, fontFace: "Calibri", letterSpacing: 3 });
    slide.addText("From Product Data to Verified Identity", { x: 0.8, y: 0.5, w: 10, h: 0.6, fontSize: 28, bold: true, color: WHITE, fontFace: "Calibri" });
    const steps = [
      { num: "1", title: "Connect", desc: "Import product data from SAP, Excel, or API. PhotonicTag maps your existing fields to DPP categories automatically.", icon: "🔗" },
      { num: "2", title: "Enrich", desc: "AI generates sustainability scores, repair guides, circularity grades, and risk assessments from your product data.", icon: "🧠" },
      { num: "3", title: "Verify", desc: "Create tamper-proof digital identities with physics-rooted signatures. Generate unique QR codes for every product.", icon: "🔒" },
      { num: "4", title: "Deploy", desc: "Publish public scan pages for consumers. Sync data back to SAP. Enable IoT tracking for real-time monitoring.", icon: "🚀" },
    ];
    steps.forEach((s, i) => {
      const x = 0.5 + i * 3.1;
      slide.addShape(pptx.ShapeType.roundRect, { x, y: 1.6, w: 2.9, h: 3.2, fill: { color: CARD_DARK }, line: { color: CARD_BORDER, width: 1 }, rectRadius: 0.12 });
      slide.addShape(pptx.ShapeType.ellipse, { x: x + 0.95, y: 1.85, w: 0.9, h: 0.9, fill: { color: BRAND_NAVY }, line: { color: BRAND_CYAN, width: 1.5 } });
      slide.addText(s.num, { x: x + 0.95, y: 1.85, w: 0.9, h: 0.9, fontSize: 22, bold: true, color: BRAND_CYAN, align: "center", valign: "middle", fontFace: "Calibri" });
      slide.addText(s.title, { x: x + 0.2, y: 2.95, w: 2.5, h: 0.45, fontSize: 16, bold: true, color: WHITE, align: "center", fontFace: "Calibri" });
      slide.addText(s.desc, { x: x + 0.2, y: 3.45, w: 2.5, h: 1.15, fontSize: 10, color: BODY_TEXT, align: "center", fontFace: "Calibri" });
      if (i < 3) {
        slide.addText("→", { x: x + 2.9, y: 2.7, w: 0.3, h: 0.5, fontSize: 20, color: BRAND_CYAN, fontFace: "Calibri", valign: "middle" });
      }
    });
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: 5.2, w: 12.0, h: 1.3, fill: { color: BRAND_NAVY }, line: { color: CARD_BORDER, width: 1 }, rectRadius: 0.12 });
    slide.addText("RESULT", { x: 0.8, y: 5.3, w: 2, h: 0.3, fontSize: 10, bold: true, color: BRAND_CYAN, fontFace: "Calibri", letterSpacing: 2 });
    const results = [
      "EU ESPR-compliant Digital Product Passports",
      "Consumer-scannable QR codes on every product",
      "AI-powered sustainability insights",
      "Real-time supply chain visibility",
    ];
    results.forEach((r, i) => {
      slide.addText(`✓  ${r}`, { x: 0.8 + (i % 2) * 5.8, y: 5.65 + Math.floor(i / 2) * 0.35, w: 5.5, h: 0.3, fontSize: 11, color: BODY_TEXT, fontFace: "Calibri" });
    });
    addFooter(slide);

    // ====================================
    // SLIDE 5: SAP INTEGRATION DEEP-DIVE
    // ====================================
    slide = pptx.addSlide();
    slide.background = { color: WHITE };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.34, h: 0.08, fill: { color: BRAND_CYAN } });
    slide.addText("SAP INTEGRATION", { x: 0.8, y: 0.3, w: 10, h: 0.35, fontSize: 11, bold: true, color: BRAND_TEAL, fontFace: "Calibri", letterSpacing: 3 });
    slide.addText("Enterprise ERP Connectivity", { x: 0.8, y: 0.65, w: 10, h: 0.7, fontSize: 28, bold: true, color: BRAND_DARK, fontFace: "Calibri" });
    const sapSystems = [
      { name: "SAP S/4HANA", method: "OData V4 API", features: "Real-time sync, material master, BOM, classification", badge: "RECOMMENDED" },
      { name: "SAP ECC", method: "RFC / IDoc", features: "Batch sync, MARA/MAKT/MARC tables, change pointers", badge: "SUPPORTED" },
      { name: "SAP Business One", method: "Service Layer API", features: "Items, BOM, business partners, inventory data", badge: "SUPPORTED" },
    ];
    sapSystems.forEach((s, i) => {
      const y = 1.6 + i * 1.4;
      slide.addShape(pptx.ShapeType.roundRect, { x: 0.8, y, w: 7, h: 1.15, fill: { color: "F8FAFC" }, line: { color: "E2E8F0", width: 1 }, rectRadius: 0.1 });
      slide.addText(s.name, { x: 1.1, y: y + 0.1, w: 3, h: 0.35, fontSize: 14, bold: true, color: BRAND_DARK, fontFace: "Calibri" });
      slide.addText(s.method, { x: 4.2, y: y + 0.1, w: 2, h: 0.35, fontSize: 10, color: BRAND_TEAL, bold: true, fontFace: "Calibri" });
      slide.addShape(pptx.ShapeType.roundRect, { x: 6.3, y: y + 0.12, w: 1.3, h: 0.3, fill: { color: i === 0 ? BRAND_CYAN : "E2E8F0" }, rectRadius: 0.05 });
      slide.addText(s.badge, { x: 6.3, y: y + 0.12, w: 1.3, h: 0.3, fontSize: 7, bold: true, color: i === 0 ? WHITE : "64748B", align: "center", valign: "middle", fontFace: "Calibri" });
      slide.addText(s.features, { x: 1.1, y: y + 0.55, w: 6.5, h: 0.4, fontSize: 10, color: "64748B", fontFace: "Calibri" });
    });
    slide.addShape(pptx.ShapeType.roundRect, { x: 8.3, y: 1.6, w: 4.2, h: 3.6, fill: { color: BRAND_DARK }, rectRadius: 0.12 });
    slide.addText("DATA FLOW", { x: 8.6, y: 1.75, w: 3.6, h: 0.3, fontSize: 10, bold: true, color: BRAND_CYAN, fontFace: "Calibri", letterSpacing: 2 });
    const flowItems = [
      { label: "SAP → PhotonicTag", items: "Material master, descriptions,\nplant data, classification,\nbatch & BOM data" },
      { label: "PhotonicTag → SAP", items: "Sustainability scores,\ncircularity grades, QR URLs,\ncompliance status flags" },
    ];
    flowItems.forEach((f, i) => {
      const y = 2.2 + i * 1.5;
      slide.addText(i === 0 ? "▼ INBOUND" : "▲ OUTBOUND", { x: 8.6, y, w: 3.6, h: 0.3, fontSize: 9, bold: true, color: i === 0 ? SUCCESS_GREEN : BRAND_BLUE, fontFace: "Calibri" });
      slide.addText(f.items, { x: 8.6, y: y + 0.3, w: 3.6, h: 0.9, fontSize: 10, color: BODY_TEXT, fontFace: "Calibri" });
    });
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 5.6, w: 11.7, h: 0.9, fill: { color: "EFF6FF" }, line: { color: "BFDBFE", width: 1 }, rectRadius: 0.1 });
    slide.addText("💡", { x: 1.0, y: 5.7, w: 0.5, h: 0.5, fontSize: 18, fontFace: "Calibri" });
    slide.addText("Typical implementation: 2-4 weeks  •  100-10,000 materials per sync batch  •  30-50 mapped fields per record  •  Delta detection for incremental updates", { x: 1.5, y: 5.7, w: 10.5, h: 0.7, fontSize: 10, color: "1E40AF", fontFace: "Calibri" });
    addFooter(slide, false);

    // ====================================
    // SLIDE 6: AI INTELLIGENCE
    // ====================================
    slide = pptx.addSlide();
    slide.background = { color: BRAND_DARK };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.34, h: 1.2, fill: { color: BRAND_NAVY } });
    slide.addText("AI INTELLIGENCE SUITE", { x: 0.8, y: 0.15, w: 10, h: 0.35, fontSize: 11, bold: true, color: BRAND_CYAN, fontFace: "Calibri", letterSpacing: 3 });
    slide.addText("Automated Insights from Product Data", { x: 0.8, y: 0.5, w: 10, h: 0.6, fontSize: 28, bold: true, color: WHITE, fontFace: "Calibri" });
    const aiModules = [
      { title: "AI Summary", desc: "Instant executive summary of any product's DPP — materials, origin, certifications, and key attributes in plain language.", grade: "GPT-4o", color: BRAND_BLUE },
      { title: "Sustainability Analysis", desc: "Carbon footprint estimation, environmental impact scoring, and actionable recommendations for improvement.", grade: "ESG Score", color: SUCCESS_GREEN },
      { title: "Circularity Score", desc: "A+ to F grade assessing recyclability, material reuse potential, and end-of-life processing readiness.", grade: "A+ → F", color: BRAND_TEAL },
      { title: "Repair Guide", desc: "Auto-generated step-by-step repair instructions based on product materials, components, and construction.", grade: "Auto-Gen", color: WARM_AMBER },
      { title: "Risk Assessment", desc: "Supply chain risk scoring across regulatory, environmental, ethical sourcing, and geopolitical factors.", grade: "Risk Score", color: DANGER_RED },
    ];
    aiModules.forEach((m, i) => {
      const isWide = i < 3;
      const col = isWide ? i : i - 3;
      const x = isWide ? 0.5 + col * 4.1 : 1.5 + col * 5.0;
      const y = isWide ? 1.5 : 4.0;
      const w = isWide ? 3.8 : 4.7;
      slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h: 2.2, fill: { color: CARD_DARK }, line: { color: m.color, width: 1.5 }, rectRadius: 0.12 });
      slide.addShape(pptx.ShapeType.roundRect, { x: x + 0.2, y: y + 0.2, w: 1.2, h: 0.3, fill: { color: m.color }, rectRadius: 0.05 });
      slide.addText(m.grade, { x: x + 0.2, y: y + 0.2, w: 1.2, h: 0.3, fontSize: 8, bold: true, color: WHITE, align: "center", valign: "middle", fontFace: "Calibri" });
      slide.addText(m.title, { x: x + 0.2, y: y + 0.65, w: w - 0.4, h: 0.4, fontSize: 14, bold: true, color: WHITE, fontFace: "Calibri" });
      slide.addText(m.desc, { x: x + 0.2, y: y + 1.1, w: w - 0.4, h: 0.9, fontSize: 10, color: BODY_TEXT, fontFace: "Calibri" });
    });
    addFooter(slide);

    // ====================================
    // SLIDE 7: COMPETITIVE DIFFERENTIATORS
    // ====================================
    slide = pptx.addSlide();
    slide.background = { color: WHITE };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.34, h: 0.08, fill: { color: BRAND_CYAN } });
    slide.addText("WHY PHOTONICTAG", { x: 0.8, y: 0.3, w: 10, h: 0.35, fontSize: 11, bold: true, color: BRAND_TEAL, fontFace: "Calibri", letterSpacing: 3 });
    slide.addText("Competitive Advantage", { x: 0.8, y: 0.65, w: 10, h: 0.7, fontSize: 28, bold: true, color: BRAND_DARK, fontFace: "Calibri" });
    const advantages = [
      { title: "Go Live in Weeks", desc: "Pre-built templates, automated data mapping, and guided onboarding. Not months — weeks.", metric: "4-6 weeks" },
      { title: "Physics-Rooted Identity", desc: "Beyond simple QR codes — tamper-proof signatures grounded in physical properties that cannot be replicated.", metric: "Unforgeable" },
      { title: "SAP-Native Integration", desc: "Bidirectional sync with existing SAP material master data. Works alongside your current ERP. No rip-and-replace.", metric: "3 connectors" },
      { title: "AI-Powered Automation", desc: "Sustainability scoring, repair guides, risk assessment, and compliance checks — generated automatically from your product data.", metric: "5 AI modules" },
      { title: "Consumer Transparency", desc: "Every product gets a mobile-optimized scan page with full DPP data — accessible via QR code anywhere in the world.", metric: "Global reach" },
      { title: "Enterprise Security", desc: "Role-based access, encrypted sessions, CloudEvents audit trail, and GDPR-compliant processing. SOC 2 ready.", metric: "99.9% SLA" },
    ];
    advantages.forEach((a, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.8 + col * 6.0;
      const y = 1.5 + row * 1.7;
      slide.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.7, h: 1.45, fill: { color: "F8FAFC" }, line: { color: "E2E8F0", width: 1 }, rectRadius: 0.1 });
      slide.addShape(pptx.ShapeType.rect, { x, y, w: 0.08, h: 1.45, fill: { color: BRAND_CYAN } });
      slide.addText(a.title, { x: x + 0.3, y: y + 0.1, w: 3.8, h: 0.35, fontSize: 13, bold: true, color: BRAND_DARK, fontFace: "Calibri" });
      slide.addShape(pptx.ShapeType.roundRect, { x: x + 4.2, y: y + 0.12, w: 1.2, h: 0.3, fill: { color: BRAND_CYAN }, rectRadius: 0.05 });
      slide.addText(a.metric, { x: x + 4.2, y: y + 0.12, w: 1.2, h: 0.3, fontSize: 8, bold: true, color: WHITE, align: "center", valign: "middle", fontFace: "Calibri" });
      slide.addText(a.desc, { x: x + 0.3, y: y + 0.5, w: 5.1, h: 0.8, fontSize: 10, color: "64748B", fontFace: "Calibri" });
    });
    addFooter(slide, false);

    // ====================================
    // SLIDE 8: TARGET INDUSTRIES
    // ====================================
    slide = pptx.addSlide();
    slide.background = { color: BRAND_DARK };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.34, h: 1.2, fill: { color: BRAND_NAVY } });
    slide.addText("TARGET INDUSTRIES", { x: 0.8, y: 0.15, w: 10, h: 0.35, fontSize: 11, bold: true, color: BRAND_CYAN, fontFace: "Calibri", letterSpacing: 3 });
    slide.addText("Industries & Compliance Deadlines", { x: 0.8, y: 0.5, w: 10, h: 0.6, fontSize: 28, bold: true, color: WHITE, fontFace: "Calibri" });
    const indRows: any[][] = [
      [
        { text: "Industry Sector", options: { bold: true, fontSize: 11, color: WHITE, fill: { color: BRAND_TEAL }, fontFace: "Calibri" } },
        { text: "Product Examples", options: { bold: true, fontSize: 11, color: WHITE, fill: { color: BRAND_TEAL }, fontFace: "Calibri" } },
        { text: "Deadline", options: { bold: true, fontSize: 11, color: WHITE, fill: { color: BRAND_TEAL }, fontFace: "Calibri", align: "center" } },
        { text: "Status", options: { bold: true, fontSize: 11, color: WHITE, fill: { color: BRAND_TEAL }, fontFace: "Calibri", align: "center" } },
      ],
    ];
    const indData = [
      { name: "Batteries & Energy Storage", ex: "Industrial batteries, EV batteries, portable power", dl: "Feb 2027", status: "URGENT", sColor: DANGER_RED },
      { name: "Textiles & Fashion", ex: "Apparel, technical textiles, footwear, accessories", dl: "2028", status: "UPCOMING", sColor: WARM_AMBER },
      { name: "Consumer Electronics", ex: "Smartphones, laptops, IoT devices, wearables", dl: "2028", status: "UPCOMING", sColor: WARM_AMBER },
      { name: "Automotive & EV", ex: "EV components, parts, accessories", dl: "2028", status: "UPCOMING", sColor: WARM_AMBER },
      { name: "Furniture & Home", ex: "Office furniture, home furnishings, mattresses", dl: "2029", status: "PLANNED", sColor: BRAND_BLUE },
      { name: "Industrial Packaging", ex: "Cardboard, biodegradable packaging, reusable containers", dl: "2029", status: "PLANNED", sColor: BRAND_BLUE },
    ];
    indData.forEach((ind, i) => {
      const bg = i % 2 === 0 ? CARD_DARK : BRAND_NAVY;
      indRows.push([
        { text: ind.name, options: { fontSize: 10, color: WHITE, fill: { color: bg }, fontFace: "Calibri", bold: true } },
        { text: ind.ex, options: { fontSize: 9, color: BODY_TEXT, fill: { color: bg }, fontFace: "Calibri" } },
        { text: ind.dl, options: { fontSize: 10, color: ind.dl.includes("2027") ? DANGER_RED : BRAND_CYAN, fill: { color: bg }, fontFace: "Calibri", bold: true, align: "center" } },
        { text: ind.status, options: { fontSize: 8, color: ind.sColor, fill: { color: bg }, fontFace: "Calibri", bold: true, align: "center" } },
      ]);
    });
    slide.addTable(indRows, { x: 0.8, y: 1.5, w: 11.5, colW: [3.2, 4.5, 1.5, 1.5], border: { type: "solid", pt: 0.5, color: CARD_BORDER }, rowH: [0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45] });
    addFooter(slide);

    // ====================================
    // SLIDE 9: PRICING
    // ====================================
    slide = pptx.addSlide();
    slide.background = { color: WHITE };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.34, h: 0.08, fill: { color: BRAND_CYAN } });
    slide.addText("PRICING", { x: 0.8, y: 0.3, w: 10, h: 0.35, fontSize: 11, bold: true, color: BRAND_TEAL, fontFace: "Calibri", letterSpacing: 3 });
    slide.addText("Transparent, Scalable Plans", { x: 0.8, y: 0.65, w: 10, h: 0.7, fontSize: 28, bold: true, color: BRAND_DARK, fontFace: "Calibri" });
    const pricingTiers = [
      { name: "POC", price: "€499", period: "/month", products: "Up to 50 products", features: ["Full DPP creation", "QR code generation", "Public scan pages", "Basic dashboard", "Email onboarding support"], highlight: false },
      { name: "Starter", price: "€1,499", period: "/month", products: "Up to 1,000 products", features: ["Everything in POC", "Excel bulk import", "Enhanced analytics", "Team collaboration (5)", "48h email support SLA"], highlight: false },
      { name: "Growth", price: "€2,999", period: "/month", products: "Up to 10,000 products", features: ["Everything in Starter", "AI insights suite", "IoT integration", "Team mgmt (20 users)", "24h priority support"], highlight: true },
      { name: "Enterprise", price: "Custom", period: "", products: "Unlimited products", features: ["Everything in Growth", "SAP integration suite", "SSO/SAML auth", "Dedicated account mgr", "4h phone support SLA"], highlight: false },
    ];
    pricingTiers.forEach((t, i) => {
      const x = 0.5 + i * 3.1;
      const bg = t.highlight ? BRAND_DARK : "F8FAFC";
      const borderColor = t.highlight ? BRAND_CYAN : "E2E8F0";
      slide.addShape(pptx.ShapeType.roundRect, { x, y: 1.4, w: 2.9, h: 5.0, fill: { color: bg }, line: { color: borderColor, width: t.highlight ? 2 : 1 }, rectRadius: 0.12 });
      if (t.highlight) {
        slide.addShape(pptx.ShapeType.roundRect, { x: x + 0.6, y: 1.2, w: 1.7, h: 0.35, fill: { color: BRAND_CYAN }, rectRadius: 0.06 });
        slide.addText("MOST POPULAR", { x: x + 0.6, y: 1.2, w: 1.7, h: 0.35, fontSize: 8, bold: true, color: WHITE, align: "center", valign: "middle", fontFace: "Calibri" });
      }
      const textColor = t.highlight ? WHITE : BRAND_DARK;
      const subColor = t.highlight ? BODY_TEXT : "64748B";
      slide.addText(t.name, { x, y: 1.6, w: 2.9, h: 0.45, fontSize: 16, bold: true, color: textColor, align: "center", fontFace: "Calibri" });
      slide.addText(t.price, { x, y: 2.05, w: 2.9, h: 0.55, fontSize: 24, bold: true, color: BRAND_CYAN, align: "center", fontFace: "Calibri" });
      slide.addText(t.period, { x: x + 1.8, y: 2.25, w: 1, h: 0.3, fontSize: 10, color: subColor, fontFace: "Calibri" });
      slide.addText(t.products, { x, y: 2.65, w: 2.9, h: 0.35, fontSize: 10, color: subColor, align: "center", fontFace: "Calibri" });
      slide.addShape(pptx.ShapeType.rect, { x: x + 0.3, y: 3.1, w: 2.3, h: 0.02, fill: { color: t.highlight ? CARD_BORDER : "E2E8F0" } });
      t.features.forEach((f, fi) => {
        slide.addText(`✓  ${f}`, { x: x + 0.2, y: 3.3 + fi * 0.45, w: 2.5, h: 0.35, fontSize: 9.5, color: subColor, fontFace: "Calibri" });
      });
    });
    slide.addText("Annual billing: 20% discount  •  All prices exclude VAT  •  POC credits apply to upgrade", { x: 0.8, y: 6.55, w: 11, h: 0.3, fontSize: 9, color: "94A3B8", fontFace: "Calibri", align: "center" });
    addFooter(slide, false);

    // ====================================
    // SLIDE 10: IMPLEMENTATION APPROACH
    // ====================================
    slide = pptx.addSlide();
    slide.background = { color: BRAND_DARK };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.34, h: 1.2, fill: { color: BRAND_NAVY } });
    slide.addText("IMPLEMENTATION APPROACH", { x: 0.8, y: 0.15, w: 10, h: 0.35, fontSize: 11, bold: true, color: BRAND_CYAN, fontFace: "Calibri", letterSpacing: 3 });
    slide.addText("Proven 6-Week POC Methodology", { x: 0.8, y: 0.5, w: 10, h: 0.6, fontSize: 28, bold: true, color: WHITE, fontFace: "Calibri" });
    const phases = [
      { week: "Week 1-2", title: "Discovery & Setup", items: "Requirements gathering\nSAP connector configuration\nData mapping definition\nEnvironment provisioning" },
      { week: "Week 3-4", title: "Integration & Enrichment", items: "Data migration execution\nAI insights activation\nQR code generation\nDPP template creation" },
      { week: "Week 5-6", title: "Validation & Handoff", items: "End-to-end testing\nUser acceptance testing\nTraining & documentation\nGo/No-Go decision" },
    ];
    phases.forEach((p, i) => {
      const x = 0.5 + i * 4.1;
      slide.addShape(pptx.ShapeType.roundRect, { x, y: 1.5, w: 3.9, h: 3.5, fill: { color: CARD_DARK }, line: { color: CARD_BORDER, width: 1 }, rectRadius: 0.12 });
      slide.addShape(pptx.ShapeType.roundRect, { x: x + 0.2, y: 1.7, w: 1.6, h: 0.35, fill: { color: BRAND_CYAN }, rectRadius: 0.06 });
      slide.addText(p.week, { x: x + 0.2, y: 1.7, w: 1.6, h: 0.35, fontSize: 10, bold: true, color: WHITE, align: "center", valign: "middle", fontFace: "Calibri" });
      slide.addText(p.title, { x: x + 0.2, y: 2.2, w: 3.5, h: 0.4, fontSize: 15, bold: true, color: WHITE, fontFace: "Calibri" });
      slide.addText(p.items, { x: x + 0.2, y: 2.8, w: 3.5, h: 1.8, fontSize: 11, color: BODY_TEXT, fontFace: "Calibri", lineSpacingMultiple: 1.5 });
    });
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: 5.3, w: 12.0, h: 1.2, fill: { color: BRAND_NAVY }, line: { color: CARD_BORDER, width: 1 }, rectRadius: 0.12 });
    slide.addText("DELIVERABLES", { x: 0.8, y: 5.4, w: 3, h: 0.3, fontSize: 10, bold: true, color: BRAND_CYAN, fontFace: "Calibri", letterSpacing: 2 });
    const deliverables = [
      "Fully configured DPP platform",
      "SAP integration (if applicable)",
      "AI insights for all products",
      "QR codes & public scan pages",
      "User training & documentation",
      "Validation report with recommendation",
    ];
    deliverables.forEach((d, i) => {
      slide.addText(`✓  ${d}`, { x: 0.8 + (i % 3) * 3.9, y: 5.75 + Math.floor(i / 3) * 0.35, w: 3.7, h: 0.3, fontSize: 10, color: BODY_TEXT, fontFace: "Calibri" });
    });
    addFooter(slide);

    // ====================================
    // SLIDE 11: CTA — Final slide
    // ====================================
    slide = pptx.addSlide();
    slide.background = { color: BRAND_DARK };
    slide.addShape(pptx.ShapeType.ellipse, { x: -3, y: -3, w: 10, h: 10, fill: { color: BRAND_NAVY } });
    slide.addShape(pptx.ShapeType.ellipse, { x: 7, y: 2, w: 8, h: 8, fill: { color: "162044" } });
    if (logoExists) {
      slide.addImage({ path: logoPath, x: 6.17, y: 0.3, w: 1.0, h: 1.0 });
    }
    slide.addText("Ready to future-proof\nyour products?", { x: 1, y: 1.3, w: 11, h: 1.4, fontSize: 40, bold: true, color: WHITE, align: "center", fontFace: "Calibri" });
    slide.addText("The EU DPP mandate is coming. Early adopters gain competitive advantage,\nconsumer trust, and regulatory peace of mind.", { x: 1.5, y: 2.6, w: 10, h: 0.8, fontSize: 15, color: SUBTLE_TEXT, align: "center", fontFace: "Calibri" });
    slide.addShape(pptx.ShapeType.roundRect, { x: 3.5, y: 3.8, w: 6, h: 0.9, fill: { color: BRAND_CYAN }, rectRadius: 0.15 });
    slide.addText("Schedule Your Personalized Demo →", { x: 3.5, y: 3.8, w: 6, h: 0.9, fontSize: 18, bold: true, color: WHITE, align: "center", valign: "middle", fontFace: "Calibri" });
    slide.addShape(pptx.ShapeType.roundRect, { x: 4, y: 5.0, w: 5, h: 0.7, fill: { color: "transparent" }, line: { color: SUBTLE_TEXT, width: 1 }, rectRadius: 0.12 });
    slide.addText("Or start with a POC — €499/month", { x: 4, y: 5.0, w: 5, h: 0.7, fontSize: 14, color: SUBTLE_TEXT, align: "center", valign: "middle", fontFace: "Calibri" });
    slide.addText("PhotonicTag", { x: 1, y: 6.0, w: 11, h: 0.4, fontSize: 14, bold: true, color: BRAND_CYAN, align: "center", fontFace: "Calibri" });
    slide.addText("enterprise@photonictag.com  •  www.photonictag.com  •  +49 (0) 800 PHOTONIC", { x: 1, y: 6.35, w: 11, h: 0.35, fontSize: 11, color: SUBTLE_TEXT, align: "center", fontFace: "Calibri" });

    const data = await pptx.write({ outputType: "nodebuffer" }) as Buffer;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    res.setHeader("Content-Disposition", "attachment; filename=PhotonicTag_Marketing_Presentation.pptx");
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
    poc: "€499/month (POC Tier)",
    starter: "€1,499/month",
    growth: "€2,999/month",
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
