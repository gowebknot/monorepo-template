import { access as checkAccess } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL, fileURLToPath } from "node:url";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repositoryRoot = dirname(dirname(packageRoot));

export function normalizePublishArguments(args) {
  return args[0] === "--" ? args.slice(1) : args;
}

export function buildPublishCommand({
  args = [],
  authConfig,
  environment = process.env,
  packageRoot: workingDirectory = packageRoot,
  platform = process.platform
}) {
  return {
    args: ["publish", ...args],
    command: platform === "win32" ? "pnpm.cmd" : "pnpm",
    options: {
      cwd: workingDirectory,
      env: {
        ...environment,
        NPM_CONFIG_USERCONFIG: authConfig
      },
      shell: false,
      stdio: "inherit"
    }
  };
}

function runPublishCommand({ command, args, options }) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, options);
    child.once("error", reject);
    child.once("close", (code, signal) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      const reason = signal ? ` terminated by ${signal}` : " failed";
      const error = new Error(`${command}${reason}`);
      error.exitCode = code;
      error.signal = signal;
      reject(error);
    });
  });
}

export async function publishPackage({
  access = checkAccess,
  args = [],
  environment = process.env,
  packageRoot: workingDirectory = packageRoot,
  platform = process.platform,
  repositoryRoot: rootDirectory = repositoryRoot,
  run = runPublishCommand
} = {}) {
  const authConfig =
    environment.NPM_CONFIG_USERCONFIG ?? join(rootDirectory, ".npmrc.auth");

  try {
    await access(authConfig);
  } catch (error) {
    throw new Error(
      `Publish auth config not found: ${authConfig}. Create it or set NPM_CONFIG_USERCONFIG.`,
      { cause: error }
    );
  }

  return run(
    buildPublishCommand({
      args,
      authConfig,
      environment,
      packageRoot: workingDirectory,
      platform
    })
  );
}

export async function main(args = process.argv.slice(2)) {
  await publishPackage({ args: normalizePublishArguments(args) });
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : undefined;
if (invokedPath === import.meta.url) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
