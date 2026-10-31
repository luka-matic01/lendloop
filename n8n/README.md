# n8n Workflows Directory

Exported n8n workflow JSON files live in this directory:

- `01-request-notification.json` — Outbound webhook receiver for borrow request creation & status transitions (HMAC-SHA256 verified).
- `02-overdue-reminders.json` — Scheduled daily workflow that queries overdue loans from Convex HTTP endpoint, sends reminders, and performs idempotent write-backs.
- `03-error-workflow.json` — Global n8n Error Trigger workflow that captures failed executions and prevents silent failures.

> **Security Policy:** Never export hardcoded API keys or HMAC secrets in these JSON files. All secrets are referenced via `$env.WEBHOOK_HMAC_SECRET` and `$env.CONVEX_SITE_URL` injected by `docker-compose.yml`.
