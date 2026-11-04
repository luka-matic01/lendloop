import { TOOLS_COPY } from "../constants/copy";

/** Static tool board header — Server Component safe (matches loans intro shape). */
export function ToolsPageIntro() {
  return (
    <>
      <h1 className="min-w-0 font-display text-3xl font-extrabold leading-none text-ink sm:text-4xl">
        {TOOLS_COPY.pageTitle}
      </h1>
      <p className="max-w-xl text-sm text-ink-muted sm:text-base">
        {TOOLS_COPY.pageDescription}
      </p>
    </>
  );
}
