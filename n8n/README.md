# n8n

| File | ID | Role |
|------|-----|------|
| `03-error-workflow.json` | `LendLoopErrorWf` | Error handler |
| `01-request-notification.json` | `LendLoopRequestWf` | Webhook: HMAC → console delivery → respond |
| `02-overdue-reminders.json` | `LendLoopRemindWf` | Daily overdue → console delivery → Convex write-back |

**Local stack:** `npm run setup` wires Convex (`http://n8n:5678/...`) and n8n (`CONVEX_SITE_URL=http://convex:3211` in `.env.docker`). No tunnel.

**Recovery:** `npm run n8n:import` after first-time owner signup at `:5678`.

HMAC: `X-LendLoop-Signature` — see [`convex/http.ts`](../convex/http.ts) and [`convex/lib/hmac.ts`](../convex/lib/hmac.ts).

**Verify:** request in app → n8n execution on **01** + loan footnote; run **02** on seeded overdue loan → reminder footnote.
