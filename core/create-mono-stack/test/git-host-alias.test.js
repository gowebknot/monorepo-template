import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_TEMPLATE_SOURCE,
  createProject,
  parseArguments
} from "../src/create-project.js";
import { GIT_HOST_ALIAS_CONFIG_KEY } from "../../../scripts/update-template.mjs";

const versionScript =
  "import sys; print('.'.join(map(str, sys.version_info[:3])))";

function missingPath() {
  const error = new Error("missing");
  error.code = "ENOENT";
  throw error;
}

test("parses and validates an optional SSH host alias", () => {
  assert.equal(
    parseArguments(
      ["acme-platform", "--git-host-alias", "github-webknot"],
      "/workspace"
    ).gitHostAlias,
    "github-webknot"
  );
  assert.throws(
    () =>
      parseArguments(
        ["acme-platform", "--git-host-alias", "github.com;invalid"],
        "/workspace"
      ),
    /valid SSH host alias/
  );
});

test("persists an SSH alias without changing Copier's recorded source", async () => {
  const calls = [];
  const temporaryRoot = "/tmp/create-mono-stack-alias";
  const destination = "/workspace/acme-platform";

  await createProject(
    {
      destination,
      gitHostAlias: "github-webknot",
      projectName: "Acme Platform",
      python: "/custom/python",
      template: DEFAULT_TEMPLATE_SOURCE,
      vcsRef: undefined
    },
    {
      environment: {
        Git_Config_Count: "1",
        git_config_key_0: "credential.helper",
        GIT_CONFIG_VALUE_0: ""
      },
      mkdtemp: async () => temporaryRoot,
      platform: "darwin",
      readdir: async () => missingPath(),
      rm: async () => {},
      scaffoldNativeApps: async () => [],
      runCommand: async (command, args, options = {}) => {
        calls.push({ args, command, options });
        if (command === "git" && args[0] === "--version") {
          return { stderr: "", stdout: "git version 2.50.0\n" };
        }
        if (command === "git" && args.includes("--verify")) {
          const error = new Error("unknown revision HEAD");
          error.exitCode = 1;
          throw error;
        }
        if (command === "git" && args.includes("symbolic-ref")) {
          return { stderr: "", stdout: "main\n" };
        }
        if (command === "git" && args.includes("rev-parse")) {
          return { stderr: "", stdout: ".git\n" };
        }
        return options.capture
          ? { stderr: "", stdout: "3.14.7\n" }
          : { stderr: "", stdout: "" };
      },
      temporaryDirectory: "/tmp",
      writeFile: async () => {},
      copyFile: async () => {}
    }
  );

  const pythonProbe = calls.find(
    ({ args, command }) => command === "/custom/python" && args[0] === "-c"
  );
  assert.equal(pythonProbe.args[1], versionScript);
  assert.equal(pythonProbe.options.capture, true);
  const copierCall = calls.find(
    ({ args }) => args[0] === "-m" && args[1] === "copier"
  );
  assert.deepEqual(copierCall, {
    command: `${temporaryRoot}/venv/bin/python`,
    args: [
      "-m",
      "copier",
      "copy",
      "--defaults",
      "--quiet",
      "--data",
      "project_name=Acme Platform",
      "--vcs-ref",
      "master",
      DEFAULT_TEMPLATE_SOURCE,
      destination
    ],
    options: {
      env: {
        GIT_CONFIG_COUNT: "2",
        GIT_CONFIG_KEY_0: "credential.helper",
        GIT_CONFIG_KEY_1: "url.git@github-webknot:.insteadOf",
        GIT_CONFIG_VALUE_0: "",
        GIT_CONFIG_VALUE_1: "git@github.com:"
      },
      replaceEnvironment: true
    }
  });
  assert.deepEqual(
    calls.find(
      ({ args, command }) =>
        command === "git" && args.includes(GIT_HOST_ALIAS_CONFIG_KEY)
    ),
    {
      command: "git",
      args: [
        "-C",
        destination,
        "config",
        "--local",
        GIT_HOST_ALIAS_CONFIG_KEY,
        "github-webknot"
      ],
      options: {
        env: {
          GIT_CONFIG_COUNT: "1",
          GIT_CONFIG_KEY_0: "credential.helper",
          GIT_CONFIG_VALUE_0: ""
        },
        replaceEnvironment: true
      }
    }
  );
});
