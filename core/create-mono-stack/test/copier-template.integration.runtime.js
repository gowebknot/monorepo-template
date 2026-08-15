import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { join } from "node:path";

const readinessTimeoutMs = 120_000;
const shutdownTimeoutMs = 10_000;

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function outputError(message, state) {
  return new Error(
    `${message}\n${state.output || "No process output captured."}`
  );
}

async function reservePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
  return address.port;
}

async function fetchWithin(url, state, validate) {
  let lastError;
  while (Date.now() < state.deadline) {
    if (state.spawnError) throw state.spawnError;
    if (state.closed) {
      throw outputError(
        `Reference development exited before ${url} became ready.`,
        state
      );
    }
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(2_000)
      });
      if (response.ok) return await validate(response);
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await delay(250);
  }
  throw outputError(
    `Timed out waiting for ${url}: ${lastError?.message ?? "no response"}.`,
    state
  );
}

function signalProcessTree(child, signal) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  try {
    if (process.platform === "win32") child.kill(signal);
    else process.kill(-child.pid, signal);
  } catch (error) {
    if (error?.code !== "ESRCH") throw error;
  }
}

async function closeProcess(child, closedPromise) {
  if (child.exitCode !== null || child.signalCode !== null) {
    await closedPromise;
    return false;
  }
  signalProcessTree(child, "SIGTERM");
  const result = await Promise.race([
    closedPromise.then(() => "closed"),
    delay(shutdownTimeoutMs).then(() => "timeout")
  ]);
  if (result === "closed") return false;
  signalProcessTree(child, "SIGKILL");
  await closedPromise;
  return true;
}

export async function runReferenceDevelopment(projectRoot) {
  const [webPort, referencePort] = await Promise.all([
    reservePort(),
    reservePort()
  ]);
  assert.notEqual(webPort, referencePort);
  const webPackagePath = join(projectRoot, "apps/web/package.json");
  const webPackage = JSON.parse(await readFile(webPackagePath, "utf8"));
  assert.equal(webPackage.scripts["dev:reference"], "vite");
  webPackage.scripts["dev:reference"] =
    `vite --host 127.0.0.1 --port ${webPort} --strictPort`;
  await writeFile(webPackagePath, `${JSON.stringify(webPackage, null, 2)}\n`);

  const child = spawn("pnpm", ["dev:reference"], {
    cwd: projectRoot,
    detached: process.platform !== "win32",
    env: {
      ...process.env,
      DATABASE_URL: ":memory:",
      FORCE_COLOR: "0",
      NODE_ENV: "test",
      NO_COLOR: "1",
      REFERENCE_ALLOWED_ORIGINS: `http://127.0.0.1:${webPort}`,
      REFERENCE_PORT: String(referencePort),
      TURBO_TELEMETRY_DISABLED: "1",
      WEB_PUBLIC_API_BASE_URL: `http://127.0.0.1:${referencePort}`,
      WEB_PUBLIC_APP_URL: `http://127.0.0.1:${webPort}`
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const state = {
    closed: false,
    deadline: Date.now() + readinessTimeoutMs,
    output: "",
    spawnError: undefined
  };
  const capture = (chunk) => {
    state.output = `${state.output}${chunk}`.slice(-20_000);
  };
  child.stdout.on("data", capture);
  child.stderr.on("data", capture);
  child.once("error", (error) => {
    state.spawnError = error;
  });
  const closedPromise = new Promise((resolve) => {
    child.once("close", (code, signal) => {
      state.closed = true;
      resolve({ code, signal });
    });
  });

  let result;
  let readinessError;
  try {
    const [webStatus, users] = await Promise.all([
      fetchWithin(`http://127.0.0.1:${webPort}/`, state, (response) =>
        Promise.resolve(response.status)
      ),
      fetchWithin(
        `http://127.0.0.1:${referencePort}/users`,
        state,
        async (response) => response.json()
      )
    ]);
    result = { users, webStatus };
  } catch (error) {
    readinessError = error;
  }

  const forcedKill = await closeProcess(child, closedPromise);
  if (readinessError) throw readinessError;
  assert.equal(
    forcedKill,
    false,
    outputError("Forced process cleanup was required.", state)
  );
  assert.equal(result.webStatus, 200);
  assert.ok(Array.isArray(result.users));
  return { ...result, forcedKill };
}
