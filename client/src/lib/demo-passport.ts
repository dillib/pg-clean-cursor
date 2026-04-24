/**
 * Shared demo passport fixture for the consumer scan page.
 *
 * Used when the URL is /product/demo (or PublicScanV2 receives isDemo=true)
 * so the demo experience works without a backend round-trip. Extracted from
 * the legacy public-scan.tsx during the v1 → v2 consolidation so the v2 page
 * doesn't bloat with ~200 lines of static data.
 */
import type {
  Product,
  TraceEvent,
  DppRegionalExtension,
  AIInsight,
} from "@shared/schema";

export const demoProduct: Partial<Product> & {
  id: string;
  productName: string;
  manufacturer: string;
  batchNumber: string;
  materials: string;
  carbonFootprint: number;
  repairabilityScore: number;
  warrantyInfo: string;
  recyclingInstructions: string;
} = {
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
  materials:
    "Lithium Cobalt Oxide (35%), Graphite Anode (25%), Aluminum Casing (20%), Copper Foil (15%), Polymer Separator (5%). All materials sourced from certified suppliers with full supply chain documentation.",
  materialBreakdown: [
    { material: "Lithium Cobalt Oxide", percentage: 35, recyclable: true },
    { material: "Graphite", percentage: 25, recyclable: true },
    { material: "Aluminum", percentage: 20, recyclable: true },
    { material: "Copper", percentage: 15, recyclable: true },
    { material: "Polymer", percentage: 5, recyclable: false },
  ],
  recycledContentPercent: 22,
  recyclabilityPercent: 95,
  hazardousMaterials: "Contains lithium - Class 9 hazardous material for transport",
  carbonFootprint: 12,
  waterUsage: 850,
  energyConsumption: 45,
  environmentalCertifications: [
    "ISO 14001",
    "Carbon Trust Certified",
    "EU Battery Regulation 2023/1542",
  ],
  repairabilityScore: 7,
  expectedLifespanYears: 8,
  sparePartsAvailable: true,
  repairInstructions:
    "Battery cells can be replaced by certified technicians. See service manual for disassembly procedure.",
  warrantyInfo:
    "5-year manufacturer warranty covering defects. Free recycling guarantee at end of life. Extended warranty options available.",
  dateOfManufacture: new Date("2025-08-15"),
  dateOfFirstSale: new Date("2025-10-10"),
  ceMarking: true,
  safetyCertifications: ["UN38.3", "IEC 62133", "UL 2054"],
  recyclingInstructions:
    "Return to certified battery recycling facility. Contains hazardous materials - do not dispose in regular waste.\n\n1. Discharge to 50% before return\n2. Use manufacturer take-back program\n3. Or return to EU Battery Collection Network",
  hazardWarnings:
    "Risk of fire if damaged. Do not puncture, crush, or expose to temperatures above 60C.",
  qrCodeData: null,
  productImage: "/assets/stock_images/battery_pack_pro.png",
};

export const demoTraceEvents: Partial<TraceEvent>[] = [
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

export const demoRegionalExtensions: Partial<DppRegionalExtension>[] = [
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
          validUntil: "2030-08-15",
        },
        batteryRegulation: {
          batteryType: "industrial",
          stateOfHealth: 100,
          carbonFootprintClass: "B",
          recycledContentCobalt: 18,
          recycledContentLithium: 12,
          recycledContentNickel: 8,
        },
        ceMarking: true,
        eprRegistrationId: "DE-EPR-BAT-2025-0842",
      },
    },
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
        },
        gbStandards: {
          applicableStandards: ["GB 31241-2022", "GB/T 18287-2013"],
          complianceStatus: "compliant",
        },
      },
    },
  },
];

export const demoAIInsights: Partial<AIInsight>[] = [
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
        "Conflict-free cobalt sourcing with due diligence documentation",
      ],
      targetAudience: "Industrial equipment manufacturers and OEMs",
    },
  },
  {
    id: "demo-ai-2",
    productId: "demo",
    insightType: "sustainability",
    content: {
      overallScore: 82,
      carbonFootprint: { value: 12, unit: "kg CO2e", benchmark: "Below industry average of 18 kg CO2e" },
    },
  },
  {
    id: "demo-ai-3",
    productId: "demo",
    insightType: "circularity",
    content: {
      score: 88,
      grade: "A",
      recyclabilityAnalysis:
        "95% recyclable through specialized battery recycling. High-value metals (lithium, cobalt, nickel) fully recoverable.",
    },
  },
  {
    id: "demo-ai-4",
    productId: "demo",
    insightType: "risk_assessment",
    content: {
      overallRisk: "Low",
      dataCompleteness: 96,
    },
  },
];

/**
 * Category-to-deadline lookup for the consumer-facing compliance banner.
 * Anchored to the public industriesMenu deadlines but keyed by the product
 * categories actually used in the schema. Falls back to a generic ESPR
 * default for uncategorised products.
 */
export const categoryDeadlineInfo: Record<
  string,
  { date: string; urgent: boolean; description: string }
> = {
  Batteries: {
    date: "February 18, 2027",
    urgent: true,
    description:
      "EU Battery Regulation requires Digital Product Passports for all industrial and EV batteries.",
  },
  "EV Accessories": {
    date: "February 2027",
    urgent: true,
    description: "Battery-related products fall under EU Battery Regulation compliance requirements.",
  },
  Apparel: {
    date: "Late 2027",
    urgent: false,
    description: "Textiles and apparel require DPPs under ESPR Regulation (EU) 2024/1781.",
  },
  "Fashion Accessories": {
    date: "Late 2027",
    urgent: false,
    description: "Fashion accessories fall under textile DPP requirements.",
  },
  "Consumer Electronics": {
    date: "Late 2027",
    urgent: false,
    description: "Electronics require DPPs for sustainability and repairability transparency.",
  },
  "IoT Devices": {
    date: "Late 2027",
    urgent: false,
    description: "Smart devices fall under electronics DPP requirements.",
  },
  "Smart Home": {
    date: "Late 2027",
    urgent: false,
    description: "Smart home devices require DPPs for electronics compliance.",
  },
  "Industrial Packaging": {
    date: "2028-2029",
    urgent: false,
    description: "Packaging materials subject to upcoming ESPR requirements.",
  },
};

export function getCategoryDeadline(
  category: string | null,
): { date: string; urgent: boolean; description: string } {
  if (!category) {
    return {
      date: "By 2030",
      urgent: false,
      description: "Subject to EU ESPR regulation requirements.",
    };
  }
  return (
    categoryDeadlineInfo[category] ?? {
      date: "By 2030",
      urgent: false,
      description: "Subject to EU ESPR regulation requirements.",
    }
  );
}
