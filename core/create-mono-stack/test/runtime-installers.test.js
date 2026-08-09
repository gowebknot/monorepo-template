import assert from "node:assert/strict";
import test from "node:test";

import {
  installLatestMise,
  installNativePython
} from "../src/runtime-installers.js";

test("uses winget for mise and the latest supported Python on Windows", async () => {
  const calls = [];
  const dependencies = {
    platform: "win32",
    runCommand: async (command, args) => calls.push({ args, command })
  };

  await installLatestMise(dependencies);
  await installNativePython(dependencies);

  assert.deepEqual(calls, [
    {
      command: "winget",
      args: [
        "install",
        "--exact",
        "--id",
        "jdx.mise",
        "--source",
        "winget",
        "--accept-package-agreements",
        "--accept-source-agreements"
      ]
    },
    {
      command: "winget",
      args: [
        "install",
        "--exact",
        "--id",
        "Python.Python.3.14",
        "--source",
        "winget",
        "--accept-package-agreements",
        "--accept-source-agreements"
      ]
    }
  ]);
});

test("uses sudo and apt to install Python on Linux", async () => {
  const calls = [];
  await installNativePython({
    isAdministrator: false,
    platform: "linux",
    runCommand: async (command, args, options = {}) => {
      calls.push({ args, command, options });
      return { stderr: "", stdout: "" };
    }
  });

  assert.deepEqual(calls, [
    {
      command: "apt-get",
      args: ["--version"],
      options: { capture: true }
    },
    {
      command: "sudo",
      args: ["apt-get", "update"],
      options: {}
    },
    {
      command: "sudo",
      args: ["apt-get", "install", "--yes", "python3", "python3-venv"],
      options: {}
    }
  ]);
});

test("configures the documented apt repository before installing mise", async () => {
  const calls = [];
  await installLatestMise({
    isAdministrator: true,
    platform: "linux",
    runCommand: async (command, args, options = {}) => {
      calls.push({ args, command, options });
      return { stderr: "", stdout: "" };
    }
  });

  assert.deepEqual(calls, [
    {
      command: "apt-get",
      args: ["--version"],
      options: { capture: true }
    },
    {
      command: "apt-get",
      args: ["install", "--yes", "extrepo"],
      options: {}
    },
    {
      command: "extrepo",
      args: ["enable", "mise"],
      options: {}
    },
    {
      command: "apt-get",
      args: ["update"],
      options: {}
    },
    {
      command: "apt-get",
      args: ["install", "--yes", "mise"],
      options: {}
    }
  ]);
});

test("does not partially upgrade Arch while installing native Python", async () => {
  const calls = [];
  await installNativePython({
    isAdministrator: true,
    platform: "linux",
    runCommand: async (command, args, options = {}) => {
      if (options.capture && command !== "pacman") {
        throw new Error(`${command} is unavailable`);
      }
      calls.push({ args, command, options });
      return { stderr: "", stdout: "" };
    }
  });

  assert.deepEqual(calls, [
    {
      command: "pacman",
      args: ["--version"],
      options: { capture: true }
    },
    {
      command: "pacman",
      args: ["--sync", "--needed", "--noconfirm", "python"],
      options: {}
    }
  ]);
});

test("installs pip and virtualenv support with native Python on Alpine", async () => {
  const calls = [];
  await installNativePython({
    isAdministrator: true,
    platform: "linux",
    runCommand: async (command, args, options = {}) => {
      if (options.capture && command !== "apk") {
        throw new Error(`${command} is unavailable`);
      }
      calls.push({ args, command, options });
      return { stderr: "", stdout: "" };
    }
  });

  assert.deepEqual(calls.at(-1), {
    command: "apk",
    args: ["add", "python3", "py3-pip", "py3-virtualenv"],
    options: {}
  });
});
