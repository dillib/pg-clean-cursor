import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Building2, Shield, AlertTriangle, Zap, Clock, Calendar, Layers, GitBranch, Award } from "lucide-react";
import { Link } from "wouter";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { ModulesSection } from "@/components/modules-section";

const platformTiers = [
  {
    name: "Starter",
    price: 99,
    description: "Everything you need to achieve EU DPP compliance",
    features: [
      "Full admin dashboard",
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
    description: "Enhanced features for teams with advanced needs",
    features: [
      "Everything in Starter",
      "Advanced analytics",
      "Up to 5 team members",
      "Priority support",
      "IoT device integration",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: null,
    description: "Tailored solutions with dedicated support",
    features: [
      "Everything in Growth",
      "SAP S/4HANA integration",
      "Unlimited team members",
      "Dedicated account manager",
      "SLA guarantee (99.9%)",
      "On-premise deployment",
    ],
    popular: false,
  },
];

const identityPricing = [
  {
    category: "Batch Tracking",
    icon: Layers,
    description: "For products manufactured in batches or lots",
    examples: "Batteries, textiles, packaging, components",
    pricing: "€0.01 - €0.05",
    unit: "per batch identity",
    note: "One Digital Product Passport per manufacturing batch",
  },
  {
    category: "Serial Tracking",
    icon: GitBranch,
    description: "For products requiring individual identification",
    examples: "Electronics, appliances, automotive parts",
    pricing: "€0.05 - €0.25",
    unit: "per product identity",
    note: "One Digital Product Passport per individual unit",
  },
  {
    category: "Provenance Tracking",
    icon: Award,
    description: "For products requiring full ownership history",
    examples: "Timepieces, accessories, collectibles, art",
    pricing: "€0.50 - €2.00",
    unit: "per product identity",
    note: "Enhanced authentication and ownership transfer records",
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pricing - PhotonicTag | EU DPP Compliance Platform</title>
        <meta name="description" content="Simple, transparent pricing for EU Digital Product Passport compliance under ESPR 2024/1781. Platform plans from €99/month. Battery deadline Feb 2027, all products by 2030." />
        <meta property="og:title" content="PhotonicTag Pricing - EU DPP Compliance Platform" />
        <meta property="og:description" content="Affordable EU DPP compliance. Platform plans from €99/month. Avoid €100K+ penalties." />
      </Helmet>
      <PublicNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" data-testid="text-pricing-title">
            Pricing That Fits Your Needs
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your platform plan, then select the tracking approach that matches your compliance requirements.
          </p>
        </div>

        <section className="mb-12">
          <Card className="border-destructive/30 bg-destructive/5" data-testid="card-compliance-warning">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-1">EU DPP Deadlines: Feb 2027 - 2030</h3>
                  <p className="text-sm text-muted-foreground">
                    Batteries by Feb 18, 2027. Textiles & electronics by late 2027. All products by 2030. 
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
            <p className="text-muted-foreground">Select the features and support level you need</p>
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
                        <span className="text-4xl font-bold">€{plan.price}</span>
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
            <p className="text-muted-foreground">Choose based on your compliance requirements</p>
            <p className="text-sm text-muted-foreground mt-2">
              Every option delivers full EU DPP compliance — select the tracking approach that fits your products
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {identityPricing.map((tier) => (
              <Card key={tier.category} data-testid={`card-identity-${tier.category.toLowerCase().replace(' ', '-')}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <tier.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">{tier.category}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{tier.description}</p>
                  <p className="text-xs text-muted-foreground mb-4">{tier.examples}</p>
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
              Volume discounts available for all tracking options. <Link href="/contact" className="text-primary underline">Contact us</Link> for details.
            </p>
          </div>
        </section>

        <div className="mb-16 -mx-4 sm:-mx-6 lg:-mx-8 bg-muted/30">
          <ModulesSection compact />
        </div>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">The PhotonicTag Advantage</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-3xl font-bold text-primary">50-100x</p>
                <p className="text-sm text-muted-foreground">Return vs. one compliance penalty</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-3xl font-bold text-primary">80%</p>
                <p className="text-sm text-muted-foreground">Time saved on compliance work</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-3xl font-bold text-primary">Days</p>
                <p className="text-sm text-muted-foreground">To deploy, not months</p>
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
                  <h2 className="text-xl font-bold mb-2">Need a Custom Solution?</h2>
                  <p className="text-muted-foreground">
                    We work with organizations of all sizes. Let's discuss your specific requirements, volume needs, and integration goals.
                  </p>
                </div>
                <Button size="lg" asChild data-testid="button-enterprise-contact">
                  <Link href="/contact" className="gap-2">
                    Let's Talk
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
              Our team is here to help you find the right solution.
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
