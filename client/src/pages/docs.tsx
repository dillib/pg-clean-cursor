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

type DocSection = "overview" | "dpp" | "modules" | "sap" | "ai" | "iot" | "security" | "api" | "admin";

const sideNavItems: { id: DocSection; label: string; icon: typeof Book }[] = [
  { id: "overview", label: "Platform Overview", icon: Globe },
  { id: "dpp", label: "Digital Product Passports", icon: QrCode },
  { id: "modules", label: "Core Modules", icon: Layers },
  { id: "sap", label: "SAP Integration", icon: Database },
  { id: "ai", label: "AI Intelligence", icon: Zap },
  { id: "iot", label: "IoT & Smart Tagging", icon: Cpu },
  { id: "security", label: "Security & Access Control", icon: Shield },
  { id: "api", label: "API Reference", icon: Code },
  { id: "admin", label: "Administration", icon: Settings },
];

function OverviewSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" data-testid="text-doc-overview">Platform Overview</h2>
        <p className="text-muted-foreground">PhotonicTag is an AI-powered Digital Product Passport platform designed for EU ESPR Regulation (EU) 2024/1781 compliance.</p>
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <h3>What is PhotonicTag?</h3>
        <p>PhotonicTag transforms product identity into a physics-rooted, tamper-proof signature, bridging the physical and digital worlds. The platform enables brands, regulators, and consumers to verify product authenticity, trace origins, and understand the full lifecycle of any product.</p>
        <h3>Key Value Propositions</h3>
        <ul>
          <li><strong>EU DPP Compliance:</strong> Full compliance with ESPR Regulation (EU) 2024/1781, covering product identification, material composition, environmental impact, durability, and end-of-life documentation.</li>
          <li><strong>SAP Integration:</strong> Bidirectional synchronization with SAP S/4HANA, ECC, and Business One — connecting existing ERP data directly to Digital Product Passports.</li>
          <li><strong>AI Automation:</strong> Automated sustainability scoring, circularity assessment, repair guides, and risk analysis powered by GPT-4o.</li>
          <li><strong>Consumer Transparency:</strong> Every product receives a unique QR code linking to a public-facing Digital Product Passport page accessible on any device.</li>
          <li><strong>Rapid Deployment:</strong> Go live in weeks with pre-built industry templates, automated field mapping, and guided onboarding.</li>
        </ul>
        <h3>Architecture Overview</h3>
        <p>PhotonicTag is built on a modern cloud-native stack:</p>
        <table>
          <thead><tr><th>Layer</th><th>Technology</th></tr></thead>
          <tbody>
            <tr><td>Frontend</td><td>React + TypeScript, Vite, Tailwind CSS, Shadcn/ui</td></tr>
            <tr><td>Backend</td><td>Node.js + Express, TypeScript, RESTful APIs</td></tr>
            <tr><td>Database</td><td>PostgreSQL with Drizzle ORM</td></tr>
            <tr><td>AI Engine</td><td>OpenAI GPT-4o via API</td></tr>
            <tr><td>Authentication</td><td>OAuth 2.0 / OpenID Connect with role-based access</td></tr>
            <tr><td>Events</td><td>CloudEvents-based audit logging</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DPPSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" data-testid="text-doc-dpp">Digital Product Passports</h2>
        <p className="text-muted-foreground">Comprehensive EU ESPR-compliant product documentation covering the full product lifecycle.</p>
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <h3>DPP Data Schema</h3>
        <p>Each Digital Product Passport contains structured data across seven mandatory categories defined by ESPR:</p>
        <h4>1. Product Identification</h4>
        <ul>
          <li>Product name, category, model number, SKU</li>
          <li>Manufacturer name and address</li>
          <li>Country of origin, batch and lot numbers</li>
          <li>Unique product identifier (UUID)</li>
        </ul>
        <h4>2. Materials & Composition</h4>
        <ul>
          <li>Materials list and detailed material breakdown (JSONB)</li>
          <li>Recycled content percentage</li>
          <li>Recyclability percentage</li>
          <li>Hazardous materials declaration</li>
        </ul>
        <h4>3. Environmental Impact</h4>
        <ul>
          <li>Carbon footprint (kg CO2e)</li>
          <li>Water usage (liters)</li>
          <li>Energy consumption (kWh)</li>
          <li>Environmental certifications</li>
        </ul>
        <h4>4. Durability & Repairability</h4>
        <ul>
          <li>Repairability score (0-10)</li>
          <li>Expected lifespan (years)</li>
          <li>Spare parts availability status</li>
          <li>Repair instructions and service center locations</li>
        </ul>
        <h4>5. Ownership & Lifecycle</h4>
        <ul>
          <li>Date of manufacture</li>
          <li>Date of first sale</li>
          <li>Ownership history tracking</li>
        </ul>
        <h4>6. Compliance & Certifications</h4>
        <ul>
          <li>CE marking status</li>
          <li>Safety certifications list</li>
        </ul>
        <h4>7. End-of-Life & Recycling</h4>
        <ul>
          <li>Recycling instructions</li>
          <li>Disassembly instructions</li>
          <li>Hazard warnings</li>
          <li>Take-back program information</li>
        </ul>
        <h3>QR Code System</h3>
        <p>Every product automatically receives a unique QR code generated server-side. Scanning the QR code redirects to the product's public Digital Product Passport page at <code>/product/:id</code>, displaying all DPP data in a consumer-friendly format accessible on any smartphone.</p>
      </div>
    </div>
  );
}

function ModulesSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" data-testid="text-doc-modules">Core Modules</h2>
        <p className="text-muted-foreground">Six integrated modules covering the complete Digital Product Passport lifecycle.</p>
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <h3>Module 1: DPP Management</h3>
        <p>Create, edit, and manage Digital Product Passports with a comprehensive admin interface. Supports single product creation, bulk import via Excel, and AI-assisted data population. Full CRUD operations with validation against ESPR schema requirements.</p>
        <h3>Module 2: QR Identity</h3>
        <p>Tamper-proof QR code generation linking physical products to their digital passports. Server-side generation with data URL storage. Public scan pages optimized for mobile access with structured DPP data display.</p>
        <h3>Module 3: Supply Chain Traceability</h3>
        <p>End-to-end event tracking using CloudEvents specification. Records product creation, updates, QR generation, identity assignment, trace events, and AI insight generation. Complete audit trail for regulatory compliance.</p>
        <h3>Module 4: Authentication & Anti-Counterfeiting</h3>
        <p>Physics-rooted identity signatures ensuring product authenticity. Verifiable proof-of-origin accessible via any smartphone. Integration with IoT sensors for real-time tamper detection.</p>
        <h3>Module 5: IoT Smart Tagging</h3>
        <p>NFC, RFID, and BLE device management for real-time product monitoring. Device registration, sensor readings capture, scan tracking, and environmental condition monitoring throughout the supply chain.</p>
        <h3>Module 6: AI Intelligence</h3>
        <p>Five AI-powered insight types generated from product data: Summary, Sustainability Analysis, Repair Guide, Circularity Score (A+ to F), and Risk Assessment. Automated compliance checking and recommendation generation.</p>
      </div>
    </div>
  );
}

function SAPSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" data-testid="text-doc-sap">SAP Integration</h2>
        <p className="text-muted-foreground">Enterprise-grade bidirectional synchronization with SAP ERP systems.</p>
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <h3>Supported SAP Systems</h3>
        <ul>
          <li><strong>SAP S/4HANA:</strong> Full OData API integration with real-time sync capability</li>
          <li><strong>SAP ECC:</strong> RFC and IDoc-based integration for legacy ERP environments</li>
          <li><strong>SAP Business One:</strong> API integration for small and mid-market deployments</li>
        </ul>
        <h3>Synchronization Modes</h3>
        <ul>
          <li><strong>Inbound Only:</strong> Import SAP material master data (MARA/MARC) into PhotonicTag DPPs</li>
          <li><strong>Outbound Only:</strong> Export DPP data updates back to SAP material records</li>
          <li><strong>Bidirectional:</strong> Full two-way sync with automatic conflict detection and resolution</li>
        </ul>
        <h3>Sync Frequency Options</h3>
        <ul>
          <li>Real-time (event-triggered)</li>
          <li>Hourly scheduled</li>
          <li>Daily scheduled</li>
          <li>Manual on-demand</li>
        </ul>
        <h3>Field Mapping</h3>
        <p>Configurable field mapping between SAP material master fields and DPP data fields. Pre-configured mappings include:</p>
        <table>
          <thead><tr><th>SAP Field</th><th>DPP Field</th></tr></thead>
          <tbody>
            <tr><td>MATNR (Material Number)</td><td>Product SKU</td></tr>
            <tr><td>MAKTX (Material Description)</td><td>Product Name</td></tr>
            <tr><td>MTART (Material Type)</td><td>Product Category</td></tr>
            <tr><td>MEINS (Base Unit of Measure)</td><td>Unit of Measure</td></tr>
            <tr><td>MATKL (Material Group)</td><td>Material Classification</td></tr>
            <tr><td>NORMT (Industry Standard)</td><td>Compliance Standard</td></tr>
          </tbody>
        </table>
        <h3>Conflict Resolution</h3>
        <p>When data differs between SAP and PhotonicTag, the system provides a side-by-side comparison interface with three resolution strategies:</p>
        <ul>
          <li><strong>Keep SAP:</strong> Accept SAP value as authoritative</li>
          <li><strong>Keep PhotonicTag:</strong> Retain PhotonicTag value</li>
          <li><strong>Manual Merge:</strong> Choose field-by-field which value to keep</li>
        </ul>
        <h3>Sync Audit Trail</h3>
        <p>Every sync operation is logged with records processed, created, updated, failed counts, and timestamps. Full audit trail accessible via the integration dashboard.</p>
      </div>
    </div>
  );
}

