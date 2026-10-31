"use client";

import { useUser } from "@clerk/nextjs";
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
  const { user, isLoaded: userLoaded } = useUser();
  const ensureCurrentUser = useMutation(api.users.ensureCurrentUser);
  const [syncPhase, setSyncPhase] = useState<SyncPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastSyncedEmail = useRef<string | null>(null);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !userLoaded) {
      if (!isAuthenticated) {
        lastSyncedEmail.current = null;
        setSyncPhase("idle");
      }
      return;
    }

    const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? null;
    if (lastSyncedEmail.current === primaryEmail) {
      return;
    }

    lastSyncedEmail.current = primaryEmail;

    void ensureCurrentUser(
      primaryEmail ? { primaryEmail } : {},
    )
      .then(() => setSyncPhase("ready"))
      .catch((err: unknown) => {
        lastSyncedEmail.current = null;
        setSyncPhase("error");
        setErrorMessage(
          err instanceof Error
            ? err.message
            : ACCOUNT_MESSAGES.syncFailedFallback,
        );
      });
  }, [
    authLoading,
    isAuthenticated,
    userLoaded,
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
