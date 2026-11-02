import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Skeleton } from "./Skeleton";

/**
 * Shared list row for “Your listings” and loans.
 *
 * ```
 * ┌───────────────────────────────────────────────┐
 * │ title                              [icons]    │  ← row 1: title + optional headerActions
 * │ meta · meta   OR   meta lines      [buttons]  │  ← body: meta / details left, primary CTAs right
 * └───────────────────────────────────────────────┘
 * ```
 *
 * - When `headerActions` is omitted, the whole row is a single 2-column grid:
 *   title + meta + details stack cleanly on the left while `actions` stay pinned
 *   to the right, vertically centered across the entire row.
 * - When `headerActions` is provided alongside `actions` (e.g. a listing with
 *   Edit/Pause/Delete icons AND a "View requests" CTA), the icon cluster stays
 *   locked to the title line while the CTA sits beside the meta/details below.
 */
export const LIST_ROW_TITLE_CLASS =
  "min-w-0 [overflow-wrap:anywhere] font-display text-lg font-bold leading-tight text-ink line-clamp-2 sm:text-xl";

export const LIST_ROW_META_TEXT_CLASS =
  "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-ink-muted";

type ListRowProps = {
  title: ReactNode;
  titleClassName?: string;
  /** Icon cluster pinned top-right on the title line (e.g. Edit / Pause / Delete). */
  headerActions?: ReactNode;
  /** Primary inline meta line under the title (badge · category · condition …). */
  meta?: ReactNode;
  metaClassName?: string;
  /** Optional secondary line under `meta` (loan info, request notice, automation detail). */
  details?: ReactNode;
  /** Action buttons on the right side of the row (Mark returned, Approve/Decline, etc.). */
  actions?: ReactNode;
  density?: "default" | "compact";
  className?: string;
};

export function ListRow({
  title,
  titleClassName,
  headerActions,
  meta,
  metaClassName,
  details,
  actions,
  density = "default",
  className,
}: ListRowProps) {
  const compact = density === "compact";
  const rightSlot = actions ?? headerActions;
  const hasBothSlots = Boolean(headerActions && actions);

  const titleNode = (
    <p
      className={cn(
        LIST_ROW_TITLE_CLASS,
        compact && "text-base sm:text-lg",
        titleClassName,
      )}
    >
      {title}
    </p>
  );

  // Rare case: both top-right icon cluster AND a primary CTA button (e.g. live listing with pending requests)
  if (hasBothSlots) {
    return (
      <div
        className={cn(
          compact ? "space-y-1 py-2.5" : "space-y-1.5 py-3 sm:py-3.5",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-3">
          {titleNode}
          <div className="flex shrink-0 items-center gap-1">{headerActions}</div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className={cn("min-w-0 flex-1", compact ? "space-y-1" : "space-y-1.5")}>
            {meta ? (
              <div className={cn(LIST_ROW_META_TEXT_CLASS, metaClassName)}>
                {meta}
              </div>
            ) : null}
            {details ? <div className="min-w-0">{details}</div> : null}
          </div>
          <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2">
            {actions}
          </div>
        </div>
      </div>
    );
  }

  // Standard row: left stack (title + meta + details) paired with a single right-hand action column
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-2",
        compact ? "py-2.5" : "py-3 sm:py-3.5",
        className,
      )}
    >
      <div
        className={cn(
          "min-w-[12rem] flex-1",
          compact ? "space-y-1" : "space-y-1.5",
        )}
      >
        {titleNode}
        {meta ? (
          <div className={cn(LIST_ROW_META_TEXT_CLASS, metaClassName)}>
            {meta}
          </div>
        ) : null}
        {details ? <div className="min-w-0">{details}</div> : null}
      </div>

      {rightSlot ? (
        <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2">
          {rightSlot}
        </div>
      ) : null}
    </div>
  );
}

/** `·` between inline meta items — keeps separators identical across rows. */
export function ListRowMetaSeparator() {
  return <span aria-hidden>·</span>;
}

type ListRowSkeletonProps = {
  /** Text-button placeholders on the right (loans). */
  actionCount?: 0 | 1 | 2;
  /** Icon-cluster placeholder on the right (listings). */
  iconActions?: boolean;
  density?: "default" | "compact";
};

/** Skeleton twin of {@link ListRow} — same structure, so loading never shifts layout. */
export function ListRowSkeleton({
  actionCount = 0,
  iconActions = false,
  density = "default",
}: ListRowSkeletonProps) {
  return (
    <ListRow
      density={density}
      title={<Skeleton className="h-6 w-2/5 sm:h-7" />}
      headerActions={
        iconActions ? <Skeleton className="h-8 w-[6.75rem]" /> : undefined
      }
      meta={<Skeleton className="h-3.5 w-64 max-w-full" />}
      actions={
        actionCount > 0 ? (
          <>
            <Skeleton className="h-8 w-[5.25rem]" />
            {actionCount > 1 ? <Skeleton className="h-8 w-[5.25rem]" /> : null}
          </>
        ) : undefined
      }
    />
  );
}
