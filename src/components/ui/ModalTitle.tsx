import { cn } from "@/lib/utils";

export type ModalTitleSize = "confirm" | "form";

type ModalTitleProps = {
  id?: string;
  title: string;
  size?: ModalTitleSize;
  className?: string;
};

const sizeClasses: Record<ModalTitleSize, string> = {
  confirm: "text-2xl font-bold leading-snug",
  form: "text-2xl sm:text-3xl font-extrabold leading-tight",
};

const wordBreakClass = "min-w-0 break-words [overflow-wrap:anywhere]";

/** Two-line clamp on a block (plain titles). */
const blockClampClass = cn(wordBreakClass, "line-clamp-2");

/**
 * Two-line clamp that stays inline so a trailing "?" flows after the text
 * (including "…?" when clamped).
 */
const inlineClampClass = cn(
  wordBreakClass,
  "max-w-full align-baseline overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-inline-box]",
);

/**
 * Modal heading — up to two lines, then ellipsis. For titles ending in "?",
 * the mark stays inline after the text (e.g. "back?" or a clamped "…?").
 */
export function ModalTitle({
  id,
  title,
  size = "confirm",
  className,
}: ModalTitleProps) {
  const base = cn("min-w-0 font-display text-ink", sizeClasses[size], className);
  const hasQuestion = title.endsWith("?");
  const body = hasQuestion ? title.slice(0, -1) : title;

  if (hasQuestion) {
    return (
      <h2 id={id} className={cn(base, "min-w-0")} title={title}>
        <span className={inlineClampClass}>{body}</span>?
      </h2>
    );
  }

  return (
    <h2 id={id} className={cn(base, blockClampClass)} title={title}>
      {title}
    </h2>
  );
}
