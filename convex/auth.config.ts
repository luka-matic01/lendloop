import { AuthConfig } from "convex/server";

const issuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN!;

/**
 * Convex Auth Configuration for Clerk JWT Validation.
 *
 * Accepts both the Clerk `"convex"` JWT template and Clerk's default session
 * JWT so local sign-in works even before a custom JWT template is created.
 */
export default {
  providers: [
    {
      domain: issuerDomain,
      applicationID: "convex",
    },
    {
      type: "customJwt",
      issuer: issuerDomain,
      jwks: `${issuerDomain.replace(/\/$/, "")}/.well-known/jwks.json`,
      algorithm: "RS256",
    },
  ],
} satisfies AuthConfig;
