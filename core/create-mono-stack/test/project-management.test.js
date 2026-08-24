import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import test from "node:test";

import {
  addApp,
  addPackage,
  listUserPackages,
  MANAGEABLE_APP_DEFINITIONS,
  removeApp,
  removePackage
} from "../src/project-management.js";

const defaultApps = [
  {
    feature: "web-vite",
    generator: "vite",
    name: "web",
    path: "apps/web",
    referenceProfile: "vite/react-ts"
  },
  {
    feature: "api-nest",
    generator: "nestjs",
    name: "server",
    path: "apps/server",
    referenceProfile: "nestjs/default"
  }
];

const skillTriggers = {
  always: ["test-first-workflow"],
  rules: [
    { when: ["**/*.test.*"], require: ["testing-policy"] },
    { when: ["apps/web/**"], require: ["frontend-standards"] },
    { when: ["apps/server/**"], require: ["backend-standards"] },
    { when: ["**/*.tsx"], require: ["react-19"] }
  ],
  exempt: [".claude/**"]
};

async function project() {
  const cwd = await mkdtemp(join(tmpdir(), "project-management-"));
  await mkdir(join(cwd, ".claude"), { recursive: true });
  await writeFile(
    join(cwd, ".claude/skill-triggers.json"),
    `${JSON.stringify(skillTriggers, null, 2)}\n`
  );
  await mkdir(join(cwd, "apps", "web"), { recursive: true });
  await mkdir(join(cwd, "apps", "server"), { recursive: true });
  await writeFile(join(cwd, "apps", "web", "sentinel.txt"), "keep");
  await writeFile(
    join(cwd, ".mono-stack.json"),
    `${JSON.stringify(
      {
        schemaVersion: 3,
        features: ["web-vite", "api-nest"],
        apps: defaultApps
      },
      null,
      2
    )}\n`
  );
  return cwd;
}

async function cleanup(cwd) {
  await rm(cwd, { force: true, recursive: true });
}

function commandRecorder(cwd) {
  const calls = [];
  const runCommand = async (command, args) => {
    calls.push({ args, command });
    const appPath = args.find((value) => value.startsWith("apps/"));
    if (appPath) {
      const appRoot = join(cwd, appPath);
      const appName = basename(appPath);
      await mkdir(appRoot, { recursive: true });
      await writeFile(
        join(appRoot, "package.json"),
        JSON.stringify({
          name: appName,
          version: "0.0.0",
          dependencies: {
            react: "19.2.3",
            "react-dom": "19.2.3",
            "react-native": "0.87.0"
          },
          devDependencies: {
            typescript: "6.0.3",
            vite: "8.0.0"
          }
        })
      );
      if (args[0] === "create" && args[1] === "vite") {
        await mkdir(join(appRoot, "src"), { recursive: true });
        await writeFile(join(appRoot, "src", "main.tsx"), "export {};");
      }
    }
    if (args[0] === "package:create") {
      await mkdir(join(cwd, "packages", args[1]), { recursive: true });
      await writeFile(
        join(cwd, "packages", args[1], "package.json"),
        JSON.stringify({ name: `@monorepo-template/${args[1]}` })
      );
    }
  };
  return { calls, runCommand };
}

test("TEST-MANAGE-002 adds an app without replacing existing apps", async () => {
  const cwd = await project();
  try {
    const recorder = commandRecorder(cwd);
    const app = await addApp(
      cwd,
      { feature: "web-next", name: "admin-next" },
      recorder
    );
    const manifest = JSON.parse(
      await readFile(join(cwd, ".mono-stack.json"), "utf8")
    );
    assert.equal(app.path, "apps/admin-next");
    assert.equal(
      await readFile(join(cwd, "apps/web/sentinel.txt"), "utf8"),
      "keep"
    );
    assert.equal(manifest.apps.length, 3);
    const triggers = JSON.parse(
      await readFile(join(cwd, ".claude/skill-triggers.json"), "utf8")
    );
    assert.ok(
      triggers.rules.some(
        (rule) =>
          rule.when[0] === "apps/admin-next/**" &&
          rule.require[0] === "frontend-standards"
      )
    );
    assert.deepEqual(recorder.calls.at(-1), {
      command: "pnpm",
      args: ["install"]
    });
  } finally {
    await cleanup(cwd);
  }
});

