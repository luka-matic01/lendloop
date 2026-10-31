import { Skeleton } from "@/components/ui";

import { LoanListPanel } from "./LoanListPanel";

type LoanRowSkeletonProps = {
  /** Placeholder width for action buttons on the row. */
  actionCount?: 0 | 1 | 2;
};

/** Matches {@link LoanRow} title, meta line, badge, and optional actions. */
export function LoanRowSkeleton({ actionCount = 0 }: LoanRowSkeletonProps) {
  return (
    <div
      className={
        actionCount > 0
          ? "flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-4"
          : "flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:py-4"
      }
      aria-hidden
    >
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-6 w-2/5 sm:h-7" />
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <Skeleton className="h-3 w-56 max-w-full" />
          <Skeleton className="h-5 w-[4.5rem] shrink-0" />
        </div>
      </div>
      {actionCount > 0 ? (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <Skeleton className="h-8 w-[5.25rem]" />
          {actionCount > 1 ? (
            <Skeleton className="h-8 w-[5.25rem]" />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

type LoanListSkeletonProps = {
  count?: number;
  actionCount?: 0 | 1 | 2;
  label?: string;
};

export function LoanListSkeleton({
  count = 2,
  actionCount = 0,
  label = "Loading loans",
}: LoanListSkeletonProps) {
  return (
    <>
      <p className="sr-only">{label}</p>
      <LoanListPanel>
        {Array.from({ length: count }, (_, index) => (
          <li key={index}>
            <LoanRowSkeleton actionCount={actionCount} />
          </li>
        ))}
      </LoanListPanel>
    </>
  );
}
