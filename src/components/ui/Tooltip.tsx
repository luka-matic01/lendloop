import { cn } from "@/lib/utils";
import type { ReactElement } from "react";

export type TooltipSide = "top" | "bottom";
export type TooltipAlign = "center" | "end";

type TooltipProps = {
  label: string;
  children: ReactElement;
  side?: TooltipSide;
  align?: TooltipAlign;
  className?: string;
};

/** Hover label for icon-only controls — keep `label` in sync with control `aria-label`. */
export function Tooltip({
  label,
  children,
  side = "top",
  align = "center",
  className,
}: TooltipProps) {
  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-30 whitespace-nowrap",
          side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
          align === "center" ? "left-1/2 -translate-x-1/2" : "right-0",
          "rounded-control border border-line-strong bg-surface px-2 py-1 text-xs font-semibold text-ink shadow-none",
          "opacity-0 transition-opacity duration-150",
          "group-hover/tooltip:opacity-100",
          "group-focus-within/tooltip:opacity-100",
          "group-has-[:disabled]/tooltip:opacity-0",
        )}
      >
        {label}
      </span>
    </span>
  );
}
