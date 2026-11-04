import type { ReactNode } from "react";

import { Button, PageSection } from "@/components/ui";

export type ToolsSectionLoadMore = {
  canLoadMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  label: string;
  loadingLabel: string;
  className?: string;
};

type ToolsSectionProps = {
  headingId: string;
  heading: string;
  busy?: boolean;
  toolbar?: ReactNode;
  isLoading: boolean;
  loading: ReactNode;
  isEmpty: boolean;
  empty: ReactNode;
  loadMore?: ToolsSectionLoadMore;
  children: ReactNode;
};

/** Tools page section shell — same role as `LoanSection`, with paginated load-more. */
export function ToolsSection({
  headingId,
  heading,
  busy = false,
  toolbar,
  isLoading,
  loading,
  isEmpty,
  empty,
  loadMore,
  children,
}: ToolsSectionProps) {
  return (
    <PageSection
      headingId={headingId}
      title={heading}
      busy={busy}
      toolbar={toolbar}
    >
      {isLoading ? (
        loading
      ) : isEmpty ? (
        empty
      ) : (
        <>
          {children}
          {loadMore?.canLoadMore ? (
            <div
              className={
                loadMore.className ?? "flex justify-center pt-2"
              }
            >
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={loadMore.loadingMore}
                onClick={loadMore.onLoadMore}
              >
                {loadMore.loadingMore
                  ? loadMore.loadingLabel
                  : loadMore.label}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </PageSection>
  );
}
