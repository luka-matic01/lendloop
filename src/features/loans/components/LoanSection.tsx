import type { ReactNode } from "react";

import { Panel, Skeleton } from "@/components/ui";

import { LoanListSkeleton } from "./LoanRowSkeleton";

type LoanSectionProps = {
  headingId: string;
  heading: string;
  summary?: string;
  isLoading: boolean;
  itemCount: number;
  emptyMessage: string;
  skeletonLabel: string;
  skeletonActionCount?: 0 | 1 | 2;
  skeletonRowCount?: number;
  children?: ReactNode;
};

export function LoanSection({
  headingId,
  heading,
  summary,
  isLoading,
  itemCount,
  emptyMessage,
  skeletonLabel,
  skeletonActionCount = 0,
  skeletonRowCount = 2,
  children,
}: LoanSectionProps) {
  return (
    <section
      aria-labelledby={headingId}
      aria-busy={isLoading || undefined}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <h2
          id={headingId}
          className="font-display text-2xl font-bold leading-none text-ink"
        >
          {heading}
          {isLoading ? (
            <Skeleton className="ml-2 inline-block h-5 w-8 align-middle" />
          ) : itemCount > 0 ? (
            <span className="ml-2 text-lg font-semibold text-ink-muted">
              ({itemCount})
            </span>
          ) : null}
        </h2>
        {!isLoading && summary ? (
          <p className="text-sm text-ink-muted">{summary}</p>
        ) : null}
      </div>

      {isLoading ? (
        <LoanListSkeleton
          count={skeletonRowCount}
          actionCount={skeletonActionCount}
          label={skeletonLabel}
        />
      ) : itemCount === 0 ? (
        <Panel>
          <p className="text-sm text-ink-muted">{emptyMessage}</p>
        </Panel>
      ) : (
        children
      )}
    </section>
  );
}
