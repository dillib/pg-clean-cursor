import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  QrCode, 
  ArrowRight,
  Battery,
  Shirt,
  Smartphone,
  Package,
  Car,
  Home,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Shield,
  Leaf,
  Recycle,
  Globe,
  FileCheck,
  Wrench,
  BarChart3,
  Factory,
  Users,
  Clock,
  Target,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

interface UseCase {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconBg: string;
  demoProductName: string;
  demoProductSearch: string;
  challenge: {
    headline: string;
    points: string[];
  };
  solution: {
    headline: string;
    points: string[];
  };
  features: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
  }[];
  metrics: {
    value: string;
    label: string;
  }[];
  regulations: string[];
}

const useCases: UseCase[] = [
  {
    id: "batteries",
    title: "Batteries & Energy Storage",
    subtitle: "EU Battery Regulation Compliance",
    icon: Battery,
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    demoProductName: "EcoPower Li-Ion Battery Pack",
    demoProductSearch: "EcoPower",
    challenge: {
      headline: "The Battery Transparency Crisis",
      points: [
        "EU Battery Regulation mandates full lifecycle traceability by February 2027",
        "Complex supply chains spanning 15+ countries make material sourcing opaque",
        "Recyclers lack critical data on battery chemistry and disassembly procedures",
        "Counterfeit batteries pose safety risks and undermine brand reputation"
      ]
    },
    solution: {
      headline: "Complete Battery Lifecycle Visibility",
      points: [
        "Automated carbon footprint calculation from raw material extraction to end-of-life",
        "Real-time tracking of cobalt, lithium, and rare earth sourcing with due diligence proof",
        "QR-accessible battery health data including state-of-charge and cycle history",
        "Recycler-ready disassembly instructions with hazard warnings and material recovery rates"
      ]
    },
    features: [
      {
        icon: Leaf,
        title: "Carbon Footprint Tracking",
        description: "Cradle-to-gate emissions calculated per kWh capacity"
      },
      {
        icon: Globe,
        title: "Supply Chain Mapping",
        description: "Mineral sourcing verified against conflict-free standards"
      },
      {
        icon: Recycle,
        title: "End-of-Life Portal",
        description: "Recycling instructions with material recovery percentages"
      },
      {
        icon: Shield,
        title: "Authenticity Verification",
        description: "Cryptographic signatures prevent counterfeit batteries"
      }
    ],
    metrics: [
      { value: "100%", label: "EU Battery Regulation Ready" },
      { value: "45%", label: "Faster Compliance Audits" },
      { value: "92%", label: "Material Traceability" }
    ],
    regulations: ["EU Battery Regulation", "ESPR", "CBAM", "Conflict Minerals"]
  },
  {
    id: "textiles",
    title: "Textiles & Fashion",
    subtitle: "Sustainable Fashion Transparency",
    icon: Shirt,
    gradient: "from-violet-500/20 via-violet-500/5 to-transparent",
    iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    demoProductName: "Nordic Wool Premium Sweater",
    demoProductSearch: "Nordic Wool",
    challenge: {
      headline: "Fashion's Transparency Gap",
      points: [
        "EU ESPR will require Digital Product Passports for textiles by 2027-2028",
        "Consumers demand proof of ethical sourcing and sustainable materials",
        "Fast fashion's environmental impact faces increasing regulatory scrutiny",
        "Greenwashing accusations damage brand trust and market position"
      ]
    },
    solution: {
      headline: "From Fiber to Finished Garment",
      points: [
        "Complete material composition with certified organic and recycled content percentages",
        "Factory-level traceability showing worker welfare certifications and audit results",
        "Care instructions that extend product lifespan and reduce environmental impact",
        "Resale and recycling pathways integrated into the product passport"
      ]
    },
    features: [
      {
        icon: FileCheck,
        title: "Certification Hub",
        description: "GOTS, OEKO-TEX, Fair Trade credentials in one place"
      },
      {
        icon: Factory,
        title: "Factory Transparency",
        description: "Tier 1-3 supplier mapping with audit status"
      },
      {
        icon: Wrench,
        title: "Care & Repair",
        description: "Extend product life with proper care instructions"
      },
      {
        icon: Recycle,
        title: "Circular Pathways",
        description: "Resale, repair, and recycling options for consumers"
      }
    ],
    metrics: [
      { value: "87%", label: "Consumer Trust Increase" },
      { value: "3.2x", label: "Resale Value Retention" },
      { value: "60%", label: "Return Rate Reduction" }
    ],
    regulations: ["EU ESPR", "France AGEC Law", "Germany Supply Chain Act", "NY Fashion Act"]
  },
  {
    id: "electronics",
    title: "Consumer Electronics",
    subtitle: "Right to Repair & Longevity",
    icon: Smartphone,
    gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    demoProductName: "SmartHome Hub Pro",
    demoProductSearch: "SmartHome Hub",
    challenge: {
      headline: "E-Waste & Planned Obsolescence",
      points: [
        "Right-to-repair legislation requires spare parts availability and repair documentation",
        "Consumers lack visibility into repairability before purchase decisions",
        "E-waste regulations demand proper recycling and hazardous material disclosure",
        "Warranty fraud and counterfeit components erode manufacturer margins"
      ]
    },
    solution: {
      headline: "Repair-Ready Product Intelligence",
      points: [
        "Repairability scores calculated using EU methodology with component-level breakdown",
        "Spare parts catalog with availability, pricing, and authorized repair network",
        "Step-by-step repair guides with video tutorials and tool requirements",
        "Warranty verification that prevents fraud while enabling legitimate claims"
      ]
    },
    features: [
      {
        icon: Wrench,
        title: "Repair Scoring",
        description: "iFixit-compatible repairability ratings with breakdown"
      },
      {
        icon: Package,
        title: "Parts Marketplace",
        description: "Direct links to authorized spare parts suppliers"
      },
      {
        icon: Clock,
        title: "Warranty Portal",
        description: "Digital warranty cards with claim history"
      },
      {
        icon: Recycle,
        title: "E-Waste Guidance",
        description: "Proper disposal instructions with collection points"
      }
    ],
    metrics: [
      { value: "8.5/10", label: "Average Repairability Score" },
      { value: "40%", label: "Extended Product Lifespan" },
      { value: "€2.1M", label: "Warranty Fraud Prevented" }
    ],
    regulations: ["EU Right to Repair", "France Repairability Index", "FTC Repair Rule", "WEEE Directive"]
  },
  {
    id: "packaging",
    title: "Packaging & Materials",
    subtitle: "Circularity & Recycled Content",
    icon: Package,
    gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    demoProductName: "CircularPack Modular Container",
    demoProductSearch: "CircularPack",
    challenge: {
      headline: "The Packaging Paradox",
      points: [
        "PPWR mandates minimum recycled content and recyclability standards by 2030",
        "Complex multi-material packaging confuses consumers and contaminates recycling streams",
        "EPR schemes require accurate material declarations and fee calculations",
        "Single-use plastic bans create urgent need for alternative material documentation"
      ]
    },
    solution: {
      headline: "Transparent Packaging Lifecycle",
      points: [
        "Material composition breakdown with recycled content percentages verified at source",
        "Recyclability assessment with regional recycling infrastructure compatibility",
        "EPR fee calculations automated across multiple jurisdictions",
        "Consumer-facing sorting instructions with local recycling facility locator"
      ]
    },
    features: [
      {
        icon: BarChart3,
        title: "Recycled Content",
        description: "Verified PCR/PIR percentages with chain of custody"
      },
      {
        icon: Target,
        title: "Recyclability Rating",
        description: "A-F grades based on actual recycling infrastructure"
      },
      {
        icon: Globe,
        title: "EPR Automation",
        description: "Fee calculations for 30+ EPR schemes worldwide"
      },
      {
        icon: Users,
        title: "Consumer Guidance",
        description: "Scan-to-sort instructions with local facilities"
      }
    ],
    metrics: [
      { value: "95%", label: "Recyclability Target Achievement" },
      { value: "35%", label: "EPR Fee Optimization" },
      { value: "78%", label: "Consumer Sorting Accuracy" }
    ],
    regulations: ["EU PPWR", "SUP Directive", "UK Plastic Packaging Tax", "California SB 343"]
  },
  {
    id: "automotive",
    title: "Automotive & EV Parts",
    subtitle: "Supply Chain Authenticity",
    icon: Car,
    gradient: "from-rose-500/20 via-rose-500/5 to-transparent",
    iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    demoProductName: "Alpine EV Charging Cable",
    demoProductSearch: "Alpine EV",
    challenge: {
      headline: "Counterfeit Parts & Safety Risks",
      points: [
        "Counterfeit automotive parts cause 10,000+ accidents annually worldwide",
        "EV components require battery passport integration and critical mineral traceability",
        "Aftermarket parts authentication protects brand reputation and consumer safety",
        "Recall management requires precise identification of affected components"
      ]
    },
    solution: {
      headline: "Trusted Parts Authentication",
      points: [
        "Cryptographic verification ensures only genuine OEM and authorized aftermarket parts",
        "Integration with vehicle VIN for complete service history and parts provenance",
        "Critical mineral sourcing documentation for EV batteries and motors",
        "Instant recall notification when affected parts are scanned anywhere in the supply chain"
      ]
    },
    features: [
      {
        icon: Shield,
        title: "Anti-Counterfeit",
        description: "Tamper-proof digital signatures on every component"
      },
      {
        icon: Factory,
        title: "Supply Chain",
        description: "Full provenance from raw material to installation"
      },
      {
        icon: AlertTriangle,
        title: "Recall Management",
        description: "Instant notifications for affected components"
      },
      {
        icon: FileCheck,
        title: "Service History",
        description: "Complete maintenance records linked to VIN"
      }
    ],
    metrics: [
      { value: "99.7%", label: "Counterfeit Detection Rate" },
      { value: "4 hrs", label: "Recall Response Time" },
      { value: "$12M", label: "Fraud Prevented Annually" }
    ],
    regulations: ["EU Type Approval", "UNECE R155", "IATF 16949", "Conflict Minerals Regulation"]
  },
  {
    id: "smart-home",
    title: "Smart Home & IoT",
    subtitle: "Device Security & Firmware Integrity",
    icon: Home,
    gradient: "from-cyan-500/20 via-cyan-500/5 to-transparent",
    iconBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    demoProductName: "SmartHome Hub Pro",
    demoProductSearch: "SmartHome",
    challenge: {
      headline: "IoT Security & Lifecycle Management",
      points: [
        "Cyber Resilience Act requires security updates and vulnerability disclosure",
        "Consumers cannot verify device authenticity or firmware integrity",
        "End-of-support dates are often undisclosed, leaving devices vulnerable",
        "E-waste regulations require proper disposal of connected devices"
      ]
    },
    solution: {
      headline: "Secure Device Identity",
      points: [
        "Hardware-bound digital identity verifiable throughout device lifetime",
        "Firmware version tracking with security patch status and update availability",
        "End-of-support disclosure with migration pathways to newer devices",
        "Privacy-preserving scan that doesn't expose device to network attacks"
      ]
    },
    features: [
      {
        icon: Shield,
        title: "Firmware Integrity",
        description: "Cryptographic verification of software authenticity"
      },
      {
        icon: Clock,
        title: "Support Lifecycle",
        description: "Clear end-of-support dates and update roadmap"
      },
      {
        icon: AlertTriangle,
        title: "Vulnerability Status",
        description: "CVE tracking with patch availability"
      },
      {
        icon: Recycle,
        title: "Secure Disposal",
        description: "Data wipe verification and recycling guidance"
      }
    ],
    metrics: [
      { value: "100%", label: "Cyber Resilience Act Ready" },
      { value: "24 hrs", label: "Vulnerability Disclosure" },
      { value: "5 yrs", label: "Minimum Support Commitment" }
    ],
    regulations: ["EU Cyber Resilience Act", "UK PSTI Act", "ETSI EN 303 645", "NIST IoT Guidelines"]
  }
];

