import type { UserIdentity } from "convex/server";

function claimTruthy(value: unknown): boolean {
  return value === true || value === "true";
}

/** OIDC `emailVerified` or Clerk custom `email_verified` on the JWT. */
export function resolveIdentityEmailVerified(identity: UserIdentity): boolean {
  if (identity.emailVerified === true) {
    return true;
  }
  const claims = identity as UserIdentity & Record<string, unknown>;
  return claimTruthy(claims.email_verified);
}

/**
 * JWT may omit verification even when Clerk shows a verified primary email.
 * Trust Clerk's client-reported primary only when it matches the resolved account email.
 */
export function resolveAccountEmailVerified(opts: {
  identity: UserIdentity;
  resolvedEmail: string;
  primaryEmail?: string;
  primaryEmailVerified?: boolean;
}): boolean {
  if (resolveIdentityEmailVerified(opts.identity)) {
    return true;
  }
  if (opts.primaryEmailVerified !== true) {
    return false;
  }
  const primary = opts.primaryEmail?.trim().toLowerCase() ?? "";
  const resolved = opts.resolvedEmail.trim().toLowerCase();
  return primary.length > 0 && primary === resolved;
}
