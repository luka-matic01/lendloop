"use client";

import { useQuery } from "convex/react";

import { Button } from "@/components/ui";
import { api } from "convex/_generated/api";

import { LOANS_COPY } from "../constants/copy";
import { useLoanActions } from "../hooks/useLoanActions";
import { formatMyRequestPartyLine } from "../utils/formatLoan";
import {
  filterOpenLoansForSection,
  sortLoansForList,
} from "../utils/sortLoans";
import { LoanListPanel } from "./LoanListPanel";
import { LoanRow } from "./LoanRow";
import { LoanSection } from "./LoanSection";

type MyRequestsSectionProps = {
  isReady: boolean;
};

export function MyRequestsSection({ isReady }: MyRequestsSectionProps) {
  const loans = useQuery(
    api.loanRequests.listMyRequests,
    isReady ? {} : "skip",
  );
  const { pendingId, markReturned } = useLoanActions();

  const isLoading = !isReady || loans === undefined;
  const sortedLoans = sortLoansForList(filterOpenLoansForSection(loans ?? []));
  const itemCount = sortedLoans.length;

  return (
    <LoanSection
      headingId="my-loans-heading"
      heading={LOANS_COPY.myRequestsHeading}
      isLoading={isLoading}
      itemCount={itemCount}
      emptyMessage={LOANS_COPY.emptyMyRequests}
      skeletonLabel="Loading your requests"
      skeletonActionCount={1}
    >
      <LoanListPanel>
        {sortedLoans.map((loan) => (
          <li key={loan._id}>
            <LoanRow
              loan={loan}
              partyLine={formatMyRequestPartyLine(loan)}
              actions={
                loan.status === "approved" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={pendingId === loan._id}
                    onClick={() => markReturned(loan._id, loan.toolName)}
                  >
                    {LOANS_COPY.markReturned}
                  </Button>
                ) : null
              }
            />
          </li>
        ))}
      </LoanListPanel>
    </LoanSection>
  );
}
