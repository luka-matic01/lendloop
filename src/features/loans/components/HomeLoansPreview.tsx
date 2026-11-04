"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "convex/react";

import {
  HomeFeatureSection,
  HomePreviewBody,
  Panel,
  buttonClassName,
} from "@/components/ui";
import { ROUTES } from "@/constants";
import type { AccountSyncState } from "@/features/account";
import { api } from "convex/_generated/api";

import { LOANS_COPY } from "../constants/copy";
import { HOME_LOANS_PREVIEW_LIMIT } from "../constants/limits";
import { useLoanActions } from "../hooks/useLoanActions";
import { partitionLoansForSection } from "../utils/sortLoans";
import { CancelBorrowConfirmModal } from "./CancelBorrowConfirmModal";
import { LoanListPanel } from "./LoanListPanel";
import { LoanListSkeleton } from "./LoanRowSkeleton";
import { MarkReturnedConfirmModal } from "./MarkReturnedConfirmModal";

type HomeLoansPreviewProps = {
  accountSync: AccountSyncState;
};

export function HomeLoansPreview({ accountSync }: HomeLoansPreviewProps) {
  const isReady = accountSync.phase === "ready";
  const syncFailed = accountSync.phase === "error";

  const incoming = useQuery(
    api.loanRequests.listIncomingRequests,
    isReady ? {} : "skip",
  );
  const mine = useQuery(api.loanRequests.listMyRequests, isReady ? {} : "skip");
  const loanActions = useLoanActions();

  const isLoading =
    !syncFailed && (!isReady || incoming === undefined || mine === undefined);

  const openIncoming = useMemo(
    () => partitionLoansForSection(incoming ?? [], "incoming").open,
    [incoming],
  );
  const openMine = useMemo(
    () => partitionLoansForSection(mine ?? [], "mine").open,
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

  const hasRows = previewIncoming.length > 0 || previewMine.length > 0;

  return (
    <HomeFeatureSection
      headingId="home-loans-heading"
      title={LOANS_COPY.homeLoansTitle}
      description={LOANS_COPY.homeLoansSignedInDescription}
      busy={isLoading}
      borderTop
    >
      <HomePreviewBody
        syncFailed={syncFailed}
        errorMessage={accountSync.errorMessage}
        isLoading={isLoading}
        loading={
          <LoanListSkeleton actionCount={2} label="Loading loan activity" />
        }
      >
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
      </HomePreviewBody>

      <MarkReturnedConfirmModal loanActions={loanActions} />
      <CancelBorrowConfirmModal loanActions={loanActions} />
    </HomeFeatureSection>
  );
}
