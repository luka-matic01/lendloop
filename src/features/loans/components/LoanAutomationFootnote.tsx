"use client";

import { useEffect, useState } from "react";

import { ListRowMetaSeparator } from "@/components/ui";
import {
  formatLoanActivityCornerVisible,
  formatLoanActivityWhen,
  type LoanActivityWhenLine,
} from "@/lib/formatLoanActivityWhen";
import { cn } from "@/lib/utils";

import { LOANS_COPY } from "../constants/copy";
import type { LoanActivityFootnote } from "../utils/loanActivityFootnotes";

const TICK_MS = 30_000;

function ActivityTime({ footnote }: { footnote: LoanActivityFootnote }) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    setNowMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), TICK_MS);
    return () => window.clearInterval(id);
  }, [footnote.atMs]);

  const line = footnote.line as LoanActivityWhenLine;
  const when = formatLoanActivityWhen(line, footnote.atMs, nowMs);
  const visible = formatLoanActivityCornerVisible(line, when);
  const title =
    LOANS_COPY.loanActivityLine({
      line: footnote.line,
      when,
      detail: footnote.detail,
    })?.text ?? visible;

  return (
    <span
      title={title}
      className={cn(
        footnote.line === "reminder_sent" ||
          footnote.line === "reminder_failed"
          ? "leading-snug"
          : "tabular-nums",
        footnote.tone === "negative" && "text-negative",
      )}
    >
      {visible}
    </span>
  );
}

export function LoanActivityFootnotes({
  footnotes,
}: {
  footnotes: LoanActivityFootnote[];
}) {
  if (footnotes.length === 0) {
    return null;
  }

  return (
    <p className="text-xs">
      {footnotes.map((footnote, index) => (
        <span key={`${footnote.line}-${footnote.atMs}`}>
          {index > 0 ? <ListRowMetaSeparator /> : null}
          <ActivityTime footnote={footnote} />
        </span>
      ))}
    </p>
  );
}
