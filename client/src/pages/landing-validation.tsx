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
  ShieldCheck,
  Zap,
  Award,
  HeadphonesIcon,
  Users
} from "lucide-react";
import { Link } from "wouter";
import { useCurrency } from "@/hooks/use-currency";

export default function LandingValidation() {
  const { symbol } = useCurrency();
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>PhotonicTag — EU Digital Product Passport Compliance Platform</title>
        <meta name="description" content="EU Digital Product Passports (DPP) are mandatory starting 2027. PhotonicTag gets you compliant in weeks — with AI insights, tamper-proof QR identity, and SAP integration. ESPR 2024/1781 ready." />
        <meta property="og:title" content="PhotonicTag — Turn EU Compliance Into a Competitive Edge" />
        <meta property="og:description" content="Digital Product Passports for EU ESPR compliance. Avoid €100K+ penalties. SAP integration. Live in weeks." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="fixed top-0 left-0 right-0 z-50">
        <PublicNav />
      </div>

      {/* ── HERO ── */}
      <section className="relative pt-36 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/8 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[32rem] h-[32rem] bg-primary/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <Badge variant="destructive" className="gap-1.5 mb-8 px-3 py-1" data-testid="badge-deadline">
            <AlertTriangle className="w-3.5 h-3.5" />
            Battery Passport Deadline: February 18, 2027
          </Badge>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
            data-testid="text-hero-title"
          >
            Every Product Deserves
            <br />
            <span className="text-primary">a Verified Identity.</span>
          </h1>

          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed"
            data-testid="text-hero-subtitle"
          >
            EU Digital Product Passports are mandatory under ESPR 2024/1781 — non-compliance means
            fines up to <strong className="text-foreground">€100,000+ per violation</strong> and EU market access restrictions.
          </p>
          <p className="text-base text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            PhotonicTag gets you compliant in weeks — with AI-powered sustainability scoring, tamper-proof product identity, and native SAP integration.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Button size="lg" asChild data-testid="button-hero-demo">
              <Link href="/book-demo" className="gap-2">
                <Calendar className="w-4 h-4" />
                Book a Demo
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-hero-see-demo">
              <Link href="/scan/demo" className="gap-2">
                <QrCode className="w-4 h-4" />
                See a Live Passport
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-12">
            <div className="flex items-center gap-2" data-testid="badge-eu-ready">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>EU ESPR 2024/1781 Ready</span>
            </div>
            <div className="flex items-center gap-2" data-testid="badge-sap">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>SAP S/4HANA, ECC & Business One</span>
            </div>
            <div className="flex items-center gap-2" data-testid="badge-ai">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>5 AI Sustainability Modules</span>
            </div>
            <div className="flex items-center gap-2" data-testid="badge-live">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Go Live in 4–6 Weeks</span>
            </div>
          </div>

          {/* Key metrics strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border" data-testid="metrics-strip">
            <div className="bg-background px-5 py-4 text-center">
              <p className="text-2xl font-bold text-primary leading-none mb-1">Feb 2027</p>
              <p className="text-xs text-muted-foreground">First DPP deadline</p>
            </div>
            <div className="bg-background px-5 py-4 text-center">
              <p className="text-2xl font-bold text-primary leading-none mb-1">€100K+</p>
              <p className="text-xs text-muted-foreground">Per violation fine</p>
            </div>
            <div className="bg-background px-5 py-4 text-center">
              <p className="text-2xl font-bold text-primary leading-none mb-1">4–6 wks</p>
              <p className="text-xs text-muted-foreground">Average go-live time</p>
            </div>
            <div className="bg-background px-5 py-4 text-center">
              <p className="text-2xl font-bold text-primary leading-none mb-1">99.9%</p>
              <p className="text-xs text-muted-foreground">Platform uptime SLA</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODULES ── */}
      <div className="bg-muted/30 border-y">
        <ModulesSection />
      </div>

      {/* ── COMPLIANCE TIMELINE ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y" data-testid="section-dpp-timeline">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 gap-1.5">
              <Clock className="w-3 h-3" />
              ESPR Regulation (EU) 2024/1781
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-timeline-title">
              Your Compliance Clock Is Running
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              DPP mandates are rolling out by industry. Know your deadline — and get ahead of it.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-border hidden md:block" />
            <div className="space-y-8 md:space-y-12">

              <div className="relative flex flex-col md:flex-row md:items-center gap-4" data-testid="timeline-item-batteries">
                <div className="md:w-1/2 md:text-right md:pr-8">
                  <Badge variant="destructive" className="mb-2">Urgent — Act Now</Badge>
                  <h3 className="font-semibold text-lg">Batteries & EV Components</h3>
                  <p className="text-sm text-muted-foreground">Industrial, EV, and portable batteries above 2 kWh. Full lifecycle data, carbon footprint, recycled content, and supply chain disclosure required.</p>
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
                  <Badge variant="secondary" className="mb-2 bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800">Plan Now</Badge>
                  <h3 className="font-semibold text-lg">Textiles & Consumer Electronics</h3>
                  <p className="text-sm text-muted-foreground">Clothing, footwear, smartphones, laptops, and wearables. Material composition, repairability scores, and sustainability data required.</p>
                </div>
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-amber-500 text-white items-center justify-center z-10">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="md:w-1/2 md:pl-8">
                  <Card className="border-amber-500/30 bg-amber-500/5">
                    <CardContent className="p-4">
                      <p className="font-bold text-amber-600 dark:text-amber-400 text-lg">Late 2027 – 2028</p>
                      <p className="text-xs text-muted-foreground mt-1">ESPR delegated acts in preparation</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="relative flex flex-col md:flex-row md:items-center gap-4" data-testid="timeline-item-packaging">
                <div className="md:w-1/2 md:text-right md:pr-8">
                  <Badge variant="secondary" className="mb-2">Upcoming</Badge>
                  <h3 className="font-semibold text-lg">Furniture, Packaging & Construction</h3>
                  <p className="text-sm text-muted-foreground">Office furniture, packaging materials, and building products. Recycling instructions, material sourcing, and full circularity data required.</p>
                </div>
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary/80 text-primary-foreground items-center justify-center z-10">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="md:w-1/2 md:pl-8">
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-bold text-lg">2028 – 2029</p>
                      <p className="text-xs text-muted-foreground mt-1">Phased rollout under ESPR delegated acts</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="relative flex flex-col md:flex-row md:items-center gap-4" data-testid="timeline-item-universal">
                <div className="md:w-1/2 md:text-right md:pr-8">
                  <Badge variant="secondary" className="mb-2">All Industries</Badge>
                  <h3 className="font-semibold text-lg">Universal DPP Mandate</h3>
                  <p className="text-sm text-muted-foreground">Every product category sold in the EU. Construction materials, automotive parts, chemicals, and all industrial goods included.</p>
                </div>
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-muted text-muted-foreground items-center justify-center z-10">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="md:w-1/2 md:pl-8">
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-bold text-lg">By 2030</p>
                      <p className="text-xs text-muted-foreground mt-1">Complete ESPR implementation — all categories</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild data-testid="button-timeline-demo">
              <Link href="/book-demo" className="gap-2">
                <Calendar className="w-4 h-4" />
                Check Your Specific Deadline
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-destructive/5 border-y">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="destructive" className="mb-4 gap-1.5" data-testid="badge-problem">
              <AlertTriangle className="w-3 h-3" />
              Non-Compliance Risk
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-problem-title">
              The Clock Is Ticking.<br className="hidden sm:block" /> Are You Ready?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The EU is not extending deadlines. Enforcement is active. Companies that wait until the last quarter won't have time to comply.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-destructive/20" data-testid="card-problem-1">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-md bg-destructive/10 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-semibold mb-2">Deadlines Are Non-Negotiable</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Battery passports: <strong className="text-foreground">February 18, 2027</strong>. Textiles & electronics: late 2027. Full rollout by 2030. Implementation takes 4–6 weeks minimum — that's time you can't afford to lose.
                </p>
              </CardContent>
            </Card>

            <Card className="border-destructive/20" data-testid="card-problem-2">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-md bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-semibold mb-2">Penalties Compound Fast</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Fines of <strong className="text-foreground">€10,000–€100,000+ per violation</strong>, per product. Non-compliant goods face EU market access blocks, forced recalls, and lasting reputational damage with retailers and consumers.
                </p>
              </CardContent>
            </Card>

            <Card className="border-destructive/20" data-testid="card-problem-3">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-md bg-destructive/10 flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-semibold mb-2">Data Collection Is Harder Than It Looks</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Carbon footprint, material origins, repairability scores, certifications — structured across every SKU, accessible to regulators and consumers. Most teams underestimate how complex this data operation really is.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 gap-1.5">
              <Zap className="w-3 h-3" />
              The PhotonicTag Platform
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-solution-title">
              One Platform. Complete DPP Compliance.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              PhotonicTag handles everything — connecting your SAP data, generating AI-enriched passports, issuing tamper-proof QR codes, and publishing consumer-ready scan pages.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4" data-testid="feature-qr">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <QrCode className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Tamper-Proof Digital Identity</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every product gets a physics-rooted, unique identity. Consumers scan to verify authenticity and view full DPP data instantly — in any language, on any device.
                </p>
              </div>
            </div>

            <div className="flex gap-4" data-testid="feature-compliance">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Pre-Built for EU ESPR Compliance</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Templates pre-configured for batteries, textiles, and electronics. Every mandatory DPP data field is included — no regulatory guesswork required.
                </p>
              </div>
            </div>

            <div className="flex gap-4" data-testid="feature-sap">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Native SAP & ERP Integration</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Bidirectional sync with SAP S/4HANA, ECC, and Business One. Your product data flows directly into compliant passports — no manual re-entry.
                </p>
              </div>
            </div>

            <div className="flex gap-4" data-testid="feature-ai">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">AI Sustainability Intelligence</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Automated carbon scoring, A+ to F circularity grades, repair guides, and risk assessments — generated from your existing product data, with no manual effort.
                </p>
              </div>
            </div>

            <div className="flex gap-4" data-testid="feature-fast">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Live in Weeks, Not Months</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Start with a POC in 1–2 weeks. Full enterprise deployment with SAP integration in 4–6 weeks — with a dedicated onboarding lead the whole way through.
                </p>
              </div>
            </div>

            <div className="flex gap-4" data-testid="feature-consumer">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Consumer Transparency at Scale</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every product gets a mobile-optimized public scan page — accessible via QR code anywhere in the world, instantly proving product authenticity and sustainability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 border-y" data-testid="section-how-it-works">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-how-it-works-title">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four steps from your first product to full EU compliance — with your team trained and your SAP connected.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center" data-testid="step-connect">
              <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-base font-semibold mb-2">Connect</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Integrate SAP, ERP, or import via Excel. Product data maps automatically to DPP categories.
              </p>
            </div>

            <div className="text-center" data-testid="step-enrich">
              <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-base font-semibold mb-2">Enrich</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI generates sustainability scores, circularity grades, repair guides, and fills data gaps automatically.
              </p>
            </div>

            <div className="text-center" data-testid="step-verify">
              <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-base font-semibold mb-2">Verify</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tamper-proof digital identities are created. Unique QR codes link every physical product to its passport.
              </p>
            </div>

            <div className="text-center" data-testid="step-deploy">
              <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-base font-semibold mb-2">Deploy</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Publish consumer scan pages, sync back to SAP, and enable real-time IoT tracking across your supply chain.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" asChild data-testid="button-how-it-works-cta">
              <Link href="/docs" className="gap-2">
                Read the Documentation
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── TRUST / COMPLIANCE STANDARDS ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y" data-testid="section-trust">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-trust-title">
              Built for Enterprise. Trusted for Compliance.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Security, data sovereignty, and regulatory alignment are not afterthoughts — they're built into every layer.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <Card data-testid="trust-gdpr">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-sm mb-1">GDPR Compliant</h4>
                <p className="text-xs text-muted-foreground">Full data privacy alignment with DPA templates</p>
              </CardContent>
            </Card>

            <Card data-testid="trust-espr">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <FileCheck className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-sm mb-1">ESPR 2024/1781</h4>
                <p className="text-xs text-muted-foreground">All mandatory DPP fields pre-configured</p>
              </CardContent>
            </Card>

            <Card data-testid="trust-encryption">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-sm mb-1">End-to-End Encrypted</h4>
                <p className="text-xs text-muted-foreground">Enterprise-grade security & audit trail</p>
              </CardContent>
            </Card>

            <Card data-testid="trust-global">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-sm mb-1">EU Data Sovereignty</h4>
                <p className="text-xs text-muted-foreground">Data hosted and processed within the EU</p>
              </CardContent>
            </Card>
          </div>

          {/* Compliance certifications strip */}
          <div className="mt-10 rounded-xl border bg-muted/40 px-8 py-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center mb-4">Compliance & Standards Alignment</p>
            <div className="flex flex-wrap justify-around gap-6 text-center">
              <div>
                <p className="text-sm font-semibold">ESPR 2024/1781</p>
                <p className="text-xs text-muted-foreground mt-0.5">EU DPP Framework</p>
              </div>
              <div>
                <p className="text-sm font-semibold">GDPR 2016/679</p>
                <p className="text-xs text-muted-foreground mt-0.5">Data Privacy</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Battery Reg. 2023/1542</p>
                <p className="text-xs text-muted-foreground mt-0.5">EU Battery Passport</p>
              </div>
              <div>
                <p className="text-sm font-semibold">ISO/IEC 27001</p>
                <p className="text-xs text-muted-foreground mt-0.5">Security Framework</p>
              </div>
              <div>
                <p className="text-sm font-semibold">GS1 Digital Link</p>
                <p className="text-xs text-muted-foreground mt-0.5">QR Standard</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 border-y">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-industries-title">
              Industries We Serve
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Purpose-built for every sector covered by EU DPP mandates — now and as the regulation expands.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="text-sm py-2 px-4">Batteries & Energy Storage</Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">Textiles & Fashion</Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">Consumer Electronics</Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">Automotive & EV Components</Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">Industrial Packaging</Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">Furniture & Home Goods</Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">Construction Materials</Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">Chemicals & Pharmaceuticals</Badge>
          </div>
        </div>
      </section>

      {/* ── WHAT CUSTOMERS GET ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              What You Get From Day One
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every customer gets a dedicated onboarding experience, not just platform access.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card data-testid="value-onboarding">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Dedicated Onboarding Lead</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A named contact guides your SAP connection, data mapping, and go-live from week one to handover.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="value-training">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Team Training & Documentation</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Live training sessions, self-paced documentation, and a knowledge base covering every DPP workflow.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="value-support">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <HeadphonesIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Ongoing Support SLA</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  From email support with 48h SLA on Starter to a 4-hour phone SLA and dedicated account manager on Enterprise.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#FFD400]">

        <div className="relative max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-black/15 text-black/80 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 bg-black/60 rounded-full animate-pulse" />
            Start This Week
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-black mb-5 leading-tight" data-testid="text-cta-title">
            Get EU Compliant<br className="hidden sm:block" /> Before Your Deadline.
          </h2>

          <p className="text-lg text-black/80 mb-4 leading-relaxed max-w-2xl mx-auto">
            The brands that move now will lead on consumer trust, retailer preference, and regulatory confidence — while competitors scramble.
          </p>

          <p className="text-sm text-black/60 mb-10 max-w-xl mx-auto">
            Start with a POC from{" "}
            <strong className="text-black font-bold">{symbol}499/month</strong>.{" "}
            No long-term commitment. Full credits apply when you upgrade.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button
              size="lg"
              className="bg-black text-white hover:bg-black/85 font-semibold gap-2"
              asChild
              data-testid="button-cta-demo"
            >
              <Link href="/book-demo">
                <Calendar className="w-4 h-4" />
                Book a Demo
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-transparent text-black border-2 border-black/35 hover:border-black/60 hover:bg-black/8 font-medium gap-2"
              asChild
              data-testid="button-cta-contact"
            >
              <Link href="/contact">
                Talk to Sales
              </Link>
            </Button>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-black/70">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-black/70 shrink-0" />
              <span>No long-term contract</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-black/20" />
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-black/70 shrink-0" />
              <span>Dedicated onboarding lead</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-black/20" />
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-black/70 shrink-0" />
              <span>Live in 4–6 weeks</span>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
