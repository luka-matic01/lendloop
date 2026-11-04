import type { ReactNode } from "react";

import { PageSection, Panel, Skeleton } from "@/components/ui";

import { LoanListSkeleton } from "./LoanRowSkeleton";

type LoanSectionProps = {
  headingId: string;
  heading: string;
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
  isLoading,
  itemCount,
  emptyMessage,
  skeletonLabel,
  skeletonActionCount = 0,
  skeletonRowCount = 2,
  children,
}: LoanSectionProps) {
  const titleSuffix = isLoading ? (
    <Skeleton className="ml-2 inline-block h-5 w-8 align-middle" />
  ) : itemCount > 0 ? (
    <span className="ml-2 text-lg font-semibold text-ink-muted">
      ({itemCount})
    </span>
  ) : null;

  return (
    <PageSection
      headingId={headingId}
      title={heading}
      titleSuffix={titleSuffix}
      busy={isLoading}
    >
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
    </PageSection>
  );
}
