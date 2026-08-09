import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const GIT_HOST_ALIAS_CONFIG_KEY = "mono-stack.template-host-alias";

const genericGitHubSshPrefix = "git@github.com:";
const gitRoutingVariableNames = new Set(
  [
    "GIT_COMMON_DIR",
    "GIT_DIR",
    "GIT_INDEX_FILE",
    "GIT_OBJECT_DIRECTORY",
    "GIT_WORK_TREE"
  ].map((name) => name.toLowerCase())
);
const gitConfigVariablePattern = /^GIT_CONFIG_(?:COUNT|KEY_\d+|VALUE_\d+)$/i;

function sanitizeGitEnvironment(environment) {
  const sanitized = {};
  const gitConfig = new Map();
  for (const [name, value] of Object.entries(environment)) {
    if (gitRoutingVariableNames.has(name.toLowerCase())) continue;
    if (gitConfigVariablePattern.test(name)) {
      const canonicalName = name.toUpperCase();
      if (!gitConfig.has(canonicalName) || name === canonicalName) {
        gitConfig.set(canonicalName, value);
      }
      continue;
    }
    sanitized[name] = value;
  }
  Object.assign(sanitized, Object.fromEntries(gitConfig));
  return sanitized;
}

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

function missingEnvironmentError(python, platform) {
  const localPython =
    platform === "win32" ? ".\\.venv\\Scripts\\python.exe" : ".venv/bin/python";
  const venvCommands =
    platform === "win32"
      ? "`python -m venv .venv` or `py -3 -m venv .venv`"
      : "`python3 -m venv .venv`";
  const virtualenvCommands =
    platform === "win32"
      ? "`python -m virtualenv .venv` or `py -3 -m virtualenv .venv`"
      : "`python3 -m virtualenv .venv`";
  return new Error(
    `Template update environment is missing at ${python}. This is initialized automatically for new projects. To repair an older project, run ${venvCommands}. If venv is unavailable, run ${virtualenvCommands} instead. Then run \`${localPython} -m pip install --requirement requirements/copier.txt\`, and retry.`
  );
}

export function updateTemplate(args, dependencies = {}) {
  const cwd = dependencies.cwd ?? process.cwd();
  const environment = sanitizeGitEnvironment(
    dependencies.environment ?? process.env
  );
  const execute = dependencies.execute ?? spawnSync;
  const exists = dependencies.exists ?? existsSync;
  const platform = dependencies.platform ?? process.platform;
  const python = join(
    cwd,
    ".venv",
    platform === "win32" ? "Scripts/python.exe" : "bin/python"
  );
  if (!exists(python)) throw missingEnvironmentError(python, platform);

  const aliasResult = execute(
    "git",
    ["config", "--local", "--get", GIT_HOST_ALIAS_CONFIG_KEY],
    { cwd, encoding: "utf8", env: environment }
  );
  if (aliasResult.error?.code === "ENOENT") {
    throw new Error(
      "Git is not installed or is not available on PATH. Install Git, then rerun the template update."
    );
  }
  if (aliasResult.error || ![0, 1].includes(aliasResult.status)) {
    const detail = commandError("git config", aliasResult).message;
    throw new Error(
      `Git repository is required for template updates. Run \`git init --initial-branch main\`, create the baseline commit, and retry. Git reported: ${detail}`
    );
  }

  const alias =
    aliasResult.status === 0
      ? validateGitHostAlias(aliasResult.stdout.trim())
      : undefined;
  const env = alias
    ? { ...environment, ...gitHostAliasEnvironment(alias, environment) }
    : environment;
  const result = execute(python, ["-m", "copier", "update", ...args], {
    cwd,
    env,
    stdio: "inherit"
  });
  if (result.error?.code === "ENOENT") {
    throw missingEnvironmentError(python, platform);
  }
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
