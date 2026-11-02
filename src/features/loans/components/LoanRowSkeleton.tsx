import { ListRowSkeleton } from "@/components/ui";

import { LoanListPanel } from "./LoanListPanel";

type LoanRowSkeletonProps = {
  /** Placeholder count for action buttons on the row. */
  actionCount?: 0 | 1 | 2;
};

/** Matches {@link LoanRow} — shared `ListRow` grid (title/meta left, actions right). */
export function LoanRowSkeleton({ actionCount = 0 }: LoanRowSkeletonProps) {
  return <ListRowSkeleton actionCount={actionCount} />;
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
