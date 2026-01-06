import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { PublicNav } from "@/components/public-nav";

const timeline = [
  { year: "2024", event: "Regulation adopted by European Parliament" },
  { year: "2026", event: "First product categories require DPP (batteries)" },
  { year: "2027", event: "Textiles and electronics begin compliance" },
  { year: "2030", event: "Full implementation across all covered sectors" },
];

const requirements = [
  { title: "Product Identification", description: "Unique identifier linked to a digital passport" },
  { title: "Material Composition", description: "Full disclosure of materials and substances of concern" },
  { title: "Carbon Footprint", description: "Lifecycle emissions data and methodology" },
  { title: "Repairability Information", description: "Repair scores, spare parts availability, instructions" },
  { title: "Recycling Guidelines", description: "End-of-life handling and recyclability information" },
  { title: "Supply Chain Data", description: "Origin, manufacturing locations, and chain of custody" },
];

export default function EuDppGuide() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Compliance Guide</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" data-testid="text-eu-dpp-title">
            EU Digital Product Passport Guide
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about the European Union's Digital Product Passport regulation and how to prepare your business.
          </p>
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert mb-16">
          <h2>What is the EU Digital Product Passport?</h2>
          <p>
            The EU Digital Product Passport (DPP) is a regulatory initiative under the Ecodesign for Sustainable Products Regulation (ESPR). 
            It requires products sold in the EU to carry a digital passport containing comprehensive information about their composition, 
            origin, environmental impact, and end-of-life handling.
          </p>
          <p>
            The DPP aims to enable consumers, businesses, and regulators to make informed decisions, 
            support the circular economy, and verify sustainability claims.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Implementation Timeline</h2>
          <div className="space-y-4">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-start gap-4" data-testid={`timeline-${item.year}`}>
                <div className="w-16 flex-shrink-0">
                  <Badge variant="outline" className="font-mono">{item.year}</Badge>
                </div>
                <div className="flex-1 pb-4 border-b last:border-0">
                  <p className="font-medium">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Key Requirements</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {requirements.map((req, index) => (
              <Card key={index} data-testid={`requirement-${index}`}>
                <CardContent className="p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">{req.title}</p>
                    <p className="text-sm text-muted-foreground">{req.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="mb-16 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Start Preparing Now</h3>
                <p className="text-muted-foreground mb-4">
                  Companies that begin DPP implementation early will have a competitive advantage. 
                  PhotonicTag provides a complete solution for creating, managing, and sharing digital product passports 
                  that meet EU requirements.
                </p>
                <Button asChild className="gap-2" data-testid="button-get-started-dpp">
                  <a href="/api/login">
                    Get Started with PhotonicTag
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help with Compliance?</h2>
          <p className="text-muted-foreground mb-6">
            Our team can guide you through the DPP requirements and help you implement a solution.
          </p>
          <Button variant="outline" asChild className="gap-2" data-testid="button-schedule-consultation">
            <Link href="/contact">
              Schedule a Consultation
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
