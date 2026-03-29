import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import {
  Package,
  Factory,
  Hash,
  Recycle,
  Sparkles,
  Shield,
  Leaf,
  Wrench,
  QrCode,
  CheckCircle2,
  Clock,
  MapPin,
  Truck,
  Box,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Globe,
  AlertTriangle,
  Cpu,
  Droplet,
  Zap,
  CircleDot,
  BarChart3,
  FileCheck,
  Award,
  Copy,
  Check,
} from "lucide-react";
import { StaggerContainer, StaggerItem, FadeUp } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Product, TraceEvent, QRCode as QRCodeType, DppRegionalExtension, AIInsight } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const categoryDeadlineInfo: Record<string, { date: string; urgent: boolean; description: string }> = {
  "Batteries": { date: "February 18, 2027", urgent: true, description: "EU Battery Regulation requires Digital Product Passports for all industrial and EV batteries." },
  "EV Accessories": { date: "February 2027", urgent: true, description: "Battery-related products fall under EU Battery Regulation compliance requirements." },
  "Apparel": { date: "Late 2027", urgent: false, description: "Textiles and apparel require DPPs under ESPR Regulation (EU) 2024/1781." },
  "Fashion Accessories": { date: "Late 2027", urgent: false, description: "Fashion accessories fall under textile DPP requirements." },
  "Consumer Electronics": { date: "Late 2027", urgent: false, description: "Electronics require DPPs for sustainability and repairability transparency." },
  "IoT Devices": { date: "Late 2027", urgent: false, description: "Smart devices fall under electronics DPP requirements." },
  "Smart Home": { date: "Late 2027", urgent: false, description: "Smart home devices require DPPs for electronics compliance." },
  "Industrial Packaging": { date: "2028-2029", urgent: false, description: "Packaging materials subject to upcoming ESPR requirements." },
  "Industrial Belting": { date: "By 2030", urgent: false, description: "Industrial equipment included in universal DPP mandate." },
  "Industrial Rollers": { date: "By 2030", urgent: false, description: "Industrial equipment included in universal DPP mandate." },
};

function getCategoryDeadline(category: string | null): { date: string; urgent: boolean; description: string } {
  if (!category) return { date: "By 2030", urgent: false, description: "Subject to EU ESPR regulation requirements." };
  return categoryDeadlineInfo[category] ?? { date: "By 2030", urgent: false, description: "Subject to EU ESPR regulation requirements." };
}

const demoProduct: Partial<Product> & { id: string; productName: string; manufacturer: string; batchNumber: string; materials: string; carbonFootprint: number; repairabilityScore: number; warrantyInfo: string; recyclingInstructions: string } = {
  id: "demo",
  productName: "EcoPower Li-Ion Battery Pack 5000mAh",
  manufacturer: "GreenCell Technologies GmbH",
  manufacturerAddress: "Industriestrasse 42, 80939 Munich, Germany",
  countryOfOrigin: "Germany",
  productCategory: "Batteries",
  modelNumber: "EP-LION-5000",
  sku: "GCT-BAT-5000-BLK",
  batchNumber: "GCT-BAT-2025-0842",
  lotNumber: "LOT-2025-Q3-0842",
  materials: "Lithium Cobalt Oxide (35%), Graphite Anode (25%), Aluminum Casing (20%), Copper Foil (15%), Polymer Separator (5%). All materials sourced from certified suppliers with full supply chain documentation.",
  materialBreakdown: [
    { material: "Lithium Cobalt Oxide", percentage: 35, recyclable: true },
    { material: "Graphite", percentage: 25, recyclable: true },
    { material: "Aluminum", percentage: 20, recyclable: true },
    { material: "Copper", percentage: 15, recyclable: true },
    { material: "Polymer", percentage: 5, recyclable: false }
  ],
  recycledContentPercent: 22,
  recyclabilityPercent: 95,
  hazardousMaterials: "Contains lithium - Class 9 hazardous material for transport",
  carbonFootprint: 12,
  waterUsage: 850,
  energyConsumption: 45,
  environmentalCertifications: ["ISO 14001", "Carbon Trust Certified", "EU Battery Regulation 2023/1542"],
  repairabilityScore: 7,
  expectedLifespanYears: 8,
  sparePartsAvailable: true,
  repairInstructions: "Battery cells can be replaced by certified technicians. See service manual for disassembly procedure.",
  serviceCenters: [
    { name: "GreenCell Munich Service", location: "Munich, Germany", contact: "+49 89 1234567" },
    { name: "GreenCell Berlin Hub", location: "Berlin, Germany", contact: "+49 30 9876543" }
  ],
  warrantyInfo: "5-year manufacturer warranty covering defects. Free recycling guarantee at end of life. Extended warranty options available.",
  dateOfManufacture: new Date("2025-08-15"),
  dateOfFirstSale: new Date("2025-10-10"),
  ownershipHistory: [
    { owner: "GreenCell Technologies GmbH", date: "2025-08-15", action: "Manufactured" },
    { owner: "EuroTech Distribution", date: "2025-09-01", action: "Wholesale Transfer" },
    { owner: "PowerMax Retail", date: "2025-10-10", action: "Retail Stock" }
  ],
  ceMarking: true,
  safetyCertifications: ["UN38.3", "IEC 62133", "UL 2054"],
  recyclingInstructions: "Return to certified battery recycling facility. Contains hazardous materials - do not dispose in regular waste.\n\n1. Discharge to 50% before return\n2. Use manufacturer take-back program\n3. Or return to EU Battery Collection Network",
  disassemblyInstructions: "Remove outer casing (4 screws). Disconnect BMS board. Extract cell pack. Separate cells for recycling.",
  hazardWarnings: "Risk of fire if damaged. Do not puncture, crush, or expose to temperatures above 60C.",
  takeBackPrograms: ["GreenCell Take-Back Program", "EU Battery Collection Network"],
  qrCodeData: null,
  productImage: "/assets/stock_images/battery_pack_pro.png",
};

