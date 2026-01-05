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
              <span className="text-xl font-bold tracking-tight">PhotonicTag</span>
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
                  Physics-Rooted Identity
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                  One Scan.{" "}
                  <span className="text-primary">Complete Trust.</span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-xl">
                  PhotonicTag creates tamper-proof Digital Product Passports that travel with your products from factory to consumer. 
                  Verify authenticity, track sustainability, and build customer trust — all with a single scan.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild data-testid="button-hero-start">
                  <a href="/api/login" className="gap-2">
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild data-testid="button-hero-demo">
                  <Link href="/scan/demo">View Demo Passport</Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="badge-eu-dpp">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>EU Passport Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="badge-soc2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Verified Security</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="badge-gdpr">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Privacy Protected</span>
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
                      <span className="text-sm text-muted-foreground">Complete journey illuminated</span>
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

      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4" data-testid="badge-how-it-works">From Label to Light</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Three Steps to Illuminate Your Products
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform product identity in minutes — creating tamper-proof signatures 
              that travel with your products through their entire lifecycle.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4" data-testid="step-create-products">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground mx-auto flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Define the Identity</h3>
              <p className="text-muted-foreground">
                Capture your product's complete story — materials, origins, sustainability data, 
                and lifecycle information through our intuitive dashboard.
              </p>
            </div>

            <div className="text-center space-y-4" data-testid="step-generate-qr">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground mx-auto flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Forge the Signature</h3>
              <p className="text-muted-foreground">
                Each product receives a unique, physics-rooted signature — a tamper-proof 
                QR code that cannot be forged, cloned, or manipulated.
              </p>
            </div>

            <div className="text-center space-y-4" data-testid="step-share-track">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground mx-auto flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Illuminate the Journey</h3>
              <p className="text-muted-foreground">
                Anyone can scan and verify. Track every interaction, monitor the supply chain, 
                and let the product tell its own authentic story.
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
