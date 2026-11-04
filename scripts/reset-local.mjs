/**
 * Wipe local Convex + n8n Docker data and generated `.env.docker`.
 * Keeps `.env.local` (Clerk + INITIAL_ADMIN_EMAIL) so retest is steps 2–4 in the README.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envDocker = path.join(root, ".env.docker");
const envLocal = path.join(root, ".env.local");
const convexLocalDir = path.join(root, ".convex", "local");

function run(cmd, args, { allowFail = false } = {}) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0 && !allowFail) {
    process.exit(result.status ?? 1);
  }
  return result.status === 0;
}

/** When `.env.docker` is missing, `compose down` cannot interpolate secrets — remove stack by name. */
function forceRemoveLocalStack() {
  run("docker", ["rm", "-f", "lendloop-convex", "lendloop-convex-dashboard", "lendloop-n8n"], {
    allowFail: true,
  });
  run(
    "docker",
    ["volume", "rm", "-f", "lendloop_convex-data", "lendloop_n8n_data"],
    { allowFail: true },
  );
}

/** Fresh Convex volume needs a new admin key; setup regenerates when this is empty. */
function clearSelfHostedAdminKeyInEnvLocal() {
  if (!fs.existsSync(envLocal)) return;
  const lines = fs.readFileSync(envLocal, "utf8").split(/\r?\n/);
  let touched = false;
  const next = lines.flatMap((line) => {
    if (line.startsWith("CONVEX_SELF_HOSTED_ADMIN_KEY=")) {
      touched = true;
      return ["CONVEX_SELF_HOSTED_ADMIN_KEY="];
    }
    if (line.startsWith("CONVEX_DEPLOYMENT=")) {
      touched = true;
      return [];
    }
    return [line];
  });
  if (touched) {
    fs.writeFileSync(envLocal, `${next.join("\n").replace(/\n+$/, "")}\n`, "utf8");
    console.log("Cleared CONVEX_SELF_HOSTED_ADMIN_KEY in .env.local (setup will regenerate)");
  }
}

process.chdir(root);

console.log("Stopping containers and removing Convex + n8n volumes");
const composeDownOk = fs.existsSync(envDocker)
  ? run("docker", ["compose", "--env-file", ".env.docker", "down", "-v"], {
      allowFail: true,
    })
  : run("docker", ["compose", "down", "-v"], { allowFail: true });
if (!composeDownOk) {
  forceRemoveLocalStack();
}

if (fs.existsSync(envDocker)) {
  fs.unlinkSync(envDocker);
  console.log("Removed .env.docker");
}

clearSelfHostedAdminKeyInEnvLocal();

if (fs.existsSync(convexLocalDir)) {
  fs.rmSync(convexLocalDir, { recursive: true, force: true });
  console.log("Removed .convex/local");
}

console.log(`
Local data reset (.env.local kept).

Next — README "Clean retest":
  2. npm run setup
  3. npm run dev  →  sign in with INITIAL_ADMIN_EMAIL
  4. npm run seed
`);
