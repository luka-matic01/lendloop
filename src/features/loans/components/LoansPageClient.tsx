"use client";

import type { ReactNode } from "react";

import { Container, Panel } from "@/components/ui";
import { useEnsureCurrentUser } from "@/features/account";

import { LOANS_COPY } from "../constants/copy";
import { useLoanActions } from "../hooks/useLoanActions";
import { LOANS_PAGE_CLASS } from "./loansPageLayout";
import { AllLoansSection } from "./AllLoansSection";
import { IncomingRequestsSection } from "./IncomingRequestsSection";
import { LoansPastSection } from "./LoansPastSection";
import { CancelBorrowConfirmModal } from "./CancelBorrowConfirmModal";
import { MarkReturnedConfirmModal } from "./MarkReturnedConfirmModal";
import { TrustedLenderConfirmModal } from "./TrustedLenderConfirmModal";
import { MyRequestsSection } from "./MyRequestsSection";

type LoansPageClientProps = {
  intro: ReactNode;
};

export function LoansPageClient({ intro }: LoansPageClientProps) {
  const { phase, errorMessage } = useEnsureCurrentUser();
  const isReady = phase === "ready";
  const loanActions = useLoanActions();

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
      <header className="space-y-2 sm:space-y-3">{intro}</header>

      <IncomingRequestsSection isReady={isReady} loanActions={loanActions} />
      <MyRequestsSection isReady={isReady} loanActions={loanActions} />
      <LoansPastSection isReady={isReady} />
      <AllLoansSection isReady={isReady} loanActions={loanActions} />
      <MarkReturnedConfirmModal loanActions={loanActions} />
      <CancelBorrowConfirmModal loanActions={loanActions} />
      <TrustedLenderConfirmModal loanActions={loanActions} />
    </Container>
  );
}
