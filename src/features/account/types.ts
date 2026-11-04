export type EnsureCurrentUserPhase =
  | "auth-loading"
  | "anonymous"
  | "syncing"
  | "error"
  | "ready";

export type AccountSyncState = {
  phase: EnsureCurrentUserPhase;
  errorMessage: string | null;
};
