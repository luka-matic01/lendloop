import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

type PanelProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  tone?: "default" | "notice" | "success";
};

const toneClasses = {
  default: "border-ink bg-surface",
  notice: "border-negative bg-negative-soft",
  success: "border-positive bg-positive-soft",
} as const;

export function Panel({
  children,
  className,
  tone = "default",
  ...props
}: PanelProps) {
  return (
    <section
      className={cn(
        "rounded-panel border p-panel",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}
