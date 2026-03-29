import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart3, TrendingUp, Shield, Leaf } from "lucide-react";
import { Link } from "wouter";
import { PublicNav } from "@/components/public-nav";

const caseStudies = [
  {
    company: "EcoFashion Co.",
    industry: "Apparel & Textiles",
    title: "Achieving 100% Supply Chain Transparency",
    excerpt: "How a sustainable fashion brand used PhotonicTag to trace every garment from cotton farm to retail shelf, increasing customer trust by 45%.",
    metrics: [
      { label: "Customer Trust", value: "+45%" },
      { label: "Return Fraud", value: "-60%" },
      { label: "Compliance Cost", value: "-35%" },
    ],
    icon: Leaf,
  },
  {
    company: "TechParts Global",
    industry: "Electronics Manufacturing",
    title: "Eliminating Counterfeit Components",
    excerpt: "A leading electronics manufacturer implemented PhotonicTag to verify authentic parts across 200+ suppliers, preventing €2M in counterfeit losses.",
    metrics: [
      { label: "Counterfeit Prevention", value: "€2M" },
      { label: "Verification Time", value: "-80%" },
      { label: "Supplier Compliance", value: "100%" },
    ],
    icon: Shield,
  },
  {
    company: "PharmaSecure Inc.",
    industry: "Pharmaceuticals",
    title: "Meeting Global Serialization Requirements",
    excerpt: "How a pharmaceutical company achieved compliance with global serialization regulations across 40 markets using PhotonicTag's unified platform.",
    metrics: [
      { label: "Markets Covered", value: "40+" },
      { label: "Compliance Rate", value: "100%" },
      { label: "Audit Time", value: "-70%" },
    ],
    icon: BarChart3,
  },
  {
    company: "LuxuryGoods Ltd.",
    industry: "Luxury Retail",
    title: "Protecting Brand Authenticity",
    excerpt: "A premium brand used digital passports to give customers confidence in authenticity, resulting in a 30% increase in online sales.",
    metrics: [
      { label: "Online Sales", value: "+30%" },
      { label: "Auth Inquiries", value: "-55%" },
      { label: "Brand Trust", value: "+40%" },
    ],
    icon: TrendingUp,
  },
];

export default function CaseStudies() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Case Studies</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" data-testid="text-case-studies-title">
            Success Stories
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how leading brands are using PhotonicTag to transform their product identity and supply chain operations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {caseStudies.map((study, index) => (
            <Card key={index} className="hover-elevate cursor-pointer" data-testid={`card-case-study-${index}`}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <study.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{study.company}</p>
                    <p className="text-xs text-muted-foreground">{study.industry}</p>
                  </div>
                </div>
                <CardTitle className="text-xl">{study.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">{study.excerpt}</p>
                <div className="grid grid-cols-3 gap-4">
                  {study.metrics.map((metric) => (
                    <div key={metric.label} className="text-center">
                      <p className="text-2xl font-bold text-primary">{metric.value}</p>
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full gap-2" asChild data-testid={`button-read-case-study-${index}`}>
                  <Link href="/contact">
                    Request Full Case Study
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16 p-8 bg-muted/30 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Ready to Write Your Success Story?</h2>
          <p className="text-muted-foreground mb-6">
            Join the growing list of brands transforming their product identity with PhotonicTag.
          </p>
          <Button asChild className="gap-2" data-testid="button-start-trial">
            <a href="/api/login">
              Start Your Free Trial
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}
