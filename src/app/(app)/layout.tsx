import { AppShell } from "@/components/ui";
import { Masthead } from "@/components/ui/Masthead";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <Masthead />
      <div className="w-full flex-1">{children}</div>
    </AppShell>
  );
}
