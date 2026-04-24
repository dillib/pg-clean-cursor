import { test, expect } from "@playwright/test";

/**
 * E2E coverage for the canonical consumer scan page (public-scan-v2.tsx
 * mounted at /product/:id). Covers the 7 behaviours required by ticket
 * #0003 — render, demo fixture, compliance deadline banner, trace
 * timeline, demo banner, register/share suppression, and the 404 state.
 *
 * Companion to public-scan.spec.ts (which covers the API surface).
 */

const UNKNOWN_PRODUCT_UUID = "00000000-0000-0000-0000-000000000001";

test.describe("Public DPP scan page (/product/:id)", () => {
  test("1. GET /product/demo returns HTTP 200", async ({ page }) => {
    const response = await page.goto("/product/demo");
    expect(response, "navigation response should not be null").not.toBeNull();
    expect(response!.status()).toBe(200);
  });

  test("2. demo product name is visible", async ({ page }) => {
    await page.goto("/product/demo");
    const productName = page.getByTestId("text-public-product-name-v2");
    await expect(productName).toBeVisible();
    await expect(productName).toContainText("EcoPower Li-Ion Battery Pack 5000mAh");
  });

  test("3. demo manufacturer name is visible", async ({ page }) => {
    await page.goto("/product/demo");
    // Manufacturer string appears in the hero eyebrow + the product-identity
    // grid; both should resolve. Use first() so the assertion is unambiguous.
    const manufacturer = page.getByText("GreenCell Technologies GmbH").first();
    await expect(manufacturer).toBeVisible();
  });

  test("4. compliance deadline banner shows EU Battery Reg date", async ({ page }) => {
    await page.goto("/product/demo");
    const banner = page.getByTestId("banner-compliance-deadline");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("February 18, 2027");
    await expect(banner).toContainText("EU compliance deadline");
  });

  test("5. trace timeline renders at least one event", async ({ page }) => {
    await page.goto("/product/demo");
    const traceEvents = page.locator('[data-testid^="public-trace-event-v2-"]');
    // Demo fixture ships 4 events; assert >= 1 to keep the test resilient
    // to fixture changes that don't drop the timeline entirely.
    await expect(traceEvents.first()).toBeVisible();
    expect(await traceEvents.count()).toBeGreaterThanOrEqual(1);
  });

  test("6. yellow demo banner is visible at the top", async ({ page }) => {
    await page.goto("/product/demo");
    const demoBanner = page.getByText("This is an example passport", { exact: false });
    await expect(demoBanner).toBeVisible();
  });

  test("7. register/share section is hidden in demo mode", async ({ page }) => {
    await page.goto("/product/demo");
    // Wait for the page to be hydrated by anchoring on a known-rendered
    // element before asserting the absence of the register/share block —
    // otherwise the count check could pass simply because nothing has
    // mounted yet.
    await expect(page.getByTestId("text-public-product-name-v2")).toBeVisible();
    await expect(page.getByTestId("section-register-share-v2")).toHaveCount(0);
  });

  test("8. unknown product UUID renders the 404 passport message", async ({ page }) => {
    await page.goto(`/product/${UNKNOWN_PRODUCT_UUID}`);
    await expect(
      page.getByText("This passport doesn't exist", { exact: false }),
    ).toBeVisible();
  });
});
