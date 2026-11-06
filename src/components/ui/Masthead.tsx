import { APP_NAME, ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "./Container";
import { MastheadAccount } from "./MastheadAccount";

type MastheadProps = {
  children?: ReactNode;
  nav?: ReactNode;
  className?: string;
};

export function Masthead({ children, nav, className }: MastheadProps) {
  return (
    <header className={cn("w-full bg-board text-on-board", className)}>
      <Container className="flex flex-nowrap items-center justify-between gap-3 py-3 sm:gap-4 sm:py-4">
        <Link
          href={ROUTES.home}
          className="flex min-w-0 items-center gap-2 font-display text-3xl font-extrabold leading-none tracking-tight text-on-board focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-board sm:gap-3 sm:text-4xl"
        >
          <Image
            src="/logo.svg"
            width={36}
            height={36}
            alt=""
            priority
            unoptimized
            className="h-8 w-8 shrink-0 sm:h-9 sm:w-9"
            aria-hidden
          />
          <span className="-mt-px min-w-0 self-center leading-none sm:-mt-0.5">
            {APP_NAME}
          </span>
        </Link>
        <div className="flex min-w-0 flex-1 flex-nowrap items-center justify-end gap-2 sm:gap-4">
          {nav}
          <MastheadAccount />
        </div>
      </Container>
      {children}
      <div className="h-2 bg-accent" aria-hidden="true" />
    </header>
  );
}
