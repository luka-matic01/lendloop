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

export function isBootstrapAdmin(jwtEmail: string, emailVerified: boolean): boolean {
  if (!emailVerified || !jwtEmail) {
    return false;
  }
  return parseBootstrapAdminEmails(env.INITIAL_ADMIN_EMAIL).includes(jwtEmail);
}

/** First bootstrap email (seed owner default). */
export function primaryBootstrapAdminEmail(): string | null {
  return parseBootstrapAdminEmails(env.INITIAL_ADMIN_EMAIL)[0] ?? null;
}
