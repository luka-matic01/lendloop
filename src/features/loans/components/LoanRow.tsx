import type { ReactNode } from "react";

import {
  Button,
  LIST_ROW_META_TEXT_CLASS,
  InlineRange,
  ListRow,
  ListRowMetaSeparator,
} from "@/components/ui";
import {
  LenderTrustToggleIconButton,
  TrustedLenderIndicator,
} from "@/features/trust";
import { cn } from "@/lib/utils";

import { LOANS_COPY } from "../constants/copy";
import type { useLoanActions } from "../hooks/useLoanActions";
import type { LoanView } from "../types/loans";
import { approvedLoanRowAction } from "../utils/approvedLoanAction";
import { getLoanActivityFootnotes } from "../utils/loanActivityFootnotes";
import { type LoanPerspective, formatLoanPartyLine } from "../utils/formatLoan";
import { isClosedLoanStatus } from "../utils/sortLoans";
import { BorrowDateRange } from "./BorrowDateRange";
import { LoanActivityFootnotes } from "./LoanAutomationFootnote";
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
    approve,
    decline,
    requestMarkReturned,
    requestCancelBorrow,
  } = loanActions;
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
      const action = approvedLoanRowAction(loan.status, loan.startDate);
      if (action === "cancel") {
        return (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={isBusy}
            onClick={() => requestCancelBorrow(loan._id, loan.toolName)}
          >
            {LOANS_COPY.cancelBorrow}
          </Button>
        );
      }
      if (action === "markReturned") {
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
    }
    return null;
  }

  if (perspective === "mine") {
    if (loan.status === "pending") {
      return (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={isBusy}
          onClick={() =>
            requestCancelBorrow(loan._id, loan.toolName, "pending")
          }
        >
          {LOANS_COPY.cancelRequest}
        </Button>
      );
    }
    if (loan.status === "approved") {
      const action = approvedLoanRowAction(loan.status, loan.startDate);
      if (action === "cancel") {
        return (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={isBusy}
            onClick={() => requestCancelBorrow(loan._id, loan.toolName)}
          >
            {LOANS_COPY.cancelBorrow}
          </Button>
        );
      }
      if (action === "markReturned") {
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
    }
    return null;
  }

  return null;
}

export function LoanRow({
  loan,
  perspective,
  loanActions,
  density = "default",
  className,
}: LoanRowProps) {
  const partyLine = formatLoanPartyLine(loan, perspective);
  const activityFootnotes = getLoanActivityFootnotes(loan, perspective);
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
          <LoanStatusBadge
            status={loan.status}
            perspective={perspective}
            startDate={loan.startDate}
            endDate={loan.endDate}
          />
          <ListRowMetaSeparator />
          <BorrowDateRange
            startDate={loan.startDate}
            endDate={loan.endDate}
          />
        </>
      }
      corner={
        density === "default" && activityFootnotes.length > 0 ? (
          <LoanActivityFootnotes footnotes={activityFootnotes} />
        ) : undefined
      }
      details={
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
              {loanActions && !isClosed ? (
                <LenderTrustToggleIconButton
                  lenderName={loan.lenderName}
                  isTrusted={loan.lenderIsTrusted}
                  disabled={
                    loanActions.pendingTrustedUserId === loan.lenderId
                  }
                  markTrustedLabel={LOANS_COPY.markTrusted}
                  removeTrustedLabel={LOANS_COPY.removeTrusted}
                  className="-my-1.5 align-middle"
                  onClick={() =>
                    loanActions.requestTrustedLenderChange(
                      loan.lenderId,
                      loan.lenderName,
                      !loan.lenderIsTrusted,
                    )
                  }
                />
              ) : null}
            </span>
          ) : (
            <span className="min-w-0 [overflow-wrap:anywhere] leading-snug">
              {partyLine}
            </span>
          )}
        </p>
      }
      actions={actions ?? undefined}
      actionsPlacement="bodyEnd"
    />
  );
}
