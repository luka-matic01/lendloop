import type { ReactNode } from "react";

import { Container } from "@/components/ui";

import { TOOL_BOARD_COPY } from "../constants/copy";
import { HOME_TOOL_BOARD_SECTION_CLASS } from "../constants/visual";

type HomeBoardSectionProps = {
  description: string;
  children: ReactNode;
  busy?: boolean;
};

export function HomeBoardSection({
  description,
  children,
  busy = false,
}: HomeBoardSectionProps) {
  return (
    <section
      aria-labelledby="public-board-heading"
      aria-busy={busy || undefined}
    >
      <Container className={HOME_TOOL_BOARD_SECTION_CLASS}>
        <div>
          <h2
            id="public-board-heading"
            className="font-display text-3xl font-extrabold leading-none text-ink sm:text-4xl"
          >
            {TOOL_BOARD_COPY.homeBoardTitle}
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
