import { auth } from "@clerk/nextjs/server";

import { AppShell, MastheadNav } from "@/components/ui";
import { Masthead } from "@/components/ui/Masthead";

export const instant = false;

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await auth.protect();

  return (
    <AppShell>
      <Masthead nav={<MastheadNav />} />
      <main className="w-full min-w-0 flex-1 overflow-x-clip">{children}</main>
    </AppShell>
  );
}
