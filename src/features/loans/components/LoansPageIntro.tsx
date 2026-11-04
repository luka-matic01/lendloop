import { LOANS_COPY } from "../constants/copy";

/** Static loans page header — Server Component safe. */
export function LoansPageIntro() {
  return (
    <>
      <h1 className="font-display text-3xl font-extrabold leading-none text-ink sm:text-4xl">
        {LOANS_COPY.pageTitle}
      </h1>
      <p className="max-w-xl text-sm text-ink-muted sm:text-base">
        {LOANS_COPY.pageDescription}
      </p>
    </>
  );
}
