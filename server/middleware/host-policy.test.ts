import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { hostPolicyMiddleware } from "./host-policy";

type MockResult = { statusCode: number | null; body: unknown; nextCalled: boolean };

function run(method: string, path: string): MockResult {
  const middleware = hostPolicyMiddleware();
  const result: MockResult = { statusCode: null, body: null, nextCalled: false };
  const req = { method, path, hostname: "localhost" } as any;
  const res = {
    status(code: number) {
      result.statusCode = code;
      return this;
    },
    send(payload: unknown) {
      result.body = payload;
      return this;
    },
  } as any;
  const next = () => {
    result.nextCalled = true;
  };
  middleware(req, res, next);
  return result;
}

describe("hostPolicyMiddleware", () => {
  const originalHostMode = process.env.HOST_MODE;

  beforeEach(() => {
    delete process.env.HOST_MODE;
  });

  afterEach(() => {
    if (originalHostMode === undefined) {
      delete process.env.HOST_MODE;
    } else {
      process.env.HOST_MODE = originalHostMode;
    }
  });

  describe("mode=customer", () => {
    beforeEach(() => {
      process.env.HOST_MODE = "customer";
    });

    it("rejects GET /api/leads with 404", () => {
      const r = run("GET", "/api/leads");
      expect(r.statusCode).toBe(404);
      expect(r.nextCalled).toBe(false);
    });

    it("rejects GET /admin with 404", () => {
      const r = run("GET", "/admin");
      expect(r.statusCode).toBe(404);
      expect(r.nextCalled).toBe(false);
    });

    it("rejects nested ops API paths like /api/partners/123", () => {
      const r = run("GET", "/api/partners/123");
      expect(r.statusCode).toBe(404);
    });

    it("rejects /api/internal/foo", () => {
      const r = run("POST", "/api/internal/foo");
      expect(r.statusCode).toBe(404);
    });

    it("rejects /api/export/leads.csv", () => {
      const r = run("GET", "/api/export/leads.csv");
      expect(r.statusCode).toBe(404);
    });

    it("rejects /api/admin/seed-demo-data", () => {
      const r = run("POST", "/api/admin/seed-demo-data");
      expect(r.statusCode).toBe(404);
    });

    it("allows GET /api/products", () => {
      const r = run("GET", "/api/products");
      expect(r.nextCalled).toBe(true);
      expect(r.statusCode).toBe(null);
    });

    it("allows GET /", () => {
      const r = run("GET", "/");
      expect(r.nextCalled).toBe(true);
    });

    it("allows /healthz", () => {
      const r = run("GET", "/healthz");
      expect(r.nextCalled).toBe(true);
    });

    it("allows /api/webhooks/stripe (always-allow prefix)", () => {
      const r = run("POST", "/api/webhooks/stripe");
      expect(r.nextCalled).toBe(true);
    });
  });

  describe("mode=ops", () => {
    beforeEach(() => {
      process.env.HOST_MODE = "ops";
    });

    it("allows GET /api/leads", () => {
      const r = run("GET", "/api/leads");
      expect(r.nextCalled).toBe(true);
    });

    it("allows GET /admin", () => {
      const r = run("GET", "/admin");
      expect(r.nextCalled).toBe(true);
    });

    it("rejects GET /products (tenant-only)", () => {
      const r = run("GET", "/products");
      expect(r.statusCode).toBe(404);
      expect(r.nextCalled).toBe(false);
    });

    it("rejects /crm (tenant-only)", () => {
      const r = run("GET", "/crm");
      expect(r.statusCode).toBe(404);
    });

    it("allows /api/products (not in TENANT_ONLY_PATH_PREFIXES)", () => {
      const r = run("GET", "/api/products");
      expect(r.nextCalled).toBe(true);
    });

    it("allows /healthz", () => {
      const r = run("GET", "/healthz");
      expect(r.nextCalled).toBe(true);
    });
  });

  describe("mode=any (default)", () => {
    it("allows /api/leads when HOST_MODE unset", () => {
      const r = run("GET", "/api/leads");
      expect(r.nextCalled).toBe(true);
    });

    it("allows /admin when HOST_MODE unset", () => {
      const r = run("GET", "/admin");
      expect(r.nextCalled).toBe(true);
    });

    it("allows /products when HOST_MODE unset", () => {
      const r = run("GET", "/products");
      expect(r.nextCalled).toBe(true);
    });

    it("allows /api/products when HOST_MODE=any", () => {
      process.env.HOST_MODE = "any";
      const r = run("GET", "/api/products");
      expect(r.nextCalled).toBe(true);
    });
  });
});
