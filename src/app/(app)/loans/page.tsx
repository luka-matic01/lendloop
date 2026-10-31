import { auth } from "@clerk/nextjs/server";

import { LoansPage } from "@/features/loans";

export const instant = false;

export default async function LoansRoutePage() {
  await auth.protect();

  return <LoansPage />;
}
