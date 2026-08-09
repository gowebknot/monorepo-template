import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_TEMPLATE_SOURCE,
  createProject,
  parseArguments
} from "../src/create-project.js";

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

test("uses an SSH alias without changing Copier's recorded source", async () => {
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
        GIT_CONFIG_COUNT: "1",
        GIT_CONFIG_KEY_0: "credential.helper",
        GIT_CONFIG_VALUE_0: ""
      },
      mkdtemp: async () => temporaryRoot,
      platform: "darwin",
      readdir: async () => missingPath(),
      rm: async () => {},
      runCommand: async (command, args, options = {}) => {
        calls.push({ args, command, options });
        return options.capture
          ? { stderr: "", stdout: "3.14.7\n" }
          : { stderr: "", stdout: "" };
      },
      temporaryDirectory: "/tmp"
    }
  );

  assert.deepEqual(calls[0], {
    command: "/custom/python",
    args: ["-c", versionScript],
    options: { capture: true }
  });
  assert.deepEqual(calls.at(-1), {
    command: `${temporaryRoot}/venv/bin/python`,
    args: [
      "-m",
      "copier",
      "copy",
      "--defaults",
      "--data",
      "project_name=Acme Platform",
      DEFAULT_TEMPLATE_SOURCE,
      destination
    ],
    options: {
      env: {
        GIT_CONFIG_COUNT: "2",
        GIT_CONFIG_KEY_1: "url.git@github-webknot:.insteadOf",
        GIT_CONFIG_VALUE_1: "git@github.com:"
      }
    }
  });
});
