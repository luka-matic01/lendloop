"use client";

import { useQuery } from "convex/react";

import { Button } from "@/components/ui";
import { api } from "convex/_generated/api";

import { LOANS_COPY } from "../constants/copy";
import { useLoanActions } from "../hooks/useLoanActions";
import { sortLoansForList } from "../utils/sortLoans";
import { LoanListPanel } from "./LoanListPanel";
import { LoanRow } from "./LoanRow";
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
  const { setTrustedLender } = useLoanActions();

  if (!isAdmin) {
    return null;
  }

  const isLoading = !isReady || loans === undefined;
  const sortedLoans = sortLoansForList(loans ?? []);
  const itemCount = sortedLoans.length;

  return (
    <LoanSection
      headingId="all-loans-heading"
      heading={LOANS_COPY.allLoansHeading}
      isLoading={isLoading}
      itemCount={itemCount}
      emptyMessage={LOANS_COPY.emptyAllLoans}
      skeletonLabel="Loading all loans"
      skeletonActionCount={1}
      skeletonRowCount={3}
    >
      <LoanListPanel>
        {sortedLoans.map((loan) => (
          <li key={loan._id}>
            <LoanRow
              loan={loan}
              partyLine={`${loan.borrowerName} → ${loan.lenderName}`}
              actions={
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setTrustedLender(
                      loan.lenderId,
                      loan.lenderName,
                      !loan.lenderIsTrusted,
                    )
                  }
                >
                  {loan.lenderIsTrusted
                    ? LOANS_COPY.removeTrusted
                    : LOANS_COPY.markTrusted}
                </Button>
              }
            />
          </li>
        ))}
      </LoanListPanel>
    </LoanSection>
  );
}
