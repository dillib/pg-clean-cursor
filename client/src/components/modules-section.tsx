import { Card, CardContent } from "@/components/ui/card";
import { 
  QrCode, 
  GitBranch, 
  Shield, 
  Wifi, 
  Brain, 
  Leaf,
  CheckCircle
} from "lucide-react";

const modules = [
  {
    name: "Digital Product Passports",
    slug: "dpp",
    icon: QrCode,
    description: "Create EU DPP-compliant digital identities for every product with all required sustainability and traceability data fields.",
    features: [
      "EU Ecodesign Regulation compliant",
      "Unique identifier per product unit",
      "Batch QR code generation",
      "Real-time data synchronization",
    ],
  },
  {
    name: "Supply Chain Traceability",
    slug: "supply-chain",
    icon: GitBranch,
    description: "Track products from raw materials to end consumer with complete chain of custody and immutable event logging.",
    features: [
      "End-to-end visibility",
      "Multi-tier supplier tracking",
      "GPS and timestamp logging",
      "Automated event capture",
    ],
  },
  {
    name: "Anti-Counterfeiting",
    slug: "anti-counterfeit",
    icon: Shield,
    description: "Protect your brand with physics-rooted authentication. Every scan verifies authenticity and logs verification events.",
    features: [
      "Tamper-proof identifiers",
      "Real-time verification API",
      "Counterfeit detection alerts",
      "Brand protection analytics",
    ],
  },
  {
    name: "IoT Device Integration",
    slug: "iot",
    icon: Wifi,
    description: "Connect NFC tags, RFID chips, and BLE beacons. Enable contactless scanning and real-time sensor data integration.",
    features: [
      "NFC/RFID/BLE support",
      "Sensor data streaming",
      "Device lifecycle management",
      "OTA firmware tracking",
    ],
  },
  {
    name: "AI-Powered Insights",
    slug: "ai",
    icon: Brain,
    description: "Leverage AI to auto-generate sustainability scores, repair guides, risk assessments, and circularity recommendations.",
    features: [
      "Automated sustainability scoring",
      "AI-generated repair guides",
      "Compliance risk analysis",
      "Circularity optimization",
    ],
  },
  {
    name: "Sustainability Reporting",
    slug: "sustainability",
    icon: Leaf,
    description: "Measure and communicate environmental impact with precision. Track carbon, recyclability, and materials across your portfolio.",
    features: [
      "Carbon footprint calculator",
      "EU repairability scoring",
      "Material composition tracking",
      "ESG report generation",
    ],
  },
];

interface ModulesSectionProps {
  compact?: boolean;
}

export function ModulesSection({ compact = false }: ModulesSectionProps) {
  return (
    <section className={`${compact ? 'py-12' : 'py-16'} px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3" data-testid="text-modules-title">
            Six Integrated Modules, One Platform
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto" data-testid="text-modules-subtitle">
            Everything you need for comprehensive product identity management — from creation to consumer.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card key={module.name} data-testid={`card-module-${module.slug}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <module.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold" data-testid={`text-module-name-${module.slug}`}>{module.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4" data-testid={`text-module-desc-${module.slug}`}>{module.description}</p>
                <ul className="space-y-1.5">
                  {module.features.map((feature, index) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-muted-foreground" data-testid={`text-module-feature-${module.slug}-${index}`}>
                      <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
