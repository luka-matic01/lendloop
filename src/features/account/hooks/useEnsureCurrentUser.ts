"use client";

import { useAccountSyncContext } from "../components/AccountSyncProvider";
import type { AccountSyncState } from "../types";

export type { AccountSyncState, EnsureCurrentUserPhase } from "../types";

/**
 * Clerk → Convex user sync for the current session.
 * Must run under {@link AccountSyncProvider} (wired in {@link ConvexClerkProviders}).
 */
export function useEnsureCurrentUser(): AccountSyncState {
  const state = useAccountSyncContext();
  if (state === null) {
    throw new Error(
      "useEnsureCurrentUser must be used within AccountSyncProvider (ConvexClerkProviders).",
    );
  }
  return state;
}
