import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  DEFAULT_TEMPLATE_SOURCE,
  DEFAULT_TEMPLATE_REF,
  createProject,
  main,
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

test("uses the current template branch when no revision is provided", () => {
  assert.equal(DEFAULT_TEMPLATE_REF, "master");
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

test("parses an explicit feature selection", () => {
  assert.deepEqual(
    parseArguments(
      ["acme-platform", "--features", "web-vite,api-express,mobile-expo"],
      "/workspace"
    ).features,
    ["web-vite", "api-express", "mobile-expo"]
  );
});

test("rejects invalid feature selections before setup", () => {
  assert.throws(
    () => parseArguments(["acme-platform", "--features", "web-vite,unknown"]),
    /unknown feature ID/
  );
});

test("TEST-MULTI-005 appends repeated --app-name flags for the same feature", () => {
  assert.deepEqual(
    parseArguments(
      [
        "acme-platform",
        "--app-name",
        "web-next:next",
        "--app-name",
        "web-next:admin-next"
      ],
      "/workspace"
    ).appNames,
    { "web-next": ["next", "admin-next"] }
  );
});

test("advertises the zero-argument interactive wizard in help", async () => {
  const messages = [];

  await main(["--help"], { log: (message) => messages.push(message) });

  assert.equal(messages.length, 1);
  assert.match(messages[0], /create-mono-stack\n/);
  assert.match(messages[0], /without arguments.*interactive setup/i);
});

test("opens the project wizard when no arguments are passed in a TTY", async () => {
  const input = { isTTY: true };
  const output = { isTTY: true };
  const messages = [];
  let createdOptions;

  await main([], {
    createProject: async (options) => {
      createdOptions = options;
    },
    cwd: "/workspace",
    input,
    log: (message) => messages.push(message),
    output,
    promptForProjectArguments: async (streams) => {
      assert.deepEqual(streams, { input, output });
      return ["--name=Acme Platform", "--", "acme-platform"];
    }
  });

  assert.deepEqual(createdOptions, {
    destination: "/workspace/acme-platform",
    gitHostAlias: undefined,
    projectName: "Acme Platform",
    python: undefined,
    template: DEFAULT_TEMPLATE_SOURCE,
    vcsRef: undefined
  });
  assert.deepEqual(messages, [
    `Project setup complete. Native app scaffolding, dependencies, and Git initialization finished.

What's next:
  cd /workspace/acme-platform
  pnpm install
  git add .
  git commit -m "chore: initialize project"
  pnpm dev

Git is initialized on main; create the initial commit before template updates.`
  ]);
});

test("does not open the project wizard without an interactive terminal", async () => {
  let wizardOpened = false;
  let projectCreated = false;

  await assert.rejects(
    main([], {
      createProject: async () => {
        projectCreated = true;
      },
      input: { isTTY: false },
      output: { isTTY: true },
      promptForProjectArguments: async () => {
        wizardOpened = true;
        return ["should-not-run"];
      }
    }),
    /Exactly one destination directory is required/
  );
  assert.equal(wizardOpened, false);
  assert.equal(projectCreated, false);
});

test("cancels the project wizard before setup starts", async () => {
  const messages = [];
  let projectCreated = false;

  await main([], {
    createProject: async () => {
      projectCreated = true;
    },
    input: { isTTY: true },
    log: (message) => messages.push(message),
    output: { isTTY: true },
    promptForProjectArguments: async () => undefined
  });

  assert.equal(projectCreated, false);
  assert.deepEqual(messages, ["Project setup cancelled."]);
});

test("keeps explicit CLI arguments non-interactive", async () => {
  let createdOptions;

  await main(["acme-platform", "--name", "Acme Platform"], {
    createProject: async (options) => {
      createdOptions = options;
    },
    cwd: "/workspace",
    input: { isTTY: true },
    log: () => {},
    output: { isTTY: true },
    promptForProjectArguments: async () =>
      assert.fail("Explicit arguments must bypass the wizard")
  });

  assert.equal(createdOptions.destination, "/workspace/acme-platform");
  assert.equal(createdOptions.projectName, "Acme Platform");
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
    temporaryDirectory: "/tmp",
    writeFile: async () => {},
    copyFile: async () => {}
  };

  await createProject(
    {
      destination,
      projectName: "Acme Platform; not a shell command",
      python: "/custom/python",
      template: "/workspace/template",
      vcsRef: "HEAD",
      features: ["web-vite", "api-express"]
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
        "--quiet",
        "--data",
        "project_name=Acme Platform; not a shell command",
        "--data",
        'features_json="[\\"web-vite\\",\\"api-express\\"]"',
        "--data",
        "feature_web_vite=true",
        "--data",
        "feature_api_nest=false",
        "--data",
        "feature_web_next=false",
        "--data",
        "feature_api_express=true",
        "--data",
        "feature_mobile_expo=false",
        "--data",
        "feature_mobile_react_native=false",
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
  assert.deepEqual(
    calls.find(({ command }) => command === "pnpm"),
    {
      command: "pnpm",
      args: ["install", "--lockfile-only"],
      options: { cwd: destination }
    }
  );
  assert.ok(
    calls.findIndex(({ command }) => command === "pnpm") >
      calls.findIndex(({ args }) => args[0] === "-m" && args[1] === "copier")
  );
  assert.deepEqual(removals, [
    [temporaryRoot, { force: true, recursive: true }]
  ]);
});

test("runs native scaffolding for wizard-shaped app names", async () => {
  let scaffoldOptions;
  await createProject(
    {
      appNames: { "web-vite": ["dashboard"], "api-nest": ["api"] },
      destination: "/workspace/acme-platform",
      features: ["web-vite", "api-nest"],
      projectName: "Acme Platform",
      python: "python3",
      template: "/workspace/template"
    },
    {
      environment: { PATH: "/usr/bin" },
      mkdtemp: async () => "/tmp/create-mono-stack-native",
      platform: "darwin",
      readdir: async () => missingPath(),
      rm: async () => {},
      runCommand: async (command, args, options = {}) => {
        if (options.capture && command !== "git") {
          return { stderr: "", stdout: "3.14.7\n" };
        }
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
        return { stderr: "", stdout: "" };
      },
      scaffoldNativeApps: async (options) => {
        scaffoldOptions = options;
        return [];
      },
      temporaryDirectory: "/tmp",
      writeFile: async () => {},
      copyFile: async () => {}
    }
  );
  assert.deepEqual(scaffoldOptions.appNames, {
    "web-vite": ["dashboard"],
    "api-nest": ["api"]
  });
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
        scaffoldNativeApps: async () => [],
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
        temporaryDirectory: "/tmp",
        writeFile: async () => {},
        copyFile: async () => {}
      }
    ),
    /Copier failed/
  );
  assert.deepEqual(removed, [
    ["/workspace/acme-platform", { force: true, recursive: true }],
    ["/tmp/create-mono-stack-failure", { force: true, recursive: true }]
  ]);
});

