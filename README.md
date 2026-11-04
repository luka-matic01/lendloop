# LendLoop

Neighborhood tool-lending: list tools, request date ranges, approve or decline, mark returns. **Convex** owns data and rules; **Clerk** signs users in; **n8n** runs notifications and overdue reminders.

## How the brief is met

**Product**

| Surface          | Behavior                                                                                                                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `**/` (public)** | Tagline, read-only board via `tools.listPublic` (name + category only), sign-in CTA. Signed-in home adds server-driven previews without exposing owner PII on the public query.                                |
| `**/tools**`     | Paginated neighbor board with category filter, trusted-lender affordance, borrow request modal (validated dates). Owners manage listings (create/edit/delete) with UI lock when a tool is on loan or reserved. |
| `**/loans**`     | Incoming (lender approve/decline/return), my requests (status, overdue, cancel paths), admin-only all-loans view with trusted-lender toggle.                                                                   |

**Authorization & domain rules (Convex, not UI)**

- Shared guards in `convex/lib/auth.ts` on mutations and sensitive queries; lending overlap, self-borrow, party-only actions, admin listing removal — covered by `convex-test` (`npm test`).

**n8n & automation**

- Workflows **01–03** in `n8n/`; HMAC in `convex/lib/hmac.ts`; idempotent `automationLogs`; loan-row footnotes from app copy. Local dev runs **Convex + n8n in Docker** so webhooks need no tunnel. Delivery is **console.log** in n8n (assignment scope); proof is executions + footnotes.

**Frontend**

- `--ll-*` tokens and UI primitives; `src/features/*` with RSC shells and client islands; layout-scoped account sync; stale paginated lists; route skeletons.

## Stack

Next.js 16 · TypeScript · Tailwind 4 · Clerk · Convex · n8n · Vitest

## Local setup

**Prerequisites:** Docker Desktop, Node 20+, free [Clerk](https://dashboard.clerk.com) dev app. No paid services.

| # | What you do |
|---|-------------|
| **1** | `npm install`. Copy `.env.example` → `.env.local`. Paste Clerk **publishable + secret** keys. Set `CLERK_JWT_ISSUER_DOMAIN` (Clerk → JWT templates → **convex** template → issuer URL). Set `INITIAL_ADMIN_EMAIL` to the email you will sign in with. |
| **2** | `npm run setup` — starts Convex + n8n, deploys backend, syncs secrets, imports workflows. |
| **3** | `npm run dev` → [http://localhost:3000](http://localhost:3000). Sign in once (JWT template must include **email** + verification). `npm run seed`. |

**If step 2 fails on n8n import:** open [http://localhost:5678](http://localhost:5678), complete the one-time owner signup, then `npm run n8n:import`. Confirm workflows **03 → 01 → 02** are **Active**.

**Try automations:** two browser profiles — list + request → approve → footnote on loan row; for overdue, use seeded data and run workflow **02** in n8n. Details: [`n8n/README.md`](n8n/README.md).

```bash
npm test && npm run lint
```

## Architecture

| Layer | Responsibility |
|--------|----------------|
| `src/app/` | Routes, layouts — `(app)/layout.tsx` calls `auth.protect()` once |
| `src/features/*` | Tools, loans, home, account |
| `convex/` | Auth helpers, lending rules, HTTP actions, outbound n8n |
| `n8n/` | Exported workflows; secrets in `.env.docker` / Convex env only |

Clerk guards routes; **authorization lives in Convex**. Notify: mutation → signed POST to n8n → `automationLogs`. Overdue: n8n → signed Convex HTTP → idempotent reminder log.

## Environment variables

| Variable | Where |
|----------|--------|
| Clerk, `INITIAL_ADMIN_EMAIL`, `CLERK_JWT_ISSUER_DOMAIN` | `.env.local` (before `npm run setup`) |
| `CONVEX_SELF_HOSTED_*`, `NEXT_PUBLIC_CONVEX_URL` | `.env.local` (written by setup) |
| `WEBHOOK_HMAC_SECRET`, `CONVEX_INSTANCE_SECRET`, n8n `CONVEX_SITE_URL` | `.env.docker` (created by setup) |
| `N8N_REQUEST_WEBHOOK_URL`, shared HMAC, issuer, admin email | Convex env (synced by setup) |

## Security & production

Public queries stay minimal; automation HTTP is HMAC-only. Production: hosted Convex, Clerk webhooks for user sync, hosted n8n + SMTP, stable webhook URL.

After seed, `INITIAL_ADMIN_EMAIL` gets demo tools plus sample overdue/incoming loans for workflows **01** and **02**.
