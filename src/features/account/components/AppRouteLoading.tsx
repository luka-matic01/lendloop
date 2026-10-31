import { ACCOUNT_MESSAGES } from "../constants/messages";

import { AccountStatusPanel } from "./AccountStatusPanel";

export function AppRouteLoading() {
  return (
    <AccountStatusPanel>
      <p className="text-sm text-ink-muted">{ACCOUNT_MESSAGES.routeLoading}</p>
    </AccountStatusPanel>
  );
}
