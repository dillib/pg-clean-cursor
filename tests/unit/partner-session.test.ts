import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request } from "express";
import { getPartnerSessionState } from "../../server/middleware/partner-session";

const { getPartnerMock } = vi.hoisted(() => ({ getPartnerMock: vi.fn() }));

vi.mock("../../server/storage", () => ({
  storage: {
    getPartner: getPartnerMock,
  },
}));

describe("getPartnerSessionState", () => {
  beforeEach(() => {
    getPartnerMock.mockReset();
  });

  it("returns none when no partnerId on session", async () => {
    const req = { session: {} } as unknown as Request;
    await expect(getPartnerSessionState(req)).resolves.toBe("none");
    expect(getPartnerMock).not.toHaveBeenCalled();
  });

  it("returns valid when partner exists and is active", async () => {
    const req = { session: { partnerId: "p1" } } as unknown as Request;
    getPartnerMock.mockResolvedValue({ id: "p1", status: "active" });
    await expect(getPartnerSessionState(req)).resolves.toBe("valid");
    expect(getPartnerMock).toHaveBeenCalledWith("p1");
  });

  it("returns invalid when partner missing", async () => {
    const req = { session: { partnerId: "gone" } } as unknown as Request;
    getPartnerMock.mockResolvedValue(undefined);
    await expect(getPartnerSessionState(req)).resolves.toBe("invalid");
  });

  it("returns invalid when partner inactive", async () => {
    const req = { session: { partnerId: "p2" } } as unknown as Request;
    getPartnerMock.mockResolvedValue({ id: "p2", status: "inactive" });
    await expect(getPartnerSessionState(req)).resolves.toBe("invalid");
  });
});
