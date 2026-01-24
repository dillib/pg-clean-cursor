import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  RefreshCw, 
  Zap, 
  Shield, 
  Database,
  CheckCircle,
  Calendar,
  QrCode,
  Wifi,
  Radio
} from "lucide-react";
import { Link } from "wouter";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { SiSap } from "react-icons/si";

const sapHighlights = [
  "Bidirectional sync with SAP S/4HANA",
  "Material Master (MARA/MARC) integration",
  "Batch and serial number management",
  "OAuth 2.0 authentication",
  "Configurable field mapping",
  "SAP Business One support"
];

const identityTech = [
  { name: "QR Codes", description: "Dynamic QR codes with analytics", icon: QrCode },
  { name: "NFC Tags", description: "Tap-to-scan product passports", icon: Wifi },
  { name: "RFID", description: "Industrial tracking & inventory", icon: Radio },
];

const erpIntegrations = [
  { name: "Oracle NetSuite", status: "Coming Soon" },
  { name: "Microsoft Dynamics", status: "Coming Soon" },
  { name: "Shopify", status: "Coming Soon" },
];

export default function Integrations() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Integrations - PhotonicTag | SAP, ERP & Identity Technologies</title>
        <meta name="description" content="Connect PhotonicTag with SAP S/4HANA, ERP systems, QR codes, NFC tags, and RFID. Bidirectional sync, real-time product data flow. Enterprise-ready integrations." />
        <meta property="og:title" content="PhotonicTag Integrations - SAP & ERP Connectivity" />
        <meta property="og:description" content="Enterprise integrations for EU DPP. SAP S/4HANA sync. QR, NFC, RFID support." />
      </Helmet>
      <PublicNav />

      <main className="mt-16">
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">Integrations</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" data-testid="text-integrations-title">
              Connect Your Product Ecosystem
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              PhotonicTag integrates with your ERP systems and identity technologies. No data silos. Real-time product data flow.
            </p>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6 text-center">Identity Technologies</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-12">
              {identityTech.map((tech) => (
                <Card key={tech.name}>
                  <CardContent className="p-6 text-center">
                    <tech.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-1">{tech.name}</h3>
                    <p className="text-sm text-muted-foreground">{tech.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <h2 className="text-xl font-semibold mb-6 text-center">Enterprise ERP</h2>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2">
                  <div className="p-8 bg-blue-600 text-white">
                    <div className="flex items-center gap-3 mb-4">
                      <SiSap className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">SAP Integration</h2>
                    <p className="text-blue-100 mb-6">
                      Enterprise-grade bidirectional sync. Your Material Master data flows directly into Digital Product Passports.
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        <span>Real-time sync</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        <span>No middleware</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span>Enterprise security</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        <span>Single source of truth</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="font-semibold mb-4">What's Included</h3>
                    <ul className="space-y-2">
                      {sapHighlights.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4 mt-6">
              {erpIntegrations.map((integration) => (
                <Card key={integration.name}>
                  <CardContent className="p-6 text-center">
                    <Database className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">{integration.name}</h3>
                    <Badge variant="outline">{integration.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Connect?</h2>
            <p className="text-muted-foreground mb-6">
              Let's discuss how PhotonicTag integrates with your systems.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild data-testid="button-book-demo">
                <a href="https://calendar.app.google/Aa9nfUnJiZvcjXi28" target="_blank" rel="noopener noreferrer" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Book a 30-min Demo
                </a>
              </Button>
              <Button variant="outline" asChild data-testid="button-contact">
                <Link href="/contact" className="gap-2">
                  Contact Us
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
