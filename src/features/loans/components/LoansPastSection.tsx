"use client";

import { ChevronDown } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { useQuery } from "convex/react";

import { cn } from "@/lib/utils";
import { api } from "convex/_generated/api";

import { LOANS_COPY } from "../constants/copy";
import { partitionLoansForSection } from "../utils/sortLoans";
import { LoanListPanel } from "./LoanListPanel";

type LoansPastSectionProps = {
  isReady: boolean;
};

export function LoansPastSection({ isReady }: LoansPastSectionProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const incoming = useQuery(
    api.loanRequests.listIncomingRequests,
    isReady ? {} : "skip",
  );
  const mine = useQuery(api.loanRequests.listMyRequests, isReady ? {} : "skip");

  const incomingHistory = useMemo(
    () => partitionLoansForSection(incoming ?? []).history,
    [incoming],
  );
  const mineHistory = useMemo(
    () => partitionLoansForSection(mine ?? []).history,
    [mine],
  );

  const total = incomingHistory.length + mineHistory.length;
  if (!isReady || incoming === undefined || mine === undefined || total === 0) {
    return null;
  }

  return (
    <section aria-labelledby="loans-past-heading" className="border-t border-line pt-6">
      <h2 id="loans-past-heading" className="sr-only">
        {LOANS_COPY.pastLoansSectionTitle}
      </h2>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        className={cn(
          "inline-flex items-center gap-1 text-sm text-ink-muted transition-colors",
          "hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-ink",
        )}
      >
        {open ? LOANS_COPY.hidePastLoans : LOANS_COPY.showPastLoans(total)}
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div id={panelId} className="mt-4 space-y-5">
          {incomingHistory.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-ink-muted">
                {LOANS_COPY.pastLoansOnYourTools(incomingHistory.length)}
              </p>
              <LoanListPanel
                loans={incomingHistory}
                perspective="incoming"
                density="compact"
              />
            </div>
          ) : null}
          {mineHistory.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-ink-muted">
                {LOANS_COPY.pastLoansYourBorrows(mineHistory.length)}
              </p>
              <LoanListPanel
                loans={mineHistory}
                perspective="mine"
                density="compact"
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
