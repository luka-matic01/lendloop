import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  "03-error-workflow.json",
  "01-request-notification.json",
  "02-overdue-reminders.json",
];

function docker(args) {
  const r = spawnSync("docker", ["compose", "--env-file", ".env.docker", ...args], {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

for (const file of files) {
  const id = JSON.parse(fs.readFileSync(path.join(root, "n8n", file), "utf8")).id;
  docker(["exec", "-T", "n8n", "n8n", "import:workflow", `--input=/home/node/workflows/${file}`]);
  docker(["exec", "-T", "n8n", "n8n", "publish:workflow", `--id=${id}`]);
}

console.log("Done. In n8n, confirm workflows 03 → 01 → 02 are Active.");
