import { test, expect } from "@playwright/test";

/**
 * Critical path: public scan endpoint security + rate limiting.
 * These tests run against the live dev server.
 */

const FAKE_PRODUCT_ID = "00000000-0000-0000-0000-000000000001";

test.describe("Public scan endpoint", () => {
  test("returns 404 for unknown product", async ({ request }) => {
    const res = await request.post(`/api/products/${FAKE_PRODUCT_ID}/scan`, {
      data: { sessionId: "test-session-abc" },
    });
    expect(res.status()).toBe(404);
  });

  test("does not accept isUnique from client body", async ({ request }) => {
    // Even if the client sends isUnique:false, the server computes it.
    // We can't assert the DB value in E2E, but we verify the endpoint doesn't error.
    const res = await request.post(`/api/products/${FAKE_PRODUCT_ID}/scan`, {
      data: { sessionId: "session-x", isUnique: false },
    });
    // 404 for unknown product — not 400/500 from the isUnique field being rejected
    expect([404, 201]).toContain(res.status());
  });
});

test.describe("Seed demo data endpoint security", () => {
  test("POST /api/admin/seed-demo-data requires authentication", async ({ request }) => {
    const res = await request.post("/api/admin/seed-demo-data");
    expect(res.status()).toBe(401);
  });
});

test.describe("Trace injection prevention", () => {
  test("POST /api/products/:id/trace requires authentication", async ({ request }) => {
    const res = await request.post(`/api/products/${FAKE_PRODUCT_ID}/trace`, {
      data: { eventType: "shipped", actor: "attacker" },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe("Public DPP scan page", () => {
  test("renders without crashing for unknown product", async ({ page }) => {
    await page.goto(`/product/${FAKE_PRODUCT_ID}`);
    // Should show a not-found state, not a JS error
    await expect(page.locator("body")).not.toContainText("TypeError");
    await expect(page.locator("body")).not.toContainText("Cannot read");
  });
});
