import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";

import { MastheadUserMenu } from "./MastheadUserMenu";

async function MastheadAccountInner() {
  const { isAuthenticated } = await auth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav aria-label="Account" className="flex shrink-0 items-center">
      <MastheadUserMenu />
    </nav>
  );
}

/** Server-resolved account menu — no client auth placeholder; matches hero CTAs. */
export function MastheadAccount() {
  return (
    <Suspense fallback={null}>
      <MastheadAccountInner />
    </Suspense>
  );
}
