import type { Product } from "@shared/schema";

export interface SAPMaterialMARA {
  MATNR: string;
  MAKTX: string;
  MTART: string;
  MATKL: string;
  MEINS: string;
  BRGEW: number;
  GEWEI: string;
  NTGEW: number;
  ERSDA: string;
  ERNAM: string;
  LAEDA: string;
  AENAM: string;
  PSTAT: string;
  MSTAE: string;
  LABOR: string;
  EKWSL: string;
  NORMT: string;
  FERTH: string;
  ZEINR: string;
}

export interface SAPMaterialMARC {
  MATNR: string;
  WERKS: string;
  PSTAT: string;
  LVORM: string;
  EKGRP: string;
  DISMM: string;
  DISPO: string;
  DISLS: string;
  BESKZ: string;
  SOBSL: string;
  MINBE: number;
  EISBE: number;
  BSTMI: number;
  BSTMA: number;
  BSTFE: number;
  BSTRF: number;
  MABST: number;
  LOSFX: number;
  AUSDT: string;
  NFMAT: string;
  SBDKZ: string;
  LAGPR: string;
  XCHPF: string;
  LGRAD: number;
}

export interface SAPMaterial {
  MARA: SAPMaterialMARA;
  MARC: SAPMaterialMARC;
  photonicTagId?: string;
  syncStatus: "pending" | "synced" | "conflict" | "error";
  lastSyncedAt?: string;
  localModifiedAt?: string;
}

export interface SAPSyncEvent {
  id: string;
  timestamp: string;
  direction: "sap_to_pt" | "pt_to_sap" | "bidirectional";
  status: "success" | "partial" | "failed" | "conflict";
  materialsProcessed: number;
  materialsCreated: number;
  materialsUpdated: number;
  materialsFailed: number;
  conflicts: SAPConflict[];
  details: string;
}

export interface SAPConflict {
  id: string;
  matnr: string;
  productName: string;
  field: string;
  sapValue: string;
  photonicTagValue: string;
  resolvedBy?: "sap" | "photonictag" | "manual";
  resolvedAt?: string;
}

const materialTypes = [
  { code: "FERT", name: "Finished Product" },
  { code: "HALB", name: "Semifinished Product" },
  { code: "ROH", name: "Raw Material" },
  { code: "HIBE", name: "Operating Supplies" },
  { code: "VERP", name: "Packaging" },
];

const materialGroups = [
  { code: "001", name: "Electronics" },
  { code: "002", name: "Batteries" },
  { code: "003", name: "Textiles" },
  { code: "004", name: "Industrial Parts" },
  { code: "005", name: "Smart Devices" },
  { code: "006", name: "Automotive" },
  { code: "007", name: "Consumer Goods" },
  { code: "008", name: "Packaging Materials" },
  { code: "009", name: "Fashion" },
  { code: "010", name: "Home Appliances" },
];

const plants = [
  { code: "1000", name: "Main Production DE" },
  { code: "2000", name: "Assembly Plant FR" },
  { code: "3000", name: "Distribution Center NL" },
  { code: "4000", name: "Asia Pacific SG" },
];

const productPrefixes = [
  "EcoPower", "SmartTech", "ProGrade", "GreenLine", "IndustrialMax",
  "PrecisionCore", "FlexiFlow", "NanoGuard", "ThermoShield", "UltraLight",
  "CarbonFlex", "HydroSeal", "MicroPrecision", "PowerCell", "SafeGuard",
  "EcoSmart", "DuraMax", "FlexTech", "CorePlus", "ProSeries",
];

const productTypes = [
  "Battery Pack", "Sensor Module", "Control Unit", "Power Supply", "Display Panel",
  "Motor Assembly", "Connector Kit", "Filter Element", "Heat Exchanger", "Pump Unit",
  "Valve Assembly", "Circuit Board", "Cable Harness", "Housing Unit", "Seal Kit",
  "Bearing Set", "Gear Assembly", "Spring Pack", "Membrane Filter", "Cooling Fan",
];

const suffixes = [
  "Pro", "Elite", "Plus", "Max", "Ultra", "Advanced", "Premium", "Standard",
  "Compact", "Industrial", "Commercial", "Residential", "Mobile", "Portable",
];

function generateMATNR(index: number): string {
  const prefix = ["MAT", "PRD", "ASM", "CMP", "MOD"][index % 5];
  return `${prefix}-${String(index + 1).padStart(6, "0")}`;
}

