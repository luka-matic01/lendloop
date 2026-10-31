"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode, useCallback } from "react";

import { getConvexReactClient } from "@/lib/convex-client";

function useClerkAuthWithFallback() {
  const auth = useAuth();
  const { getToken } = auth;

  const getTokenWithFallback = useCallback(
    async (options?: Parameters<typeof getToken>[0]) => {
      try {
        const token = await getToken(options);
        if (token) {
          return token;
        }
      } catch {
        // Fall back to the default Clerk session token when the "convex"
        // JWT template has not been created in the Clerk Dashboard yet.
      }
      return await getToken({ skipCache: options?.skipCache });
    },
    [getToken],
  );

  return {
    ...auth,
    getToken: getTokenWithFallback,
  };
}

export function ConvexClerkProviders({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk
      client={getConvexReactClient()}
      useAuth={useClerkAuthWithFallback}
    >
      {children}
    </ConvexProviderWithClerk>
  );
}
