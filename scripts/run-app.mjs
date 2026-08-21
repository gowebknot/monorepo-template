import { spawn } from "node:child_process";
import { basename, resolve } from "node:path";

import { ensureProjectPorts } from "./dev-ports.mjs";

export function commandFor(app, mode, port) {
  const reference = mode === "reference";
  switch (app.generator) {
    case "vite":
      return reference
        ? {
            command: "pnpm",
            args: [
              "exec",
              "vite",
              "reference",
              "--config",
              "vite.config.ts",
              "--host",
              "127.0.0.1",
              "--port",
              String(port),
              "--strictPort"
            ],
            prelude: ["pnpm", ["routes:generate:reference"]]
          }
        : {
            command: "pnpm",
            args: ["exec", "vite", "--port", String(port), "--strictPort"]
          };
    case "next":
      return {
        command: "pnpm",
        args: [
          "exec",
          "next",
          "dev",
          ...(reference ? ["reference"] : []),
          "--port",
          String(port)
        ]
      };
    case "nestjs":
      return {
        command: "pnpm",
        args: [
          "exec",
          "nest",
          "start",
          ...(reference ? ["--config", "nest-cli.reference.json"] : []),
          "--watch"
        ]
      };
    case "expo":
      return {
        command: "pnpm",
        args: ["exec", "expo", "start", "--port", String(port)]
      };
    case "react-native":
      return {
        command: "pnpm",
        args: ["exec", "react-native", "start", "--port", String(port)]
      };
    default:
      throw new Error(`Unsupported app generator: ${app.generator}`);
  }
}

export function environmentFor(app, mode, base = process.env) {
  const port = app.ports[mode];
  return {
    ...base,
    ...(app.generator === "react-native"
      ? { MONO_STACK_APP_PATH: app.path }
      : {}),
    ...(app.generator === "nestjs"
      ? mode === "reference"
        ? { REFERENCE_PORT: String(port) }
        : { PORT: String(port) }
      : {})
  };
}

function run(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { ...options, stdio: "inherit" });
    child.once("error", reject);
    child.once("close", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${signal ?? code}`));
    });
  });
}

export async function runApp(mode, projectRoot = process.cwd()) {
  if (!new Set(["dev", "reference"]).has(mode)) {
    throw new Error(`Unsupported app mode: ${mode}`);
  }
  const appRoot = projectRoot;
  const workspaceRoot = resolve(appRoot, "../..");
  const manifest = await ensureProjectPorts(workspaceRoot);
  const appName = basename(appRoot);
  const app = manifest.apps.find((candidate) => candidate.name === appName);
  if (!app) throw new Error(`No manifest app record found for ${appName}.`);
  const port = app.ports[mode];
  const launch = commandFor(app, mode, port);
  const env = environmentFor(app, mode);
  if (launch.prelude) {
    await run(launch.prelude[0], launch.prelude[1], { cwd: appRoot, env });
  }
  await run(launch.command, launch.args, { cwd: appRoot, env });
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)
) {
  runApp(process.argv[2]).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
