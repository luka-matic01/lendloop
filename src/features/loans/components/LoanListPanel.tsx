import type { ReactNode } from "react";

import { Panel } from "@/components/ui";

import { LOAN_LIST_PANEL_CLASS } from "../constants/visual";

type LoanListPanelProps = {
  children: ReactNode;
};

export function LoanListPanel({ children }: LoanListPanelProps) {
  return (
    <Panel className={LOAN_LIST_PANEL_CLASS}>
      <ul className="divide-y divide-line px-4 sm:px-panel">{children}</ul>
    </Panel>
  );
}
