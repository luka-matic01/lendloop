import { LoansPageClient } from "./LoansPageClient";
import { LoansPageIntro } from "./LoansPageIntro";

/** App route shell: static header on the server, Convex UI in the client island. */
export function LoansPage() {
  return <LoansPageClient intro={<LoansPageIntro />} />;
}
