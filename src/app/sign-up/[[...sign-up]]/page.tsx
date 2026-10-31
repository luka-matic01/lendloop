import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

import { AppShell, Container } from "@/components/ui";
import { Masthead } from "@/components/ui/Masthead";
export default function SignUpPage() {
  return (
    <AppShell>
      <Masthead />
      <Container className="flex flex-1 items-center justify-center py-section-y">
        <Suspense>
          <SignUp />
        </Suspense>
      </Container>
    </AppShell>
  );
}