function generateProductName(index: number): string {
  const prefix = productPrefixes[index % productPrefixes.length];
  const type = productTypes[Math.floor(index / 5) % productTypes.length];
  const suffix = suffixes[index % suffixes.length];
  const version = `${Math.floor(index / 20) + 1}.${(index % 10)}`;
  return `${prefix} ${type} ${suffix} v${version}`;
}

function generateDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
}

function generateSAPMaterial(index: number): SAPMaterial {
  const matnr = generateMATNR(index);
  const materialType = materialTypes[index % materialTypes.length];
  const materialGroup = materialGroups[index % materialGroups.length];
  const plant = plants[index % plants.length];
  const createdDaysAgo = 365 + Math.floor(Math.random() * 730);
  const modifiedDaysAgo = Math.floor(Math.random() * 30);

  const mara: SAPMaterialMARA = {
    MATNR: matnr,
    MAKTX: generateProductName(index),
    MTART: materialType.code,
    MATKL: materialGroup.code,
    MEINS: ["EA", "PC", "KG", "M", "L"][index % 5],
    BRGEW: Math.round((5 + Math.random() * 45) * 100) / 100,
    GEWEI: "KG",
    NTGEW: Math.round((4 + Math.random() * 40) * 100) / 100,
    ERSDA: generateDate(createdDaysAgo),
    ERNAM: ["SAPUSER01", "SAPUSER02", "ADMIN"][index % 3],
    LAEDA: generateDate(modifiedDaysAgo),
    AENAM: ["SAPUSER01", "SAPUSER02", "INTEGRATION"][index % 3],
    PSTAT: "KDEBW",
    MSTAE: ["01", "02", ""][index % 3],
    LABOR: ["001", "002", "003"][index % 3],
    EKWSL: ["A", "B", "C"][index % 3],
    NORMT: `NORM-${String(index + 1).padStart(4, "0")}`,
    FERTH: `BATCH-${generateDate(modifiedDaysAgo).replace(/-/g, "")}`,
    ZEINR: `DWG-${String(index + 1).padStart(5, "0")}`,
  };

  const marc: SAPMaterialMARC = {
    MATNR: matnr,
    WERKS: plant.code,
    PSTAT: "KDEF",
    LVORM: "",
    EKGRP: ["001", "002", "003"][index % 3],
    DISMM: ["PD", "VB", "ND"][index % 3],
    DISPO: ["001", "002"][index % 2],
    DISLS: ["EX", "MB", ""][index % 3],
    BESKZ: ["E", "F", "X"][index % 3],
    SOBSL: ["30", "40", ""][index % 3],
    MINBE: Math.floor(10 + Math.random() * 90),
    EISBE: Math.floor(50 + Math.random() * 150),
    BSTMI: Math.floor(1 + Math.random() * 10),
    BSTMA: Math.floor(100 + Math.random() * 900),
    BSTFE: Math.floor(10 + Math.random() * 50),
    BSTRF: Math.floor(5 + Math.random() * 20),
    MABST: Math.floor(1000 + Math.random() * 9000),
    LOSFX: Math.floor(1 + Math.random() * 5),
    AUSDT: "",
    NFMAT: "",
    SBDKZ: ["1", "2", ""][index % 3],
    LAGPR: ["A", "B", "C"][index % 3],
    XCHPF: index % 4 === 0 ? "X" : "",
    LGRAD: Math.floor(80 + Math.random() * 20),
  };

  return {
    MARA: mara,
    MARC: marc,
    syncStatus: "pending",
    localModifiedAt: new Date().toISOString(),
  };
}

class SAPMockService {
  private materials: Map<string, SAPMaterial> = new Map();
  private syncEvents: SAPSyncEvent[] = [];
  private conflicts: SAPConflict[] = [];
  private initialized = false;

  initialize(): void {
    if (this.initialized) return;
    
    for (let i = 0; i < 100; i++) {
      const material = generateSAPMaterial(i);
      this.materials.set(material.MARA.MATNR, material);
    }
    this.initialized = true;
    console.log("[SAP Mock] Initialized with 100 materials");
  }

  getAllMaterials(): SAPMaterial[] {
    this.initialize();
    return Array.from(this.materials.values());
  }

  getMaterial(matnr: string): SAPMaterial | undefined {
    this.initialize();
    return this.materials.get(matnr);
  }

  updateMaterial(matnr: string, updates: Partial<SAPMaterialMARA>): SAPMaterial | undefined {
    this.initialize();
    const material = this.materials.get(matnr);
    if (!material) return undefined;

    material.MARA = { ...material.MARA, ...updates };
    material.MARA.LAEDA = new Date().toISOString().split("T")[0];
    material.localModifiedAt = new Date().toISOString();
    material.syncStatus = material.photonicTagId ? "pending" : material.syncStatus;
    
    return material;
  }

