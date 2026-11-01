"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "convex/react";

import { Panel, buttonClassName } from "@/components/ui";
import { ROUTES } from "@/constants";
import { useEnsureCurrentUser } from "@/features/account";
import { api } from "convex/_generated/api";

import { LOANS_COPY } from "../constants/copy";
import { HOME_LOANS_PREVIEW_LIMIT } from "../constants/limits";
import { useLoanActions } from "../hooks/useLoanActions";
import { partitionLoansForSection } from "../utils/sortLoans";
import { HomeLoansFrame } from "./HomeLoansFrame";
import { LoanListPanel } from "./LoanListPanel";
import { LoanListSkeleton } from "./LoanRowSkeleton";
import { MarkReturnedConfirmModal } from "./MarkReturnedConfirmModal";

export function HomeLoansPreview() {
  const { phase } = useEnsureCurrentUser();
  const isReady = phase === "ready";

  const incoming = useQuery(
    api.loanRequests.listIncomingRequests,
    isReady ? {} : "skip",
  );
  const mine = useQuery(api.loanRequests.listMyRequests, isReady ? {} : "skip");
  const loanActions = useLoanActions();

  const isLoading = !isReady || incoming === undefined || mine === undefined;

  const openIncoming = useMemo(
    () => partitionLoansForSection(incoming ?? []).open,
    [incoming],
  );
  const openMine = useMemo(
    () => partitionLoansForSection(mine ?? []).open,
    [mine],
  );

  const previewIncoming = useMemo(
    () => openIncoming.slice(0, HOME_LOANS_PREVIEW_LIMIT),
    [openIncoming],
  );
  const previewMine = useMemo(
    () => openMine.slice(0, HOME_LOANS_PREVIEW_LIMIT),
    [openMine],
  );

  const incomingPendingCount = openIncoming.filter(
    (loan) => loan.status === "pending",
  ).length;
  const incomingOutCount = openIncoming.filter(
    (loan) => loan.status === "approved",
  ).length;

  const hasRows = previewIncoming.length > 0 || previewMine.length > 0;
  const activitySummary = hasRows
    ? LOANS_COPY.homeLoansSummary(
        incomingPendingCount,
        incomingOutCount,
        openMine.length,
      )
    : null;

  return (
    <HomeLoansFrame
      busy={isLoading}
      description={LOANS_COPY.homeLoansSignedInDescription}
      summary={activitySummary}
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
            <div className="space-y-6">
              {previewIncoming.length > 0 ? (
                <div className="space-y-2.5">
                  <h3 className="font-display text-xl font-bold leading-none text-ink">
                    {LOANS_COPY.homeIncomingPreview}
                    <span className="ml-2 text-base font-semibold text-ink-muted">
                      ({openIncoming.length})
                    </span>
                  </h3>
                  <LoanListPanel
                    loans={previewIncoming}
                    perspective="incoming"
                    loanActions={loanActions}
                  />
                </div>
              ) : null}

              {previewMine.length > 0 ? (
                <div className="space-y-2.5">
                  <h3 className="font-display text-xl font-bold leading-none text-ink">
                    {LOANS_COPY.homeMyRequestsPreview}
                    <span className="ml-2 text-base font-semibold text-ink-muted">
                      ({openMine.length})
                    </span>
                  </h3>
                  <LoanListPanel
                    loans={previewMine}
                    perspective="mine"
                    loanActions={loanActions}
                  />
                </div>
              ) : null}
            </div>
          )}

          <Link
            href={ROUTES.loans}
            className={buttonClassName({ variant: "secondary", size: "sm" })}
          >
            {LOANS_COPY.seeAllLoans}
          </Link>
        </div>
      )}
      <MarkReturnedConfirmModal loanActions={loanActions} />
    </HomeLoansFrame>
  );
}
