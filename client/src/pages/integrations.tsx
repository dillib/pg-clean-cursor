import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRight, 
  RefreshCw, 
  Zap, 
  Shield, 
  Database,
  CheckCircle,
  Clock,
  Calendar,
  Code,
  Webhook,
  FileCode,
  Package
} from "lucide-react";
import { Link } from "wouter";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { SiSap } from "react-icons/si";

const sapFeatures = [
  "Real-time bidirectional sync with SAP S/4HANA",
  "Material Master (MARA/MARC/MAKT) integration",
  "Batch and serial number management",
  "Plant and storage location mapping",
  "OData v2/v4 and RFC support",
  "OAuth 2.0 authentication",
  "Configurable field mapping",
  "Conflict resolution with audit trail",
  "Scheduled and on-demand sync",
  "SAP Business One support"
];

const erpIntegrations = [
  {
    name: "SAP S/4HANA",
    status: "Live",
    description: "Full bidirectional sync with SAP's flagship ERP system",
    features: ["Material Master sync", "Batch management", "OData API"],
    setupTime: "2-4 hours",
    icon: SiSap
  },
  {
    name: "SAP Business One",
    status: "Live",
    description: "Connect small and medium business SAP environments",
    features: ["Item master sync", "Inventory tracking", "Service Layer API"],
    setupTime: "1-2 hours",
    icon: SiSap
  },
  {
    name: "SAP ECC",
    status: "Live",
    description: "Legacy SAP ECC system support via RFC and IDoc",
    features: ["RFC connectivity", "IDoc processing", "BAPI support"],
    setupTime: "4-8 hours",
    icon: SiSap
  },
  {
    name: "Oracle NetSuite",
    status: "Beta",
    description: "Cloud ERP integration for product and inventory data",
    features: ["Item records sync", "Inventory levels", "REST API"],
    setupTime: "2-3 hours",
    icon: Database
  },
  {
    name: "Microsoft Dynamics 365",
    status: "Coming Soon",
    description: "Integration with Microsoft's business applications",
    features: ["Product catalog", "Supply chain", "Dataverse API"],
    setupTime: "3-4 hours",
    icon: Database
  },
  {
    name: "Infor CloudSuite",
    status: "Coming Soon",
    description: "Industry-specific ERP for manufacturing",
    features: ["Item master", "Lot tracking", "ION API"],
    setupTime: "3-5 hours",
    icon: Database
  }
];

