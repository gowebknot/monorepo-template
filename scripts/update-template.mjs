import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const GIT_HOST_ALIAS_CONFIG_KEY = "mono-stack.template-host-alias";

const genericGitHubSshPrefix = "git@github.com:";

function validateGitHostAlias(alias) {
  if (alias.length > 255 || !/^[a-z\d][a-z\d._-]*$/i.test(alias)) {
    throw new Error(`Not a valid SSH host alias: ${alias}`);
  }
  return alias;
}

function gitHostAliasEnvironment(alias, environment) {
  const countValue = environment.GIT_CONFIG_COUNT ?? "0";
  if (!/^\d+$/.test(countValue)) {
    throw new Error("GIT_CONFIG_COUNT must be a non-negative integer.");
  }
  const index = Number(countValue);
  if (!Number.isSafeInteger(index)) {
    throw new Error("GIT_CONFIG_COUNT is too large.");
  }
  return {
    GIT_CONFIG_COUNT: String(index + 1),
    [`GIT_CONFIG_KEY_${index}`]: `url.git@${alias}:.insteadOf`,
    [`GIT_CONFIG_VALUE_${index}`]: genericGitHubSshPrefix
  };
}

function commandError(command, result) {
  return new Error(
    result.error?.message || result.stderr?.trim() || `${command} failed.`
  );
}

export function updateTemplate(args, dependencies = {}) {
  const cwd = dependencies.cwd ?? process.cwd();
  const environment = dependencies.environment ?? process.env;
  const execute = dependencies.execute ?? spawnSync;
  const platform = dependencies.platform ?? process.platform;
  const aliasResult = execute(
    "git",
    ["config", "--local", "--get", GIT_HOST_ALIAS_CONFIG_KEY],
    { cwd, encoding: "utf8" }
  );
  if (aliasResult.error || ![0, 1].includes(aliasResult.status)) {
    throw commandError("git config", aliasResult);
  }

  const alias =
    aliasResult.status === 0
      ? validateGitHostAlias(aliasResult.stdout.trim())
      : undefined;
  const env = alias
    ? { ...environment, ...gitHostAliasEnvironment(alias, environment) }
    : environment;
  const python = join(
    cwd,
    ".venv",
    platform === "win32" ? "Scripts/python.exe" : "bin/python"
  );
  const result = execute(python, ["-m", "copier", "update", ...args], {
    cwd,
    env,
    stdio: "inherit"
  });
  if (result.error) throw commandError(python, result);
  return result.status ?? 1;
}

function main() {
  try {
    process.exitCode = updateTemplate(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main();
}
