"use client";

import { useQuery } from "convex/react";

import { api } from "convex/_generated/api";

import { LOANS_COPY } from "../constants/copy";
import { useLoanActions } from "../hooks/useLoanActions";
import {
  filterOpenLoansForSection,
  sortLoansForList,
} from "../utils/sortLoans";
import { LoanListPanel } from "./LoanListPanel";
import { LoanSection } from "./LoanSection";

type IncomingRequestsSectionProps = {
  isReady: boolean;
};

export function IncomingRequestsSection({
  isReady,
}: IncomingRequestsSectionProps) {
  const loans = useQuery(
    api.loanRequests.listIncomingRequests,
    isReady ? {} : "skip",
  );
  const loanActions = useLoanActions();

  const isLoading = !isReady || loans === undefined;
  const sortedLoans = sortLoansForList(filterOpenLoansForSection(loans ?? []));
  const pendingCount = sortedLoans.filter((l) => l.status === "pending").length;
  const outCount = sortedLoans.filter((l) => l.status === "approved").length;

  return (
    <LoanSection
      headingId="incoming-loans-heading"
      heading={LOANS_COPY.incomingHeading}
      summary={LOANS_COPY.sectionSummary(pendingCount, outCount)}
      isLoading={isLoading}
      itemCount={sortedLoans.length}
      emptyMessage={LOANS_COPY.emptyIncoming}
      skeletonLabel="Loading incoming requests"
      skeletonActionCount={2}
    >
      <LoanListPanel
        loans={sortedLoans}
        perspective="incoming"
        loanActions={loanActions}
      />
    </LoanSection>
  );
}
