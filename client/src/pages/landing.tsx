import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
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
  Zap
} from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-2" data-testid="nav-logo">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <QrCode className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">Photonictag</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-features">Features</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-how-it-works">How It Works</a>
              <a href="#sustainability" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-sustainability">Sustainability</a>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" asChild data-testid="button-login">
                <a href="/api/login">Log In</a>
              </Button>
              <Button asChild data-testid="button-get-started">
                <a href="/api/login">Get Started</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="gap-1" data-testid="badge-hero-ai">
                  <Sparkles className="w-3 h-3" />
                  AI-Powered Product Identity
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                  Digital Product Passports for the{" "}
                  <span className="text-primary">Circular Economy</span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-xl">
                  Transform how you manage product identity, sustainability compliance, 
                  and supply chain traceability with AI-powered Digital Product Passports.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild data-testid="button-hero-start">
                  <a href="/api/login" className="gap-2">
                    Start Free Trial
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild data-testid="button-hero-demo">
                  <Link href="/product/demo">View Demo Passport</Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="badge-eu-dpp">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>EU DPP Ready</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="badge-soc2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>SOC 2 Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="badge-gdpr">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>GDPR Ready</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-card border rounded-lg p-6 shadow-lg">
                <div className="absolute -top-3 -right-3">
                  <Badge className="gap-1">
                    <Zap className="w-3 h-3" />
                    Live Preview
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-sm text-muted-foreground">Product Passport</p>
                      <h3 className="text-lg font-semibold">Sustainable Backpack Pro</h3>
                    </div>
                    <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Carbon Footprint</p>
                      <p className="text-2xl font-bold text-primary" data-testid="text-preview-carbon">12.5 kg</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Repairability</p>
                      <p className="text-2xl font-bold text-primary" data-testid="text-preview-repairability">8.5/10</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Recycled Content</p>
                      <p className="text-2xl font-bold" data-testid="text-preview-recycled">85%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Warranty</p>
                      <p className="text-2xl font-bold" data-testid="text-preview-warranty">5 Years</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2" data-testid="trust-traceability">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                          <Truck className="w-3 h-3 text-primary" />
                        </div>
                        <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                          <Shield className="w-3 h-3 text-primary" />
                        </div>
                        <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                          <Leaf className="w-3 h-3 text-primary" />
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">Full traceability enabled</span>
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
            <Badge variant="secondary" className="mb-4" data-testid="badge-features">Platform Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything You Need for Product Identity
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete platform for creating, managing, and sharing Digital Product Passports 
              that meet EU regulations and drive sustainable business practices.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-card" data-testid="card-feature-qr">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">QR-Based Identity</h3>
                <p className="text-muted-foreground">
                  Generate unique QR codes for every product, linking directly to comprehensive 
                  Digital Product Passports accessible by consumers and partners.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card" data-testid="card-feature-traceability">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Supply Chain Traceability</h3>
                <p className="text-muted-foreground">
                  Track every step of your product's journey from manufacturing to end-of-life 
                  with our event-driven traceability system.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card" data-testid="card-feature-ai">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">AI-Powered Insights</h3>
                <p className="text-muted-foreground">
                  Get intelligent sustainability scores, repair recommendations, and 
                  circularity insights powered by advanced AI models.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card" data-testid="card-feature-sustainability">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Sustainability Metrics</h3>
                <p className="text-muted-foreground">
                  Capture and display carbon footprint, material composition, recyclability, 
                  and repairability scores for full transparency.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card" data-testid="card-feature-security">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Authentication & Security</h3>
                <p className="text-muted-foreground">
                  Verify product authenticity and combat counterfeiting with cryptographic 
                  identity verification and audit trails.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card" data-testid="card-feature-recycling">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Recycle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">End-of-Life Guidance</h3>
                <p className="text-muted-foreground">
                  Provide clear recycling instructions and takeback program information 
                  to support circular economy initiatives.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4" data-testid="badge-how-it-works">Simple Process</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get your Digital Product Passports up and running in minutes, not months.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4" data-testid="step-create-products">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground mx-auto flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Create Products</h3>
              <p className="text-muted-foreground">
                Add your products with sustainability data, materials, warranty info, 
                and recycling instructions through our intuitive dashboard.
              </p>
            </div>

            <div className="text-center space-y-4" data-testid="step-generate-qr">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground mx-auto flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Generate QR Codes</h3>
              <p className="text-muted-foreground">
                Automatic QR code generation links each product to its unique Digital Product 
                Passport, ready for printing on packaging or labels.
              </p>
            </div>

            <div className="text-center space-y-4" data-testid="step-share-track">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground mx-auto flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Share & Track</h3>
              <p className="text-muted-foreground">
                Consumers scan QR codes to access passport data. Track engagement, 
                monitor supply chain events, and gather sustainability insights.
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
                Ready for Digital Product Passport Regulations
              </h2>
              <p className="text-lg text-muted-foreground">
                The EU Digital Product Passport regulation is coming. Be prepared with a platform 
                that meets all requirements for product transparency, sustainability reporting, 
                and circularity tracking.
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

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Ready to Transform Your Product Identity?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join forward-thinking brands using Photonictag to build trust, ensure compliance, 
            and lead the transition to a circular economy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild data-testid="button-cta-start">
              <a href="/api/login" className="gap-2">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-cta-contact">
              <a href="mailto:hello@photonictag.com">Contact Sales</a>
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
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-pricing">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-api">API</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-integrations">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-docs">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-blog">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-case-studies">Case Studies</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-dpp-guide">EU DPP Guide</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-about">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-careers">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-press">Press</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-contact">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-privacy">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-terms">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-cookies">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-gdpr">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2" data-testid="footer-logo">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <QrCode className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Photonictag</span>
            </div>
            <p className="text-sm text-muted-foreground" data-testid="footer-copyright">
              2025 Photonictag. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
