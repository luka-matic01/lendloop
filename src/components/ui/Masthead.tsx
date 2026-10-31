import { APP_NAME, ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "./Container";
import { MastheadAccount } from "./MastheadAccount";

type MastheadProps = {
  children?: ReactNode;
  className?: string;
};

export function Masthead({ children, className }: MastheadProps) {
  return (
    <header className={cn("w-full bg-board text-on-board", className)}>
      <Container className="flex flex-nowrap items-center justify-between gap-3 py-3 sm:gap-4 sm:py-4">
        <Link
          href={ROUTES.home}
          className="min-w-0 font-display text-3xl font-extrabold leading-none tracking-tight text-on-board focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-board sm:text-4xl"
        >
          {APP_NAME}
        </Link>
        <div className="flex shrink-0 flex-nowrap items-center justify-end">
          <MastheadAccount />
        </div>
      </Container>
      {children}
      <div className="h-2 bg-accent" aria-hidden="true" />
    </header>
  );
}
