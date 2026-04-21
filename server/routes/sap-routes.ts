import { Router, Request, Response } from "express";
import { sapMockService, SAPMaterial, SAPConflict } from "../services/sap-mock-service";
import { SAPODataClient, scheduleConnectorSync, clearScheduledSync, getActiveSchedules, applyFieldMappings } from "../services/sap-odata-client";
import { storage } from "../storage";
import type { InsertProduct, SAPConfig, FieldMapping } from "@shared/schema";
import { decryptSAPCredentials } from "../services/crypto-service";

/** Merge a DB connector row's redacted config with its decrypted credentials. */
function materializeSAPConfig(connector: { config: unknown; credentialsCiphertext?: string | null }): SAPConfig {
  const base = (connector.config ?? {}) as Record<string, unknown>;
  return decryptSAPCredentials(base, connector.credentialsCiphertext ?? null) as unknown as SAPConfig;
}

const router = Router();

router.get("/materials", async (_req: Request, res: Response) => {
  try {
    const materials = sapMockService.getAllMaterials();
    res.json(materials);
  } catch (error) {
    console.error("[SAP API] Error fetching materials:", error);
    res.status(500).json({ error: "Failed to fetch SAP materials" });
  }
});

router.get("/materials/:matnr", async (req: Request, res: Response) => {
  try {
    const material = sapMockService.getMaterial(req.params.matnr);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    res.json(material);
  } catch (error) {
    console.error("[SAP API] Error fetching material:", error);
    res.status(500).json({ error: "Failed to fetch SAP material" });
  }
});

