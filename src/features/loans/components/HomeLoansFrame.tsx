import type { ReactNode } from "react";

import { Container } from "@/components/ui";
import { SECTION_Y_CLASS } from "@/constants";
import { cn } from "@/lib/utils";

import { LOANS_COPY } from "../constants/copy";

type HomeLoansFrameProps = {
  description: string;
  children: ReactNode;
  busy?: boolean;
};

export function HomeLoansFrame({
  description,
  children,
  busy = false,
}: HomeLoansFrameProps) {
  return (
    <section
      aria-labelledby="home-loans-heading"
      aria-busy={busy || undefined}
      className="border-t border-line"
    >
      <Container
        className={cn(SECTION_Y_CLASS, "space-y-4 sm:space-y-6")}
      >
        <div>
          <h2
            id="home-loans-heading"
            className="font-display text-3xl font-extrabold leading-none text-ink sm:text-4xl"
          >
            {LOANS_COPY.homeLoansTitle}
          </h2>
          <p className="mt-1.5 max-w-xl text-sm text-ink-muted sm:mt-2 sm:text-base">
            {description}
          </p>
        </div>
        {children}
      </Container>
    </section>
  );
}
