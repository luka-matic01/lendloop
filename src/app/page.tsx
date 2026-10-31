import { AppShell, Container, Panel } from "@/components/ui";
import { Masthead } from "@/components/ui/Masthead";
import { APP_TAGLINE, PUBLIC_ENV_KEYS, SECTION_Y_CLASS } from "@/constants";
import { HomeHeroAuthActions } from "@/features/marketing";
import {
  PublicToolBoardFallback,
  PublicToolBoardSection,
} from "@/features/tool-board";
import { Suspense } from "react";
import { isAppConfigured } from "@/lib/app-config";

const BOARD_RULES = [
  {
    title: "Data minimization",
    body: "Public visitors see tool names and categories only. Owner identity, condition notes, and borrow dates require sign-in.",
  },
  {
    title: "Convex-enforced access",
    body: "Roles and ownership are checked in Convex queries and mutations, not only in the browser.",
  },
  {
    title: "Signed automation",
    body: "n8n webhooks use HMAC verification, idempotent overdue callbacks, and visible failure handling.",
  },
] as const;

const taglineBreak = APP_TAGLINE.indexOf(". ");
const heroFirstLine =
  taglineBreak === -1 ? APP_TAGLINE : APP_TAGLINE.slice(0, taglineBreak + 1);
const heroSecondLine =
  taglineBreak === -1 ? null : APP_TAGLINE.slice(taglineBreak + 2);

export default function HomePage() {
  const { hasConvex, hasClerk, isReady } = isAppConfigured();

  return (
    <AppShell>
      <Masthead>
        <Container className="pb-8 pt-2 sm:pb-16 sm:pt-6">
          <h1 className="font-display text-4xl font-extrabold leading-display tracking-tight text-on-board sm:text-6xl lg:text-8xl">
            <span className="block">{heroFirstLine}</span>
            {heroSecondLine ? (
              <span className="block">{heroSecondLine}</span>
            ) : null}
          </h1>
          <div className="mt-6 flex max-w-xl flex-col items-start gap-4 sm:mt-10 sm:gap-6">
            <p className="text-sm leading-relaxed text-on-board-muted sm:text-lg">
              Share power tools, garden gear, kitchen appliances, and camping
              equipment with trusted neighbors. You approve each borrow, set a
              return date, and get a nudge if it’s overdue.
            </p>
            <HomeHeroAuthActions />
          </div>
        </Container>
      </Masthead>

      <main className="w-full flex-1">
        {isReady ? (
          <Suspense fallback={<PublicToolBoardFallback />}>
            <PublicToolBoardSection />
          </Suspense>
        ) : null}

        <section aria-labelledby="board-rules">
          <Container className={SECTION_Y_CLASS}>
            <h2
              id="board-rules"
              className="border-b-2 border-ink pb-3 font-display text-3xl font-extrabold leading-none text-ink sm:pb-4 sm:text-4xl"
            >
              House rules
            </h2>
            <ol className="divide-y divide-line">
              {BOARD_RULES.map((rule, index) => (
                <li
                  key={rule.title}
                  className="grid gap-2 py-5 sm:grid-cols-[5rem_minmax(0,1fr)] sm:items-baseline sm:gap-8 sm:py-7"
                >
                  <span className="font-display text-4xl font-extrabold leading-none text-board sm:text-5xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="max-w-2xl">
                    <h3 className="font-display text-2xl font-bold leading-none text-ink sm:text-3xl">
                      {rule.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted sm:mt-3 sm:text-base">
                      {rule.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {!isReady && (
          <Container className="pb-6 sm:pb-section-y">
            <Panel tone="notice" aria-labelledby="setup-heading">
              <h2
                id="setup-heading"
                className="font-display text-3xl font-bold leading-none text-ink"
              >
                Environment checklist
              </h2>
              <p className="mt-3 text-base text-ink-muted">
                Copy{" "}
                <span className="font-medium text-ink">.env.example</span> to{" "}
                <span className="font-medium text-ink">.env.local</span>, then
                set Clerk and Convex values below.
              </p>
              <ul className="mt-5 space-y-3 text-base text-ink-muted">
                <li>
                  <span className="font-medium text-ink">
                    {PUBLIC_ENV_KEYS.convexUrl}
                  </span>
                  {" — "}
                  {hasConvex ? (
                    <span className="text-positive">Ready</span>
                  ) : (
                    <span>Pending · run convex dev</span>
                  )}
                </li>
                <li>
                  <span className="font-medium text-ink">
                    {PUBLIC_ENV_KEYS.clerkPublishableKey}
                  </span>
                  {" — "}
                  {hasClerk ? (
                    <span className="text-positive">Ready</span>
                  ) : (
                    <span>Pending · Clerk dashboard</span>
                  )}
                </li>
              </ul>
            </Panel>
          </Container>
        )}
      </main>
    </AppShell>
  );
}
