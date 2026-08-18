import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { chmod, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { PassThrough } from "node:stream";
import test from "node:test";

import {
  createInteractiveSpawn,
  resolveInteractiveCommand,
  runInteractiveCommand
} from "../src/interactive-command.js";
import { createViteWizardObserver } from "../src/vite-wizard-observer.js";

function terminalFixture() {
  const events = new EventEmitter();
  const childWrites = [];
  const spawnCalls = [];
  let dataHandler;
  let exitHandler;
  const child = {
    kill() {},
    onData(handler) {
      dataHandler = handler;
      return { dispose() {} };
    },
    onExit(handler) {
      exitHandler = handler;
      return { dispose() {} };
    },
    resize() {},
    write(value) {
      childWrites.push(value);
    }
  };
  const input = new PassThrough();
  input.isTTY = true;
  input.isRaw = false;
  input.setRawMode = (value) => {
    input.isRaw = value;
  };
  const output = new PassThrough();
  output.columns = 100;
  output.isTTY = true;
  output.rows = 30;
  let visibleOutput = "";
  output.on("data", (chunk) => {
    visibleOutput += chunk.toString();
  });

  return {
    childWrites,
    close(exitCode) {
      exitHandler({ exitCode, signal: 0 });
    },
    emitOutput(value) {
      dataHandler(value);
    },
    events,
    input,
    output,
    spawnCalls,
    spawnPty(command, args, options) {
      spawnCalls.push({ args, command, options });
      return child;
    },
    visibleOutput() {
      return visibleOutput;
    }
  };
}

test("TEST-VITE-PTY-001 forwards the command and terminal bytes unchanged", async () => {
  const fixture = terminalFixture();
  const command = runInteractiveCommand(
    "pnpm",
    ["create", "vite", "vite-web", "--no-immediate"],
    {
      environment: { TERM: "xterm-256color" },
      input: fixture.input,
      output: fixture.output,
      spawnPty: fixture.spawnPty
    }
  );

  fixture.emitOutput("Select a framework");
  fixture.input.write("\u001b[B\r");
  fixture.close(0);

  assert.deepEqual(await command, { observation: null });
  assert.deepEqual(fixture.spawnCalls, [
    {
      args: ["create", "vite", "vite-web", "--no-immediate"],
      command: "pnpm",
      options: {
        cols: 100,
        cwd: process.cwd(),
        env: { TERM: "xterm-256color" },
        name: "xterm-256color",
        rows: 30
      }
    }
  ]);
  assert.equal(fixture.visibleOutput(), "Select a framework");
  assert.deepEqual(fixture.childWrites, ["\u001b[B\r"]);
  assert.equal(fixture.input.isRaw, false);
  assert.equal(fixture.input.listenerCount("data"), 0);
  assert.equal(fixture.output.listenerCount("resize"), 0);
});

test("TEST-VITE-PTY-002 bounds observation without truncating visible output", async () => {
  const fixture = terminalFixture();
  const observedChunks = [];
  const boundedObserver = createViteWizardObserver({ captureLimit: 32 });
  const observer = {
    finish: boundedObserver.finish,
    write(chunk) {
      observedChunks.push(chunk);
      boundedObserver.write(chunk);
    }
  };
  const command = runInteractiveCommand("pnpm", ["create", "vite"], {
    input: fixture.input,
    observer,
    output: fixture.output,
    spawnPty: fixture.spawnPty
  });
  const output = "x".repeat(64);

  fixture.emitOutput(output.slice(0, 32));
  fixture.emitOutput(output.slice(32));
  fixture.close(0);

  await command;
  assert.equal(fixture.visibleOutput(), output);
  assert.equal(observedChunks.join("").length, 64);
  assert.equal(observer.finish(), null);
});

test("TEST-VITE-PTY-003 rejects a failed interactive command", async () => {
  const fixture = terminalFixture();
  const command = runInteractiveCommand("pnpm", ["create", "vite"], {
    input: fixture.input,
    output: fixture.output,
    spawnPty: fixture.spawnPty
  });

  fixture.emitOutput("Vite failed");
  fixture.close(1);

  await assert.rejects(command, /pnpm failed with exit code 1/);
  assert.equal(fixture.visibleOutput(), "Vite failed");
  assert.equal(fixture.input.isRaw, false);
});

test("TEST-VITE-PTY-004 restores a previously paused input stream", async () => {
  const fixture = terminalFixture();
  fixture.input.pause();
  const command = runInteractiveCommand("pnpm", ["create", "vite"], {
    input: fixture.input,
    output: fixture.output,
    spawnPty: fixture.spawnPty
  });

  fixture.close(0);

  await command;
  assert.equal(fixture.input.isPaused(), true);
});

test("TEST-VITE-PTY-005 resolves a Node shebang PATH shim", async () => {
  const directory = await mkdtemp(
    path.join(tmpdir(), "create-mono-stack-pty-")
  );
  const shim = path.join(directory, "pnpm");
  await writeFile(shim, "#!/usr/bin/env node\n", "utf8");
  await chmod(shim, 0o755);

  assert.deepEqual(
    await resolveInteractiveCommand("pnpm", ["create", "vite"], {
      environment: { PATH: directory }
    }),
    {
      args: [shim, "create", "vite"],
      command: process.execPath
    }
  );
});

test("TEST-VITE-PTY-006 leaves native executables unchanged", async () => {
  const directory = await mkdtemp(
    path.join(tmpdir(), "create-mono-stack-pty-")
  );
  const executable = path.join(directory, "pnpm");
  await writeFile(executable, "native executable fixture\n", "utf8");
  await chmod(executable, 0o755);

  assert.deepEqual(
    await resolveInteractiveCommand("pnpm", ["create", "vite"], {
      environment: { PATH: directory }
    }),
    {
      args: ["create", "vite"],
      command: "pnpm"
    }
  );
});

function fallbackProcessFixture() {
  const child = new EventEmitter();
  child.kill = () => true;
  child.stderr = new PassThrough();
  child.stdout = new PassThrough();
  const calls = [];
  return {
    calls,
    child,
    spawnProcess(command, args, options) {
      calls.push({ args, command, options });
      return child;
    }
  };
}

test("TEST-VITE-PTY-007 prefers a working native PTY", () => {
  const nativeChild = {};
  const fallback = fallbackProcessFixture();
  const calls = [];
  const spawn = createInteractiveSpawn({
    nativeSpawn(command, args, options) {
      calls.push({ args, command, options });
      return nativeChild;
    },
    spawnProcess: fallback.spawnProcess
  });

  assert.equal(
    spawn("pnpm", ["create", "vite"], { cwd: "/fixture" }),
    nativeChild
  );
  assert.deepEqual(calls, [
    {
      args: ["create", "vite"],
      command: "pnpm",
      options: { cwd: "/fixture" }
    }
  ]);
  assert.deepEqual(fallback.calls, []);
});

for (const [testId, platform] of [
  ["TEST-VITE-PTY-008", "darwin"],
  ["TEST-VITE-PTY-009", "linux"],
  ["TEST-VITE-PTY-010", "win32"]
]) {
  test(`${testId} uses the portable fallback on ${platform}`, () => {
    const fallback = fallbackProcessFixture();
    const spawn = createInteractiveSpawn({
      nativeSpawn() {
        throw new Error("PTY unavailable");
      },
      spawnProcess: fallback.spawnProcess
    });

    spawn("node", ["fixture.js"], {
      cwd: "/fixture",
      env: { TERM: "xterm" },
      platform
    });

    assert.deepEqual(fallback.calls, [
      {
        args: ["fixture.js"],
        command: "node",
        options: {
          cwd: "/fixture",
          env: { TERM: "xterm" },
          shell: false,
          stdio: ["inherit", "pipe", "pipe"]
        }
      }
    ]);
  });
}

test("TEST-VITE-PTY-011 preserves fallback argument boundaries", () => {
  const fallback = fallbackProcessFixture();
  const spawn = createInteractiveSpawn({
    nativeSpawn() {
      throw new Error("PTY unavailable");
    },
    spawnProcess: fallback.spawnProcess
  });

  spawn("node", ["fixture with spaces.js", "value;still-one-argument"], {});

  assert.deepEqual(fallback.calls[0].args, [
    "fixture with spaces.js",
    "value;still-one-argument"
  ]);
  assert.equal(fallback.calls[0].options.shell, false);
});

test("TEST-VITE-PTY-012 forwards both fallback output streams", () => {
  const fallback = fallbackProcessFixture();
  const spawn = createInteractiveSpawn({
    nativeSpawn() {
      throw new Error("PTY unavailable");
    },
    spawnProcess: fallback.spawnProcess
  });
  const child = spawn("node", ["fixture.js"], {});
  const chunks = [];
  const subscription = child.onData((chunk) => chunks.push(chunk.toString()));

  fallback.child.stdout.write("Select a framework");
  fallback.child.stderr.write("warning");
  subscription.dispose();

  assert.deepEqual(chunks, ["Select a framework", "warning"]);
  assert.equal(fallback.child.stdout.listenerCount("data"), 0);
  assert.equal(fallback.child.stderr.listenerCount("data"), 0);
});

test("TEST-VITE-PTY-013 reports a portable fallback failure", async () => {
  const fixture = terminalFixture();
  const fallback = fallbackProcessFixture();
  const command = runInteractiveCommand("pnpm", ["create", "vite"], {
    input: fixture.input,
    output: fixture.output,
    spawnPty: createInteractiveSpawn({
      nativeSpawn() {
        throw new Error("PTY unavailable");
      },
      spawnProcess: fallback.spawnProcess
    })
  });

  fallback.child.emit("close", 7, null);

  await assert.rejects(command, /pnpm failed with exit code 7/);
});

test("TEST-VITE-PTY-014 resolves a Windows PowerShell package shim", async () => {
  const directory = await mkdtemp(
    path.join(tmpdir(), "create-mono-stack-pty-")
  );
  const shim = path.join(directory, "pnpm.ps1");
  await writeFile(shim, "Write-Output pnpm fixture\n", "utf8");

  assert.deepEqual(
    resolveInteractiveCommand("pnpm", ["create", "vite"], {
      environment: { PATH: directory },
      platform: "win32"
    }),
    {
      args: ["-NoLogo", "-NoProfile", "-File", shim, "create", "vite"],
      command: "powershell.exe"
    }
  );
});
