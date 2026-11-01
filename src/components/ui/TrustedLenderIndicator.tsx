import { BadgeCheck, ShieldOff } from "lucide-react";

import { cn } from "@/lib/utils";

import { IconButton } from "./IconButton";
import { Tooltip, type TooltipSide } from "./Tooltip";

const TRUST_ICON_CLASS = "size-4 shrink-0";

const DEFAULT_LABEL = "Trusted lender";

/** Lucide BadgeCheck: first path = badge, second = check mark. */
function FilledTrustedBadgeIcon({ className }: { className?: string }) {
  return (
    <BadgeCheck
      className={cn(
        "size-[1.125rem] shrink-0",
        "[&>path:first-child]:fill-positive [&>path:first-child]:stroke-positive",
        "[&>path:last-child]:fill-none [&>path:last-child]:stroke-surface [&>path:last-child]:stroke-[2.75]",
        className,
      )}
      aria-hidden
    />
  );
}

type TrustedLenderIndicatorProps = {
  className?: string;
  label?: string;
  tooltipSide?: TooltipSide;
};

export function TrustedLenderIndicator({
  className,
  label = DEFAULT_LABEL,
  tooltipSide = "top",
}: TrustedLenderIndicatorProps) {
  return (
    <Tooltip label={label} side={tooltipSide} className={className}>
      <span role="img" className="inline-flex shrink-0 cursor-default" aria-label={label}>
        <FilledTrustedBadgeIcon />
      </span>
    </Tooltip>
  );
}

type LenderTrustToggleIconButtonProps = {
  lenderName: string;
  isTrusted: boolean;
  disabled?: boolean;
  markTrustedLabel: string;
  removeTrustedLabel: string;
  onClick: () => void;
  className?: string;
};

export function LenderTrustToggleIconButton({
  lenderName,
  isTrusted,
  disabled = false,
  markTrustedLabel,
  removeTrustedLabel,
  onClick,
  className,
}: LenderTrustToggleIconButtonProps) {
  const ariaLabel = isTrusted
    ? `${removeTrustedLabel} for ${lenderName}`
    : `${markTrustedLabel} for ${lenderName}`;

  return (
    <IconButton
      type="button"
      variant="ghost"
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        "hover:bg-canvas disabled:pointer-events-none disabled:opacity-40",
        isTrusted && "text-positive hover:text-positive",
        className,
      )}
    >
      {isTrusted ? (
        <ShieldOff className={TRUST_ICON_CLASS} aria-hidden />
      ) : (
        <BadgeCheck className={TRUST_ICON_CLASS} aria-hidden />
      )}
    </IconButton>
  );
}
