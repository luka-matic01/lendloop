import { AuthConfig } from "convex/server";

/**
 * Convex Auth Configuration for Clerk JWT Validation.
 *
 * Requires `CLERK_JWT_ISSUER_DOMAIN` to be configured in the Convex deployment:
 *   npx convex env set CLERK_JWT_ISSUER_DOMAIN https://your-domain.clerk.accounts.dev
 *
 * And a Clerk JWT Template named `"convex"` in the Clerk Dashboard.
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
