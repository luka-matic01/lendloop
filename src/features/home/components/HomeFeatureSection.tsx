import type { ReactNode } from "react";

import { Container } from "@/components/ui";
import { SECTION_Y_CLASS } from "@/constants";
import { cn } from "@/lib/utils";

type HomeFeatureSectionProps = {
  headingId: string;
  title: string;
  /** Static subtitle; omit only when copy depends on auth/data (e.g. public board skeleton). */
  description?: string;
  children: ReactNode;
  busy?: boolean;
  /** Second block on the home page (e.g. loans below tools). */
  borderTop?: boolean;
};

/** Matches loaded subtitle typography so the block below does not shift. */
const descriptionClassName =
  "mt-1.5 max-w-xl text-sm leading-normal text-ink-muted sm:mt-2 sm:text-base";

export function HomeFeatureSection({
  headingId,
  title,
  description,
  children,
  busy = false,
  borderTop = false,
}: HomeFeatureSectionProps) {
  return (
    <section
      aria-labelledby={headingId}
      aria-busy={busy || undefined}
      className={cn(borderTop && "border-t border-line")}
    >
      <Container
        className={cn(SECTION_Y_CLASS, "space-y-4")}
      >
        <div>
          <h2
            id={headingId}
            className="font-display text-3xl font-extrabold leading-none text-ink sm:text-4xl"
          >
            {title}
          </h2>
          {description ? (
            <p className={cn(descriptionClassName, "min-h-[2lh]")}>
              {description}
            </p>
          ) : busy ? (
            <div
              className={cn(descriptionClassName, "min-h-[2lh]")}
              aria-hidden
            />
          ) : null}
        </div>
        {children}
      </Container>
    </section>
  );
}
