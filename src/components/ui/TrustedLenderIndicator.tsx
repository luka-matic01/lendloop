import { Check } from "lucide-react";

import { Tooltip } from "./Tooltip";

const DEFAULT_LABEL = "Trusted lender";

type TrustedLenderIndicatorProps = {
  className?: string;
  label?: string;
};

export function TrustedLenderIndicator({
  className,
  label = DEFAULT_LABEL,
}: TrustedLenderIndicatorProps) {
  return (
    <Tooltip label={label} className={className}>
      <span
        role="img"
        className="inline-flex size-[1.125rem] shrink-0 items-center justify-center rounded-full bg-positive text-surface"
        aria-label={label}
      >
        <Check className="size-2.5 stroke-[3]" aria-hidden />
      </span>
    </Tooltip>
  );
}
