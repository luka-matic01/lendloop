import type { ReactNode } from "react";

import { Container } from "@/components/ui";

import { TOOLS_COPY } from "../constants/copy";
import { HOME_TOOLS_SECTION_CLASS } from "../constants/visual";

type HomeToolsFrameProps = {
  description: string;
  children: ReactNode;
  busy?: boolean;
};

export function HomeToolsFrame({
  description,
  children,
  busy = false,
}: HomeToolsFrameProps) {
  return (
    <section
      aria-labelledby="public-board-heading"
      aria-busy={busy || undefined}
    >
      <Container
        className={`${HOME_TOOLS_SECTION_CLASS} space-y-4 sm:space-y-6`}
      >
        <div>
          <h2
            id="public-board-heading"
            className="font-display text-3xl font-extrabold leading-none text-ink sm:text-4xl"
          >
            {TOOLS_COPY.homeBoardTitle}
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