test("TEST-CREATE-002 cleans up when final lockfile generation fails", async () => {
  const commands = [];
  const copied = [];
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
        mkdtemp: async () => "/tmp/create-mono-stack-dependency-failure",
        platform: "darwin",
        readdir: async () => missingPath(),
        rm: async (...args) => removed.push(args),
        scaffoldNativeApps: async () => [],
        runCommand: async (command, args, options = {}) => {
          commands.push({ args, command });
          if (command === "git" && args[0] === "--version") {
            return { stderr: "", stdout: "git version 2.50.0\n" };
          }
          if (options.capture) return { stderr: "", stdout: "3.14.7\n" };
          if (
            command === "pnpm" &&
            args[0] === "install" &&
            args[1] === "--lockfile-only"
          ) {
            throw new Error("Registry unavailable");
          }
          return { stderr: "", stdout: "" };
        },
        temporaryDirectory: "/tmp",
        writeFile: async () => {},
        copyFile: async (...args) => copied.push(args)
      }
    ),
    /Registry unavailable/
  );
  assert.deepEqual(removed, [
    ["/workspace/acme-platform", { force: true, recursive: true }],
    [
      "/tmp/create-mono-stack-dependency-failure",
      { force: true, recursive: true }
    ]
  ]);
  assert.deepEqual(copied, [
    ["/workspace/acme-platform/.env.example", "/workspace/acme-platform/.env"]
  ]);
  assert.equal(
    commands.some(
      ({ args, command }) =>
        command === "python3" && args.includes("/workspace/acme-platform/.venv")
    ),
    false
  );
  assert.equal(
    commands.some(
      ({ args, command }) => command === "git" && args[0] === "init"
    ),
    false
  );
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
        scaffoldNativeApps: async () => [],
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
        temporaryDirectory: "/tmp",
        writeFile: async () => {},
        copyFile: async () => {}
      }
    ),
    /Git initialization failed: Git is unavailable/
  );
  assert.deepEqual(removed, [
    ["/workspace/acme-platform", { force: true, recursive: true }],
    ["/tmp/create-mono-stack-git-failure", { force: true, recursive: true }]
  ]);
});
