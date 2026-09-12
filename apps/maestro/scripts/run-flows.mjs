import { spawn } from "node:child_process";
import { resolve } from "node:path";

import { isPortAvailable } from "monorepo-template/scripts/dev-ports.mjs";
import { findAppByFeature } from "monorepo-template/scripts/stack-app-lookup.mjs";

const scriptDirectory = import.meta.dirname;
const workspaceRoot = resolve(scriptDirectory, "../../..");
const serverApp = findAppByFeature(workspaceRoot, ["api-nest", "api-express"]);
const expoApp = findAppByFeature(workspaceRoot, ["mobile-expo"]);
const ports = [3001, 8082];
const platformConfig = {
  ios: { appId: "host.exp.Exponent", host: "127.0.0.1" },
  android: { appId: "host.exp.exponent", host: "10.0.2.2" }
};
const readinessTimeoutMs = 120_000;
const pollIntervalMs = 500;

function requestedPlatforms() {
  const optionIndex = process.argv.indexOf("--platform");
  if (optionIndex === -1) return Object.keys(platformConfig);
  const argument = process.argv[optionIndex + 1];
  if (!(argument in platformConfig)) {
    throw new Error(`Unsupported platform "${argument}". Use ios or android.`);
  }
  return [argument];
}

function spawnDevServer(filter, args = []) {
  const child = spawn("pnpm", ["--filter", filter, "dev:reference", ...args], {
    cwd: workspaceRoot,
    detached: process.platform !== "win32",
    env: process.env,
    stdio: "inherit"
  });
  child.once("error", (error) => {
    console.error(`${filter} failed to start: ${error.message}`);
  });
  return child;
}

async function waitForPorts() {
  const deadline = Date.now() + readinessTimeoutMs;
  while (Date.now() < deadline) {
    const ready = await Promise.all(
      ports.map(async (port) => !(await isPortAvailable(port)))
    );
    if (ready.every(Boolean)) return;
    await new Promise((resolvePromise) => {
      setTimeout(resolvePromise, pollIntervalMs);
    });
  }
  throw new Error(
    `Timed out waiting for reference ports: ${ports.join(", ")}.`
  );
}

function stopProcess(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  if (process.platform === "win32") {
    child.kill("SIGTERM");
  } else if (child.pid) {
    process.kill(-child.pid, "SIGTERM");
  }
}

function runMaestro(platform) {
  const { appId, host } = platformConfig[platform];
  return new Promise((resolvePromise, reject) => {
    const child = spawn(
      "maestro",
      [
        "test",
        "flows",
        "-e",
        `MAESTRO_APP_ID=${appId}`,
        "-e",
        `MAESTRO_HOST=${host}`
      ],
      {
        cwd: resolve(import.meta.dirname, ".."),
        env: process.env,
        stdio: "inherit"
      }
    );
    child.once("error", reject);
    child.once("close", (code, signal) => {
      if (code === 0) resolvePromise();
      else
        reject(
          new Error(`Maestro ${platform} run exited with ${signal ?? code}.`)
        );
    });
  });
}

const children = [];
try {
  const platforms = requestedPlatforms();
  children.push(
    spawnDevServer(serverApp?.name ?? "server"),
    spawnDevServer(expoApp?.name ?? "expo", ["--", "--port", "8082"])
  );
  await waitForPorts();
  for (const platform of platforms) await runMaestro(platform);
} finally {
  for (const child of children) stopProcess(child);
}
