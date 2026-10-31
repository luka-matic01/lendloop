"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";

import { getConvexReactClient } from "@/lib/convex-client";

export function ConvexClerkProviders({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={getConvexReactClient()} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
