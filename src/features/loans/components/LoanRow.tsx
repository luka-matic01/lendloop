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
  density?: "default" | "compact";
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
  const { pendingId, approve, decline, requestMarkReturned, setTrustedLender } =
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
          onClick={() =>
            requestMarkReturned(loan._id, loan.toolName, "incoming")
          }
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

function LoanRowDates({
  startDate,
  endDate,
  duePhrase,
  dueUrgency,
  className,
}: {
  startDate: string;
  endDate: string;
  duePhrase: string | null;
  dueUrgency: ReturnType<typeof getBorrowDueUrgency> | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-0.5",
        className,
      )}
    >
      <span className="whitespace-nowrap">
        {formatLoanDateRange(startDate, endDate)}
      </span>
      {duePhrase && dueUrgency ? (
        <span className={BORROW_DUE_TONE_CLASS[dueUrgency]}>{duePhrase}</span>
      ) : null}
    </span>
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
        density === "default" ? "py-3 lg:py-3.5" : "py-2.5",
        isClosed && "opacity-70",
        className,
      )}
    >
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between lg:gap-5">
        <p
          className={cn(
            LOAN_ROW_TITLE_CLASS,
            density === "compact" && "text-base sm:text-lg",
            isClosed && "text-ink-muted",
            "min-w-0 lg:w-40 lg:shrink-0 lg:truncate xl:w-44",
          )}
        >
          {loan.toolName}
        </p>

        <div
          className={cn(
            "flex w-full min-w-0 flex-1 flex-col gap-1.5 text-xs font-semibold text-ink-muted",
            "lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-x-5 lg:gap-y-0 xl:gap-x-6",
          )}
        >
          <LoanStatusBadge status={loan.status} perspective={perspective} />

          <p className="min-w-0 [overflow-wrap:anywhere] leading-snug lg:px-2 lg:text-center">
            {partyLine}
          </p>

          <LoanRowDates
            startDate={loan.startDate}
            endDate={loan.endDate}
            duePhrase={duePhrase}
            dueUrgency={dueUrgency}
            className="lg:justify-self-end lg:text-right"
          />
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-2 lg:shrink-0 lg:justify-end">
            {actions}
          </div>
        ) : null}
      </div>

      {automationDetail && density === "default" ? (
        <p className="mt-2 text-xs text-ink-muted">{automationDetail}</p>
      ) : null}
    </div>
  );
}
