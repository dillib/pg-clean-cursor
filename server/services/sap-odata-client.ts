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
 * Apply user-configured FieldMappings to a SAPMaterial, producing a partial
 * PhotonicTag product record. Falls back to sapMockService hardcoded mapping
 * for any fields not covered by the user's mappings.
 */
export function applyFieldMappings(
  material: SAPMaterial,
  mappings: FieldMapping[],
): Record<string, unknown> {
  const flat = flattenMaterial(material);

  // Start with the hardcoded baseline so un-mapped fields are still populated
  const base = sapMockService.mapToPhotonicTagProduct(material) as Record<string, unknown>;
  const result: Record<string, unknown> = { ...base };

  const validMappings = mappings.filter(m => m.sourceField.trim() && m.targetField.trim());
  for (const mapping of validMappings) {
    const raw = flat[mapping.sourceField.trim()];
    if (raw !== undefined) {
      result[mapping.targetField.trim()] = applyTransformation(raw, mapping.transformation);
    }
  }

  return result;
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
