import { httpRouter } from "convex/server";

import { internal } from "./_generated/api";
import { env, httpAction } from "./_generated/server";
import { isAutomationTodayParam, utcTodayIso } from "./lib/borrowDates";
import {
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
  verifySignature,
  verifySignedGet,
} from "./lib/hmac";

const http = httpRouter();

const OVERDUE_PATH = "/automation/overdue-loans";
const REMINDER_PATH = "/automation/reminder-sent";

function webhookSecret(): string | undefined {
  return env.WEBHOOK_HMAC_SECRET?.trim() || undefined;
}

function unauthorized(): Response {
  return new Response("Unauthorized", { status: 401 });
}

function badRequest(message: string): Response {
  return new Response(message, { status: 400 });
}

http.route({
  path: OVERDUE_PATH,
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const secret = webhookSecret();
    if (!secret) {
      return new Response("Automation not configured", { status: 503 });
    }

    const url = new URL(req.url);
    const todayParam = url.searchParams.get("today")?.trim();
    const today = todayParam || utcTodayIso();
    if (!isAutomationTodayParam(today)) {
      return badRequest("Invalid today parameter");
    }

    const pathWithQuery = `${OVERDUE_PATH}?today=${today}`;
    const signature = req.headers.get(SIGNATURE_HEADER);
    const timestamp = req.headers.get(TIMESTAMP_HEADER);
    const ok = await verifySignedGet(
      secret,
      pathWithQuery,
      timestamp,
      signature,
    );
    if (!ok) {
      return unauthorized();
    }

    const data = await ctx.runQuery(internal.automation.listOverdueLoans, {
      today,
    });

    return Response.json(data);
  }),
});

http.route({
  path: REMINDER_PATH,
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const secret = webhookSecret();
    if (!secret) {
      return new Response("Automation not configured", { status: 503 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get(SIGNATURE_HEADER);
    const ok = await verifySignature(secret, rawBody, signature);
    if (!ok) {
      return unauthorized();
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return badRequest("Invalid JSON");
    }

    if (typeof parsed !== "object" || parsed === null) {
      return badRequest("Invalid body");
    }

    const body = parsed as Record<string, unknown>;
    const idempotencyKey = body.idempotencyKey;
    const loanRequestId = body.loanRequestId;
    const status = body.status;
    const detail = body.detail;

    if (typeof idempotencyKey !== "string" || !idempotencyKey.trim()) {
      return badRequest("idempotencyKey required");
    }
    if (typeof loanRequestId !== "string" || !loanRequestId.trim()) {
      return badRequest("loanRequestId required");
    }
    if (status !== "sent" && status !== "failed") {
      return badRequest("status must be sent or failed");
    }
    if (detail !== undefined && typeof detail !== "string") {
      return badRequest("detail must be a string");
    }

    const result = await ctx.runMutation(internal.automation.recordReminderSent, {
      idempotencyKey: idempotencyKey.trim(),
      // Convex document ids are strings at the HTTP boundary.
      loanRequestId: loanRequestId as import("./_generated/dataModel").Id<"loanRequests">,
      status,
      detail: typeof detail === "string" ? detail : undefined,
    });

    if (result.rejected === "invalid_idempotency_key") {
      return badRequest("idempotencyKey does not match loanRequestId");
    }
    if (
      result.rejected === "loan_not_found" ||
      result.rejected === "loan_not_approved"
    ) {
      return new Response("Loan request not found or not approved", {
        status: 404,
      });
    }

    return Response.json({ ok: true, duplicate: result.duplicate });
  }),
});

export default http;
