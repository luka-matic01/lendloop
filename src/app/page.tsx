import { AppShell, Container, Panel } from "@/components/ui";
import { Masthead } from "@/components/ui/Masthead";
import { PUBLIC_ENV_KEYS, SECTION_Y_CLASS } from "@/constants";
import { HomeDashboardGate, HomeHero } from "@/features/marketing";
import { HomeToolsSectionSkeleton } from "@/features/tools";
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

export default function HomePage() {
  const { hasConvex, hasClerk, isReady } = isAppConfigured();

  return (
    <AppShell>
      <Masthead>
        <Container>
          <HomeHero />
        </Container>
      </Masthead>

      <main className="w-full flex-1">
        {isReady ? (
          <Suspense fallback={<HomeToolsSectionSkeleton />}>
            <HomeDashboardGate />
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
