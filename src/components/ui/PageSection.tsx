import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type PageSectionProps = {
  headingId: string;
  title: string;
  titleSuffix?: ReactNode;
  busy?: boolean;
  className?: string;
  /** Renders under the title (filters, tabs, …) in every section state. */
  toolbar?: ReactNode;
  children: ReactNode;
};

/** Shared app-page section chrome (Tools, Loans, …). */
export function PageSection({
  headingId,
  title,
  titleSuffix,
  busy = false,
  className,
  toolbar,
  children,
}: PageSectionProps) {
  return (
    <section
      aria-labelledby={headingId}
      aria-busy={busy || undefined}
      className={cn("space-y-4", className)}
    >
      <div className="space-y-1.5">
        <h2
          id={headingId}
          className="font-display text-2xl font-bold leading-none text-ink"
        >
          {title}
          {titleSuffix}
        </h2>
        {toolbar ? <div className="pt-0.5">{toolbar}</div> : null}
      </div>
      {children}
    </section>
  );
}
