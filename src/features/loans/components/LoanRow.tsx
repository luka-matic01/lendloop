import { Button } from "@/components/ui";
import {
  BORROW_DUE_TONE_CLASS,
  formatBorrowDuePhrase,
  getBorrowDueUrgency,
} from "@/lib/format-borrow-due";
import { cn } from "@/lib/utils";

import { LOANS_COPY } from "../constants/copy";
import { LOAN_ROW_TITLE_CLASS } from "../constants/visual";
import type { useLoanActions } from "../hooks/useLoanActions";
import type { LoanView } from "../types/loans";
import {
  type LoanPerspective,
  formatLoanAutomationDetail,
  formatLoanDateRange,
  formatLoanPartyLine,
} from "../utils/formatLoan";
import { isClosedLoanStatus } from "../utils/sortLoans";
import { LoanStatusBadge } from "./LoanStatusBadge";

export type LoanRowActions = ReturnType<typeof useLoanActions>;

type LoanRowProps = {
  loan: LoanView;
  perspective: LoanPerspective;
  loanActions?: LoanRowActions;
  className?: string;
};

function renderRowActions(
  loan: LoanView,
  perspective: LoanPerspective,
  loanActions?: LoanRowActions,
) {
  if (!loanActions) {
    return null;
  }
  const { pendingId, approve, decline, markReturned, setTrustedLender } =
    loanActions;
  const isBusy = pendingId === loan._id;

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
          onClick={() => markReturned(loan._id, loan.toolName)}
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
          onClick={() => markReturned(loan._id, loan.toolName)}
        >
          {LOANS_COPY.markReturned}
        </Button>
      );
    }
    return null;
  }

  return (
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
  );
}

export function LoanRow({
  loan,
  perspective,
  loanActions,
  className,
}: LoanRowProps) {
  const partyLine = formatLoanPartyLine(loan, perspective);
  const automationDetail = formatLoanAutomationDetail(loan);
  const isClosed = isClosedLoanStatus(loan.status);
  const isActiveBorrow = loan.status === "approved";
  const duePhrase = isActiveBorrow
    ? formatBorrowDuePhrase(loan.endDate)
    : null;
  const dueUrgency = isActiveBorrow
    ? getBorrowDueUrgency(loan.endDate)
    : null;
  const actions = renderRowActions(loan, perspective, loanActions);

  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-3.5",
        isClosed && "opacity-55",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            LOAN_ROW_TITLE_CLASS,
            isClosed && "text-ink-muted",
          )}
        >
          {loan.toolName}
        </p>

        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-ink-muted">
          <LoanStatusBadge status={loan.status} />
          <span aria-hidden>·</span>
          <span>{partyLine}</span>
          <span aria-hidden>·</span>
          <span>{formatLoanDateRange(loan.startDate, loan.endDate)}</span>
          {duePhrase && dueUrgency ? (
            <>
              <span aria-hidden>·</span>
              <span className={BORROW_DUE_TONE_CLASS[dueUrgency]}>
                {duePhrase}
              </span>
            </>
          ) : null}
        </div>

        {automationDetail ? (
          <p className="mt-1 text-xs text-ink-muted">{automationDetail}</p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
