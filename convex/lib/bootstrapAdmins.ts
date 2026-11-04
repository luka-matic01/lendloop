import { env } from "../_generated/server";

/** Comma- or semicolon-separated verified Clerk emails promoted to admin on sync. */
export function parseBootstrapAdminEmails(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return [];
  }
  const seen = new Set<string>();
  const emails: string[] = [];
  for (const part of raw.split(/[,;]/)) {
    const email = part.trim().toLowerCase();
    if (email && !seen.has(email)) {
      seen.add(email);
      emails.push(email);
    }
  }
  return emails;
}

/**
 * Promote when the Clerk-signed JWT email matches INITIAL_ADMIN_EMAIL.
 * Clerk session tokens often omit `email_verified` even for verified accounts;
 * the env list is the server-side trust anchor (see users.test.ts).
 */
export function isBootstrapAdmin(jwtEmail: string): boolean {
  const normalized = jwtEmail.trim().toLowerCase();
  if (!normalized) {
    return false;
  }
  return parseBootstrapAdminEmails(env.INITIAL_ADMIN_EMAIL).includes(normalized);
}

/** First bootstrap email (seed owner default). */
export function primaryBootstrapAdminEmail(): string | null {
  return parseBootstrapAdminEmails(env.INITIAL_ADMIN_EMAIL)[0] ?? null;
}
