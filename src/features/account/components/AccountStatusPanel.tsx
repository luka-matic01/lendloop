import { ReactNode } from "react";

import { Container, Panel } from "@/components/ui";

type AccountStatusPanelProps = {
  children: ReactNode;
  tone?: "default" | "notice";
  withContainer?: boolean;
};

export function AccountStatusPanel({
  children,
  tone = "default",
  withContainer = true,
}: AccountStatusPanelProps) {
  const panel = <Panel tone={tone}>{children}</Panel>;

  if (!withContainer) {
    return <div className="py-section-y">{panel}</div>;
  }

  return (
    <Container className="py-section-y">
      {panel}
    </Container>
  );
}
