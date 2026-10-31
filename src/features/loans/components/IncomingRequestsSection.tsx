"use client";

import { useQuery } from "convex/react";

import { Button } from "@/components/ui";
import { api } from "convex/_generated/api";

import { LOANS_COPY } from "../constants/copy";
import { useLoanActions } from "../hooks/useLoanActions";
import { LoanListPanel } from "./LoanListPanel";
import { LoanRow } from "./LoanRow";
import { LoanSection } from "./LoanSection";

type IncomingRequestsSectionProps = {
  isReady: boolean;
};

export function IncomingRequestsSection({ isReady }: IncomingRequestsSectionProps) {
  const loans = useQuery(
    api.loanRequests.listIncomingRequests,
    isReady ? {} : "skip",
  );
  const { pendingId, approve, decline, markReturned } = useLoanActions();

  const isLoading = !isReady || loans === undefined;
  const itemCount = loans?.length ?? 0;

  return (
    <LoanSection
      headingId="incoming-loans-heading"
      heading={LOANS_COPY.incomingHeading}
      isLoading={isLoading}
      itemCount={itemCount}
      emptyMessage={LOANS_COPY.emptyIncoming}
      skeletonLabel="Loading incoming requests"
      skeletonActionCount={2}
    >
      <LoanListPanel>
        {(loans ?? []).map((loan) => (
          <li key={loan._id}>
            <LoanRow
              loan={loan}
              partyLine={loan.borrowerName}
              actions={
                <>
                  {loan.status === "pending" ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        disabled={pendingId === loan._id}
                        onClick={() => approve(loan._id, loan.toolName)}
                      >
                        {LOANS_COPY.approve}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={pendingId === loan._id}
                        onClick={() => decline(loan._id, loan.toolName)}
                      >
                        {LOANS_COPY.decline}
                      </Button>
                    </>
                  ) : null}
                  {loan.status === "approved" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={pendingId === loan._id}
                      onClick={() => markReturned(loan._id, loan.toolName)}
                    >
                      {LOANS_COPY.markReturned}
                    </Button>
                  ) : null}
                </>
              }
            />
          </li>
        ))}
      </LoanListPanel>
    </LoanSection>
  );
}
