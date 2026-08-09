import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  DEFAULT_TEMPLATE_SOURCE,
  createProject,
  parseArguments
} from "../src/create-project.js";

const versionScript =
  "import sys; print('.'.join(map(str, sys.version_info[:3])))";
const repositoryRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../.."
);

function missingPath() {
  const error = new Error("missing");
  error.code = "ENOENT";
  throw error;
}

test("parses a destination and uses the canonical GitHub template", () => {
  assert.deepEqual(parseArguments(["acme-platform"], "/workspace"), {
    destination: "/workspace/acme-platform",
    gitHostAlias: undefined,
    projectName: "acme-platform",
    python: undefined,
    template: DEFAULT_TEMPLATE_SOURCE,
    vcsRef: undefined
  });
  assert.equal(
    DEFAULT_TEMPLATE_SOURCE,
    "git@github.com:gowebknot/monorepo-template.git"
  );
});

test("records local template sources as absolute paths", () => {
  assert.equal(
    parseArguments(["acme-platform", "--template", "."], "/workspace/template")
      .template,
    "/workspace/template"
  );
  assert.equal(
    parseArguments(
      ["acme-platform", "--template", "git@github.com:example/template.git"],
      "/workspace"
    ).template,
    "git@github.com:example/template.git"
  );
});

test("creates a project through isolated pinned Copier environments", async () => {
  const calls = [];
  const removals = [];
  const temporaryRoot = "/tmp/create-mono-stack-fixture";
  const destination = "/workspace/acme-platform";
  const dependencies = {
    environment: {
      CUSTOM_ENV: "kept",
      GIT_DIR: "/tmp/wrong-repository",
      GIT_WORK_TREE: "/tmp/wrong-worktree",
      PATH: "/usr/bin"
    },
    mkdtemp: async (prefix) => {
      assert.equal(prefix, "/tmp/create-mono-stack-");
      return temporaryRoot;
    },
    platform: "darwin",
    readdir: async () => missingPath(),
    rm: async (...args) => removals.push(args),
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
      if (command === "git" && args.includes("rev-parse")) {
        return { stderr: "", stdout: ".git\n" };
      }
      if (command === "git" && args.includes("symbolic-ref")) {
        return { stderr: "", stdout: "main\n" };
      }
      return options.capture
        ? { stderr: "", stdout: "3.14.7\n" }
        : { stderr: "", stdout: "" };
    },
    temporaryDirectory: "/tmp"
  };

  await createProject(
    {
      destination,
      projectName: "Acme Platform; not a shell command",
      python: "/custom/python",
      template: "/workspace/template",
      vcsRef: "HEAD"
    },
    dependencies
  );

  const virtualEnvironment = join(temporaryRoot, "venv");
  const virtualPython = join(virtualEnvironment, "bin/python");
  const projectVirtualEnvironment = join(destination, ".venv");
  const projectPython = join(projectVirtualEnvironment, "bin/python");
  const packagedRequirements = join(
    repositoryRoot,
    "core/create-mono-stack/requirements/copier.txt"
  );
  const pythonProbe = calls.find(
    ({ args, command }) => command === "/custom/python" && args[0] === "-c"
  );
  assert.equal(pythonProbe.args[1], versionScript);
  assert.equal(pythonProbe.options.env.MISE_AUTO_INSTALL, "0");
  assert.equal(
    pythonProbe.options.env.PYTHON_MANAGER_AUTOMATIC_INSTALL,
    "false"
  );
  assert.deepEqual(
    calls.filter(({ args }) => args[0] === "-m" && args[1] === "venv"),
    [
      {
        command: "/custom/python",
        args: ["-m", "venv", virtualEnvironment],
        options: {}
      },
      {
        command: "/custom/python",
        args: ["-m", "venv", projectVirtualEnvironment],
        options: {}
      }
    ]
  );
  const pipCalls = calls.filter(
    ({ args }) => args[0] === "-m" && args[1] === "pip"
  );
  assert.deepEqual(
    pipCalls.map(({ args }) => args.at(-1)),
    [packagedRequirements, packagedRequirements]
  );
  assert.deepEqual(
    calls.find(({ args }) => args[0] === "-m" && args[1] === "copier"),
    {
      command: virtualPython,
      args: [
        "-m",
        "copier",
        "copy",
        "--defaults",
        "--data",
        "project_name=Acme Platform; not a shell command",
        "--vcs-ref",
        "HEAD",
        "/workspace/template",
        destination
      ],
      options: {
        env: { CUSTOM_ENV: "kept", PATH: "/usr/bin" },
        replaceEnvironment: true
      }
    }
  );
  assert.equal(pipCalls.at(-1).command, projectPython);
  assert.deepEqual(removals, [
    [temporaryRoot, { force: true, recursive: true }]
  ]);
});

