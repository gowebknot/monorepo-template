import assert from "node:assert/strict";
import test from "node:test";

import { createProject, main } from "#src/create-project.js";

const destination = "/workspace/acme-platform";

const skillTriggers = JSON.stringify({
  always: ["test-first-workflow"],
  rules: [
    { when: ["apps/web/**"], require: ["frontend-standards"] },
    { when: ["apps/server/**"], require: ["backend-standards"] },
    { when: ["**/*.tsx"], require: ["react-19"] }
  ],
  exempt: [".claude/**"]
});

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
    readFile: async (path) => {
      if (path.endsWith(".claude/skill-triggers.json")) return skillTriggers;
      throw Object.assign(new Error("missing"), { code: "ENOENT" });
    },
    rm: async () => {},
    copyFile: async (source, target) => {
      events.push({ source, target, type: "copyFile" });
    },
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
    "api-nest": ["server-app-1"],
    "web-vite": ["web-app-1"]
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
      appNames: { "api-nest": ["api"], "web-vite": ["dashboard"] },
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
    apps: [
      { ...apps[0], ports: { dev: 5173, reference: 5173 } },
      { ...apps[1], ports: { dev: 3000, reference: 3001 } }
    ]
  });
});

test("TEST-TRIGGER-002 writes rules for custom generated app names", async () => {
  const events = [];
  const apps = [
    {
      feature: "web-vite",
      generator: "vite",
      name: "admin-react",
      path: "apps/admin-react",
      referenceProfile: "vite/react-ts"
    },
    {
      feature: "mobile-expo",
      generator: "expo",
      name: "student-expo",
      path: "apps/student-expo",
      referenceProfile: "expo/default"
    }
  ];

  await createProject(
    {
      destination,
      features: ["web-vite", "mobile-expo"],
      projectName: "Acme Platform",
      python: "python3",
      template: "/workspace/template"
    },
    projectDependencies({ apps, events })
  );

  const triggerWrite = events.find(
    ({ path, type }) => type === "write" && path.endsWith("skill-triggers.json")
  );
  assert.ok(triggerWrite);
  const rules = JSON.parse(triggerWrite.contents).rules;
  assert.ok(
    rules.some(
      (rule) =>
        rule.when[0] === "apps/admin-react/**" &&
        rule.require[0] === "frontend-standards"
    )
  );
  assert.ok(
    rules.some(
      (rule) =>
        rule.when[0] === "apps/student-expo/**" &&
        rule.require[0] === "frontend-standards"
    )
  );
  assert.ok(!rules.some((rule) => rule.when[0] === "apps/web/**"));
});

test("TEST-ENV-002 copies the environment example to the local environment", async () => {
  const events = [];

  await createProject(
    {
      destination,
      projectName: "Acme Platform",
      python: "python3",
      template: "/workspace/template"
    },
    projectDependencies({ events })
  );

  const copy = events.find((event) => event.type === "copyFile");
  const copierIndex = events.findIndex(
    (event) =>
      event.type === "command" &&
      event.command === "python3" &&
      event.args[0] === "-m" &&
      event.args[1] === "copier"
  );
  assert.deepEqual(copy, {
    source: `${destination}/.env.example`,
    target: `${destination}/.env`,
    type: "copyFile"
  });
  assert.ok(copierIndex < events.indexOf(copy));
});

test("TEST-TRUST-002 does not trust a custom --template source", async () => {
  const events = [];

  await createProject(
    {
      destination,
      projectName: "Acme Platform",
      python: "python3",
      template: "/workspace/template"
    },
    projectDependencies({ events })
  );

  const copierCall = events.find(
    (event) =>
      event.type === "command" &&
      event.args[0] === "-m" &&
      event.args[1] === "copier"
  );
  assert.ok(copierCall);
  assert.ok(!copierCall.args.includes("--trust"));
});

test("TEST-E2EFLAG-009 excludes maestro and playwright when their features are absent", async () => {
  const events = [];

  await createProject(
    {
      destination,
      features: ["api-nest"],
      projectName: "Acme Platform",
      python: "python3",
      template: "/workspace/template"
    },
    projectDependencies({ events })
  );

  const copierCall = events.find(
    (event) =>
      event.type === "command" &&
      event.args[0] === "-m" &&
      event.args[1] === "copier"
  );
  assert.ok(copierCall.args.includes("include_maestro_tests=false"));
  assert.ok(copierCall.args.includes("include_playwright_tests=false"));
});

test("TEST-E2EFLAG-010 includes maestro and playwright by default when their features are present", async () => {
  const events = [];

  await createProject(
    {
      destination,
      features: ["web-vite", "mobile-expo"],
      projectName: "Acme Platform",
      python: "python3",
      template: "/workspace/template"
    },
    projectDependencies({ events })
  );

  const copierCall = events.find(
    (event) =>
      event.type === "command" &&
      event.args[0] === "-m" &&
      event.args[1] === "copier"
  );
  assert.ok(copierCall.args.includes("include_maestro_tests=true"));
  assert.ok(copierCall.args.includes("include_playwright_tests=true"));
});

test("TEST-E2EFLAG-011 honors an explicit opt-out even when the feature is present", async () => {
  const events = [];

  await createProject(
    {
      destination,
      features: ["web-vite"],
      includePlaywright: false,
      projectName: "Acme Platform",
      python: "python3",
      template: "/workspace/template"
    },
    projectDependencies({ events })
  );

  const copierCall = events.find(
    (event) =>
      event.type === "command" &&
      event.args[0] === "-m" &&
      event.args[1] === "copier"
  );
  assert.ok(copierCall.args.includes("include_playwright_tests=false"));
});

test("TEST-ENV-006 explains when a template lacks the environment example", async () => {
  const dependencies = projectDependencies();
  dependencies.copyFile = async () => {
    const error = new Error("missing");
    error.code = "ENOENT";
    throw error;
  };

  await assert.rejects(
    createProject(
      {
        destination,
        projectName: "Acme Platform",
        python: "python3",
        template: "/workspace/custom-template"
      },
      dependencies
    ),
    /custom template must provide \.env\.example.*\/workspace\/acme-platform/i
  );
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
