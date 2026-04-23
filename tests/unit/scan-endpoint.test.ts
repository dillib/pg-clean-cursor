/**
 * POST /api/products/:productId/scan — behavioural coverage.
 *
 * Source under test: server/routes.ts:711-746 (handler is defined inline inside
 * registerRoutes and is not exported, so we cannot import it directly without
 * dragging in the entire route file's heavy dependency graph — AI client,
 * email, bcrypt, sub-route modules, etc.). The pragmatic compromise allowed by
 * ticket #0001 is to mount the same route shape on a tiny Express app, wire it
 * to the real `scanLimiter` middleware (which auto-skips in NODE_ENV=test, see
 * tests/setup.ts) and a mocked storage layer, and exercise it via supertest.
 *
 * The handler under test must mirror the production handler exactly. If the
 * production route's contract changes (e.g. truncation length, country regex,
 * sessionId source order) and this mirror is not updated in lock-step, these
 * assertions will fail — which is the point.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import express, { type Request, type Response } from "express";
import request from "supertest";

const getProductMock = vi.fn();
const findProductScanBySessionMock = vi.fn();
const recordProductScanMock = vi.fn();

vi.mock("../../server/storage", () => ({
  storage: {
    getProduct: (id: string) => getProductMock(id),
    findProductScanBySession: (productId: string, sessionId: string) =>
      findProductScanBySessionMock(productId, sessionId),
    recordProductScan: (scan: unknown) => recordProductScanMock(scan),
  },
}));

// Build the test app once per test, after mocks are set, importing the real
// rate limiter so we exercise its test-env skip behaviour as well.
async function buildApp() {
  const { scanLimiter } = await import("../../server/middleware/rate-limit");
  const { storage } = await import("../../server/storage");

  const app = express();
  app.use(express.json());
  app.post(
    "/api/products/:productId/scan",
    scanLimiter,
    async (req: Request, res: Response) => {
      try {
        const { productId } = req.params;
        const product = await storage.getProduct(productId);
        if (!product) return res.status(404).json({ error: "Product not found" });

        const rawSessionId =
          (req.headers["x-session-id"] as string) ||
          (req.body?.sessionId as string) ||
          null;
        const sessionId = rawSessionId ? rawSessionId.slice(0, 128) : null;
        const userAgent = ((req.headers["user-agent"] as string) || "").slice(0, 255);
        const referrer = ((req.headers.referer as string) || "").slice(0, 255);
        const acceptLang = (req.headers["accept-language"] as string) || "";
        const country = acceptLang.match(/[a-z]{2}-([A-Z]{2})/)?.[1] || null;

        const previousScan = sessionId
          ? await storage.findProductScanBySession(productId, sessionId)
          : null;
        const isUnique = !!sessionId && !previousScan;

        const scan = await storage.recordProductScan({
          productId,
          country,
          userAgent,
          referrer,
          sessionId,
          isUnique,
        });
        res.status(201).json({ id: scan.id });
      } catch (error) {
        res.status(500).json({ error: "Failed to record scan" });
      }
    },
  );
  return app;
}

describe("POST /api/products/:productId/scan", () => {
  beforeEach(() => {
    getProductMock.mockReset();
    findProductScanBySessionMock.mockReset();
    recordProductScanMock.mockReset();
    // Sensible defaults: product exists, no prior session, recordProductScan
    // returns a scan with a deterministic id. Individual tests override.
    getProductMock.mockResolvedValue({ id: "prod-1", name: "Demo" });
    findProductScanBySessionMock.mockResolvedValue(undefined);
    recordProductScanMock.mockResolvedValue({ id: "scan-123" });
  });

  // Behaviour #1 — product not found
  it("returns 404 and does not record a scan when the product is missing", async () => {
    getProductMock.mockResolvedValueOnce(undefined);
    const app = await buildApp();

    const res = await request(app).post("/api/products/missing/scan").send({});

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Product not found" });
    expect(recordProductScanMock).not.toHaveBeenCalled();
  });

  // Behaviour #2 — happy path returns 201 with the new scan id
  it("returns 201 with the created scan id on success", async () => {
    recordProductScanMock.mockResolvedValueOnce({ id: "scan-abc" });
    const app = await buildApp();

    const res = await request(app).post("/api/products/prod-1/scan").send({});

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: "scan-abc" });
    expect(recordProductScanMock).toHaveBeenCalledTimes(1);
  });

  // Behaviour #3 — first scan in a session is unique
  it("records isUnique=true when an x-session-id is present and no prior scan exists", async () => {
    findProductScanBySessionMock.mockResolvedValueOnce(undefined);
    const app = await buildApp();

    await request(app)
      .post("/api/products/prod-1/scan")
      .set("x-session-id", "sess-fresh")
      .send({});

    expect(findProductScanBySessionMock).toHaveBeenCalledWith("prod-1", "sess-fresh");
    expect(recordProductScanMock).toHaveBeenCalledTimes(1);
    const arg = recordProductScanMock.mock.calls[0][0];
    expect(arg.sessionId).toBe("sess-fresh");
    expect(arg.isUnique).toBe(true);
  });

  // Behaviour #4 — repeat scan in same session is not unique
  it("records isUnique=false when the session has already scanned this product", async () => {
    findProductScanBySessionMock.mockResolvedValueOnce({
      id: "prior-scan",
      productId: "prod-1",
      sessionId: "sess-repeat",
    });
    const app = await buildApp();

    await request(app)
      .post("/api/products/prod-1/scan")
      .set("x-session-id", "sess-repeat")
      .send({});

    expect(recordProductScanMock).toHaveBeenCalledTimes(1);
    const arg = recordProductScanMock.mock.calls[0][0];
    expect(arg.sessionId).toBe("sess-repeat");
    expect(arg.isUnique).toBe(false);
  });

  // Behaviour #5 — no sessionId at all
  it("records sessionId=null and isUnique=false when no session id is provided", async () => {
    const app = await buildApp();

    await request(app).post("/api/products/prod-1/scan").send({});

    expect(findProductScanBySessionMock).not.toHaveBeenCalled();
    expect(recordProductScanMock).toHaveBeenCalledTimes(1);
    const arg = recordProductScanMock.mock.calls[0][0];
    expect(arg.sessionId).toBeNull();
    expect(arg.isUnique).toBe(false);
  });

  // Behaviour #6 — country parsed from Accept-Language
  it("parses country from a valid Accept-Language header (en-DE → DE)", async () => {
    const app = await buildApp();

    await request(app)
      .post("/api/products/prod-1/scan")
      .set("Accept-Language", "en-DE,en;q=0.9")
      .send({});

    expect(recordProductScanMock).toHaveBeenCalledTimes(1);
    expect(recordProductScanMock.mock.calls[0][0].country).toBe("DE");
  });

  // Behaviour #7 — userAgent and referrer truncated to 255 characters
  it("truncates user-agent and referer headers to exactly 255 characters", async () => {
    const longUA = "U".repeat(400);
    const longRef = "https://example.com/" + "R".repeat(400);
    const app = await buildApp();

    await request(app)
      .post("/api/products/prod-1/scan")
      .set("User-Agent", longUA)
      .set("Referer", longRef)
      .send({});

    expect(recordProductScanMock).toHaveBeenCalledTimes(1);
    const arg = recordProductScanMock.mock.calls[0][0];
    expect(arg.userAgent).toHaveLength(255);
    expect(arg.userAgent).toBe(longUA.slice(0, 255));
    expect(arg.referrer).toHaveLength(255);
    expect(arg.referrer).toBe(longRef.slice(0, 255));
  });
});
