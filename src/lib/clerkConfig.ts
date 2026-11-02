/** Server-side: Clerk middleware and `auth()` need both keys. */
export function isClerkConfigured(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;

  return Boolean(
    publishableKey?.startsWith("pk_") &&
      !publishableKey.includes("replace_me") &&
      secretKey?.startsWith("sk_") &&
      !secretKey.includes("replace_me")
  );
}
