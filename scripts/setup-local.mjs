/**
 * Local stack: self-hosted Convex + n8n (no webhook tunnel).
 * Prerequisite: Clerk keys in .env.local (see README). Safe to re-run.
 */
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envDocker = path.join(root, ".env.docker");
const envLocal = path.join(root, ".env.local");
const envExample = path.join(root, ".env.example");

const WORKFLOWS = [
  "03-error-workflow.json",
  "01-request-notification.json",
  "02-overdue-reminders.json",
];

function run(cmd, args, { quiet = false, allowFail = false } = {}) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    encoding: "utf8",
    stdio: quiet ? "pipe" : "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0 && !allowFail) {
    const detail = (result.stderr || result.stdout || "").trim();
    throw new Error(`${cmd} ${args.join(" ")} failed${detail ? `: ${detail}` : ""}`);
  }
  return result;
}

function docker(args, opts) {
  return run("docker", ["compose", "--env-file", ".env.docker", ...args], opts);
}

function readEnv(filePath) {
  const map = new Map();
  if (!fs.existsSync(filePath)) return map;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i > 0) map.set(t.slice(0, i), t.slice(i + 1));
  }
  return map;
}

function writeEnv(filePath, map) {
  fs.writeFileSync(
    filePath,
    `${[...map.entries()].map(([k, v]) => `${k}=${v}`).join("\n")}\n`,
    "utf8",
  );
}

function setKey(filePath, key, value) {
  const map = readEnv(filePath);
  map.set(key, value);
  writeEnv(filePath, map);
}

function randomHex(bytes) {
  return randomBytes(bytes).toString("hex");
}

async function waitOk(url, label, maxMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`${label} not ready at ${url}`);
}

function ensureEnvDocker() {
  if (fs.existsSync(envDocker)) return;
  console.log("Creating .env.docker");
  writeEnv(
    envDocker,
    new Map([
      ["WEBHOOK_HMAC_SECRET", randomHex(32)],
      ["N8N_ENCRYPTION_KEY", randomHex(16)],
      ["CONVEX_INSTANCE_SECRET", randomHex(32)],
      ["CONVEX_SITE_URL", "http://convex:3211"],
      ["N8N_PORT", "5678"],
      ["GENERIC_TIMEZONE", "UTC"],
    ]),
  );
}

function ensureEnvLocal() {
  if (fs.existsSync(envLocal)) return;
  fs.copyFileSync(envExample, envLocal);
  console.log("Created .env.local — add Clerk keys (README step 1), then run setup again.");
  process.exit(0);
}

function clerkReady() {
  const local = readEnv(envLocal);
  const pk = local.get("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY") ?? "";
  const sk = local.get("CLERK_SECRET_KEY") ?? "";
  const issuer = local.get("CLERK_JWT_ISSUER_DOMAIN") ?? "";
  return (
    pk.startsWith("pk_") &&
    sk.startsWith("sk_") &&
    issuer.includes("clerk.accounts")
  );
}

function patchSelfHostedConvex(adminKey) {
  for (const [k, v] of Object.entries({
    CONVEX_SELF_HOSTED_URL: "http://127.0.0.1:3210",
    CONVEX_SELF_HOSTED_ADMIN_KEY: adminKey,
    NEXT_PUBLIC_CONVEX_URL: "http://127.0.0.1:3210",
    CONVEX_SITE_URL: "http://127.0.0.1:3211",
  })) {
    setKey(envLocal, k, v);
  }
}

function syncConvexEnv() {
  const secret = readEnv(envDocker).get("WEBHOOK_HMAC_SECRET");
  if (!secret) throw new Error("WEBHOOK_HMAC_SECRET missing in .env.docker");

  console.log("Syncing Convex deployment env");
  run("npx", ["convex", "env", "set", "WEBHOOK_HMAC_SECRET", secret], { quiet: true });
  run(
    "npx",
    [
      "convex",
      "env",
      "set",
      "N8N_REQUEST_WEBHOOK_URL",
      "http://n8n:5678/webhook/lendloop-request-events",
    ],
    { quiet: true },
  );

  const local = readEnv(envLocal);
  const admin = local.get("INITIAL_ADMIN_EMAIL");
  if (admin) run("npx", ["convex", "env", "set", "INITIAL_ADMIN_EMAIL", admin], { quiet: true });

  const issuer = local.get("CLERK_JWT_ISSUER_DOMAIN");
  if (issuer) run("npx", ["convex", "env", "set", "CLERK_JWT_ISSUER_DOMAIN", issuer], { quiet: true });
}

function importWorkflows() {
  console.log("Importing n8n workflows");
  for (const file of WORKFLOWS) {
    const input = `/home/node/workflows/${file}`;
    docker(["exec", "-T", "n8n", "n8n", "import:workflow", `--input=${input}`]);
    const id = JSON.parse(
      fs.readFileSync(path.join(root, "n8n", file), "utf8"),
    ).id;
    docker(["exec", "-T", "n8n", "n8n", "publish:workflow", `--id=${id}`]);
  }
}

async function main() {
  process.chdir(root);

  if (run("docker", ["info"], { quiet: true, allowFail: true }).status !== 0) {
    console.error("Start Docker Desktop, then run npm run setup again.");
    process.exit(1);
  }

  ensureEnvLocal();
  if (!clerkReady()) {
    console.error(
      "Fill Clerk keys and CLERK_JWT_ISSUER_DOMAIN in .env.local first (README step 1).",
    );
    process.exit(1);
  }

  ensureEnvDocker();
  if (!readEnv(envDocker).get("CONVEX_INSTANCE_SECRET")) {
    setKey(envDocker, "CONVEX_INSTANCE_SECRET", randomHex(32));
  }

  console.log("Starting Convex and n8n");
  docker(["up", "-d"]);
  await waitOk("http://127.0.0.1:3210/version", "Convex");

  if (!readEnv(envLocal).get("CONVEX_SELF_HOSTED_ADMIN_KEY")) {
    console.log("Generating Convex admin key");
    const out = docker(["exec", "-T", "convex", "./generate_admin_key.sh"], {
      quiet: true,
    }).stdout;
    const adminKey = out.trim().split(/\r?\n/).at(-1)?.trim();
    if (!adminKey) throw new Error("Could not read Convex admin key");
    patchSelfHostedConvex(adminKey);
  }

  console.log("Deploying Convex functions");
  run("npx", ["convex", "dev", "--once"]);
  syncConvexEnv();

  await waitOk("http://127.0.0.1:5678/healthz", "n8n");
  try {
    importWorkflows();
  } catch (err) {
    console.error("\nn8n workflow import failed (first-time owner signup is the usual cause).");
    console.error("  1. Open http://localhost:5678 and create the owner account if prompted");
    console.error("  2. Run: npm run n8n:import\n");
    throw err;
  }

  console.log(`
Ready.
  npm run dev   → http://localhost:3000
  n8n           → http://localhost:5678
  Convex data   → http://127.0.0.1:3210 (dashboard optional via Convex docs)

Sign in, then: npm run seed
`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
