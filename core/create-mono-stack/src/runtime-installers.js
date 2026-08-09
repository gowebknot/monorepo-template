const latestPythonMinor = "3.14";
const miseInstallUrl = "https://mise.jdx.dev/installing-mise.html";
const pythonDownloadUrl = "https://www.python.org/downloads/";

export function manualPythonInstallGuidance() {
  return `Install the latest Python 3 from ${pythonDownloadUrl}, then rerun create-mono-stack.`;
}

async function runElevated(command, args, dependencies) {
  if (dependencies.isAdministrator) {
    await dependencies.runCommand(command, args);
    return;
  }
  await dependencies.runCommand("sudo", [command, ...args]);
}

async function runLinuxInstaller(installers, dependencies) {
  for (const installer of installers) {
    try {
      await dependencies.runCommand(installer.command, ["--version"], {
        capture: true
      });
    } catch {
      continue;
    }
    await installer.install();
    return;
  }
  throw new Error("no supported Linux package manager was found");
}

async function installLinuxPython(dependencies) {
  await runLinuxInstaller(
    [
      {
        command: "apt-get",
        install: async () => {
          await runElevated("apt-get", ["update"], dependencies);
          await runElevated(
            "apt-get",
            ["install", "--yes", "python3", "python3-venv"],
            dependencies
          );
        }
      },
      {
        command: "dnf",
        install: () =>
          runElevated(
            "dnf",
            ["install", "--assumeyes", "--refresh", "python3"],
            dependencies
          )
      },
      {
        command: "pacman",
        install: () =>
          runElevated(
            "pacman",
            ["--sync", "--needed", "--noconfirm", "python"],
            dependencies
          )
      },
      {
        command: "apk",
        install: () =>
          runElevated(
            "apk",
            ["add", "python3", "py3-pip", "py3-virtualenv"],
            dependencies
          )
      }
    ],
    dependencies
  );
}

async function installLinuxMise(dependencies) {
  await runLinuxInstaller(
    [
      {
        command: "apt-get",
        install: async () => {
          await runElevated(
            "apt-get",
            ["install", "--yes", "extrepo"],
            dependencies
          );
          await runElevated("extrepo", ["enable", "mise"], dependencies);
          await runElevated("apt-get", ["update"], dependencies);
          await runElevated(
            "apt-get",
            ["install", "--yes", "mise"],
            dependencies
          );
        }
      },
      {
        command: "dnf",
        install: async () => {
          await runElevated(
            "dnf",
            ["copr", "enable", "--assumeyes", "jdxcode/mise"],
            dependencies
          );
          await runElevated(
            "dnf",
            ["install", "--assumeyes", "mise"],
            dependencies
          );
        }
      },
      {
        command: "pacman",
        install: () =>
          runElevated(
            "pacman",
            ["--sync", "--needed", "--noconfirm", "mise"],
            dependencies
          )
      },
      {
        command: "apk",
        install: () => runElevated("apk", ["add", "mise"], dependencies)
      },
      {
        command: "snap",
        install: () =>
          runElevated("snap", ["install", "mise", "--classic"], dependencies)
      }
    ],
    dependencies
  );
}

export async function installLatestMise(dependencies) {
  try {
    if (dependencies.platform === "darwin") {
      await dependencies.runCommand("brew", ["install", "mise"]);
      return;
    }
    if (dependencies.platform === "win32") {
      await dependencies.runCommand("winget", [
        "install",
        "--exact",
        "--id",
        "jdx.mise",
        "--source",
        "winget",
        "--accept-package-agreements",
        "--accept-source-agreements"
      ]);
      return;
    }
    if (dependencies.platform === "linux") {
      await installLinuxMise(dependencies);
      return;
    }
    throw new Error(`unsupported platform: ${dependencies.platform}`);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Automatic mise installation failed: ${detail}. Install mise from ${miseInstallUrl}, then rerun create-mono-stack.`,
      { cause: error }
    );
  }
}

export async function installNativePython(dependencies) {
  try {
    if (dependencies.platform === "darwin") {
      await dependencies.runCommand("brew", ["install", "python"]);
      return;
    }
    if (dependencies.platform === "win32") {
      await dependencies.runCommand("winget", [
        "install",
        "--exact",
        "--id",
        `Python.Python.${latestPythonMinor}`,
        "--source",
        "winget",
        "--accept-package-agreements",
        "--accept-source-agreements"
      ]);
      return;
    }
    if (dependencies.platform === "linux") {
      await installLinuxPython(dependencies);
      return;
    }
    throw new Error(`unsupported platform: ${dependencies.platform}`);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Automatic Python installation failed: ${detail}. ${manualPythonInstallGuidance()}`,
      { cause: error }
    );
  }
}
