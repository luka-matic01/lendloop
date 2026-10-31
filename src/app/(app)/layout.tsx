import { auth } from "@clerk/nextjs/server";

import { ConvexClerkProviders } from "@/components/providers/ConvexClerkProviders";
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
      <main className="w-full flex-1">
        <ConvexClerkProviders>{children}</ConvexClerkProviders>
      </main>
    </AppShell>
  );
}
