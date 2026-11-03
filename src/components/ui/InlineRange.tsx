import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type InlineRangeProps = {
  start: ReactNode;
  end: ReactNode;
  /** `dash` for calendar ranges; `to` for party / direction copy. */
  separator?: "dash" | "to";
  className?: string;
};

/** Inline “start … end”: typographic separators only (no icons). */
export function InlineRange({
  start,
  end,
  separator = "dash",
  className,
}: InlineRangeProps) {
  const between =
    separator === "to" ? (
      <span className="shrink-0 text-ink-muted">to</span>
    ) : (
      <span aria-hidden className="shrink-0 text-ink-muted/80">
        –
      </span>
    );

  return (
    <span
      className={cn(
        "inline-flex max-w-full flex-wrap items-center gap-x-1 gap-y-0.5",
        className,
      )}
    >
      <span className="min-w-0 [overflow-wrap:anywhere]">{start}</span>
      {between}
      <span className="min-w-0 [overflow-wrap:anywhere]">{end}</span>
    </span>
  );
}
