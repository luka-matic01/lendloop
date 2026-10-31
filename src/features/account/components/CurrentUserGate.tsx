"use client";

import { ReactNode } from "react";

import { useEnsureCurrentUser } from "../hooks/useEnsureCurrentUser";
import { ACCOUNT_MESSAGES } from "../constants/messages";

import { AccountStatusPanel } from "./AccountStatusPanel";

export function CurrentUserGate({ children }: { children: ReactNode }) {
  const { phase, errorMessage } = useEnsureCurrentUser();

  if (phase === "auth-loading" || phase === "syncing") {
    return (
      <AccountStatusPanel withContainer={false}>
        <p className="text-sm text-ink-muted">{ACCOUNT_MESSAGES.syncing}</p>
      </AccountStatusPanel>
    );
  }

  if (phase === "error") {
    return (
      <AccountStatusPanel tone="notice" withContainer={false}>
        <p className="text-sm font-medium text-ink">
          {ACCOUNT_MESSAGES.syncFailedTitle}
        </p>
        <p className="mt-2 text-sm text-ink-muted">{errorMessage}</p>
      </AccountStatusPanel>
    );
  }

  if (phase === "anonymous") {
    return null;
  }

  return children;
}
