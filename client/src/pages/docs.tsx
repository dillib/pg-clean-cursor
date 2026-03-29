import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Book, Code, Zap, FileText, Settings, Users, Shield, QrCode,
  Cpu, Database, Leaf, BarChart3, Layers, CheckCircle, Globe,
  Lock, Smartphone, RefreshCw, ArrowRight, Calendar
} from "lucide-react";
import { Link } from "wouter";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { useState } from "react";

type DocSection = "overview" | "dpp" | "modules" | "sap" | "ai" | "iot" | "security" | "api";

const sideNavItems: { id: DocSection; label: string; icon: typeof Book }[] = [
  { id: "overview", label: "Platform Overview", icon: Globe },
  { id: "dpp", label: "Digital Product Passports", icon: QrCode },
  { id: "modules", label: "Core Modules", icon: Layers },
  { id: "sap", label: "SAP Integration", icon: Database },
  { id: "ai", label: "AI Intelligence", icon: Zap },
  { id: "iot", label: "IoT & Smart Tagging", icon: Cpu },
  { id: "security", label: "Security & Access Control", icon: Shield },
  { id: "api", label: "API Reference", icon: Code },
];

function DocH3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-foreground mt-6 mb-2">{children}</h3>;
}
function DocH4({ children }: { children: React.ReactNode }) {
  return <h4 className="text-sm font-semibold text-foreground mt-4 mb-1.5">{children}</h4>;
}
function DocP({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground leading-relaxed mb-3">{children}</p>;
}
function DocUl({ children }: { children: React.ReactNode }) {
  return <ul className="text-sm text-muted-foreground space-y-1 mb-3 ml-4 list-disc list-outside">{children}</ul>;
}
function DocOl({ children }: { children: React.ReactNode }) {
  return <ol className="text-sm text-muted-foreground space-y-1 mb-3 ml-4 list-decimal list-outside">{children}</ol>;
}
function DocLi({ children }: { children: React.ReactNode }) {
  return <li className="leading-relaxed">{children}</li>;
}
function DocCode({ children }: { children: React.ReactNode }) {
  return <code className="text-xs font-mono bg-muted text-foreground px-1.5 py-0.5 rounded">{children}</code>;
}
function DocTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            {headers.map((h, i) => (
              <th key={i} className="text-left py-2 px-3 text-foreground font-medium text-xs uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border/50 hover:bg-muted/30">
              {row.map((cell, ci) => (
                <td key={ci} className="py-2 px-3 text-muted-foreground text-sm">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OverviewSection() {
  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-doc-overview">Platform Overview</h2>
        <p className="text-muted-foreground text-sm">PhotonicTag is an AI-powered Digital Product Passport platform designed for EU ESPR Regulation (EU) 2024/1781 compliance.</p>
      </div>
      <DocH3>What is PhotonicTag?</DocH3>
      <DocP>PhotonicTag transforms product identity into a physics-rooted, tamper-proof signature, bridging the physical and digital worlds. The platform enables brands, regulators, and consumers to verify product authenticity, trace origins, and understand the full lifecycle of any product.</DocP>
      <DocH3>Key Value Propositions</DocH3>
      <DocUl>
        <DocLi><strong className="text-foreground">EU DPP Compliance:</strong> Full compliance with ESPR Regulation (EU) 2024/1781, covering product identification, material composition, environmental impact, durability, and end-of-life documentation.</DocLi>
        <DocLi><strong className="text-foreground">SAP Integration:</strong> Bidirectional synchronization with SAP S/4HANA, ECC, and Business One — connecting existing ERP data directly to Digital Product Passports.</DocLi>
        <DocLi><strong className="text-foreground">AI Automation:</strong> Automated sustainability scoring, circularity assessment, repair guides, and risk analysis powered by GPT-4o.</DocLi>
        <DocLi><strong className="text-foreground">Consumer Transparency:</strong> Every product receives a unique QR code linking to a public-facing Digital Product Passport page accessible on any device.</DocLi>
        <DocLi><strong className="text-foreground">Rapid Deployment:</strong> Go live in weeks with pre-built industry templates, automated field mapping, and guided onboarding.</DocLi>
      </DocUl>
      <DocH3>Architecture Overview</DocH3>
      <DocTable
        headers={["Layer", "Technology"]}
        rows={[
          ["Frontend", "React + TypeScript, Vite, Tailwind CSS, Shadcn/ui"],
          ["Backend", "Node.js + Express, TypeScript, RESTful APIs"],
          ["Database", "PostgreSQL with Drizzle ORM"],
          ["AI Engine", "OpenAI GPT-4o via API"],
          ["Authentication", "OAuth 2.0 / OpenID Connect with role-based access"],
          ["Events", "CloudEvents-based audit logging"],
        ]}
      />
    </div>
  );
}

function DPPSection() {
  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-doc-dpp">Digital Product Passports</h2>
        <p className="text-muted-foreground text-sm">Comprehensive EU ESPR-compliant product documentation covering the full product lifecycle.</p>
      </div>
      <DocH3>DPP Data Schema</DocH3>
      <DocP>Each Digital Product Passport contains structured data across seven mandatory categories defined by ESPR:</DocP>
      <DocH4>1. Product Identification</DocH4>
      <DocUl>
        <DocLi>Product name, category, model number, SKU</DocLi>
        <DocLi>Manufacturer name and address</DocLi>
        <DocLi>Country of origin, batch and lot numbers</DocLi>
        <DocLi>Unique product identifier (UUID)</DocLi>
      </DocUl>
      <DocH4>2. Materials & Composition</DocH4>
      <DocUl>
        <DocLi>Materials list and detailed material breakdown</DocLi>
        <DocLi>Recycled content percentage</DocLi>
        <DocLi>Recyclability percentage</DocLi>
        <DocLi>Hazardous materials declaration</DocLi>
      </DocUl>
      <DocH4>3. Environmental Impact</DocH4>
      <DocUl>
        <DocLi>Carbon footprint (kg CO2e)</DocLi>
        <DocLi>Water usage (liters)</DocLi>
        <DocLi>Energy consumption (kWh)</DocLi>
        <DocLi>Environmental certifications</DocLi>
      </DocUl>
      <DocH4>4. Durability & Repairability</DocH4>
      <DocUl>
        <DocLi>Repairability score (0-10)</DocLi>
        <DocLi>Expected lifespan (years)</DocLi>
        <DocLi>Spare parts availability status</DocLi>
        <DocLi>Repair instructions and service center locations</DocLi>
      </DocUl>
      <DocH4>5. Ownership & Lifecycle</DocH4>
      <DocUl>
        <DocLi>Date of manufacture and first sale</DocLi>
        <DocLi>Ownership history tracking</DocLi>
      </DocUl>
      <DocH4>6. Compliance & Certifications</DocH4>
      <DocUl>
        <DocLi>CE marking status</DocLi>
        <DocLi>Safety certifications list</DocLi>
        <DocLi>EU ESPR / Battery Regulation / REACH compliance fields</DocLi>
      </DocUl>
      <DocH4>7. End-of-Life & Recycling</DocH4>
      <DocUl>
        <DocLi>Recycling instructions</DocLi>
        <DocLi>Disassembly instructions</DocLi>
        <DocLi>Hazard warnings</DocLi>
        <DocLi>Take-back program information</DocLi>
      </DocUl>
      <DocH3>QR Code System</DocH3>
      <DocP>Every product automatically receives a unique QR code generated server-side. Scanning the QR code redirects to the product's public Digital Product Passport page at <DocCode>/product/:id</DocCode>, displaying all DPP data in a consumer-friendly format accessible on any smartphone.</DocP>
    </div>
  );
}

function ModulesSection() {
  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-doc-modules">Core Modules</h2>
        <p className="text-muted-foreground text-sm">Six integrated modules covering the complete Digital Product Passport lifecycle.</p>
      </div>
      <DocH3>Module 1: DPP Management</DocH3>
      <DocP>Create, edit, and manage Digital Product Passports with a comprehensive interface. Supports single product creation, bulk import via Excel, and AI-assisted data population. Full CRUD operations with validation against ESPR schema requirements.</DocP>
      <DocH3>Module 2: QR Identity</DocH3>
      <DocP>Tamper-proof QR code generation linking physical products to their digital passports. Server-side generation with data URL storage. Public scan pages optimized for mobile access with structured DPP data display.</DocP>
      <DocH3>Module 3: Supply Chain Traceability</DocH3>
      <DocP>End-to-end event tracking using CloudEvents specification. Records product creation, updates, QR generation, identity assignment, trace events, and AI insight generation. Complete audit trail for regulatory compliance.</DocP>
      <DocH3>Module 4: Authentication & Anti-Counterfeiting</DocH3>
      <DocP>Physics-rooted identity signatures ensuring product authenticity. Verifiable proof-of-origin accessible via any smartphone. Integration with IoT sensors for real-time tamper detection.</DocP>
      <DocH3>Module 5: IoT Smart Tagging</DocH3>
      <DocP>NFC, RFID, and BLE device management for real-time product monitoring. Device registration, sensor readings capture, scan tracking, and environmental condition monitoring throughout the supply chain.</DocP>
      <DocH3>Module 6: AI Intelligence</DocH3>
      <DocP>Five AI-powered insight types generated from product data: Summary, Sustainability Analysis, Repair Guide, Circularity Score (A+ to F), and Risk Assessment. Automated compliance checking and recommendation generation.</DocP>
    </div>
  );
}

function SAPSection() {
  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-doc-sap">SAP Integration</h2>
        <p className="text-muted-foreground text-sm">Enterprise-grade bidirectional synchronization with SAP ERP systems.</p>
      </div>
      <DocH3>Supported SAP Systems</DocH3>
      <DocUl>
        <DocLi><strong className="text-foreground">SAP S/4HANA:</strong> Full OData API integration with real-time sync capability</DocLi>
        <DocLi><strong className="text-foreground">SAP ECC:</strong> RFC and IDoc-based integration for legacy ERP environments</DocLi>
        <DocLi><strong className="text-foreground">SAP Business One:</strong> API integration for small and mid-market deployments</DocLi>
      </DocUl>
      <DocH3>Synchronization Modes</DocH3>
      <DocUl>
        <DocLi><strong className="text-foreground">Inbound Only:</strong> Import SAP material master data (MARA/MARC) into PhotonicTag DPPs</DocLi>
        <DocLi><strong className="text-foreground">Outbound Only:</strong> Export DPP data updates back to SAP material records</DocLi>
        <DocLi><strong className="text-foreground">Bidirectional:</strong> Full two-way sync with automatic conflict detection and resolution</DocLi>
      </DocUl>
      <DocH3>Sync Frequency Options</DocH3>
      <DocUl>
        <DocLi>Real-time (event-triggered)</DocLi>
        <DocLi>Hourly scheduled</DocLi>
        <DocLi>Daily scheduled</DocLi>
        <DocLi>Manual on-demand</DocLi>
      </DocUl>
      <DocH3>Field Mapping</DocH3>
      <DocP>Configurable field mapping between SAP material master fields and DPP data fields. Pre-configured mappings include:</DocP>
      <DocTable
        headers={["SAP Field", "DPP Field"]}
        rows={[
          ["MATNR (Material Number)", "Product SKU"],
          ["MAKTX (Material Description)", "Product Name"],
          ["MTART (Material Type)", "Product Category"],
          ["MEINS (Base Unit of Measure)", "Unit of Measure"],
          ["MATKL (Material Group)", "Material Classification"],
          ["NORMT (Industry Standard)", "Compliance Standard"],
        ]}
      />
      <DocH3>Conflict Resolution</DocH3>
      <DocP>When data differs between SAP and PhotonicTag, the system provides a side-by-side comparison interface with three resolution strategies:</DocP>
      <DocUl>
        <DocLi><strong className="text-foreground">Keep SAP:</strong> Accept SAP value as authoritative</DocLi>
        <DocLi><strong className="text-foreground">Keep PhotonicTag:</strong> Retain PhotonicTag value</DocLi>
        <DocLi><strong className="text-foreground">Manual Merge:</strong> Choose field-by-field which value to keep</DocLi>
      </DocUl>
    </div>
  );
}

function AISection() {
  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-doc-ai">AI Intelligence</h2>
        <p className="text-muted-foreground text-sm">Five AI-powered insight types providing automated product analysis and compliance assessment.</p>
      </div>
      <DocH3>AI Insight Types</DocH3>
      <DocH4>1. AI Summary</DocH4>
      <DocP>Generates a concise product overview highlighting key features, materials, and compliance status. Useful for quick product evaluation and consumer-facing descriptions.</DocP>
      <DocH4>2. Sustainability Analysis</DocH4>
      <DocP>Evaluates environmental impact across carbon footprint, water usage, and energy consumption. Provides a sustainability score and actionable recommendations for improvement.</DocP>
      <DocH4>3. Repair Guide</DocH4>
      <DocP>Assesses product repairability on a 0-10 scale. Generates step-by-step repair instructions, spare parts availability information, and service center recommendations for ESPR durability documentation.</DocP>
      <DocH4>4. Circularity Score</DocH4>
      <DocP>Grades products from A+ to F based on recyclability, material efficiency, and end-of-life options. Evaluates:</DocP>
      <DocUl>
        <DocLi>Recyclability percentage and material recovery potential</DocLi>
        <DocLi>Use of recycled content in manufacturing</DocLi>
        <DocLi>Disassembly complexity and design for recycling</DocLi>
        <DocLi>Take-back program availability</DocLi>
      </DocUl>
      <DocH4>5. Risk Assessment</DocH4>
      <DocUl>
        <DocLi>Overall risk level (Low / Medium / High / Critical)</DocLi>
        <DocLi>Data completeness percentage for DPP compliance</DocLi>
        <DocLi>Counterfeit risk based on product category and distribution</DocLi>
        <DocLi>Compliance gap analysis against ESPR requirements</DocLi>
      </DocUl>
      <DocH3>Fetch-or-Generate Pattern</DocH3>
      <DocP>AI insights use a caching pattern: if insights have been previously generated for a product, the cached version is returned. New insights are generated on-demand and stored for subsequent requests, minimizing API costs while ensuring data freshness.</DocP>
    </div>
  );
}

function IoTSection() {
  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-doc-iot">IoT & Smart Tagging</h2>
        <p className="text-muted-foreground text-sm">NFC, RFID, and BLE device management for real-time product tracking and monitoring.</p>
      </div>
      <DocH3>Supported Device Types</DocH3>
      <DocUl>
        <DocLi><strong className="text-foreground">NFC Tags:</strong> Near-field communication tags for tap-to-read product identification. Ideal for consumer-facing authentication.</DocLi>
        <DocLi><strong className="text-foreground">RFID Tags:</strong> Radio-frequency identification for warehouse and supply chain scanning. Supports bulk reading at distance.</DocLi>
        <DocLi><strong className="text-foreground">BLE Beacons:</strong> Bluetooth Low Energy devices for continuous environmental monitoring. Track temperature, humidity, and location.</DocLi>
      </DocUl>
      <DocH3>Device Lifecycle</DocH3>
      <DocOl>
        <DocLi><strong className="text-foreground">Registration:</strong> Register device with manufacturer, model, firmware version, and unique device ID</DocLi>
        <DocLi><strong className="text-foreground">Linking:</strong> Associate device with a specific product via product ID</DocLi>
        <DocLi><strong className="text-foreground">Monitoring:</strong> Capture sensor readings and track scan events</DocLi>
        <DocLi><strong className="text-foreground">Maintenance:</strong> Update firmware versions, monitor battery status, track last-seen timestamps</DocLi>
      </DocOl>
      <DocH3>Sensor Data</DocH3>
      <DocP>IoT devices can report sensor readings including temperature, humidity, vibration, light exposure, and GPS coordinates. This data feeds into the supply chain traceability module for condition monitoring during transport and storage.</DocP>
    </div>
  );
}

function SecuritySection() {
  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-doc-security">Security & Access Control</h2>
        <p className="text-muted-foreground text-sm">Enterprise-grade security with role-based access control across user tiers.</p>
      </div>
      <DocH3>Access Control Tiers</DocH3>
      <DocH4>Super Admin</DocH4>
      <DocUl>
        <DocLi>Authentication: OAuth 2.0 via OpenID Connect</DocLi>
        <DocLi>Full platform access including all admin features</DocLi>
        <DocLi>Route prefix: <DocCode>/admin/*</DocCode></DocLi>
      </DocUl>
      <DocH4>Internal Team</DocH4>
      <DocUl>
        <DocLi>Authentication: Email/password with bcrypt hashing</DocLi>
        <DocLi>Roles: Sales Partner, Reseller, Consultant</DocLi>
        <DocLi>Route prefix: <DocCode>/internal/*</DocCode></DocLi>
      </DocUl>
      <DocH4>Demo Viewers</DocH4>
      <DocUl>
        <DocLi>Authentication: Email/password with bcrypt hashing</DocLi>
        <DocLi>Access: Product dashboard, product details, IoT devices, SAP (read-only demo)</DocLi>
        <DocLi>Route prefix: <DocCode>/demo/*</DocCode></DocLi>
      </DocUl>
      <DocH3>Session Management</DocH3>
      <DocUl>
        <DocLi>Sessions stored in PostgreSQL via connect-pg-simple</DocLi>
        <DocLi>Encrypted session cookies with configurable expiration</DocLi>
        <DocLi>Separate session namespaces for admin and team users</DocLi>
      </DocUl>
      <DocH3>Data Protection</DocH3>
      <DocUl>
        <DocLi>GDPR-compliant data processing and storage</DocLi>
        <DocLi>All passwords hashed with bcrypt (cost factor 10)</DocLi>
        <DocLi>CloudEvents audit trail for all data operations</DocLi>
        <DocLi>No sensitive data exposed in API responses</DocLi>
      </DocUl>
    </div>
  );
}

function APISection() {
  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-doc-api">API Reference</h2>
        <p className="text-muted-foreground text-sm">RESTful JSON APIs under the <DocCode>/api/*</DocCode> prefix.</p>
      </div>
      <DocH3>Products API</DocH3>
      <DocTable
        headers={["Method", "Endpoint", "Description"]}
        rows={[
          ["GET", "/api/products", "List all products"],
          ["GET", "/api/products/:id", "Get product by ID"],
          ["POST", "/api/products", "Create new product"],
          ["PATCH", "/api/products/:id", "Update product"],
          ["DELETE", "/api/products/:id", "Delete product"],
        ]}
      />
      <DocH3>IoT Devices API</DocH3>
      <DocTable
        headers={["Method", "Endpoint", "Description"]}
        rows={[
          ["GET", "/api/iot/devices", "List all IoT devices"],
          ["POST", "/api/iot/devices", "Register new device"],
          ["PATCH", "/api/iot/devices/:id", "Update device"],
          ["DELETE", "/api/iot/devices/:id", "Remove device"],
          ["POST", "/api/iot/devices/:id/readings", "Submit sensor reading"],
          ["GET", "/api/iot/devices/:id/readings", "Get device readings"],
        ]}
      />
      <DocH3>AI Insights API</DocH3>
      <DocTable
        headers={["Method", "Endpoint", "Description"]}
        rows={[
          ["GET", "/api/ai/summary/:productId", "Get/generate AI summary"],
          ["GET", "/api/ai/sustainability/:productId", "Get/generate sustainability analysis"],
          ["GET", "/api/ai/repair-guide/:productId", "Get/generate repair guide"],
          ["GET", "/api/ai/circularity/:productId", "Get/generate circularity score"],
          ["GET", "/api/ai/risk-assessment/:productId", "Get/generate risk assessment"],
        ]}
      />
      <DocH3>SAP Integration API</DocH3>
      <DocTable
        headers={["Method", "Endpoint", "Description"]}
        rows={[
          ["GET", "/api/integrations/connectors", "List connectors"],
          ["POST", "/api/integrations/connectors", "Create connector"],
          ["POST", "/api/integrations/connectors/:id/test", "Test connection"],
          ["POST", "/api/integrations/connectors/:id/sync", "Trigger sync"],
          ["GET", "/api/integrations/connectors/:id/logs", "Get sync logs"],
        ]}
      />
      <DocH3>Authentication</DocH3>
      <DocP>All write endpoints require authentication. Public read endpoints include <DocCode>/product/:id</DocCode> (public scan page) and <DocCode>/api/leads</DocCode> (POST only, for contact form submissions). Admin endpoints use OAuth session tokens; team endpoints use email/password session authentication.</DocP>
    </div>
  );
}

const sectionComponents: Record<DocSection, () => JSX.Element> = {
  overview: OverviewSection,
  dpp: DPPSection,
  modules: ModulesSection,
  sap: SAPSection,
  ai: AISection,
  iot: IoTSection,
  security: SecuritySection,
  api: APISection,
};

export default function Docs() {
  const [activeSection, setActiveSection] = useState<DocSection>("overview");
  const ActiveComponent = sectionComponents[activeSection];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Product Documentation - PhotonicTag | EU Digital Product Passport Platform</title>
        <meta name="description" content="Comprehensive product documentation for PhotonicTag. DPP schema, SAP integration, AI intelligence, IoT tagging, API reference, and administration guides." />
        <meta property="og:title" content="PhotonicTag - Product Documentation" />
        <meta property="og:description" content="Complete technical and product documentation for the PhotonicTag EU Digital Product Passport platform." />
      </Helmet>
      <PublicNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3">Documentation</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3" data-testid="text-docs-title">
            Product Documentation
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive technical and product documentation for the PhotonicTag platform.
          </p>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-1">
              {sideNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left ${
                    activeSection === item.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  data-testid={`button-doc-nav-${item.id}`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </aside>

          <div className="lg:hidden mb-6 w-full">
            <div className="flex flex-wrap gap-2">
              {sideNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`button-doc-nav-mobile-${item.id}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <main className="flex-1 min-w-0">
            <Card className="border">
              <CardContent className="p-6 sm:p-8">
                <ActiveComponent />
              </CardContent>
            </Card>
          </main>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Need Help?</h3>
                <p className="text-sm text-muted-foreground">Our team is ready to assist with integration or compliance questions.</p>
              </div>
              <Button variant="outline" asChild className="shrink-0" data-testid="button-docs-contact">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">See It in Action</h3>
                <p className="text-sm text-muted-foreground">Schedule a personalized demo to see PhotonicTag with your products.</p>
              </div>
              <Button asChild className="shrink-0" data-testid="button-docs-demo">
                <a href="https://calendar.app.google/Aa9nfUnJiZvcjXi28" target="_blank" rel="noopener noreferrer">Book Demo</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
