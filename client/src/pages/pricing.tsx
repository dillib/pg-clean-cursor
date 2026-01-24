import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Building2, Shield, AlertTriangle, Zap, Database, Clock, Calendar, Brain, Wifi, BarChart3, Package, Factory, Gem } from "lucide-react";
import { Link } from "wouter";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

const platformTiers = [
  {
    name: "Starter",
    price: 99,
    description: "For small brands getting started with DPP",
    features: [
      "Admin dashboard",
      "QR code generation",
      "Public scan pages",
      "API access",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Growth",
    price: 499,
    description: "For growing businesses with traceability needs",
    features: [
      "Everything in Starter",
      "Advanced analytics",
      "3 team members",
      "Priority support",
      "IoT device integration",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: null,
    description: "For large organizations with SAP/ERP needs",
    features: [
      "Everything in Growth",
      "SAP S/4HANA integration",
      "Unlimited team members",
      "Dedicated account manager",
      "SLA guarantee (99.9%)",
      "On-premise option",
    ],
    popular: false,
  },
];

const identityPricing = [
  {
    category: "Standard",
    icon: Factory,
    description: "High-volume, low-cost products",
    examples: "AA batteries, basic packaging, commodity textiles",
    pricing: "$0.01 - $0.05",
    unit: "per batch",
    note: "Recommended for commodities — one identity per manufacturing batch or lot",
  },
  {
    category: "Premium",
    icon: Package,
    description: "Mid-value electronics and goods",
    examples: "Consumer electronics, EV batteries, appliances",
    pricing: "$0.05 - $0.25",
    unit: "per product",
    note: "One identity per individual product",
  },
  {
    category: "Luxury",
    icon: Gem,
    description: "High-value, low-volume products",
    examples: "Watches, handbags, jewelry, designer goods",
    pricing: "$0.50 - $2.00",
    unit: "per product",
    note: "Enhanced authentication and provenance tracking",
  },
];

const valueFeatures = [
  {
    name: "SAP Integration",
    icon: Database,
    description: "Bidirectional sync with SAP S/4HANA. No middleware, no duplicate data entry.",
    tier: "Enterprise",
  },
  {
    name: "AI Insights",
    icon: Brain,
    description: "Sustainability scoring, repair guides, circularity analysis powered by AI.",
    tier: "Add-on",
  },
  {
    name: "IoT Tagging",
    icon: Wifi,
    description: "NFC, RFID, and BLE device integration for tap-to-scan product passports.",
    tier: "Growth+",
  },
  {
    name: "Supply Chain Tracking",
    icon: BarChart3,
    description: "Full traceability from raw materials to end consumer.",
    tier: "Growth+",
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" data-testid="text-pricing-title">
            Simple, Value-Based Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Platform fee + product identity cost based on your product type. No surprises.
          </p>
        </div>

        <section className="mb-12">
          <Card className="border-destructive/30 bg-destructive/5" data-testid="card-compliance-warning">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-1">EU DPP Deadline: 2027</h3>
                  <p className="text-sm text-muted-foreground">
                    Non-compliance penalties: <span className="font-semibold text-destructive">€10,000 - €100,000+ per violation</span>. 
                    PhotonicTag costs a fraction of one penalty.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Platform Plans</h2>
            <p className="text-muted-foreground">Monthly fee for features and support</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
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
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    {plan.price ? (
                      <>
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/mo</span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold">Custom</span>
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
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                    data-testid={`button-plan-${plan.name.toLowerCase()}`}
                  >
                    <Link href="/contact">
                      Contact Sales
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Product Identity Pricing</h2>
            <p className="text-muted-foreground">Pay based on your product type and volume</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {identityPricing.map((tier) => (
              <Card key={tier.category} data-testid={`card-identity-${tier.category.toLowerCase()}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <tier.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">{tier.category}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{tier.description}</p>
                  <p className="text-xs text-muted-foreground mb-4 italic">{tier.examples}</p>
                  <div className="border-t pt-4">
                    <p className="text-2xl font-bold text-primary">{tier.pricing}</p>
                    <p className="text-sm text-muted-foreground">{tier.unit}</p>
                    <p className="text-xs text-muted-foreground mt-2">{tier.note}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Volume discounts available. <Link href="/contact" className="text-primary underline">Contact us</Link> for custom pricing.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Value Features</h2>
            <p className="text-muted-foreground">What sets PhotonicTag apart</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {valueFeatures.map((feature) => (
              <Card key={feature.name}>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{feature.name}</h3>
                      <Badge variant="outline" className="text-xs">{feature.tier}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Your ROI</h2>
            <p className="text-muted-foreground">PhotonicTag pays for itself</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-3xl font-bold text-primary">50-100x</p>
                <p className="text-sm text-muted-foreground">ROI vs. one compliance penalty</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-3xl font-bold text-primary">80%</p>
                <p className="text-sm text-muted-foreground">Time saved on compliance</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-3xl font-bold text-primary">Days</p>
                <p className="text-sm text-muted-foreground">To deploy vs. months for legacy</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-16">
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-xl font-bold mb-2">Enterprise & High-Volume</h2>
                  <p className="text-muted-foreground">
                    Custom pricing for manufacturers with 1M+ products, on-premise needs, or complex ERP integrations.
                  </p>
                </div>
                <Button size="lg" asChild data-testid="button-enterprise-contact">
                  <Link href="/contact" className="gap-2">
                    Contact Sales
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="text-center">
          <div className="bg-primary/5 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-2">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              Talk to our team to find the right plan for your products.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild data-testid="button-contact-sales">
                <Link href="/contact" className="gap-2">
                  Contact Sales
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-book-demo">
                <a href="https://calendar.app.google/Aa9nfUnJiZvcjXi28" target="_blank" rel="noopener noreferrer" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Book a Demo
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
