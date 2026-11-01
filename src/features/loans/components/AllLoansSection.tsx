"use client";

import { useQuery } from "convex/react";

import { api } from "convex/_generated/api";

import { LOANS_COPY } from "../constants/copy";
import { useLoanActions } from "../hooks/useLoanActions";
import { sortLoansForList } from "../utils/sortLoans";
import { LoanListPanel } from "./LoanListPanel";
import { LoanSection } from "./LoanSection";

type AllLoansSectionProps = {
  isReady: boolean;
  isAdmin: boolean;
};

export function AllLoansSection({ isReady, isAdmin }: AllLoansSectionProps) {
  const loans = useQuery(
    api.loanRequests.listAllForAdmin,
    isReady && isAdmin ? {} : "skip",
  );
  const loanActions = useLoanActions();

  if (!isAdmin) {
    return null;
  }

  const isLoading = !isReady || loans === undefined;
  const sortedLoans = sortLoansForList(loans ?? []);

  return (
    <LoanSection
      headingId="all-loans-heading"
      heading={LOANS_COPY.allLoansHeading}
      isLoading={isLoading}
      itemCount={sortedLoans.length}
      emptyMessage={LOANS_COPY.emptyAllLoans}
      skeletonLabel="Loading all loans"
      skeletonActionCount={1}
      skeletonRowCount={3}
    >
      <LoanListPanel
        loans={sortedLoans}
        perspective="admin"
        loanActions={loanActions}
      />
    </LoanSection>
  );
}
