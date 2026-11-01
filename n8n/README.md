# n8n Workflows Directory

Exported n8n workflow JSON files live in this directory:

- `01-request-notification.json` — Outbound webhook receiver for borrow request creation & status transitions (HMAC-SHA256 verified).
- `02-overdue-reminders.json` — Scheduled daily workflow that queries overdue loans from Convex HTTP endpoint, sends reminders, and performs idempotent write-backs.
- `03-error-workflow.json` — Global n8n Error Trigger workflow that captures failed executions and prevents silent failures.

> **Security Policy:** Never export hardcoded API keys or HMAC secrets in these JSON files. All secrets are referenced via `$env.WEBHOOK_HMAC_SECRET` and `$env.CONVEX_SITE_URL` injected by `docker-compose.yml`.

## Run n8n locally

```bash
# From repo root — uses .env.local for WEBHOOK_HMAC_SECRET, CONVEX_SITE_URL, N8N_ENCRYPTION_KEY
docker compose up -d n8n
```

Open the editor at [http://localhost:5678](http://localhost:5678).

When Convex runs in the cloud, expose the request webhook with a tunnel (ngrok, cloudflared, etc.) and set `N8N_REQUEST_WEBHOOK_URL` in Convex to the **production** webhook URL (e.g. `https://….ngrok.io/webhook/lendloop-request-events`).

## Connect Cursor to n8n (MCP)

Instance-level MCP lets the agent **search, create, edit, and test** workflows in your n8n instance instead of hand-editing JSON blind.

1. In n8n: **Settings → Instance-level MCP → Enable MCP access** (instance owner/admin).
2. **Settings → Instance-level MCP → Connect a client → Cursor**
   - Prefer **One-click setup** (OAuth), or copy the **Server URL** (ends with `/mcp-server/http`).
3. In this repo:

   ```bash
   cp .cursor/mcp.json.example .cursor/mcp.json
   ```

   - Local Docker: URL is usually `http://localhost:5678/mcp-server/http` (use `http://`, not `https://`).
   - For API key auth instead of OAuth, add headers per [n8n MCP client examples](https://docs.n8n.io/connect/connect-to-n8n-mcp-server/mcp-client-examples/).

4. Reload MCP in Cursor (**Settings → MCP**). You should see the `n8n` server and tools such as workflow search/create/edit.

Use MCP to build the three workflows above, then **export** sanitized JSON into this folder for reviewers who do not run your live n8n.

## Integration contract (Convex ↔ n8n)

Implement on the Convex side in `convex/http.ts` (not yet wired — schema and UI already expect write-backs):

| Direction | Endpoint / trigger | Purpose |
|-----------|-------------------|---------|
| Convex → n8n | `N8N_REQUEST_WEBHOOK_URL` | POST signed JSON on request create / status change |
| n8n → Convex | `GET /automation/overdue-loans` | List approved loans past `endDate` needing a reminder |
| n8n → Convex | `POST /automation/reminder-sent` | Idempotent log + `lastReminderSentAt` |

**Signature:** header `X-LendLoop-Signature` = hex(HMAC-SHA256(`WEBHOOK_HMAC_SECRET`, raw body)).

**Idempotency:** `automationLogs.idempotencyKey` unique index; reminder keys like `overdue:{loanRequestId}:{YYYY-MM-DD}` (see `convex/loanRequests.test.ts`).

**Notification payload (minimal):** `event`, `idempotencyKey`, `loanRequestId`, `status`, `toolName`, dates, and `notify: { email, name, role }` for the recipient only.

Details for agents live in `.cursor/rules/n8n-automation.mdc`.

## Workflow checklist (take-home)

- [ ] Workflow 1: Webhook → verify HMAC → notify correct party on create / approve / decline / return
- [ ] Workflow 2: Cron daily → signed GET overdue list → per-row notify → signed POST write-back
- [ ] Workflow 3: Error workflow assigned on 1 & 2; HTTP nodes retry; failures visible in executions
- [ ] Secrets only in Convex env, `.env.local`, and n8n credentials — never in committed JSON
- [ ] Bonus: write-backs populate `automationLogs` so loan rows show “reminder sent …” in the app
