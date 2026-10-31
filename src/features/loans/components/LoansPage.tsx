"use client";

import { useQuery } from "convex/react";

import { Container, Panel } from "@/components/ui";
import { SECTION_Y_CLASS } from "@/constants";
import { useEnsureCurrentUser } from "@/features/account";
import { api } from "convex/_generated/api";

import { LOANS_COPY } from "../constants/copy";
import { AllLoansSection } from "./AllLoansSection";
import { IncomingRequestsSection } from "./IncomingRequestsSection";
import { MyRequestsSection } from "./MyRequestsSection";

const LOANS_PAGE_CLASS = `space-y-8 ${SECTION_Y_CLASS} sm:space-y-10`;

export function LoansPage() {
  const { phase, errorMessage } = useEnsureCurrentUser();
  const isReady = phase === "ready";

  const me = useQuery(api.users.me, isReady ? {} : "skip");
  const isAdmin = me?.role === "admin";

  if (phase === "error") {
    return (
      <Container className={LOANS_PAGE_CLASS}>
        <Panel tone="notice">
          <p className="font-display text-2xl font-bold text-ink">
            {LOANS_COPY.loadErrorTitle}
          </p>
          <p className="mt-2 text-sm text-ink-muted">{errorMessage}</p>
        </Panel>
      </Container>
    );
  }

  return (
    <Container className={LOANS_PAGE_CLASS}>
      <header className="space-y-2 sm:space-y-3">
        <h1 className="font-display text-3xl font-extrabold leading-none text-ink sm:text-4xl">
          {LOANS_COPY.pageTitle}
        </h1>
        <p className="max-w-xl text-sm text-ink-muted sm:text-base">
          {LOANS_COPY.pageDescription}
        </p>
      </header>

      <IncomingRequestsSection isReady={isReady} />
      <MyRequestsSection isReady={isReady} />
      <AllLoansSection isReady={isReady} isAdmin={isAdmin ?? false} />
    </Container>
  );
}