test("TEST-MANAGE-007 adds a React Native app with its reference profile", async () => {
  const cwd = await project();
  try {
    const recorder = commandRecorder(cwd);
    const app = await addApp(
      cwd,
      { feature: "mobile-react-native", name: "mobileApp3" },
      recorder
    );
    const manifest = JSON.parse(
      await readFile(join(cwd, ".mono-stack.json"), "utf8")
    );
    const packageJson = JSON.parse(
      await readFile(join(cwd, "apps/mobileApp3/package.json"), "utf8")
    );
    assert.equal(app.referenceProfile, "react-native/default");
    assert.equal(manifest.apps.at(-1).referenceProfile, "react-native/default");
    assert.equal(packageJson.dependencies.nativewind, "5.0.0-preview.4");
    assert.equal(
      await readFile(
        join(cwd, "apps/mobileApp3/src/screens/reference.tsx"),
        "utf8"
      ).then(() => true),
      true
    );
    assert.equal(
      await readFile(join(cwd, "apps/web/sentinel.txt"), "utf8"),
      "keep"
    );
  } finally {
    await cleanup(cwd);
  }
});

test("TEST-MANAGE-001 assigns profiles to every supported generator", () => {
  assert.deepEqual(
    MANAGEABLE_APP_DEFINITIONS.map(({ feature, referenceProfile }) => [
      feature,
      referenceProfile
    ]),
    [
      ["web-vite", "vite/react-ts"],
      ["web-next", "next/default"],
      ["api-nest", "nestjs/default"],
      ["mobile-expo", "expo/default"],
      ["mobile-react-native", "react-native/default"]
    ]
  );
});

test("TEST-MANAGE-003 removes an app and updates its feature", async () => {
  const cwd = await project();
  try {
    const recorder = commandRecorder(cwd);
    assert.equal(
      await removeApp(cwd, "server", { confirmed: true, ...recorder }),
      true
    );
    await assert.rejects(readFile(join(cwd, "apps/server")), {
      code: "ENOENT"
    });
    const manifest = JSON.parse(
      await readFile(join(cwd, ".mono-stack.json"), "utf8")
    );
    assert.deepEqual(manifest.features, ["web-vite"]);
    assert.equal(manifest.apps[0].name, "web");
    const triggers = JSON.parse(
      await readFile(join(cwd, ".claude/skill-triggers.json"), "utf8")
    );
    assert.ok(
      !triggers.rules.some((rule) => rule.when[0] === "apps/server/**")
    );
    assert.ok(triggers.rules.some((rule) => rule.when[0] === "apps/web/**"));
  } finally {
    await cleanup(cwd);
  }
});

test("TEST-MANAGE-004 declines app removal without side effects", async () => {
  const cwd = await project();
  try {
    let installed = false;
    assert.equal(
      await removeApp(cwd, "server", {
        confirmed: false,
        runCommand: async () => {
          installed = true;
        }
      }),
      false
    );
    assert.equal(installed, false);
    assert.equal(
      await readFile(join(cwd, "apps/server"), "utf8").catch(() => "exists"),
      "exists"
    );
  } finally {
    await cleanup(cwd);
  }
});

test("TEST-MANAGE-005 lists and adds user packages", async () => {
  const cwd = await project();
  try {
    await mkdir(join(cwd, "packages", "entities"), { recursive: true });
    await writeFile(
      join(cwd, "packages", "entities", "package.json"),
      JSON.stringify({ name: "@monorepo-template/entities" })
    );
    const recorder = commandRecorder(cwd);
    await addPackage(cwd, "billing", recorder);
    const packages = await listUserPackages(cwd);
    assert.deepEqual(
      packages.map(({ name }) => name),
      ["billing"]
    );
    assert.deepEqual(recorder.calls.at(-1), {
      command: "pnpm",
      args: ["install"]
    });
  } finally {
    await cleanup(cwd);
  }
});

test("TEST-MANAGE-006 rejects template-owned package removal", async () => {
  let removed = false;
  await assert.rejects(
    removePackage("/workspace/project", "entities", {
      confirmed: true,
      remove: async () => {
        removed = true;
      }
    }),
    /template-owned package cannot be removed/
  );
  assert.equal(removed, false);
});
