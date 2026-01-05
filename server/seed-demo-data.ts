import { storage } from "./storage";
import { qrService } from "./services/qr-service";
import { identityService } from "./services/identity-service";
import { traceService } from "./services/trace-service";
import type { InsertProduct, InsertProductPassport, IoTDeviceType } from "@shared/schema";

interface DemoProductData {
  product: InsertProduct;
  passport: Omit<InsertProductPassport, "productId">;
}

const demoProducts: DemoProductData[] = [
  {
    product: {
      productName: "EcoPower Li-Ion Battery Pack 5000mAh",
      manufacturer: "GreenCell Technologies GmbH",
      batchNumber: "GCT-BAT-2025-0842",
      materials: "Lithium Cobalt Oxide, Graphite Anode, Polymer Separator, Aluminum Casing, Copper Foil",
      carbonFootprint: 12,
      repairabilityScore: 7,
      warrantyInfo: "5-year manufacturer warranty with recycling guarantee",
      recyclingInstructions: "Return to certified battery recycling facility. Contains hazardous materials - do not dispose in regular waste.",
      ownershipHistory: [
        { owner: "GreenCell Technologies GmbH", date: "2025-08-15", action: "Manufactured" },
        { owner: "EuroTech Distribution", date: "2025-09-01", action: "Wholesale Transfer" },
        { owner: "PowerMax Retail", date: "2025-10-10", action: "Retail Stock" }
      ]
    },
    passport: {
      complianceData: {
        euBatteryPassport: true,
        dueDiligence: "Cobalt sourced from certified conflict-free mines",
        carbonDisclosure: "Scope 1, 2, 3 emissions calculated per GHG Protocol",
        recycledContent: "18% recycled lithium, 25% recycled cobalt"
      },
      certifications: ["EU Battery Regulation 2023/1542", "ISO 14001", "UN38.3", "RoHS"],
      environmentalDeclarations: { category: "Batteries", industry: "Electronics" },
      endOfLifeInstructions: "Battery should be discharged to 50% before return. Eligible for manufacturer take-back program."
    }
  },
  {
    product: {
      productName: "Nordic Wool Premium Sweater - Navy",
      manufacturer: "ScandiKnit Fashion AB",
      batchNumber: "SKF-TEX-2025-1847",
      materials: "100% Merino Wool (Patagonian), Organic Cotton Thread, Natural Shell Buttons",
      carbonFootprint: 8,
      repairabilityScore: 9,
      warrantyInfo: "Lifetime repair service for seams and buttons. 2-year warranty against defects.",
      recyclingInstructions: "Donate to textile collection. If damaged beyond repair, return for fiber recycling program.",
      ownershipHistory: [
        { owner: "ScandiKnit Fashion AB", date: "2025-06-20", action: "Manufactured in Gothenburg" },
        { owner: "Nordic Fashion Hub", date: "2025-07-15", action: "Distribution" },
        { owner: "EcoStyle Boutique Berlin", date: "2025-08-01", action: "Retail" }
      ]
    },
    passport: {
      complianceData: {
        euEcodesign: true,
        supplyChainTransparency: "Full traceability from farm to finished product",
        waterUsage: "85% reduction vs. conventional wool processing"
      },
      certifications: ["GOTS Certified", "OEKO-TEX Standard 100", "EU Ecolabel", "Fair Trade"],
      environmentalDeclarations: { category: "Apparel", industry: "Textiles" },
      endOfLifeInstructions: "Return to any ScandiKnit partner store for recycling. Receive 15% discount on next purchase."
    }
  },
  {
    product: {
      productName: "SmartHome Hub Pro X200",
      manufacturer: "TechBridge Electronics Ltd",
      batchNumber: "TBE-IOT-2025-X200-3421",
      materials: "Recycled ABS Plastic (65%), PCB with Lead-Free Solder, Aluminum Heat Sink, Tempered Glass Display",
      carbonFootprint: 18,
      repairabilityScore: 8,
      warrantyInfo: "3-year warranty. Spare parts available for 10 years. Firmware updates for 7 years.",
      recyclingInstructions: "Return to certified WEEE collection point. Device contains recoverable gold, silver, and copper.",
      ownershipHistory: [
        { owner: "TechBridge Electronics Ltd", date: "2025-04-10", action: "Manufactured in Slovenia" },
        { owner: "EU Smart Logistics", date: "2025-05-01", action: "Regional Distribution" }
      ]
    },
    passport: {
      complianceData: {
        rightToRepair: true,
        softwareSupport: "7-year firmware update commitment",
        repairManuals: "Open repair documentation available",
        moduleDesign: "Battery, screen, and main board independently replaceable"
      },
      certifications: ["CE Marked", "FCC Certified", "Energy Star", "TCO Certified", "EPEAT Gold"],
      environmentalDeclarations: { category: "IoT Devices", industry: "Electronics" },
      endOfLifeInstructions: "Professional recycling required. Contains lithium battery - do not incinerate."
    }
  },
  {
    product: {
      productName: "CircularPack Modular Shipping Container",
      manufacturer: "ReLoop Packaging Solutions",
      batchNumber: "RLP-PKG-2024-MOD-1152",
      materials: "Recycled HDPE (100%), Steel Reinforcement Corners, RFID Tag, QR Label",
      carbonFootprint: 45,
      repairabilityScore: 10,
      warrantyInfo: "10-year structural warranty. Tracking system guaranteed for 7 years.",
      recyclingInstructions: "Return to ReLoop network for inspection and refurbishment. After 500 cycles, container is recycled.",
      ownershipHistory: [
        { owner: "ReLoop Packaging Solutions", date: "2024-11-15", action: "Manufactured" },
        { owner: "LogiGreen Network", date: "2024-12-01", action: "Deployed to circulation" }
      ]
    },
    passport: {
      complianceData: {
        circularDesign: true,
        returnRate: "98.5% of containers returned to circulation",
        materialPassport: "Full material composition tracked",
        emissionsAvoided: "Prevents 127 kg CO2e per container vs. single-use"
      },
      certifications: ["ISO 14021", "Cradle to Cradle Silver", "Ellen MacArthur Foundation Award"],
      environmentalDeclarations: { category: "Industrial Packaging", industry: "Logistics" },
      endOfLifeInstructions: "Contact ReLoop for scheduled pickup. 100% recyclable into new containers."
    }
  },
  {
    product: {
      productName: "Alpine EV Charging Cable Type 2 - 7.5m",
      manufacturer: "ChargeTech Europe SA",
      batchNumber: "CTE-EVC-2025-7500-0892",
      materials: "TPE Outer Jacket (Halogen-Free), Oxygen-Free Copper Conductors, Polycarbonate Connector Housing",
      carbonFootprint: 22,
      repairabilityScore: 6,
      warrantyInfo: "5-year warranty on cable. Connector rated for 10,000+ connection cycles.",
      recyclingInstructions: "Cable must be professionally recycled. Copper content makes it valuable for recovery.",
      ownershipHistory: [
        { owner: "ChargeTech Europe SA", date: "2025-09-20", action: "Manufactured in Portugal" },
        { owner: "EV Parts Direct", date: "2025-10-05", action: "Distribution" }
      ]
    },
    passport: {
      complianceData: {
        evReadiness: true,
        safetyTesting: "100% electrical testing before shipment",
        productionEnergy: "Manufactured using 100% renewable energy"
      },
      certifications: ["IEC 62196-2 Type 2", "CE Marked", "TUV SUD Certified", "IP67 Rated"],
      environmentalDeclarations: { category: "EV Accessories", industry: "Automotive" },
      endOfLifeInstructions: "Return to ChargeTech service center. Receive credit toward new cable purchase."
    }
  }
];

