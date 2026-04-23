/**
 * SAPODataClient — coverage for the new public surface added in the
 * "cut SAP mock out of the production sync path" change.
 *
 * Source under test: server/services/sap-odata-client.ts
 *   - isMockHost()                       (lines ~56-66)
 *   - fetchMaterialsAsSAPMaterial(opts?) (lines ~316-336)
 *   - updateMaterial(matnr, payload)     (lines ~349-410)
 *
 * fetch is mocked via vi.stubGlobal — restored in afterEach. sapMockService is
 * imported real (in-memory singleton, deterministic seed of 100 materials).
 *
 * Mapping to the ticket-#0002 behaviour table is noted on each `it(...)`.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { SAPConfig } from "@shared/schema";
import { SAPODataClient } from "../../server/services/sap-odata-client";
import { sapMockService } from "../../server/services/sap-mock-service";

function makeConfig(overrides: Partial<SAPConfig> = {}): SAPConfig {
  return {
    systemType: "S4HANA",
    hostname: "s4hana.acme.com",
    port: 443,
    client: "100",
    systemId: "S4H",
    apiType: "OData",
    oauthEnabled: false,
    syncFrequency: "manual",
    authMethod: "basic",
    username: "user",
    password: "pw",
    ...overrides,
  };
}

describe("SAPODataClient", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ─── isMockHost() ─────────────────────────────────────────────────────────
  describe("isMockHost()", () => {
    // Behaviour #1
    it("returns true when hostname is empty", () => {
      const client = new SAPODataClient(makeConfig({ hostname: "" }));
      expect(client.isMockHost()).toBe(true);
    });

    // Behaviour #2
    it("returns true when hostname contains 'mock'", () => {
      const client = new SAPODataClient(makeConfig({ hostname: "mock.sap.local" }));
      expect(client.isMockHost()).toBe(true);
    });

    // Behaviour #3
    it("returns true when hostname is the demo sentinel", () => {
      const client = new SAPODataClient(
        makeConfig({ hostname: "demo.sap.example.com" }),
      );
      expect(client.isMockHost()).toBe(true);
    });

    // Behaviour #4
    it("returns false for a normal real hostname", () => {
      const client = new SAPODataClient(makeConfig({ hostname: "s4hana.acme.com" }));
      expect(client.isMockHost()).toBe(false);
    });
  });

  // ─── fetchMaterialsAsSAPMaterial() ────────────────────────────────────────
  describe("fetchMaterialsAsSAPMaterial()", () => {
    // Behaviour #5
    it("returns the mock store contents and skips fetch when host is mock", async () => {
      const client = new SAPODataClient(makeConfig({ hostname: "mock.sap.local" }));

      const result = await client.fetchMaterialsAsSAPMaterial();

      const mockAll = sapMockService.getAllMaterials();
      expect(result.usedMock).toBe(true);
      expect(result.materials.length).toBe(mockAll.length);
      expect(result.totalCount).toBe(mockAll.length);
      expect(result.error).toBeUndefined();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    // Behaviour #6
    it("converts a real OData 200 response into nested SAPMaterial shape", async () => {
      const client = new SAPODataClient(makeConfig({ hostname: "s4hana.acme.com" }));

      const odataPayload = {
        value: [
          {
            Material: "MAT001",
            MaterialDescription: "Real Widget",
            MaterialType: "FERT",
            MaterialGroup: "001",
            BaseUnit: "EA",
            GrossWeight: 1.5,
            WeightUnit: "KG",
            NetWeight: 1.2,
            Plant: "1000",
          },
          {
            Material: "MAT002",
            MaterialDescription: "Real Widget 2",
            MaterialType: "HALB",
            MaterialGroup: "002",
            BaseUnit: "EA",
            GrossWeight: 0.5,
            WeightUnit: "KG",
            NetWeight: 0.4,
            Plant: "2000",
          },
        ],
        "@odata.count": 2,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => odataPayload,
      } as Response);

      const result = await client.fetchMaterialsAsSAPMaterial();

      expect(result.usedMock).toBe(false);
      expect(result.materials.length).toBe(2);
      expect(result.totalCount).toBe(2);
      expect(result.materials[0].MARA.MATNR).toBe("MAT001");
      expect(result.materials[0].MARA.MAKTX).toBe("Real Widget");
      expect(result.materials[0].MARC.WERKS).toBe("1000");
      expect(result.materials[1].MARA.MATNR).toBe("MAT002");
      expect(result.materials[1].MARC.WERKS).toBe("2000");
      expect(result.materials[0].syncStatus).toBe("pending");
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Behaviour #7
    it("falls back to mock store with error populated when OData fetch throws", async () => {
      const client = new SAPODataClient(makeConfig({ hostname: "s4hana.acme.com" }));

      mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED 10.0.0.1:443"));

      const result = await client.fetchMaterialsAsSAPMaterial();

      const mockAll = sapMockService.getAllMaterials();
      expect(result.usedMock).toBe(true);
      expect(result.materials.length).toBe(mockAll.length);
      expect(result.totalCount).toBe(mockAll.length);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("ECONNREFUSED");
    });
  });

  // ─── updateMaterial() ─────────────────────────────────────────────────────
  describe("updateMaterial()", () => {
    // Behaviour #8
    it("delegates to sapMockService and updates MAKTX when host is mock", async () => {
      const client = new SAPODataClient(makeConfig({ hostname: "mock.sap.local" }));
      const seedMatnr = sapMockService.getAllMaterials()[0].MARA.MATNR;
      const newDescription = `updated-by-test-${Date.now()}`;

      const result = await client.updateMaterial(seedMatnr, {
        MaterialDescription: newDescription,
      });

      expect(result).toEqual({ success: true, usedMock: true });
      expect(mockFetch).not.toHaveBeenCalled();
      expect(sapMockService.getMaterial(seedMatnr)?.MARA.MAKTX).toBe(newDescription);
    });

    // Behaviour #9
    it("returns success=false with the not-found error when matnr is unknown in mock", async () => {
      const client = new SAPODataClient(makeConfig({ hostname: "mock.sap.local" }));

      const result = await client.updateMaterial("DOES-NOT-EXIST-XYZ", {
        MaterialDescription: "irrelevant",
      });

      expect(result).toEqual({
        success: false,
        usedMock: true,
        error: "Material not found in mock store",
      });
      expect(mockFetch).not.toHaveBeenCalled();
    });

    // Behaviour #10
    it("issues PATCH against /Product('matnr') for S4HANA on a real host", async () => {
      const client = new SAPODataClient(
        makeConfig({ systemType: "S4HANA", hostname: "s4hana.acme.com" }),
      );

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        text: async () => "",
      } as Response);

      const payload = { MaterialDescription: "Patched Description" };
      const result = await client.updateMaterial("MAT123", payload);

      expect(result).toEqual({ success: true, usedMock: false });
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, init] = mockFetch.mock.calls[0];
      expect(typeof url).toBe("string");
      expect(url).toContain("/Product('MAT123')");
      expect((init as RequestInit).method).toBe("PATCH");
      expect((init as RequestInit).body).toBe(JSON.stringify(payload));
    });

    // Behaviour #11
    it("issues PUT against /MaterialSet('matnr') for ECC on a real host", async () => {
      const client = new SAPODataClient(
        makeConfig({ systemType: "ECC", hostname: "ecc.acme.com" }),
      );

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => "",
      } as Response);

      const payload = { MaterialDescription: "Replaced Description" };
      const result = await client.updateMaterial("MAT123", payload);

      expect(result).toEqual({ success: true, usedMock: false });
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toContain("/MaterialSet('MAT123')");
      expect((init as RequestInit).method).toBe("PUT");
      expect((init as RequestInit).body).toBe(JSON.stringify(payload));
    });

    // Behaviour #12
    it("returns a structured error string when OData responds non-OK", async () => {
      const client = new SAPODataClient(
        makeConfig({ systemType: "S4HANA", hostname: "s4hana.acme.com" }),
      );

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => "Bad Request: invalid payload",
      } as Response);

      const result = await client.updateMaterial("MAT999", {
        MaterialDescription: "x",
      });

      expect(result.success).toBe(false);
      expect(result.usedMock).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toMatch(/^OData PATCH failed: HTTP 400/);
      expect(result.error).toContain("Bad Request");
    });

    // Behaviour #13
    it("never throws and returns the error message when fetch rejects", async () => {
      const client = new SAPODataClient(
        makeConfig({ systemType: "S4HANA", hostname: "s4hana.acme.com" }),
      );

      mockFetch.mockRejectedValueOnce(new Error("network down"));

      const result = await client.updateMaterial("MAT123", {
        MaterialDescription: "x",
      });

      expect(result.success).toBe(false);
      expect(result.usedMock).toBe(false);
      expect(result.error).toBe("network down");
    });
  });
});
