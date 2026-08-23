import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const serverEntry = join(packageRoot, 'dist/main.js');
const readinessTimeoutMs = 10_000;
const requestTimeoutMs = 1_000;

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function getAvailablePort() {
  const listener = createServer();
  await new Promise((resolve, reject) => {
    listener.once('error', reject);
    listener.listen(0, '127.0.0.1', resolve);
  });
  const address = listener.address();
  assert.ok(address && typeof address !== 'string');
  const { port } = address;
  await new Promise((resolve, reject) => {
    listener.close((error) => (error ? reject(error) : resolve()));
  });
  return port;
}

function readProcessOutput(child) {
  const output = { stdout: '', stderr: '' };
  child.stdout?.on('data', (chunk) => {
    output.stdout += chunk.toString();
  });
  child.stderr?.on('data', (chunk) => {
    output.stderr += chunk.toString();
  });
  return output;
}

async function stopServer(child) {
  if (child.exitCode !== null) return;
  await new Promise((resolve) => {
    const finish = () => {
      clearTimeout(forceKillTimer);
      resolve();
    };
    const forceKillTimer = setTimeout(() => {
      if (child.exitCode === null) child.kill('SIGKILL');
    }, requestTimeoutMs);
    child.once('close', finish);
    child.kill('SIGTERM');
  });
}

async function fetchHealth(port) {
  return fetch(`http://127.0.0.1:${port}/health`, {
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
}

async function startServer() {
  const port = await getAvailablePort();
  const child = spawn(process.execPath, [serverEntry], {
    cwd: packageRoot,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(port),
      ALLOWED_ORIGINS: 'http://localhost:5173',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const output = readProcessOutput(child);
  const deadline = Date.now() + readinessTimeoutMs;

  try {
    while (Date.now() < deadline) {
      if (child.exitCode !== null) {
        throw new Error(
          `server exited before readiness: ${output.stderr || output.stdout}`,
        );
      }
      try {
        const response = await fetchHealth(port);
        if (response.ok) return { child, port };
      } catch {
        // The server may still be binding its configured port.
      }
      await sleep(100);
    }

    throw new Error(
      `server did not become ready within ${readinessTimeoutMs}ms: ${output.stderr || output.stdout}`,
    );
  } catch (error) {
    await stopServer(child);
    throw error;
  }
}

async function withServer(callback) {
  let child;
  try {
    const started = await startServer();
    child = started.child;
    return await callback({ port: started.port });
  } finally {
    if (child) await stopServer(child);
  }
}

test('TEST-API-003 running-server smoke serves health over localhost', async () => {
  await withServer(async ({ port }) => {
    const response = await fetchHealth(port);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'Hello World!');
  });
});

test('TEST-API-004 running-server smoke tears down after assertion failure', async () => {
  await assert.rejects(
    () =>
      withServer(async () => {
        throw new Error('intentional smoke assertion failure');
      }),
    /intentional smoke assertion failure/,
  );
});
