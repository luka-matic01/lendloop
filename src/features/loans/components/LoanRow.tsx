import {
  Button,
  LenderTrustToggleIconButton,
  TrustedLenderIndicator,
} from "@/components/ui";
import { cn } from "@/lib/utils";

import { LOANS_COPY } from "../constants/copy";
import {
  LOAN_ROW_ACTIONS_SLOT_CLASS,
  LOAN_ROW_TITLE_CLASS,
} from "../constants/visual";
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

function LoanRowDates({
  startDate,
  endDate,
  className,
}: {
  startDate: string;
  endDate: string;
  className?: string;
}) {
  return (
    <span className={cn("whitespace-nowrap", className)}>
      {formatLoanDateRange(startDate, endDate)}
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
  const actions = renderRowActions(loan, perspective, loanActions);
  const reserveActionSlot = loanActions != null;

  return (
    <div
      className={cn(
        density === "default" ? "py-3 lg:py-3.5" : "py-2.5",
        isClosed && "opacity-70",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-2.5",
          "lg:grid lg:items-center lg:gap-x-5 xl:gap-x-6",
          reserveActionSlot
            ? "lg:grid-cols-[auto_minmax(0,1fr)_auto]"
            : "lg:grid-cols-[auto_minmax(0,1fr)]",
        )}
      >
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

          {perspective === "admin" ? (
            <p className="flex min-w-0 flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 [overflow-wrap:anywhere] leading-snug lg:justify-self-center lg:px-2 lg:text-center">
              <span>
                {loan.borrowerName} → {loan.lenderName}
              </span>
              {loan.lenderIsTrusted ? (
                <TrustedLenderIndicator
                  label={LOANS_COPY.trustedLenderLabel}
                />
              ) : null}
            </p>
          ) : (
            <p className="min-w-0 [overflow-wrap:anywhere] leading-snug lg:justify-self-center lg:px-2 lg:text-center">
              {partyLine}
            </p>
          )}

          <LoanRowDates
            startDate={loan.startDate}
            endDate={loan.endDate}
            className="lg:justify-self-end lg:text-right"
          />
        </div>

        {reserveActionSlot ? (
          <div
            className={cn(
              "flex flex-wrap items-center gap-2",
              perspective === "admin"
                ? "lg:min-w-0 lg:justify-end"
                : LOAN_ROW_ACTIONS_SLOT_CLASS,
            )}
          >
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
