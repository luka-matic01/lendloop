"use client";

import { useEnsureCurrentUser } from "@/features/account";
import { HomeLoansPreview } from "@/features/loans";
import { HomeToolsPreview } from "@/features/tools";

/** One account sync for signed-in homepage previews. */
export function HomeSignedInDashboard() {
  const accountSync = useEnsureCurrentUser();

  return (
    <>
      <HomeToolsPreview isAuthenticated accountSync={accountSync} />
      <HomeLoansPreview accountSync={accountSync} />
    </>
  );
}
