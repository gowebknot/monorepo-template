import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";

import {
  nativeScaffoldDependencies,
  scaffoldNativeApps,
  validateAppName
} from "../src/native-scaffold.js";
import {
  createNativeScaffoldFixture,
  pathExists,
  vueTypeScriptNativeTree
} from "./native-scaffold.helpers.js";

function dependencies(fixture, overrides = {}) {
  return {
    ...nativeScaffoldDependencies({}),
    runCommand: fixture.runCommand,
    temporaryRoot: fixture.temporaryRoot,
    ...overrides
  };
}

test("validates safe native app names", () => {
  assert.equal(validateAppName("admin-dashboard"), "admin-dashboard");
  for (const name of ["", "../web", "web/app", "web app", "--web"]) {
    assert.throws(() => validateAppName(name), /Invalid app name/);
  }
});

test("TEST-COMMAND-001 invokes interactive Vite without a template", async (t) => {
  const fixture = await createNativeScaffoldFixture(t);

  await scaffoldNativeApps(
    {
      appNames: { "web-vite": ["dashboard"] },
      destination: fixture.destination,
      features: ["web-vite"]
    },
    dependencies(fixture)
  );

  assert.deepEqual(fixture.calls, [
    {
      command: "pnpm",
      args: ["create", "vite", "vite-dashboard", "--no-immediate"],
      options: { cwd: fixture.temporaryRoot, stdio: "inherit" }
    }
  ]);
  assert.equal(fixture.calls[0].args.includes("--template"), false);
});

test("TEST-COMMAND-002 skips the nested NestJS install", async (t) => {
  const fixture = await createNativeScaffoldFixture(t);

  await scaffoldNativeApps(
    {
      appNames: { "api-nest": ["api"] },
      destination: fixture.destination,
      features: ["api-nest"]
    },
    dependencies(fixture)
  );

  assert.deepEqual(fixture.calls, [
    {
      command: "pnpm",
      args: [
        "dlx",
        "@nestjs/cli",
        "new",
        "nestjs-api",
        "--skip-git",
        "--package-manager",
        "pnpm",
        "--skip-install"
      ],
      options: { cwd: fixture.temporaryRoot, stdio: "inherit" }
    }
  ]);
});

test("TEST-COMMAND-005 invokes create-next-app with non-interactive flags", async (t) => {
  const fixture = await createNativeScaffoldFixture(t);

  const apps = await scaffoldNativeApps(
    {
      appNames: { "web-next": ["next"] },
      destination: fixture.destination,
      features: ["web-next"]
    },
    dependencies(fixture)
  );

  assert.deepEqual(fixture.calls, [
    {
      command: "pnpm",
      args: [
        "dlx",
        "create-next-app@latest",
        "next-next",
        "--ts",
        "--app",
        "--src-dir",
        "--eslint",
        "--tailwind",
        "--import-alias",
        "@/*",
        "--use-pnpm",
        "--skip-install",
        "--disable-git",
        "--yes"
      ],
      options: { cwd: fixture.temporaryRoot, stdio: "inherit" }
    }
  ]);
  assert.equal(apps[0].generator, "next");
  assert.equal(apps[0].selection, undefined);
});

test("TEST-COMMAND-006 invokes create-expo-app with non-interactive flags", async (t) => {
  const fixture = await createNativeScaffoldFixture(t);

  const apps = await scaffoldNativeApps(
    {
      appNames: { "mobile-expo": ["expo"] },
      destination: fixture.destination,
      features: ["mobile-expo"]
    },
    dependencies(fixture)
  );

  assert.deepEqual(fixture.calls, [
    {
      command: "pnpm",
      args: [
        "dlx",
        "create-expo-app@latest",
        "expo-expo",
        "--template",
        "blank-typescript",
        "--no-install"
      ],
      options: { cwd: fixture.temporaryRoot, stdio: "inherit" }
    }
  ]);
  assert.equal(apps[0].generator, "expo");
  assert.equal(apps[0].selection, undefined);
});

test("TEST-COMMAND-007 invokes React Native CLI with a PascalCase name and directory", async (t) => {
  const fixture = await createNativeScaffoldFixture(t);

  const apps = await scaffoldNativeApps(
    {
      appNames: { "mobile-react-native": ["mobile-app"] },
      destination: fixture.destination,
      features: ["mobile-react-native"]
    },
    dependencies(fixture)
  );

  assert.deepEqual(fixture.calls, [
    {
      command: "pnpm",
      args: [
        "dlx",
        "@react-native-community/cli@latest",
        "init",
        "MobileApp",
        "--directory",
        "react-native-mobile-app",
        "--skip-install",
        "--skip-git-init"
      ],
      options: { cwd: fixture.temporaryRoot, stdio: "inherit" }
    }
  ]);
  assert.equal(apps[0].generator, "react-native");
  assert.equal(apps[0].name, "mobile-app");
});

test("TEST-COMMAND-003 leaves rendered apps untouched after CLI failure", async (t) => {
  const fixture = await createNativeScaffoldFixture(t);
  const calls = [];

  await assert.rejects(
    scaffoldNativeApps(
      {
        appNames: { "web-vite": ["web"] },
        destination: fixture.destination,
        features: ["web-vite"]
      },
      dependencies(fixture, {
        runCommand: async (...args) => {
          calls.push(args);
          throw new Error("Vite failed");
        }
      })
    ),
    /Vite failed/
  );

  assert.equal(
    await pathExists(
      join(fixture.destination, "apps/web/src/template-only.tsx")
    ),
    true
  );
  assert.equal(calls.length, 1);
});

test("TEST-COMMAND-004 removes temporary install artifacts", async (t) => {
  const fixture = await createNativeScaffoldFixture(t, {
    nativeVite: {
      ...vueTypeScriptNativeTree,
      "node_modules/native.txt": "temporary dependency",
      "package-lock.json": "{}",
      "pnpm-lock.yaml": "lockfileVersion: '9.0'"
    }
  });

  await scaffoldNativeApps(
    {
      appNames: { "web-vite": ["portal"] },
      destination: fixture.destination,
      features: ["web-vite"]
    },
    dependencies(fixture)
  );

  const appRoot = join(fixture.destination, "apps/portal");
  assert.equal(await pathExists(join(appRoot, "src/main.ts")), true);
  assert.equal(await pathExists(join(appRoot, "node_modules")), false);
  assert.equal(await pathExists(join(appRoot, "package-lock.json")), false);
  assert.equal(await pathExists(join(appRoot, "pnpm-lock.yaml")), false);
});

test("provides native filesystem dependencies by default", () => {
  const provided = nativeScaffoldDependencies({});
  assert.equal(typeof provided.cp, "function");
  assert.equal(typeof provided.readFile, "function");
  assert.equal(typeof provided.rm, "function");
  assert.equal(typeof provided.writeFile, "function");
});
