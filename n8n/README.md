# n8n

Three exported workflows integrate Convex with notifications and overdue reminders. Secrets live in env only, never in JSON.

| File | n8n name | Role |
|------|----------|------|
| `01-request-notification.json` | 01 Request notification | Webhook: verify HMAC → deliver → respond |
| `02-overdue-reminders.json` | 02 Overdue reminders | Daily: fetch overdue loans → remind → write-back |
| `03-error-workflow.json` | 03 Error workflow | Error trigger for 01 and 02 |

## Environment

| Variable | Where | Purpose |
|----------|--------|---------|
| `WEBHOOK_HMAC_SECRET` | Convex + `.env.local` | Shared HMAC key (must match) |
| `N8N_REQUEST_WEBHOOK_URL` | Convex (`npx convex env set …`) | **Public HTTPS** URL for workflow **01**, not `localhost` when Convex runs in the cloud |
| `CONVEX_SITE_URL` | `.env.local` | `https://<deployment>.convex.site` for workflow **02** |
| `N8N_ENCRYPTION_KEY` | `.env.local` | n8n encryption |
| `SIMULATE_DELIVERY_FAIL=1` | `.env.local` (optional) | Force deliver step to fail in **01** or **02** |

## Run

```bash
docker compose up -d n8n
```

Open [http://localhost:5678](http://localhost:5678). Import the three JSON files, then activate **03** → **01** → **02**. Workflows **01** and **02** already point at **03** as their error workflow.

HTTP routes and HMAC contracts: [`convex/http.ts`](../convex/http.ts).

## Workflow **01** and ngrok (typical dev setup)

If Convex is deployed (cloud) and n8n runs locally via Docker, **workflow 01 will not work without a tunnel**. Cloud Convex cannot POST to `http://localhost:5678`. The app will still create `automationLogs` rows with `request_notification` / `failed` and detail **`HTTP 404`** (or connection errors) until the webhook URL is reachable.

Workflow **02** does **not** need a tunnel; n8n calls **out** to `CONVEX_SITE_URL`.

1. Start n8n and **activate** workflow **01** (inactive webhooks return 404 on the production path).
2. Expose port **5678** with [ngrok](https://ngrok.com/) or [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/local-management/create-local-tunnel/):

```bash
ngrok http 5678
# or: cloudflared tunnel --url http://localhost:5678
```

3. Point Convex at the **production** webhook path (not the “Test URL” from the n8n editor):

```bash
npx convex env set N8N_REQUEST_WEBHOOK_URL 'https://YOUR_TUNNEL_HOST/webhook/lendloop-request-events'
```

4. Match secrets: `WEBHOOK_HMAC_SECRET` in Convex (`npx convex env set …`) and in `.env.local` for the n8n container, then restart n8n if you changed `.env.local`.

5. When the tunnel hostname changes (free ngrok sessions), run step 3 again.

**Sanity check:** from any machine on the internet (not your laptop shell to localhost), a POST without HMAC should hit n8n, and you should **not** get 404 if **01** is active and the path is correct. With HMAC, workflow **01** should execute in n8n when you create or update a borrow request in the app.

### `HTTP 404` on `request_notification`

| Cause | Fix |
|--------|-----|
| Workflow **01** not **Active** | Toggle Active in n8n; use `/webhook/…`, not `/webhook-test/…` |
| Wrong `N8N_REQUEST_WEBHOOK_URL` | Must end with `/webhook/lendloop-request-events` |
| Stale or missing tunnel | Restart ngrok/cloudflared; update Convex env with the new `https://…` host |
| `N8N_REQUEST_WEBHOOK_URL` still `localhost` | Set the public tunnel URL in **Convex** env, not only in `.env.local` |

## Integration contract

Header: `X-LendLoop-Signature` = hex(HMAC-SHA256(`WEBHOOK_HMAC_SECRET`, message)).

| Direction | Call | HMAC message |
|-----------|------|----------------|
| Convex → n8n | POST `N8N_REQUEST_WEBHOOK_URL` | Raw JSON body |
| n8n → Convex | GET `/automation/overdue-loans?today=YYYY-MM-DD` | Path `/automation/overdue-loans` only (`today` not signed) |
| n8n → Convex | POST `/automation/reminder-sent` | Raw JSON body |

**Payload (Convex → n8n):** `event`, `idempotencyKey`, `loanRequestId`, `status`, `toolName`, `startDate`, `endDate`, `notify: { email, name, role }`.

**Idempotency:** `request:{loanRequestId}:created` or `request:{loanRequestId}:status:{status}`; overdue `overdue:{loanRequestId}:{YYYY-MM-DD}`.

**Overdue list:** Loans with `sent` for that day’s key are omitted. `failed` stays eligible same day; Convex can upgrade `failed` → `sent` on retry.

**Logs:** Request notifications are recorded in Convex after the n8n HTTP result (`request_notification`). Reminders are recorded via the reminder POST (`overdue_reminder`). Loan rows read `automationLogs`; UI copy is in the app, not in n8n `detail`. POST `detail` only when `status: failed`.

## Verify

```bash
npx vitest run convex/automation.test.ts convex/loanRequests.test.ts
```

**01:** Create a borrow request in the app → n8n execution on **01** → loan row “Notification sent …”.

**02:** Approved loan with `endDate` before UTC today → **Execute workflow** on **02** → “Reminder sent …”; second run same UTC day should not re-remind.
