import { AppShell, Container, Panel } from "@/components/ui";
import { Masthead } from "@/components/ui/Masthead";
import { PUBLIC_ENV_KEYS } from "@/constants";
import { HomeDashboardGate, HomeHero } from "@/features/home";
import { HomeToolsPreviewSkeleton } from "@/features/tools";
import { Suspense } from "react";
import { isAppConfigured } from "@/lib/appConfig";

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
          <Suspense fallback={<HomeToolsPreviewSkeleton />}>
            <HomeDashboardGate />
          </Suspense>
        ) : null}

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
                  {" · "}
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
                  {" · "}
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
