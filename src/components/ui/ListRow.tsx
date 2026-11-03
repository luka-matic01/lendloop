import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Skeleton } from "./Skeleton";

/**
 * Shared list row for “Your listings” and loans.
 *
 * Slots: title, meta, details, footer, optional `corner`, icon `headerActions`,
 * and `actions` (`actionsPlacement`: `"below"` | `"bodyEnd"`).
 *
 * Layout is chosen from props:
 * - **Loan band** — body-end actions, no icon header: actions trail title+meta+details (`sm+` centered).
 * - **Listing aside** — icon header, no `corner`: icons trail the text block (all breakpoints).
 *   If body-end CTAs exist without a `details` row (e.g. reservation only), icons and CTAs
 *   share that trail on `sm+`; below `sm`, title keeps icons and CTAs sit under meta.
 * - **Split** — `corner` and/or icons with body-end actions plus a `details` row: CTAs align with meta/details.
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

  const loanBodyEndBand = bodyEndActions && !corner && !headerActions;

  /** Icons + body CTAs in one trailing column on `sm+` (meta only — no details). */
  const listingAsideWithCtas = Boolean(
    headerActions && !corner && bodyEndActions && !details,
  );

  const listingAside =
    Boolean(headerActions && !corner && (meta || details)) &&
    (!bodyEndActions || listingAsideWithCtas);

  const splitBodyEndActions =
    bodyEndActions &&
    (corner !== undefined || headerActions !== undefined) &&
    !listingAsideWithCtas;

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

  const bodyActionsWrapClass = cn(
    "flex flex-wrap items-center gap-2 pt-1.5 sm:pt-0",
    loanBodyEndBand && "sm:shrink-0 sm:justify-end",
    splitBodyEndActions &&
      "sm:col-start-2 sm:row-start-1 sm:row-span-2 sm:justify-end sm:self-center sm:shrink-0",
  );

  const headerActionsEl = headerActions ? (
    <div className="flex shrink-0 items-center gap-1">{headerActions}</div>
  ) : null;

  const listingAsideTrailEl = listingAsideWithCtas ? (
    <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
      {headerActionsEl}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {actions}
      </div>
    </div>
  ) : (
    headerActionsEl
  );

  const textStack = (opts?: { includeDetails?: boolean }) => (
    <div className={cn("min-w-0 flex-1", stackGap)}>
      {titleEl}
      {metaBlock}
      {opts?.includeDetails !== false && !listingAsideWithCtas
        ? detailsBlock
        : null}
    </div>
  );

  let body: ReactNode;

  if (loanBodyEndBand) {
    body = (
      <div className="flex min-w-0 flex-col gap-y-1.5 sm:flex-row sm:items-center sm:gap-x-3">
        <div className={cn("min-w-0 flex-1", stackGap)}>
          {titleRow}
          {metaBlock}
          {detailsBlock}
        </div>
        <div className={bodyActionsWrapClass}>{actions}</div>
      </div>
    );
  } else if (listingAside) {
    body = listingAsideWithCtas ? (
      <>
        <div className={cn("min-w-0 sm:hidden", stackGap)}>
          {titleRow}
          {metaBlock}
          <div className="flex flex-wrap items-center gap-2 pt-1.5">
            {actions}
          </div>
        </div>
        <div className="hidden min-w-0 items-center gap-x-3 sm:flex">
          {textStack({ includeDetails: false })}
          {listingAsideTrailEl}
        </div>
      </>
    ) : (
      <div className="flex min-w-0 items-center gap-x-3">
        {textStack()}
        {listingAsideTrailEl}
      </div>
    );
  } else {
    body = (
      <div className={cn("min-w-0", stackGap)}>
        {titleRow}

        {splitBodyEndActions ? (
          <div className="grid grid-cols-1 gap-x-3 gap-y-1.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            {metaBlock}
            {detailsBlock}
            <div className={bodyActionsWrapClass}>{actions}</div>
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
    );
  }

  return (
    <div className={cn("w-full min-w-0", padY, className)}>
      {body}

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
