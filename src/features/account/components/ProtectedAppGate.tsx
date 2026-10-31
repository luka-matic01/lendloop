import { auth } from "@clerk/nextjs/server";

import { isAppConfigured } from "@/lib/app-config";

import { CurrentUserGate } from "./CurrentUserGate";

export async function ProtectedAppGate({
  children,
}: {
  children: React.ReactNode;
}) {
  await auth.protect();

  const { isReady } = isAppConfigured();
  if (!isReady) {
    return children;
  }

  return <CurrentUserGate>{children}</CurrentUserGate>;
}