const demoTraceEvents: Partial<TraceEvent>[] = [
  {
    id: "demo-1",
    productId: "demo",
    eventType: "manufactured",
    timestamp: new Date("2025-08-15T10:00:00Z"),
    actor: "GreenCell Technologies GmbH",
    location: { name: "Munich, Germany" },
    description: "Product manufactured using 100% renewable energy",
    metadata: {},
    createdAt: new Date("2025-08-15T10:00:00Z"),
    parentEventId: null,
  },
  {
    id: "demo-2",
    productId: "demo",
    eventType: "inspected",
    timestamp: new Date("2025-08-20T14:30:00Z"),
    actor: "TUV Rheinland",
    location: { name: "Munich, Germany" },
    description: "Passed UN38.3 safety testing and IEC 62133 certification",
    metadata: {},
    createdAt: new Date("2025-08-20T14:30:00Z"),
    parentEventId: null,
  },
  {
    id: "demo-3",
    productId: "demo",
    eventType: "shipped",
    timestamp: new Date("2025-09-01T09:00:00Z"),
    actor: "Green Logistics",
    location: { name: "Frankfurt Hub" },
    description: "Carbon-neutral shipping via electric vehicles",
    metadata: {},
    createdAt: new Date("2025-09-01T09:00:00Z"),
    parentEventId: null,
  },
  {
    id: "demo-4",
    productId: "demo",
    eventType: "received",
    timestamp: new Date("2025-10-10T11:00:00Z"),
    actor: "PowerMax Retail",
    location: { name: "Berlin, Germany" },
    description: "Received at retail distribution center",
    metadata: {},
    createdAt: new Date("2025-10-10T11:00:00Z"),
    parentEventId: null,
  },
];

const demoRegionalExtensions: Partial<DppRegionalExtension>[] = [
  {
    id: "demo-eu",
    productId: "demo",
    regionCode: "EU",
    complianceStatus: "compliant",
    schemaVersion: "1.0",
    payload: {
      EU: {
        espr: {
          productCategory: "Batteries",
          complianceStatus: "compliant",
          dppVersion: "1.0",
          validFrom: "2025-08-15",
          validUntil: "2030-08-15"
        },
        batteryRegulation: {
          batteryType: "industrial",
          stateOfHealth: 100,
          carbonFootprintClass: "B",
          cobaltSourcingDueDiligence: true,
          recycledContentCobalt: 18,
          recycledContentLithium: 12,
          recycledContentNickel: 8
        },
        ceMarking: true,
        eprRegistrationId: "DE-EPR-BAT-2025-0842",
        repairabilityIndex: 7.2
      }
    }
  },
  {
    id: "demo-cn",
    productId: "demo",
    regionCode: "CN",
    complianceStatus: "compliant",
    schemaVersion: "1.0",
    payload: {
      CN: {
        ccc: {
          certificateNumber: "CCC-2025-LI-0842",
          required: true,
          validUntil: "2028-08-15",
          certificationBody: "China Quality Certification Center"
        },
        gbStandards: {
          applicableStandards: ["GB 31241-2022", "GB/T 18287-2013"],
          complianceStatus: "compliant"
        },
        dualCarbon: {
          carbonIntensity: 12.5,
          carbonQuotaStatus: "within_quota",
          greenProductCertified: true
        }
      }
    }
  }
];

