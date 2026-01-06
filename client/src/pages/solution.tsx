import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  QrCode, 
  Shield, 
  Leaf, 
  Truck, 
  Recycle, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  BarChart3,
  Globe,
  Lock,
  Factory,
  Users,
  Zap,
  Brain,
  Wifi,
  FileCheck,
  Target
} from "lucide-react";
import { Link } from "wouter";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

const platformCapabilities = [
  {
    title: "Digital Product Passports",
    description: "Create EU DPP-compliant digital identities for every product. Store comprehensive data including materials, origin, carbon footprint, and end-of-life instructions in a tamper-proof format.",
    icon: QrCode,
    features: [
      "EU Ecodesign Regulation compliant",
      "Unique identifier per product",
      "QR code generation and management",
      "Real-time data updates"
    ]
  },
  {
    title: "Supply Chain Traceability",
    description: "Track products from raw materials to end consumer with complete chain of custody. Record every touchpoint, inspection, and transfer with immutable event logging.",
    icon: Truck,
    features: [
      "End-to-end visibility",
      "Multi-tier supplier tracking",
      "Timestamp and location logging",
      "Automated event capture"
    ]
  },
  {
    title: "Authentication & Anti-Counterfeit",
    description: "Protect your brand with physics-rooted authentication. Every scan verifies product authenticity and logs the verification event for analysis.",
    icon: Shield,
    features: [
      "Tamper-proof identifiers",
      "Real-time verification",
      "Counterfeit detection alerts",
      "Brand protection analytics"
    ]
  },
  {
    title: "IoT Device Integration",
    description: "Connect NFC tags, RFID chips, and BLE beacons to your digital passports. Enable contactless scanning and real-time sensor data integration.",
    icon: Wifi,
    features: [
      "NFC/RFID/BLE support",
      "Sensor data integration",
      "Device lifecycle management",
      "Firmware update tracking"
    ]
  },
  {
    title: "AI-Powered Insights",
    description: "Leverage artificial intelligence to generate sustainability scores, repair guides, risk assessments, and circularity recommendations automatically.",
    icon: Brain,
    features: [
      "Automated sustainability scoring",
      "AI repair instructions",
      "Risk and compliance analysis",
      "Circularity recommendations"
    ]
  },
  {
    title: "Sustainability Reporting",
    description: "Measure and communicate your environmental impact with precision. Track carbon footprint, recyclability, and material efficiency across your product portfolio.",
    icon: Leaf,
    features: [
      "Carbon footprint tracking",
      "Recyclability scoring",
      "Material composition analysis",
      "ESG reporting ready"
    ]
  },
];

const useCases = [
  {
    industry: "Batteries & Energy Storage",
    description: "Meet EU Battery Regulation requirements with complete lifecycle tracking, state of health monitoring, and end-of-life recycling guidance.",
    icon: Zap,
  },
  {
    industry: "Textiles & Fashion",
    description: "Provide full supply chain transparency from fiber to finished garment, supporting sustainable fashion initiatives and consumer trust.",
    icon: Factory,
  },
  {
    industry: "Electronics & IoT",
    description: "Track component origins, manage firmware versions, and ensure compliance with e-waste regulations across complex supply chains.",
    icon: Wifi,
  },
  {
    industry: "Luxury & Consumer Goods",
    description: "Authenticate premium products, combat counterfeits, and provide ownership history for resale and warranty purposes.",
    icon: Shield,
  },
];

const complianceStandards = [
  { name: "EU DPP Regulation", status: "Compliant" },
  { name: "EU Battery Regulation", status: "Compliant" },
  { name: "ESPR Ecodesign", status: "Compliant" },
  { name: "GS1 Digital Link", status: "Supported" },
  { name: "ISO 14001", status: "Aligned" },
  { name: "GDPR", status: "Compliant" },
];

export default function Solution() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 gap-1">
            <Sparkles className="w-3 h-3" />
            Platform Overview
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" data-testid="text-solution-title">
            The Complete Digital Product Passport Platform
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            PhotonicTag provides everything you need to create, manage, and share tamper-proof digital identities 
            for your products. From factory floor to consumer hands, we enable complete transparency and trust.
          </p>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Platform Capabilities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Six integrated modules working together to provide comprehensive product identity management.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platformCapabilities.map((capability) => (
              <Card key={capability.title} data-testid={`card-capability-${capability.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <capability.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{capability.title}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">{capability.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {capability.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-20 py-16 bg-muted/30 rounded-lg px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to transform your product identity management.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold">Create Passports</h3>
              <p className="text-muted-foreground">
                Register your products and generate unique digital identities with all required EU DPP data fields.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold">Track & Trace</h3>
              <p className="text-muted-foreground">
                Record supply chain events, link IoT devices, and capture every touchpoint in your product's journey.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold">Share & Verify</h3>
              <p className="text-muted-foreground">
                Consumers, regulators, and partners scan QR codes to access verified product information instantly.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Industry Applications</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Purpose-built solutions for regulated industries and sustainability-focused brands.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {useCases.map((useCase) => (
              <Card key={useCase.industry} className="hover-elevate" data-testid={`card-usecase-${useCase.industry.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <useCase.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{useCase.industry}</h3>
                    <p className="text-sm text-muted-foreground">{useCase.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Compliance & Standards</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built from the ground up to meet current and upcoming regulatory requirements.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {complianceStandards.map((standard) => (
              <Card key={standard.name} className="text-center" data-testid={`card-compliance-${standard.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="p-4 space-y-2">
                  <FileCheck className="w-8 h-8 text-primary mx-auto" />
                  <p className="text-sm font-medium">{standard.name}</p>
                  <Badge variant="secondary" className="text-xs">{standard.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Why Choose PhotonicTag?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Purpose-Built for DPP</h3>
                  <p className="text-sm text-muted-foreground">
                    Not an afterthought — PhotonicTag was designed specifically for the EU Digital Product Passport regulation from day one.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Tamper-Proof by Design</h3>
                  <p className="text-sm text-muted-foreground">
                    Physics-rooted identity ensures product data cannot be forged, altered, or falsified at any point in the supply chain.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Global Scale</h3>
                  <p className="text-sm text-muted-foreground">
                    Enterprise-ready infrastructure handling millions of products and billions of scans across global supply chains.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Consumer-Centric</h3>
                  <p className="text-sm text-muted-foreground">
                    Beautiful, mobile-optimized scan pages that build trust and engagement with your end customers.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">99.9%</p>
                <p className="text-sm text-muted-foreground">Uptime SLA</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">&lt;50ms</p>
                <p className="text-sm text-muted-foreground">Scan Response</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">100+</p>
                <p className="text-sm text-muted-foreground">Integrations</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">24/7</p>
                <p className="text-sm text-muted-foreground">Support</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center py-16 bg-primary/5 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Join 850+ brands already using PhotonicTag to create secure, verifiable digital identities for their products.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild data-testid="button-solution-start">
              <a href="/api/login" className="gap-2">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-solution-demo">
              <Link href="/scan/demo">View Demo Passport</Link>
            </Button>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
