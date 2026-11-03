"use client";

import { useEffect, useState } from "react";

import { formatRelativeTimeAgo } from "@/lib/formatRelativeTimeAgo";

const TICK_MS = 30_000;

/** Live-updating label for a past timestamp — uses `formatRelativeTimeAgo`. */
export function useRelativeTimeAgo(timestampMs: number): string {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    setNowMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), TICK_MS);
    return () => window.clearInterval(id);
  }, [timestampMs]);

  return formatRelativeTimeAgo(timestampMs, nowMs);
}
