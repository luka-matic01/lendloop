import type { ReactNode } from "react";

import {
  Button,
  LIST_ROW_META_TEXT_CLASS,
  InlineRange,
  LenderTrustToggleIconButton,
  ListRow,
  ListRowMetaSeparator,
  TrustedLenderIndicator,
} from "@/components/ui";
import { cn } from "@/lib/utils";

import { LOANS_COPY } from "../constants/copy";
import type { useLoanActions } from "../hooks/useLoanActions";
import type { LoanView } from "../types/loans";
import {
  type LoanPerspective,
  formatLoanAutomationDetail,
  formatLoanPartyLine,
} from "../utils/formatLoan";
import { isClosedLoanStatus } from "../utils/sortLoans";
import { BorrowDateRange } from "./BorrowDateRange";
import { LoanStatusBadge } from "./LoanStatusBadge";

export type LoanRowActions = ReturnType<typeof useLoanActions>;

type LoanRowProps = {
  loan: LoanView;
  perspective: LoanPerspective;
  loanActions?: LoanRowActions;
  density?: "default" | "compact";
  className?: string;
};

function renderRowActions(
  loan: LoanView,
  perspective: LoanPerspective,
  loanActions?: LoanRowActions,
): ReactNode {
  if (!loanActions) {
    return null;
  }
  const {
    pendingId,
    pendingTrustedUserId,
    approve,
    decline,
    requestMarkReturned,
    requestTrustedLenderChange,
  } = loanActions;
  const isBusy = pendingId === loan._id;
  const isTrustedBusy = pendingTrustedUserId === loan.lenderId;

  if (perspective === "incoming") {
    if (loan.status === "pending") {
      return (
        <>
          <Button
            type="button"
            size="sm"
            disabled={isBusy}
            onClick={() => approve(loan._id, loan.toolName)}
          >
            {LOANS_COPY.approve}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={isBusy}
            onClick={() => decline(loan._id, loan.toolName)}
          >
            {LOANS_COPY.decline}
          </Button>
        </>
      );
    }
    if (loan.status === "approved") {
      return (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={isBusy}
          onClick={() => requestMarkReturned(loan._id, loan.toolName, "incoming")}
        >
          {LOANS_COPY.markReturned}
        </Button>
      );
    }
    return null;
  }

  if (perspective === "mine") {
    if (loan.status === "approved") {
      return (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={isBusy}
          onClick={() => requestMarkReturned(loan._id, loan.toolName, "mine")}
        >
          {LOANS_COPY.markReturned}
        </Button>
      );
    }
    return null;
  }

  // Admin (all loans) rows: trusted-lender toggle on open loans only.
  if (isClosedLoanStatus(loan.status)) {
    return null;
  }

  return (
    <LenderTrustToggleIconButton
      lenderName={loan.lenderName}
      isTrusted={loan.lenderIsTrusted}
      disabled={isTrustedBusy}
      markTrustedLabel={LOANS_COPY.markTrusted}
      removeTrustedLabel={LOANS_COPY.removeTrusted}
      onClick={() =>
        requestTrustedLenderChange(
          loan.lenderId,
          loan.lenderName,
          !loan.lenderIsTrusted,
        )
      }
    />
  );
}

export function LoanRow({
  loan,
  perspective,
  loanActions,
  density = "default",
  className,
}: LoanRowProps) {
  const partyLine = formatLoanPartyLine(loan, perspective);
  const automationDetail = formatLoanAutomationDetail(loan);
  const isClosed = isClosedLoanStatus(loan.status);
  const actions = renderRowActions(loan, perspective, loanActions);

  return (
    <ListRow
      density={density}
      className={cn(isClosed && "opacity-70", className)}
      title={loan.toolName}
      titleClassName={isClosed ? "text-ink-muted" : undefined}
      meta={
        <>
          <LoanStatusBadge status={loan.status} perspective={perspective} />
          <ListRowMetaSeparator />
          <BorrowDateRange
            startDate={loan.startDate}
            endDate={loan.endDate}
          />
        </>
      }
      details={
        <div className="space-y-1">
          <p className={LIST_ROW_META_TEXT_CLASS}>
            {perspective === "admin" ? (
              <span className="inline-flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 leading-snug">
                <InlineRange
                  separator="to"
                  start={loan.borrowerName}
                  end={loan.lenderName}
                />
                {loan.lenderIsTrusted ? (
                  <TrustedLenderIndicator label={LOANS_COPY.trustedLenderLabel} />
                ) : null}
              </span>
            ) : (
              <span className="min-w-0 [overflow-wrap:anywhere] leading-snug">
                {partyLine}
              </span>
            )}
          </p>
          {automationDetail && density === "default" ? (
            <p className="text-xs text-ink-muted">{automationDetail}</p>
          ) : null}
        </div>
      }
      actions={actions ?? undefined}
    />
  );
}
