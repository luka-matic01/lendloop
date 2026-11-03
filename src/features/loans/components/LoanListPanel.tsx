import type { ReactNode } from "react";

import { Panel } from "@/components/ui";
import { cn } from "@/lib/utils";

import { LOAN_LIST_PANEL_CLASS, LOAN_LIST_UL_CLASS } from "../constants/visual";
import type { LoanView } from "../types/loans";
import { loanListRowSurfaceClass } from "@/lib/listRowSurface";

import type { LoanPerspective } from "../utils/formatLoan";
import { isClosedLoanStatus } from "../utils/sortLoans";
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
      density?: "default" | "compact";
      children?: never;
    };

export function LoanListPanel(props: LoanListPanelProps) {
  const density =
    "loans" in props && props.loans ? (props.density ?? "default") : "default";

  return (
    <Panel
      className={cn(
        LOAN_LIST_PANEL_CLASS,
        density === "compact" && "!bg-surface border-line",
      )}
    >
      <ul className={LOAN_LIST_UL_CLASS}>
        {"loans" in props && props.loans
          ? props.loans.map((loan) => (
              <li
                key={loan._id}
                className={cn(
                  density === "default" &&
                    loanListRowSurfaceClass({
                      status: loan.status,
                      startDate: loan.startDate,
                      endDate: loan.endDate,
                      perspective: props.perspective,
                      isClosed: isClosedLoanStatus(loan.status),
                    }),
                )}
              >
                <LoanRow
                  loan={loan}
                  perspective={props.perspective}
                  loanActions={props.loanActions}
                  density={density}
                />
              </li>
            ))
          : props.children}
      </ul>
    </Panel>
  );
}
