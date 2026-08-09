import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";

import {
  installLatestMise,
  installNativePython,
  manualPythonInstallGuidance
} from "./runtime-installers.js";

const minimumPythonVersion = [3, 10];
const pythonDiscoveryEnvironment = {
  MISE_AUTO_INSTALL: "0",
  MISE_EXEC_AUTO_INSTALL: "0",
  MISE_NOT_FOUND_AUTO_INSTALL: "0",
  MISE_NOT_FOUND_SYSTEM_FALLBACK: "0",
  MISE_NO_CONFIG: "1",
  MISE_NO_HOOKS: "1",
  PYTHON_MANAGER_AUTOMATIC_INSTALL: "false"
};
const pythonVersionScript =
  "import sys; print('.'.join(map(str, sys.version_info[:3])))";
const virtualEnvironmentCapabilities = [
  { module: "venv", script: "import ensurepip, venv" },
  { module: "virtualenv", script: "import virtualenv" }
];

export async function confirmInstallation(message) {
  if (!stdin.isTTY || !stdout.isTTY) return false;
  const prompt = createInterface({ input: stdin, output: stdout });
  try {
    const answer = await prompt.question(`${message} [y/N] `);
    return /^(?:y|yes)$/i.test(answer.trim());
  } finally {
    prompt.close();
  }
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

async function inspectPython(candidate, execute) {
  try {
    const result = await execute(
      candidate.command,
      [...candidate.prefixArgs, "-c", pythonVersionScript],
      { capture: true, env: pythonDiscoveryEnvironment }
    );
    if (!isSupportedPython(result.stdout)) return undefined;
  } catch {
    return undefined;
  }

  for (const capability of virtualEnvironmentCapabilities) {
    try {
      await execute(
        candidate.command,
        [...candidate.prefixArgs, "-c", capability.script],
        { capture: true, env: pythonDiscoveryEnvironment }
      );
      return { ...candidate, venvModule: capability.module };
    } catch {
      continue;
    }
  }
  return undefined;
}

async function findPython(requestedPython, dependencies) {
  if (requestedPython) {
    const candidate = { command: requestedPython, prefixArgs: [] };
    return inspectPython(candidate, dependencies.runCommand);
  }

  for (const candidate of pythonCandidates(dependencies.platform)) {
    const selected = await inspectPython(candidate, dependencies.runCommand);
    if (selected) return selected;
  }
  return undefined;
}

async function findMise(dependencies) {
  try {
    await dependencies.runCommand("mise", ["--no-config", "version"], {
      capture: true
    });
    return "mise";
  } catch {
    return undefined;
  }
}

async function installPythonWithMise(mise, dependencies) {
  try {
    await dependencies.runCommand(mise, [
      "--no-config",
      "install",
      "python@latest"
    ]);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `mise could not install Python: ${detail}. ${manualPythonInstallGuidance()}`,
      { cause: error }
    );
  }

  return inspectPython(
    {
      command: mise,
      prefixArgs: ["--no-config", "exec", "python@latest", "--", "python"]
    },
    dependencies.runCommand
  );
}

export async function requirePython(requestedPython, dependencies) {
  const selected = await findPython(requestedPython, dependencies);
  if (selected) return selected;

  const install = await dependencies.confirmPythonInstall(
    requestedPython
      ? `Requested Python executable ${requestedPython} is unavailable or unsupported. Install or update to the latest Python 3 instead?`
      : "Python 3.10 or newer with venv support is required but was not found. Install or update to the latest Python 3 now?"
  );
  if (!install) {
    throw new Error(
      `Project setup cancelled. ${manualPythonInstallGuidance()}`
    );
  }

  let mise = await findMise(dependencies);
  if (!mise) {
    const installMise = await dependencies.confirmMiseInstall(
      "mise is not installed. Install mise and use it to manage the project Python runtime?"
    );
    if (installMise) {
      await installLatestMise(dependencies);
      mise = await findMise(dependencies);
      if (!mise) {
        throw new Error(
          "mise installation completed, but mise is not available in this process. Restart your terminal and rerun create-mono-stack."
        );
      }
    }
  }

  if (mise) {
    const installedWithMise = await installPythonWithMise(mise, dependencies);
    if (installedWithMise) return installedWithMise;
    throw new Error(
      "mise completed the Python installation, but Python 3.10 or newer is unavailable through mise. Run `mise doctor`, then rerun create-mono-stack."
    );
  }

  await installNativePython(dependencies);
  const installed = await findPython(undefined, dependencies);
  if (installed) return installed;
  throw new Error(
    `Python installation completed, but no usable Python 3.10 or newer with venv support is available. Restart your terminal; if the problem remains, ${manualPythonInstallGuidance()}`
  );
}
