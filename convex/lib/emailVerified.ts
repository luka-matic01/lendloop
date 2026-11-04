import type { UserIdentity } from "convex/server";

function claimTruthy(value: unknown): boolean {
  return value === true || value === "true";
}

/** OIDC `emailVerified` or Clerk session / template claims on the JWT. */
export function resolveIdentityEmailVerified(identity: UserIdentity): boolean {
  if (identity.emailVerified === true) {
    return true;
  }
  const claims = identity as UserIdentity & Record<string, unknown>;
  return (
    claimTruthy(claims.email_verified) ||
    claimTruthy(claims.primary_email_address_verified)
  );
}
