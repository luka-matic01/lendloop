import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { formatLoanAutomationDetail, formatLoanDateRange } from "../utils/formatLoan";
import { isClosedLoanStatus } from "../utils/sortLoans";
import type { LoanView } from "../types/loans";
import { LOAN_ROW_TITLE_CLASS } from "../constants/visual";
import { LoanStatusBadge } from "./LoanStatusBadge";

type LoanRowProps = {
  loan: LoanView;
  /** Counterparty or route shown on the meta line (section provides context). */
  partyLine: string;
  actions?: ReactNode;
  className?: string;
};

export function LoanRow({
  loan,
  partyLine,
  actions,
  className,
}: LoanRowProps) {
  const automationDetail = formatLoanAutomationDetail(loan);
  const isClosed = isClosedLoanStatus(loan.status);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4 sm:py-3.5",
        actions && "sm:justify-between",
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
        <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
          <p className="min-w-0 text-xs font-semibold text-ink-muted">
            {partyLine}
            <span aria-hidden> · </span>
            {formatLoanDateRange(loan.startDate, loan.endDate)}
          </p>
          <LoanStatusBadge status={loan.status} />
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
