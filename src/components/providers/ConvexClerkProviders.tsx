"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";

import { ToastProvider } from "@/components/ui";
import { AccountSyncProvider } from "@/features/account";
import { getConvexReactClient } from "@/lib/convexClient";

export function ConvexClerkProviders({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk
      client={getConvexReactClient()}
      useAuth={useAuth}
    >
      <AccountSyncProvider>
        <ToastProvider>{children}</ToastProvider>
      </AccountSyncProvider>
    </ConvexProviderWithClerk>
  );
}
