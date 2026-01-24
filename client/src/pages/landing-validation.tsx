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
  Calendar
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

      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge variant="destructive" className="gap-1 mb-6" data-testid="badge-deadline">
            <AlertTriangle className="w-3 h-3" />
            Battery Passport Deadline: Feb 18, 2027
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6" data-testid="text-hero-title">
            Digital Product Passports.{" "}
            <span className="text-primary">Made Simple.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8" data-testid="text-hero-subtitle">
            Under ESPR Regulation (EU) 2024/1781, Digital Product Passports become mandatory starting 2027. 
            Non-compliance means penalties up to €100,000+ per violation.
            PhotonicTag gets you compliant in weeks, not months.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild data-testid="button-hero-demo">
              <a href="https://calendar.app.google/Aa9nfUnJiZvcjXi28" target="_blank" rel="noopener noreferrer" className="gap-2">
                <Calendar className="w-4 h-4" />
                Book a 30-min Demo
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-hero-see-demo">
              <Link href="/scan/demo" className="gap-2">
                <QrCode className="w-4 h-4" />
                View Examples
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 flex-wrap text-sm text-muted-foreground">
            <div className="flex items-center gap-2" data-testid="badge-eu-ready">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>EU DPP 2027 Ready</span>
            </div>
            <div className="flex items-center gap-2" data-testid="badge-sap">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>SAP Integration</span>
            </div>
            <div className="flex items-center gap-2" data-testid="badge-ai">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>AI-Powered Insights</span>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-muted/30 border-y">
        <ModulesSection />
      </div>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-destructive/5 border-y">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-problem-title">The Problem</h2>
            <p className="text-lg text-muted-foreground">
              EU regulations are changing. Is your business ready?
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-destructive/20" data-testid="card-problem-1">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-md bg-destructive/10 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-semibold mb-2">Tight Deadlines</h3>
                <p className="text-sm text-muted-foreground">
                  Batteries by Feb 2027. Textiles & electronics by late 2027. All products by 2030. Most companies aren't ready.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-destructive/20" data-testid="card-problem-2">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-md bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-semibold mb-2">Steep Penalties</h3>
                <p className="text-sm text-muted-foreground">
                  €10,000 to €100,000+ per violation. Product recalls. Market access denied.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-destructive/20" data-testid="card-problem-3">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-md bg-destructive/10 flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-semibold mb-2">Complex Requirements</h3>
                <p className="text-sm text-muted-foreground">
                  Materials, carbon footprint, repairability, recycling... dozens of data points required.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-solution-title">The Solution</h2>
            <p className="text-lg text-muted-foreground">
              PhotonicTag handles compliance so you can focus on your business.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4" data-testid="feature-qr">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <QrCode className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">QR-Based Product Passports</h3>
                <p className="text-sm text-muted-foreground">
                  Every product gets a unique, tamper-proof digital identity. Consumers scan to verify authenticity and view sustainability data.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4" data-testid="feature-compliance">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Built for EU DPP Compliance</h3>
                <p className="text-sm text-muted-foreground">
                  Pre-configured templates for batteries, textiles, electronics. All required data fields included.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4" data-testid="feature-sap">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">SAP & ERP Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Bidirectional sync with SAP S/4HANA, ECC, and other major ERP systems. Your data stays in sync.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4" data-testid="feature-fast">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Weeks, Not Months</h3>
                <p className="text-sm text-muted-foreground">
                  Go live in 1-2 weeks for basic setup. Full enterprise deployment in 4-8 weeks with dedicated support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30 border-y">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-industries-title">Who We Serve</h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
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

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-cta-title">
            Don't Wait Until 2027
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Companies that start now will have a competitive advantage. 
            Let's discuss how PhotonicTag can help your business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild data-testid="button-cta-demo">
              <a href="https://calendar.app.google/Aa9nfUnJiZvcjXi28" target="_blank" rel="noopener noreferrer" className="gap-2">
                <Calendar className="w-4 h-4" />
                Book a 30-min Demo
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild data-testid="button-cta-contact">
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
