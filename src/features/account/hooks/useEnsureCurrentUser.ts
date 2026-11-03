"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useConvexAuth, useMutation } from "convex/react";

import { ACCOUNT_MESSAGES } from "../constants/messages";
import { api } from "convex/_generated/api";

type SyncPhase = "idle" | "ready" | "error";

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

export function useEnsureCurrentUser(): AccountSyncState {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { sessionId } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const ensureCurrentUser = useMutation(api.users.ensureCurrentUser);
  const [syncPhase, setSyncPhase] = useState<SyncPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !userLoaded) {
      return;
    }

    let cancelled = false;
    setSyncPhase("idle");
    setErrorMessage(null);

    const primaryEmail = user?.primaryEmailAddress?.emailAddress;

    void ensureCurrentUser({
      ...(primaryEmail ? { primaryEmail } : {}),
    })
      .then(() => {
        if (!cancelled) {
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
    userLoaded,
    sessionId,
    user?.primaryEmailAddress?.emailAddress,
    ensureCurrentUser,
  ]);

  if (authLoading) {
    return { phase: "auth-loading", errorMessage: null };
  }

  if (!isAuthenticated) {
    return { phase: "anonymous", errorMessage: null };
  }

  if (syncPhase === "error") {
    return { phase: "error", errorMessage };
  }

  if (syncPhase !== "ready") {
    return { phase: "syncing", errorMessage: null };
  }

  return { phase: "ready", errorMessage: null };
}