  linkToPhotonicTag(matnr: string, productId: string): void {
    this.initialize();
    const material = this.materials.get(matnr);
    if (material) {
      material.photonicTagId = productId;
      material.syncStatus = "synced";
      material.lastSyncedAt = new Date().toISOString();
    }
  }

  unlinkFromPhotonicTag(matnr: string): void {
    this.initialize();
    const material = this.materials.get(matnr);
    if (material) {
      material.photonicTagId = undefined;
      material.syncStatus = "pending";
      material.lastSyncedAt = undefined;
    }
  }

  recordSyncEvent(event: Omit<SAPSyncEvent, "id" | "timestamp">): SAPSyncEvent {
    const syncEvent: SAPSyncEvent = {
      id: `SYNC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };
    this.syncEvents.unshift(syncEvent);
    if (this.syncEvents.length > 100) {
      this.syncEvents = this.syncEvents.slice(0, 100);
    }
    return syncEvent;
  }

  getSyncEvents(): SAPSyncEvent[] {
    return this.syncEvents;
  }

  addConflict(conflict: Omit<SAPConflict, "id">): SAPConflict {
    const newConflict: SAPConflict = {
      id: `CONF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...conflict,
    };
    this.conflicts.unshift(newConflict);
    return newConflict;
  }

  getConflicts(): SAPConflict[] {
    return this.conflicts.filter(c => !c.resolvedAt);
  }

  resolveConflict(conflictId: string, resolvedBy: "sap" | "photonictag" | "manual"): SAPConflict | undefined {
    const conflict = this.conflicts.find(c => c.id === conflictId);
    if (conflict) {
      conflict.resolvedBy = resolvedBy;
      conflict.resolvedAt = new Date().toISOString();
    }
    return conflict;
  }

  getStats() {
    this.initialize();
    const materials = Array.from(this.materials.values());
    return {
      totalMaterials: materials.length,
      synced: materials.filter(m => m.syncStatus === "synced").length,
      pending: materials.filter(m => m.syncStatus === "pending").length,
      conflicts: materials.filter(m => m.syncStatus === "conflict").length,
      errors: materials.filter(m => m.syncStatus === "error").length,
      linked: materials.filter(m => m.photonicTagId).length,
    };
  }

  mapToPhotonicTagProduct(material: SAPMaterial): Partial<Product> {
    const categoryMap: Record<string, string> = {
      "001": "Consumer Electronics",
      "002": "Batteries",
      "003": "Apparel",
      "004": "Industrial Parts",
      "005": "IoT Devices",
      "006": "EV Accessories",
      "007": "Consumer Goods",
      "008": "Industrial Packaging",
      "009": "Fashion Accessories",
      "010": "Smart Home",
    };

    return {
      productName: material.MARA.MAKTX,
      productCategory: categoryMap[material.MARA.MATKL] || "General",
      manufacturer: `SAP Plant ${material.MARC.WERKS}`,
      modelNumber: material.MARA.MATNR,
      sku: material.MARA.NORMT,
      batchNumber: material.MARA.FERTH,
      countryOfOrigin: material.MARC.WERKS === "1000" ? "Germany" : 
                       material.MARC.WERKS === "2000" ? "France" :
                       material.MARC.WERKS === "3000" ? "Netherlands" : "Singapore",
      dateOfManufacture: new Date(material.MARA.ERSDA),
    };
  }

  mapFromPhotonicTagProduct(product: Product, matnr: string): Partial<SAPMaterialMARA> {
    return {
      MAKTX: product.productName || "",
      FERTH: product.batchNumber || "",
      LAEDA: new Date().toISOString().split("T")[0],
      AENAM: "PHOTONICTAG",
    };
  }

  detectConflicts(material: SAPMaterial, product: Product): SAPConflict[] {
    const conflicts: SAPConflict[] = [];
    
    if (material.MARA.MAKTX !== product.productName && product.productName) {
      conflicts.push({
        id: "",
        matnr: material.MARA.MATNR,
        productName: product.productName,
        field: "Product Name",
        sapValue: material.MARA.MAKTX,
        photonicTagValue: product.productName,
      });
    }

    if (material.MARA.FERTH !== product.batchNumber && product.batchNumber) {
      conflicts.push({
        id: "",
        matnr: material.MARA.MATNR,
        productName: product.productName || material.MARA.MAKTX,
        field: "Batch Number",
        sapValue: material.MARA.FERTH,
        photonicTagValue: product.batchNumber,
      });
    }

    return conflicts;
  }
}

export const sapMockService = new SAPMockService();
