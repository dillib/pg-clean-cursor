import { storage } from "./storage";
import { qrService } from "./services/qr-service";
import { identityService } from "./services/identity-service";
import { traceService } from "./services/trace-service";
import type { InsertProduct, InsertProductPassport, IoTDeviceType, AIInsightType, AISummary, SustainabilityInsight, RepairSummary, CircularityScore, RiskAssessment, RegionCode, EUExtensionData, ChinaExtensionData, USExtensionData, IndiaExtensionData } from "@shared/schema";

interface RegionalExtensionConfig {
  productIndex: number;
  regions: {
    code: RegionCode;
    complianceStatus: "compliant" | "pending" | "non_compliant" | "not_applicable";
    payload: {
      EU?: EUExtensionData;
      CN?: ChinaExtensionData;
      US?: USExtensionData;
      IN?: IndiaExtensionData;
    };
  }[];
}

const regionalExtensionConfigs: RegionalExtensionConfig[] = [
  {
    productIndex: 0,
    regions: [
      {
        code: "EU",
        complianceStatus: "compliant",
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
            reach: {
              svhcPresent: false,
              svhcSubstances: []
            },
            ceMarking: true,
            eprRegistrationId: "DE-EPR-BAT-2025-0842",
            repairabilityIndex: 7.2
          }
        }
      },
      {
        code: "CN",
        complianceStatus: "compliant",
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
            },
            chinaRoHS: {
              compliant: true,
              restrictedSubstances: [],
              exemptions: []
            }
          }
        }
      }
    ]
  },
  {
    productIndex: 1,
    regions: [
      {
        code: "EU",
        complianceStatus: "compliant",
        payload: {
          EU: {
            espr: {
              productCategory: "Textiles",
              complianceStatus: "compliant",
              dppVersion: "1.0",
              validFrom: "2025-03-01"
            },
            reach: {
              svhcPresent: false
            },
            ceMarking: false,
            repairabilityIndex: 8.5
          }
        }
      },
      {
        code: "IN",
        complianceStatus: "compliant",
        payload: {
          IN: {
            bis: {
              registrationNumber: "IS-17635-2025-TEX",
              required: true,
              productCategory: "Textiles",
              validUntil: "2028-03-01"
            },
            epr: {
              registrationNumber: "EPR-TEX-2025-1847",
              obligationType: "producer",
              targetYear: 2026
            },
            madeInIndia: {
              localContentPercent: 0,
              manufacturingLocation: "Imported - Sweden"
            }
          }
        }
      }
    ]
  },
  {
    productIndex: 2,
    regions: [
      {
        code: "EU",
        complianceStatus: "compliant",
        payload: {
          EU: {
            espr: {
              productCategory: "Electronics",
              complianceStatus: "compliant",
              dppVersion: "1.0"
            },
            reach: {
              svhcPresent: false
            },
            ceMarking: true,
            eprRegistrationId: "SI-EPR-WEEE-2025-3421",
            repairabilityIndex: 8.0
          }
        }
      },
      {
        code: "CN",
        complianceStatus: "compliant",
        payload: {
          CN: {
            ccc: {
              certificateNumber: "CCC-2025-IOT-3421",
              required: true,
              validUntil: "2028-04-01",
              certificationBody: "CCIC"
            },
            gbStandards: {
              applicableStandards: ["GB 4943.1-2022", "GB 9254.1-2021"],
              complianceStatus: "compliant"
            },
            chinaRoHS: {
              compliant: true
            }
          }
        }
      },
      {
        code: "US",
        complianceStatus: "compliant",
        payload: {
          US: {
            ftc: {
              madeInUSAClaim: false,
              greenGuidesCompliant: true
            },
            stateEPR: {
              registeredStates: ["CA", "NY", "WA"],
              eprProgramIds: {
                CA: "CA-WEEE-2025-3421",
                NY: "NY-WEEE-2025-3421",
                WA: "WA-WEEE-2025-3421"
              }
            },
            californiaCompliance: {
              prop65Warning: false
            }
          }
        }
      }
    ]
  },
  {
    productIndex: 5,
    regions: [
      {
        code: "EU",
        complianceStatus: "compliant",
        payload: {
          EU: {
            espr: {
              productCategory: "Electronics",
              complianceStatus: "compliant",
              dppVersion: "1.0"
            },
            reach: {
              svhcPresent: false
            },
            ceMarking: true,
            repairabilityIndex: 6.5
          }
        }
      },
      {
        code: "CN",
        complianceStatus: "compliant",
        payload: {
          CN: {
            ccc: {
              certificateNumber: "CCC-2025-AUD-4592",
              required: true,
              certificationBody: "CQC"
            },
            gbStandards: {
              applicableStandards: ["GB 8898-2011", "GB 4943.1-2022"],
              complianceStatus: "compliant"
            },
            chinaRoHS: {
              compliant: true
            }
          }
        }
      },
      {
        code: "US",
        complianceStatus: "compliant",
        payload: {
          US: {
            ftc: {
              madeInUSAClaim: false,
              greenGuidesCompliant: true
            },
            stateEPR: {
              registeredStates: ["CA"],
              eprProgramIds: { CA: "CA-WEEE-2025-4592" }
            },
            californiaCompliance: {
              prop65Warning: false
            }
          }
        }
      }
    ]
  }
];

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
      productImage: "/assets/stock_images/lithium_ion_battery__913af259.jpg",
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
      productImage: "/assets/stock_images/premium_merino_wool__c7ed7cc2.jpg",
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
      productImage: "/assets/stock_images/smart_home_hub_devic_8ba94000.jpg",
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
      productImage: "/assets/stock_images/eco_friendly_biodegr_38f4835c.jpg",
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
      productImage: "/assets/stock_images/electric_vehicle_car_73ff6ee8.jpg",
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
  },
  {
    product: {
      productName: "SoundWave Pro Wireless Headphones",
      productCategory: "Consumer Electronics",
      modelNumber: "SW-PRO-ANC-45",
      sku: "AUD-HP-PRO-BLK",
      manufacturer: "AudioTech Innovation GmbH",
      manufacturerAddress: "Schallweg 12, 10117 Berlin, Germany",
      countryOfOrigin: "China",
      batchNumber: "ATI-AUD-2025-4592",
      lotNumber: "LOT-2025-AUG-4592",
      productImage: "/assets/stock_images/premium_wireless_hea_9e631693.jpg",
      materials: "ABS Plastic, Synthetic Leather, Aluminum, Copper Wiring, Lithium-Ion Battery, Memory Foam",
      materialBreakdown: [
        { material: "ABS Plastic", percentage: 42, recyclable: true },
        { material: "Synthetic Leather", percentage: 18, recyclable: false },
        { material: "Aluminum", percentage: 15, recyclable: true },
        { material: "Copper Wiring", percentage: 10, recyclable: true },
        { material: "Memory Foam", percentage: 10, recyclable: false },
        { material: "Lithium-Ion Battery", percentage: 5, recyclable: true }
      ],
      recycledContentPercent: 12,
      recyclabilityPercent: 72,
      hazardousMaterials: "Contains lithium-ion battery (3.7V 800mAh)",
      carbonFootprint: 25,
      waterUsage: 310,
      energyConsumption: 5,
      environmentalCertifications: ["RoHS", "REACH", "CE", "FCC"],
      repairabilityScore: 7,
      expectedLifespanYears: 5,
      sparePartsAvailable: true,
      repairInstructions: "Ear cushions and headband pads are user-replaceable. Battery replacement requires authorized service.",
      serviceCenters: [
        { name: "AudioTech Berlin Service", location: "Berlin, Germany", contact: "+49 30 5551234" },
        { name: "AudioTech Authorized Partners", location: "EU-wide network" }
      ],
      warrantyInfo: "2-year limited warranty. Ear cushion replacement kits available.",
      dateOfManufacture: new Date("2025-08-22"),
      dateOfFirstSale: new Date("2025-09-15"),
      ownershipHistory: [
        { owner: "AudioTech Innovation GmbH", date: "2025-08-22", action: "Manufactured" },
        { owner: "MediaMarkt Distribution", date: "2025-09-01", action: "Wholesale" },
        { owner: "Consumer Direct", date: "2025-09-15", action: "Retail Sale" }
      ],
      ceMarking: true,
      safetyCertifications: ["IEC 62368-1", "UL 60065"],
      recyclingInstructions: "Return to e-waste collection point. Battery must be removed before recycling.",
      disassemblyInstructions: "Remove ear cushions. Unscrew 4 screws on each cup. Disconnect battery module. Separate plastic and metal.",
      hazardWarnings: "Do not incinerate lithium-ion battery. Risk of fire.",
      takeBackPrograms: ["AudioTech Trade-In", "EU WEEE Collection"]
    },
    passport: {
      complianceData: {
        euBatteryPassport: true,
        roHsCompliance: "Fully compliant with RoHS Directive 2011/65/EU",
        reachCompliance: "No SVHC substances above threshold"
      },
      certifications: ["CE Marked", "FCC Certified", "RoHS", "REACH"],
      environmentalDeclarations: { category: "Consumer Electronics", industry: "Audio" },
      endOfLifeInstructions: "Return to AudioTech or certified e-waste recycler. Lithium battery requires separate handling."
    }
  },
  {
    product: {
      productName: "Milano Artisan Leather Tote",
      productCategory: "Fashion Accessories",
      modelNumber: "ML-TOTE-CAM-L",
      sku: "FAS-BAG-TOTE-CAM",
      manufacturer: "Bottega Toscana Srl",
      manufacturerAddress: "Via del Cuoio 15, 50125 Firenze, Italy",
      countryOfOrigin: "Italy",
      batchNumber: "BTS-LEA-2025-2847",
      lotNumber: "LOT-2025-SPR-2847",
      productImage: "/assets/stock_images/luxury_leather_handb_03681045.jpg",
      materials: "Full-Grain Vegetable-Tanned Leather, Brass Hardware, Cotton Lining, Organic Cotton Thread",
      materialBreakdown: [
        { material: "Full-Grain Leather", percentage: 75, recyclable: true },
        { material: "Brass Hardware", percentage: 8, recyclable: true },
        { material: "Cotton Lining", percentage: 12, recyclable: true },
        { material: "Cotton Thread", percentage: 5, recyclable: true }
      ],
      recycledContentPercent: 0,
      recyclabilityPercent: 95,
      hazardousMaterials: null,
      carbonFootprint: 15,
      waterUsage: 2800,
      energyConsumption: 8,
      environmentalCertifications: ["Leather Working Group Gold", "OEKO-TEX"],
      repairabilityScore: 9,
      expectedLifespanYears: 25,
      sparePartsAvailable: true,
      repairInstructions: "Leather conditioning recommended annually. Hardware replacement and stitching repairs available at any Bottega Toscana boutique.",
      serviceCenters: [
        { name: "Bottega Toscana Florence Atelier", location: "Florence, Italy", contact: "+39 055 1234567" },
        { name: "Bottega Toscana Milan Boutique", location: "Milan, Italy", contact: "+39 02 9876543" }
      ],
      warrantyInfo: "Lifetime craftsmanship warranty. Free leather conditioning service annually.",
      dateOfManufacture: new Date("2025-03-15"),
      dateOfFirstSale: new Date("2025-04-01"),
      ownershipHistory: [
        { owner: "Bottega Toscana Srl", date: "2025-03-15", action: "Handcrafted in Florence" },
        { owner: "Luxury Goods Distribution", date: "2025-03-25", action: "Distribution" },
        { owner: "Harrods London", date: "2025-04-01", action: "Retail" }
      ],
      ceMarking: false,
      safetyCertifications: ["OEKO-TEX Standard 100"],
      recyclingInstructions: "Leather can be donated or recycled. Brass hardware is fully recyclable. Cotton lining is biodegradable.",
      disassemblyInstructions: "Remove brass hardware. Separate lining from leather shell. All components can be recycled separately.",
      hazardWarnings: null,
      takeBackPrograms: ["Bottega Toscana Restoration Program", "Luxury Consignment Partners"]
    },
    passport: {
      complianceData: {
        sustainableSourcing: "Leather from traceable European farms",
        craftCertification: "Made by certified master leatherworkers",
        animalWelfare: "Byproduct of food industry - no animals harmed for leather production"
      },
      certifications: ["Leather Working Group Gold", "Made in Italy Certification", "OEKO-TEX Standard 100"],
      environmentalDeclarations: { category: "Fashion Accessories", industry: "Luxury Goods" },
      endOfLifeInstructions: "Return for restoration or consignment. Leather ages beautifully - repair before discarding."
    }
  },
  {
    product: {
      productName: "EcoNest Smart Thermostat Pro",
      productCategory: "Smart Home",
      modelNumber: "EN-THERM-PRO-W",
      sku: "SMH-THERM-PRO-WHT",
      manufacturer: "GreenHome Technologies BV",
      manufacturerAddress: "Energieweg 88, 5617 AM Eindhoven, Netherlands",
      countryOfOrigin: "Netherlands",
      batchNumber: "GHT-SMH-2025-8834",
      lotNumber: "LOT-2025-OCT-8834",
      productImage: "/assets/stock_images/smart_home_thermosta_3e0251e2.jpg",
      materials: "Recycled ABS Plastic, Tempered Glass, PCB with Lead-Free Solder, Temperature Sensors",
      materialBreakdown: [
        { material: "Recycled ABS Plastic", percentage: 55, recyclable: true },
        { material: "Tempered Glass", percentage: 20, recyclable: true },
        { material: "PCB Components", percentage: 20, recyclable: true },
        { material: "Sensors", percentage: 5, recyclable: true }
      ],
      recycledContentPercent: 55,
      recyclabilityPercent: 90,
      hazardousMaterials: null,
      carbonFootprint: 8,
      waterUsage: 420,
      energyConsumption: 2,
      environmentalCertifications: ["Energy Star", "EU Ecolabel", "TCO Certified"],
      repairabilityScore: 8,
      expectedLifespanYears: 15,
      sparePartsAvailable: true,
      repairInstructions: "Modular design allows display and sensor replacement. Firmware updates extend product life.",
      serviceCenters: [
        { name: "GreenHome Eindhoven HQ", location: "Eindhoven, Netherlands", contact: "+31 40 1234567" },
        { name: "GreenHome Partner Network", location: "EU-wide" }
      ],
      warrantyInfo: "5-year warranty. 10-year firmware update commitment. Spare parts available for 15 years.",
      dateOfManufacture: new Date("2025-10-05"),
      dateOfFirstSale: null,
      ownershipHistory: [
        { owner: "GreenHome Technologies BV", date: "2025-10-05", action: "Manufactured in Netherlands" },
        { owner: "Smart Living Distribution", date: "2025-10-15", action: "Distribution" }
      ],
      ceMarking: true,
      safetyCertifications: ["CE", "FCC", "UL Listed"],
      recyclingInstructions: "Return to GreenHome or WEEE collection. Contains no hazardous materials.",
      disassemblyInstructions: "Remove wall mount plate. Disconnect from base. Separate glass display from plastic housing.",
      hazardWarnings: null,
      takeBackPrograms: ["GreenHome Upgrade Program", "EU WEEE Collection"]
    },
    passport: {
      complianceData: {
        energySavings: "Average 23% reduction in heating/cooling costs",
        rightToRepair: true,
        softwareSupport: "10-year firmware update commitment",
        privacyCompliance: "GDPR compliant - all data processing in EU"
      },
      certifications: ["CE Marked", "Energy Star Certified", "EU Ecolabel", "TCO Certified"],
      environmentalDeclarations: { category: "Smart Home", industry: "Electronics" },
      endOfLifeInstructions: "Return for trade-in credit. Device can be refurbished for second life program."
    }
  },
  {
    product: {
      productName: "Heavy-Duty Conveyor Belt EP400/3",
      productCategory: "Industrial Belting",
      modelNumber: "IP-EP400-3-1200",
      sku: "IND-CVB-EP400-1200",
      manufacturer: "IndustrialPro Beltings",
      manufacturerAddress: "Industrial Area Phase II, Faridabad, Haryana 121003, India",
      countryOfOrigin: "India",
      batchNumber: "IPB-CVB-2025-EP400-2847",
      lotNumber: "LOT-2025-DEC-2847",
      productImage: "/assets/stock_images/industrial_rubber_co_6782e308.jpg",
      materials: "Polyester-Nylon (EP) Fabric Plies, Natural Rubber Cover, Synthetic Rubber Compound, Steel Cord Reinforcement",
      materialBreakdown: [
        { material: "Natural Rubber", percentage: 45, recyclable: true },
        { material: "Synthetic Rubber", percentage: 20, recyclable: true },
        { material: "Polyester-Nylon Fabric", percentage: 25, recyclable: true },
        { material: "Steel Cord", percentage: 10, recyclable: true }
      ],
      recycledContentPercent: 15,
      recyclabilityPercent: 85,
      hazardousMaterials: null,
      carbonFootprint: 180,
      waterUsage: 4500,
      energyConsumption: 320,
      environmentalCertifications: ["ISO 14001", "BIS Certified", "REACH Compliant"],
      repairabilityScore: 7,
      expectedLifespanYears: 12,
      sparePartsAvailable: true,
      repairInstructions: "Hot vulcanization for splice repairs. Cold bonding for minor cuts. Belt edge repair kits available. Professional installation recommended for major repairs.",
      serviceCenters: [
        { name: "Faridabad Service Center", location: "Faridabad, India", contact: "+91 129 4567890" },
        { name: "Mumbai Regional Hub", location: "Mumbai, India", contact: "+91 22 9876543" },
        { name: "Middle East Service Center", location: "Dubai, UAE", contact: "+971 4 1234567" }
      ],
      warrantyInfo: "3-year warranty against manufacturing defects. Extended warranty available for premium installations. 24/7 emergency support for industrial clients.",
      dateOfManufacture: new Date("2025-12-01"),
      dateOfFirstSale: null,
      ownershipHistory: [
        { owner: "IndustrialPro Beltings", date: "2025-12-01", action: "Manufactured in Faridabad" },
        { owner: "Industrial Equipment Distributors", date: "2025-12-10", action: "Distribution" }
      ],
      ceMarking: false,
      safetyCertifications: ["IS 1891:2018", "DIN 22102", "ISO 22721", "MSHA Approved"],
      recyclingInstructions: "Worn belts can be retreaded, recycled into rubber mulch, or used for secondary applications. Contact certified industrial recycler.",
      disassemblyInstructions: "Cut belt into manageable sections. Separate steel cord from rubber using specialized equipment. Rubber can be ground for recycling.",
      hazardWarnings: "Heavy industrial equipment - professional installation only. Pinch point hazard during operation. Follow lockout/tagout procedures.",
      takeBackPrograms: ["Belt Retread Program", "Industrial Rubber Recycling Network"]
    },
    passport: {
      complianceData: {
        industrialGrade: true,
        loadCapacity: "400 N/mm tensile strength per ply, 3-ply construction",
        operatingConditions: "Temperature range: -25C to +80C, Oil and abrasion resistant",
        qualityTesting: "100% visual inspection, tensile testing per batch, adhesion testing"
      },
      certifications: ["IS 1891:2018 Certified", "ISO 9001:2015", "ISO 14001:2015", "DIN 22102 Compliant"],
      environmentalDeclarations: { category: "Industrial Belting", industry: "Manufacturing Equipment" },
      endOfLifeInstructions: "Contact manufacturer for belt retread assessment. Worn belts eligible for recycling program with credit toward new purchase."
    }
  },
  {
    product: {
      productName: "Precision Conveyor Roller System DR-50",
      productCategory: "Industrial Rollers",
      modelNumber: "CT-DR50-800-S",
      sku: "IND-ROL-DR50-800",
      manufacturer: "ConveyorTech Systems",
      manufacturerAddress: "Industrial Zone B, Pune, Maharashtra 411018, India",
      countryOfOrigin: "India",
      batchNumber: "CTS-ROL-2025-DR50-1423",
      lotNumber: "LOT-2025-DEC-1423",
      productImage: "/assets/stock_images/industrial_steel_con_6d4421ed.jpg",
      materials: "Precision Steel Tube, Deep Groove Ball Bearings, Galvanized Steel Shaft, Polyurethane Coating",
      materialBreakdown: [
        { material: "Carbon Steel Tube", percentage: 55, recyclable: true },
        { material: "Ball Bearings", percentage: 15, recyclable: true },
        { material: "Galvanized Steel Shaft", percentage: 20, recyclable: true },
        { material: "Polyurethane Coating", percentage: 10, recyclable: false }
      ],
      recycledContentPercent: 30,
      recyclabilityPercent: 90,
      hazardousMaterials: null,
      carbonFootprint: 45,
      waterUsage: 1200,
      energyConsumption: 85,
      environmentalCertifications: ["ISO 14001", "ISO 9001", "REACH Compliant"],
      repairabilityScore: 8,
      expectedLifespanYears: 15,
      sparePartsAvailable: true,
      repairInstructions: "Bearing replacement is straightforward with standard tools. Shaft and tube replacement available. Polyurethane coating can be reapplied for worn rollers.",
      serviceCenters: [
        { name: "Pune Service Center", location: "Pune, India", contact: "+91 20 1234567" },
        { name: "Delhi Regional Hub", location: "New Delhi, India", contact: "+91 11 9876543" },
        { name: "Singapore Asia-Pacific Center", location: "Singapore", contact: "+65 6123 4567" }
      ],
      warrantyInfo: "5-year warranty on roller body and bearings. Extended warranty available. Global spare parts network.",
      dateOfManufacture: new Date("2025-12-05"),
      dateOfFirstSale: null,
      ownershipHistory: [
        { owner: "ConveyorTech Systems", date: "2025-12-05", action: "Manufactured in Pune" },
        { owner: "Material Handling Solutions", date: "2025-12-15", action: "Distribution" }
      ],
      ceMarking: true,
      safetyCertifications: ["ISO 22721", "DIN 15207", "EN 620", "CE Marked"],
      recyclingInstructions: "Steel components are fully recyclable. Bearings should be separated for specialized recycling. Polyurethane coating requires proper disposal.",
      disassemblyInstructions: "Remove end caps. Extract shaft and bearings. Steel tube can be directly recycled. Separate polyurethane coating if present.",
      hazardWarnings: "Heavy components - use appropriate lifting equipment. Rotating parts hazard during operation.",
      takeBackPrograms: ["Roller Refurbishment Program", "Steel Recycling Partnership"]
    },
    passport: {
      complianceData: {
        industrialGrade: true,
        loadCapacity: "500 kg per roller, 800mm tube length, 50mm diameter",
        operatingConditions: "Temperature range: -20C to +60C, suitable for dusty environments",
        qualityTesting: "100% runout testing, bearing preload verification, concentricity check"
      },
      certifications: ["ISO 9001:2015 Certified", "ISO 14001:2015", "DIN 15207 Compliant", "CE Marked"],
      environmentalDeclarations: { category: "Industrial Rollers", industry: "Material Handling Equipment" },
      endOfLifeInstructions: "Contact manufacturer for roller refurbishment. Steel components have high recycling value."
    }
  }
];

