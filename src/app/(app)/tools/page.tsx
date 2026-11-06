import type { Metadata } from "next";

import { ToolsPage } from "@/features/tools";

export const metadata: Metadata = {
  title: "Tools",
};

export const instant = false;

export default function ToolsRoutePage() {
  return <ToolsPage />;
}
