/**
 * Active auth provider — controlled by AUTH_PROVIDER env var.
 * Default: replit. Next: workos. Future: okta, azure-ad.
 *
 * Swap the provider here without touching any route code.
 */
import type { AuthProvider } from "./types";
import { replitProvider } from "./providers/replit";
import { workosProvider } from "./providers/workos";

export type { AuthProvider, AuthenticatedUser } from "./types";

function resolveProvider(): AuthProvider {
  const provider = (process.env.AUTH_PROVIDER ?? "replit").toLowerCase();
  switch (provider) {
    case "workos":  return workosProvider;
    case "replit":  return replitProvider;
    default:
      console.warn(`[Auth] Unknown AUTH_PROVIDER="${provider}", falling back to replit`);
      return replitProvider;
  }
}

export const authProvider: AuthProvider = resolveProvider();

// Re-export the two most-used pieces directly for clean imports
export const { isAuthenticated } = authProvider;
export const getCurrentUser = (req: import("express").Request) =>
  authProvider.getCurrentUser(req);
