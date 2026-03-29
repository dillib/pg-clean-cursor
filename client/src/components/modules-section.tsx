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
            <Card
              key={module.name}
              className="overflow-hidden border-primary/15 hover:border-primary/40 hover:shadow-lg transition-all duration-200 group"
              data-testid={`card-module-${module.slug}`}
            >
              {/* Gold accent top bar */}
              <div className="h-[3px] bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

              <CardContent className="p-6">
                {/* Icon + title */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/15 ring-1 ring-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary/22 transition-colors">
                    <module.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground leading-tight" data-testid={`text-module-name-${module.slug}`}>
                    {module.name}
                  </h3>
                </div>

                {/* Description */}
                <p
                  className="text-sm text-foreground/70 mb-5 leading-relaxed"
                  data-testid={`text-module-desc-${module.slug}`}
                >
                  {module.description}
                </p>

                {/* Feature list */}
                <div className="border-t border-primary/12 pt-4">
                  <ul className="space-y-2">
                    {module.features.map((feature, index) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2.5 text-xs text-foreground/65"
                        data-testid={`text-module-feature-${module.slug}-${index}`}
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
