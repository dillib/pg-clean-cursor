import type { RequestHandler } from "express";
import { authProvider } from "../auth";
import { isMasterAdminEmail } from "@shared/models/auth";

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

export const requireMasterAdminOrTeam: RequestHandler = (req, res, next) => {
  if ((req.session as any)?.partnerId) return next();

  const user = authProvider.getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!isMasterAdminEmail(user.email)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return next();
};
