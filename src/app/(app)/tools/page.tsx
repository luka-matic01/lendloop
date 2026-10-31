import { auth } from "@clerk/nextjs/server";

import { ToolsPage } from "@/features/tools";

export const instant = false;

export default async function ToolsRoutePage() {
  await auth.protect();

  return <ToolsPage />;
}
