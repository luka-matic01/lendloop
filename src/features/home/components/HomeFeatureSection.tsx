import type { ReactNode } from "react";

import { Container } from "@/components/ui";
import { SECTION_Y_CLASS } from "@/constants";
import { cn } from "@/lib/utils";

type HomeFeatureSectionProps = {
  headingId: string;
  title: string;
  description: string;
  children: ReactNode;
  busy?: boolean;
  /** Second block on the home page (e.g. loans below tools). */
  borderTop?: boolean;
};

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
        className={cn(SECTION_Y_CLASS, "space-y-4 sm:space-y-6")}
      >
        <div>
          <h2
            id={headingId}
            className="font-display text-3xl font-extrabold leading-none text-ink sm:text-4xl"
          >
            {title}
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
