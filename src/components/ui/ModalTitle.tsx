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

const clampClass = cn(
  "min-w-0 break-words [overflow-wrap:anywhere] line-clamp-2",
);

/** Modal heading: up to two lines, then ellipsis (full title, including "?"). */
export function ModalTitle({
  id,
  title,
  size = "confirm",
  className,
}: ModalTitleProps) {
  return (
    <h2
      id={id}
      className={cn("min-w-0 font-display text-ink", sizeClasses[size], clampClass, className)}
      title={title}
    >
      {title}
    </h2>
  );
}