function UseCaseCard({ useCase, index, products }: { useCase: UseCase; index: number; products: Product[] }) {
  const Icon = useCase.icon;
  const isEven = index % 2 === 0;
  
  const matchingProduct = (products || []).find(p => 
    p.productName.toLowerCase().includes(useCase.demoProductSearch.toLowerCase())
  );
  
  return (
    <section 
      id={useCase.id}
      className="py-16 sm:py-24 scroll-mt-20"
      data-testid={`section-usecase-${useCase.id}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-start ${isEven ? '' : 'lg:grid-flow-dense'}`}>
          <div className={`space-y-8 ${isEven ? '' : 'lg:col-start-2'}`}>
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${useCase.iconBg}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" data-testid={`heading-${useCase.id}`}>
                    {useCase.title}
                  </h2>
                  <p className="text-muted-foreground">{useCase.subtitle}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {useCase.regulations.map((reg) => (
                  <Badge key={reg} variant="secondary" className="text-xs">
                    {reg}
                  </Badge>
                ))}
              </div>
            </div>

            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <h3 className="font-semibold text-destructive">{useCase.challenge.headline}</h3>
                </div>
                <ul className="space-y-2">
                  {useCase.challenge.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive/60 mt-2 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-primary">{useCase.solution.headline}</h3>
                </div>
                <ul className="space-y-2">
                  {useCase.solution.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-3.5 h-3.5 text-primary mt-1 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className={`space-y-6 ${isEven ? '' : 'lg:col-start-1 lg:row-start-1'}`}>
            <div className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${useCase.gradient} p-8`}>
              <div className="absolute inset-0 bg-card/50" />
              <div className="relative">
                <h4 className="font-semibold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Key Features
                </h4>
                <div className="grid gap-4">
                  {useCase.features.map((feature) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <div 
                        key={feature.title}
                        className="flex items-start gap-4 p-4 rounded-lg bg-background/80 backdrop-blur-sm"
                      >
                        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FeatureIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h5 className="font-medium text-sm">{feature.title}</h5>
                          <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {useCase.metrics.map((metric) => (
                <Card key={metric.label} className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl sm:text-3xl font-bold text-primary" data-testid={`metric-${useCase.id}-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}>
                      {metric.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{metric.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {matchingProduct ? (
              <Button className="w-full gap-2" asChild data-testid={`button-demo-${useCase.id}`}>
                <Link href={`/product/${matchingProduct.id}`}>
                  <ExternalLink className="w-4 h-4" />
                  View {matchingProduct.productName.split(' ').slice(0, 4).join(' ')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <Button className="w-full gap-2" asChild data-testid={`button-demo-${useCase.id}`}>
                <Link href="/scan/demo">
                  View Demo Passport
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function UseCases() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2" data-testid="nav-logo">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <QrCode className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">PhotonicTag</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/solution" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-solution">Solution</Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-pricing">Pricing</Link>
              <Link href="/use-cases" className="text-sm text-foreground font-medium transition-colors" data-testid="link-use-cases">Use Cases</Link>
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-docs">Docs</Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-contact">Contact</Link>
            </div>
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

      <section className="relative pt-28 pb-12 px-4 sm:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Industry Use Cases
              </h1>
              <p className="text-muted-foreground max-w-xl">
                Explore how PhotonicTag enables compliance across industries with tailored Digital Product Passport solutions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {useCases.map((uc) => {
                const Icon = uc.icon;
                return (
                  <Button 
                    key={uc.id} 
                    variant="outline" 
                    size="sm"
                    className="gap-2"
                    asChild
                    data-testid={`nav-${uc.id}`}
                  >
                    <a href={`#${uc.id}`}>
                      <Icon className="w-4 h-4" />
                      {uc.title.split(' ')[0]}
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {useCases.map((useCase, index) => (
        <UseCaseCard key={useCase.id} useCase={useCase} index={index} products={products} />
      ))}

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to Future-Proof Your Products?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join leading manufacturers who trust PhotonicTag for compliant, consumer-friendly 
            Digital Product Passports. Start with a free pilot for up to 100 products.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" asChild data-testid="button-cta-start">
              <a href="/api/login" className="gap-2">
                Start Free Pilot
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-cta-demo">
              <Link href="/scan/demo">View Demo Passport</Link>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 pt-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Setup in 15 minutes</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Enterprise-ready security</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-foreground transition-colors">Integrations</Link></li>
                <li><Link href="/scan/demo" className="hover:text-foreground transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/case-studies" className="hover:text-foreground transition-colors">Case Studies</Link></li>
                <li><Link href="/eu-dpp-guide" className="hover:text-foreground transition-colors">EU DPP Guide</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#about" className="hover:text-foreground transition-colors">About</a></li>
                <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <QrCode className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">PhotonicTag</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">— Identity, at the speed of light.</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2025 PhotonicTag. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
