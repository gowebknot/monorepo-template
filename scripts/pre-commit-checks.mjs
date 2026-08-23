import { spawn } from "node:child_process";

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

await run("staged formatting", ["lint-staged"]);
await run("staged skill validation", ["skills:check", "--", "--staged"]);
await run("staged shared component validation", [
  "exec",
  "node",
  "scripts/shared-component-testids.mjs"
]);

await runParallel([
  { label: "build", args: ["build"] },
  { label: "skill tests", args: ["skills:test"] },
  { label: "core unit tests", args: ["--filter", "create-mono-stack", "test"] },
  { label: "server unit tests", args: ["--filter", "server", "test"] },
  {
    label: "shared component checker tests",
    args: [
      "exec",
      "node",
      "--test",
      "scripts/shared-component-testids.test.mjs"
    ]
  }
]);

await runParallel([
  { label: "lint", args: ["lint"] },
  { label: "typecheck", args: ["typecheck"] }
]);
