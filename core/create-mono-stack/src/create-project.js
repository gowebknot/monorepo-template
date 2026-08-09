import { spawn } from "node:child_process";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, isAbsolute, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

export const DEFAULT_TEMPLATE_SOURCE =
  "git@github.com:gowebknot/monorepo-template.git";

const minimumPythonVersion = [3, 10];
const genericGitHubSshPrefix = "git@github.com:";
const pythonVersionScript =
  "import sys; print('.'.join(map(str, sys.version_info[:3])))";
const requirementsPath = fileURLToPath(
  new URL("../requirements/copier.txt", import.meta.url)
);
const help = `Usage: create-mono-stack <destination> [options]

Options:
  -n, --name <name>       Project display name (defaults to destination name)
      --git-host-alias <alias>
                          SSH host alias for github.com template access
      --python <path>     Python 3.10+ executable
      --template <source> Copier template Git URL or local path
      --vcs-ref <ref>     Copier template Git revision
  -h, --help              Show this help
`;

function commandError(command, stderr, signal) {
  const detail = stderr.trim();
  const reason = signal ? ` terminated by ${signal}` : " failed";
  return new Error(`${command}${reason}${detail ? `: ${detail}` : ""}`);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const capture = options.capture === true;
    const child = spawn(command, args, {
      env: options.env ? { ...process.env, ...options.env } : undefined,
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit"
    });
    let stderr = "";
    let stdout = "";
    let settled = false;

    if (capture) {
      child.stdout.setEncoding("utf8");
      child.stderr.setEncoding("utf8");
      child.stdout.on("data", (chunk) => {
        stdout += chunk;
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk;
      });
    }

    child.once("error", (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    });
    child.once("close", (code, signal) => {
      if (settled) return;
      settled = true;
      if (code === 0) {
        resolvePromise({ stderr, stdout });
        return;
      }
      reject(commandError(command, stderr, signal));
    });
  });
}

const systemDependencies = {
  environment: process.env,
  mkdtemp,
  platform: process.platform,
  readdir,
  rm,
  runCommand,
  temporaryDirectory: tmpdir()
};

function validateGitHostAlias(alias) {
  if (
    alias !== undefined &&
    (alias.length > 255 || !/^[a-z\d][a-z\d._-]*$/i.test(alias))
  ) {
    throw new Error(`Not a valid SSH host alias: ${alias}`);
  }
  return alias;
}

function gitHostAliasEnvironment(alias, environment) {
  if (!alias) return undefined;
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

function pythonCandidates(platform) {
  const versioned = ["3.14", "3.13", "3.12", "3.11", "3.10"];
  if (platform === "win32") {
    return [
      { command: "python", prefixArgs: [] },
      ...versioned.map((version) => ({
        command: "py",
        prefixArgs: [`-${version}`]
      }))
    ];
  }
  return [
    { command: "python3", prefixArgs: [] },
    { command: "python", prefixArgs: [] },
    ...versioned.map((version) => ({
      command: `python${version}`,
      prefixArgs: []
    }))
  ];
}

function isSupportedPython(version) {
  const match = /^(\d+)\.(\d+)(?:\.\d+)?$/.exec(version.trim());
  if (!match) return false;
  const major = Number(match[1]);
  const minor = Number(match[2]);
  return (
    major > minimumPythonVersion[0] ||
    (major === minimumPythonVersion[0] && minor >= minimumPythonVersion[1])
  );
}

function resolveTemplateSource(source, cwd) {
  if (!source) return DEFAULT_TEMPLATE_SOURCE;
  const hasProtocol = /^[a-z][a-z\d+.-]*:/i.test(source);
  const isScpStyleGitUrl = /^[^\s@]+@[^\s:]+:.+$/.test(source);
  return isAbsolute(source) || hasProtocol || isScpStyleGitUrl
    ? source
    : resolve(cwd, source);
}

async function inspectPython(candidate, execute) {
  try {
    const result = await execute(
      candidate.command,
      [...candidate.prefixArgs, "-c", pythonVersionScript],
      { capture: true }
    );
    return isSupportedPython(result.stdout) ? candidate : undefined;
  } catch {
    return undefined;
  }
}

async function selectPython(requestedPython, dependencies) {
  if (requestedPython) {
    const candidate = { command: requestedPython, prefixArgs: [] };
    const selected = await inspectPython(candidate, dependencies.runCommand);
    if (selected) return selected;
    throw new Error(
      `Python 3.10 or newer is required; ${requestedPython} is unavailable or unsupported.`
    );
  }

  for (const candidate of pythonCandidates(dependencies.platform)) {
    const selected = await inspectPython(candidate, dependencies.runCommand);
    if (selected) return selected;
  }
  throw new Error(
    "Python 3.10 or newer is required. Install it or pass --python <path>."
  );
}

async function ensureDestinationIsAvailable(destination, dependencies) {
  try {
    const entries = await dependencies.readdir(destination);
    if (entries.length > 0) {
      throw new Error(`Destination directory is not empty: ${destination}`);
    }
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }
}

export function parseArguments(args, cwd = process.cwd()) {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    args,
    options: {
      help: { short: "h", type: "boolean" },
      "git-host-alias": { type: "string" },
      name: { short: "n", type: "string" },
      python: { type: "string" },
      template: { type: "string" },
      "vcs-ref": { type: "string" }
    },
    strict: true
  });

  if (values.help) return { help: true };
  if (positionals.length !== 1) {
    throw new Error(
      "Exactly one destination directory is required.\n\n" + help
    );
  }

  const destination = resolve(cwd, positionals[0]);
  const projectName = values.name ?? basename(destination);
  if (!projectName.trim()) throw new Error("Project name must not be empty.");

  return {
    destination,
    gitHostAlias: validateGitHostAlias(values["git-host-alias"]),
    projectName,
    python: values.python,
    template: resolveTemplateSource(values.template, cwd),
    vcsRef: values["vcs-ref"]
  };
}

export async function createProject(
  options,
  dependencies = systemDependencies
) {
  await ensureDestinationIsAvailable(options.destination, dependencies);
  const python = await selectPython(options.python, dependencies);
  const temporaryRoot = await dependencies.mkdtemp(
    join(dependencies.temporaryDirectory, "create-mono-stack-")
  );

  try {
    const virtualEnvironment = join(temporaryRoot, "venv");
    const virtualPython = join(
      virtualEnvironment,
      dependencies.platform === "win32" ? "Scripts/python.exe" : "bin/python"
    );
    await dependencies.runCommand(python.command, [
      ...python.prefixArgs,
      "-m",
      "venv",
      virtualEnvironment
    ]);
    await dependencies.runCommand(virtualPython, [
      "-m",
      "pip",
      "install",
      "--disable-pip-version-check",
      "--no-input",
      "--requirement",
      requirementsPath
    ]);

    const copierArguments = [
      "-m",
      "copier",
      "copy",
      "--defaults",
      "--data",
      `project_name=${options.projectName}`
    ];
    if (options.vcsRef) {
      copierArguments.push("--vcs-ref", options.vcsRef);
    }
    copierArguments.push(options.template, options.destination);
    const env = gitHostAliasEnvironment(
      options.gitHostAlias,
      dependencies.environment ?? process.env
    );
    await dependencies.runCommand(
      virtualPython,
      copierArguments,
      env ? { env } : {}
    );
  } finally {
    await dependencies.rm(temporaryRoot, { force: true, recursive: true });
  }
}

export async function main(args = process.argv.slice(2)) {
  const options = parseArguments(args);
  if (options.help) {
    console.log(help);
    return;
  }
  await createProject(options);
}
