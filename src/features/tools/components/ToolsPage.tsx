import { ToolsPageClient } from "./ToolsPageClient";
import { ToolsPageIntro } from "./ToolsPageIntro";

/** App route shell: static title on the server, board + modals in the client island. */
export function ToolsPage() {
  return <ToolsPageClient intro={<ToolsPageIntro />} />;
}
