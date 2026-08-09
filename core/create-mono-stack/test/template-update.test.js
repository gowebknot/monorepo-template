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
    GIT_CONFIG_COUNT: "1",
    GIT_CONFIG_KEY_0: "credential.helper",
    GIT_CONFIG_VALUE_0: ""
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
      platform: "darwin"
    }),
    0
  );
  assert.deepEqual(calls, [
    {
      command: "git",
      args: ["config", "--local", "--get", GIT_HOST_ALIAS_CONFIG_KEY],
      options: { cwd: projectRoot, encoding: "utf8" }
    },
    {
      command: `${projectRoot}/.venv/bin/python`,
      args: ["-m", "copier", "update", "--defaults"],
      options: {
        cwd: projectRoot,
        env: {
          ...environment,
          GIT_CONFIG_COUNT: "2",
          GIT_CONFIG_KEY_1: "url.git@github-webknot:.insteadOf",
          GIT_CONFIG_VALUE_1: "git@github.com:"
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
      platform: "darwin"
    }),
    0
  );
  assert.deepEqual(calls.at(-1).options.env, environment);
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
        platform: "darwin"
      }),
    /valid SSH host alias/
  );
  assert.equal(calls.length, 1);
});
