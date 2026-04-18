import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicNav } from "@/components/public-nav";
import { FadeUp, StaggerContainer, StaggerItem, HoverLift } from "@/components/motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Zap,
  Factory,
  Store,
  ShoppingCart,
  Trash2,
  HelpCircle,
  Shirt,
  Cpu,
  Package,
  Car,
  Home
} from "lucide-react";
import { Link } from "wouter";

const faqItems = [
  {
    question: "What is a Digital Product Passport (DPP)?",
    answer: "A Digital Product Passport is an electronic record that contains comprehensive information about a product throughout its lifecycle — from raw materials and manufacturing to usage, repair, and end-of-life recycling. It's accessed via a unique identifier (like a QR code) and provides transparency for consumers, regulators, and supply chain partners about a product's origin, composition, environmental impact, and circularity potential."
  },
  {
    question: "When does the EU Digital Product Passport regulation take effect?",
    answer: "The EU Ecodesign for Sustainable Products Regulation (ESPR) was adopted in 2024, with DPP requirements rolling out in phases. Batteries are first, with mandatory DPPs required from February 2027. Textiles, electronics, and other product categories will follow between 2027-2030. PhotonicTag is designed to help you prepare now, so you're compliant before deadlines arrive."
  },
  {
    question: "Which products will require Digital Product Passports?",
    answer: "Initially, batteries (including EV batteries, industrial batteries, and portable batteries) will require DPPs from 2027. The regulation will expand to cover textiles, construction materials, furniture, electronics, packaging, and eventually most manufactured goods sold in the EU. PhotonicTag supports all these categories with industry-specific templates and compliance frameworks."
  },
  {
    question: "How does PhotonicTag ensure data security and prevent tampering?",
    answer: "PhotonicTag uses cryptographic signatures and blockchain-anchored verification to create tamper-proof product identities. Each product receives a unique digital signature that cannot be forged or altered. Our platform is ISO 27001 certified, GDPR compliant, and uses end-to-end encryption. All data changes are logged in an immutable audit trail, ensuring complete traceability and regulatory compliance."
  },
  {
    question: "Can PhotonicTag integrate with our existing ERP and PLM systems?",
    answer: "Yes. PhotonicTag offers REST APIs, webhooks, and pre-built connectors for major enterprise systems including SAP, Oracle, Microsoft Dynamics, and leading PLM platforms. Our integration team provides dedicated support to ensure seamless data flow between your existing systems and the PhotonicTag platform, typically completing integrations within 2-4 weeks."
  },
  {
    question: "What happens if a QR code on a product is damaged or unreadable?",
    answer: "PhotonicTag supports multiple identification methods for redundancy. Beyond QR codes, you can link products via serial numbers, RFID/NFC tags, or digital watermarks. If a QR code is damaged, consumers can manually enter the serial number on our verification portal. For high-value products, we recommend pairing QR codes with NFC chips for maximum durability and security."
  },
  {
    question: "How much does PhotonicTag cost?",
    answer: "PhotonicTag offers straightforward monthly plans. Our Starter plan begins at €99/month, covering the full admin dashboard, QR code generation, public scan pages, and API access. Growth (€499/month) adds advanced analytics, up to 5 team members, priority support, and IoT device integration. Enterprise pricing is custom and includes SAP S/4HANA integration, unlimited users, and dedicated account management. All prices are in EUR for EU customers; USD billing is available for non-EU customers. Visit our Pricing page for current plan details."
  },
  {
    question: "How long does it take to implement PhotonicTag?",
    answer: "Most customers are operational within 1-2 weeks for basic implementation. This includes account setup, product data import, QR code generation, and staff training. More complex enterprise deployments with ERP integrations and custom workflows typically take 4-8 weeks. Our implementation team provides hands-on support throughout the process."
  },
  {
    question: "Do consumers need to download an app to scan product passports?",
    answer: "No. PhotonicTag passports are web-based and work with any smartphone camera — no app download required. When a consumer scans the QR code, they're taken directly to a mobile-optimized product passport page showing authenticity verification, sustainability data, care instructions, and recycling information. This removes friction and maximizes consumer engagement."
  },
  {
    question: "How does PhotonicTag help with sustainability reporting?",
    answer: "PhotonicTag automatically calculates and tracks key sustainability metrics including carbon footprint, recycled content percentage, repairability scores, and circularity grades. Our AI-powered analytics aggregate this data across your product portfolio, generating reports aligned with EU DPP requirements, GRI standards, and CDP disclosures. This simplifies compliance and supports your ESG commitments."
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <FadeUp delay={0.05} className="space-y-4">
                <Badge variant="secondary" className="gap-1" data-testid="badge-hero-ai">
                  <Shield className="w-3 h-3" />
                  EU DPP Compliance Ready
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                  One Scan.{" "}
                  <span className="text-primary">Complete Trust.</span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-xl">
                  PhotonicTag creates tamper-proof Digital Product Passports that travel with your products from factory to consumer. 
                  Verify authenticity, track sustainability, and build customer trust — all with a single scan.
                </p>
              </FadeUp>
              
              <FadeUp delay={0.18} className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild data-testid="button-hero-start">
                  <a href="/api/login" className="gap-2">
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild data-testid="button-hero-demo">
                  <Link href="/scan/demo">View Demo Passport</Link>
                </Button>
              </FadeUp>

              <FadeUp delay={0.28} className="flex items-center gap-6 pt-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="badge-eu-dpp">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>EU DPP 2027 Ready</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="badge-soc2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>ISO 27001 Certified</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="badge-gdpr">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>GDPR Compliant</span>
                </div>
              </FadeUp>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-xl overflow-hidden opacity-20 dark:opacity-15">
                <img 
                  src="/assets/stock_images/battery_pack_pro.png" 
                  alt="QR code scanning technology"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative bg-card border rounded-lg p-6 shadow-lg">
                <div className="absolute -top-3 -right-3">
                  <Badge className="gap-2">
                    <span className="pulse-dot" />
                    Live Preview
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src="/assets/stock_images/battery_pack_pro.png" 
                        alt="GreenCell Li-Ion Battery Pack"
                        className="w-full h-full object-cover"
                        data-testid="img-hero-product"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">Digital Product Passport</p>
                      <h3 className="text-lg font-semibold">GreenCell 5kWh Battery</h3>
                      <p className="text-xs text-muted-foreground mt-1">Model: GCT-BAT-2025 | SN: 0842</p>
                      <Badge variant="secondary" className="mt-2 gap-1">
                        <Shield className="w-3 h-3" />
                        Verified Authentic
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Carbon Footprint</p>
                      <p className="text-2xl font-bold text-primary" data-testid="text-preview-carbon">68 kg CO2e</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Repairability</p>
                      <p className="text-2xl font-bold text-primary" data-testid="text-preview-repairability">7.2/10</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Recycled Content</p>
                      <p className="text-2xl font-bold" data-testid="text-preview-recycled">28%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Lifespan</p>
                      <p className="text-2xl font-bold text-primary" data-testid="text-preview-lifespan">12 years</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center gap-2" data-testid="trust-traceability">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                          <Factory className="w-3 h-3 text-primary" />
                        </div>
                        <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                          <Truck className="w-3 h-3 text-primary" />
                        </div>
                        <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                          <Store className="w-3 h-3 text-primary" />
                        </div>
                        <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                          <Recycle className="w-3 h-3 text-primary" />
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">4 lifecycle events tracked</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-primary" />
                      <span>EU Battery Regulation 2023/1542 Compliant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4" data-testid="badge-features">The Identity Layer</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Trust What You See. Trace What You Buy.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enable brands, regulators, and consumers to verify authenticity 
              and understand the full story behind every product.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-card" data-testid="card-feature-qr">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Physics-Rooted Signatures</h3>
                <p className="text-muted-foreground">
                  Each product receives a unique, tamper-proof QR signature — a physics-rooted 
                  identity that bridges the physical and digital worlds.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card" data-testid="card-feature-traceability">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Illuminate the Journey</h3>
                <p className="text-muted-foreground">
                  Follow every step of your product's story — from origin through lifecycle 
                  to end-of-life — with transparent, verifiable traceability.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card" data-testid="card-feature-ai">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Intelligent Insights</h3>
                <p className="text-muted-foreground">
                  AI reveals the full story — sustainability scores, repair guidance, 
                  and circularity insights that illuminate hidden product truths.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card" data-testid="card-feature-sustainability">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Transparent Impact</h3>
                <p className="text-muted-foreground">
                  Carbon footprint, material origins, recyclability — every sustainability 
                  metric becomes visible, verifiable, and impossible to hide.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card" data-testid="card-feature-security">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Unforgeable Identity</h3>
                <p className="text-muted-foreground">
                  Combat counterfeiting with identities that cannot be forged, erased, or lost. 
                  Cryptographic verification ensures authenticity at every touchpoint.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card" data-testid="card-feature-recycling">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Recycle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Circular Economy Ready</h3>
                <p className="text-muted-foreground">
                  Guide products through their complete lifecycle with clear end-of-life 
                  pathways, enabling true circular economy participation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="stats" className="py-16 px-4 sm:px-6 lg:px-8 border-y bg-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2" data-testid="stat-products">
              <p className="text-4xl sm:text-5xl font-bold text-primary">2.8M+</p>
              <p className="text-sm text-muted-foreground">Products Tracked</p>
            </div>
            <div className="space-y-2" data-testid="stat-scans">
              <p className="text-4xl sm:text-5xl font-bold text-primary">15M+</p>
              <p className="text-sm text-muted-foreground">QR Scans</p>
            </div>
            <div className="space-y-2" data-testid="stat-carbon">
              <p className="text-4xl sm:text-5xl font-bold text-primary">340K</p>
              <p className="text-sm text-muted-foreground">Tonnes CO2 Tracked</p>
            </div>
            <div className="space-y-2" data-testid="stat-brands">
              <p className="text-4xl sm:text-5xl font-bold text-primary">850+</p>
              <p className="text-sm text-muted-foreground">Enterprise Brands</p>
            </div>
          </div>
        </div>
      </section>

      <section id="product-showcase" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4" data-testid="badge-showcase">Live Demo Products</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              See PhotonicTag in Action
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore real Digital Product Passports across diverse industries — from batteries to fashion.
            </p>
          </div>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" delay={0.1}>
            <StaggerItem>
              <HoverLift>
                <Card className="group overflow-hidden shadow-sm border-primary/5" data-testid="showcase-battery">
                  <CardContent className="p-4 space-y-3">
                    <div className="aspect-square w-full rounded inner-rounded overflow-hidden">
                      <img 
                        src="/assets/stock_images/battery_pack_pro.png" 
                        alt="Li-Ion Battery Pack"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        data-testid="img-showcase-battery"
                      />
                    </div>
                    <div>
                      <Badge variant="secondary" className="text-xs mb-2">Batteries</Badge>
                      <h3 className="font-semibold">EcoPower Li-Ion Battery</h3>
                      <p className="text-xs text-muted-foreground mt-1">EU Battery Passport Compliant</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span className="flex items-center gap-1"><Leaf className="w-3 h-3 text-primary" />45kg CO2</span>
                      <span className="flex items-center gap-1"><Recycle className="w-3 h-3 text-primary" />95% Recyclable</span>
                    </div>
                  </CardContent>
                </Card>
              </HoverLift>
            </StaggerItem>

            <StaggerItem>
              <HoverLift>
                <Card className="group overflow-hidden shadow-sm border-primary/5" data-testid="showcase-textile">
                  <CardContent className="p-4 space-y-3">
                    <div className="aspect-square w-full rounded inner-rounded overflow-hidden">
                      <img 
                        src="/assets/stock_images/wool_sweater_pro.png" 
                        alt="Premium Wool Sweater"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        data-testid="img-showcase-textile"
                      />
                    </div>
                    <div>
                      <Badge variant="secondary" className="text-xs mb-2">Textiles</Badge>
                      <h3 className="font-semibold">Nordic Wool Sweater</h3>
                      <p className="text-xs text-muted-foreground mt-1">Mulesing-Free Merino</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span className="flex items-center gap-1"><Leaf className="w-3 h-3 text-primary" />8kg CO2</span>
                      <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-primary" />9/10 Repair</span>
                    </div>
                  </CardContent>
                </Card>
              </HoverLift>
            </StaggerItem>

            <StaggerItem>
              <HoverLift>
                <Card className="group overflow-hidden shadow-sm border-primary/5" data-testid="showcase-leather">
                  <CardContent className="p-4 space-y-3">
                    <div className="aspect-square w-full rounded inner-rounded overflow-hidden">
                      <img 
                        src="/assets/stock_images/leather_tote_pro.png" 
                        alt="Artisan Leather Tote"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        data-testid="img-showcase-leather"
                      />
                    </div>
                    <div>
                      <Badge variant="secondary" className="text-xs mb-2">Fashion</Badge>
                      <h3 className="font-semibold">Milano Artisan Tote</h3>
                      <p className="text-xs text-muted-foreground mt-1">Made in Italy</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-primary" />25yr Lifespan</span>
                      <span className="flex items-center gap-1"><Recycle className="w-3 h-3 text-primary" />95% Natural</span>
                    </div>
                  </CardContent>
                </Card>
              </HoverLift>
            </StaggerItem>

            <StaggerItem>
              <HoverLift>
                <Card className="group overflow-hidden shadow-sm border-primary/5" data-testid="showcase-smarthome">
                  <CardContent className="p-4 space-y-3">
                    <div className="aspect-square w-full rounded inner-rounded overflow-hidden">
                      <img 
                        src="/assets/stock_images/thermostat_pro.png" 
                        alt="Smart Thermostat"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        data-testid="img-showcase-smarthome"
                      />
                    </div>
                    <div>
                      <Badge variant="secondary" className="text-xs mb-2">Smart Home</Badge>
                      <h3 className="font-semibold">EcoNest Thermostat Pro</h3>
                      <p className="text-xs text-muted-foreground mt-1">Energy Star Certified</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" />23% Energy Save</span>
                      <span className="flex items-center gap-1"><Recycle className="w-3 h-3 text-primary" />55% Recycled</span>
                    </div>
                  </CardContent>
                </Card>
              </HoverLift>
            </StaggerItem>
          </StaggerContainer>

          <div className="text-center mt-8">
            <Button size="lg" variant="outline" asChild data-testid="button-explore-demo">
              <Link href="/scan/demo" className="gap-2">
                Explore All Demo Products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="use-cases" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4" data-testid="badge-use-cases">Use Cases</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              One Platform. Every Stakeholder.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From factory floor to recycling center, PhotonicTag serves the entire product lifecycle.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card" data-testid="card-usecase-manufacturers">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Factory className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">For Manufacturers</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                    Compliance automation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                    Product passports
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                    Supply chain visibility
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card" data-testid="card-usecase-brands">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Store className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">For Brands</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                    Authenticity verification
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                    Customer engagement
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                    Sustainability storytelling
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card" data-testid="card-usecase-marketplaces">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">For Marketplaces</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                    Resale verification
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                    Provenance tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                    Fraud prevention
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card" data-testid="card-usecase-recyclers">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">For Recyclers</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                    Material breakdown
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                    Hazard warnings
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                    Automated sorting
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="why-us" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4" data-testid="badge-why-us">Why PhotonicTag</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              One Platform. Full Lifecycle. Zero Complexity.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card" data-testid="card-why-circularity">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Built for Circularity</h3>
                <p className="text-sm text-muted-foreground">
                  Designed for sustainable manufacturing and global compliance standards.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card" data-testid="card-why-security">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Secure by Design</h3>
                <p className="text-sm text-muted-foreground">
                  Cryptographic identity, tamper-proof QR, and privacy-first architecture.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card" data-testid="card-why-integration">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Lightning-Fast Integration</h3>
                <p className="text-sm text-muted-foreground">
                  APIs, webhooks, and no-code tools for rapid onboarding.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card" data-testid="card-why-enterprise">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Enterprise-Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Scalable, reliable, and built for high-volume manufacturers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4" data-testid="badge-how-it-works">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Three Simple Steps
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create digital product passports in minutes — giving every product 
              a secure, verifiable identity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4" data-testid="step-create-products">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground mx-auto flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Add Your Product</h3>
              <p className="text-muted-foreground">
                Enter your product details — materials, origins, sustainability data, 
                and lifecycle information through our intuitive dashboard.
              </p>
            </div>

            <div className="text-center space-y-4" data-testid="step-generate-qr">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground mx-auto flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Digital Product Passport</h3>
              <p className="text-muted-foreground">
                Each product receives a unique, tamper-proof QR code — 
                a digital passport that travels with your product.
              </p>
            </div>

            <div className="text-center space-y-4" data-testid="step-share-track">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground mx-auto flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Scan & Verify</h3>
              <p className="text-muted-foreground">
                Anyone can scan to verify authenticity. Track every interaction 
                and let the product tell its own story.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="sustainability" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" data-testid="badge-eu-compliance">EU Compliance</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Where Transparency is Foundational
              </h2>
              <p className="text-lg text-muted-foreground">
                In a world where products move across borders, supply chains, and lifecycles, 
                identity has become the missing link. PhotonicTag bridges the gap with physics-rooted 
                verification that regulators and consumers can trust.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3" data-testid="compliance-material">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Full Material Disclosure</p>
                    <p className="text-sm text-muted-foreground">Track materials, components, and substances of concern</p>
                  </div>
                </div>
                <div className="flex items-start gap-3" data-testid="compliance-carbon">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Carbon Footprint Tracking</p>
                    <p className="text-sm text-muted-foreground">Calculate and display product lifecycle emissions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3" data-testid="compliance-repair">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Repairability Scoring</p>
                    <p className="text-sm text-muted-foreground">Standardized repair scores and instructions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3" data-testid="compliance-eol">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">End-of-Life Information</p>
                    <p className="text-sm text-muted-foreground">Recycling guidance and takeback programs</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card data-testid="card-stat-compliance">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold" data-testid="text-stat-compliance">67%</p>
                  <p className="text-sm text-muted-foreground">Reduction in compliance costs</p>
                </CardContent>
              </Card>
              <Card data-testid="card-stat-countries">
                <CardContent className="p-6 text-center">
                  <Globe className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold" data-testid="text-stat-countries">100+</p>
                  <p className="text-sm text-muted-foreground">Countries supported</p>
                </CardContent>
              </Card>
              <Card data-testid="card-stat-soc2">
                <CardContent className="p-6 text-center">
                  <Lock className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold" data-testid="text-stat-soc2">SOC 2</p>
                  <p className="text-sm text-muted-foreground">Type II Certified</p>
                </CardContent>
              </Card>
              <Card data-testid="card-stat-uptime">
                <CardContent className="p-6 text-center">
                  <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold" data-testid="text-stat-uptime">99.9%</p>
                  <p className="text-sm text-muted-foreground">Uptime SLA</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4" data-testid="badge-about">About PhotonicTag</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              The Identity Layer for Physical Products
            </h2>
          </div>
          
          <div className="space-y-6 text-lg">
            <p className="text-muted-foreground">
              PhotonicTag is the <span className="text-foreground font-medium">digital identity platform</span> that 
              gives every product a secure, verifiable passport. Our AI-powered infrastructure connects physical products 
              to their digital twins, creating an <span className="text-foreground font-medium">unbreakable chain of trust</span> from 
              manufacturer to consumer.
            </p>
            
            <p className="text-muted-foreground">
              Like photons carrying information at the speed of light, our platform delivers 
              <span className="text-foreground font-medium"> instant verification, complete transparency, and absolute clarity</span> about 
              every product's origin, journey, and authenticity.
            </p>
            
            <p className="text-muted-foreground">
              We integrate with <span className="text-foreground font-medium">any existing technology</span> — QR codes, RFID, NFC, 
              optical labels, or digital watermarks — transforming them into trusted, 
              verifiable identities that travel with your products throughout their lifecycle.
            </p>
          </div>

          <div className="mt-12 grid sm:grid-cols-3 gap-6">
            <div className="text-center space-y-2" data-testid="integration-qr">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">QR & Serial Codes</p>
            </div>
            <div className="text-center space-y-2" data-testid="integration-nfc">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">RFID & NFC</p>
            </div>
            <div className="text-center space-y-2" data-testid="integration-optical">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Optical & Digital Watermarks</p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 gap-1" data-testid="badge-faq">
              <HelpCircle className="w-3 h-3" />
              FAQ
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about Digital Product Passports and how PhotonicTag 
              helps you achieve compliance and transparency.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border rounded-lg px-6"
                data-testid={`accordion-faq-${index}`}
              >
                <AccordionTrigger className="text-left font-medium py-4" data-testid={`trigger-faq-${index}`}>
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4" data-testid={`content-faq-${index}`}>
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Still have questions? We're here to help.
            </p>
            <Button variant="outline" asChild data-testid="button-faq-contact">
              <Link href="/contact">Contact Our Team</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="gap-1" data-testid="badge-industries">
            <Globe className="w-3 h-3" />
            Global Compliance Solutions
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
            Digital Product Passports{" "}
            <span className="text-primary">for Every Industry</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From batteries to textiles, electronics to packaging — PhotonicTag delivers compliance-ready 
            Digital Product Passports that meet global regulations while building consumer trust.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Button variant="outline" size="sm" className="gap-2" asChild data-testid="nav-batteries">
              <Link href="/use-cases#batteries">
                <Zap className="w-4 h-4" />
                Batteries
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild data-testid="nav-textiles">
              <Link href="/use-cases#textiles">
                <Shirt className="w-4 h-4" />
                Textiles
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild data-testid="nav-electronics">
              <Link href="/use-cases#electronics">
                <Cpu className="w-4 h-4" />
                Electronics
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild data-testid="nav-packaging">
              <Link href="/use-cases#packaging">
                <Package className="w-4 h-4" />
                Packaging
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild data-testid="nav-automotive">
              <Link href="/use-cases#automotive">
                <Car className="w-4 h-4" />
                Automotive
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild data-testid="nav-smarthome">
              <Link href="/use-cases#smart-home">
                <Home className="w-4 h-4" />
                Smart Home
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6" data-testid="badge-cta-illumination">Get Started Today</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Ready to Transform Your
            <br />
            <span className="text-primary">Product Identity?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join forward-thinking brands using PhotonicTag to build trust, ensure compliance, 
            and create transparency across their entire supply chain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild data-testid="button-cta-start">
              <a href="/api/login" className="gap-2">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-cta-contact">
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors" data-testid="link-footer-features">Features</a></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors" data-testid="link-footer-pricing">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-foreground transition-colors" data-testid="link-footer-integrations">Integrations</Link></li>
                <li><Link href="/scan/demo" className="hover:text-foreground transition-colors" data-testid="link-footer-demo">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/docs" className="hover:text-foreground transition-colors" data-testid="link-footer-docs">Documentation</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors" data-testid="link-footer-blog">Blog</Link></li>
                <li><Link href="/case-studies" className="hover:text-foreground transition-colors" data-testid="link-footer-case-studies">Case Studies</Link></li>
                <li><Link href="/eu-dpp-guide" className="hover:text-foreground transition-colors" data-testid="link-footer-dpp-guide">EU DPP Guide</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#about" className="hover:text-foreground transition-colors" data-testid="link-footer-about">About</a></li>
                <li><Link href="/careers" className="hover:text-foreground transition-colors" data-testid="link-footer-careers">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors" data-testid="link-footer-contact">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-footer-privacy">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors" data-testid="link-footer-terms">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3" data-testid="footer-logo">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <QrCode className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">PhotonicTag</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">— Identity, at the speed of light.</span>
            </div>
            <p className="text-sm text-muted-foreground" data-testid="footer-copyright">
              2025 PhotonicTag. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
