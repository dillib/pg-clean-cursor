import { test, expect } from "@playwright/test";

test.describe("Export endpoints require authentication", () => {
  test("GET /api/export/presentation.pptx returns 401 when unauthenticated", async ({ request }) => {
    const response = await request.get("/api/export/presentation.pptx");
    expect(response.status()).toBe(401);
  });

  test("POST /api/export/proposal.docx returns 401 when unauthenticated", async ({ request }) => {
    const response = await request.post("/api/export/proposal.docx", {
      data: { customerName: "Test", language: "en" },
    });
    expect(response.status()).toBe(401);
  });
});
