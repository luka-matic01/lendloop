/** Compact “time ago” for activity footnotes: e.g. "just now", "15 min ago", "3h ago". */
export function formatRelativeTimeAgo(
  timestampMs: number,
  nowMs = Date.now(),
): string {
  const diffMs = Math.max(0, nowMs - timestampMs);

  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return minutes === 1 ? "1 min ago" : `${minutes} min ago`;
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 24) {
    return hours === 1 ? "1h ago" : `${hours}h ago`;
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 1) {
    return "1 day ago";
  }
  return `${days} days ago`;
}
