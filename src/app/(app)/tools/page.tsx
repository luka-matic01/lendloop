import {
  AppPageShell,
  AuthenticatedAppSection,
} from "@/features/account";
import { ToolBoardPage } from "@/features/tool-board";

export default function ToolsPage() {
  return (
    <AppPageShell>
      <AuthenticatedAppSection>
        <ToolBoardPage />
      </AuthenticatedAppSection>
    </AppPageShell>
  );
}
