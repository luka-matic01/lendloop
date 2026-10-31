import { cn } from "@/lib/utils";

import { LOAN_STATUS_LABELS } from "../constants/copy";
import type { LoanView } from "../types/loans";

const toneClass: Record<LoanView["status"], string> = {
  pending: "text-ink-muted",
  approved: "text-positive",
  declined: "text-negative",
  returned: "text-ink",
};

type LoanStatusBadgeProps = {
  status: LoanView["status"];
  className?: string;
};

export function LoanStatusBadge({ status, className }: LoanStatusBadgeProps) {
  return (
    <span
      className={cn(
        "text-xs font-semibold leading-none",
        toneClass[status],
        className,
      )}
    >
      {LOAN_STATUS_LABELS[status]}
    </span>
  );
}