test("refuses to modify a non-empty destination", async () => {
  let commandRan = false;

  await assert.rejects(
    createProject(
      {
        destination: "/workspace/existing",
        projectName: "Existing",
        python: "python3",
        template: DEFAULT_TEMPLATE_SOURCE,
        vcsRef: undefined
      },
      {
        mkdtemp: async () => "/tmp/unused",
        platform: "darwin",
        readdir: async () => ["keep.txt"],
        rm: async () => {},
        runCommand: async () => {
          commandRan = true;
          return { stderr: "", stdout: "3.14.7\n" };
        },
        temporaryDirectory: "/tmp"
      }
    ),
    /Destination directory is not empty/
  );
  assert.equal(commandRan, false);
});

test("removes the temporary environment when Copier fails", async () => {
  const removed = [];

  await assert.rejects(
    createProject(
      {
        destination: "/workspace/acme-platform",
        projectName: "Acme Platform",
        python: "python3",
        template: DEFAULT_TEMPLATE_SOURCE,
        vcsRef: undefined
      },
      {
        mkdtemp: async () => "/tmp/create-mono-stack-failure",
        platform: "darwin",
        readdir: async () => missingPath(),
        rm: async (...args) => removed.push(args),
        runCommand: async (command, args, options = {}) => {
          if (command === "git" && args[0] === "--version") {
            return { stderr: "", stdout: "git version 2.50.0\n" };
          }
          if (options.capture) {
            return { stderr: "", stdout: "3.14.7\n" };
          }
          if (args[0] === "-m" && args[1] === "copier") {
            throw new Error("Copier failed");
          }
          return { stderr: "", stdout: "" };
        },
        temporaryDirectory: "/tmp"
      }
    ),
    /Copier failed/
  );
  assert.deepEqual(removed, [
    ["/workspace/acme-platform", { force: true, recursive: true }],
    ["/tmp/create-mono-stack-failure", { force: true, recursive: true }]
  ]);
});

test("reports Git initialization failures after project setup", async () => {
  const removed = [];

  await assert.rejects(
    createProject(
      {
        destination: "/workspace/acme-platform",
        projectName: "Acme Platform",
        python: "python3",
        template: DEFAULT_TEMPLATE_SOURCE,
        vcsRef: undefined
      },
      {
        mkdtemp: async () => "/tmp/create-mono-stack-git-failure",
        platform: "darwin",
        readdir: async () => missingPath(),
        rm: async (...args) => removed.push(args),
        runCommand: async (command, args, options = {}) => {
          if (command === "git" && args[0] === "--version") {
            return { stderr: "", stdout: "git version 2.50.0\n" };
          }
          if (options.capture) {
            return { stderr: "", stdout: "3.14.7\n" };
          }
          if (command === "git" && args[0] === "init") {
            throw new Error("Git is unavailable");
          }
          return { stderr: "", stdout: "" };
        },
        temporaryDirectory: "/tmp"
      }
    ),
    /Git initialization failed: Git is unavailable/
  );
  assert.deepEqual(removed, [
    ["/workspace/acme-platform", { force: true, recursive: true }],
    ["/tmp/create-mono-stack-git-failure", { force: true, recursive: true }]
  ]);
});
