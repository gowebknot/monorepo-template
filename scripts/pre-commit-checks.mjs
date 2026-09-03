import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("..", import.meta.url);
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function run(label, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(pnpm, args, {
      cwd: root,
      stdio: "inherit"
    });

    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `${label} failed${signal ? ` with ${signal}` : ` with exit code ${code}`}`
        )
      );
    });
  });
}

async function runParallel(commands) {
  const children = commands.map(({ label, args }) => ({
    label,
    child: spawn(pnpm, args, { cwd: root, stdio: "inherit" })
  }));

  let failure;
  await Promise.all(
    children.map(({ label, child }) =>
      new Promise((resolve, reject) => {
        child.once("error", reject);
        child.once("exit", (code, signal) => {
          if (code === 0) {
            resolve();
            return;
          }

          reject(
            new Error(
              `${label} failed${signal ? ` with ${signal}` : ` with exit code ${code}`}`
            )
          );
        });
      }).catch((error) => {
        failure ??= error;
        for (const entry of children) {
          if (!entry.child.killed) entry.child.kill("SIGTERM");
        }
      })
    )
  );

  if (failure) throw failure;
}

export function selectChecks({ hasCoreLauncher, hasServer }) {
  const checks = [
    { label: "build", args: ["build"] },
    { label: "skill tests", args: ["skills:test"] },
    {
      label: "shared component checker tests",
      args: [
        "exec",
        "node",
        "--test",
        "scripts/shared-component-testids.test.mjs"
      ]
    }
  ];

  if (hasServer) {
    checks.splice(2, 0, {
      label: "swagger documentation",
      args: ["swagger:check"]
    });
    checks.splice(3, 0, {
      label: "server unit tests",
      args: ["--filter", "server", "test"]
    });
  }

  if (hasCoreLauncher) {
    checks.push({
      isolated: true,
      label: "core unit tests",
      args: ["--filter", "create-mono-stack", "test"]
    });
  }

  return checks;
}

async function main() {
  await run("staged formatting", ["lint-staged"]);
  await run("staged relative-import validation", ["imports:check"]);
  await run("staged skill validation", ["skills:check", "--", "--staged"]);
  await run("staged shared component validation", [
    "exec",
    "node",
    "scripts/shared-component-testids.mjs"
  ]);

  const checks = selectChecks({
    hasCoreLauncher: existsSync(
      new URL("../core/create-mono-stack/package.json", import.meta.url)
    ),
    hasServer: existsSync(
      new URL("../apps/server/package.json", import.meta.url)
    )
  });

  await runParallel(checks.filter(({ isolated }) => !isolated));

  // The Ink launcher suite is interactive and timing-sensitive; isolate it from concurrent builds.
  for (const { label, args, isolated } of checks) {
    if (isolated) await run(label, args);
  }

  await runParallel([
    { label: "lint", args: ["lint"] },
    { label: "typecheck", args: ["typecheck"] }
  ]);
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
