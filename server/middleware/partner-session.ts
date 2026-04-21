import type { Request } from "express";
import { storage } from "../storage";

export type PartnerSessionState = "none" | "valid" | "invalid";

/**
 * Validates `req.session.partnerId` against the partners table.
 * Stale or forged IDs must not grant access — callers treat `invalid` as auth failure.
 */
export async function getPartnerSessionState(req: Request): Promise<PartnerSessionState> {
  const partnerId = (req.session as { partnerId?: string } | undefined)?.partnerId;
  if (!partnerId) return "none";
  const partner = await storage.getPartner(partnerId);
  if (!partner || partner.status !== "active") return "invalid";
  return "valid";
}
