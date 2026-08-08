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

test("creates a project through an isolated pinned Copier environment", async () => {
  const calls = [];
  const removals = [];
  const temporaryRoot = "/tmp/create-mono-stack-fixture";
  const destination = "/workspace/acme-platform";
  const dependencies = {
    mkdtemp: async (prefix) => {
      assert.equal(prefix, "/tmp/create-mono-stack-");
      return temporaryRoot;
    },
    platform: "darwin",
    readdir: async () => missingPath(),
    rm: async (...args) => removals.push(args),
    runCommand: async (command, args, options = {}) => {
      calls.push({ args, command, options });
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
  assert.deepEqual(calls, [
    {
      command: "/custom/python",
      args: ["-c", versionScript],
      options: { capture: true }
    },
    {
      command: "/custom/python",
      args: ["-m", "venv", virtualEnvironment],
      options: {}
    },
    {
      command: virtualPython,
      args: [
        "-m",
        "pip",
        "install",
        "--disable-pip-version-check",
        "--no-input",
        "--requirement",
        join(repositoryRoot, "core/create-mono-stack/requirements/copier.txt")
      ],
      options: {}
    },
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
      options: {}
    }
  ]);
  assert.deepEqual(removals, [
    [temporaryRoot, { force: true, recursive: true }]
  ]);
});

test("rejects an explicitly selected Python older than 3.10", async () => {
  let createdTemporaryDirectory = false;

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
        mkdtemp: async () => {
          createdTemporaryDirectory = true;
        },
        platform: "darwin",
        readdir: async () => missingPath(),
        rm: async () => {},
        runCommand: async () => ({ stderr: "", stdout: "3.9.6\n" }),
        temporaryDirectory: "/tmp"
      }
    ),
    /Python 3\.10 or newer/
  );
  assert.equal(createdTemporaryDirectory, false);
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
  let commandCount = 0;

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
        runCommand: async (_command, _args, options = {}) => {
          commandCount += 1;
          if (options.capture) {
            return { stderr: "", stdout: "3.14.7\n" };
          }
          if (commandCount === 4) throw new Error("Copier failed");
          return { stderr: "", stdout: "" };
        },
        temporaryDirectory: "/tmp"
      }
    ),
    /Copier failed/
  );
  assert.deepEqual(removed, [
    ["/tmp/create-mono-stack-failure", { force: true, recursive: true }]
  ]);
});
