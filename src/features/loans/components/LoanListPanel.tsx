import type { ReactNode } from "react";

import { Panel } from "@/components/ui";
import { cn } from "@/lib/utils";

import { LOAN_LIST_PANEL_CLASS, LOAN_LIST_UL_CLASS } from "../constants/visual";
import type { LoanView } from "../types/loans";
import { type LoanPerspective, loanRowSurfaceClass } from "../utils/formatLoan";
import { LoanRow, type LoanRowActions } from "./LoanRow";

type LoanListPanelProps =
  | {
      children: ReactNode;
      loans?: never;
    }
  | {
      loans: LoanView[];
      perspective: LoanPerspective;
      loanActions?: LoanRowActions;
      children?: never;
    };

export function LoanListPanel(props: LoanListPanelProps) {
  return (
    <Panel className={LOAN_LIST_PANEL_CLASS}>
      <ul className={LOAN_LIST_UL_CLASS}>
        {"loans" in props && props.loans
          ? props.loans.map((loan) => (
              <li
                key={loan._id}
                className={cn(loanRowSurfaceClass(loan, props.perspective))}
              >
                <LoanRow
                  loan={loan}
                  perspective={props.perspective}
                  loanActions={props.loanActions}
                />
              </li>
            ))
          : props.children}
      </ul>
    </Panel>
  );
}