const iotDeviceConfigs: { productIndex: number; deviceType: IoTDeviceType; deviceId: string; manufacturer: string; model: string }[] = [
  { productIndex: 0, deviceType: "nfc", deviceId: "NFC-BAT-2025-001", manufacturer: "NXP Semiconductors", model: "NTAG 424 DNA" },
  { productIndex: 1, deviceType: "rfid", deviceId: "RFID-TEX-2025-042", manufacturer: "Impinj", model: "Monza R6" },
  { productIndex: 2, deviceType: "ble", deviceId: "BLE-IOT-2025-X200", manufacturer: "Nordic Semiconductor", model: "nRF52840" },
  { productIndex: 3, deviceType: "rfid", deviceId: "RFID-PKG-2024-1152", manufacturer: "Alien Technology", model: "Higgs-9" },
  { productIndex: 4, deviceType: "qr", deviceId: "QR-EVC-2025-7500", manufacturer: "PhotonicTag", model: "Optical QR" }
];

async function seedDemoData() {
  console.log("Starting demo data seeding...\n");

  for (let i = 0; i < demoProducts.length; i++) {
    const { product: productData, passport: passportData } = demoProducts[i];
    console.log(`Creating product ${i + 1}/${demoProducts.length}: ${productData.productName}`);

    try {
      const product = await storage.createProduct(productData);
      console.log(`  - Product created with ID: ${product.id}`);

      await qrService.generateQRCode(product.id);
      console.log(`  - QR code generated`);

      await identityService.createIdentity(product.id);
      console.log(`  - Identity assigned`);

      await storage.createProductPassport({
        productId: product.id,
        ...passportData
      });
      console.log(`  - Product Passport created`);

      await traceService.recordEvent(product.id, "manufactured", productData.manufacturer, {
        description: `Product registered in PhotonicTag Digital Product Passport system`,
        location: { name: productData.manufacturer }
      });
      console.log(`  - Trace event recorded`);

      const iotConfig = iotDeviceConfigs.find(c => c.productIndex === i);
      if (iotConfig) {
        await storage.createIoTDevice({
          productId: product.id,
          deviceType: iotConfig.deviceType,
          deviceId: iotConfig.deviceId,
          manufacturer: iotConfig.manufacturer,
          model: iotConfig.model,
          status: "active",
          metadata: { productName: productData.productName }
        });
        console.log(`  - IoT device registered (${iotConfig.deviceType.toUpperCase()}: ${iotConfig.deviceId})`);
      }

      console.log(`  [SUCCESS] ${productData.productName}\n`);
    } catch (error) {
      console.error(`  [ERROR] Failed to create ${productData.productName}:`, error);
    }
  }

  console.log("\nDemo data seeding complete!");
  console.log("Created 5 products across industries: Batteries, Textiles, IoT Devices, Packaging, EV Accessories");
}

export { seedDemoData };