const iotDeviceConfigs: { productIndex: number; deviceType: IoTDeviceType; deviceId: string; manufacturer: string; model: string }[] = [
  { productIndex: 0, deviceType: "nfc", deviceId: "NFC-BAT-2025-001", manufacturer: "NXP Semiconductors", model: "NTAG 424 DNA" },
  { productIndex: 1, deviceType: "rfid", deviceId: "RFID-TEX-2025-042", manufacturer: "Impinj", model: "Monza R6" },
  { productIndex: 2, deviceType: "ble", deviceId: "BLE-IOT-2025-X200", manufacturer: "Nordic Semiconductor", model: "nRF52840" },
  { productIndex: 3, deviceType: "rfid", deviceId: "RFID-PKG-2024-1152", manufacturer: "Alien Technology", model: "Higgs-9" },
  { productIndex: 4, deviceType: "qr", deviceId: "QR-EVC-2025-7500", manufacturer: "PhotonicTag", model: "Optical QR" },
  { productIndex: 5, deviceType: "nfc", deviceId: "NFC-AUD-2025-4592", manufacturer: "NXP Semiconductors", model: "NTAG 424 DNA" },
  { productIndex: 6, deviceType: "rfid", deviceId: "RFID-LEA-2025-2847", manufacturer: "Impinj", model: "Monza R6-P" },
  { productIndex: 7, deviceType: "ble", deviceId: "BLE-SMH-2025-8834", manufacturer: "Nordic Semiconductor", model: "nRF52832" },
  { productIndex: 8, deviceType: "rfid", deviceId: "RFID-CVB-2025-2847", manufacturer: "Alien Technology", model: "Higgs-EC" },
  { productIndex: 9, deviceType: "rfid", deviceId: "RFID-ROL-2025-1423", manufacturer: "Impinj", model: "Monza R6-P" }
];

