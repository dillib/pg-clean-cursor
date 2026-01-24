import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Sparkles, Building2, Package, Activity, QrCode, Shield, Brain, AlertTriangle, Zap, Database, Clock, Calendar } from "lucide-react";
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
    popular: false,
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
    ],
    popular: false,
  },
  {
    name: "Growth",
    price: 499,
    description: "For growing businesses with advanced traceability needs",
    features: [
      "Up to 25,000 product identities",
      "Advanced analytics",
      "Full API access",
      "3 team members",
      "Priority support",
      "IoT device integration",
    ],
    popular: true,
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
    ],
    popular: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" data-testid="text-pricing-title">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your business. All plans include EU DPP compliance features.
          </p>
        </div>

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
                    Non-compliance penalties range from <span className="font-bold text-destructive">€10,000 to €100,000+ per violation</span>.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-background">
                      <p className="text-2xl font-bold text-destructive">€10K+</p>
                      <p className="text-xs text-muted-foreground">Per violation fine</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-background">
                      <p className="text-2xl font-bold text-destructive">100%</p>
                      <p className="text-xs text-muted-foreground">Market access risk</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-background">
                      <p className="text-2xl font-bold text-primary">2027</p>
                      <p className="text-xs text-muted-foreground">Batteries deadline</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-background">
                      <p className="text-2xl font-bold text-primary">2030</p>
                      <p className="text-xs text-muted-foreground">All products</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Your Return on Investment</h2>
            <p className="text-muted-foreground">PhotonicTag pays for itself through compliance savings</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Avoid Penalties</h3>
                <p className="text-sm text-muted-foreground">Single violation fine exceeds 2+ years of subscription</p>
                <div className="pt-2 border-t">
                  <p className="text-2xl font-bold text-primary">50-100x</p>
                  <p className="text-xs text-muted-foreground">ROI vs. penalty cost</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Save Time</h3>
                <p className="text-sm text-muted-foreground">Automate product data and compliance reporting</p>
                <div className="pt-2 border-t">
                  <p className="text-2xl font-bold text-primary">80%</p>
                  <p className="text-xs text-muted-foreground">Time saved on compliance</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">SAP Integration</h3>
                <p className="text-sm text-muted-foreground">Bidirectional sync eliminates duplicate data entry</p>
                <div className="pt-2 border-t">
                  <p className="text-2xl font-bold text-primary">$150K+</p>
                  <p className="text-xs text-muted-foreground">Annual savings</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Platform Plans</h2>
            <p className="text-muted-foreground">Choose your base tier</p>
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
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Usage-Based Add-Ons</h2>
            <p className="text-muted-foreground">Pay for what you use</p>
            <p className="text-xs text-muted-foreground mt-2">
              Product identity = 1 Digital Product Passport + QR code
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Extra Identities</h3>
                <p className="text-sm text-muted-foreground">Add more product identities beyond your plan</p>
                <div className="pt-2 border-t">
                  <p className="text-sm"><span className="font-bold text-primary">$0.02 - $0.10</span> per identity</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Supply Chain Events</h3>
                <p className="text-sm text-muted-foreground">Track every supply chain event</p>
                <div className="pt-2 border-t">
                  <p className="text-sm"><span className="font-bold text-primary">$0.001 - $0.01</span> per event</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Scan Analytics</h3>
                <p className="text-sm text-muted-foreground">Detailed scan tracking and insights</p>
                <div className="pt-2 border-t">
                  <p className="text-sm"><span className="font-bold text-primary">$0.05 - $0.25</span> per scan</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">AI Intelligence</h3>
                <p className="text-sm text-muted-foreground">Sustainability and repair insights</p>
                <div className="pt-2 border-t">
                  <p className="text-sm"><span className="font-bold text-primary">$99 - $2,000</span>/month</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-16">
          <Card className="bg-muted/30 border-dashed">
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
                    For large manufacturers needing custom solutions, on-premise deployment, and dedicated support.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <Badge variant="secondary" className="gap-1">
                      <Check className="w-3 h-3" /> Custom SLAs
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Check className="w-3 h-3" /> On-prem option
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

        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Why PhotonicTag?</h2>
            <p className="text-muted-foreground">See how we compare</p>
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
                      <th className="text-center p-4 font-semibold text-muted-foreground">DIY</th>
                      <th className="text-center p-4 font-semibold text-muted-foreground">Legacy PLM</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4">EU DPP Compliance</td>
                      <td className="p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                      <td className="p-4 text-center text-muted-foreground">Manual</td>
                      <td className="p-4 text-center text-muted-foreground">Partial</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">SAP Integration</td>
                      <td className="p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                      <td className="p-4 text-center text-muted-foreground">No</td>
                      <td className="p-4 text-center text-muted-foreground">$200K+ custom</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">AI Insights</td>
                      <td className="p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                      <td className="p-4 text-center text-muted-foreground">No</td>
                      <td className="p-4 text-center text-muted-foreground">No</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Time to Deploy</td>
                      <td className="p-4 text-center bg-primary/5 font-semibold text-primary">Days</td>
                      <td className="p-4 text-center text-muted-foreground">Months</td>
                      <td className="p-4 text-center text-muted-foreground">6-12 months</td>
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
              Talk to our team to find the right plan for your business.
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
