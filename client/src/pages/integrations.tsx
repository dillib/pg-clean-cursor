import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Zap, Shield, Truck, BarChart3, Globe, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { PublicNav } from "@/components/public-nav";

const integrations = [
  {
    category: "Identity Technologies",
    items: [
      { name: "QR Codes", description: "Generate and manage unique QR codes for every product", icon: QrCode },
      { name: "NFC/RFID", description: "Connect NFC and RFID tags to digital passports", icon: Zap },
      { name: "Digital Watermarks", description: "Invisible authentication marks for packaging", icon: Shield },
    ],
  },
  {
    category: "Supply Chain",
    items: [
      { name: "ERP Systems", description: "Connect SAP, Oracle, and other enterprise systems", icon: BarChart3 },
      { name: "Logistics Platforms", description: "Track shipments with major carriers", icon: Truck },
      { name: "Warehouse Management", description: "Sync inventory across locations", icon: Globe },
    ],
  },
  {
    category: "E-commerce",
    items: [
      { name: "Shopify", description: "Automatic passport creation for products", icon: Globe },
      { name: "WooCommerce", description: "WordPress integration for online stores", icon: Globe },
      { name: "Magento", description: "Enterprise e-commerce platform support", icon: Globe },
    ],
  },
];

export default function Integrations() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Integrations</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" data-testid="text-integrations-title">
            Connect With Your Existing Tools
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            PhotonicTag integrates seamlessly with the technologies and platforms you already use.
          </p>
        </div>

        {integrations.map((category) => (
          <div key={category.category} className="mb-16">
            <h2 className="text-2xl font-bold mb-6">{category.category}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {category.items.map((item) => (
                <Card key={item.name} data-testid={`card-integration-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{item.name}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center mt-16 p-8 bg-muted/30 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Need a Custom Integration?</h2>
          <p className="text-muted-foreground mb-6">
            Our API enables custom integrations with any system. Contact us to discuss your requirements.
          </p>
          <Button asChild className="gap-2" data-testid="button-contact-us">
            <Link href="/contact">
              Contact Us
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
