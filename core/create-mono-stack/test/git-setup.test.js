import assert from "node:assert/strict";
import test from "node:test";

import { initializeGit, preflightGit } from "../src/git-setup.js";

test("initializes and verifies main without ambient Git routing", async () => {
  const calls = [];
  const dependencies = {
    environment: {
      CUSTOM_ENV: "kept",
      GIT_COMMON_DIR: "/tmp/common",
      Git_Dir: "/tmp/repository",
      GIT_INDEX_FILE: "/tmp/index",
      GIT_OBJECT_DIRECTORY: "/tmp/objects",
      Git_Config_Key_0: "credential.helper",
      git_config_count: "1",
      git_config_value_0: "",
      git_work_tree: "/tmp/worktree",
      PATH: "/usr/bin"
    },
    runCommand: async (command, args, options) => {
      calls.push({ args, command, options });
      if (args.includes("--verify")) {
        const error = new Error("unknown revision HEAD");
        error.exitCode = 1;
        throw error;
      }
      if (args.includes("symbolic-ref")) {
        return { stderr: "", stdout: "main\n" };
      }
      return { stderr: "", stdout: "git version 2.50.0\n" };
    }
  };

  await preflightGit(dependencies);
  await initializeGit("/workspace/project", dependencies);

  assert.deepEqual(
    calls.map(({ args }) => args),
    [
      ["--version"],
      ["init", "--initial-branch", "main", "/workspace/project"],
      ["-C", "/workspace/project", "rev-parse", "--git-dir"],
      ["-C", "/workspace/project", "symbolic-ref", "--short", "HEAD"],
      ["-C", "/workspace/project", "rev-parse", "--verify", "--quiet", "HEAD"]
    ]
  );
  for (const { options } of calls) {
    assert.equal(options.replaceEnvironment, true);
    assert.deepEqual(options.env, {
      CUSTOM_ENV: "kept",
      GIT_CONFIG_COUNT: "1",
      GIT_CONFIG_KEY_0: "credential.helper",
      GIT_CONFIG_VALUE_0: "",
      PATH: "/usr/bin"
    });
  }
});

test("rejects initialization when the unborn branch is not main", async () => {
  await assert.rejects(
    initializeGit("/workspace/project", {
      environment: { PATH: "/usr/bin" },
      runCommand: async (_command, args) => ({
        stderr: "",
        stdout: args.includes("symbolic-ref") ? "master\n" : ".git\n"
      })
    }),
    /expected unborn branch main.*master/i
  );
});

test("rejects a generated repository that already contains a commit", async () => {
  await assert.rejects(
    initializeGit("/workspace/project", {
      environment: { PATH: "/usr/bin" },
      runCommand: async (_command, args) => ({
        stderr: "",
        stdout: args.includes("symbolic-ref") ? "main\n" : ".git\n"
      })
    }),
    /already contains a commit/i
  );
});

test("does not treat unexpected HEAD verification failures as unborn", async () => {
  await assert.rejects(
    initializeGit("/workspace/project", {
      environment: { PATH: "/usr/bin" },
      runCommand: async (_command, args) => {
        if (args.includes("--verify")) {
          const error = new Error("Git storage is unavailable");
          error.exitCode = 128;
          throw error;
        }
        return {
          stderr: "",
          stdout: args.includes("symbolic-ref") ? "main\n" : ".git\n"
        };
      }
    }),
    /Git initialization failed: Git storage is unavailable/
  );
});
