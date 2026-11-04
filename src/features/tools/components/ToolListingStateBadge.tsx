import { CalendarClock, Handshake, Pause, Radio } from "lucide-react";

import { cn } from "@/lib/utils";

import { TOOLS_COPY } from "../constants/copy";
import { TOOLS_ICON_CLASS } from "../constants/visual";
import type { ToolListingState } from "../types/listingState";

type ToolListingStateBadgeProps = {
  state: ToolListingState;
  /** List rows: icon only; label stays for screen readers */
  iconOnly?: boolean;
};

/** Owner listing state (loans feature uses the same pattern as `LoanStatusBadge`). */
export function ToolListingStateBadge({
  state,
  iconOnly = false,
}: ToolListingStateBadgeProps) {
  if (state === "on_board") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center leading-none text-positive",
          !iconOnly && "gap-1 text-xs font-semibold",
        )}
      >
        <Radio className={cn(TOOLS_ICON_CLASS, "size-3.5")} aria-hidden />
        {iconOnly ? (
          <span className="sr-only">On board</span>
        ) : (
          "On board"
        )}
      </span>
    );
  }

  if (state === "on_loan") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center leading-none text-positive",
          !iconOnly && "gap-1 text-xs font-semibold",
        )}
      >
        <Handshake className={cn(TOOLS_ICON_CLASS, "size-3.5")} aria-hidden />
        {iconOnly ? (
          <span className="sr-only">{TOOLS_COPY.listingOutOnLoan}</span>
        ) : (
          TOOLS_COPY.listingOutOnLoan
        )}
      </span>
    );
  }

  if (state === "reserved") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center leading-none text-warning",
          !iconOnly && "gap-1 text-xs font-semibold",
        )}
      >
        <CalendarClock
          className={cn(TOOLS_ICON_CLASS, "size-3.5")}
          aria-hidden
        />
        {iconOnly ? (
          <span className="sr-only">{TOOLS_COPY.listingReserved}</span>
        ) : (
          TOOLS_COPY.listingReserved
        )}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center leading-none text-ink-faint",
        !iconOnly && "gap-1 text-xs font-semibold",
      )}
    >
      <Pause className={cn(TOOLS_ICON_CLASS, "size-3.5")} aria-hidden />
      {iconOnly ? <span className="sr-only">Paused</span> : "Paused"}
    </span>
  );
}
