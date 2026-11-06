import type { Metadata } from "next";

import { LoansPage } from "@/features/loans";

export const metadata: Metadata = {
  title: "Loans",
};

export const instant = false;

export default function LoansRoutePage() {
  return <LoansPage />;
}
