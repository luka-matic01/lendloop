"use client";

import { useQuery } from "convex/react";

import { api } from "convex/_generated/api";

import { LOANS_COPY } from "../constants/copy";
import type { useLoanActions } from "../hooks/useLoanActions";
import { countApprovedLoanPhases } from "../utils/approvedLoanAction";
import { partitionLoansForSection } from "../utils/sortLoans";
import { LoanListPanel } from "./LoanListPanel";
import { LoanSection } from "./LoanSection";

type IncomingRequestsSectionProps = {
  isReady: boolean;
  loanActions: ReturnType<typeof useLoanActions>;
};

export function IncomingRequestsSection({
  isReady,
  loanActions,
}: IncomingRequestsSectionProps) {
  const loans = useQuery(
    api.loanRequests.listIncomingRequests,
    isReady ? {} : "skip",
  );

  const isLoading = !isReady || loans === undefined;
  const { open } = partitionLoansForSection(loans ?? [], "incoming");
  const pendingCount = open.filter((l) => l.status === "pending").length;
  const { out: outCount, reserved: reservedCount } =
    countApprovedLoanPhases(open);

  return (
    <LoanSection
      headingId="incoming-loans-heading"
      heading={LOANS_COPY.incomingHeading}
      summary={LOANS_COPY.sectionSummary(
        pendingCount,
        outCount,
        reservedCount,
      )}
      isLoading={isLoading}
      itemCount={open.length}
      emptyMessage={LOANS_COPY.emptyIncoming}
      skeletonLabel="Loading incoming requests"
      skeletonActionCount={2}
    >
      <LoanListPanel
        loans={open}
        perspective="incoming"
        loanActions={loanActions}
      />
    </LoanSection>
  );
}
