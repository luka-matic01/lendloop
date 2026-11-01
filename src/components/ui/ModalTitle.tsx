import { cn } from "@/lib/utils";

type ModalTitleSize = "confirm" | "form";

type ModalTitleProps = {
  id?: string;
  title: string;
  size?: ModalTitleSize;
  className?: string;
};

const sizeClasses: Record<ModalTitleSize, string> = {
  confirm: "text-2xl font-bold leading-snug",
  form: "text-3xl font-extrabold leading-tight",
};

/**
 * Modal heading with ellipsis for long tool names. Trailing "?" stays visible
 * (e.g. "Remove Very long name…?" not "Remove Very long name…").
 */
export function ModalTitle({
  id,
  title,
  size = "confirm",
  className,
}: ModalTitleProps) {
  const base = cn("min-w-0 font-display text-ink", sizeClasses[size], className);

  if (title.endsWith("?")) {
    return (
      <h2 id={id} className={cn(base, "flex items-baseline")} title={title}>
        <span className="min-w-0 truncate">{title.slice(0, -1)}</span>
        <span className="shrink-0">?</span>
      </h2>
    );
  }

  return (
    <h2 id={id} className={cn(base, "truncate")} title={title}>
      {title}
    </h2>
  );
}
