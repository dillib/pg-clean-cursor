import type { RequestHandler } from "express";
import { authProvider } from "../auth";
import { isMasterAdminEmail } from "@shared/models/auth";
import { getPartnerSessionState } from "./partner-session";

export const requireMasterAdmin: RequestHandler = (req, res, next) => {
  const user = authProvider.getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!isMasterAdminEmail(user.email)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return next();
};

export const requireMasterAdminOrTeam: RequestHandler = async (req, res, next) => {
  try {
    const partnerState = await getPartnerSessionState(req);
    if (partnerState === "valid") return next();
    if (partnerState === "invalid") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const user = authProvider.getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!isMasterAdminEmail(user.email)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  } catch (err) {
    next(err);
  }
};
