import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

type FAQCategory = "compliance" | "technical" | "integration" | "security" | "pricing" | "operations";

const faqCategories: { id: FAQCategory; label: string }[] = [
  { id: "compliance", label: "EU DPP Compliance" },
  { id: "technical", label: "Technical" },
  { id: "integration", label: "SAP & ERP Integration" },
  { id: "security", label: "Security & Data Protection" },
  { id: "pricing", label: "Pricing & Plans" },
  { id: "operations", label: "Operations & Support" },
];

const faqs: Record<FAQCategory, { q: string; a: string }[]> = {
  compliance: [
    {
      q: "What is the EU Digital Product Passport (DPP) regulation?",
      a: "The Digital Product Passport is mandated by the EU Ecodesign for Sustainable Products Regulation (ESPR), Regulation (EU) 2024/1781. It requires products sold in the EU to carry a digital record containing information about materials, environmental impact, durability, repairability, recycling instructions, and compliance certifications. The regulation is being phased in starting February 2027 with batteries, expanding to all product categories by 2030."
    },
    {
      q: "When does my industry need to comply?",
      a: "The ESPR phased rollout begins on February 18, 2027 for industrial and EV batteries. Textiles, electronics, and ICT products follow in 2028. Furniture, construction materials, and chemicals are scheduled for 2029. By 2030, all product categories must carry Digital Product Passports. We strongly recommend starting compliance preparations 12-18 months before your industry's deadline."
    },
    {
      q: "What are the penalties for non-compliance?",
      a: "Non-compliance with ESPR can result in fines up to €100,000 or more per violation, depending on the member state's enforcement framework. Beyond financial penalties, non-compliant products may be restricted from EU market access, causing significant supply chain and revenue disruption."
    },
    {
      q: "What data fields are required in a Digital Product Passport?",
      a: "ESPR requires seven categories of data: (1) Product Identification — name, manufacturer, model number, SKU, country of origin; (2) Materials & Composition — material breakdown, recycled content, hazardous materials; (3) Environmental Impact — carbon footprint, water usage, energy consumption; (4) Durability & Repairability — repairability score, lifespan, spare parts availability; (5) Ownership & Lifecycle — manufacture date, ownership history; (6) Compliance & Certifications — CE marking, safety certifications; (7) End-of-Life — recycling instructions, disassembly guidance, take-back programs."
    },
    {
      q: "Does PhotonicTag cover both the Battery Regulation and ESPR?",
      a: "Yes. PhotonicTag's DPP schema is designed to cover both the EU Battery Regulation (2023/1542) requirements for battery passports and the broader ESPR (2024/1781) requirements. The platform includes specific fields for battery chemistry, capacity, cycle life, and state-of-health alongside the general DPP categories."
    },
    {
      q: "How quickly can we achieve compliance?",
      a: "Most organizations can go live with PhotonicTag within 4-8 weeks, depending on data availability and integration complexity. The process involves: (1) data audit and mapping (1-2 weeks), (2) system integration and configuration (2-3 weeks), (3) data population and validation (1-2 weeks), and (4) testing and go-live (1 week). Organizations with existing SAP data can accelerate this through automated field mapping."
    },
  ],
  technical: [
    {
      q: "What technology stack does PhotonicTag use?",
      a: "PhotonicTag is built on a modern cloud-native stack: React with TypeScript and Vite for the frontend, Node.js with Express for the backend, PostgreSQL with Drizzle ORM for the database, OpenAI GPT-4o for AI intelligence, and OAuth 2.0/OIDC for authentication. The platform uses a CloudEvents-based event bus for audit logging and traceability."
    },
    {
      q: "How are QR codes generated and managed?",
      a: "QR codes are generated server-side using the 'qrcode' library and stored as data URLs in the product record. Each QR code links to a unique public URL (/product/:id) that displays the product's Digital Product Passport in a consumer-friendly, mobile-optimized format. QR codes are generated automatically when a product is created and are tamper-proof — the URL cannot be modified to point to a different product."
    },
    {
      q: "Can we import existing product data?",
      a: "Yes, PhotonicTag supports multiple data import methods: (1) Manual entry through the admin dashboard with full form validation; (2) Excel bulk import (.xlsx, .xls, .csv) with automatic column header mapping (supports both English and German headers); (3) SAP bidirectional sync for automated data import from material master records; (4) REST API for programmatic data integration from other systems."
    },
    {
      q: "What AI capabilities are included?",
      a: "PhotonicTag provides five AI-powered insight types: AI Summary (product overview), Sustainability Analysis (environmental impact scoring), Repair Guide (repairability assessment and instructions), Circularity Score (A+ to F recyclability grade), and Risk Assessment (compliance gap analysis and counterfeit risk evaluation). All insights are generated from product data using GPT-4o and cached for efficiency."
    },
    {
      q: "Is the platform available as an API for headless integration?",
      a: "Yes, PhotonicTag exposes a full REST API under the /api/* prefix covering products, IoT devices, AI insights, SAP integration, and demo management. All endpoints return JSON and support standard HTTP methods (GET, POST, PATCH, DELETE). Authentication uses session-based tokens for admin and team users."
    },
  ],
  integration: [
    {
      q: "Which SAP systems does PhotonicTag integrate with?",
      a: "PhotonicTag supports integration with SAP S/4HANA (via OData API), SAP ECC (via RFC and IDoc), and SAP Business One (via API). The integration connector is configurable for each system type and supports inbound, outbound, and bidirectional synchronization."
    },
    {
      q: "How does bidirectional sync work with SAP?",
      a: "Bidirectional sync maps SAP material master fields (MARA/MARC structures) to DPP data fields. When you sync from SAP, material records are imported as DPP products. When you sync to SAP, DPP updates are exported back to material records. The system automatically detects conflicts when data differs in both systems and provides a side-by-side comparison interface for resolution — you can choose to keep SAP values, keep PhotonicTag values, or merge field-by-field."
    },
    {
      q: "What sync frequency options are available?",
      a: "Four sync frequency modes are supported: Real-time (event-triggered for immediate updates), Hourly (scheduled batch sync), Daily (scheduled overnight sync), and Manual (on-demand sync triggered by admin). The recommended mode depends on your data change frequency and SAP system load."
    },
    {
      q: "Can we integrate with non-SAP ERP systems?",
      a: "The current version includes native SAP integration with pre-built field mappings. For non-SAP ERPs (Oracle, Microsoft Dynamics, etc.), integration is possible through the REST API. Custom connector development for additional ERP systems can be arranged as part of an Enterprise engagement."
    },
    {
      q: "How is field mapping configured between SAP and PhotonicTag?",
      a: "Field mapping is configured through the SAP Connector admin page. Pre-built mappings cover standard SAP fields (MATNR → SKU, MAKTX → Product Name, MTART → Category, etc.). Custom field mappings can be added for organization-specific SAP extensions. The mapping configuration supports transformation rules for data format conversion."
    },
  ],
  security: [
    {
      q: "How is user authentication handled?",
      a: "PhotonicTag uses a three-tier authentication system: (1) Super Admin accounts authenticate via OAuth 2.0 / OpenID Connect for maximum security; (2) Internal team members authenticate via email/password with bcrypt-hashed credentials; (3) Demo viewers authenticate via email/password with role-restricted access. All sessions are stored in PostgreSQL with encrypted session cookies."
    },
    {
      q: "Is the platform GDPR compliant?",
      a: "Yes, PhotonicTag is designed with GDPR compliance in mind. Personal data processing follows data minimization principles. All data is stored in EU-region PostgreSQL databases. Password data is hashed with bcrypt (cost factor 10). The platform supports data export and deletion requests. CloudEvents audit logging provides a complete record of all data processing activities."
    },
    {
      q: "How is product data protected against tampering?",
      a: "Product data integrity is ensured through multiple mechanisms: (1) Physics-rooted identity signatures that cannot be replicated; (2) CloudEvents audit trail recording every data change with timestamps; (3) Role-based access control preventing unauthorized modifications; (4) QR codes that are cryptographically linked to their product records; (5) Database-level constraints enforcing data validity."
    },
    {
      q: "What role-based access levels exist?",
      a: "Three access tiers: Super Admin (full platform access including all admin features, CRM, user management, support triage, and platform ops), Internal Team (access to CRM and Demo Factory, with roles like Sales Partner, Reseller, and Consultant), and Demo Viewers (read-only access to product dashboard, product details, IoT devices, and SAP integration views)."
    },
    {
      q: "How are API keys and secrets managed?",
      a: "All sensitive credentials are stored as encrypted secrets in the deployment environment, never in source code. Session secrets, API keys, and authentication tokens are managed through secure environment variables. The platform uses automatic secret rotation where supported and follows the principle of least privilege for service-to-service communication."
    },
  ],
  pricing: [
    {
      q: "What pricing tiers are available?",
      a: "PhotonicTag offers four tiers: Free (up to 100 products, basic DPP features), Starter (up to 1,000 products, QR codes, basic analytics), Growth (up to 10,000 products, AI insights, IoT integration), and Enterprise (unlimited products, SAP integration, dedicated support, custom SLAs). Annual billing provides a 20% discount. Contact us for Enterprise pricing."
    },
    {
      q: "Is there a free trial?",
      a: "Yes, the Free tier allows up to 100 products with full DPP creation capability, QR code generation, and public scan pages — no credit card required. This is a permanent free tier, not a time-limited trial, so you can evaluate the platform at your own pace before upgrading."
    },
    {
      q: "What is included in the Enterprise tier?",
      a: "The Enterprise tier includes: unlimited products, full SAP S/4HANA/ECC/Business One integration, dedicated account manager, custom SLAs, priority support, SSO/SAML authentication, custom branding, advanced analytics, and API rate limit increases. Pricing is based on your organization's specific requirements — contact our sales team for a custom quote."
    },
    {
      q: "How does PhotonicTag compare to building DPP compliance in-house?",
      a: "Building an in-house DPP solution typically costs 3-6 months of development time and €200K-500K+ in engineering resources, with ongoing maintenance overhead. PhotonicTag provides an out-of-the-box solution with EU-compliant DPP schemas, SAP integration, AI automation, and continuous regulatory updates — typically achieving compliance at 10-20% of the cost of building from scratch, with a go-live timeline of 4-8 weeks."
    },
  ],
  operations: [
    {
      q: "How do I create a demo for a prospect?",
      a: "The Demo Factory (accessible from the internal admin dashboard) lets you generate client-ready demos in seconds. Choose from 6 industry templates (Battery, Fashion, Electronics, EV, Packaging, Furniture) or write a custom AI prompt. Products are generated automatically. You can then set demo-specific login credentials (email/password) and share the demo URL directly with your prospect."
    },
    {
      q: "Can I import leads and accounts from Excel?",
      a: "Yes, the CRM supports Excel bulk import. Upload .xlsx, .xls, or .csv files up to 10MB. The system automatically maps column headers (supporting both English and German variants like 'Firma', 'Vorname', 'Nachname'). You can import as leads (for sales pipeline) or customer accounts (for CRM tracking). Email deduplication prevents duplicate records."
    },
    {
      q: "How does AI health scoring work in the CRM?",
      a: "Each customer account receives an AI-generated health score from 0 to 100 based on engagement patterns, revenue trends, and activity history. The AI also generates next-best-action recommendations (e.g., schedule a check-in, propose an upsell, escalate risk). Accounts scoring below 50 are automatically flagged as at-risk for proactive intervention."
    },
    {
      q: "What support channels are available?",
      a: "Support requests are managed through the AI Support Triage system, which automatically categorizes, prioritizes, and tags incoming tickets. The system generates AI summaries for faster resolution. For Enterprise customers, dedicated account managers and priority support SLAs are available. All customers can reach us via the contact form at /contact."
    },
    {
      q: "How do I monitor platform health?",
      a: "The Platform Ops tab in the admin dashboard provides real-time monitoring of system health including uptime percentage, memory usage, entity counts across all database tables, and auto-refresh every 30 seconds. This gives you instant visibility into system status without needing external monitoring tools."
    },
  ],
};