export default function Integrations() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="mt-16">
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">Connect Everything</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" data-testid="text-integrations-title">
              Connect Your Entire<br />Product Ecosystem
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              PhotonicTag integrates with your existing ERP, e-commerce, and supply chain systems. 
              No data silos. No manual exports. Just seamless, real-time product data flow.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild data-testid="button-explore-sap">
                <a href="#sap-integration" className="gap-2">
                  Explore SAP Integration
                </a>
              </Button>
              <Button variant="outline" asChild data-testid="button-api-docs">
                <a href="#developer-api" className="gap-2">
                  API Documentation
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section id="sap-integration" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline">Featured Integration</Badge>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                    <SiSap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">SAP S/4HANA Integration</h2>
                    <p className="text-muted-foreground">Enterprise-grade bidirectional sync</p>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6">
                  Our deep SAP integration is built for enterprises. Sync your Material Master data, 
                  batch numbers, and product attributes in real-time. No middleware required.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <RefreshCw className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Bidirectional Sync</h4>
                      <p className="text-sm text-muted-foreground">Changes in SAP automatically reflect in DPP, and vice versa</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Real-time Updates</h4>
                      <p className="text-sm text-muted-foreground">Sub-second sync latency for critical product data</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Enterprise Security</h4>
                      <p className="text-sm text-muted-foreground">OAuth 2.0, encrypted connections, audit logging</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Database className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">No Data Silos</h4>
                      <p className="text-sm text-muted-foreground">Single source of truth across all systems</p>
                    </div>
                  </div>
                </div>

                <Button asChild data-testid="button-configure-sap">
                  <Link href="/contact" className="gap-2">
                    Configure SAP Connection
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Full Feature List</CardTitle>
                    <p className="text-sm text-muted-foreground">Everything included in SAP integration</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {sapFeatures.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">All Integrations</h2>
              <p className="text-muted-foreground">
                Connect PhotonicTag with your existing tech stack. From ERP systems to e-commerce platforms.
              </p>
            </div>

            <Tabs defaultValue="erp" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
                <TabsTrigger value="erp">Enterprise ERP</TabsTrigger>
                <TabsTrigger value="identity">Identity Tech</TabsTrigger>
                <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
                <TabsTrigger value="supply">Supply Chain</TabsTrigger>
              </TabsList>

              <TabsContent value="erp">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {erpIntegrations.map((integration) => (
                    <Card key={integration.name} data-testid={`card-integration-${integration.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                            {integration.icon === SiSap ? (
                              <SiSap className="w-6 h-6 text-white" />
                            ) : (
                              <integration.icon className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <Badge 
                            variant={integration.status === "Live" ? "default" : integration.status === "Beta" ? "secondary" : "outline"}
                          >
                            {integration.status}
                          </Badge>
                        </div>
                        <h3 className="font-semibold mb-2">{integration.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
                        <div className="space-y-1 mb-4">
                          {integration.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle className="w-3 h-3" />
                              {feature}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            Setup: {integration.setupTime}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="identity">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">QR Codes</h3>
                      <p className="text-sm text-muted-foreground">Dynamic QR codes with built-in analytics and anti-counterfeiting</p>
                      <Badge className="mt-4">Live</Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">NFC/RFID Tags</h3>
                      <p className="text-sm text-muted-foreground">Connect physical NFC and RFID devices to digital passports</p>
                      <Badge className="mt-4">Live</Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">Digital Watermarks</h3>
                      <p className="text-sm text-muted-foreground">Invisible authentication for packaging and labels</p>
                      <Badge variant="secondary" className="mt-4">Coming Soon</Badge>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="ecommerce">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">Shopify</h3>
                      <p className="text-sm text-muted-foreground">Automatic passport creation for products</p>
                      <Badge variant="secondary" className="mt-4">Coming Soon</Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">WooCommerce</h3>
                      <p className="text-sm text-muted-foreground">WordPress integration for online stores</p>
                      <Badge variant="secondary" className="mt-4">Coming Soon</Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">Magento</h3>
                      <p className="text-sm text-muted-foreground">Enterprise e-commerce platform support</p>
                      <Badge variant="secondary" className="mt-4">Coming Soon</Badge>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="supply">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">Logistics Platforms</h3>
                      <p className="text-sm text-muted-foreground">Track shipments with major carriers</p>
                      <Badge variant="secondary" className="mt-4">Coming Soon</Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">Warehouse Management</h3>
                      <p className="text-sm text-muted-foreground">Sync inventory across locations</p>
                      <Badge variant="secondary" className="mt-4">Coming Soon</Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">Customs & Compliance</h3>
                      <p className="text-sm text-muted-foreground">Automate export documentation</p>
                      <Badge variant="secondary" className="mt-4">Coming Soon</Badge>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section id="developer-api" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4">Developer-First</Badge>
                <h2 className="text-3xl font-bold mb-4">Build Custom Integrations</h2>
                <p className="text-muted-foreground mb-6">
                  Our comprehensive API lets you build exactly what you need. RESTful endpoints, 
                  webhooks for real-time events, and SDKs in your favorite languages.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Code className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">RESTful API</h4>
                      <p className="text-xs text-muted-foreground">Standard REST endpoints with JSON</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Webhook className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Webhooks</h4>
                      <p className="text-xs text-muted-foreground">Real-time event notifications</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileCode className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">GraphQL</h4>
                      <p className="text-xs text-muted-foreground">Flexible queries for complex data</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">SDKs</h4>
                      <p className="text-xs text-muted-foreground">Node.js, Python, Java, and more</p>
                    </div>
                  </div>
                </div>

                <Button asChild data-testid="button-api-reference">
                  <Link href="/contact" className="gap-2">
                    Request API Access
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>

              <div>
                <Card className="bg-zinc-950 text-zinc-100 overflow-hidden">
                  <CardHeader className="border-b border-zinc-800 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-xs text-zinc-400 ml-2">api-example.ts</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <pre className="text-xs leading-relaxed overflow-x-auto">
                      <code>{`// Create a Digital Product Passport
const passport = await photonictag.passports.create({
  productName: "EcoPower Battery 5000mAh",
  manufacturer: "GreenTech Industries",
  batchNumber: "BAT-2025-001",
  materials: ["Lithium", "Cobalt", "Graphite"],
  carbonFootprint: 12.5,
  repairabilityScore: 8.2,
  certifications: ["EU_DPP", "ISO_14001"]
});

// Generate QR code
const qr = await passport.generateQR({
  format: "svg",
  size: 256
});

console.log(passport.id); // "dpp_abc123..."
console.log(qr.url); // "scan.photonictag.com/..."`}</code>
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Connect Your Systems?</h2>
            <p className="text-muted-foreground mb-6">
              Get started with our enterprise integrations. Our team will help you configure the perfect setup for your product ecosystem.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" data-testid="button-talk-sales">
                <a href="https://calendar.app.google/Aa9nfUnJiZvcjXi28" target="_blank" rel="noopener noreferrer" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Book a Demo
                </a>
              </Button>
              <Button variant="outline" asChild size="lg" data-testid="button-contact">
                <Link href="/contact" className="gap-2">
                  Contact Sales
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
