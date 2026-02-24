import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { ModulesSection } from "@/components/modules-section";
import { 
  QrCode, 
  Shield, 
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  Building2,
  Calendar,
  Link as LinkIcon,
  Layers,
  Rocket,
  Lock,
  FileCheck,
  Globe,
  Award,
  ShieldCheck
} from "lucide-react";
import { Link } from "wouter";

export default function LandingValidation() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>PhotonicTag - EU Digital Product Passport Compliance | DPP Platform</title>
        <meta name="description" content="Get EU Digital Product Passport compliant under ESPR 2024/1781. Battery deadline Feb 18, 2027. PhotonicTag provides tamper-proof product identity, QR traceability, and SAP integration." />
        <meta property="og:title" content="PhotonicTag - EU DPP Compliance Made Simple" />
        <meta property="og:description" content="Digital Product Passports for EU compliance. Avoid €100K+ penalties. SAP integration. Go live in weeks." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="fixed top-0 left-0 right-0 z-50">
        <PublicNav />
      </div>

      <section className="relative pt-36 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge variant="destructive" className="gap-1 mb-8" data-testid="badge-deadline">
            <AlertTriangle className="w-3 h-3" />
            Battery Passport Deadline: Feb 18, 2027
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6" data-testid="text-hero-title">
            Your Products Need a{" "}
            <span className="text-primary">Digital Identity.</span>
            <br className="hidden sm:block" />
            <span className="text-primary">We Make It Happen.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed" data-testid="text-hero-subtitle">
            The EU mandates Digital Product Passports starting 2027. 
            Non-compliance risks penalties up to €100,000+ per violation.
            PhotonicTag gets you compliant in weeks — not months.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Button size="lg" asChild data-testid="button-hero-demo">
              <a href="https://calendar.app.google/Aa9nfUnJiZvcjXi28" target="_blank" rel="noopener noreferrer" className="gap-2">
                <Calendar className="w-4 h-4" />
                Book a Demo
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-hero-see-demo">
              <Link href="/scan/demo" className="gap-2">
                <QrCode className="w-4 h-4" />
                View Live Examples
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 flex-wrap text-sm text-muted-foreground">
            <div className="flex items-center gap-2" data-testid="badge-eu-ready">
              <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>EU DPP 2027 Ready</span>
            </div>
            <div className="flex items-center gap-2" data-testid="badge-sap">
              <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>SAP Integration</span>
            </div>
            <div className="flex items-center gap-2" data-testid="badge-ai">
              <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>AI-Powered Insights</span>
            </div>
            <div className="flex items-center gap-2" data-testid="badge-secure">
              <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Tamper-Proof</span>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-muted/30 border-y">
        <ModulesSection />
      </div>

      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y" data-testid="section-dpp-timeline">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 gap-1">
              <Clock className="w-3 h-3" />
              ESPR Regulation (EU) 2024/1781
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-timeline-title">EU DPP Compliance Timeline</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Digital Product Passports are rolling out in phases. Know your deadline — and start preparing today.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-border hidden md:block" />

            <div className="space-y-8 md:space-y-12">
              <div className="relative flex flex-col md:flex-row md:items-center gap-4" data-testid="timeline-item-batteries">
                <div className="md:w-1/2 md:text-right md:pr-8">
                  <Badge variant="destructive" className="mb-2">Urgent</Badge>
                  <h3 className="font-semibold text-lg">Batteries & EV Components</h3>
                  <p className="text-sm text-muted-foreground">Industrial, EV, and portable batteries above 2kWh. Full lifecycle data, carbon footprint, and recycled content disclosure required.</p>
                </div>
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-destructive text-destructive-foreground items-center justify-center z-10">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="md:w-1/2 md:pl-8">
                  <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="p-4">
                      <p className="font-bold text-destructive text-lg">February 18, 2027</p>
                      <p className="text-xs text-muted-foreground mt-1">EU Battery Regulation 2023/1542</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="relative flex flex-col md:flex-row md:items-center gap-4" data-testid="timeline-item-textiles">
                <div className="md:w-1/2 md:text-right md:pr-8">
                  <Badge variant="secondary" className="mb-2 bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800">Soon</Badge>
                  <h3 className="font-semibold text-lg">Textiles & Electronics</h3>
                  <p className="text-sm text-muted-foreground">Clothing, footwear, consumer electronics, and smart devices. Material composition, repairability scores, and sustainability data.</p>
                </div>
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-amber-500 text-white items-center justify-center z-10">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="md:w-1/2 md:pl-8">
                  <Card className="border-amber-500/30 bg-amber-500/5">
                    <CardContent className="p-4">
                      <p className="font-bold text-amber-600 dark:text-amber-400 text-lg">Late 2027</p>
                      <p className="text-xs text-muted-foreground mt-1">ESPR delegated acts expected</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="relative flex flex-col md:flex-row md:items-center gap-4" data-testid="timeline-item-packaging">
                <div className="md:w-1/2 md:text-right md:pr-8">
                  <Badge variant="secondary" className="mb-2">Upcoming</Badge>
                  <h3 className="font-semibold text-lg">Packaging & Furniture</h3>
                  <p className="text-sm text-muted-foreground">Packaging materials, furniture, and home goods. Recycling instructions, material sourcing, and circularity data.</p>
                </div>
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary/80 text-primary-foreground items-center justify-center z-10">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="md:w-1/2 md:pl-8">
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-bold text-lg">2028 - 2029</p>
                      <p className="text-xs text-muted-foreground mt-1">Phased rollout under ESPR</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="relative flex flex-col md:flex-row md:items-center gap-4" data-testid="timeline-item-universal">
                <div className="md:w-1/2 md:text-right md:pr-8">
                  <Badge variant="secondary" className="mb-2">All Industries</Badge>
                  <h3 className="font-semibold text-lg">Universal DPP Mandate</h3>
                  <p className="text-sm text-muted-foreground">All product categories including construction materials, automotive parts, and industrial equipment. Full EU market coverage.</p>
                </div>
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-muted text-muted-foreground items-center justify-center z-10">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="md:w-1/2 md:pl-8">
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-bold text-lg">By 2030</p>
                      <p className="text-xs text-muted-foreground mt-1">Complete ESPR implementation</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild data-testid="button-timeline-demo">
              <a href="https://calendar.app.google/Aa9nfUnJiZvcjXi28" target="_blank" rel="noopener noreferrer" className="gap-2">
                <Calendar className="w-4 h-4" />
                Find Out Your Deadline
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-destructive/5 border-y">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-problem-title">The Compliance Challenge</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              EU regulations are accelerating. Companies that aren't prepared face real financial and operational risk.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-destructive/20" data-testid="card-problem-1">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-md bg-destructive/10 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-semibold mb-2">Tight Deadlines</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Batteries by Feb 2027. Textiles & electronics by late 2027. All products by 2030. The clock is ticking — and most companies aren't ready.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-destructive/20" data-testid="card-problem-2">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-md bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-semibold mb-2">Steep Penalties</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Fines from €10,000 to €100,000+ per violation. Product recalls. Loss of EU market access. The cost of inaction far exceeds the cost of compliance.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-destructive/20" data-testid="card-problem-3">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-md bg-destructive/10 flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-semibold mb-2">Complex Requirements</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Materials, carbon footprint, repairability, recycling — dozens of mandatory data points across multiple regulatory frameworks.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-solution-title">One Platform. Complete Compliance.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              PhotonicTag handles the complexity of EU Digital Product Passports so you can focus on building great products.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4" data-testid="feature-qr">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <QrCode className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">QR-Based Product Passports</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every product gets a unique, tamper-proof digital identity. Consumers scan to verify authenticity and access full sustainability data instantly.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4" data-testid="feature-compliance">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Built for EU DPP Compliance</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pre-configured templates for batteries, textiles, and electronics. Every required data field is included — no guesswork.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4" data-testid="feature-sap">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">SAP & ERP Integration</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Bidirectional sync with SAP S/4HANA, ECC, and other major ERP systems. Pull product data directly — no manual entry.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4" data-testid="feature-fast">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Go Live in Weeks</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Basic setup in 1-2 weeks. Full enterprise deployment in 4-8 weeks with dedicated onboarding and support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 border-y" data-testid="section-how-it-works">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-how-it-works-title">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to full EU DPP compliance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center" data-testid="step-connect">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <LinkIcon className="w-7 h-7 text-primary" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Step 1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Integrate with your existing ERP, PLM, or supply chain systems. We support SAP, Oracle, and custom APIs out of the box.
              </p>
            </div>

            <div className="text-center" data-testid="step-enrich">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Layers className="w-7 h-7 text-primary" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Step 2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Enrich</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI automatically generates sustainability scores, repair guides, and compliance data. Fill gaps in your product information effortlessly.
              </p>
            </div>

            <div className="text-center" data-testid="step-deploy">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-7 h-7 text-primary" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Step 3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Deploy</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Generate QR codes, publish compliant Digital Product Passports, and give consumers instant access to product data.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" asChild data-testid="button-how-it-works-cta">
              <Link href="/docs" className="gap-2">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y" data-testid="section-trust">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-trust-title">Built on Trust & Compliance</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade security and regulatory alignment you can depend on.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card data-testid="trust-gdpr">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-sm mb-1">GDPR Compliant</h4>
                <p className="text-xs text-muted-foreground">Full data privacy alignment</p>
              </CardContent>
            </Card>

            <Card data-testid="trust-espr">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <FileCheck className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-sm mb-1">ESPR Ready</h4>
                <p className="text-xs text-muted-foreground">EU 2024/1781 compliant</p>
              </CardContent>
            </Card>

            <Card data-testid="trust-encryption">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-sm mb-1">End-to-End Encryption</h4>
                <p className="text-xs text-muted-foreground">Enterprise-grade security</p>
              </CardContent>
            </Card>

            <Card data-testid="trust-global">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-sm mb-1">EU Hosted</h4>
                <p className="text-xs text-muted-foreground">Data sovereignty guaranteed</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 border-y">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-industries-title">Industries We Serve</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Purpose-built for the sectors most impacted by EU DPP regulations.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="text-sm py-2 px-4">Batteries & Energy Storage</Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">Textiles & Fashion</Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">Electronics & Consumer Goods</Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">Automotive & EV Components</Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">Packaging & Materials</Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">Furniture & Home Goods</Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">Construction Materials</Badge>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6" data-testid="text-cta-title">
            Start Your Compliance Journey Today
          </h2>
          <p className="text-lg opacity-90 mb-10 leading-relaxed max-w-xl mx-auto">
            Companies that prepare early gain a competitive edge. 
            See how PhotonicTag can get your products EU-ready — fast.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild data-testid="button-cta-demo">
              <a href="https://calendar.app.google/Aa9nfUnJiZvcjXi28" target="_blank" rel="noopener noreferrer" className="gap-2">
                <Calendar className="w-4 h-4" />
                Book a Demo
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground" asChild data-testid="button-cta-contact">
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
