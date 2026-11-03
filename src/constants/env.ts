/** Public env var names: display / checklist only (not for dynamic `process.env[key]` on the client). */
export const PUBLIC_ENV_KEYS = {
  convexUrl: "NEXT_PUBLIC_CONVEX_URL",
  clerkPublishableKey: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
} as const;

/**
 * Literal `process.env.NEXT_PUBLIC_*` access so Next.js inlines values in client bundles.
 */
export const publicEnv = {
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
} as const;
