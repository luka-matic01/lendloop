import { AlertTriangle, Check, Clock, Handshake, X } from "lucide-react";

import { getBorrowDueUrgency, isBorrowPeriodStarted } from "@/lib/formatBorrowDue";
import { cn } from "@/lib/utils";

import {
  type LoanStatusPerspective,
  loanStatusLabel,
} from "../constants/copy";
import type { LoanView } from "../types/loans";

const statusConfig: Record<
  LoanView["status"],
  { tone: string; Icon: typeof Clock }
> = {
  pending: { tone: "text-warning", Icon: Clock },
  approved: { tone: "text-positive", Icon: Handshake },
  declined: { tone: "text-negative", Icon: X },
  cancelled: { tone: "text-ink-muted", Icon: X },
  returned: { tone: "text-ink-muted", Icon: Check },
};

type LoanStatusBadgeProps = {
  status: LoanView["status"];
  perspective: LoanStatusPerspective;
  startDate?: string;
  endDate?: string;
  className?: string;
};

export function LoanStatusBadge({
  status,
  perspective,
  startDate,
  endDate,
  className,
}: LoanStatusBadgeProps) {
  const borrowDates =
    startDate !== undefined && endDate !== undefined
      ? { startDate, endDate }
      : undefined;
  const isOverdue =
    status === "approved" &&
    borrowDates !== undefined &&
    isBorrowPeriodStarted(borrowDates.startDate) &&
    getBorrowDueUrgency(borrowDates.endDate) === "overdue";
  const { tone, Icon } = isOverdue
    ? { tone: "text-negative", Icon: AlertTriangle }
    : statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 text-xs font-semibold leading-none",
        tone,
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {loanStatusLabel(status, perspective, borrowDates)}
    </span>
  );
}
