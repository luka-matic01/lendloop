"use client";

import { useAuth } from "@clerk/nextjs";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useConvexAuth, useMutation } from "convex/react";

import { clearStaleTabResultCache } from "@/lib/staleTabResultCache";
import { api } from "convex/_generated/api";

import { ACCOUNT_MESSAGES } from "../constants/messages";
import type { AccountSyncState, EnsureCurrentUserPhase } from "../types";

type SessionSyncError = {
  sessionId: string;
  message: string;
};

const AccountSyncContext = createContext<AccountSyncState | null>(null);

function derivePhase(
  authLoading: boolean,
  isAuthenticated: boolean,
  sessionId: string | null | undefined,
  syncedSessionId: string | null,
  syncError: SessionSyncError | null,
): EnsureCurrentUserPhase {
  if (authLoading) {
    return "auth-loading";
  }
  if (!isAuthenticated) {
    return "anonymous";
  }
  if (sessionId && syncError?.sessionId === sessionId) {
    return "error";
  }
  if (sessionId && syncedSessionId === sessionId) {
    return "ready";
  }
  return "syncing";
}

function useAccountSyncState(): AccountSyncState {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { sessionId, isLoaded: authSessionLoaded } = useAuth();
  const ensureCurrentUser = useMutation(api.users.ensureCurrentUser);
  const [syncedSessionId, setSyncedSessionId] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<SessionSyncError | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      clearStaleTabResultCache();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !authSessionLoaded || !sessionId) {
      return;
    }
    if (syncedSessionId === sessionId) {
      return;
    }

    let cancelled = false;

    void ensureCurrentUser({})
      .then(() => {
        if (!cancelled) {
          setSyncedSessionId(sessionId);
          setSyncError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setSyncError({
            sessionId,
            message:
              err instanceof Error
                ? err.message
                : ACCOUNT_MESSAGES.syncFailedFallback,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    isAuthenticated,
    authSessionLoaded,
    sessionId,
    syncedSessionId,
    ensureCurrentUser,
  ]);

  const phase = derivePhase(
    authLoading,
    isAuthenticated,
    sessionId,
    syncedSessionId,
    syncError,
  );

  const errorMessage =
    phase === "error" && sessionId && syncError?.sessionId === sessionId
      ? syncError.message
      : null;

  return useMemo(
    () => ({
      phase,
      errorMessage,
    }),
    [phase, errorMessage],
  );
}

export function AccountSyncProvider({ children }: { children: ReactNode }) {
  const value = useAccountSyncState();
  return (
    <AccountSyncContext.Provider value={value}>
      {children}
    </AccountSyncContext.Provider>
  );
}

export function useAccountSyncContext(): AccountSyncState | null {
  return useContext(AccountSyncContext);
}
