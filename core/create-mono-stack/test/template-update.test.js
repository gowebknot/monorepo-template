import assert from "node:assert/strict";
import test from "node:test";

import {
  GIT_HOST_ALIAS_CONFIG_KEY,
  STACK_CONFIG_FILENAME,
  readStackConfig,
  updateTemplate
} from "../../../scripts/update-template.mjs";
import {
  expectedStackArguments,
  stackConfig,
  validStackDependencies
} from "./template-update.helpers.js";

const projectRoot = "/workspace/project";

const skillTriggers = JSON.stringify({
  always: ["test-first-workflow"],
  rules: [
    { when: ["apps/web/**"], require: ["frontend-standards"] },
    { when: ["apps/server/**"], require: ["backend-standards"] },
    { when: ["**/*.tsx"], require: ["react-19"] }
  ],
  exempt: [".claude/**"]
});

function copierCall(calls) {
  return calls.find(({ args }) => args[0] === "-m" && args[1] === "copier");
}

test("reads and validates the generated stack manifest", () => {
  assert.deepEqual(
    readStackConfig(projectRoot, (path) => {
      assert.equal(path, `${projectRoot}/${STACK_CONFIG_FILENAME}`);
      return stackConfig;
    }),
    JSON.parse(stackConfig)
  );
});

test("passes generated stack features to Copier during updates", () => {
  const calls = [];
  const execute = (command, args, options) => {
    calls.push({ args, command, options });
    return command === "git"
      ? { status: 1, stderr: "", stdout: "" }
      : { status: 0, stderr: "", stdout: "" };
  };

  assert.equal(
    updateTemplate(["--defaults"], {
      cwd: projectRoot,
      environment: { PATH: "/usr/bin" },
      execute,
      exists: () => true,
      platform: "darwin",
      readFile: () => stackConfig
    }),
    0
  );
  assert.deepEqual(copierCall(calls).args, [
    "-m",
    "copier",
    "update",
    "--trust",
    ...expectedStackArguments,
    "--defaults"
  ]);
});

test("TEST-UPDATE-013 previews without writing", () => {
  const calls = [];
  const writes = [];
  const execute = (command, args, options) => {
    calls.push({ args, command, options });
    return command === "git"
      ? { status: 1, stderr: "", stdout: "" }
      : { status: 0, stderr: "", stdout: "" };
  };

  assert.equal(
    updateTemplate(["--dry-run"], {
      cwd: projectRoot,
      environment: { PATH: "/usr/bin" },
      execute,
      exists: () => true,
      platform: "darwin",
      readFile: () => stackConfig,
      readFileSync: () => skillTriggers,
      writeFileSync: (path, contents) => writes.push({ contents, path })
    }),
    0
  );

  assert.deepEqual(copierCall(calls).args, [
    "-m",
    "copier",
    "update",
    "--trust",
    ...expectedStackArguments,
    "--pretend",
    "--defaults"
  ]);
  assert.equal(writes.length, 0);
});

test("TEST-UPDATE-014 preserves update arguments during preview", () => {
  const calls = [];
  const execute = (command, args) => {
    calls.push({ args, command });
    return command === "git"
      ? { status: 1, stderr: "", stdout: "" }
      : { status: 0, stderr: "", stdout: "" };
  };

  updateTemplate(["--dry-run", "--vcs-ref", "v1.2.0"], {
    cwd: projectRoot,
    environment: { PATH: "/usr/bin" },
    execute,
    exists: () => true,
    platform: "darwin",
    readFile: () => stackConfig
  });

  assert.deepEqual(copierCall(calls).args.slice(-4), [
    "--pretend",
    "--defaults",
    "--vcs-ref",
    "v1.2.0"
  ]);
});

test("synchronizes skill triggers after a template update", () => {
  const calls = [];
  const writes = [];
  const execute = (command, args, options) => {
    calls.push({ args, command, options });
    return command === "git"
      ? { status: 1, stderr: "", stdout: "" }
      : { status: 0, stderr: "", stdout: "" };
  };
  const readFile = (path) =>
    path.endsWith(".claude/skill-triggers.json") ? skillTriggers : stackConfig;

  assert.equal(
    updateTemplate(["--defaults"], {
      cwd: projectRoot,
      environment: { PATH: "/usr/bin" },
      execute,
      exists: () => true,
      platform: "darwin",
      readFile,
      readFileSync: readFile,
      writeFileSync: (path, contents) => writes.push({ contents, path })
    }),
    0
  );

  assert.equal(writes.length, 1);
  const rules = JSON.parse(writes[0].contents).rules;
  assert.ok(
    rules.some(
      (rule) =>
        rule.when[0] === "apps/dashboard/**" &&
        rule.require[0] === "frontend-standards"
    )
  );
  assert.ok(
    rules.some(
      (rule) =>
        rule.when[0] === "apps/expo/**" &&
        rule.require[0] === "frontend-standards"
    )
  );
  assert.ok(!rules.some((rule) => rule.when[0] === "apps/web/**"));
  assert.ok(rules.some((rule) => rule.when[0][0] === "*"));
  assert.equal(calls.filter(({ command }) => command !== "git").length, 1);
});

