import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, ArrowRight, Calculator, Sparkles, Building2, Package, Activity, QrCode, Shield, Brain, AlertTriangle, TrendingUp, Zap, Database, Users, Clock } from "lucide-react";
import { Link } from "wouter";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

const platformTiers = [
  {
    name: "Free",
    price: 0,
    description: "Get started with DPP compliance before EU deadlines",
    features: [
      "Up to 100 product identities",
      "Basic admin dashboard",
      "QR code generation",
      "Public scan pages",
      "Community support",
      "EU DPP compliance templates",
    ],
    productLimit: 100,
    popular: false,
    cta: "Start Free",
  },
  {
    name: "Starter",
    price: 99,
    description: "For small brands scaling their digital product passports",
    features: [
      "Up to 1,000 product identities",
      "Full admin dashboard",
      "API access",
      "Basic analytics",
      "1 team member",
      "Email support",
      "QR code generation",
      "Supply chain basics",
    ],
    productLimit: 1000,
    popular: false,
    cta: "Start Free Trial",
  },
  {
    name: "Growth",
    price: 499,
    description: "For growing businesses with advanced traceability needs",
    features: [
      "Up to 25,000 product identities",
      "Advanced analytics dashboard",
      "Full API access",
      "3 team members",
      "Priority support",
      "Custom branding",
      "Full supply chain tracking",
      "Basic AI insights included",
      "IoT device integration",
    ],
    productLimit: 25000,
    popular: true,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    price: 2000,
    description: "For large organizations with SAP and ERP integration needs",
    features: [
      "Unlimited product identities",
      "SAP S/4HANA integration",
      "ERP bidirectional sync",
      "Dedicated account manager",
      "Unlimited team members",
      "SLA guarantee (99.9%)",
      "On-premise option",
      "Full AI Intelligence suite",
      "Custom compliance reporting",
      "Advanced security & audit logs",
    ],
    productLimit: null,
    popular: false,
    cta: "Contact Sales",
  },
];

const aiAddOns = [
  { name: "Small Brand", price: 99, description: "Basic AI sustainability scoring" },
  { name: "Mid-Market", price: 499, description: "Full AI analysis suite" },
  { name: "Enterprise", price: 2000, description: "Custom AI models & API" },
];

const usageRates = {
  identityHighVolume: { min: 0.02, max: 0.10, label: "High-volume manufacturers" },
  identityLowVolume: { min: 0.25, max: 1.00, label: "Luxury & high-value goods" },
  traceabilityEvent: { min: 0.001, max: 0.01, label: "Per supply chain event" },
  authenticationScan: { min: 0.05, max: 0.25, label: "Per authentication scan" },
  scanBundle: { quantity: 10000, price: 500, label: "Scan bundle" },
};

