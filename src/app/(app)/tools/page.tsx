import { auth } from "@clerk/nextjs/server";

import { ToolBoardPage } from "@/features/tool-board";

export const instant = false;

export default async function ToolsPage() {
  await auth.protect();

  return <ToolBoardPage />;
}
