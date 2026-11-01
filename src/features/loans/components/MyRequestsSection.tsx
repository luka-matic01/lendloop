"use client";

import { useQuery } from "convex/react";

import { api } from "convex/_generated/api";

import { LOANS_COPY } from "../constants/copy";
import type { useLoanActions } from "../hooks/useLoanActions";
import { partitionLoansForSection } from "../utils/sortLoans";
import { LoanListPanel } from "./LoanListPanel";
import { LoanSection } from "./LoanSection";

type MyRequestsSectionProps = {
  isReady: boolean;
  loanActions: ReturnType<typeof useLoanActions>;
};

export function MyRequestsSection({
  isReady,
  loanActions,
}: MyRequestsSectionProps) {
  const loans = useQuery(
    api.loanRequests.listMyRequests,
    isReady ? {} : "skip",
  );

  const isLoading = !isReady || loans === undefined;
  const { open } = partitionLoansForSection(loans ?? []);
  const pendingCount = open.filter((l) => l.status === "pending").length;
  const outCount = open.filter((l) => l.status === "approved").length;

  return (
    <LoanSection
      headingId="my-loans-heading"
      heading={LOANS_COPY.myRequestsHeading}
      summary={LOANS_COPY.sectionSummary(pendingCount, outCount)}
      isLoading={isLoading}
      itemCount={open.length}
      emptyMessage={LOANS_COPY.emptyMyRequests}
      skeletonLabel="Loading your requests"
      skeletonActionCount={1}
    >
      <LoanListPanel
        loans={open}
        perspective="mine"
        loanActions={loanActions}
      />
    </LoanSection>
  );
}
