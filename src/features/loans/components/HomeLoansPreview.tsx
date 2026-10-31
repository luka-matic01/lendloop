"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "convex/react";

import { Button, Panel, buttonClassName } from "@/components/ui";
import { ROUTES } from "@/constants";
import { useEnsureCurrentUser } from "@/features/account";
import { api } from "convex/_generated/api";

import { LOANS_COPY } from "../constants/copy";
import { HOME_LOANS_PREVIEW_LIMIT } from "../constants/limits";
import { useLoanActions } from "../hooks/useLoanActions";
import {
  formatIncomingPartyLine,
  formatMyRequestPartyLine,
} from "../utils/formatLoan";
import { HomeLoansFrame } from "./HomeLoansFrame";
import { LoanListPanel } from "./LoanListPanel";
import { LoanListSkeleton } from "./LoanRowSkeleton";
import { LoanRow } from "./LoanRow";

export function HomeLoansPreview() {
  const { phase } = useEnsureCurrentUser();
  const isReady = phase === "ready";

  const incoming = useQuery(
    api.loanRequests.listIncomingRequests,
    isReady ? {} : "skip",
  );
  const mine = useQuery(api.loanRequests.listMyRequests, isReady ? {} : "skip");
  const { pendingId, approve, decline } = useLoanActions();

  const isLoading = !isReady || incoming === undefined || mine === undefined;

  const pendingIncoming = useMemo(() => {
    if (!incoming) {
      return [];
    }
    return incoming
      .filter((loan) => loan.status === "pending")
      .slice(0, HOME_LOANS_PREVIEW_LIMIT);
  }, [incoming]);

  const activeMine = useMemo(() => {
    if (!mine) {
      return [];
    }
    return mine
      .filter((loan) => loan.status === "pending" || loan.status === "approved")
      .slice(0, HOME_LOANS_PREVIEW_LIMIT);
  }, [mine]);

  const hasRows = pendingIncoming.length > 0 || activeMine.length > 0;

  return (
    <HomeLoansFrame
      busy={isLoading}
      description={LOANS_COPY.homeLoansSignedInDescription}
    >
      {isLoading ? (
        <LoanListSkeleton actionCount={2} label="Loading loan activity" />
      ) : (
        <div className="space-y-6">
          {!hasRows ? (
            <Panel>
              <p className="text-base text-ink-muted">
                {LOANS_COPY.homeEmptyLoans}
              </p>
            </Panel>
          ) : (
            <>
              {pendingIncoming.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-display text-lg font-bold text-ink">
                    {LOANS_COPY.homeIncomingPreview}
                  </h3>
                  <LoanListPanel>
                    {pendingIncoming.map((loan) => (
                      <li key={loan._id}>
                        <LoanRow
                          loan={loan}
                          partyLine={formatIncomingPartyLine(loan)}
                          actions={
                            <>
                              <Button
                                type="button"
                                size="sm"
                                disabled={pendingId === loan._id}
                                onClick={() =>
                                  approve(loan._id, loan.toolName)
                                }
                              >
                                {LOANS_COPY.approve}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                disabled={pendingId === loan._id}
                                onClick={() =>
                                  decline(loan._id, loan.toolName)
                                }
                              >
                                {LOANS_COPY.decline}
                              </Button>
                            </>
                          }
                        />
                      </li>
                    ))}
                  </LoanListPanel>
                </div>
              ) : null}

              {activeMine.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-display text-lg font-bold text-ink">
                    {LOANS_COPY.homeMyRequestsPreview}
                  </h3>
                  <LoanListPanel>
                    {activeMine.map((loan) => (
                      <li key={loan._id}>
                        <LoanRow
                          loan={loan}
                          partyLine={formatMyRequestPartyLine(loan)}
                        />
                      </li>
                    ))}
                  </LoanListPanel>
                </div>
              ) : null}
            </>
          )}

          <Link
            href={ROUTES.loans}
            className={buttonClassName({ variant: "secondary", size: "sm" })}
          >
            {LOANS_COPY.seeAllLoans}
          </Link>
        </div>
      )}
    </HomeLoansFrame>
  );
}
