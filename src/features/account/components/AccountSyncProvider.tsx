"use client";

import { useAuth } from "@clerk/nextjs";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useConvexAuth, useMutation } from "convex/react";

import { clearStaleTabResultCache } from "@/lib/staleTabResultCache";
import { api } from "convex/_generated/api";

import { ACCOUNT_MESSAGES } from "../constants/messages";
import type { AccountSyncState, EnsureCurrentUserPhase } from "../types";

type SyncPhase = "idle" | "ready" | "error";

const AccountSyncContext = createContext<AccountSyncState | null>(null);

function derivePhase(
  authLoading: boolean,
  isAuthenticated: boolean,
  syncPhase: SyncPhase,
): EnsureCurrentUserPhase {
  if (authLoading) {
    return "auth-loading";
  }
  if (!isAuthenticated) {
    return "anonymous";
  }
  if (syncPhase === "error") {
    return "error";
  }
  if (syncPhase !== "ready") {
    return "syncing";
  }
  return "ready";
}

function useAccountSyncState(): AccountSyncState {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { sessionId, isLoaded: authSessionLoaded } = useAuth();
  const ensureCurrentUser = useMutation(api.users.ensureCurrentUser);
  const [syncPhase, setSyncPhase] = useState<SyncPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const syncedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      syncedSessionRef.current = null;
      clearStaleTabResultCache();
      setSyncPhase("idle");
      setErrorMessage(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !authSessionLoaded || !sessionId) {
      return;
    }
    if (syncedSessionRef.current === sessionId) {
      return;
    }

    let cancelled = false;
    setSyncPhase("idle");
    setErrorMessage(null);

    void ensureCurrentUser({})
      .then(() => {
        if (!cancelled) {
          syncedSessionRef.current = sessionId;
          setSyncPhase("ready");
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setSyncPhase("error");
          setErrorMessage(
            err instanceof Error
              ? err.message
              : ACCOUNT_MESSAGES.syncFailedFallback,
          );
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
    ensureCurrentUser,
  ]);

  const phase = derivePhase(authLoading, isAuthenticated, syncPhase);

  return useMemo(
    () => ({
      phase,
      errorMessage: phase === "error" ? errorMessage : null,
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
