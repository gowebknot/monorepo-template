import { spawn } from "node:child_process";
import { resolve, sep } from "node:path";

export function invalid(message) {
  throw new Error(`Project management failed: ${message}.`);
}

export function projectPath(cwd, relativePath) {
  const root = resolve(cwd);
  const target = resolve(root, relativePath);
  if (target !== root && !target.startsWith(`${root}${sep}`)) {
    invalid("path must stay inside the project");
  }
  return target;
}

export function validateName(name, label) {
  if (typeof name !== "string" || !/^[a-z0-9][a-z0-9-]*$/i.test(name)) {
    invalid(`${label} must use letters, numbers, and hyphens only`);
  }
  return name;
}

export function runProjectCommand(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      stdio: options.stdio ?? "inherit"
    });
    child.once("error", reject);
    child.once("close", (code, signal) => {
      if (code === 0) return resolvePromise();
      reject(
        new Error(
          `${command} ${args.join(" ")} failed${signal ? `: ${signal}` : ""}`
        )
      );
    });
  });
}
