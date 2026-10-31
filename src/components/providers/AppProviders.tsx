import { ReactNode } from "react";

/** Reserved for app-wide client providers; Convex lives on app routes and the home board. */
export function AppProviders({ children }: { children: ReactNode }) {
  return children;
}
