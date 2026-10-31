/** Skip redundant description lines that repeat the title. */
export function toolCardDescription(
  name: string,
  description: string | undefined,
): string | null {
  const trimmed = description?.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.toLowerCase() === name.trim().toLowerCase()) {
    return null;
  }
  return trimmed;
}
