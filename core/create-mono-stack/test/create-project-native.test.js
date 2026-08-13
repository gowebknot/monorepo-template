import assert from "node:assert/strict";
import test from "node:test";

import { createProject, main } from "../src/create-project.js";

const destination = "/workspace/acme-platform";

function missingPath() {
  const error = new Error("missing");
  error.code = "ENOENT";
  throw error;
}

function projectDependencies({ apps = [], events = [], scaffold } = {}) {
  return {
    environment: { PATH: "/usr/bin" },
    mkdtemp: async () => "/tmp/create-mono-stack-native-test",
    platform: "darwin",
    readdir: async () => missingPath(),
    rm: async () => {},
    runCommand: async (command, args, options = {}) => {
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
      if (options.capture) {
        return { stderr: "", stdout: "3.14.7\n" };
      }
      events.push({ args, command, type: "command" });
      return { stderr: "", stdout: "" };
    },
    scaffoldNativeApps: async (options) => {
      events.push({ options, type: "scaffold" });
      return scaffold ? scaffold(options) : apps;
    },
    temporaryDirectory: "/tmp",
    writeFile: async (path, contents) => {
      events.push({ contents, path, type: "write" });
    }
  };
}

test("TEST-SELECTION-001 scaffolds default Vite and NestJS apps", async () => {
  let scaffoldOptions;
  await createProject(
    {
      destination,
      projectName: "Acme Platform",
      python: "python3",
      template: "/workspace/template"
    },
    projectDependencies({
      scaffold(options) {
        scaffoldOptions = options;
        return [];
      }
    })
  );

  assert.deepEqual(scaffoldOptions.features, ["web-vite", "api-nest"]);
  assert.deepEqual(scaffoldOptions.appNames, {
    "api-nest": "server",
    "web-vite": "web"
  });
});

test("TEST-MANIFEST-001 writes the current stack manifest", async () => {
  const events = [];
  const apps = [
    {
      feature: "web-vite",
      generator: "vite",
      name: "dashboard",
      path: "apps/dashboard",
      referenceProfile: "vite/react-ts"
    },
    {
      feature: "api-nest",
      generator: "nestjs",
      name: "api",
      path: "apps/api",
      referenceProfile: "nestjs/default"
    }
  ];

  await createProject(
    {
      appNames: { "api-nest": "api", "web-vite": "dashboard" },
      destination,
      features: ["web-vite", "api-nest"],
      projectName: "Acme Platform",
      python: "python3",
      template: "/workspace/template"
    },
    projectDependencies({ apps, events })
  );

  const manifestWrite = events.find(
    (event) =>
      event.type === "write" && event.path.endsWith("/.mono-stack.json")
  );
  assert.deepEqual(JSON.parse(manifestWrite.contents), {
    schemaVersion: 3,
    features: ["web-vite", "api-nest"],
    apps
  });
});

test("TEST-CREATE-001 generates one final lockfile after metadata", async () => {
  const events = [];

  await createProject(
    {
      destination,
      features: ["api-express"],
      projectName: "Acme Platform",
      python: "python3",
      template: "/workspace/template"
    },
    projectDependencies({ events })
  );

  const scaffoldIndex = events.findIndex((event) => event.type === "scaffold");
  const manifestIndex = events.findIndex(
    (event) =>
      event.type === "write" && event.path.endsWith("/.mono-stack.json")
  );
  const pnpmEvents = events.filter(
    (event) => event.type === "command" && event.command === "pnpm"
  );
  assert.equal(pnpmEvents.length, 1);
  assert.deepEqual(pnpmEvents[0].args, ["install", "--lockfile-only"]);
  const lockfileIndex = events.indexOf(pnpmEvents[0]);
  assert.ok(scaffoldIndex < manifestIndex);
  assert.ok(manifestIndex < lockfileIndex);
});

test("TEST-CREATE-003 reports unsupported Vite reference mode", async () => {
  const messages = [];

  await main(["portal"], {
    createProject: async () => ({
      apps: [
        {
          feature: "web-vite",
          generator: "vite",
          name: "portal",
          path: "apps/portal",
          referenceProfile: null
        }
      ],
      features: ["web-vite"]
    }),
    cwd: "/workspace",
    log: (message) => messages.push(message)
  });

  assert.equal(messages.length, 1);
  assert.match(
    messages[0],
    /Web reference mode was skipped for portal because only Vite React TypeScript is supported/
  );
  assert.doesNotMatch(messages[0], /portal.*has web reference support/i);
});
