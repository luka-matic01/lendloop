import type { Doc } from "../_generated/dataModel";

export const GENERIC_USER_LABEL = "Neighbor";

type UserLike = Pick<Doc<"users">, "name" | "email"> | null | undefined;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(raw: string | undefined): string {
  return raw?.trim().toLowerCase() ?? "";
}

/** JWT email, else what we already stored (never client-supplied). */
export function resolveAccountEmail(opts: {
  jwtEmail?: string;
  storedEmail?: string;
}): string {
  for (const raw of [opts.jwtEmail, opts.storedEmail]) {
    const email = normalizeEmail(raw);
    if (email && EMAIL_PATTERN.test(email)) {
      return email;
    }
  }
  return "";
}

/** Persist only a real Clerk display name: never email or the generic fallback. */
export function clerkDisplayName(raw: string | undefined): string {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed || trimmed === GENERIC_USER_LABEL) {
    return "";
  }
  return trimmed;
}

/** Label for signed-in neighbors: Clerk name, else email, else fallback. */
export function userDisplayName(user: UserLike): string {
  if (!user) {
    return GENERIC_USER_LABEL;
  }

  const name = clerkDisplayName(user.name);
  if (name) {
    return name;
  }

  const email = normalizeEmail(user.email);
  if (email) {
    return email;
  }

  return GENERIC_USER_LABEL;
}