function AISection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" data-testid="text-doc-ai">AI Intelligence</h2>
        <p className="text-muted-foreground">Five AI-powered insight types providing automated product analysis and compliance assessment.</p>
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <h3>AI Insight Types</h3>
        <h4>1. AI Summary</h4>
        <p>Generates a concise product overview highlighting key features, materials, and compliance status. Useful for quick product evaluation and consumer-facing descriptions.</p>
        <h4>2. Sustainability Analysis</h4>
        <p>Evaluates environmental impact across carbon footprint, water usage, and energy consumption. Provides a sustainability score and actionable recommendations for improvement, including circularity optimization suggestions.</p>
        <h4>3. Repair Guide</h4>
        <p>Assesses product repairability on a 0-10 scale. Generates step-by-step repair instructions, spare parts availability information, and service center recommendations. Contributes to ESPR durability documentation requirements.</p>
        <h4>4. Circularity Score</h4>
        <p>Grades products from A+ to F based on recyclability, material efficiency, and end-of-life options. Evaluates:</p>
        <ul>
          <li>Recyclability percentage and material recovery potential</li>
          <li>Use of recycled content in manufacturing</li>
          <li>Disassembly complexity and design for recycling</li>
          <li>Take-back program availability</li>
        </ul>
        <h4>5. Risk Assessment</h4>
        <p>Comprehensive risk evaluation including:</p>
        <ul>
          <li>Overall risk level (Low / Medium / High / Critical)</li>
          <li>Data completeness percentage for DPP compliance</li>
          <li>Counterfeit risk based on product category and distribution</li>
          <li>Compliance gap analysis against ESPR requirements</li>
        </ul>
        <h3>Fetch-or-Generate Pattern</h3>
        <p>AI insights use a caching pattern: if insights have been previously generated for a product, the cached version is returned. New insights are generated on-demand and stored for subsequent requests, minimizing API costs while ensuring data freshness.</p>
      </div>
    </div>
  );
}

function IoTSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" data-testid="text-doc-iot">IoT & Smart Tagging</h2>
        <p className="text-muted-foreground">NFC, RFID, and BLE device management for real-time product tracking and monitoring.</p>
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <h3>Supported Device Types</h3>
        <ul>
          <li><strong>NFC Tags:</strong> Near-field communication tags for tap-to-read product identification. Ideal for consumer-facing authentication.</li>
          <li><strong>RFID Tags:</strong> Radio-frequency identification for warehouse and supply chain scanning. Supports bulk reading at distance.</li>
          <li><strong>BLE Beacons:</strong> Bluetooth Low Energy devices for continuous environmental monitoring. Track temperature, humidity, and location.</li>
        </ul>
        <h3>Device Lifecycle</h3>
        <ol>
          <li><strong>Registration:</strong> Register device with manufacturer, model, firmware version, and unique device ID</li>
          <li><strong>Linking:</strong> Associate device with a specific product via product ID</li>
          <li><strong>Monitoring:</strong> Capture sensor readings and track scan events</li>
          <li><strong>Maintenance:</strong> Update firmware versions, monitor battery status, track last-seen timestamps</li>
        </ol>
        <h3>Sensor Data</h3>
        <p>IoT devices can report sensor readings including temperature, humidity, vibration, light exposure, and GPS coordinates. This data feeds into the supply chain traceability module for condition monitoring during transport and storage.</p>
      </div>
    </div>
  );
}

