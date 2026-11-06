import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Suspense } from "react";

import { AppShell, Container } from "@/components/ui";
import { Masthead } from "@/components/ui/Masthead";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <AppShell>
      <Masthead />
      <Container className="flex flex-1 items-center justify-center py-section-y">
        <Suspense>
          <SignIn />
        </Suspense>
      </Container>
    </AppShell>
  );
}