router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const stats = sapMockService.getStats();
    const photonicTagProducts = await storage.getAllProducts();
    res.json({
      sap: stats,
      photonicTag: {
        totalProducts: photonicTagProducts.length,
      },
    });
  } catch (error) {
    console.error("[SAP API] Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/sync-events", async (_req: Request, res: Response) => {
  try {
    const events = sapMockService.getSyncEvents();
    res.json(events);
  } catch (error) {
    console.error("[SAP API] Error fetching sync events:", error);
    res.status(500).json({ error: "Failed to fetch sync events" });
  }
});

router.get("/conflicts", async (_req: Request, res: Response) => {
  try {
    const conflicts = sapMockService.getConflicts();
    res.json(conflicts);
  } catch (error) {
    console.error("[SAP API] Error fetching conflicts:", error);
    res.status(500).json({ error: "Failed to fetch conflicts" });
  }
});

router.post("/sync/from-sap", async (req: Request, res: Response) => {
  try {
    const { matnrs, limit = 10, connectorId } = req.body;
    const materials = sapMockService.getAllMaterials();

    // Load connector field mappings if a connectorId is provided
    let fieldMappings: FieldMapping[] = [];
    if (connectorId) {
      const connector = await storage.getEnterpriseConnector(connectorId);
      if (connector?.fieldMappings?.length) {
        fieldMappings = connector.fieldMappings as FieldMapping[];
      }
    }
    
    let toSync: SAPMaterial[];
    if (matnrs && Array.isArray(matnrs)) {
      toSync = materials.filter(m => matnrs.includes(m.MARA.MATNR));
    } else {
      toSync = materials
        .filter(m => m.syncStatus === "pending" && !m.photonicTagId)
        .slice(0, limit);
    }

    let created = 0;
    let updated = 0;
    let failed = 0;
    const conflicts: SAPConflict[] = [];

    for (const material of toSync) {
      try {
        const existingProducts = await storage.getAllProducts();
        const existing = existingProducts.find(p => p.modelNumber === material.MARA.MATNR);

        // Use user-configured field mappings if available, otherwise hardcoded baseline
        const mappedData = fieldMappings.length
          ? applyFieldMappings(material, fieldMappings)
          : sapMockService.mapToPhotonicTagProduct(material);

        if (existing) {
          const detectedConflicts = sapMockService.detectConflicts(material, existing);
          if (detectedConflicts.length > 0) {
            for (const conflict of detectedConflicts) {
              const savedConflict = sapMockService.addConflict(conflict);
              conflicts.push(savedConflict);
            }
            material.syncStatus = "conflict";
          } else {
            await storage.updateProduct(existing.id, mappedData);
            sapMockService.linkToPhotonicTag(material.MARA.MATNR, existing.id);
            updated++;
          }
        } else {
          const md1 = mappedData as Record<string, unknown>;
          const rawDate1 = md1.dateOfManufacture;
          const newProduct = await storage.createProduct({
            ...mappedData,
            description: `Imported from SAP Material ${material.MARA.MATNR}`,
            materials: md1.materials as string || "",
            safetyCertifications: [],
            carbonFootprint: Math.round(Number(md1.carbonFootprint ?? 0)),
            repairabilityScore: Math.round(Number(md1.repairabilityScore ?? 0)),
            warrantyInfo: md1.warrantyInfo as string || "",
            recyclingInstructions: md1.recyclingInstructions as string || "",
            dateOfManufacture: rawDate1 instanceof Date ? rawDate1 : rawDate1 ? new Date(rawDate1 as string) : undefined,
          } as unknown as InsertProduct);
          
          sapMockService.linkToPhotonicTag(material.MARA.MATNR, newProduct.id);
          created++;
        }
      } catch (err) {
        console.error(`[SAP Sync] Failed to sync ${material.MARA.MATNR}:`, err);
        material.syncStatus = "error";
        failed++;
      }
    }

    const syncEvent = sapMockService.recordSyncEvent({
      direction: "sap_to_pt",
      status: failed > 0 ? (created + updated > 0 ? "partial" : "failed") : 
              conflicts.length > 0 ? "conflict" : "success",
      materialsProcessed: toSync.length,
      materialsCreated: created,
      materialsUpdated: updated,
      materialsFailed: failed,
      conflicts,
      details: `Synced ${created} new, ${updated} updated from SAP to PhotonicTag`,
    });

    res.json({
      syncEvent,
      created,
      updated,
      failed,
      conflicts,
    });
  } catch (error) {
    console.error("[SAP API] Error syncing from SAP:", error);
    res.status(500).json({ error: "Failed to sync from SAP" });
  }
});

router.post("/sync/to-sap", async (req: Request, res: Response) => {
  try {
    const { productIds } = req.body;
    const materials = sapMockService.getAllMaterials();
    const linkedMaterials = materials.filter(m => m.photonicTagId);
    
    let toSync: SAPMaterial[];
    if (productIds && Array.isArray(productIds)) {
      toSync = linkedMaterials.filter(m => productIds.includes(m.photonicTagId));
    } else {
      toSync = linkedMaterials.filter(m => m.syncStatus === "pending" || m.syncStatus === "synced");
    }

    let updated = 0;
    let failed = 0;
    const conflicts: SAPConflict[] = [];

    for (const material of toSync) {
      try {
        if (!material.photonicTagId) continue;
        
        const product = await storage.getProduct(material.photonicTagId);
        if (!product) {
          sapMockService.unlinkFromPhotonicTag(material.MARA.MATNR);
          continue;
        }

        const detectedConflicts = sapMockService.detectConflicts(material, product);
        if (detectedConflicts.length > 0 && material.syncStatus === "synced") {
          for (const conflict of detectedConflicts) {
            const savedConflict = sapMockService.addConflict(conflict);
            conflicts.push(savedConflict);
          }
          material.syncStatus = "conflict";
        } else {
          const updates = sapMockService.mapFromPhotonicTagProduct(product, material.MARA.MATNR);
          sapMockService.updateMaterial(material.MARA.MATNR, updates);
          material.syncStatus = "synced";
          material.lastSyncedAt = new Date().toISOString();
          updated++;
        }
      } catch (err) {
        console.error(`[SAP Sync] Failed to sync to SAP ${material.MARA.MATNR}:`, err);
        material.syncStatus = "error";
        failed++;
      }
    }

    const syncEvent = sapMockService.recordSyncEvent({
      direction: "pt_to_sap",
      status: failed > 0 ? (updated > 0 ? "partial" : "failed") :
              conflicts.length > 0 ? "conflict" : "success",
      materialsProcessed: toSync.length,
      materialsCreated: 0,
      materialsUpdated: updated,
      materialsFailed: failed,
      conflicts,
      details: `Synced ${updated} products from PhotonicTag to SAP`,
    });

    res.json({
      syncEvent,
      updated,
      failed,
      conflicts,
    });
  } catch (error) {
    console.error("[SAP API] Error syncing to SAP:", error);
    res.status(500).json({ error: "Failed to sync to SAP" });
  }
});

router.post("/sync/bidirectional", async (req: Request, res: Response) => {
  try {
    const { limit = 20, connectorId } = req.body;
    const materials = sapMockService.getAllMaterials();

    // Load connector field mappings if a connectorId is provided
    let fieldMappings: FieldMapping[] = [];
    if (connectorId) {
      const connector = await storage.getEnterpriseConnector(connectorId);
      if (connector?.fieldMappings?.length) {
        fieldMappings = connector.fieldMappings as FieldMapping[];
      }
    }
    
    let created = 0;
    let updated = 0;
    let failed = 0;
    const conflicts: SAPConflict[] = [];

    const unlinked = materials.filter(m => !m.photonicTagId).slice(0, limit);
    for (const material of unlinked) {
      try {
        const mappedData = fieldMappings.length
          ? applyFieldMappings(material, fieldMappings)
          : sapMockService.mapToPhotonicTagProduct(material);
        const md2 = mappedData as Record<string, unknown>;
        const rawDate2 = md2.dateOfManufacture;
        const newProduct = await storage.createProduct({
          ...mappedData,
          description: `Imported from SAP Material ${material.MARA.MATNR}`,
          materials: md2.materials as string || "",
          safetyCertifications: [],
          carbonFootprint: Math.round(Number(md2.carbonFootprint ?? 0)),
          repairabilityScore: Math.round(Number(md2.repairabilityScore ?? 0)),
          warrantyInfo: md2.warrantyInfo as string || "",
          recyclingInstructions: md2.recyclingInstructions as string || "",
          dateOfManufacture: rawDate2 instanceof Date ? rawDate2 : rawDate2 ? new Date(rawDate2 as string) : undefined,
        } as unknown as InsertProduct);
        
        sapMockService.linkToPhotonicTag(material.MARA.MATNR, newProduct.id);
        created++;
      } catch (err) {
        console.error(`[SAP Sync] Failed to create from ${material.MARA.MATNR}:`, err);
        failed++;
      }
    }

    const linked = materials.filter(m => m.photonicTagId);
    for (const material of linked) {
      try {
        const product = await storage.getProduct(material.photonicTagId!);
        if (!product) {
          sapMockService.unlinkFromPhotonicTag(material.MARA.MATNR);
          continue;
        }

        const detectedConflicts = sapMockService.detectConflicts(material, product);
        if (detectedConflicts.length > 0) {
          for (const conflict of detectedConflicts) {
            const savedConflict = sapMockService.addConflict(conflict);
            conflicts.push(savedConflict);
          }
          material.syncStatus = "conflict";
        } else {
          material.syncStatus = "synced";
          material.lastSyncedAt = new Date().toISOString();
          updated++;
        }
      } catch (err) {
        console.error(`[SAP Sync] Failed to check ${material.MARA.MATNR}:`, err);
        failed++;
      }
    }

    const syncEvent = sapMockService.recordSyncEvent({
      direction: "bidirectional",
      status: failed > 0 ? "partial" : conflicts.length > 0 ? "conflict" : "success",
      materialsProcessed: unlinked.length + linked.length,
      materialsCreated: created,
      materialsUpdated: updated,
      materialsFailed: failed,
      conflicts,
      details: `Bidirectional sync: ${created} created, ${updated} verified, ${conflicts.length} conflicts`,
    });

    res.json({
      syncEvent,
      created,
      updated,
      failed,
      conflicts,
    });
  } catch (error) {
    console.error("[SAP API] Error in bidirectional sync:", error);
    res.status(500).json({ error: "Failed to perform bidirectional sync" });
  }
});

router.post("/conflicts/:id/resolve", async (req: Request, res: Response) => {
  try {
    const { resolvedBy } = req.body;
    if (!["sap", "photonictag", "manual"].includes(resolvedBy)) {
      return res.status(400).json({ error: "Invalid resolution type" });
    }

    const conflict = sapMockService.resolveConflict(req.params.id, resolvedBy);
    if (!conflict) {
      return res.status(404).json({ error: "Conflict not found" });
    }

    const material = sapMockService.getMaterial(conflict.matnr);
    if (material) {
      material.syncStatus = "synced";
      material.lastSyncedAt = new Date().toISOString();
    }

    res.json(conflict);
  } catch (error) {
    console.error("[SAP API] Error resolving conflict:", error);
    res.status(500).json({ error: "Failed to resolve conflict" });
  }
});

router.post("/materials/:matnr/update", async (req: Request, res: Response) => {
  try {
    const { updates } = req.body;
    const material = sapMockService.updateMaterial(req.params.matnr, updates);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    res.json(material);
  } catch (error) {
    console.error("[SAP API] Error updating material:", error);
    res.status(500).json({ error: "Failed to update material" });
  }
});

// ─── Real OData connection test ───────────────────────────────────────────────

router.post("/test-connection", async (req: Request, res: Response) => {
  try {
    const config = req.body as SAPConfig;
    if (!config) {
      return res.status(400).json({ error: "SAP config required" });
    }
    const client = new SAPODataClient(config);
    const result = await client.testConnection();
    res.json(result);
  } catch (error) {
    console.error("[SAP API] Connection test error:", error);
    res.status(500).json({ error: "Connection test failed", details: String(error) });
  }
});

// Test connection for a persisted connector
router.post("/connectors/:id/test-real", async (req: Request, res: Response) => {
  try {
    const connectors = await storage.getAllEnterpriseConnectors();
    const connector = connectors.find(c => c.id === req.params.id && c.connectorType === "sap");
    if (!connector) {
      return res.status(404).json({ error: "SAP connector not found" });
    }
    const config = materializeSAPConfig(connector);
    const client = new SAPODataClient(config);
    const result = await client.testConnection();

    // Update connector status in DB based on result
    await storage.updateEnterpriseConnector(connector.id, {
      status: result.success ? "active" : "error",
      lastSyncStatus: result.success ? "connection_ok" : result.error,
    });

    res.json(result);
  } catch (error) {
    console.error("[SAP API] Connector test error:", error);
    res.status(500).json({ error: "Test failed", details: String(error) });
  }
});

// ─── Scheduler management ─────────────────────────────────────────────────────

router.get("/scheduler/status", (_req: Request, res: Response) => {
  res.json({ activeConnectors: getActiveSchedules() });
});

router.post("/scheduler/start/:connectorId", async (req: Request, res: Response) => {
  try {
    const connector = await storage.getEnterpriseConnector(req.params.connectorId);
    if (!connector || connector.connectorType !== "sap") {
      return res.status(404).json({ error: "SAP connector not found" });
    }
    const config = materializeSAPConfig(connector);

    scheduleConnectorSync(connector.id, config, async (connectorId, client) => {
      const result = await client.fetchMaterials({ top: 100 });
      console.log(`[SAPScheduler] Fetched ${result.materials.length} materials for ${connectorId} (mock: ${result.usedMock})`);
      await storage.updateEnterpriseConnector(connectorId, {
        lastSyncStatus: result.error ? `error: ${result.error}` : "ok",
        productsSynced: result.totalCount,
      });
    });

    res.json({ message: "Scheduler started", connectorId: connector.id });
  } catch (error) {
    console.error("[SAP API] Scheduler start error:", error);
    res.status(500).json({ error: "Failed to start scheduler" });
  }
});

router.post("/scheduler/stop/:connectorId", (req: Request, res: Response) => {
  clearScheduledSync(req.params.connectorId);
  res.json({ message: "Scheduler stopped", connectorId: req.params.connectorId });
});

// ─── Fetch real materials via OData (with mock fallback) ─────────────────────

router.post("/fetch-materials", async (req: Request, res: Response) => {
  try {
    const { connectorId, top = 50, skip = 0, materialTypes, plants } = req.body;
    
    let config: SAPConfig | null = null;
    if (connectorId) {
      const connector = await storage.getEnterpriseConnector(connectorId);
      if (connector?.connectorType === "sap") {
        config = materializeSAPConfig(connector);
      }
    }

    const client = new SAPODataClient(config ?? {
      systemType: "S4HANA", hostname: "mock", port: 443, client: "100",
      systemId: "DEMO", apiType: "OData", oauthEnabled: false, syncFrequency: "manual",
    });

    const result = await client.fetchMaterials({ top, skip, materialTypes, plants });
    res.json(result);
  } catch (error) {
    console.error("[SAP API] Fetch materials error:", error);
    res.status(500).json({ error: "Failed to fetch materials" });
  }
});

export default router;