function SecuritySection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" data-testid="text-doc-security">Security & Access Control</h2>
        <p className="text-muted-foreground">Enterprise-grade security with role-based access control across three user tiers.</p>
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <h3>Three-Tier Access Control</h3>
        <h4>Tier 1: Super Admin</h4>
        <ul>
          <li>Authentication: OAuth 2.0 via OpenID Connect (Replit Auth)</li>
          <li>Access: Full platform access including all admin features, CRM, Demo Factory, User Management, Support Triage, Platform Ops</li>
          <li>Route prefix: <code>/admin/*</code></li>
        </ul>
        <h4>Tier 2: Internal Team</h4>
        <ul>
          <li>Authentication: Email/password with bcrypt hashing</li>
          <li>Roles: Sales Partner, Reseller, Consultant</li>
          <li>Access: CRM and Demo Factory only</li>
          <li>Route prefix: <code>/internal/*</code></li>
        </ul>
        <h4>Tier 3: Demo Viewers</h4>
        <ul>
          <li>Authentication: Email/password with bcrypt hashing</li>
          <li>Access: Product dashboard, product details, IoT devices, SAP integration (read-only demo)</li>
          <li>Route prefix: <code>/demo/*</code></li>
        </ul>
        <h3>Session Management</h3>
        <ul>
          <li>Sessions stored in PostgreSQL via connect-pg-simple</li>
          <li>Encrypted session cookies with configurable expiration</li>
          <li>Separate session namespaces for admin and team users</li>
        </ul>
        <h3>Data Protection</h3>
        <ul>
          <li>GDPR-compliant data processing and storage</li>
          <li>All passwords hashed with bcrypt (cost factor 10)</li>
          <li>CloudEvents audit trail for all data operations</li>
          <li>No sensitive data exposed in API responses</li>
        </ul>
      </div>
    </div>
  );
}

function APISection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" data-testid="text-doc-api">API Reference</h2>
        <p className="text-muted-foreground">RESTful JSON APIs under the <code>/api/*</code> prefix.</p>
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <h3>Products API</h3>
        <table>
          <thead><tr><th>Method</th><th>Endpoint</th><th>Description</th></tr></thead>
          <tbody>
            <tr><td>GET</td><td><code>/api/products</code></td><td>List all products</td></tr>
            <tr><td>GET</td><td><code>/api/products/:id</code></td><td>Get product by ID</td></tr>
            <tr><td>POST</td><td><code>/api/products</code></td><td>Create new product</td></tr>
            <tr><td>PATCH</td><td><code>/api/products/:id</code></td><td>Update product</td></tr>
            <tr><td>DELETE</td><td><code>/api/products/:id</code></td><td>Delete product</td></tr>
          </tbody>
        </table>
        <h3>IoT Devices API</h3>
        <table>
          <thead><tr><th>Method</th><th>Endpoint</th><th>Description</th></tr></thead>
          <tbody>
            <tr><td>GET</td><td><code>/api/iot/devices</code></td><td>List all IoT devices</td></tr>
            <tr><td>POST</td><td><code>/api/iot/devices</code></td><td>Register new device</td></tr>
            <tr><td>PATCH</td><td><code>/api/iot/devices/:id</code></td><td>Update device</td></tr>
            <tr><td>DELETE</td><td><code>/api/iot/devices/:id</code></td><td>Remove device</td></tr>
            <tr><td>POST</td><td><code>/api/iot/devices/:id/readings</code></td><td>Submit sensor reading</td></tr>
            <tr><td>GET</td><td><code>/api/iot/devices/:id/readings</code></td><td>Get device readings</td></tr>
          </tbody>
        </table>
        <h3>AI Insights API</h3>
        <table>
          <thead><tr><th>Method</th><th>Endpoint</th><th>Description</th></tr></thead>
          <tbody>
            <tr><td>GET</td><td><code>/api/ai/summary/:productId</code></td><td>Get/generate AI summary</td></tr>
            <tr><td>GET</td><td><code>/api/ai/sustainability/:productId</code></td><td>Get/generate sustainability analysis</td></tr>
            <tr><td>GET</td><td><code>/api/ai/repair-guide/:productId</code></td><td>Get/generate repair guide</td></tr>
            <tr><td>GET</td><td><code>/api/ai/circularity/:productId</code></td><td>Get/generate circularity score</td></tr>
            <tr><td>GET</td><td><code>/api/ai/risk-assessment/:productId</code></td><td>Get/generate risk assessment</td></tr>
          </tbody>
        </table>
        <h3>SAP Integration API</h3>
        <table>
          <thead><tr><th>Method</th><th>Endpoint</th><th>Description</th></tr></thead>
          <tbody>
            <tr><td>GET</td><td><code>/api/integrations/connectors</code></td><td>List connectors</td></tr>
            <tr><td>POST</td><td><code>/api/integrations/connectors</code></td><td>Create connector</td></tr>
            <tr><td>POST</td><td><code>/api/integrations/connectors/:id/test</code></td><td>Test connection</td></tr>
            <tr><td>POST</td><td><code>/api/integrations/connectors/:id/sync</code></td><td>Trigger sync</td></tr>
            <tr><td>GET</td><td><code>/api/integrations/connectors/:id/logs</code></td><td>Get sync logs</td></tr>
          </tbody>
        </table>
        <h3>Demo Configs API</h3>
        <table>
          <thead><tr><th>Method</th><th>Endpoint</th><th>Description</th></tr></thead>
          <tbody>
            <tr><td>GET</td><td><code>/api/demo-configs</code></td><td>List all demos</td></tr>
            <tr><td>POST</td><td><code>/api/demo-configs</code></td><td>Create demo with AI products</td></tr>
            <tr><td>PATCH</td><td><code>/api/demo-configs/:id</code></td><td>Update demo credentials</td></tr>
            <tr><td>DELETE</td><td><code>/api/demo-configs/:id</code></td><td>Delete demo</td></tr>
          </tbody>
        </table>
        <h3>Authentication</h3>
        <p>All write endpoints require authentication. Public read endpoints include <code>/product/:id</code> (public scan page) and <code>/api/leads</code> (POST only, for contact form submissions). Admin endpoints use OAuth session tokens; team endpoints use email/password session authentication.</p>
      </div>
    </div>
  );
}

function AdminSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" data-testid="text-doc-admin">Administration</h2>
        <p className="text-muted-foreground">Internal operations platform for managing customers, demos, support, and system health.</p>
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <h3>AI-Driven CRM</h3>
        <p>Customer account management with intelligent automation:</p>
        <ul>
          <li><strong>AI Health Scoring:</strong> Automated 0-100 health score per account based on engagement, revenue, and activity patterns</li>
          <li><strong>Next-Best-Action:</strong> AI-generated recommendations for each customer (upsell, check-in, risk mitigation)</li>
          <li><strong>MRR Tracking:</strong> Monthly recurring revenue monitoring per account and aggregate</li>
          <li><strong>At-Risk Detection:</strong> Automated flagging of accounts showing churn signals</li>
          <li><strong>Excel Import:</strong> Bulk import leads or accounts from .xlsx/.xls/.csv files with auto-column mapping (supports English and German headers)</li>
          <li><strong>Activity Tracking:</strong> Log calls, emails, meetings, and notes per account with timestamps</li>
        </ul>
        <h3>Demo Factory</h3>
        <p>Generate client-ready product demos instantly:</p>
        <ul>
          <li><strong>Industry Templates:</strong> 6 pre-configured templates (Battery, Fashion, Electronics, EV, Packaging, Furniture)</li>
          <li><strong>Custom Prompts:</strong> Write your own AI prompt to generate products tailored to a specific prospect</li>
          <li><strong>Per-Demo Credentials:</strong> Set unique email/password for each demo for client-specific access</li>
          <li><strong>Shareable URLs:</strong> Copy the demo login URL to share with prospects directly</li>
        </ul>
        <h3>User Management</h3>
        <ul>
          <li>Create, activate, deactivate, and delete internal team members</li>
          <li>Assign roles: Sales Partner, Reseller, Consultant, Demo Viewer</li>
          <li>Password management via admin interface</li>
        </ul>
        <h3>Support Triage</h3>
        <ul>
          <li>AI-powered ticket categorization and priority suggestion</li>
          <li>Automatic tag generation and summary analysis</li>
          <li>Status workflow: Open → In Progress → Resolved → Closed</li>
        </ul>
        <h3>Platform Ops</h3>
        <ul>
          <li>Real-time system health monitoring</li>
          <li>Uptime tracking and memory usage</li>
          <li>Entity counts across all tables</li>
          <li>Auto-refresh every 30 seconds</li>
        </ul>
      </div>
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
  admin: AdminSection,
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
