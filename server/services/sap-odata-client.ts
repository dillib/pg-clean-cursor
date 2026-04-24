/**
 * SAP OData Client — real HTTP connector with mock fallback
 * Supports: S/4HANA Cloud (OData v4), ECC on-premise (OData v2), Business One (SL API)
 * Authentication: Basic, OAuth2 (Client Credentials), SAML
 */

import type { SAPConfig, FieldMapping } from "@shared/schema";
import type { SAPMaterial } from "./sap-mock-service";
import { sapMockService } from "./sap-mock-service";

export interface ODataMaterial {
  Material: string;
  MaterialDescription: string;
  MaterialType: string;
  MaterialGroup: string;
  BaseUnit: string;
  GrossWeight: number;
  WeightUnit: string;
  NetWeight: number;
  Plant?: string;
  CreationDate?: string;
  CreatedByUser?: string;
  LastChangeDate?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  systemInfo?: {
    systemId: string;
    systemType: string;
    release?: string;
    description?: string;
  };
  latencyMs?: number;
  error?: string;
  usedMock: boolean;
}

export interface MaterialSyncResult {
  materials: ODataMaterial[];
  totalCount: number;
  nextLink?: string;
  usedMock: boolean;
  error?: string;
}

export class SAPODataClient {
  private config: SAPConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config: SAPConfig) {
    this.config = config;
  }

  /**
   * True when the configured host is the demo / mock sentinel — keeps the
   * "real path with safe demo fallback" behavior centralized in the client.
   */
  isMockHost(): boolean {
    return (
      !this.config.hostname ||
      this.config.hostname.includes("mock") ||
      this.config.hostname === "demo.sap.example.com"
    );
  }

  private getBaseUrl(): string {
    if (this.config.baseUrl) return this.config.baseUrl;
    const protocol = (this.config.sslVerify === false) ? "http" : "https";
    const host = this.config.hostname;
    const port = this.config.port !== 443 && this.config.port !== 80 ? `:${this.config.port}` : "";
    
    switch (this.config.systemType) {
      case "S4HANA":
        return `${protocol}://${host}${port}/sap/opu/odata4/sap/api_product/srvd_a2x/sap/product/0001`;
      case "ECC":
        return `${protocol}://${host}${port}/sap/opu/odata/SAP`;
      case "Business_One":
        return `${protocol}://${host}${port}/b1s/v1`;
      default:
        return `${protocol}://${host}${port}/sap/opu/odata/sap`;
    }
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Accept": "application/json",
      "Content-Type": "application/json",
    };

    const authMethod = this.config.authMethod ?? (this.config.oauthEnabled ? "oauth2" : "basic");

    if (authMethod === "basic" && this.config.username) {
      const credentials = btoa(`${this.config.username}:${this.config.password ?? ""}`);
      headers["Authorization"] = `Basic ${credentials}`;
    } else if (authMethod === "oauth2" && this.config.oauthClientId) {
      const token = await this.getOAuthToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    if (this.config.systemType === "ECC" || this.config.systemType === "S4HANA") {
      headers["sap-client"] = this.config.client ?? "100";
    }

    return headers;
  }

  private async getOAuthToken(): Promise<string | null> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 30000) {
      return this.accessToken;
    }

    const tokenUrl = this.config.oauthTokenUrl;
    if (!tokenUrl || !this.config.oauthClientId) return null;

    try {
      const body = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: this.config.oauthClientId,
        client_secret: this.config.oauthClientSecret ?? "",
        scope: this.config.oauthScope ?? "",
      });

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) throw new Error(`Token request failed: ${response.status}`);
      const data = await response.json() as { access_token: string; expires_in?: number };
      this.accessToken = data.access_token;
      this.tokenExpiresAt = Date.now() + (data.expires_in ?? 3600) * 1000;
      return this.accessToken;
    } catch {
      return null;
    }
  }

  async testConnection(): Promise<ConnectionTestResult> {
    const start = Date.now();

    if (!this.config.hostname || this.config.hostname.includes("mock") || this.config.hostname === "demo.sap.example.com") {
      return {
        success: true,
        usedMock: true,
        latencyMs: 12,
        systemInfo: {
          systemId: this.config.systemId || "DEMO",
          systemType: this.config.systemType,
          release: "2023 FPS02",
          description: "PhotonicTag Demo SAP Environment",
        },
      };
    }

    try {
      const headers = await this.getAuthHeaders();
      const baseUrl = this.getBaseUrl();

      let pingUrl: string;
      switch (this.config.systemType) {
        case "S4HANA":
          pingUrl = `${baseUrl}/Product?$top=1&$select=Material`;
          break;
        case "Business_One":
          pingUrl = `${baseUrl}/Company`;
          break;
        default:
          pingUrl = `${baseUrl}/SEPM_C_SO_ItemTP?$top=1`;
      }

      const response = await fetch(pingUrl, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(8000),
      });

      const latencyMs = Date.now() - start;

      if (response.ok || response.status === 200) {
        const sysId = response.headers.get("sap-system-id") ?? this.config.systemId;
        const release = response.headers.get("sap-software-version") ?? undefined;
        return {
          success: true,
          usedMock: false,
          latencyMs,
          systemInfo: { systemId: sysId, systemType: this.config.systemType, release },
        };
      }

      return {
        success: false,
        usedMock: false,
        latencyMs,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      const isMockFallback = msg.includes("ECONNREFUSED") || msg.includes("ENOTFOUND") || msg.includes("timeout");
      return {
        success: false,
        usedMock: false,
        latencyMs: Date.now() - start,
        error: isMockFallback
          ? `Cannot reach ${this.config.hostname} — verify hostname, port, and network access`
          : msg,
      };
    }
  }

  async fetchMaterials(options?: {
    materialTypes?: string[];
    plants?: string[];
    top?: number;
    skip?: number;
    skiptoken?: string;
  }): Promise<MaterialSyncResult> {
    const isMockHost =
      !this.config.hostname ||
      this.config.hostname.includes("mock") ||
      this.config.hostname === "demo.sap.example.com";

    if (isMockHost) {
      const mockMaterials = sapMockService.getAllMaterials();
      return {
        materials: mockMaterials.map(m => ({
          Material: m.MARA.MATNR,
          MaterialDescription: m.MARA.MAKTX,
          MaterialType: m.MARA.MTART,
          MaterialGroup: m.MARA.MATKL,
          BaseUnit: m.MARA.MEINS,
          GrossWeight: m.MARA.BRGEW,
          WeightUnit: m.MARA.GEWEI,
          NetWeight: m.MARA.NTGEW,
          Plant: m.MARC.WERKS,
          CreationDate: m.MARA.ERSDA,
          CreatedByUser: m.MARA.ERNAM,
          LastChangeDate: m.MARA.LAEDA,
        })),
        totalCount: mockMaterials.length,
        usedMock: true,
      };
    }

    try {
      const headers = await this.getAuthHeaders();
      const baseUrl = this.getBaseUrl();
      const top = options?.top ?? 100;
      const skip = options?.skip ?? 0;

      const filters: string[] = [];
      if (options?.materialTypes?.length) {
        const typeFilter = options.materialTypes.map(t => `MaterialType eq '${t}'`).join(" or ");
        filters.push(`(${typeFilter})`);
      }

      const filterStr = filters.length ? `&$filter=${encodeURIComponent(filters.join(" and "))}` : "";
      const url = `${baseUrl}/Product?$top=${top}&$skip=${skip}&$select=Material,MaterialDescription,MaterialType,MaterialGroup,BaseUnit,GrossWeight,WeightUnit,NetWeight${filterStr}&$format=json`;

      const response = await fetch(url, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`OData request failed: HTTP ${response.status}`);
      }

      const data = await response.json() as { value?: ODataMaterial[]; "@odata.count"?: number; "@odata.nextLink"?: string };
      const materials = data.value ?? [];

      return {
        materials,
        totalCount: data["@odata.count"] ?? materials.length,
        nextLink: data["@odata.nextLink"],
        usedMock: false,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Fetch failed";
      console.error("[SAPODataClient] fetchMaterials error:", msg);
      const mockMaterials = sapMockService.getAllMaterials();
      return {
        materials: mockMaterials.map(m => ({
          Material: m.MARA.MATNR,
          MaterialDescription: m.MARA.MAKTX,
          MaterialType: m.MARA.MTART,
          MaterialGroup: m.MARA.MATKL,
          BaseUnit: m.MARA.MEINS,
          GrossWeight: m.MARA.BRGEW,
          WeightUnit: m.MARA.GEWEI,
          NetWeight: m.MARA.NTGEW,
        })),
        totalCount: mockMaterials.length,
        usedMock: true,
        error: msg,
      };
    }
  }

  /**
   * Wrapper that returns SAPMaterial[] (the nested MARA/MARC shape used by the
   * sync routes) instead of flat ODataMaterial[]. When the host is mock,
   * delegates to sapMockService.getAllMaterials() so the routes get the same
   * SAPMaterial objects the mock owns (preserving syncStatus, photonicTagId,
   * conflict tracking). When real, fetches OData and converts.
   *
   * Returns the raw mock SAPMaterial objects when isMockHost so routes can
   * mutate syncStatus / photonicTagId in place exactly as before. When real,
   * returns freshly converted objects (mutations are not persisted in SAP
   * unless updateMaterial() is called).
   */
  async fetchMaterialsAsSAPMaterial(options?: {
    materialTypes?: string[];
    plants?: string[];
    top?: number;
    skip?: number;
  }): Promise<{ materials: SAPMaterial[]; totalCount: number; usedMock: boolean; error?: string }> {
    const isMockHost = this.isMockHost();
    if (isMockHost) {
      const all = sapMockService.getAllMaterials();
      return { materials: all, totalCount: all.length, usedMock: true };
    }

    const odata = await this.fetchMaterials(options);
    if (odata.usedMock) {
      // Real fetch failed and fell back to mock — return mock SAPMaterials too
      const all = sapMockService.getAllMaterials();
      return { materials: all, totalCount: all.length, usedMock: true, error: odata.error };
    }
    const converted = odata.materials.map(odataToSAPMaterial);
    return { materials: converted, totalCount: odata.totalCount, usedMock: false };
  }

  /**
   * Write back a partial product update to SAP. PATCH for OData v4 (S/4HANA),
   * PUT for OData v2 (ECC), POST-with-method-override for Business One.
   *
   * The payload is the OData-shaped fields (Material is implicit via matnr).
   * For mock hosts, delegates to sapMockService.updateMaterial() with a
   * SAPMaterial-shaped partial converted from the OData payload.
   *
   * Returns success indicator + usedMock; never throws — errors are returned
   * in the result so callers can record them in integrationSyncLogs.
   */
  async updateMaterial(
    materialNumber: string,
    payload: Partial<Omit<ODataMaterial, "Material">>,
  ): Promise<{ success: boolean; usedMock: boolean; error?: string }> {
    if (this.isMockHost()) {
      const partialSap = odataToSAPMaterialPartial(payload);
      const updated = sapMockService.updateMaterial(materialNumber, partialSap);
      return { success: !!updated, usedMock: true, error: updated ? undefined : "Material not found in mock store" };
    }

    try {
      const headers = await this.getAuthHeaders();
      const baseUrl = this.getBaseUrl();
      const encoded = encodeURIComponent(materialNumber);

      let url: string;
      let method: "PATCH" | "PUT" | "POST";
      const reqHeaders: Record<string, string> = { ...(headers as Record<string, string>) };

      switch (this.config.systemType) {
        case "S4HANA":
          // OData v4: partial update via PATCH on the entity
          url = `${baseUrl}/Product('${encoded}')`;
          method = "PATCH";
          break;
        case "ECC":
          // OData v2: full replacement via PUT (most ECC services don't support PATCH)
          url = `${baseUrl}/MaterialSet('${encoded}')`;
          method = "PUT";
          break;
        case "Business_One":
          // SL: PATCH on Items('itemCode')
          url = `${baseUrl}/Items('${encoded}')`;
          method = "PATCH";
          break;
        default:
          url = `${baseUrl}/Product('${encoded}')`;
          method = "PATCH";
      }

      const response = await fetch(url, {
        method,
        headers: reqHeaders,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        return {
          success: false,
          usedMock: false,
          error: `OData ${method} failed: HTTP ${response.status}${text ? ` — ${text.slice(0, 200)}` : ""}`,
        };
      }
      return { success: true, usedMock: false };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "updateMaterial failed";
      console.error("[SAPODataClient] updateMaterial error:", msg);
      return { success: false, usedMock: false, error: msg };
    }
  }

  async fetchMaterial(materialNumber: string): Promise<ODataMaterial | null> {
    const isMockHost =
      !this.config.hostname ||
      this.config.hostname.includes("mock") ||
      this.config.hostname === "demo.sap.example.com";

    if (isMockHost) {
      const mat = sapMockService.getMaterial(materialNumber);
      if (!mat) return null;
      return {
        Material: mat.MARA.MATNR,
        MaterialDescription: mat.MARA.MAKTX,
        MaterialType: mat.MARA.MTART,
        MaterialGroup: mat.MARA.MATKL,
        BaseUnit: mat.MARA.MEINS,
        GrossWeight: mat.MARA.BRGEW,
        WeightUnit: mat.MARA.GEWEI,
        NetWeight: mat.MARA.NTGEW,
        Plant: mat.MARC.WERKS,
      };
    }

    try {
      const headers = await this.getAuthHeaders();
      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}/Product('${encodeURIComponent(materialNumber)}')?$format=json`;
      const response = await fetch(url, { method: "GET", headers, signal: AbortSignal.timeout(10000) });
      if (!response.ok) return null;
      return await response.json() as ODataMaterial;
    } catch {
      return null;
    }
  }
}

// ─── OData ↔ SAPMaterial converters ───────────────────────────────────────────

import type { SAPMaterialMARA, SAPMaterialMARC } from "./sap-mock-service";

/**
 * Convert a flat ODataMaterial (what the real OData service returns) into the
 * nested SAPMaterial shape (MARA / MARC / sync metadata) the routes work with.
 * Real OData does not expose every MARA / MARC field — fields not present
 * default to empty strings / zero. Sync metadata defaults to "pending" and
 * no PhotonicTag link.
 */
function odataToSAPMaterial(o: ODataMaterial): SAPMaterial {
  const mara: SAPMaterialMARA = {
    MATNR: o.Material,
    MAKTX: o.MaterialDescription,
    MTART: o.MaterialType,
    MATKL: o.MaterialGroup,
    MEINS: o.BaseUnit,
    BRGEW: o.GrossWeight,
    GEWEI: o.WeightUnit,
    NTGEW: o.NetWeight,
    ERSDA: o.CreationDate ?? "",
    ERNAM: o.CreatedByUser ?? "",
    LAEDA: o.LastChangeDate ?? "",
    AENAM: "",
    PSTAT: "",
    MSTAE: "",
    LABOR: "",
    EKWSL: "",
    NORMT: "",
    FERTH: "",
    ZEINR: "",
  };
  const marc: SAPMaterialMARC = {
    MATNR: o.Material,
    WERKS: o.Plant ?? "",
    PSTAT: "",
    LVORM: "",
    EKGRP: "",
    DISMM: "",
    DISPO: "",
    DISLS: "",
    BESKZ: "",
    SOBSL: "",
    MINBE: 0,
    EISBE: 0,
    BSTMI: 0,
    BSTMA: 0,
    BSTFE: 0,
    BSTRF: 0,
    MABST: 0,
    LOSFX: 0,
    AUSDT: "",
    NFMAT: "",
    SBDKZ: "",
    LAGPR: "",
    XCHPF: "",
    LGRAD: 0,
  };
  return { MARA: mara, MARC: marc, syncStatus: "pending" };
}

/**
 * Convert an OData-shaped partial payload (used by updateMaterial) into a
 * Partial<SAPMaterialMARA> the mock store's updateMaterial() accepts. The
 * mock store only persists MARA fields via this path; Plant/MARC updates
 * against the mock are silently dropped (real SAP write-back via OData
 * still PATCHes them to the live system).
 */
function odataToSAPMaterialPartial(p: Partial<Omit<ODataMaterial, "Material">>): Partial<SAPMaterialMARA> {
  const out: Partial<SAPMaterialMARA> = {};
  if (p.MaterialDescription !== undefined) out.MAKTX = p.MaterialDescription;
  if (p.MaterialType !== undefined) out.MTART = p.MaterialType;
  if (p.MaterialGroup !== undefined) out.MATKL = p.MaterialGroup;
  if (p.BaseUnit !== undefined) out.MEINS = p.BaseUnit;
  if (p.GrossWeight !== undefined) out.BRGEW = p.GrossWeight;
  if (p.WeightUnit !== undefined) out.GEWEI = p.WeightUnit;
  if (p.NetWeight !== undefined) out.NTGEW = p.NetWeight;
  if (p.LastChangeDate !== undefined) out.LAEDA = p.LastChangeDate;
  return out;
}

// ─── Field Mapping Engine ─────────────────────────────────────────────────────

/**
 * Flatten a SAPMaterial into a single lookup map of all accessible field names.
 * Supports both "MATNR" (MARA field) and "MARC.WERKS" (dotted sub-struct) forms.
 */
function flattenMaterial(material: SAPMaterial): Record<string, unknown> {
  const flat: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(material.MARA)) flat[k] = v;
  for (const [k, v] of Object.entries(material.MARC)) flat[`MARC.${k}`] = v;
  flat["syncStatus"] = material.syncStatus;
  flat["photonicTagId"] = material.photonicTagId ?? "";
  return flat;
}

function applyTransformation(value: unknown, transform?: string): unknown {
  const str = String(value ?? "");
  switch (transform) {
    case "trim":      return str.trim();
    case "uppercase": return str.toUpperCase();
    case "lowercase": return str.toLowerCase();
    case "number":    return isNaN(Number(str)) ? 0 : Number(str);
    case "boolean":   return ["true", "1", "yes"].includes(str.toLowerCase());
    case "date_iso":  {
      const d = new Date(str);
      return isNaN(d.getTime()) ? str : d.toISOString().split("T")[0];
    }
    default:          return value ?? "";
  }
}

/**
 * Apply user-configured FieldMappings to any flat key/value record (CSV row,
 * generic JSON, etc.) producing a partial PhotonicTag product record. The
 * baseDefaults parameter is merged first so caller-supplied defaults are
 * overridden by anything the mappings produce.
 *
 * This is the engine; SAP-specific applyFieldMappings() below wraps it with
 * the SAPMaterial-aware flattener and the mock baseline.
 */
export function applyFieldMappingsToRecord(
  source: Record<string, unknown>,
  mappings: FieldMapping[],
  baseDefaults: Record<string, unknown> = {},
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...baseDefaults };
  const validMappings = mappings.filter(m => m.sourceField.trim() && m.targetField.trim());
  for (const mapping of validMappings) {
    const raw = source[mapping.sourceField.trim()];
    if (raw !== undefined) {
      result[mapping.targetField.trim()] = applyTransformation(raw, mapping.transformation);
    }
  }
  return result;
}

/**
 * Apply user-configured FieldMappings to a SAPMaterial, producing a partial
 * PhotonicTag product record. Falls back to sapMockService hardcoded mapping
 * for any fields not covered by the user's mappings.
 */
export function applyFieldMappings(
  material: SAPMaterial,
  mappings: FieldMapping[],
): Record<string, unknown> {
  const flat = flattenMaterial(material);
  const base = sapMockService.mapToPhotonicTagProduct(material) as Record<string, unknown>;
  return applyFieldMappingsToRecord(flat, mappings, base);
}

// Scheduler registry — active sync jobs keyed by connectorId
const scheduledJobs = new Map<string, ReturnType<typeof setInterval>>();

export function scheduleConnectorSync(
  connectorId: string,
  config: SAPConfig,
  onSync: (connectorId: string, client: SAPODataClient) => Promise<void>
) {
  clearScheduledSync(connectorId);

  if (!config.scheduledSyncEnabled || !config.scheduledSyncIntervalMinutes) return;
  const intervalMs = config.scheduledSyncIntervalMinutes * 60 * 1000;

  console.log(`[SAPScheduler] Starting sync for connector ${connectorId} every ${config.scheduledSyncIntervalMinutes}min`);
  const client = new SAPODataClient(config);
  const job = setInterval(async () => {
    console.log(`[SAPScheduler] Running scheduled sync for ${connectorId}`);
    try {
      await onSync(connectorId, client);
    } catch (err) {
      console.error(`[SAPScheduler] Sync error for ${connectorId}:`, err);
    }
  }, intervalMs);

  scheduledJobs.set(connectorId, job);
}

export function clearScheduledSync(connectorId: string) {
  const existing = scheduledJobs.get(connectorId);
  if (existing) {
    clearInterval(existing);
    scheduledJobs.delete(connectorId);
    console.log(`[SAPScheduler] Cleared sync job for ${connectorId}`);
  }
}

export function getActiveSchedules(): string[] {
  return Array.from(scheduledJobs.keys());
}
