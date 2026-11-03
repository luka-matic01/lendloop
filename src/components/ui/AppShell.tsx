import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  className?: string;
};

/** Full-viewport page column: always `w-full` so inner `Container` centers correctly. */
export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className={cn("flex min-h-screen w-full flex-col", className)}>
      {children}
    </div>
  );
}
