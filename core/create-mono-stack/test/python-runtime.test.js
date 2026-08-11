import assert from "node:assert/strict";
import test from "node:test";

import { discoverPythonOptions, requirePython } from "../src/python-runtime.js";

function unavailable() {
  const error = new Error("missing");
  error.code = "ENOENT";
  throw error;
}

test("discovers supported Python executables for the interactive wizard", async () => {
  const options = await discoverPythonOptions({
    platform: "darwin",
    runCommand: async (command, args) => {
      if (args.at(-1).includes("sys.version_info")) {
        if (command === "python3") return { stdout: "3.13.2\n", stderr: "" };
        if (command === "python3.12") return { stdout: "3.12.8\n", stderr: "" };
        return unavailable();
      }
      if (command === "which") {
        return { stdout: "/opt/python3/bin/python3\n", stderr: "" };
      }
      if (command === "python3") return { stdout: "", stderr: "" };
      return unavailable();
    }
  });

  assert.deepEqual(options, [
    {
      label: "python3 (3.13.2; system: /opt/python3/bin/python3)",
      value: "python3"
    }
  ]);
});

test("requests install consent for an explicitly selected unsupported Python", async () => {
  let probeOptions;
  let promptMessage;
  await assert.rejects(
    requirePython("python3", {
      confirmPythonInstall: async (message) => {
        promptMessage = message;
        return false;
      },
      platform: "darwin",
      runCommand: async (_command, _args, options) => {
        probeOptions = options;
        return { stderr: "", stdout: "3.9.6\n" };
      }
    }),
    /Project setup cancelled.*https:\/\/www\.python\.org\/downloads\//
  );
  assert.match(promptMessage, /python3.*unavailable or unsupported/i);
  assert.equal(probeOptions.env.MISE_AUTO_INSTALL, "0");
  assert.equal(probeOptions.env.PYTHON_MANAGER_AUTOMATIC_INSTALL, "false");
});

test("cancels with install guidance when Python installation is declined", async () => {
  let promptCount = 0;

  await assert.rejects(
    requirePython(undefined, {
      confirmPythonInstall: async (message) => {
        promptCount += 1;
        assert.match(message, /install or update to the latest Python 3/i);
        return false;
      },
      platform: "darwin",
      runCommand: async () => unavailable()
    }),
    /Project setup cancelled.*https:\/\/www\.python\.org\/downloads\//
  );
  assert.equal(promptCount, 1);
});

test("installs mise with consent and uses it to install Python", async () => {
  const events = [];
  let miseInstalled = false;
  let pythonInstalled = false;
  const python = await requirePython(undefined, {
    confirmPythonInstall: async () => {
      events.push("prompt for Python");
      return true;
    },
    confirmMiseInstall: async (message) => {
      events.push("prompt for mise");
      assert.match(message, /install mise/i);
      return true;
    },
    platform: "darwin",
    runCommand: async (command, args, options = {}) => {
      if (options.capture) {
        if (
          command === "mise" &&
          args[0] === "--no-config" &&
          args[1] === "version" &&
          miseInstalled
        ) {
          events.push("detect installed mise");
          return { stderr: "", stdout: "2026.8.3\n" };
        }
        if (
          command === "mise" &&
          args[0] === "--no-config" &&
          args[1] === "exec" &&
          pythonInstalled
        ) {
          if (args.at(-1).includes("sys.version_info")) {
            events.push("detect installed Python");
            return { stderr: "", stdout: "3.14.7\n" };
          }
          return { stderr: "", stdout: "" };
        }
        return unavailable();
      }
      if (command === "brew") {
        assert.deepEqual(args, ["install", "mise"]);
        events.push("install mise");
        miseInstalled = true;
      }
      if (command === "mise") {
        assert.deepEqual(args, ["--no-config", "install", "python@latest"]);
        events.push("install Python with mise");
        pythonInstalled = true;
      }
      return { stderr: "", stdout: "" };
    }
  });

  assert.deepEqual(python, {
    command: "mise",
    prefixArgs: ["--no-config", "exec", "python@latest", "--", "python"],
    venvModule: "venv"
  });
  assert.deepEqual(events, [
    "prompt for Python",
    "prompt for mise",
    "install mise",
    "detect installed mise",
    "install Python with mise",
    "detect installed Python"
  ]);
});

test("uses an existing mise installation without asking to install it", async () => {
  let promptedForMise = false;
  const python = await requirePython(undefined, {
    confirmMiseInstall: async () => {
      promptedForMise = true;
      return false;
    },
    confirmPythonInstall: async () => true,
    platform: "darwin",
    runCommand: async (command, args, options = {}) => {
      if (options.capture && command === "mise" && args[1] === "version") {
        return { stderr: "", stdout: "2026.8.3\n" };
      }
      if (options.capture && command === "mise" && args[1] === "exec") {
        return { stderr: "", stdout: "3.14.7\n" };
      }
      if (command === "mise") return { stderr: "", stdout: "" };
      return unavailable();
    }
  });

  assert.equal(python.command, "mise");
  assert.equal(promptedForMise, false);
});

test("uses the native Python installer when mise installation is declined", async () => {
  const events = [];
  let pythonInstalled = false;
  const python = await requirePython(undefined, {
    confirmMiseInstall: async () => {
      events.push("decline mise");
      return false;
    },
    confirmPythonInstall: async () => true,
    platform: "darwin",
    runCommand: async (command, args, options = {}) => {
      if (options.capture) {
        if (command === "python3" && pythonInstalled) {
          return { stderr: "", stdout: "3.14.7\n" };
        }
        return unavailable();
      }
      assert.equal(command, "brew");
      assert.deepEqual(args, ["install", "python"]);
      events.push("install native Python");
      pythonInstalled = true;
      return { stderr: "", stdout: "" };
    }
  });

  assert.deepEqual(python, {
    command: "python3",
    prefixArgs: [],
    venvModule: "venv"
  });
  assert.deepEqual(events, ["decline mise", "install native Python"]);
});

test("uses virtualenv when a supported Python has no ensurepip", async () => {
  const python = await requirePython(undefined, {
    platform: "linux",
    runCommand: async (command, args) => {
      if (command !== "python3") return unavailable();
      const script = args.at(-1);
      if (script.includes("sys.version_info")) {
        return { stderr: "", stdout: "3.12.4\n" };
      }
      if (script.includes("ensurepip")) return unavailable();
      if (script.includes("virtualenv")) {
        return { stderr: "", stdout: "" };
      }
      return unavailable();
    }
  });

  assert.deepEqual(python, {
    command: "python3",
    prefixArgs: [],
    venvModule: "virtualenv"
  });
});

test("explains how to recover when installed Python is not yet available", async () => {
  await assert.rejects(
    requirePython(undefined, {
      confirmMiseInstall: async () => false,
      confirmPythonInstall: async () => true,
      platform: "darwin",
      runCommand: async (command, _args, options = {}) => {
        if (command === "brew" && !options.capture) {
          return { stderr: "", stdout: "" };
        }
        return unavailable();
      }
    }),
    /Python installation completed.*restart your terminal.*rerun create-mono-stack/i
  );
});

test("reports automatic Python installer failures with manual guidance", async () => {
  await assert.rejects(
    requirePython(undefined, {
      confirmMiseInstall: async () => false,
      confirmPythonInstall: async () => true,
      platform: "darwin",
      runCommand: async (command) => {
        if (command === "brew") throw new Error("Homebrew is unavailable");
        return unavailable();
      }
    }),
    /Automatic Python installation failed: Homebrew is unavailable.*https:\/\/www\.python\.org\/downloads\//
  );
});
