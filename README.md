# LendLoop

Neighborhood tool-lending board: list tools, request borrows, approve or decline, mark returns. **Convex** holds data and rules; **Clerk** handles sign-in; **n8n** sends notifications and overdue reminders.

## Stack

- Next.js (App Router), TypeScript, Tailwind
- Clerk authentication
- Convex (queries, mutations, HTTP actions, scheduled n8n calls)
- n8n (Docker Compose in this repo)

## Local setup

### 1. Install and env

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local` with Clerk keys and run Convex:

```bash
npx convex dev
```

Set Convex deployment secrets (same HMAC secret everywhere):

```bash
npx convex env set INITIAL_ADMIN_EMAIL you@example.com
npx convex env set WEBHOOK_HMAC_SECRET "$(openssl rand -hex 32)"
```

Copy `WEBHOOK_HMAC_SECRET` and `CONVEX_SITE_URL` into `.env.local` for Docker (see `.env.example`).

**Workflow 01 (request notifications):** set `N8N_REQUEST_WEBHOOK_URL` in Convex to your n8n webhook URL. Cloud Convex + local n8n needs an HTTPS tunnel; see [n8n/README.md](n8n/README.md#cloud-convex-local-n8n).

### 2. Next.js app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in once, then seed demo neighbors:

```bash
npm run seed
```

### 3. n8n

```bash
docker compose up -d n8n
```

Editor: [http://localhost:5678](http://localhost:5678). Import workflows from [`n8n/`](n8n/) (`01-request-notification.json`, `02-overdue-reminders.json`, `03-error-workflow.json`). Activate **03** first, then **01** and **02**.

**Cloud Convex + local n8n:** Convex must reach your webhook. Expose port 5678 with ngrok or cloudflared and set `N8N_REQUEST_WEBHOOK_URL` in Convex to the public webhook URL (production path: `/webhook/lendloop-request-events`).

Details: [`n8n/README.md`](n8n/README.md).

### 4. Tests

```bash
npm test
```

## Architecture

| Layer | Role |
|--------|------|
| `src/app/` | Routes only; public `/`, signed-in `(app)/tools` and `(app)/loans` |
| `src/features/*` | UI and hooks per product area |
| `convex/` | Schema, auth helpers, lending mutations, automation HTTP + n8n outbound |
| `n8n/` | Exported workflows (no secrets in JSON) |

**Request flow:** User action → Convex mutation → `ctx.scheduler.runAfter` → internal action POSTs signed JSON to n8n → optional `automationLogs` row.

**Overdue flow:** n8n daily schedule → signed GET `/automation/overdue-loans` → mock reminder → signed POST `/automation/reminder-sent` → idempotent log + `lastReminderSentAt` (shown on loan rows).

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_CLERK_*`, `CLERK_SECRET_KEY` | Next `.env.local` | Clerk |
| `NEXT_PUBLIC_CONVEX_URL` | Next `.env.local` | Convex client |
| `CLERK_JWT_ISSUER_DOMAIN` | Convex env | Clerk JWT for Convex |
| `INITIAL_ADMIN_EMAIL` | Convex env | Bootstrap admin + seed owner |
| `WEBHOOK_HMAC_SECRET` | Convex env + n8n container | HMAC both directions |
| `N8N_REQUEST_WEBHOOK_URL` | Convex env | Outbound request notifications |
| `CONVEX_SITE_URL` | n8n container | `.convex.site` base for HTTP actions |
| `N8N_ENCRYPTION_KEY` | Docker | n8n credential encryption |

## Security and data minimization

- **Public home:** `tools.listPublic` returns only tool name and category (no owner).
- **App routes:** Clerk `auth.protect()` on `(app)/layout.tsx`; lending rules enforced in Convex (`requireUser`, `requireAdmin`, `assertOwner`, `requireToolAccess`).
- **Automation HTTP:** No user session; `X-LendLoop-Signature` = hex(HMAC-SHA256(`WEBHOOK_HMAC_SECRET`, raw body)). GET overdue list signs the path `/automation/overdue-loans` only.
- **n8n payloads:** Recipient email/name and loan fields only, with no Clerk tokens or full user records.
- **Idempotency:** `automationLogs.idempotencyKey` unique index; reminder keys `overdue:{loanRequestId}:{YYYY-MM-DD}`.
- **Secrets:** Never committed in workflow JSON; use `$env` and Convex env.

## Production (what I would change)

- Host n8n on n8n Cloud or a hardened stack (Postgres, queue mode, SSO), with real email/Slack credentials instead of console mock nodes.
- Stable public URL for workflow 1 (no dev tunnel); rotate `WEBHOOK_HMAC_SECRET` with overlap.
- Monitoring on n8n error workflow + alerts on repeated `automationLogs` `failed` status.
- Rate-limit automation HTTP routes; optional IP allowlist for n8n egress.
- Deploy Next on Vercel (or similar) with production Clerk + Convex deployments.

## Demo automation data

After seed, if `INITIAL_ADMIN_EMAIL` matches your signed-in user:

- One **overdue approved** loan (you borrow Maria’s circular saw), for workflow 02.
- One **pending incoming** request on your demo cordless drill, from Maria.
