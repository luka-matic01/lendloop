import { cn } from "@/lib/utils";
import type { ReactElement } from "react";

type TooltipProps = {
  label: string;
  children: ReactElement;
  className?: string;
};

/** Hover label for icon-only controls — keep `label` in sync with control `aria-label`. */
export function Tooltip({ label, children, className }: TooltipProps) {
  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap",
          "rounded-control border border-line bg-surface px-2 py-1 text-xs font-semibold text-ink shadow-none",
          "opacity-0 transition-opacity duration-150",
          "group-hover/tooltip:opacity-100",
          "group-has-[:disabled]/tooltip:opacity-0",
        )}
      >
        {label}
      </span>
    </span>
  );
}
