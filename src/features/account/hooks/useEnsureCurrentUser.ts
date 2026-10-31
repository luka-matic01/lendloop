"use client";

import { useEffect, useRef, useState } from "react";
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

export function useEnsureCurrentUser(): {
  phase: EnsureCurrentUserPhase;
  errorMessage: string | null;
} {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const ensureCurrentUser = useMutation(api.users.ensureCurrentUser);
  const [syncPhase, setSyncPhase] = useState<SyncPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const provisionStarted = useRef(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      provisionStarted.current = false;
      return;
    }

    if (provisionStarted.current) {
      return;
    }

    provisionStarted.current = true;

    void ensureCurrentUser()
      .then(() => setSyncPhase("ready"))
      .catch((err: unknown) => {
        provisionStarted.current = false;
        setSyncPhase("error");
        setErrorMessage(
          err instanceof Error
            ? err.message
            : ACCOUNT_MESSAGES.syncFailedFallback
        );
      });
  }, [authLoading, isAuthenticated, ensureCurrentUser]);

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