function PricingCalculator() {
  const [tier, setTier] = useState<"free" | "starter" | "growth" | "enterprise">("growth");
  const [productVolume, setProductVolume] = useState(10000);
  const [isHighValue, setIsHighValue] = useState(false);
  const [aiAddOn, setAiAddOn] = useState<"none" | "small" | "mid" | "enterprise">("none");
  const [traceabilityEvents, setTraceabilityEvents] = useState(50000);
  const [authScans, setAuthScans] = useState(5000);
  const [isAnnual, setIsAnnual] = useState(true);

  const calculation = useMemo(() => {
    const tierPrices = { free: 0, starter: 99, growth: 499, enterprise: 2000 };
    const aiPrices = { none: 0, small: 99, mid: 499, enterprise: 2000 };
    const identityRate = isHighValue ? 0.50 : 0.05;
    const eventRate = 0.005;
    const scanRate = 0.10;

    const monthlyPlatform = tierPrices[tier];
    const monthlyAI = aiPrices[aiAddOn];
    const annualIdentities = productVolume * identityRate;
    const annualEvents = traceabilityEvents * eventRate;
    const annualScans = authScans * scanRate;

    const annualTotal = (monthlyPlatform + monthlyAI) * 12 + annualIdentities + annualEvents + annualScans;
    const monthlyEquivalent = annualTotal / 12;

    return {
      platform: monthlyPlatform * 12,
      ai: monthlyAI * 12,
      identities: annualIdentities,
      events: annualEvents,
      scans: annualScans,
      annualTotal,
      monthlyEquivalent,
      discount: isAnnual ? annualTotal * 0.20 : 0,
      finalTotal: isAnnual ? annualTotal * 0.80 : annualTotal,
    };
  }, [tier, productVolume, isHighValue, aiAddOn, traceabilityEvents, authScans, isAnnual]);

  return (
    <Card className="bg-card" data-testid="pricing-calculator">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          <CardTitle>Pricing Calculator</CardTitle>
        </div>
        <CardDescription>Estimate your annual investment based on your needs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Platform Tier</Label>
              <Tabs value={tier} onValueChange={(v) => setTier(v as typeof tier)}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="free" data-testid="calc-tier-free">Free</TabsTrigger>
                  <TabsTrigger value="starter" data-testid="calc-tier-starter">Starter</TabsTrigger>
                  <TabsTrigger value="growth" data-testid="calc-tier-growth">Growth</TabsTrigger>
                  <TabsTrigger value="enterprise" data-testid="calc-tier-enterprise">Enterprise</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Products per Year</Label>
                <span className="text-sm font-medium">{productVolume.toLocaleString()}</span>
              </div>
              <Slider
                value={[productVolume]}
                onValueChange={([v]) => setProductVolume(v)}
                min={100}
                max={1000000}
                step={100}
                data-testid="calc-products-slider"
              />
              <div className="flex items-center gap-2 pt-2">
                <Switch 
                  checked={isHighValue} 
                  onCheckedChange={setIsHighValue}
                  data-testid="calc-high-value-switch"
                />
                <Label className="text-sm">High-value/luxury products ($0.50 vs $0.05/unit)</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>AI Intelligence Add-On</Label>
              <Tabs value={aiAddOn} onValueChange={(v) => setAiAddOn(v as typeof aiAddOn)}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="none" data-testid="calc-ai-none">None</TabsTrigger>
                  <TabsTrigger value="small" data-testid="calc-ai-small">$99</TabsTrigger>
                  <TabsTrigger value="mid" data-testid="calc-ai-mid">$499</TabsTrigger>
                  <TabsTrigger value="enterprise" data-testid="calc-ai-enterprise">$2k</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Traceability Events/Year</Label>
                <span className="text-sm font-medium">{traceabilityEvents.toLocaleString()}</span>
              </div>
              <Slider
                value={[traceabilityEvents]}
                onValueChange={([v]) => setTraceabilityEvents(v)}
                min={0}
                max={1000000}
                step={1000}
                data-testid="calc-events-slider"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Authentication Scans/Year</Label>
                <span className="text-sm font-medium">{authScans.toLocaleString()}</span>
              </div>
              <Slider
                value={[authScans]}
                onValueChange={([v]) => setAuthScans(v)}
                min={0}
                max={100000}
                step={100}
                data-testid="calc-scans-slider"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Card className="bg-muted/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Platform ({tier})</span>
                  <span className="font-medium">${calculation.platform.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">AI Add-On</span>
                  <span className="font-medium">${calculation.ai.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Product Identities</span>
                  <span className="font-medium">${calculation.identities.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Traceability Events</span>
                  <span className="font-medium">${calculation.events.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Auth Scans</span>
                  <span className="font-medium">${calculation.scans.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Switch 
                      checked={isAnnual} 
                      onCheckedChange={setIsAnnual}
                      data-testid="calc-annual-switch"
                    />
                    <Label className="text-sm">Annual billing (20% discount)</Label>
                  </div>
                  {isAnnual && calculation.discount > 0 && (
                    <div className="flex items-center justify-between gap-2 text-primary">
                      <span className="text-sm">Annual Discount (20%)</span>
                      <span className="font-medium">-${calculation.discount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm opacity-80">Estimated Annual Investment</p>
                  <p className="text-4xl font-bold" data-testid="calc-total">${Math.round(calculation.finalTotal).toLocaleString()}</p>
                  <p className="text-sm opacity-80 mt-1">~${Math.round(calculation.finalTotal / 12).toLocaleString()}/month</p>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full gap-2" asChild data-testid="calc-cta">
              <Link href="/contact">
                Get Custom Quote
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" data-testid="text-pricing-title">
            Transparent, Usage-Based Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Pay for what you use. Our hybrid model combines predictable platform fees with usage-based pricing that scales with your business.
          </p>
        </div>

        {/* Value Anchoring - Compliance Penalties */}
        <section className="mb-16">
          <Card className="border-destructive/30 bg-destructive/10 dark:bg-destructive/5" data-testid="card-compliance-warning">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">EU DPP Non-Compliance Costs Far More</h3>
                  <p className="text-muted-foreground mb-4">
                    Starting 2027, EU regulations require Digital Product Passports for batteries, textiles, and electronics. 
                    Non-compliance penalties range from <span className="font-bold text-destructive">€10,000 to €100,000+ per violation</span>, 
                    plus potential market access restrictions.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-background" data-testid="stat-penalty">
                      <p className="text-2xl font-bold text-destructive">€10K+</p>
                      <p className="text-xs text-muted-foreground">Per violation fine</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-background" data-testid="stat-market-risk">
                      <p className="text-2xl font-bold text-destructive">100%</p>
                      <p className="text-xs text-muted-foreground">Market access risk</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-background" data-testid="stat-deadline-2027">
                      <p className="text-2xl font-bold text-primary">2027</p>
                      <p className="text-xs text-muted-foreground">Batteries deadline</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-background" data-testid="stat-deadline-2030">
                      <p className="text-2xl font-bold text-primary">2030</p>
                      <p className="text-xs text-muted-foreground">All products</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ROI Calculator Preview */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Your Return on Investment</h2>
            <p className="text-muted-foreground">PhotonicTag pays for itself through compliance savings and operational efficiency</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card data-testid="card-roi-compliance">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Avoid Compliance Penalties</h3>
                <p className="text-sm text-muted-foreground">Single violation fine exceeds 2+ years of PhotonicTag subscription</p>
                <div className="pt-2 border-t">
                  <p className="text-2xl font-bold text-primary">50-100x</p>
                  <p className="text-xs text-muted-foreground">ROI vs. penalty cost</p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-roi-efficiency">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Reduce Manual Work</h3>
                <p className="text-sm text-muted-foreground">Automate product data entry, traceability, and compliance reporting</p>
                <div className="pt-2 border-t">
                  <p className="text-2xl font-bold text-primary">80%</p>
                  <p className="text-xs text-muted-foreground">Time saved on compliance</p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-roi-sap">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">SAP Integration Savings</h3>
                <p className="text-sm text-muted-foreground">Bidirectional sync with SAP S/4HANA eliminates duplicate data entry</p>
                <div className="pt-2 border-t">
                  <p className="text-2xl font-bold text-primary">$150K+</p>
                  <p className="text-xs text-muted-foreground">Annual integration savings</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Platform Subscription</h2>
            <p className="text-muted-foreground">Choose your base tier for predictable monthly costs</p>
            <Badge variant="secondary" className="mt-2">Save 20% with annual billing</Badge>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformTiers.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
                data-testid={`card-plan-${plan.name.toLowerCase()}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>Most Popular</Badge>
                  </div>
                )}
                {plan.name === "Free" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="secondary" data-testid="badge-no-cc">No Credit Card</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-bold">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">${plan.price.toLocaleString()}{plan.name === "Enterprise" && "+"}</span>
                        <span className="text-muted-foreground">/mo</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full gap-2" 
                    variant={plan.popular ? "default" : plan.name === "Free" ? "secondary" : "outline"}
                    asChild
                    data-testid={`button-plan-${plan.name.toLowerCase()}`}
                  >
                    {plan.name === "Enterprise" ? (
                      <Link href="/contact">Contact Sales</Link>
                    ) : (
                      <a href="/api/login">
                        {plan.cta}
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Usage-Based Pricing</h2>
            <p className="text-muted-foreground">Scale costs with your actual usage</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card data-testid="card-usage-identity">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Product Identities</h3>
                <p className="text-sm text-muted-foreground">Digital Product Passport + QR code per product</p>
                <div className="pt-2 border-t space-y-1">
                  <p className="text-sm"><span className="font-bold text-primary">$0.02 - $0.10</span> high-volume</p>
                  <p className="text-sm"><span className="font-bold text-primary">$0.25 - $1.00</span> luxury goods</p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-usage-events">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Traceability Events</h3>
                <p className="text-sm text-muted-foreground">Every supply chain event tracked</p>
                <div className="pt-2 border-t">
                  <p className="text-sm"><span className="font-bold text-primary">$0.001 - $0.01</span> per event</p>
                  <p className="text-xs text-muted-foreground mt-1">Volume discounts for 10M+ events</p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-usage-scans">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Authentication Scans</h3>
                <p className="text-sm text-muted-foreground">Verify product authenticity</p>
                <div className="pt-2 border-t">
                  <p className="text-sm"><span className="font-bold text-primary">$0.05 - $0.25</span> per scan</p>
                  <p className="text-xs text-muted-foreground mt-1">Or bundle: 10,000 for $500</p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-usage-ai">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">AI Intelligence</h3>
                <p className="text-sm text-muted-foreground">Sustainability, repair, circularity insights</p>
                <div className="pt-2 border-t space-y-1">
                  <p className="text-sm"><span className="font-bold text-primary">$99/mo</span> small brands</p>
                  <p className="text-sm"><span className="font-bold text-primary">$499/mo</span> mid-market</p>
                  <p className="text-sm"><span className="font-bold text-primary">$2,000+/mo</span> enterprise</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-20">
          <PricingCalculator />
        </section>

        <section className="mb-20">
          <Card className="bg-muted/30 border-dashed" data-testid="card-enterprise-licensing">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold mb-2">Enterprise Licensing</h2>
                  <p className="text-muted-foreground mb-4">
                    For large manufacturers, marketplaces, or government organizations requiring custom solutions.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <Badge variant="secondary" className="gap-1">
                      <Check className="w-3 h-3" /> $50k - $500k/year
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Check className="w-3 h-3" /> Custom SLAs
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Check className="w-3 h-3" /> On-prem deployment
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Check className="w-3 h-3" /> Dedicated support
                    </Badge>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Button size="lg" asChild data-testid="button-enterprise-contact">
                    <Link href="/contact" className="gap-2">
                      Contact Sales
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-20 bg-muted/30 rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Example Annual Costs</h2>
            <p className="text-muted-foreground">See what real customers pay</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card data-testid="example-midsize">
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-2">Mid-Size Electronics Brand</Badge>
                <CardTitle>1M Products/Year</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Product Identities (1M x $0.05)</span>
                  <span className="font-medium">$50,000</span>
                </div>
                <div className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Growth Platform ($499/mo)</span>
                  <span className="font-medium">$6,000</span>
                </div>
                <div className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">AI Add-On ($499/mo)</span>
                  <span className="font-medium">$6,000</span>
                </div>
                <div className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Traceability Events</span>
                  <span className="font-medium">$10,000</span>
                </div>
                <div className="border-t pt-3 flex justify-between gap-2 font-bold">
                  <span>Total Annual</span>
                  <span className="text-primary">~$72,000</span>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="example-enterprise">
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-2">Large Enterprise</Badge>
                <CardTitle>10M Products/Year</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Product Identities (10M x $0.03)</span>
                  <span className="font-medium">$300,000</span>
                </div>
                <div className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Enterprise License</span>
                  <span className="font-medium">$150,000</span>
                </div>
                <div className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">AI Intelligence Suite</span>
                  <span className="font-medium">$24,000</span>
                </div>
                <div className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Traceability Events</span>
                  <span className="font-medium">$50,000</span>
                </div>
                <div className="border-t pt-3 flex justify-between gap-2 font-bold">
                  <span>Total Annual</span>
                  <span className="text-primary">~$524,000</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Competitive Comparison */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Why PhotonicTag?</h2>
            <p className="text-muted-foreground">See how we compare to alternatives</p>
          </div>
          <Card data-testid="card-comparison">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">Feature</th>
                      <th className="text-center p-4 font-semibold bg-primary/5">
                        <div className="flex flex-col items-center gap-1">
                          <Zap className="w-4 h-4 text-primary" />
                          <span>PhotonicTag</span>
                        </div>
                      </th>
                      <th className="text-center p-4 font-semibold text-muted-foreground">DIY / Spreadsheets</th>
                      <th className="text-center p-4 font-semibold text-muted-foreground">Legacy PLM</th>
                      <th className="text-center p-4 font-semibold text-muted-foreground">Generic QR</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4">EU DPP Compliance</td>
                      <td className="p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                      <td className="p-4 text-center text-muted-foreground">Manual</td>
                      <td className="p-4 text-center text-muted-foreground">Partial</td>
                      <td className="p-4 text-center text-muted-foreground">No</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">SAP Integration</td>
                      <td className="p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                      <td className="p-4 text-center text-muted-foreground">No</td>
                      <td className="p-4 text-center text-muted-foreground">$200K+ custom</td>
                      <td className="p-4 text-center text-muted-foreground">No</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">AI Insights</td>
                      <td className="p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                      <td className="p-4 text-center text-muted-foreground">No</td>
                      <td className="p-4 text-center text-muted-foreground">No</td>
                      <td className="p-4 text-center text-muted-foreground">No</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">IoT/NFC Support</td>
                      <td className="p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                      <td className="p-4 text-center text-muted-foreground">No</td>
                      <td className="p-4 text-center text-muted-foreground">Partial</td>
                      <td className="p-4 text-center text-muted-foreground">No</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Time to Deploy</td>
                      <td className="p-4 text-center bg-primary/5 font-semibold text-primary">Days</td>
                      <td className="p-4 text-center text-muted-foreground">Months</td>
                      <td className="p-4 text-center text-muted-foreground">6-12 months</td>
                      <td className="p-4 text-center text-muted-foreground">Weeks</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Free Tier</td>
                      <td className="p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-muted-foreground mx-auto" /></td>
                      <td className="p-4 text-center text-muted-foreground">No</td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-muted-foreground mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4">Annual Cost (Mid-size)</td>
                      <td className="p-4 text-center bg-primary/5 font-semibold text-primary">~$72K</td>
                      <td className="p-4 text-center text-muted-foreground">~$150K+ labor</td>
                      <td className="p-4 text-center text-muted-foreground">~$500K+</td>
                      <td className="p-4 text-center text-muted-foreground">~$20K (no compliance)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="text-center">
          <div className="bg-primary/5 rounded-lg p-8">
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Start free with 100 products. No credit card required. Our team is here to help you find the right plan.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild data-testid="button-start-trial">
                <a href="/api/login" className="gap-2">
                  Start Free
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-talk-sales">
                <Link href="/contact">Talk to Sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
