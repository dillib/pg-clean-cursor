import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import {
  QrCode, Shield, Cpu, Leaf, ArrowRight, CheckCircle, Globe,
  BarChart3, Lock, Zap, Clock, AlertTriangle,
  FileText, RefreshCw, Smartphone, Database, Calendar, Download, Loader2, Star, Users, TrendingUp
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

const platformCapabilities = [
  {
    icon: QrCode,
    title: "Digital Product Passports",
    description: "EU ESPR-compliant product identity with tamper-proof QR codes linking physical products to their complete digital profile — materials, origin, certifications, and lifecycle data.",
  },
  {
    icon: Shield,
    title: "Anti-Counterfeiting & Authentication",
    description: "Physics-rooted identity signatures that cannot be forged, cloned, or reproduced. Every product carries a verifiable proof of authenticity accessible via any smartphone.",
  },
  {
    icon: Cpu,
    title: "IoT & Smart Tagging",
    description: "NFC, RFID, and BLE device management for real-time product tracking. Register tags, capture sensor readings, and monitor product conditions throughout the supply chain.",
  },
  {
    icon: Leaf,
    title: "AI Sustainability Intelligence",
    description: "Automated carbon footprint scoring, circularity assessment (A+ to F), repair guides, and risk analysis. AI-generated insights turn raw product data into actionable sustainability metrics.",
  },
  {
    icon: Database,
    title: "SAP & ERP Integration",
    description: "Enterprise-grade bidirectional sync with SAP S/4HANA, ECC, and Business One. Automated field mapping with no manual data entry required.",
  },
  {
    icon: BarChart3,
    title: "Supply Chain Traceability",
    description: "End-to-end visibility from raw material sourcing to end-of-life recycling. Full audit trail for every product interaction, ownership transfer, and compliance check.",
  },
];

const complianceTimeline = [
  { date: "Feb 18, 2027", category: "Batteries", status: "critical", description: "Industrial and EV batteries require Digital Product Passports under EU Battery Regulation" },
  { date: "2028", category: "Textiles & Electronics", status: "upcoming", description: "Textiles, electronics, and ICT products must carry DPPs with material composition and repairability data" },
  { date: "2029", category: "Furniture & Construction", status: "planned", description: "Furniture, construction materials, and chemicals require full lifecycle documentation" },
  { date: "2030", category: "All Product Categories", status: "planned", description: "Universal DPP mandate across all product categories under ESPR (EU) 2024/1781" },
];

const differentiators = [
  { title: "Go live in weeks", description: "Not months. Pre-built templates, automated data mapping, and guided onboarding get you compliant fast.", icon: Clock },
  { title: "Physics-rooted identity", description: "Beyond simple QR codes — tamper-proof signatures grounded in physical properties that cannot be replicated.", icon: Lock },
  { title: "SAP-native integration", description: "Bidirectional sync with existing SAP material master data. No rip-and-replace. Works alongside your current ERP.", icon: RefreshCw },
  { title: "AI-powered automation", description: "Sustainability scoring, repair guides, risk assessment, and compliance checks — generated automatically from your product data.", icon: Zap },
  { title: "Consumer-facing transparency", description: "Every product gets a public-facing scan page with DPP data, accessible via QR code on any mobile device.", icon: Smartphone },
  { title: "Enterprise-grade security", description: "Role-based access control, encrypted sessions, audit logging, and GDPR-compliant data handling across all operations.", icon: Shield },
];

const targetIndustries = [
  { name: "Batteries & Energy Storage", examples: "Industrial batteries, EV batteries, portable power", deadline: "Feb 2027" },
  { name: "Textiles & Fashion", examples: "Apparel, technical textiles, footwear, accessories", deadline: "2028" },
  { name: "Consumer Electronics", examples: "Smartphones, laptops, IoT devices, wearables", deadline: "2028" },
  { name: "Automotive & EV", examples: "EV components, parts, accessories", deadline: "2028" },
  { name: "Furniture & Home", examples: "Office furniture, home furnishings, mattresses", deadline: "2029" },
  { name: "Industrial Packaging", examples: "Cardboard, biodegradable packaging, reusable containers", deadline: "2029" },
];

const outcomes = [
  { metric: "< 6 weeks", label: "Average time to first DPP live", icon: Clock },
  { metric: "100%", label: "ESPR field coverage out of the box", icon: CheckCircle },
  { metric: "€100K+", label: "Per-violation penalties avoided", icon: Shield },
  { metric: "3 ERP types", label: "SAP S/4HANA, ECC, Business One", icon: Database },
];

export default function Presentation() {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPPT = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/export/presentation.pptx");
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "PhotonicTag_Marketing_Presentation.pptx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PPT download error:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Platform Presentation - PhotonicTag | EU Digital Product Passport</title>
        <meta name="description" content="PhotonicTag platform presentation. AI-powered Digital Product Passports for EU ESPR compliance. SAP integration, IoT tagging, sustainability intelligence." />
        <meta property="og:title" content="PhotonicTag - Platform Presentation" />
        <meta property="og:description" content="Enterprise Digital Product Passport platform. EU ESPR compliance, SAP integration, AI sustainability intelligence." />
      </Helmet>
      <PublicNav />

      {/* Hero */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4" data-testid="badge-presentation">Platform Overview</Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6" data-testid="text-presentation-title">
            PhotonicTag
          </h1>
          <p className="text-2xl sm:text-3xl font-medium text-primary mb-4">
            Identity, at the speed of light.
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            An AI-powered Digital Product Passport platform that transforms product identity into a physics-rooted,
            tamper-proof signature — bridging physical and digital worlds for enhanced trust, traceability, and transparency
            under EU ESPR Regulation (EU) 2024/1781.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild data-testid="button-presentation-demo">
              <a href="https://calendar.app.google/Aa9nfUnJiZvcjXi28" target="_blank" rel="noopener noreferrer" className="gap-2">
                <Calendar className="w-4 h-4" />
                Schedule a Demo
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-presentation-docs">
              <Link href="/docs" className="gap-2">
                <FileText className="w-4 h-4" />
                Documentation
              </Link>
            </Button>
            <Button size="lg" variant="outline" onClick={handleDownloadPPT} disabled={downloading} data-testid="button-download-ppt" className="gap-2">
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download PPT
            </Button>
          </div>
        </div>
      </section>

      {/* Key outcomes */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {outcomes.map((o, i) => (
              <div key={i} className="text-center" data-testid={`outcome-${i}`}>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <o.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-primary">{o.metric}</p>
                <p className="text-xs text-muted-foreground mt-1">{o.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Timeline */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3" data-testid="text-problem-title">The Regulatory Challenge</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The European Ecodesign for Sustainable Products Regulation (ESPR) mandates Digital Product Passports across all product categories by 2030. Non-compliance carries penalties up to €100,000+ per violation.
            </p>
          </div>
          <div className="grid gap-4">
            {complianceTimeline.map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-lg border bg-card" data-testid={`timeline-item-${i}`}>
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${item.status === "critical" ? "bg-red-100 dark:bg-red-900/30" : "bg-muted"}`}>
                  {item.status === "critical" ? (
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-semibold">{item.date}</span>
                    <Badge variant={item.status === "critical" ? "destructive" : "secondary"}>{item.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3" data-testid="text-capabilities-title">Platform Capabilities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Six integrated modules covering the full Digital Product Passport lifecycle — from product creation and identity management to supply chain traceability and end-of-life circularity.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformCapabilities.map((cap, i) => (
              <Card key={i} className="border bg-card" data-testid={`capability-card-${i}`}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <cap.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{cap.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{cap.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why PhotonicTag */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3" data-testid="text-differentiators-title">Why PhotonicTag</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Purpose-built for EU DPP compliance with enterprise integration capabilities that work alongside existing infrastructure.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {differentiators.map((d, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-lg border bg-card" data-testid={`differentiator-${i}`}>
                <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <d.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{d.title}</h3>
                  <p className="text-sm text-muted-foreground">{d.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Industries */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30 border-t">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3" data-testid="text-industries-title">Industries We Serve</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pre-configured compliance schemas and product templates for every industry affected by the ESPR phased rollout.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {targetIndustries.map((ind, i) => (
              <div key={i} className="p-5 rounded-lg border bg-card" data-testid={`industry-card-${i}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{ind.name}</h3>
                  <Badge variant="outline" className="text-xs">{ind.deadline}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{ind.examples}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From onboarding to your first live Digital Product Passport in as little as two weeks.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Connect", desc: "Sync your SAP or ERP system. Import existing product data automatically — no manual re-entry.", icon: Database },
              { step: "2", title: "Map", desc: "Our AI maps your product fields to EU ESPR requirements. Fill gaps with guided data entry.", icon: Zap },
              { step: "3", title: "Certify", desc: "Generate QR-linked Digital Product Passports with tamper-proof identity signatures for every product.", icon: QrCode },
              { step: "4", title: "Monitor", desc: "Track compliance status, consumer scans, and sustainability scores across your entire product catalogue.", icon: TrendingUp },
            ].map((s, i) => (
              <div key={i} className="text-center" data-testid={`step-${i}`}>
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30 border-t">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Built for Enterprise Confidence</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Security, compliance, and reliability at every layer of the platform.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "GDPR Compliant",
                points: ["Encrypted session management", "Role-based access control", "Full audit trail on all operations", "Data sovereignty options"],
              },
              {
                icon: Globe,
                title: "EU Regulation Ready",
                points: ["ESPR (EU) 2024/1781 full coverage", "EU Battery Regulation 2023/1542", "REACH / SCIP substance tracking", "CE marking & EPR registration"],
              },
              {
                icon: Users,
                title: "Enterprise Support",
                points: ["Dedicated onboarding team", "SAP integration consulting", "Custom field mapping assistance", "Priority technical support"],
              },
            ].map((col, i) => (
              <div key={i} className="p-6 rounded-lg border bg-card" data-testid={`trust-card-${i}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <col.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{col.title}</h3>
                </div>
                <ul className="space-y-2">
                  {col.points.map((p, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">Get Started</Badge>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to get compliant?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Schedule a personalized demo to see how PhotonicTag can help your organization meet EU DPP requirements ahead of the deadline.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild data-testid="button-presentation-cta-demo">
              <a href="https://calendar.app.google/Aa9nfUnJiZvcjXi28" target="_blank" rel="noopener noreferrer" className="gap-2">
                <Calendar className="w-4 h-4" />
                Schedule a Demo
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-presentation-cta-contact">
              <Link href="/contact" className="gap-2">
                <ArrowRight className="w-4 h-4" />
                Contact Sales
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
