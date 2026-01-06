import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, Code, Zap, FileText, Settings, Users } from "lucide-react";
import { Link } from "wouter";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

const docSections = [
  {
    title: "Getting Started",
    description: "Learn the basics of PhotonicTag and create your first product passport",
    icon: Zap,
    articles: ["Quick Start Guide", "Creating Your First Product", "Understanding Digital Passports"],
  },
  {
    title: "API Reference",
    description: "Complete API documentation for developers",
    icon: Code,
    articles: ["Authentication", "Products API", "QR Codes API", "Trace Events API"],
  },
  {
    title: "Guides",
    description: "Step-by-step tutorials for common use cases",
    icon: Book,
    articles: ["Supply Chain Tracking", "EU DPP Compliance", "Custom Branding", "Batch Operations"],
  },
  {
    title: "Administration",
    description: "Manage your account, team, and settings",
    icon: Settings,
    articles: ["Account Settings", "Team Management", "Billing & Subscriptions", "Security"],
  },
];

export default function Docs() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Documentation</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" data-testid="text-docs-title">
            PhotonicTag Documentation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to integrate and use PhotonicTag for your digital product passports.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {docSections.map((section) => (
            <Card key={section.title} data-testid={`card-doc-${section.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle>{section.title}</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{section.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.articles.map((article) => (
                    <li key={article} className="flex items-center gap-2 text-sm hover:text-primary cursor-pointer transition-colors">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      {article}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  Our support team is ready to assist you with any questions.
                </p>
              </div>
              <Button variant="outline" asChild className="ml-auto flex-shrink-0" data-testid="button-contact-support">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">API Status</h3>
                <p className="text-sm text-muted-foreground">
                  All systems operational. 99.9% uptime.
                </p>
              </div>
              <Badge variant="secondary" className="ml-auto flex-shrink-0">Operational</Badge>
            </CardContent>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
