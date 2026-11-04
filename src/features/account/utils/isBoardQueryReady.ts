import type { EnsureCurrentUserPhase } from "../types";

/** Convex board queries need auth; returning users can load while ensureCurrentUser runs. */
export function isBoardQueryReady(phase: EnsureCurrentUserPhase): boolean {
  return phase === "ready" || phase === "syncing";
}
