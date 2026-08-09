import assert from "node:assert/strict";
import test from "node:test";

import {
  GIT_HOST_ALIAS_CONFIG_KEY,
  updateTemplate
} from "../../../scripts/update-template.mjs";

const projectRoot = "/workspace/project";

test("updates through the SSH alias stored in local Git config", () => {
  const calls = [];
  const environment = {
    Git_Config_Count: "1",
    git_config_key_0: "credential.helper",
    GIT_CONFIG_VALUE_0: "",
    Git_Dir: "/tmp/wrong-repository",
    git_work_tree: "/tmp/wrong-worktree",
    PATH: "/usr/bin"
  };
  const execute = (command, args, options) => {
    calls.push({ args, command, options });
    if (command === "git") {
      return { status: 0, stderr: "", stdout: "github-webknot\n" };
    }
    return { status: 0, stderr: "", stdout: "" };
  };

  assert.equal(
    updateTemplate(["--defaults"], {
      cwd: projectRoot,
      environment,
      execute,
      exists: () => true,
      platform: "darwin"
    }),
    0
  );
  assert.deepEqual(calls, [
    {
      command: "git",
      args: ["config", "--local", "--get", GIT_HOST_ALIAS_CONFIG_KEY],
      options: {
        cwd: projectRoot,
        encoding: "utf8",
        env: {
          GIT_CONFIG_COUNT: "1",
          GIT_CONFIG_KEY_0: "credential.helper",
          GIT_CONFIG_VALUE_0: "",
          PATH: "/usr/bin"
        }
      }
    },
    {
      command: `${projectRoot}/.venv/bin/python`,
      args: ["-m", "copier", "update", "--defaults"],
      options: {
        cwd: projectRoot,
        env: {
          GIT_CONFIG_COUNT: "2",
          GIT_CONFIG_KEY_0: "credential.helper",
          GIT_CONFIG_KEY_1: "url.git@github-webknot:.insteadOf",
          GIT_CONFIG_VALUE_0: "",
          GIT_CONFIG_VALUE_1: "git@github.com:",
          PATH: "/usr/bin"
        },
        stdio: "inherit"
      }
    }
  ]);
});

test("updates normally when the repository has no SSH alias", () => {
  const calls = [];
  const environment = { PATH: "/usr/bin" };
  const execute = (command, args, options) => {
    calls.push({ args, command, options });
    return command === "git"
      ? { status: 1, stderr: "", stdout: "" }
      : { status: 0, stderr: "", stdout: "" };
  };

  assert.equal(
    updateTemplate([], {
      cwd: projectRoot,
      environment,
      execute,
      exists: () => true,
      platform: "darwin"
    }),
    0
  );
  assert.deepEqual(calls.at(-1).options.env, environment);
});

test("explains how to repair a missing update environment", () => {
  assert.throws(
    () =>
      updateTemplate([], {
        cwd: projectRoot,
        environment: {},
        execute: () => assert.fail("No subprocess should run without .venv"),
        exists: () => false,
        platform: "darwin"
      }),
    (error) => {
      assert.match(
        error.message,
        /Template update environment is missing.*python3 -m venv \.venv.*\.venv\/bin\/python -m pip.*requirements\/copier\.txt/
      );
      assert.match(error.message, /python3 -m virtualenv \.venv/);
      return true;
    }
  );
});

test("prints a PowerShell-compatible Windows repair command", () => {
  assert.throws(
    () =>
      updateTemplate([], {
        cwd: projectRoot,
        environment: {},
        execute: () => assert.fail("No subprocess should run without .venv"),
        exists: () => false,
        platform: "win32"
      }),
    (error) => {
      assert.match(
        error.message,
        /\.\\\.venv\\Scripts\\python\.exe -m pip install/
      );
      assert.match(error.message, /py -3 -m venv \.venv/);
      assert.match(error.message, /py -3 -m virtualenv \.venv/);
      return true;
    }
  );
});

test("explains that Git must be initialized before an update", () => {
  assert.throws(
    () =>
      updateTemplate([], {
        cwd: projectRoot,
        environment: {},
        execute: () => ({
          status: 128,
          stderr: "fatal: --local can only be used inside a git repository",
          stdout: ""
        }),
        exists: () => true,
        platform: "darwin"
      }),
    /Git repository is required.*git init --initial-branch main/i
  );
});

test("explains when Git itself is unavailable", () => {
  const error = new Error("spawnSync git ENOENT");
  error.code = "ENOENT";
  assert.throws(
    () =>
      updateTemplate([], {
        cwd: projectRoot,
        environment: {},
        execute: () => ({ error, status: null, stderr: "", stdout: "" }),
        exists: () => true,
        platform: "darwin"
      }),
    /Git is not installed.*install Git/i
  );
});

test("rejects an unsafe SSH host alias before invoking Copier", () => {
  const calls = [];
  const execute = (command, args, options) => {
    calls.push({ args, command, options });
    return {
      status: 0,
      stderr: "",
      stdout: "github-webknot\nGIT_CONFIG_COUNT=0\n"
    };
  };

  assert.throws(
    () =>
      updateTemplate([], {
        cwd: projectRoot,
        environment: {},
        execute,
        exists: () => true,
        platform: "darwin"
      }),
    /valid SSH host alias/
  );
  assert.equal(calls.length, 1);
});
