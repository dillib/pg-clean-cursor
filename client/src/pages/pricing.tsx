import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, QrCode } from "lucide-react";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for small brands getting started with product passports",
    features: [
      "Up to 100 products",
      "QR code generation",
      "Basic analytics",
      "Email support",
      "Public scan pages",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Professional",
    price: "$99",
    period: "/month",
    description: "For growing businesses with advanced traceability needs",
    features: [
      "Up to 10,000 products",
      "Supply chain tracking",
      "Custom branding",
      "API access",
      "Priority support",
      "Team collaboration",
      "Advanced analytics",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with complex compliance requirements",
    features: [
      "Unlimited products",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "On-premise option",
      "Advanced security",
      "Compliance reporting",
      "Training & onboarding",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer" data-testid="nav-logo">
                <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold tracking-tight">PhotonicTag</span>
              </div>
            </Link>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" data-testid="text-pricing-title">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include core Digital Product Passport features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
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
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
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
                  {plan.name === "Enterprise" ? (
                    <Link href="/contact">{plan.cta}</Link>
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

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </main>
    </div>
  );
}