interface AIInsightsBundle {
  summary: AISummary;
  sustainability: SustainabilityInsight;
  repair: RepairSummary;
  circularity: CircularityScore;
  risk: RiskAssessment;
}

const demoAIInsights: AIInsightsBundle[] = [
  {
    summary: {
      summary: "The EcoPower Li-Ion Battery Pack is a premium 5000mAh lithium-ion battery designed for high-performance portable electronics with exceptional environmental credentials and EU battery passport compliance.",
      keyFeatures: ["95% recyclability rate", "22% recycled content", "8-year expected lifespan", "UN38.3 safety certified", "Manufacturer take-back program"]
    },
    sustainability: {
      overallScore: 82,
      carbonAnalysis: "With only 12kg CO2e lifecycle emissions, this battery demonstrates strong environmental performance through responsible sourcing and efficient manufacturing processes.",
      circularityRecommendations: ["Increase recycled lithium content to 25%", "Partner with additional recycling networks", "Implement second-life program for EV applications"],
      improvements: ["Consider switching to LFP chemistry for cobalt-free option", "Reduce polymer separator content for higher recyclability"]
    },
    repair: {
      repairabilityRating: "Good",
      repairInstructions: ["Discharge battery to safe level before service", "Remove outer casing using T6 screwdriver", "Disconnect BMS board connector", "Replace individual cells as needed"],
      commonIssues: ["Capacity degradation after 500+ cycles", "BMS calibration drift", "Terminal connector wear"],
      partsAvailability: "Excellent - replacement cells and BMS boards available through authorized service centers"
    },
    circularity: {
      score: 88,
      grade: "A",
      recyclabilityAnalysis: "95% of materials can be recovered through established battery recycling processes. Lithium, cobalt, and copper recovery rates exceed 90%.",
      materialEfficiency: "Compact cell design maximizes energy density while minimizing material usage. Only 5% non-recyclable polymer content.",
      endOfLifeOptions: ["Manufacturer take-back", "Second-life energy storage", "Certified battery recycling", "Material recovery"],
      recommendations: ["Explore second-life applications", "Document cell-level tracking for circularity"]
    },
    risk: {
      overallRisk: "Low",
      riskFlags: [
        { type: "Supply Chain", severity: "Low", description: "Cobalt sourcing documented and verified through due diligence" }
      ],
      dataCompleteness: 96,
      counterfeitRisk: "Minimal - NFC authentication tag embedded, unique batch tracking, manufacturer verification available",
      complianceIssues: [],
      recommendations: ["Consider blockchain-based supply chain verification for enhanced transparency"]
    }
  },
  {
    summary: {
      summary: "The Nordic Wool Premium Sweater is a luxurious Merino wool garment crafted in Sweden with exceptional sustainability credentials and 100% natural, biodegradable materials.",
      keyFeatures: ["100% recyclable materials", "GOTS & OEKO-TEX certified", "15-year expected lifespan", "Lifetime repair service", "Full supply chain traceability"]
    },
    sustainability: {
      overallScore: 94,
      carbonAnalysis: "Only 8kg CO2e footprint achieved through sustainable wool sourcing, renewable energy manufacturing, and local production in Sweden.",
      circularityRecommendations: ["Continue wool fiber recycling partnerships", "Expand repair service network", "Develop wool-to-wool recycling capability"],
      improvements: ["Source buttons from recycled materials", "Reduce water usage in finishing process by 10%"]
    },
    repair: {
      repairabilityRating: "Excellent",
      repairInstructions: ["Minor holes can be darned at home", "Seam repairs done free at ScandiKnit partners", "Button replacement available at no charge", "Professional cleaning recommended annually"],
      commonIssues: ["Pilling after extended wear", "Seam stress at shoulders", "Button thread loosening"],
      partsAvailability: "Excellent - matching buttons and thread always available for repairs"
    },
    circularity: {
      score: 97,
      grade: "A+",
      recyclabilityAnalysis: "100% of materials are natural and biodegradable. Wool fibers can be recycled multiple times without quality loss.",
      materialEfficiency: "Minimal waste design with 92% primary material content. All components designed for easy separation.",
      endOfLifeOptions: ["Textile donation", "Fiber recycling", "Natural composting", "Wool reclamation"],
      recommendations: ["Perfect circularity model - maintain current practices"]
    },
    risk: {
      overallRisk: "Low",
      riskFlags: [],
      dataCompleteness: 100,
      counterfeitRisk: "Very Low - RFID tag with unique identifier, full supply chain visibility from farm to retail",
      complianceIssues: [],
      recommendations: ["Excellent compliance profile - no immediate actions needed"]
    }
  },
  {
    summary: {
      summary: "The IoTrix Industrial Sensor Hub X200 is a modular IoT device designed for smart manufacturing environments with cloud connectivity and predictive maintenance capabilities.",
      keyFeatures: ["10-year modular design", "OTA firmware updates", "IP67 industrial rating", "98% uptime SLA available", "Modular sensor expansion"]
    },
    sustainability: {
      overallScore: 71,
      carbonAnalysis: "35kg CO2e reflects the complex electronics manufacturing process, offset by long operational life and energy-efficient design.",
      circularityRecommendations: ["Increase PCB recycled content", "Develop sensor module refurbishment program", "Implement product-as-a-service model"],
      improvements: ["Transition to lead-free solder across all components", "Reduce enclosure weight by 15%"]
    },
    repair: {
      repairabilityRating: "Good",
      repairInstructions: ["Firmware updates resolve 80% of issues remotely", "Sensor modules are hot-swappable", "Main board replacement requires certified technician", "Enclosure can be resealed after service"],
      commonIssues: ["Sensor calibration drift", "Connectivity interference in RF-dense environments", "Enclosure seal degradation in extreme conditions"],
      partsAvailability: "Good - modular components stocked for 10+ years post-production"
    },
    circularity: {
      score: 72,
      grade: "B",
      recyclabilityAnalysis: "85% recyclability through established e-waste channels. Modular design enables component-level refurbishment.",
      materialEfficiency: "Modular architecture reduces waste by enabling targeted repairs. PCB design optimized for material recovery.",
      endOfLifeOptions: ["Module refurbishment", "E-waste recycling", "Manufacturer take-back", "Component harvesting"],
      recommendations: ["Consider design-for-disassembly improvements", "Document module-level material composition"]
    },
    risk: {
      overallRisk: "Low",
      riskFlags: [
        { type: "Firmware Security", severity: "Low", description: "Regular security patches required - automatic OTA updates enabled" }
      ],
      dataCompleteness: 92,
      counterfeitRisk: "Low - BLE secure pairing with manufacturer certificate, unique device identity in cloud platform",
      complianceIssues: [],
      recommendations: ["Maintain regular firmware update schedule", "Document cybersecurity compliance for industrial standards"]
    }
  },
  {
    summary: {
      summary: "BioWrap Compostable Food Container is an innovative industrial food packaging solution made from agricultural waste with home compostability certification.",
      keyFeatures: ["100% home compostable", "85% post-consumer recycled content", "120-day shelf life maintenance", "Food-safe certified", "Carbon-negative production"]
    },
    sustainability: {
      overallScore: 95,
      carbonAnalysis: "Carbon-negative production at -2kg CO2e through agricultural waste upcycling and renewable energy manufacturing.",
      circularityRecommendations: ["Expand agricultural waste sourcing network", "Partner with commercial composting facilities", "Develop closed-loop program with food service clients"],
      improvements: ["Increase barrier performance for extended shelf life", "Reduce manufacturing water usage further"]
    },
    repair: {
      repairabilityRating: "Not Applicable",
      repairInstructions: ["Single-use packaging designed for end-of-life composting", "No repair required or intended"],
      commonIssues: ["Moisture sensitivity if stored improperly", "Limited hot food application"],
      partsAvailability: "Not Applicable - designed for single use and composting"
    },
    circularity: {
      score: 98,
      grade: "A+",
      recyclabilityAnalysis: "100% compostable in home or industrial conditions. Returns nutrients to soil within 120 days.",
      materialEfficiency: "85% post-consumer recycled wheat straw waste. Minimal processing required.",
      endOfLifeOptions: ["Home composting", "Industrial composting", "Garden waste collection", "Soil amendment"],
      recommendations: ["Exemplary circular design - document as best practice case study"]
    },
    risk: {
      overallRisk: "Low",
      riskFlags: [],
      dataCompleteness: 98,
      counterfeitRisk: "Very Low - RFID-tagged packaging, batch verification through PhotonicTag platform",
      complianceIssues: [],
      recommendations: ["Maintain documentation for EU Packaging Regulation 2025 requirements"]
    }
  },
  {
    summary: {
      summary: "The ChargePoint EV Cable Pro 7500 is a premium electric vehicle charging cable with smart monitoring capabilities and industry-leading durability for Type 2 connections.",
      keyFeatures: ["IP67 weatherproof rating", "Smart power monitoring", "10,000+ plug cycles rated", "Temperature management system", "5-year warranty"]
    },
    sustainability: {
      overallScore: 78,
      carbonAnalysis: "28kg CO2e reflects durable construction materials, offset by long service life and support for zero-emission vehicles.",
      circularityRecommendations: ["Increase recycled copper content in conductors", "Develop cable recycling partnership program", "Implement modular connector design for upgrades"],
      improvements: ["Transition to bio-based cable sheathing", "Reduce packaging materials by 25%"]
    },
    repair: {
      repairabilityRating: "Good",
      repairInstructions: ["Connector housings can be replaced in field", "Cable damage requires professional splice or replacement", "Smart electronics module is replaceable", "Regular cleaning of contacts recommended"],
      commonIssues: ["Connector pin wear after extended use", "Cable sheath abrasion in high-traffic areas", "Temperature sensor calibration drift"],
      partsAvailability: "Good - replacement connectors and electronics modules available through service network"
    },
    circularity: {
      score: 75,
      grade: "B",
      recyclabilityAnalysis: "88% recyclability with established metal and plastic recycling streams. Copper conductor recovery exceeds 95%.",
      materialEfficiency: "Optimized conductor design provides maximum current capacity with minimal material. Modular construction enables targeted repairs.",
      endOfLifeOptions: ["Manufacturer refurbishment", "Metal recycling", "Cable recycling program", "Component harvesting"],
      recommendations: ["Explore connector standardization for longer product life", "Document copper content for recycling value"]
    },
    risk: {
      overallRisk: "Low",
      riskFlags: [
        { type: "Counterfeit Risk", severity: "Low", description: "QR authentication prevents counterfeit products entering market" }
      ],
      dataCompleteness: 94,
      counterfeitRisk: "Low - PhotonicTag QR authentication, unique serial number verification, manufacturer registration required",
      complianceIssues: [],
      recommendations: ["Register all products in PhotonicTag for full traceability benefits"]
    }
  },
  {
    summary: {
      summary: "SoundWave Pro Wireless Headphones deliver premium noise-cancelling audio with responsible material choices and good repairability for consumer electronics.",
      keyFeatures: ["Active noise cancellation", "30-hour battery life", "User-replaceable ear cushions", "2-year warranty", "RoHS/REACH compliant"]
    },
    sustainability: {
      overallScore: 68,
      carbonAnalysis: "25kg CO2e footprint typical for consumer electronics. Opportunities to improve through increased recycled plastic content and regional manufacturing.",
      circularityRecommendations: ["Increase recycled ABS content to 30%", "Develop user-replaceable battery module", "Expand repair partner network"],
      improvements: ["Transition from synthetic to plant-based leather alternatives", "Implement carbon offset program for shipping"]
    },
    repair: {
      repairabilityRating: "Good",
      repairInstructions: ["Ear cushions snap on/off for easy replacement", "Headband padding is user-serviceable", "Battery replacement requires authorized technician", "Firmware updates available OTA"],
      commonIssues: ["Ear cushion wear after 18-24 months", "Battery capacity decline after 500+ charges", "Headband cracking in cold temperatures"],
      partsAvailability: "Good - ear cushions and headband pads available online. Battery service at authorized centers."
    },
    circularity: {
      score: 70,
      grade: "B",
      recyclabilityAnalysis: "72% of materials recoverable through e-waste recycling. ABS plastic and aluminum readily recyclable. Synthetic leather and foam present challenges.",
      materialEfficiency: "Compact design optimizes material usage. Modular ear cup design enables targeted repairs.",
      endOfLifeOptions: ["Trade-in program", "E-waste recycling", "Ear cushion replacement", "Battery replacement"],
      recommendations: ["Design next generation with removable battery", "Phase out synthetic leather for recyclable alternatives"]
    },
    risk: {
      overallRisk: "Low",
      riskFlags: [
        { type: "Battery Safety", severity: "Low", description: "Lithium battery requires proper disposal - standard for category" }
      ],
      dataCompleteness: 88,
      counterfeitRisk: "Low - NFC authentication, serial number verification, warranty registration required",
      complianceIssues: [],
      recommendations: ["Maintain RoHS/REACH compliance documentation", "Consider Conflict Minerals disclosure"]
    }
  },
  {
    summary: {
      summary: "Milano Artisan Leather Tote exemplifies Italian craftsmanship with exceptional durability, natural materials, and a 25-year expected lifespan.",
      keyFeatures: ["Vegetable-tanned leather", "Lifetime warranty", "Made in Italy", "100% natural materials", "Leather Working Group Gold certified"]
    },
    sustainability: {
      overallScore: 85,
      carbonAnalysis: "15kg CO2e reflects premium natural materials. High water usage offset by exceptional durability and long product lifespan.",
      circularityRecommendations: ["Explore leather from regenerative agriculture sources", "Develop take-back and restoration program", "Partner with luxury consignment platforms"],
      improvements: ["Source buttons from recycled brass", "Reduce water usage in tanning process"]
    },
    repair: {
      repairabilityRating: "Excellent",
      repairInstructions: ["Leather conditioning extends life significantly", "Hardware replacement available at boutiques", "Stitching repairs included in warranty", "Professional restoration service available"],
      commonIssues: ["Leather drying without conditioning", "Strap wear at attachment points", "Hardware tarnishing"],
      partsAvailability: "Excellent - all hardware and materials maintained for lifetime of product"
    },
    circularity: {
      score: 92,
      grade: "A",
      recyclabilityAnalysis: "95% of materials are natural and recyclable. Leather biodegrades or can be recycled. Brass hardware is infinitely recyclable.",
      materialEfficiency: "Premium materials with minimal waste. Artisan production ensures no mass production excess.",
      endOfLifeOptions: ["Professional restoration", "Luxury consignment", "Leather recycling", "Natural composting"],
      recommendations: ["Exemplary durability extends product life beyond most categories"]
    },
    risk: {
      overallRisk: "Low",
      riskFlags: [],
      dataCompleteness: 96,
      counterfeitRisk: "Low - RFID authentication tag, artisan signature, certificate of authenticity included",
      complianceIssues: [],
      recommendations: ["Document animal welfare standards for leather sourcing transparency"]
    }
  },
  {
    summary: {
      summary: "EcoNest Smart Thermostat Pro delivers significant energy savings through intelligent climate control with exceptional sustainability credentials and long service life.",
      keyFeatures: ["23% average energy savings", "55% recycled materials", "10-year firmware support", "EU Ecolabel certified", "GDPR compliant"]
    },
    sustainability: {
      overallScore: 89,
      carbonAnalysis: "8kg CO2e for manufacturing is quickly offset by energy savings. Typical household saves 500+ kg CO2e annually through optimized heating/cooling.",
      circularityRecommendations: ["Increase recycled content to 70%", "Implement refurbishment program for returned units", "Develop modular upgrade path"],
      improvements: ["Transition to 100% recycled packaging", "Add end-of-life notification for proactive recycling"]
    },
    repair: {
      repairabilityRating: "Excellent",
      repairInstructions: ["Firmware updates resolve most issues remotely", "Display module is replaceable", "Sensor modules can be swapped", "Wall mount plate replaceable if damaged"],
      commonIssues: ["Display calibration after power outages", "Sensor accuracy drift over time", "Wi-Fi connectivity issues in older homes"],
      partsAvailability: "Excellent - all modules available for 15 years. Firmware updates for 10 years."
    },
    circularity: {
      score: 88,
      grade: "A",
      recyclabilityAnalysis: "90% recyclable through e-waste channels. No hazardous materials. High-value metals recoverable from PCB.",
      materialEfficiency: "Compact design minimizes material usage. 55% recycled content sets industry benchmark.",
      endOfLifeOptions: ["Trade-in upgrade program", "Refurbishment for second life", "E-waste recycling", "Module harvesting"],
      recommendations: ["Document refurbishment potential for second-life market"]
    },
    risk: {
      overallRisk: "Low",
      riskFlags: [],
      dataCompleteness: 98,
      counterfeitRisk: "Very Low - BLE secure pairing, cloud registration required, firmware signing prevents tampering",
      complianceIssues: [],
      recommendations: ["Maintain GDPR compliance documentation for data handling"]
    }
  },
  {
    summary: {
      summary: "The Heavy-Duty Conveyor Belt EP400/3 is a premium industrial belting solution designed for demanding material handling applications with excellent durability and comprehensive service support.",
      keyFeatures: ["400 N/mm tensile strength per ply", "3-ply EP fabric construction", "12-year expected lifespan", "Hot vulcanization repair capable", "24/7 industrial support"]
    },
    sustainability: {
      overallScore: 72,
      carbonAnalysis: "180kg CO2e reflects intensive rubber manufacturing and steel cord production. Long 12-year lifespan significantly reduces lifecycle impact per operational hour.",
      circularityRecommendations: ["Increase recycled rubber content to 25%", "Develop belt retread program for extended life", "Partner with industrial recyclers for end-of-life processing"],
      improvements: ["Explore bio-based rubber alternatives", "Reduce water usage in vulcanization process", "Implement solar energy for manufacturing"]
    },
    repair: {
      repairabilityRating: "Good",
      repairInstructions: ["Hot vulcanization for permanent splice repairs", "Cold bonding adhesives for emergency field repairs", "Belt edge damage repair using specialized kits", "Professional tensioning and tracking adjustment recommended annually"],
      commonIssues: ["Belt tracking misalignment", "Edge wear from material spillage", "Splice joint separation under high tension", "Cover rubber wear in high-abrasion applications"],
      partsAvailability: "Good - splice kits, repair patches, and edge strips available. Regional service centers stock common components."
    },
    circularity: {
      score: 75,
      grade: "B",
      recyclabilityAnalysis: "85% of materials can be recovered. Steel cord is fully recyclable. Rubber can be ground into crumb rubber for secondary applications.",
      materialEfficiency: "Multi-ply design maximizes strength-to-weight ratio. Steel cord reinforcement provides durability without excess material.",
      endOfLifeOptions: ["Belt retreading", "Rubber crumb recycling", "Steel cord recovery", "Secondary use applications (dock bumpers, floor mats)"],
      recommendations: ["Document belt wear patterns for predictive replacement", "Explore closed-loop recycling partnerships"]
    },
    risk: {
      overallRisk: "Low",
      riskFlags: [
        { type: "Installation Safety", severity: "Medium", description: "Professional installation required - pinch point hazards during operation" }
      ],
      dataCompleteness: 92,
      counterfeitRisk: "Low - RFID tag embedded in belt edge, unique batch tracking, manufacturer verification through PhotonicTag",
      complianceIssues: [],
      recommendations: ["Maintain IS 1891:2018 certification documentation", "Document installation and maintenance history for warranty"]
    }
  },
  {
    summary: {
      summary: "The Precision Conveyor Roller System DR-50 is a high-performance industrial roller designed for smooth material handling with precision bearings and durable construction for long-term reliability.",
      keyFeatures: ["500 kg load capacity", "Precision ball bearings", "15-year expected lifespan", "Polyurethane coating option", "Global service network"]
    },
    sustainability: {
      overallScore: 78,
      carbonAnalysis: "45kg CO2e reflects efficient steel manufacturing with 30% recycled content. Long 15-year lifespan and high recyclability minimize environmental impact.",
      circularityRecommendations: ["Increase recycled steel content to 50%", "Develop bearing refurbishment program", "Implement closed-loop steel recycling"],
      improvements: ["Explore bio-based polyurethane alternatives", "Reduce energy consumption in manufacturing", "Optimize packaging for reduced material usage"]
    },
    repair: {
      repairabilityRating: "Excellent",
      repairInstructions: ["Bearing replacement is straightforward with standard tools", "Shaft replacement available for worn components", "Polyurethane coating can be reapplied", "Annual lubrication recommended for optimal performance"],
      commonIssues: ["Bearing wear after extended use", "Shaft runout from heavy loads", "Polyurethane coating wear in abrasive environments", "End cap loosening under vibration"],
      partsAvailability: "Excellent - bearings, shafts, and end caps readily available. Global spare parts distribution network."
    },
    circularity: {
      score: 85,
      grade: "A",
      recyclabilityAnalysis: "90% of materials can be recovered. Steel components are fully recyclable with established infrastructure. Bearings can be refurbished or recycled.",
      materialEfficiency: "Optimized tube diameter and wall thickness maximize strength while minimizing material. Precision manufacturing reduces waste.",
      endOfLifeOptions: ["Roller refurbishment", "Steel recycling", "Bearing refurbishment", "Component harvesting for repair parts"],
      recommendations: ["Implement roller tracking for predictive maintenance", "Document wear patterns for design improvements"]
    },
    risk: {
      overallRisk: "Low",
      riskFlags: [
        { type: "Installation Safety", severity: "Low", description: "Proper lifting equipment required for installation due to component weight" }
      ],
      dataCompleteness: 94,
      counterfeitRisk: "Low - RFID tag on each roller, unique serial number, manufacturer verification through PhotonicTag platform",
      complianceIssues: [],
      recommendations: ["Maintain ISO 9001 and CE certification documentation", "Document installation and service history"]
    }
  }
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

      const aiInsights = demoAIInsights[i];
      if (aiInsights) {
        const insightTypes: { type: AIInsightType; content: Record<string, unknown> }[] = [
          { type: "summary", content: aiInsights.summary as unknown as Record<string, unknown> },
          { type: "sustainability", content: aiInsights.sustainability as unknown as Record<string, unknown> },
          { type: "repair", content: aiInsights.repair as unknown as Record<string, unknown> },
          { type: "circularity", content: aiInsights.circularity as unknown as Record<string, unknown> },
          { type: "risk_assessment", content: aiInsights.risk as unknown as Record<string, unknown> }
        ];
        
        for (const { type, content } of insightTypes) {
          await storage.createAIInsight({
            productId: product.id,
            insightType: type,
            content,
            model: "gpt-4o-demo",
            isStale: false
          });
        }
        console.log(`  - AI insights generated (5 types: summary, sustainability, repair, circularity, risk)`);
      }

      const regionalConfig = regionalExtensionConfigs.find(c => c.productIndex === i);
      if (regionalConfig) {
        for (const region of regionalConfig.regions) {
          await storage.createRegionalExtension({
            productId: product.id,
            regionCode: region.code,
            complianceStatus: region.complianceStatus,
            payload: region.payload,
            schemaVersion: "1.0"
          });
        }
        const regionCodes = regionalConfig.regions.map(r => r.code).join(", ");
        console.log(`  - Regional extensions created (${regionCodes})`);
      }

      console.log(`  [SUCCESS] ${productData.productName}\n`);
    } catch (error) {
      console.error(`  [ERROR] Failed to create ${productData.productName}:`, error);
    }
  }

  console.log("\nDemo data seeding complete!");
  console.log("Created 10 products across industries: Batteries, Textiles, IoT Devices, Packaging, EV Accessories, Consumer Electronics, Fashion Accessories, Smart Home, Industrial Belting, Industrial Rollers");
  console.log("Regional compliance: EU (ESPR, Battery Regulation), China (CCC, GB Standards), US (FTC, State EPR), India (BIS)");
}

export { seedDemoData };
