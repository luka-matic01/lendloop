import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { buttonClassName, type ButtonVariant } from "./Button";
import { Tooltip } from "./Tooltip";

type IconButtonSize = "sm" | "md";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  "aria-label": string;
  /** Defaults to `aria-label` — shown on hover. */
  tooltip?: string;
  variant?: ButtonVariant;
  size?: IconButtonSize;
};

const iconSizeClasses: Record<IconButtonSize, string> = {
  sm: "size-8 p-0",
  md: "size-10 p-0",
};

export function IconButton({
  children,
  className,
  variant = "ghost",
  size = "sm",
  type = "button",
  tooltip,
  "aria-label": ariaLabel,
  ...props
}: IconButtonProps) {
  const tooltipLabel = tooltip ?? ariaLabel;

  return (
    <Tooltip label={tooltipLabel}>
      <button
        type={type}
        aria-label={ariaLabel}
        className={buttonClassName({
          variant,
          size: "sm",
          className: cn(iconSizeClasses[size], className),
        })}
        {...props}
      >
        {children}
      </button>
    </Tooltip>
  );
}