const demoAIInsights: Partial<AIInsight>[] = [
  {
    id: "demo-ai-1",
    productId: "demo",
    insightType: "summary",
    content: {
      headline: "Premium Industrial Li-Ion Battery with EU DPP Compliance",
      keyPoints: [
        "5000mAh capacity with 8-year expected lifespan",
        "22% recycled content, 95% recyclable at end of life",
        "Full EU Battery Regulation 2023/1542 compliance",
        "Conflict-free cobalt sourcing with due diligence documentation"
      ],
      targetAudience: "Industrial equipment manufacturers and OEMs"
    }
  },
  {
    id: "demo-ai-2",
    productId: "demo",
    insightType: "sustainability",
    content: {
      overallScore: 82,
      carbonFootprint: { value: 12, unit: "kg CO2e", benchmark: "Below industry average of 18 kg CO2e" },
      recommendations: [
        "Consider increasing recycled lithium content to 20%",
        "Explore renewable energy for electrode manufacturing"
      ],
      certifications: ["ISO 14001", "Carbon Trust Certified"]
    }
  },
  {
    id: "demo-ai-3",
    productId: "demo",
    insightType: "circularity",
    content: {
      score: 88,
      grade: "A",
      recyclabilityAnalysis: "95% recyclable through specialized battery recycling. High-value metals (lithium, cobalt, nickel) fully recoverable.",
      materialEfficiency: "Compact design with 22% recycled content. Industry-leading recycled cobalt percentage.",
      endOfLifeOptions: ["Manufacturer take-back", "EU Battery Collection Network", "Certified recyclers"]
    }
  },
  {
    id: "demo-ai-4",
    productId: "demo",
    insightType: "risk_assessment",
    content: {
      overallRisk: "Low",
      dataCompleteness: 96,
      counterfeitRisk: "Very Low - QR-linked digital passport, tamper-evident packaging, blockchain-verified provenance",
      complianceIssues: [],
      recommendations: ["Maintain supply chain documentation for audits"]
    }
  }
];

const eventTypeIcons: Record<string, typeof Truck> = {
  manufactured: Factory,
  shipped: Truck,
  received: Box,
  transferred: ArrowRight,
  inspected: CheckCircle2,
  repaired: Wrench,
  recycled: Recycle,
  disposed: Package,
  custom: Sparkles,
};

const eventTypeLabels: Record<string, string> = {
  manufactured: "Manufactured",
  shipped: "Shipped",
  received: "Received",
  transferred: "Transferred",
  inspected: "Quality Inspected",
  repaired: "Repaired",
  recycled: "Recycled",
  disposed: "End of Life",
  custom: "Event",
};

const regionNames: Record<string, string> = {
  EU: "European Union",
  CN: "China",
  US: "United States",
  IN: "India",
  OTHER: "Other Markets"
};

const regionFlags: Record<string, string> = {
  EU: "🇪🇺",
  CN: "🇨🇳",
  US: "🇺🇸",
  IN: "🇮🇳",
  OTHER: "🌐"
};

interface CollapsibleSectionProps {
  title: string;
  icon: typeof Package;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
}

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false, badge }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover-elevate">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className="h-5 w-5" />
                {title}
              </CardTitle>
              <div className="flex items-center gap-2">
                {badge}
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>{children}</CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded"
      aria-label={`Copy ${label ?? text}`}
      data-testid={`button-copy-${(label ?? "value").replace(/\s+/g, "-")}`}
    >
      {copied
        ? <Check className="w-3 h-3 text-green-500" />
        : <Copy className="w-3 h-3" />}
    </button>
  );
}

interface PublicScanProps {
  isDemo?: boolean;
}

