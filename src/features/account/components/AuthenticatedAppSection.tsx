import { ReactNode, Suspense } from "react";

import { AppRouteLoading } from "./AppRouteLoading";
import { ProtectedAppGate } from "./ProtectedAppGate";

export function AuthenticatedAppSection({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AppRouteLoading />}>
      <ProtectedAppGate>{children}</ProtectedAppGate>
    </Suspense>
  );
}