export default function FAQs() {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>("compliance");

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>FAQs - PhotonicTag | EU Digital Product Passport Questions</title>
        <meta name="description" content="Frequently asked questions about PhotonicTag. EU DPP compliance, SAP integration, security, pricing, and technical documentation." />
        <meta property="og:title" content="PhotonicTag - Frequently Asked Questions" />
        <meta property="og:description" content="Common questions about EU Digital Product Passport compliance, SAP integration, and the PhotonicTag platform." />
      </Helmet>
      <PublicNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-3">FAQ</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3" data-testid="text-faqs-title">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Common questions about EU DPP compliance, platform capabilities, SAP integration, security, and operations.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {faqCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
              data-testid={`button-faq-category-${cat.id}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs[activeCategory].map((faq, i) => (
            <AccordionItem key={`${activeCategory}-${i}`} value={`${activeCategory}-${i}`} className="border rounded-lg px-4" data-testid={`faq-item-${activeCategory}-${i}`}>
              <AccordionTrigger className="text-left font-medium py-4 hover:no-underline" data-testid={`faq-trigger-${activeCategory}-${i}`}>
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Our team is happy to answer your questions about PhotonicTag, EU DPP compliance, or how we can help your organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild data-testid="button-faqs-demo">
              <a href="https://calendar.app.google/Aa9nfUnJiZvcjXi28" target="_blank" rel="noopener noreferrer" className="gap-2">
                <Calendar className="w-4 h-4" />
                Schedule a Demo
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-faqs-contact">
              <Link href="/contact" className="gap-2">
                <ArrowRight className="w-4 h-4" />
                Contact Sales
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
