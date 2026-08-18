import { accessSync, closeSync, constants, openSync, readSync } from "node:fs";
import { spawn as spawnProcess } from "node:child_process";
import path from "node:path";

import { createViteWizardObserver } from "./vite-wizard-observer.js";

async function loadPtySpawn() {
  const pty = await import("node-pty");
  return createInteractiveSpawn({ nativeSpawn: pty.spawn });
}

function adaptPortableChild(child) {
  return {
    directInput: true,
    kill: (...killArgs) => child.kill(...killArgs),
    onData(handler) {
      child.stdout.on("data", handler);
      child.stderr.on("data", handler);
      return {
        dispose() {
          child.stdout.off("data", handler);
          child.stderr.off("data", handler);
        }
      };
    },
    onExit(handler) {
      const handleClose = (exitCode, signal) =>
        handler({ exitCode: exitCode ?? 1, signal });
      child.once("close", handleClose);
      return {
        dispose() {
          child.off("close", handleClose);
        }
      };
    },
    resize() {},
    write() {}
  };
}

export function createInteractiveSpawn({
  nativeSpawn,
  spawnProcess: startProcess = spawnProcess
}) {
  return (command, args, options) => {
    try {
      return nativeSpawn(command, args, options);
    } catch {
      const child = startProcess(command, args, {
        cwd: options.cwd,
        env: options.env,
        shell: false,
        stdio: ["inherit", "pipe", "pipe"]
      });
      return adaptPortableChild(child);
    }
  };
}

function terminalSize(output) {
  return {
    cols: Number.isInteger(output.columns) ? output.columns : 80,
    rows: Number.isInteger(output.rows) ? output.rows : 24
  };
}

function findPathCommand(command, environment) {
  if (command.includes(path.sep)) return command;

  for (const directory of (environment.PATH || "").split(path.delimiter)) {
    if (!directory) continue;
    const candidate = path.join(directory, command);
    try {
      accessSync(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Continue searching PATH just as an executable launcher would.
    }
  }

  return null;
}

function findWindowsPowerShellShim(command, environment) {
  if (command.includes(path.sep)) return null;

  for (const directory of (environment.PATH || "").split(path.delimiter)) {
    if (!directory) continue;
    const candidate = path.join(directory, `${command}.ps1`);
    try {
      accessSync(candidate, constants.F_OK);
      return candidate;
    } catch {
      // Continue searching PATH for the package-manager PowerShell shim.
    }
  }

  return null;
}

export function resolveInteractiveCommand(
  command,
  args,
  { environment = process.env, platform = process.platform } = {}
) {
  if (platform === "win32") {
    const shim = findWindowsPowerShellShim(command, environment);
    if (shim) {
      return {
        args: ["-NoLogo", "-NoProfile", "-File", shim, ...args],
        command: "powershell.exe"
      };
    }
  }

  const executable = findPathCommand(command, environment);
  if (!executable) return { args, command };

  let descriptor;
  try {
    descriptor = openSync(executable, "r");
    const buffer = Buffer.alloc(256);
    const bytesRead = readSync(descriptor, buffer, 0, buffer.length, 0);
    const prefix = buffer.toString("utf8", 0, bytesRead);
    const firstLine = prefix.split("\n", 1)[0];
    if (/^#!.*\bnode(?:\s|$)/.test(firstLine)) {
      return {
        args: [executable, ...args],
        command: process.execPath
      };
    }
  } catch {
    // Binary executables are expected to be unreadable as UTF-8 on some hosts.
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }

  return { args, command };
}

export async function runInteractiveCommand(
  command,
  args,
  {
    cwd = process.cwd(),
    environment = process.env,
    input = process.stdin,
    observer = createViteWizardObserver(),
    output = process.stdout,
    spawnPty
  } = {}
) {
  const startPty = spawnPty ?? (await loadPtySpawn());
  const launch = resolveInteractiveCommand(command, args, { environment });
  const { cols, rows } = terminalSize(output);
  const terminalName = environment.TERM || "xterm-color";
  const child = startPty(launch.command, launch.args, {
    cols,
    cwd,
    env: environment,
    name: terminalName,
    rows
  });
  const wasRaw = Boolean(input.isRaw);
  const wasPaused = input.isPaused?.() === true;

  return new Promise((resolve, reject) => {
    const handleInput = (chunk) => child.write(chunk.toString());
    const handleResize = () => {
      const size = terminalSize(output);
      child.resize(size.cols, size.rows);
    };
    const dataSubscription = child.onData((chunk) => {
      observer.write(chunk);
      output.write(chunk);
    });
    const exitSubscription = child.onExit(({ exitCode }) => {
      input.off("data", handleInput);
      output.off?.("resize", handleResize);
      dataSubscription.dispose();
      exitSubscription.dispose();
      if (input.isTTY && typeof input.setRawMode === "function") {
        input.setRawMode(wasRaw);
      }
      if (wasPaused) input.pause?.();

      if (exitCode === 0) {
        resolve({ observation: observer.finish() });
      } else {
        reject(new Error(`${command} failed with exit code ${exitCode}.`));
      }
    });

    if (!child.directInput) input.on("data", handleInput);
    output.on?.("resize", handleResize);
    if (
      !child.directInput &&
      input.isTTY &&
      typeof input.setRawMode === "function"
    ) {
      input.setRawMode(true);
    }
    if (!child.directInput) input.resume?.();
  });
}
