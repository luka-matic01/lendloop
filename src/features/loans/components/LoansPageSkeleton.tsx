import { Container } from "@/components/ui";
import { SECTION_Y_CLASS } from "@/constants";
import { cn } from "@/lib/utils";

import { LOANS_COPY } from "../constants/copy";
import { LoanSection } from "./LoanSection";
import { LoansPageIntro } from "./LoansPageIntro";

export function LoansPageSkeleton() {
  return (
    <Container
      className={cn("space-y-8 sm:space-y-10", SECTION_Y_CLASS)}
      aria-busy="true"
    >
      <header className="space-y-2 sm:space-y-3">
        <LoansPageIntro />
      </header>

      <LoanSection
        headingId="incoming-loans-heading-skeleton"
        heading={LOANS_COPY.incomingHeading}
        isLoading
        itemCount={0}
        emptyMessage={LOANS_COPY.emptyIncoming}
        skeletonLabel="Loading incoming requests"
        skeletonActionCount={2}
      />
      <LoanSection
        headingId="my-loans-heading-skeleton"
        heading={LOANS_COPY.myRequestsHeading}
        isLoading
        itemCount={0}
        emptyMessage={LOANS_COPY.emptyMyRequests}
        skeletonLabel="Loading your requests"
        skeletonActionCount={1}
      />
    </Container>
  );
}
