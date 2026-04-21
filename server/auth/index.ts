/**
 * Active auth provider — WorkOS AuthKit (SSO).
 *
 * Future providers (Okta, Azure AD, etc.) can be added by implementing
 * AuthProvider and selecting via AUTH_PROVIDER env var.
 */
import type { AuthProvider } from "./types";
import { workosProvider } from "./providers/workos";
import { logger } from "../logger";

export type { AuthProvider, AuthenticatedUser } from "./types";

function resolveProvider(): AuthProvider {
  const provider = (process.env.AUTH_PROVIDER ?? "workos").toLowerCase();
  if (provider !== "workos") {
    logger.warn({ provider }, "[Auth] Unknown AUTH_PROVIDER, defaulting to workos");
  }
  return workosProvider;
}

export const authProvider: AuthProvider = resolveProvider();

export const { isAuthenticated } = authProvider;
export const getCurrentUser = (req: import("express").Request) =>
  authProvider.getCurrentUser(req);
