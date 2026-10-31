import { Container } from "@/components/ui";
import { SECTION_Y_CLASS } from "@/constants";

import { LOANS_COPY } from "../constants/copy";
import { LoanSection } from "./LoanSection";

const LOANS_PAGE_CLASS = `space-y-8 ${SECTION_Y_CLASS} sm:space-y-10`;

export function LoansPageSkeleton() {
  return (
    <Container className={LOANS_PAGE_CLASS} aria-busy="true">
      <header className="space-y-2 sm:space-y-3">
        <h1 className="font-display text-3xl font-extrabold leading-none text-ink sm:text-4xl">
          {LOANS_COPY.pageTitle}
        </h1>
        <p className="max-w-xl text-sm text-ink-muted sm:text-base">
          {LOANS_COPY.pageDescription}
        </p>
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