export default function PublicScan({ isDemo = false }: PublicScanProps) {
  const params = useParams<{ id: string }>();

  const { data: fetchedProduct, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", params.id],
    enabled: !isDemo && !!params.id,
  });

  const { data: fetchedTraceEvents } = useQuery<TraceEvent[]>({
    queryKey: ["/api/products", params.id, "trace"],
    enabled: !isDemo && !!params.id,
  });

  const { data: qrCode } = useQuery<QRCodeType>({
    queryKey: ["/api/products", params.id, "qr"],
    enabled: !isDemo && !!params.id,
  });

  const { data: fetchedRegionalExtensions } = useQuery<DppRegionalExtension[]>({
    queryKey: ["/api/products", params.id, "regional-extensions"],
    enabled: !isDemo && !!params.id,
  });

  const { data: fetchedAIInsights } = useQuery<AIInsight[]>({
    queryKey: ["/api/products", params.id, "insights"],
    enabled: !isDemo && !!params.id,
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const scanMutation = useMutation({
    mutationFn: async (qrId: string) => {
      await apiRequest("POST", `/api/qr/${qrId}/scan`);
    },
  });

  useEffect(() => {
    if (qrCode?.id && !isDemo) {
      scanMutation.mutate(qrCode.id);
    }
  }, [qrCode?.id, isDemo]);

  const product = isDemo ? (demoProduct as Product) : fetchedProduct;
  const traceEvents = isDemo ? (demoTraceEvents as TraceEvent[]) : fetchedTraceEvents;
  const regionalExtensions = isDemo ? (demoRegionalExtensions as DppRegionalExtension[]) : fetchedRegionalExtensions;
  const aiInsights = isDemo ? (demoAIInsights as AIInsight[]) : fetchedAIInsights;

  const getSummaryInsight = () => aiInsights?.find(i => i.insightType === "summary")?.content as { headline?: string; keyPoints?: string[] } | undefined;
  const getSustainabilityInsight = () => aiInsights?.find(i => i.insightType === "sustainability")?.content as { overallScore?: number; carbonFootprint?: { value: number; unit: string; benchmark: string }; recommendations?: string[] } | undefined;
  const getCircularityInsight = () => aiInsights?.find(i => i.insightType === "circularity")?.content as { score?: number; grade?: string; recyclabilityAnalysis?: string; endOfLifeOptions?: string[] } | undefined;
  const getRiskInsight = () => aiInsights?.find(i => i.insightType === "risk_assessment")?.content as { overallRisk?: string; dataCompleteness?: number; counterfeitRisk?: string } | undefined;

  if (!isDemo && isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="shimmer h-12 w-12 rounded-full mx-auto" />
            <div className="shimmer h-10 w-64 mx-auto rounded-lg" />
            <div className="shimmer h-6 w-48 mx-auto rounded-lg" />
          </div>
          <div className="shimmer h-64 w-full rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="shimmer h-32 w-full rounded-xl" />
            <div className="shimmer h-32 w-full rounded-xl" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="shimmer h-24 w-full rounded-xl" />
            <div className="shimmer h-24 w-full rounded-xl" />
            <div className="shimmer h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!isDemo && (error || !product)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <p className="text-muted-foreground max-w-md">
            The product you scanned doesn't exist or has been removed. Please check
            the QR code and try again.
          </p>
          <Link href="/">
            <Badge variant="secondary" className="cursor-pointer">
              Return Home
            </Badge>
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const summaryInsight = getSummaryInsight();
  const sustainabilityInsight = getSustainabilityInsight();
  const circularityInsight = getCircularityInsight();
  const riskInsight = getRiskInsight();

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {isDemo && (
        <div className="bg-primary/10 border-b border-primary/20 mt-16">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm">
              This is an example passport. See how PhotonicTag can work for your products.
            </p>
            <Button size="sm" asChild data-testid="button-demo-signup">
              <a href="https://calendar.app.google/Aa9nfUnJiZvcjXi28" target="_blank" rel="noopener noreferrer">
                Book a Demo
              </a>
            </Button>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {product.productImage ? (
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                <img
                  src={product.productImage}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                  data-testid="img-product-hero"
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
                <Package className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" data-testid="text-public-product-name">
                {product.productName}
              </h1>
              <p className="text-lg text-muted-foreground" data-testid="text-public-manufacturer">
                {product.manufacturer}
              </p>
              {summaryInsight?.headline && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  {summaryInsight.headline}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="font-mono gap-1">
                <Hash className="h-3 w-3" />
                {product.batchNumber}
                <CopyButton text={product.batchNumber ?? ""} label="batch number" />
              </Badge>
              {product.ceMarking && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  CE
                </Badge>
              )}
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                Verified
              </Badge>
            </div>
            
            {(() => {
              const deadline = getCategoryDeadline(product.productCategory || null);
              return (
                <Card className={`mt-4 ${deadline.urgent ? 'border-destructive bg-destructive/5' : 'border-amber-500/50 bg-amber-500/5'}`} data-testid="card-compliance-deadline">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${deadline.urgent ? 'bg-destructive/10' : 'bg-amber-500/10'}`}>
                        <Clock className={`h-5 w-5 ${deadline.urgent ? 'text-destructive' : 'text-amber-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm">EU DPP Compliance Deadline</h3>
                          <Badge variant={deadline.urgent ? "destructive" : "secondary"} className="text-xs">
                            {deadline.date}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {deadline.description}
                        </p>
                        <p className="text-xs mt-2">
                          <span className="font-medium">Category:</span> {product.productCategory || "General"} 
                          <span className="mx-2">|</span>
                          <span className="font-medium">Regulation:</span> ESPR (EU) 2024/1781
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </div>

          <div className="space-y-4">
            {(product.qrCodeData || qrCode?.qrImageUrl) && (
              <Card>
                <CardContent className="p-4 flex flex-col items-center">
                  <img
                    src={product.qrCodeData || qrCode?.qrImageUrl || ""}
                    alt="Product QR Code"
                    className="w-40 h-40 rounded"
                    data-testid="img-qr-code"
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Scan to verify authenticity
                  </p>
                  {qrCode?.scanCount !== undefined && qrCode.scanCount > 0 && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      Scanned {qrCode.scanCount} times
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )}
            
            {regionalExtensions && regionalExtensions.length > 0 && (
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Regional Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {regionalExtensions.map((ext) => (
                      <Badge 
                        key={ext.regionCode}
                        variant={ext.complianceStatus === "compliant" ? "default" : "outline"}
                        className="gap-1"
                      >
                        {ext.complianceStatus === "compliant" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <AlertTriangle className="h-3 w-3" />
                        )}
                        {regionFlags[ext.regionCode]}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Leaf className="h-4 w-4" />
                Carbon Footprint
              </div>
              <div className="text-2xl font-bold" data-testid="text-public-carbon">
                {product.carbonFootprint}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  kg CO2e
                </span>
              </div>
              {sustainabilityInsight?.overallScore && (
                <Progress value={sustainabilityInsight.overallScore} className="h-1.5 mt-2" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Wrench className="h-4 w-4" />
                Repairability
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold" data-testid="text-public-repairability">
                  {product.repairabilityScore}
                </span>
                <span className="text-sm text-muted-foreground mb-1">/10</span>
              </div>
              <Progress value={product.repairabilityScore * 10} className="h-1.5 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Recycle className="h-4 w-4" />
                Circularity
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">
                  {circularityInsight?.grade || (product.recyclabilityPercent ? `${product.recyclabilityPercent}%` : "N/A")}
                </span>
                {circularityInsight?.score && (
                  <span className="text-sm text-muted-foreground mb-1">
                    ({circularityInsight.score}/100)
                  </span>
                )}
              </div>
              {circularityInsight?.score && (
                <Progress value={circularityInsight.score} className="h-1.5 mt-2" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Shield className="h-4 w-4" />
                Risk Level
              </div>
              <div className="text-2xl font-bold" data-testid="text-public-risk">
                {riskInsight?.overallRisk || "Low"}
              </div>
              {riskInsight?.dataCompleteness && (
                <div className="text-xs text-muted-foreground mt-1">
                  {riskInsight.dataCompleteness}% data complete
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <CollapsibleSection
          title="Product Identity"
          icon={Package}
          defaultOpen={true}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Factory className="h-4 w-4" />
                Manufacturer
              </div>
              <p className="font-medium">{product.manufacturer}</p>
              {product.manufacturerAddress && (
                <p className="text-sm text-muted-foreground">{product.manufacturerAddress}</p>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                Origin
              </div>
              <p className="font-medium">{product.countryOfOrigin || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Hash className="h-4 w-4" />
                Model / SKU
              </div>
              <p className="font-mono font-medium">{product.modelNumber || product.sku || product.batchNumber}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Manufactured
              </div>
              <p className="font-medium">
                {product.dateOfManufacture ? new Date(product.dateOfManufacture).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                }) : "Not specified"}
              </p>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Materials & Composition"
          icon={CircleDot}
          badge={
            product.recycledContentPercent ? (
              <Badge variant="secondary" className="text-xs">
                {product.recycledContentPercent}% Recycled
              </Badge>
            ) : undefined
          }
        >
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed" data-testid="text-public-materials">
              {product.materials}
            </p>
            
            {product.materialBreakdown && Array.isArray(product.materialBreakdown) && product.materialBreakdown.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Material Breakdown</h4>
                  <div className="space-y-2">
                    {(product.materialBreakdown as Array<{ material: string; percentage: number; recyclable?: boolean }>).map((m, i) => (
                      <div key={i} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-sm truncate">{m.material}</span>
                          {m.recyclable && (
                            <Recycle className="h-3 w-3 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Progress value={m.percentage} className="w-20 h-1.5" />
                          <span className="text-sm text-muted-foreground w-10 text-right">{m.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {product.hazardousMaterials && (
              <>
                <Separator />
                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{product.hazardousMaterials}</p>
                </div>
              </>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Sustainability"
          icon={Leaf}
          badge={
            sustainabilityInsight?.overallScore ? (
              <Badge variant="secondary" className="text-xs">
                Score: {sustainabilityInsight.overallScore}/100
              </Badge>
            ) : undefined
          }
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {product.carbonFootprint && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Leaf className="h-4 w-4" />
                    Carbon Footprint
                  </div>
                  <p className="font-medium">{product.carbonFootprint} kg CO2e</p>
                </div>
              )}
              {product.waterUsage && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Droplet className="h-4 w-4" />
                    Water Usage
                  </div>
                  <p className="font-medium">{product.waterUsage} L</p>
                </div>
              )}
              {product.energyConsumption && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    Energy
                  </div>
                  <p className="font-medium">{product.energyConsumption} kWh</p>
                </div>
              )}
            </div>
            
            {product.environmentalCertifications && Array.isArray(product.environmentalCertifications) && product.environmentalCertifications.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Environmental Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.environmentalCertifications.map((cert, i) => (
                      <Badge key={i} variant="outline" className="gap-1">
                        <Award className="h-3 w-3" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {sustainabilityInsight?.recommendations && sustainabilityInsight.recommendations.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Recommendations
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {sustainabilityInsight.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ArrowRight className="h-3 w-3 mt-1 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Durability & Repair"
          icon={Wrench}
          badge={
            product.sparePartsAvailable ? (
              <Badge variant="secondary" className="text-xs">
                Parts Available
              </Badge>
            ) : undefined
          }
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Repairability Score</div>
                <p className="font-medium">{product.repairabilityScore}/10</p>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Expected Lifespan</div>
                <p className="font-medium">{product.expectedLifespanYears} years</p>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Spare Parts</div>
                <p className="font-medium">{product.sparePartsAvailable ? "Available" : "Not Available"}</p>
              </div>
            </div>
            
            {product.repairInstructions && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Repair Instructions</h4>
                  <p className="text-sm text-muted-foreground">{product.repairInstructions}</p>
                </div>
              </>
            )}
            
            {product.serviceCenters && Array.isArray(product.serviceCenters) && product.serviceCenters.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Service Centers</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(product.serviceCenters as Array<{ name: string; location: string; contact?: string }>).map((center, i) => (
                      <div key={i} className="p-3 bg-muted/50 rounded-md">
                        <p className="font-medium text-sm">{center.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {center.location}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {product.warrantyInfo && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Warranty
                  </h4>
                  <p className="text-sm text-muted-foreground" data-testid="text-public-warranty">{product.warrantyInfo}</p>
                </div>
              </>
            )}
          </div>
        </CollapsibleSection>

        {traceEvents && traceEvents.length > 0 && (
          <CollapsibleSection
            title="Product Journey"
            icon={Truck}
            defaultOpen={true}
            badge={
              <Badge variant="outline" className="text-xs">
                {traceEvents.length} events
              </Badge>
            }
          >
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-6">
                {traceEvents.map((event) => {
                  const Icon = eventTypeIcons[event.eventType] || Sparkles;
                  return (
                    <div
                      key={event.id}
                      className="relative pl-10"
                      data-testid={`public-trace-event-${event.id}`}
                    >
                      <div className="absolute left-0 w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">
                            {eventTypeLabels[event.eventType] || event.eventType}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {event.actor}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(event.timestamp).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {typeof event.location === "object" && event.location.name
                                ? event.location.name
                                : String(event.location)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CollapsibleSection>
        )}

        <CollapsibleSection
          title="End of Life"
          icon={Recycle}
          badge={
            circularityInsight?.grade ? (
              <Badge variant="secondary" className="text-xs">
                Grade: {circularityInsight.grade}
              </Badge>
            ) : undefined
          }
        >
          <div className="space-y-4">
            {product.recyclingInstructions && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recycling Instructions</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line" data-testid="text-public-recycling">
                  {product.recyclingInstructions}
                </p>
              </div>
            )}
            
            {product.disassemblyInstructions && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Disassembly Instructions</h4>
                  <p className="text-sm text-muted-foreground">{product.disassemblyInstructions}</p>
                </div>
              </>
            )}

            {product.takeBackPrograms && Array.isArray(product.takeBackPrograms) && product.takeBackPrograms.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Take-Back Programs</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.takeBackPrograms.map((program, i) => (
                      <Badge key={i} variant="outline" className="gap-1">
                        <Recycle className="h-3 w-3" />
                        {program}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {product.hazardWarnings && (
              <>
                <Separator />
                <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-600">Hazard Warning</p>
                    <p className="text-sm text-muted-foreground">{product.hazardWarnings}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CollapsibleSection>

        {regionalExtensions && regionalExtensions.length > 0 && (
          <CollapsibleSection
            title="Regional Compliance"
            icon={Globe}
            badge={
              <Badge variant="secondary" className="text-xs">
                {regionalExtensions.length} regions
              </Badge>
            }
          >
            <div className="space-y-4">
              {regionalExtensions.map((ext) => (
                <div key={ext.regionCode} className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{regionFlags[ext.regionCode]}</Badge>
                      <span className="font-medium">{regionNames[ext.regionCode]}</span>
                    </div>
                    <Badge 
                      variant={ext.complianceStatus === "compliant" ? "default" : "secondary"}
                      className="gap-1"
                    >
                      {ext.complianceStatus === "compliant" ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {ext.complianceStatus}
                    </Badge>
                  </div>
                  
                  {ext.payload && typeof ext.payload === "object" && (
                    <div className="pl-4 border-l-2 border-muted space-y-2">
                      {ext.regionCode === "EU" && (ext.payload as any).EU && (() => {
                        const eu = (ext.payload as any).EU;
                        return (
                          <div className="space-y-2">
                            {/* ESPR */}
                            {eu.espr && (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  <Shield className="h-4 w-4 text-primary" />
                                  <span>ESPR — Regulation (EU) 2024/1781</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 pl-6 text-xs text-muted-foreground">
                                  <div>DPP version: <span className="font-mono text-foreground">{eu.espr.dppVersion}</span></div>
                                  <div>Category: <span className="text-foreground">{eu.espr.productCategory}</span></div>
                                  {eu.espr.complianceStatus && (
                                    <div>Status: <Badge variant={eu.espr.complianceStatus === "compliant" ? "default" : "outline"} className={`text-xs ${eu.espr.complianceStatus === "compliant" ? "bg-green-600" : "border-amber-500 text-amber-600"}`}>{eu.espr.complianceStatus}</Badge></div>
                                  )}
                                  {eu.ceMarking && (
                                    <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-600" /><span className="text-foreground">CE Marked</span></div>
                                  )}
                                </div>
                              </div>
                            )}
                            {/* Battery Regulation */}
                            {eu.batteryRegulation && (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  <Zap className="h-4 w-4 text-amber-500" />
                                  <span>Battery Regulation 2023/1542</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 pl-6 text-xs text-muted-foreground">
                                  <div>Type: <span className="text-foreground capitalize">{eu.batteryRegulation.batteryType?.replace(/_/g, " ")}</span></div>
                                  {eu.batteryRegulation.carbonFootprintClass && <div>Carbon Class: <span className="text-foreground">{eu.batteryRegulation.carbonFootprintClass}</span></div>}
                                  {eu.batteryRegulation.stateOfHealth !== undefined && <div>State of Health: <span className="text-foreground">{eu.batteryRegulation.stateOfHealth}%</span></div>}
                                  {eu.batteryRegulation.recycledContentCobalt !== undefined && <div>Recycled Co: <span className="text-foreground">{eu.batteryRegulation.recycledContentCobalt}%</span></div>}
                                  {eu.batteryRegulation.recycledContentLithium !== undefined && <div>Recycled Li: <span className="text-foreground">{eu.batteryRegulation.recycledContentLithium}%</span></div>}
                                  {eu.batteryRegulation.recycledContentNickel !== undefined && <div>Recycled Ni: <span className="text-foreground">{eu.batteryRegulation.recycledContentNickel}%</span></div>}
                                </div>
                              </div>
                            )}
                            {/* REACH / SCIP */}
                            {eu.reach && (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                  <span>REACH — Chemical Compliance</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 pl-6 text-xs text-muted-foreground">
                                  {eu.reach.scipId && <div>SCIP ID: <span className="font-mono text-foreground">{eu.reach.scipId}</span></div>}
                                  <div>SVHC: <Badge variant={eu.reach.svhcPresent ? "destructive" : "default"} className="text-xs">{eu.reach.svhcPresent ? "Present" : "None"}</Badge></div>
                                  {eu.reach.svhcPresent && eu.reach.svhcSubstances?.length > 0 && (
                                    <div className="col-span-2">Substances: <span className="text-foreground">{eu.reach.svhcSubstances.join(", ")}</span></div>
                                  )}
                                </div>
                              </div>
                            )}
                            {/* EPR & Repairability */}
                            {(eu.eprRegistrationId || eu.repairabilityIndex !== undefined) && (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  <Recycle className="h-4 w-4 text-green-600" />
                                  <span>EPR &amp; Repairability</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 pl-6 text-xs text-muted-foreground">
                                  {eu.eprRegistrationId && <div>EPR ID: <span className="font-mono text-foreground">{eu.eprRegistrationId}</span></div>}
                                  {eu.repairabilityIndex !== undefined && (
                                    <div className="flex items-center gap-1">
                                      Repairability: <span className="text-foreground font-medium">{eu.repairabilityIndex}/10</span>
                                      <Badge variant="outline" className={`text-xs ml-1 ${eu.repairabilityIndex >= 7 ? "border-green-500 text-green-600" : eu.repairabilityIndex >= 5 ? "border-amber-500 text-amber-600" : "border-red-500 text-red-600"}`}>
                                        {eu.repairabilityIndex >= 7 ? "Good" : eu.repairabilityIndex >= 5 ? "Moderate" : "Low"}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      {ext.regionCode === "CN" && (ext.payload as any).CN && (
                        <>
                          {(ext.payload as any).CN.ccc && (
                            <div className="flex items-center gap-2 text-sm">
                              <FileCheck className="h-4 w-4 text-muted-foreground" />
                              <span>CCC Certificate: {(ext.payload as any).CN.ccc.certificateNumber}</span>
                            </div>
                          )}
                          {(ext.payload as any).CN.gbStandards && (
                            <div className="flex items-center gap-2 text-sm">
                              <BarChart3 className="h-4 w-4 text-muted-foreground" />
                              <span>GB Standards: {(ext.payload as any).CN.gbStandards.applicableStandards?.join(", ")}</span>
                            </div>
                          )}
                          {(ext.payload as any).CN.dualCarbon?.greenProductCertified && (
                            <div className="flex items-center gap-2 text-sm">
                              <Leaf className="h-4 w-4 text-muted-foreground" />
                              <span>Green Product Certified</span>
                            </div>
                          )}
                        </>
                      )}
                      {ext.regionCode === "US" && (ext.payload as any).US && (
                        <>
                          {(ext.payload as any).US.ftc?.greenGuidesCompliant && (
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                              <span>FTC Green Guides Compliant</span>
                            </div>
                          )}
                          {(ext.payload as any).US.stateEPR?.registeredStates && (
                            <div className="flex items-center gap-2 text-sm">
                              <Recycle className="h-4 w-4 text-muted-foreground" />
                              <span>State EPR: {(ext.payload as any).US.stateEPR.registeredStates.join(", ")}</span>
                            </div>
                          )}
                        </>
                      )}
                      {ext.regionCode === "IN" && (ext.payload as any).IN && (
                        <>
                          {(ext.payload as any).IN.bis && (
                            <div className="flex items-center gap-2 text-sm">
                              <FileCheck className="h-4 w-4 text-muted-foreground" />
                              <span>BIS: {(ext.payload as any).IN.bis.registrationNumber}</span>
                            </div>
                          )}
                          {(ext.payload as any).IN.epr && (
                            <div className="flex items-center gap-2 text-sm">
                              <Recycle className="h-4 w-4 text-muted-foreground" />
                              <span>EPR Registration: {(ext.payload as any).IN.epr.registrationNumber}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  
                  {regionalExtensions.indexOf(ext) < regionalExtensions.length - 1 && (
                    <Separator />
                  )}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {product.safetyCertifications && Array.isArray(product.safetyCertifications) && product.safetyCertifications.length > 0 && (
          <CollapsibleSection
            title="Compliance & Certifications"
            icon={Award}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {product.safetyCertifications.map((cert, i) => (
                  <Badge key={i} variant="outline" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          </CollapsibleSection>
        )}

        {summaryInsight?.keyPoints && summaryInsight.keyPoints.length > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI-Powered Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <ul className="space-y-2">
                {summaryInsight.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {allProducts.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5" />
                Explore More Digital Product Passports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {allProducts
                  .filter(p => p.id !== product.id)
                  .slice(0, 6)
                  .map(p => (
                    <Link key={p.id} href={`/product/${p.id}`}>
                      <div className="group p-3 rounded-lg border hover-elevate cursor-pointer transition-all">
                        {p.productImage && (
                          <div className="aspect-video w-full rounded-md overflow-hidden bg-muted mb-2">
                            <img 
                              src={p.productImage} 
                              alt={p.productName || "Product"} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="space-y-1">
                          <p className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                            {p.productName}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {p.manufacturer}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {p.productCategory}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
              <div className="mt-4 text-center">
                <Link href="/scan/demo">
                  <Button variant="outline" size="sm" data-testid="button-view-all-demos">
                    View More Examples
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      
      <PublicFooter />
    </div>
  );
}
