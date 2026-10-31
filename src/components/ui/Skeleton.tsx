import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

/** Inert placeholder bar. Pulse timing comes from an ancestor `--skeleton-delay`. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("ll-skeleton block rounded-control bg-skeleton", className)}
    />
  );
}
