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

type MyRequestsSectionProps = {
  isReady: boolean;
};

export function MyRequestsSection({ isReady }: MyRequestsSectionProps) {
  const loans = useQuery(
    api.loanRequests.listMyRequests,
    isReady ? {} : "skip",
  );
  const loanActions = useLoanActions();

  const isLoading = !isReady || loans === undefined;
  const sortedLoans = sortLoansForList(filterOpenLoansForSection(loans ?? []));
  const pendingCount = sortedLoans.filter((l) => l.status === "pending").length;
  const outCount = sortedLoans.filter((l) => l.status === "approved").length;

  return (
    <LoanSection
      headingId="my-loans-heading"
      heading={LOANS_COPY.myRequestsHeading}
      summary={LOANS_COPY.sectionSummary(pendingCount, outCount)}
      isLoading={isLoading}
      itemCount={sortedLoans.length}
      emptyMessage={LOANS_COPY.emptyMyRequests}
      skeletonLabel="Loading your requests"
      skeletonActionCount={1}
    >
      <LoanListPanel
        loans={sortedLoans}
        perspective="mine"
        loanActions={loanActions}
      />
    </LoanSection>
  );
}
