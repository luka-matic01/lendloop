# LendLoop

Neighborhood tool-lending board: list tools, request borrows, approve or decline, mark returns. **Convex** holds data and rules; **Clerk** handles sign-in; **n8n** sends notifications and overdue reminders.

## Assignment coverage

- **Public `/`:** tagline, `tools.listPublic` (name + category, no owner), Clerk sign-in CTA
- **Signed-in:** `/tools` (board, filters, my listings, borrow) and `/loans` (incoming, my requests, approve/decline, return)
- **RBAC:** `convex/lib/auth.ts` on mutations — admin: any listing, all loans, trusted lender
- **n8n:** `01` request notify, `02` overdue fetch + write-back, `03` error workflow; HMAC in `convex/lib/hmac.ts`, idempotent `automationLogs`
- **Bonus:** loan row automation footnotes

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

Fill `.env.local` with Clerk keys and run Convex (keep this running so the API stays in sync with the app):

```bash
npx convex dev
```

Set Convex deployment secrets (same HMAC secret everywhere):

```bash
npx convex env set INITIAL_ADMIN_EMAIL you@example.com
npx convex env set WEBHOOK_HMAC_SECRET "$(openssl rand -hex 32)"
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://your-instance.clerk.accounts.dev
```

Copy `WEBHOOK_HMAC_SECRET` and `CONVEX_SITE_URL` into `.env.local` for Docker (see `.env.example`).

**Workflow 01 (request notifications):** set `N8N_REQUEST_WEBHOOK_URL` in Convex to your n8n webhook URL. Cloud Convex + local n8n needs an HTTPS tunnel; see [n8n/README.md](n8n/README.md#cloud-convex-local-n8n).

### 2. Clerk JWT for Convex

In the Clerk Dashboard:

1. **JWT templates** → create or edit the **`convex`** template (name must match `applicationID` in `convex/auth.config.ts`).
2. Include claims Convex needs: at minimum **`email`** and **`email_verified`** (or OIDC `emailVerified`) so admin bootstrap and account sync do not rely on client-only flags.
3. Set **JWT issuer domain** in Convex env as `CLERK_JWT_ISSUER_DOMAIN` (Frontend API URL, e.g. `https://….clerk.accounts.dev`).

After changing the template, sign out and sign in once so new tokens reach Convex.

### 3. Next.js app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in once, then seed demo neighbors:

```bash
npm run seed
```

### 4. n8n

```bash
docker compose up -d n8n
```

Editor: [http://localhost:5678](http://localhost:5678). Import workflows from [`n8n/`](n8n/) (`01-request-notification.json`, `02-overdue-reminders.json`, `03-error-workflow.json`). Activate **03** first, then **01** and **02**.

**Cloud Convex + local n8n:** Convex must reach your webhook. Expose port 5678 with ngrok or cloudflared and set `N8N_REQUEST_WEBHOOK_URL` in Convex to the public webhook URL (production path: `/webhook/lendloop-request-events`).

Details: [`n8n/README.md`](n8n/README.md).

### 5. Tests and lint

```bash
npm test
npm run lint
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

**User sync:** Signed-in clients call `users.ensureCurrentUser` once per session to upsert the Convex `users` row from the Clerk JWT (`tokenIdentifier`, name). Optional `primaryEmail` fills the address when the JWT omits `email`; **role is never taken from the client**—only from JWT verification + `INITIAL_ADMIN_EMAIL`.

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

- **Public home:** `tools.listPublic` returns tool id, name, and category only (no owner).
- **App routes:** Clerk `auth.protect()` on `(app)/layout.tsx`; lending rules enforced in Convex (`requireUser`, `requireAdmin`, `assertOwner`, `requireToolAccess`).
- **Admin bootstrap:** `INITIAL_ADMIN_EMAIL` is promoted only when the Clerk JWT includes a verified email (`emailVerified` / `email_verified`). Client-supplied verification flags are not accepted on the mutation.
- **Automation HTTP:** No user session; `X-LendLoop-Signature` = hex(HMAC-SHA256(`WEBHOOK_HMAC_SECRET`, raw body)). GET overdue list signs the path `/automation/overdue-loans` only.
- **n8n payloads:** Recipient email/name and loan fields only, with no Clerk tokens or full user records.
- **Idempotency:** `automationLogs.idempotencyKey` unique index; reminder keys `overdue:{loanRequestId}:{YYYY-MM-DD}`.
- **Secrets:** Never committed in workflow JSON; use `$env` and Convex env.
- **Reliability:** Convex retries outbound n8n POSTs; n8n HTTP nodes retry write-backs; workflow **03** logs failures (see `n8n/README.md`).

## Production (what I would change)

- **User sync:** Clerk **webhooks** (`user.created` / `user.updated`) into a Convex HTTP action so profile email and verification never depend on the browser calling `ensureCurrentUser` with optional fields.
- **JWT:** Enforce the `convex` template in production; drop client `primaryEmail` once `email` is always on the token.
- **n8n:** Host on n8n Cloud or a hardened stack (Postgres, queue mode, SSO), with real email/Slack instead of console mock nodes; wire **03** to PagerDuty/Slack.
- **Ops:** Stable public URL for workflow 1 (no dev tunnel); rotate `WEBHOOK_HMAC_SECRET` with overlap; rate-limit automation HTTP; optional IP allowlist for n8n egress.
- **App:** Deploy Next on Vercel (or similar) with production Clerk + Convex deployments; monitoring on `automationLogs` `failed` status.

## Demo automation data

After seed, if `INITIAL_ADMIN_EMAIL` matches your signed-in user:

- One **overdue approved** loan (you borrow Maria’s circular saw), for workflow 02.
- One **pending incoming** request on your demo cordless drill, from Maria.
