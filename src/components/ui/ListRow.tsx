import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Skeleton } from "./Skeleton";

/**
 * Shared list row for “Your listings” and loans.
 *
 * Title line (optional `corner` or `headerActions` on the same line), then meta
 * and details. With `actionsPlacement="bodyEnd"`, actions sit under meta on
 * small screens and sit to the right of meta+details on `sm+`, vertically
 * centered with that block. When the title row has `headerActions` or `corner`,
 * body actions never share a row with the title — only with meta+details.
 * Icon-only `headerActions` with meta/details but no body-end actions sit in a
 * trailing column, vertically centered with the title+meta+details block.
 * `"below"` keeps actions under details at all breakpoints. Optional `footer`.
 */
export const LIST_ROW_TITLE_CLASS =
  "min-w-0 [overflow-wrap:anywhere] font-display text-lg font-bold leading-tight text-ink line-clamp-2 sm:text-xl";

export const LIST_ROW_META_TEXT_CLASS =
  "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-ink-muted";

/** Full-width last row — due phrases, notices. */
export const LIST_ROW_FOOTER_CLASS =
  "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium leading-snug text-ink-muted";

type ListRowProps = {
  title: ReactNode;
  titleClassName?: string;
  headerActions?: ReactNode;
  meta?: ReactNode;
  metaClassName?: string;
  details?: ReactNode;
  footer?: ReactNode;
  /** Trailing slot on the title row (e.g. relative activity time). */
  corner?: ReactNode;
  actions?: ReactNode;
  /** `"bodyEnd"` — loan-style: meta+details left, actions right from `sm` up. */
  actionsPlacement?: "below" | "bodyEnd";
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
  footer,
  corner,
  actions,
  actionsPlacement = "below",
  density = "default",
  className,
}: ListRowProps) {
  const compact = density === "compact";
  const stackGap = compact ? "space-y-1" : "space-y-1.5";
  const padY = compact ? "py-2.5" : "py-3 sm:py-3.5";

  const titleEl = (
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

  const titleRow =
    headerActions && corner ? (
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">{titleEl}</div>
        <div className="flex max-w-[45%] shrink-0 flex-col items-end gap-1">
          <div className="text-right">{corner}</div>
          <div className="flex items-center gap-1">{headerActions}</div>
        </div>
      </div>
    ) : headerActions ? (
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">{titleEl}</div>
        <div className="flex shrink-0 items-center gap-1">{headerActions}</div>
      </div>
    ) : corner ? (
      <div className="flex items-baseline justify-between gap-x-3 gap-y-1">
        <div className="min-w-0 flex-1">{titleEl}</div>
        <div className="max-w-[45%] shrink-0 text-right">{corner}</div>
      </div>
    ) : (
      titleEl
    );

  const bodyEndActions =
    actions && actionsPlacement === "bodyEnd" && (meta || details);
  /** Title-only row: meta+details and actions share one horizontal band (loans). */
  const centerBodyEndActions =
    bodyEndActions && !corner && !headerActions;
  /** Icon actions centered with full text block (e.g. listing row without CTAs). */
  const asideHeaderActions =
    headerActions &&
    !corner &&
    (meta || details) &&
    !bodyEndActions;
  /** Title already has corner and/or icon actions — actions pair with meta only. */
  const splitBodyEndActions =
    bodyEndActions && (corner !== undefined || headerActions !== undefined);

  const metaBlock = meta ? (
    <div
      className={cn(
        LIST_ROW_META_TEXT_CLASS,
        metaClassName,
        splitBodyEndActions && "min-w-0 sm:col-start-1 sm:row-start-1",
      )}
    >
      {meta}
    </div>
  ) : null;

  const detailsBlock = details ? (
    <div
      className={cn(
        "min-w-0",
        splitBodyEndActions && "sm:col-start-1 sm:row-start-2",
      )}
    >
      {details}
    </div>
  ) : null;

  const actionsWrapClass = cn(
    "flex flex-wrap items-center gap-2 pt-1.5 sm:pt-0",
    centerBodyEndActions && "sm:shrink-0 sm:justify-end",
    splitBodyEndActions &&
      "sm:col-start-2 sm:row-start-1 sm:row-span-2 sm:justify-end sm:self-center sm:shrink-0",
  );

  const headerActionsEl = headerActions ? (
    <div className="flex shrink-0 items-center gap-1">{headerActions}</div>
  ) : null;

  return (
    <div className={cn("w-full min-w-0", padY, className)}>
      {centerBodyEndActions ? (
        <div className="flex min-w-0 flex-col gap-y-1.5 sm:flex-row sm:items-center sm:gap-x-3">
          <div className={cn("min-w-0 flex-1", stackGap)}>
            {titleRow}
            {metaBlock}
            {detailsBlock}
          </div>
          <div className={actionsWrapClass}>{actions}</div>
        </div>
      ) : asideHeaderActions ? (
        <div className="flex min-w-0 items-center gap-x-3">
          <div className={cn("min-w-0 flex-1", stackGap)}>
            {titleEl}
            {metaBlock}
            {detailsBlock}
          </div>
          {headerActionsEl}
        </div>
      ) : (
        <div className={cn("min-w-0", stackGap)}>
          {titleRow}

          {splitBodyEndActions ? (
            <div className="grid grid-cols-1 gap-x-3 gap-y-1.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              {metaBlock}
              {detailsBlock}
              <div className={actionsWrapClass}>{actions}</div>
            </div>
          ) : (
            <>
              {metaBlock}
              {detailsBlock}
              {actions && actionsPlacement === "below" ? (
                <div className="flex flex-wrap items-center gap-2 pt-1.5 sm:pt-2">
                  {actions}
                </div>
              ) : null}
            </>
          )}
        </div>
      )}

      {footer ? (
        <div className={cn(compact ? "mt-2" : "mt-2 sm:mt-2.5")}>{footer}</div>
      ) : null}
    </div>
  );
}

export function ListRowMetaSeparator() {
  return <span aria-hidden>·</span>;
}

type ListRowSkeletonProps = {
  actionCount?: 0 | 1 | 2;
  iconActions?: boolean;
  actionsPlacement?: "below" | "bodyEnd";
  density?: "default" | "compact";
};

export function ListRowSkeleton({
  actionCount = 0,
  iconActions = false,
  actionsPlacement = "below",
  density = "default",
}: ListRowSkeletonProps) {
  const actionSkeletons =
    actionCount > 0 ? (
      <>
        <Skeleton className="h-8 w-[5.25rem]" />
        {actionCount > 1 ? <Skeleton className="h-8 w-[5.25rem]" /> : null}
      </>
    ) : undefined;

  return (
    <ListRow
      density={density}
      title={<Skeleton className="h-6 w-2/5 sm:h-7" />}
      headerActions={
        iconActions ? <Skeleton className="h-8 w-[6.75rem]" /> : undefined
      }
      meta={<Skeleton className="h-3.5 w-64 max-w-full" />}
      actions={actionSkeletons}
      actionsPlacement={actionsPlacement}
    />
  );
}
