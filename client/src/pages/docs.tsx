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

const sideNavItems = [
  { id: "overview" as DocSection, label: "Platform Overview", icon: Globe },
  { id: "dpp" as DocSection, label: "Digital Product Passports", icon: QrCode },
  { id: "modules" as DocSection, label: "Core Modules", icon: Layers },
  { id: "sap" as DocSection, label: "SAP Integration", icon: Database },
  { id: "ai" as DocSection, label: "AI Intelligence", icon: Zap },
  { id: "iot" as DocSection, label: "IoT & Smart Tagging", icon: Cpu },
  { id: "security" as DocSection, label: "Security & Access Control", icon: Shield },
  { id: "api" as DocSection, label: "API Reference", icon: Code },
];

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-bold text-foreground mb-2">{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-foreground mt-6 mb-2">{children}</h3>;
}
function H4({ children }: { children: React.ReactNode }) {
  return <h4 className="text-sm font-semibold text-foreground mt-4 mb-1.5">{children}</h4>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground leading-relaxed mb-3">{children}</p>;
}
function UL({ children }: { children: React.ReactNode }) {
  return <ul className="text-sm text-muted-foreground space-y-1 mb-3 ml-4 list-disc">{children}</ul>;
}
function OL({ children }: { children: React.ReactNode }) {
  return <ol className="text-sm text-muted-foreground space-y-1 mb-3 ml-4 list-decimal">{children}</ol>;
}
function LI({ children }: { children: React.ReactNode }) {
  return <li className="leading-relaxed">{children}</li>;
}
function IC({ children }: { children: React.ReactNode }) {
  return <code className="text-xs font-mono bg-muted text-foreground px-1.5 py-0.5 rounded">{children}</code>;
}
function Bold({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-foreground">{children}</strong>;
}
function DTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mb-4 rounded-md border border-border">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-muted/50">
            {headers.map((h, i) => (
              <th key={i} className="text-left py-2 px-3 text-foreground font-semibold text-xs uppercase tracking-wide border-b border-border">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border/50 last:border-0">
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

function DocContent({ section }: { section: DocSection }) {
  if (section === "overview") {
    return (
      <div>
        <H2>Platform Overview</H2>
        <P>PhotonicTag is an AI-powered Digital Product Passport platform designed for EU ESPR Regulation (EU) 2024/1781 compliance. It transforms product identity into a physics-rooted, tamper-proof signature, bridging physical and digital worlds for enhanced trust, traceability, and transparency.</P>
        <H3>Key Value Propositions</H3>
        <UL>
          <LI><Bold>EU DPP Compliance:</Bold> Full coverage of ESPR Regulation (EU) 2024/1781 — product identification, material composition, environmental impact, durability, and end-of-life documentation.</LI>
          <LI><Bold>SAP Integration:</Bold> Bidirectional synchronization with SAP S/4HANA, ECC, and Business One, connecting existing ERP data directly to Digital Product Passports.</LI>
          <LI><Bold>AI Automation:</Bold> Sustainability scoring, circularity assessment, repair guides, and risk analysis powered by GPT-4o.</LI>
          <LI><Bold>Consumer Transparency:</Bold> Every product gets a unique QR code linking to a public-facing Digital Product Passport accessible on any device.</LI>
          <LI><Bold>Rapid Deployment:</Bold> Go live in weeks with pre-built industry templates, automated field mapping, and guided onboarding.</LI>
        </UL>
        <H3>Architecture Overview</H3>
        <DTable
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

  if (section === "dpp") {
    return (
      <div>
        <H2>Digital Product Passports</H2>
        <P>Comprehensive EU ESPR-compliant product documentation covering the full product lifecycle. Each DPP contains structured data across seven mandatory categories.</P>
        <H3>DPP Data Schema</H3>
        <H4>1. Product Identification</H4>
        <UL>
          <LI>Product name, category, model number, SKU</LI>
          <LI>Manufacturer name and address</LI>
          <LI>Country of origin, batch and lot numbers</LI>
          <LI>Unique product identifier (UUID)</LI>
        </UL>
        <H4>2. Materials & Composition</H4>
        <UL>
          <LI>Materials list and detailed material breakdown</LI>
          <LI>Recycled content percentage</LI>
          <LI>Recyclability percentage</LI>
          <LI>Hazardous materials declaration</LI>
        </UL>
        <H4>3. Environmental Impact</H4>
        <UL>
          <LI>Carbon footprint (kg CO2e)</LI>
          <LI>Water usage (liters)</LI>
          <LI>Energy consumption (kWh)</LI>
          <LI>Environmental certifications</LI>
        </UL>
        <H4>4. Durability & Repairability</H4>
        <UL>
          <LI>Repairability score (0–10)</LI>
          <LI>Expected lifespan (years)</LI>
          <LI>Spare parts availability status</LI>
          <LI>Repair instructions and service center locations</LI>
        </UL>
        <H4>5. Ownership & Lifecycle</H4>
        <UL>
          <LI>Date of manufacture and first sale</LI>
          <LI>Ownership history tracking</LI>
        </UL>
        <H4>6. Compliance & Certifications</H4>
        <UL>
          <LI>CE marking status</LI>
          <LI>Safety certifications list</LI>
          <LI>EU ESPR / Battery Regulation / REACH compliance fields</LI>
        </UL>
        <H4>7. End-of-Life & Recycling</H4>
        <UL>
          <LI>Recycling instructions</LI>
          <LI>Disassembly instructions</LI>
          <LI>Hazard warnings</LI>
          <LI>Take-back program information</LI>
        </UL>
        <H3>QR Code System</H3>
        <P>Every product automatically receives a unique QR code generated server-side. Scanning redirects to the public DPP at <IC>/product/:id</IC>, displaying all data in a consumer-friendly mobile format.</P>
      </div>
    );
  }

  if (section === "modules") {
    return (
      <div>
        <H2>Core Modules</H2>
        <P>Six integrated modules covering the complete Digital Product Passport lifecycle.</P>
        <H3>Module 1 — DPP Management</H3>
        <P>Create, edit, and manage Digital Product Passports with a comprehensive interface. Supports single product creation, bulk import via Excel, and AI-assisted data population. Full CRUD operations with validation against ESPR schema requirements.</P>
        <H3>Module 2 — QR Identity</H3>
        <P>Tamper-proof QR code generation linking physical products to their digital passports. Server-side generation with data URL storage. Public scan pages optimized for mobile access with structured DPP data display.</P>
        <H3>Module 3 — Supply Chain Traceability</H3>
        <P>End-to-end event tracking using CloudEvents specification. Records product creation, updates, QR generation, identity assignment, trace events, and AI insight generation. Complete audit trail for regulatory compliance.</P>
        <H3>Module 4 — Authentication & Anti-Counterfeiting</H3>
        <P>Physics-rooted identity signatures ensuring product authenticity. Verifiable proof-of-origin accessible via any smartphone. Integration with IoT sensors for real-time tamper detection.</P>
        <H3>Module 5 — IoT Smart Tagging</H3>
        <P>NFC, RFID, and BLE device management for real-time product monitoring. Device registration, sensor readings capture, scan tracking, and environmental condition monitoring throughout the supply chain.</P>
        <H3>Module 6 — AI Intelligence</H3>
        <P>Five AI-powered insight types generated from product data: Summary, Sustainability Analysis, Repair Guide, Circularity Score (A+ to F), and Risk Assessment. Automated compliance checking and recommendation generation.</P>
      </div>
    );
  }

  if (section === "sap") {
    return (
      <div>
        <H2>SAP Integration</H2>
        <P>Enterprise-grade bidirectional synchronization with SAP ERP systems.</P>
        <H3>Supported SAP Systems</H3>
        <UL>
          <LI><Bold>SAP S/4HANA:</Bold> Full OData API integration with real-time sync capability</LI>
          <LI><Bold>SAP ECC:</Bold> RFC and IDoc-based integration for legacy ERP environments</LI>
          <LI><Bold>SAP Business One:</Bold> API integration for small and mid-market deployments</LI>
        </UL>
        <H3>Synchronization Modes</H3>
        <UL>
          <LI><Bold>Inbound Only:</Bold> Import SAP material master data (MARA/MARC) into PhotonicTag DPPs</LI>
          <LI><Bold>Outbound Only:</Bold> Export DPP data updates back to SAP material records</LI>
          <LI><Bold>Bidirectional:</Bold> Full two-way sync with automatic conflict detection and resolution</LI>
        </UL>
        <H3>Sync Frequency Options</H3>
        <UL>
          <LI>Real-time (event-triggered)</LI>
          <LI>Hourly scheduled</LI>
          <LI>Daily scheduled</LI>
          <LI>Manual on-demand</LI>
        </UL>
        <H3>Field Mapping</H3>
        <P>Configurable field mapping between SAP material master fields and DPP data fields:</P>
        <DTable
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
        <H3>Conflict Resolution</H3>
        <P>When data differs between SAP and PhotonicTag, three resolution strategies are available:</P>
        <UL>
          <LI><Bold>Keep SAP:</Bold> Accept SAP value as authoritative</LI>
          <LI><Bold>Keep PhotonicTag:</Bold> Retain PhotonicTag value</LI>
          <LI><Bold>Manual Merge:</Bold> Choose field-by-field which value to keep</LI>
        </UL>
      </div>
    );
  }

  if (section === "ai") {
    return (
      <div>
        <H2>AI Intelligence</H2>
        <P>Five AI-powered insight types providing automated product analysis and compliance assessment, powered by OpenAI GPT-4o.</P>
        <H3>Insight Types</H3>
        <H4>1. AI Summary</H4>
        <P>Generates a concise product overview highlighting key features, materials, and compliance status. Useful for quick product evaluation and consumer-facing descriptions.</P>
        <H4>2. Sustainability Analysis</H4>
        <P>Evaluates environmental impact across carbon footprint, water usage, and energy consumption. Provides a sustainability score and actionable recommendations for improvement.</P>
        <H4>3. Repair Guide</H4>
        <P>Assesses product repairability on a 0–10 scale. Generates step-by-step repair instructions, spare parts availability information, and service center recommendations for ESPR durability documentation.</P>
        <H4>4. Circularity Score</H4>
        <P>Grades products from A+ to F based on recyclability, material efficiency, and end-of-life options. Evaluates recyclability percentage, use of recycled content, disassembly complexity, and take-back programme availability.</P>
        <H4>5. Risk Assessment</H4>
        <P>Produces an overall risk level (Low / Medium / High / Critical), data completeness percentage, counterfeit risk evaluation, and compliance gap analysis against ESPR requirements.</P>
        <H3>Caching Behaviour</H3>
        <P>AI insights use a fetch-or-generate pattern: previously generated insights are returned from cache. New insights are generated on demand and stored, minimising API costs while keeping data fresh.</P>
      </div>
    );
  }

  if (section === "iot") {
    return (
      <div>
        <H2>IoT & Smart Tagging</H2>
        <P>NFC, RFID, and BLE device management for real-time product tracking and environmental monitoring.</P>
        <H3>Supported Device Types</H3>
        <UL>
          <LI><Bold>NFC Tags:</Bold> Near-field communication tags for tap-to-read product identification. Ideal for consumer-facing authentication.</LI>
          <LI><Bold>RFID Tags:</Bold> Radio-frequency identification for warehouse and supply chain scanning. Supports bulk reading at distance.</LI>
          <LI><Bold>BLE Beacons:</Bold> Bluetooth Low Energy devices for continuous environmental monitoring. Track temperature, humidity, and location.</LI>
        </UL>
        <H3>Device Lifecycle</H3>
        <OL>
          <LI><Bold>Registration:</Bold> Register device with manufacturer, model, firmware version, and unique device ID</LI>
          <LI><Bold>Linking:</Bold> Associate device with a specific product via product ID</LI>
          <LI><Bold>Monitoring:</Bold> Capture sensor readings and track scan events</LI>
          <LI><Bold>Maintenance:</Bold> Update firmware, monitor battery status, track last-seen timestamps</LI>
        </OL>
        <H3>Sensor Data</H3>
        <P>IoT devices can report temperature, humidity, vibration, light exposure, and GPS coordinates. This data feeds into the supply chain traceability module for condition monitoring during transport and storage.</P>
      </div>
    );
  }

  if (section === "security") {
    return (
      <div>
        <H2>Security & Access Control</H2>
        <P>Enterprise-grade security with role-based access control across three user tiers.</P>
        <H3>Access Control Tiers</H3>
        <H4>Super Admin</H4>
        <UL>
          <LI>Authentication: OAuth 2.0 via OpenID Connect</LI>
          <LI>Full platform access including all admin features</LI>
          <LI>Route prefix: <IC>/admin/*</IC></LI>
        </UL>
        <H4>Internal Team</H4>
        <UL>
          <LI>Authentication: Email/password with bcrypt hashing</LI>
          <LI>Roles: Sales Partner, Reseller, Consultant</LI>
          <LI>Route prefix: <IC>/internal/*</IC></LI>
        </UL>
        <H4>Demo Viewers</H4>
        <UL>
          <LI>Authentication: Email/password with bcrypt hashing</LI>
          <LI>Access: Product dashboard, product details, IoT devices, SAP read-only demo</LI>
          <LI>Route prefix: <IC>/demo/*</IC></LI>
        </UL>
        <H3>Session Management</H3>
        <UL>
          <LI>Sessions stored in PostgreSQL via connect-pg-simple</LI>
          <LI>Encrypted session cookies with configurable expiration</LI>
          <LI>Separate session namespaces for admin and team users</LI>
        </UL>
        <H3>Data Protection</H3>
        <UL>
          <LI>GDPR-compliant data processing and storage</LI>
          <LI>All passwords hashed with bcrypt (cost factor 10)</LI>
          <LI>CloudEvents audit trail on all data operations</LI>
          <LI>No sensitive data exposed in API responses</LI>
        </UL>
      </div>
    );
  }

  if (section === "api") {
    return (
      <div>
        <H2>API Reference</H2>
        <P>RESTful JSON APIs under the <IC>/api/*</IC> prefix. All write endpoints require authentication.</P>
        <H3>Products</H3>
        <DTable
          headers={["Method", "Endpoint", "Description"]}
          rows={[
            ["GET", "/api/products", "List all products"],
            ["GET", "/api/products/:id", "Get product by ID"],
            ["POST", "/api/products", "Create new product"],
            ["PATCH", "/api/products/:id", "Update product"],
            ["DELETE", "/api/products/:id", "Delete product"],
          ]}
        />
        <H3>IoT Devices</H3>
        <DTable
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
        <H3>AI Insights</H3>
        <DTable
          headers={["Method", "Endpoint", "Description"]}
          rows={[
            ["GET", "/api/ai/summary/:productId", "Get / generate AI summary"],
            ["GET", "/api/ai/sustainability/:productId", "Get / generate sustainability analysis"],
            ["GET", "/api/ai/repair-guide/:productId", "Get / generate repair guide"],
            ["GET", "/api/ai/circularity/:productId", "Get / generate circularity score"],
            ["GET", "/api/ai/risk-assessment/:productId", "Get / generate risk assessment"],
          ]}
        />
        <H3>SAP Integration</H3>
        <DTable
          headers={["Method", "Endpoint", "Description"]}
          rows={[
            ["GET", "/api/integrations/connectors", "List connectors"],
            ["POST", "/api/integrations/connectors", "Create connector"],
            ["POST", "/api/integrations/connectors/:id/test", "Test connection"],
            ["POST", "/api/integrations/connectors/:id/sync", "Trigger sync"],
            ["GET", "/api/integrations/connectors/:id/logs", "Get sync logs"],
          ]}
        />
        <H3>Public Endpoints</H3>
        <P>The following endpoints are publicly accessible without authentication:</P>
        <UL>
          <LI><IC>GET /product/:id</IC> — Public DPP scan page</LI>
          <LI><IC>POST /api/leads</IC> — Contact form submission</LI>
        </UL>
      </div>
    );
  }

  return null;
}

export default function Docs() {
  const [activeSection, setActiveSection] = useState<DocSection>("overview");

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Product Documentation - PhotonicTag | EU Digital Product Passport Platform</title>
        <meta name="description" content="Comprehensive product documentation for PhotonicTag. DPP schema, SAP integration, AI intelligence, IoT tagging, API reference." />
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

        {/* Mobile tab pills */}
        <div className="lg:hidden mb-6">
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

        {/* Desktop layout: sidebar + content */}
        <div className="flex gap-8 items-start">
          <aside className="hidden lg:block w-56 shrink-0 sticky top-24">
            <nav className="space-y-0.5">
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
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex-1 min-w-0">
            <Card className="border">
              <CardContent className="p-6 sm:p-8">
                <DocContent section={activeSection} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA cards */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 text-foreground">Need Help?</h3>
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
                <h3 className="font-semibold mb-1 text-foreground">See It in Action</h3>
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
