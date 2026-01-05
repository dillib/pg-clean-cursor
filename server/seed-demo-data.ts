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
      productCategory: "Batteries",
      modelNumber: "EP-LION-5000",
      sku: "GCT-BAT-5000-BLK",
      manufacturer: "GreenCell Technologies GmbH",
      manufacturerAddress: "Industriestrasse 42, 80939 Munich, Germany",
      countryOfOrigin: "Germany",
      batchNumber: "GCT-BAT-2025-0842",
      lotNumber: "LOT-2025-Q3-0842",
      materials: "Lithium Cobalt Oxide, Graphite Anode, Polymer Separator, Aluminum Casing, Copper Foil",
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
      environmentalCertifications: ["ISO 14001", "Carbon Trust Certified"],
      repairabilityScore: 7,
      expectedLifespanYears: 8,
      sparePartsAvailable: true,
      repairInstructions: "Battery cells can be replaced by certified technicians. See service manual for disassembly procedure.",
      serviceCenters: [
        { name: "GreenCell Munich Service", location: "Munich, Germany", contact: "+49 89 1234567" },
        { name: "GreenCell Berlin Hub", location: "Berlin, Germany", contact: "+49 30 9876543" }
      ],
      warrantyInfo: "5-year manufacturer warranty with recycling guarantee",
      dateOfManufacture: new Date("2025-08-15"),
      dateOfFirstSale: new Date("2025-10-10"),
      ownershipHistory: [
        { owner: "GreenCell Technologies GmbH", date: "2025-08-15", action: "Manufactured" },
        { owner: "EuroTech Distribution", date: "2025-09-01", action: "Wholesale Transfer" },
        { owner: "PowerMax Retail", date: "2025-10-10", action: "Retail Stock" }
      ],
      ceMarking: true,
      safetyCertifications: ["UN38.3", "IEC 62133", "UL 2054"],
      recyclingInstructions: "Return to certified battery recycling facility. Contains hazardous materials - do not dispose in regular waste.",
      disassemblyInstructions: "Remove outer casing (4 screws). Disconnect BMS board. Extract cell pack. Separate cells for recycling.",
      hazardWarnings: "Risk of fire if damaged. Do not puncture, crush, or expose to temperatures above 60C.",
      takeBackPrograms: ["GreenCell Take-Back Program", "EU Battery Collection Network"]
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
      productCategory: "Apparel",
      modelNumber: "NW-PS-NAVY-M",
      sku: "SKF-WOOL-NAVY-M",
      manufacturer: "ScandiKnit Fashion AB",
      manufacturerAddress: "Textilgatan 15, 411 06 Gothenburg, Sweden",
      countryOfOrigin: "Sweden",
      batchNumber: "SKF-TEX-2025-1847",
      lotNumber: "LOT-2025-SUM-1847",
      materials: "100% Merino Wool (Patagonian), Organic Cotton Thread, Natural Shell Buttons",
      materialBreakdown: [
        { material: "Merino Wool", percentage: 92, recyclable: true },
        { material: "Organic Cotton Thread", percentage: 5, recyclable: true },
        { material: "Shell Buttons", percentage: 3, recyclable: true }
      ],
      recycledContentPercent: 0,
      recyclabilityPercent: 100,
      hazardousMaterials: null,
      carbonFootprint: 8,
      waterUsage: 320,
      energyConsumption: 12,
      environmentalCertifications: ["GOTS", "OEKO-TEX", "EU Ecolabel"],
      repairabilityScore: 9,
      expectedLifespanYears: 15,
      sparePartsAvailable: true,
      repairInstructions: "Minor repairs can be done at home. Buttons and seams repaired free at any ScandiKnit partner.",
      serviceCenters: [
        { name: "ScandiKnit Repair Studio", location: "Gothenburg, Sweden", contact: "+46 31 123456" }
      ],
      warrantyInfo: "Lifetime repair service for seams and buttons. 2-year warranty against defects.",
      dateOfManufacture: new Date("2025-06-20"),
      dateOfFirstSale: new Date("2025-08-01"),
      ownershipHistory: [
        { owner: "ScandiKnit Fashion AB", date: "2025-06-20", action: "Manufactured in Gothenburg" },
        { owner: "Nordic Fashion Hub", date: "2025-07-15", action: "Distribution" },
        { owner: "EcoStyle Boutique Berlin", date: "2025-08-01", action: "Retail" }
      ],
      ceMarking: false,
      safetyCertifications: ["OEKO-TEX Standard 100"],
      recyclingInstructions: "Donate to textile collection. If damaged beyond repair, return for fiber recycling program.",
      disassemblyInstructions: "Remove buttons. Seams can be separated by hand. 100% biodegradable materials.",
      hazardWarnings: null,
      takeBackPrograms: ["ScandiKnit Wool Recycling", "H&M Garment Collecting"]
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
      productCategory: "IoT Devices",
      modelNumber: "SHH-X200-PRO",
      sku: "TBE-IOT-X200-BLK",
      manufacturer: "TechBridge Electronics Ltd",
      manufacturerAddress: "Tehnoloski park 24, 1000 Ljubljana, Slovenia",
      countryOfOrigin: "Slovenia",
      batchNumber: "TBE-IOT-2025-X200-3421",
      lotNumber: "LOT-2025-APR-3421",
      materials: "Recycled ABS Plastic (65%), PCB with Lead-Free Solder, Aluminum Heat Sink, Tempered Glass Display",
      materialBreakdown: [
        { material: "Recycled ABS Plastic", percentage: 45, recyclable: true },
        { material: "PCB Components", percentage: 25, recyclable: true },
        { material: "Aluminum", percentage: 15, recyclable: true },
        { material: "Tempered Glass", percentage: 10, recyclable: true },
        { material: "Lithium Battery", percentage: 5, recyclable: true }
      ],
      recycledContentPercent: 65,
      recyclabilityPercent: 92,
      hazardousMaterials: "Contains lithium polymer battery (3.7V 2000mAh)",
      carbonFootprint: 18,
      waterUsage: 1200,
      energyConsumption: 85,
      environmentalCertifications: ["Energy Star", "EPEAT Gold", "TCO Certified"],
      repairabilityScore: 8,
      expectedLifespanYears: 10,
      sparePartsAvailable: true,
      repairInstructions: "Modular design allows battery, screen, and main board replacement. See iFixit guide.",
      serviceCenters: [
        { name: "TechBridge Service Center EU", location: "Ljubljana, Slovenia", contact: "+386 1 234567" },
        { name: "TechBridge Partner - MediaMarkt", location: "Multiple EU locations" }
      ],
      warrantyInfo: "3-year warranty. Spare parts available for 10 years. Firmware updates for 7 years.",
      dateOfManufacture: new Date("2025-04-10"),
      dateOfFirstSale: null,
      ownershipHistory: [
        { owner: "TechBridge Electronics Ltd", date: "2025-04-10", action: "Manufactured in Slovenia" },
        { owner: "EU Smart Logistics", date: "2025-05-01", action: "Regional Distribution" }
      ],
      ceMarking: true,
      safetyCertifications: ["CE", "FCC", "RoHS", "REACH"],
      recyclingInstructions: "Return to certified WEEE collection point. Device contains recoverable gold, silver, and copper.",
      disassemblyInstructions: "Remove 8 screws on back panel. Disconnect ribbon cables. Separate modules for individual recycling.",
      hazardWarnings: "Contains lithium battery - do not incinerate or puncture. Risk of explosion.",
      takeBackPrograms: ["TechBridge Trade-In Program", "EU WEEE Collection"]
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
      productCategory: "Industrial Packaging",
      modelNumber: "CP-MOD-1200",
      sku: "RLP-PKG-MOD-1200",
      manufacturer: "ReLoop Packaging Solutions",
      manufacturerAddress: "Circular Economy Park 1, 2000 Maribor, Slovenia",
      countryOfOrigin: "Slovenia",
      batchNumber: "RLP-PKG-2024-MOD-1152",
      lotNumber: "LOT-2024-NOV-1152",
      materials: "Recycled HDPE (100%), Steel Reinforcement Corners, RFID Tag, QR Label",
      materialBreakdown: [
        { material: "Recycled HDPE", percentage: 88, recyclable: true },
        { material: "Steel Corners", percentage: 10, recyclable: true },
        { material: "RFID/QR Components", percentage: 2, recyclable: true }
      ],
      recycledContentPercent: 100,
      recyclabilityPercent: 100,
      hazardousMaterials: null,
      carbonFootprint: 45,
      waterUsage: 2500,
      energyConsumption: 120,
      environmentalCertifications: ["Cradle to Cradle Silver", "ISO 14021"],
      repairabilityScore: 10,
      expectedLifespanYears: 20,
      sparePartsAvailable: true,
      repairInstructions: "Modular design - damaged panels can be swapped. Steel corners replaceable.",
      serviceCenters: [
        { name: "ReLoop Refurbishment Center", location: "Maribor, Slovenia", contact: "+386 2 345678" },
        { name: "ReLoop Rotterdam Hub", location: "Rotterdam, Netherlands" }
      ],
      warrantyInfo: "10-year structural warranty. Tracking system guaranteed for 7 years.",
      dateOfManufacture: new Date("2024-11-15"),
      dateOfFirstSale: new Date("2024-12-01"),
      ownershipHistory: [
        { owner: "ReLoop Packaging Solutions", date: "2024-11-15", action: "Manufactured" },
        { owner: "LogiGreen Network", date: "2024-12-01", action: "Deployed to circulation" }
      ],
      ceMarking: true,
      safetyCertifications: ["ISO 12048", "ISTA 3A"],
      recyclingInstructions: "Return to ReLoop network for inspection and refurbishment. After 500 cycles, container is recycled.",
      disassemblyInstructions: "Remove RFID tag. Unbolt steel corners. HDPE panels crush for pelletizing.",
      hazardWarnings: null,
      takeBackPrograms: ["ReLoop Circular Network", "Pallet Loop Partnership"]
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
      productCategory: "EV Accessories",
      modelNumber: "ALP-T2-7500",
      sku: "CTE-EVC-T2-750",
      manufacturer: "ChargeTech Europe SA",
      manufacturerAddress: "Zona Industrial Norte, 4470-089 Maia, Portugal",
      countryOfOrigin: "Portugal",
      batchNumber: "CTE-EVC-2025-7500-0892",
      lotNumber: "LOT-2025-SEP-0892",
      materials: "TPE Outer Jacket (Halogen-Free), Oxygen-Free Copper Conductors, Polycarbonate Connector Housing",
      materialBreakdown: [
        { material: "Oxygen-Free Copper", percentage: 55, recyclable: true },
        { material: "TPE Jacket", percentage: 30, recyclable: true },
        { material: "Polycarbonate", percentage: 12, recyclable: true },
        { material: "Electronic Components", percentage: 3, recyclable: true }
      ],
      recycledContentPercent: 15,
      recyclabilityPercent: 97,
      hazardousMaterials: null,
      carbonFootprint: 22,
      waterUsage: 450,
      energyConsumption: 35,
      environmentalCertifications: ["Made with 100% Renewable Energy"],
      repairabilityScore: 6,
      expectedLifespanYears: 12,
      sparePartsAvailable: true,
      repairInstructions: "Connector housing can be replaced. Cable cannot be spliced - full replacement if damaged.",
      serviceCenters: [
        { name: "ChargeTech Portugal HQ", location: "Maia, Portugal", contact: "+351 22 9876543" }
      ],
      warrantyInfo: "5-year warranty on cable. Connector rated for 10,000+ connection cycles.",
      dateOfManufacture: new Date("2025-09-20"),
      dateOfFirstSale: null,
      ownershipHistory: [
        { owner: "ChargeTech Europe SA", date: "2025-09-20", action: "Manufactured in Portugal" },
        { owner: "EV Parts Direct", date: "2025-10-05", action: "Distribution" }
      ],
      ceMarking: true,
      safetyCertifications: ["IEC 62196-2 Type 2", "TUV SUD", "IP67"],
      recyclingInstructions: "Cable must be professionally recycled. Copper content makes it valuable for recovery.",
      disassemblyInstructions: "Cut cable near connectors. Strip outer jacket. Separate copper and plastic for recycling.",
      hazardWarnings: "Do not use if cable jacket is damaged. Risk of electric shock.",
      takeBackPrograms: ["ChargeTech Cable Recycling", "EV Cable Collection EU"]
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
