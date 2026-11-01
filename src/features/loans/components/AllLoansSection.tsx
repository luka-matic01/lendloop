"use client";

import { ChevronDown } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { useQuery } from "convex/react";

import { cn } from "@/lib/utils";
import { api } from "convex/_generated/api";

import { LOANS_COPY } from "../constants/copy";
import type { useLoanActions } from "../hooks/useLoanActions";
import { partitionLoansForSection } from "../utils/sortLoans";
import { LoanListPanel } from "./LoanListPanel";
import { LoanSection } from "./LoanSection";

type AllLoansSectionProps = {
  isReady: boolean;
  isAdmin: boolean;
  loanActions: ReturnType<typeof useLoanActions>;
};

export function AllLoansSection({
  isReady,
  isAdmin,
  loanActions,
}: AllLoansSectionProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyPanelId = useId();

  const loans = useQuery(
    api.loanRequests.listAllForAdmin,
    isReady && isAdmin ? {} : "skip",
  );

  const { open, history } = useMemo(
    () => partitionLoansForSection(loans ?? []),
    [loans],
  );

  if (!isAdmin) {
    return null;
  }

  const isLoading = !isReady || loans === undefined;
  const pendingCount = open.filter((l) => l.status === "pending").length;
  const outCount = open.filter((l) => l.status === "approved").length;

  return (
    <div className="space-y-4">
      <LoanSection
        headingId="all-loans-heading"
        heading={LOANS_COPY.allLoansHeading}
        summary={LOANS_COPY.sectionSummary(pendingCount, outCount)}
        isLoading={isLoading}
        itemCount={open.length}
        emptyMessage={LOANS_COPY.emptyAllLoansOpen}
        skeletonLabel="Loading all loans"
        skeletonActionCount={1}
        skeletonRowCount={3}
      >
        <LoanListPanel
          loans={open}
          perspective="admin"
          loanActions={loanActions}
        />
      </LoanSection>

      {!isLoading && history.length > 0 ? (
        <section aria-labelledby="all-loans-past-heading">
          <h2 id="all-loans-past-heading" className="sr-only">
            {LOANS_COPY.pastLoansSectionTitle}
          </h2>
          <button
            type="button"
            aria-expanded={historyOpen}
            aria-controls={historyPanelId}
            onClick={() => setHistoryOpen((wasOpen) => !wasOpen)}
            className={cn(
              "inline-flex items-center gap-1 text-sm text-ink-muted transition-colors",
              "hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-ink",
            )}
          >
            {historyOpen
              ? LOANS_COPY.hidePastLoans
              : LOANS_COPY.showPastLoans(history.length)}
            <ChevronDown
              className={cn(
                "size-4 shrink-0 transition-transform duration-200",
                historyOpen && "rotate-180",
              )}
              aria-hidden
            />
          </button>
          {historyOpen ? (
            <div id={historyPanelId} className="mt-4">
              <LoanListPanel
                loans={history}
                perspective="admin"
                density="compact"
              />
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
