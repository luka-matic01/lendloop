import { AuthConfig } from "convex/server";

const issuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN!;

/**
 * Convex Auth Configuration for Clerk JWT Validation.
 *
 * Requires the Clerk `"convex"` JWT template (audience `convex`).
 */
export default {
  providers: [
    {
      domain: issuerDomain,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