test("TEST-UPDATE-015 keeps normal update side effects enabled", () => {
  const writes = [];
  const execute = (command) =>
    command === "git"
      ? { status: 1, stderr: "", stdout: "" }
      : { status: 0, stderr: "", stdout: "" };

  assert.equal(
    updateTemplate(["--defaults"], {
      cwd: projectRoot,
      environment: { PATH: "/usr/bin" },
      execute,
      exists: () => true,
      platform: "darwin",
      readFile: () => stackConfig,
      readFileSync: () => skillTriggers,
      writeFileSync: (path, contents) => writes.push({ contents, path })
    }),
    0
  );

  assert.equal(writes.length, 1);
});

test("failed template update leaves triggers unchanged", () => {
  const writes = [];
  const execute = (command) =>
    command === "git"
      ? { status: 1, stderr: "", stdout: "" }
      : { status: 1, stderr: "update failed", stdout: "" };

  assert.equal(
    updateTemplate(["--defaults"], {
      cwd: projectRoot,
      environment: { PATH: "/usr/bin" },
      execute,
      exists: () => true,
      platform: "darwin",
      readFile: () => stackConfig,
      readFileSync: () => skillTriggers,
      writeFileSync: (path, contents) => writes.push({ contents, path })
    }),
    1
  );

  assert.equal(writes.length, 0);
});

test("TEST-UPDATE-010 reuses recorded answers for a bare update", () => {
  const calls = [];
  const execute = (command, args) => {
    calls.push({ args, command });
    return command === "git"
      ? { status: 1, stderr: "", stdout: "" }
      : { status: 0, stderr: "", stdout: "" };
  };

  updateTemplate([], {
    ...validStackDependencies,
    cwd: projectRoot,
    environment: { PATH: "/usr/bin" },
    execute,
    exists: () => true,
    platform: "darwin",
    readFile: () => stackConfig
  });

  assert.deepEqual(copierCall(calls).args, [
    "-m",
    "copier",
    "update",
    "--trust",
    ...expectedStackArguments,
    "--defaults"
  ]);
});

test("TEST-UPDATE-011 preserves explicit update arguments", () => {
  const calls = [];
  const execute = (command, args) => {
    calls.push({ args, command });
    return command === "git"
      ? { status: 1, stderr: "", stdout: "" }
      : { status: 0, stderr: "", stdout: "" };
  };

  updateTemplate(["--vcs-ref", "v1.2.0"], {
    ...validStackDependencies,
    cwd: projectRoot,
    environment: { PATH: "/usr/bin" },
    execute,
    exists: () => true,
    platform: "darwin",
    readFile: () => stackConfig
  });

  assert.deepEqual(copierCall(calls).args.slice(-3), [
    "--defaults",
    "--vcs-ref",
    "v1.2.0"
  ]);
});

test("rejects a missing stack manifest before invoking Copier", () => {
  let copierCalled = false;
  assert.throws(
    () =>
      updateTemplate([], {
        cwd: projectRoot,
        environment: {},
        execute: () => {
          copierCalled = true;
          return { status: 0 };
        },
        exists: () => true,
        platform: "darwin",
        readFile: () => {
          const error = new Error("missing");
          error.code = "ENOENT";
          throw error;
        }
      }),
    /Stack configuration is missing/
  );
  assert.equal(copierCalled, false);
});

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
      ...validStackDependencies,
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
      args: [
        "-m",
        "copier",
        "update",
        "--trust",
        ...expectedStackArguments,
        "--defaults"
      ],
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
      ...validStackDependencies,
      cwd: projectRoot,
      environment,
      execute,
      exists: () => true,
      platform: "darwin"
    }),
    0
  );
  assert.deepEqual(copierCall(calls).options.env, environment);
});

test("explains how to repair a missing update environment", () => {
  assert.throws(
    () =>
      updateTemplate([], {
        ...validStackDependencies,
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
        ...validStackDependencies,
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
        ...validStackDependencies,
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
        ...validStackDependencies,
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
        ...validStackDependencies,
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
