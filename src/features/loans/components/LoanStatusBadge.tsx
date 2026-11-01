import { Check, Clock, Handshake, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { LOAN_STATUS_LABELS } from "../constants/copy";
import type { LoanView } from "../types/loans";

const statusConfig: Record<
  LoanView["status"],
  { tone: string; Icon: typeof Clock }
> = {
  pending: { tone: "text-warning", Icon: Clock },
  approved: { tone: "text-positive", Icon: Handshake },
  declined: { tone: "text-negative", Icon: X },
  returned: { tone: "text-ink-muted", Icon: Check },
};

type LoanStatusBadgeProps = {
  status: LoanView["status"];
  className?: string;
};

export function LoanStatusBadge({ status, className }: LoanStatusBadgeProps) {
  const { tone, Icon } = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 text-xs font-semibold leading-none",
        tone,
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {LOAN_STATUS_LABELS[status]}
    </span>
  );
}
