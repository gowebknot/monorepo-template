import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";

import {
  nativeScaffoldDependencies,
  scaffoldNativeApps
} from "../src/native-scaffold.js";
import {
  createNativeScaffoldFixture,
  pathExists
} from "./native-scaffold.helpers.js";

function dependencies(fixture, overrides = {}) {
  return {
    ...nativeScaffoldDependencies({}),
    runCommand: fixture.runCommand,
    runInteractiveCommand: fixture.runInteractiveCommand,
    temporaryRoot: fixture.temporaryRoot,
    ...overrides
  };
}

test("TEST-SELECTION-002 uses custom final app names only", async (t) => {
  const fixture = await createNativeScaffoldFixture(t);

  const apps = await scaffoldNativeApps(
    {
      appNames: { "api-nest": ["api"], "web-vite": ["dashboard"] },
      destination: fixture.destination,
      features: ["web-vite", "api-nest"]
    },
    dependencies(fixture)
  );

  assert.deepEqual(apps, [
    {
      feature: "web-vite",
      generator: "vite",
      name: "dashboard",
      path: "apps/dashboard",
      referenceProfile: "vite/react-ts",
      selection: {
        framework: "React",
        linter: "ESLint",
        variant: "TypeScript"
      }
    },
    {
      feature: "api-nest",
      generator: "nestjs",
      name: "api",
      path: "apps/api",
      referenceProfile: "nestjs/default"
    }
  ]);
  assert.equal(await pathExists(join(fixture.destination, "apps/web")), false);
  assert.equal(
    await pathExists(join(fixture.destination, "apps/server")),
    false
  );
  assert.equal(
    JSON.parse(
      await fixture.read(
        join(fixture.destination, "apps/dashboard/package.json")
      )
    ).name,
    "dashboard"
  );
  assert.equal(
    JSON.parse(
      await fixture.read(join(fixture.destination, "apps/api/package.json"))
    ).name,
    "api"
  );
});

test("TEST-SELECTION-003 rejects equal app names before side effects", async (t) => {
  const fixture = await createNativeScaffoldFixture(t);
  const sideEffects = [];

  await assert.rejects(
    scaffoldNativeApps(
      {
        appNames: { "api-nest": ["app"], "web-vite": ["app"] },
        destination: fixture.destination,
        features: ["web-vite", "api-nest"]
      },
      {
        cp: async () => sideEffects.push("copy"),
        readFile: async () => sideEffects.push("read"),
        rm: async () => sideEffects.push("remove"),
        runCommand: async () => sideEffects.push("command"),
        temporaryRoot: fixture.temporaryRoot,
        writeFile: async () => sideEffects.push("write")
      }
    ),
    /App names must be unique: app/
  );

  assert.deepEqual(sideEffects, []);
  assert.equal(await pathExists(join(fixture.destination, "apps/web")), true);
  assert.equal(
    await pathExists(join(fixture.destination, "apps/server")),
    true
  );
});

test("TEST-SELECTION-004 Vite-only removes the server placeholder", async (t) => {
  const fixture = await createNativeScaffoldFixture(t);

  await scaffoldNativeApps(
    {
      appNames: { "web-vite": ["web"] },
      destination: fixture.destination,
      features: ["web-vite"]
    },
    dependencies(fixture)
  );

  assert.equal(await pathExists(join(fixture.destination, "apps/web")), true);
  assert.equal(
    await pathExists(join(fixture.destination, "apps/server")),
    false
  );
  assert.equal(fixture.calls.length, 1);
  assert.equal(fixture.calls[0].args[1], "vite");
});

test("TEST-SELECTION-005 Nest-only removes the web placeholder", async (t) => {
  const fixture = await createNativeScaffoldFixture(t);

  await scaffoldNativeApps(
    {
      appNames: { "api-nest": ["server"] },
      destination: fixture.destination,
      features: ["api-nest"]
    },
    dependencies(fixture)
  );

  assert.equal(
    await pathExists(join(fixture.destination, "apps/server")),
    true
  );
  assert.equal(await pathExists(join(fixture.destination, "apps/web")), false);
  assert.equal(fixture.calls.length, 1);
  assert.equal(fixture.calls[0].args[1], "@nestjs/cli");
});

test("TEST-SELECTION-010 stages mixed targets and removes unselected canonicals", async (t) => {
  const fixture = await createNativeScaffoldFixture(t);

  const apps = await scaffoldNativeApps(
    {
      appNames: {
        "web-vite": ["web"],
        "web-next": ["next"],
        "mobile-expo": ["expo"]
      },
      destination: fixture.destination,
      features: ["web-vite", "web-next", "mobile-expo"]
    },
    dependencies(fixture)
  );

  assert.deepEqual(
    apps.map(({ generator, name, referenceProfile }) => ({
      generator,
      name,
      referenceProfile
    })),
    [
      { generator: "vite", name: "web", referenceProfile: "vite/react-ts" },
      { generator: "next", name: "next", referenceProfile: "next/default" },
      { generator: "expo", name: "expo", referenceProfile: "expo/default" }
    ]
  );
  assert.equal(await pathExists(join(fixture.destination, "apps/web")), true);
  assert.equal(await pathExists(join(fixture.destination, "apps/next")), true);
  assert.equal(await pathExists(join(fixture.destination, "apps/expo")), true);
  assert.equal(
    await pathExists(join(fixture.destination, "apps/server")),
    false
  );
  assert.equal(
    await pathExists(join(fixture.destination, "apps/mobile")),
    false
  );
});

test("TEST-SELECTION-006 removes both placeholders without native features", async (t) => {
  const fixture = await createNativeScaffoldFixture(t);

  const apps = await scaffoldNativeApps(
    {
      appNames: {},
      destination: fixture.destination,
      features: ["api-express"]
    },
    dependencies(fixture)
  );

  assert.deepEqual(apps, []);
  assert.equal(await pathExists(join(fixture.destination, "apps/web")), false);
  assert.equal(
    await pathExists(join(fixture.destination, "apps/server")),
    false
  );
  assert.deepEqual(fixture.calls, []);
});

test("TEST-MULTI-002 scaffolds two named instances of one feature", async (t) => {
  const fixture = await createNativeScaffoldFixture(t);

  const apps = await scaffoldNativeApps(
    {
      appNames: { "web-next": ["next", "admin-next"] },
      destination: fixture.destination,
      features: ["web-next"]
    },
    dependencies(fixture)
  );

  assert.deepEqual(
    apps.map(({ feature, name, referenceProfile }) => ({
      feature,
      name,
      referenceProfile
    })),
    [
      { feature: "web-next", name: "next", referenceProfile: "next/default" },
      {
        feature: "web-next",
        name: "admin-next",
        referenceProfile: "next/default"
      }
    ]
  );
  assert.equal(await pathExists(join(fixture.destination, "apps/next")), true);
  assert.equal(
    await pathExists(join(fixture.destination, "apps/admin-next")),
    true
  );
});

test("TEST-MULTI-003 rejects duplicate names within the same feature", async (t) => {
  const fixture = await createNativeScaffoldFixture(t);
  const sideEffects = [];

  await assert.rejects(
    scaffoldNativeApps(
      {
        appNames: { "web-next": ["next", "next"] },
        destination: fixture.destination,
        features: ["web-next"]
      },
      {
        cp: async () => sideEffects.push("copy"),
        readFile: async () => sideEffects.push("read"),
        rm: async () => sideEffects.push("remove"),
        runCommand: async () => sideEffects.push("command"),
        temporaryRoot: fixture.temporaryRoot,
        writeFile: async () => sideEffects.push("write")
      }
    ),
    /App names must be unique: next/
  );

  assert.deepEqual(sideEffects, []);
});

test("TEST-MULTI-004 removes the canonical placeholder exactly once for two instances", async (t) => {
  const fixture = await createNativeScaffoldFixture(t);
  const rmPaths = [];
  const realDependencies = dependencies(fixture);

  await scaffoldNativeApps(
    {
      appNames: { "web-next": ["admin-next", "second-next"] },
      destination: fixture.destination,
      features: ["web-next"]
    },
    {
      ...realDependencies,
      rm: async (path, options) => {
        rmPaths.push(path);
        return realDependencies.rm(path, options);
      }
    }
  );

  const canonicalRemovals = rmPaths.filter((path) =>
    path.endsWith(join("apps", "next"))
  );
  assert.equal(canonicalRemovals.length, 1);
  assert.equal(await pathExists(join(fixture.destination, "apps/next")), false);
  assert.equal(
    await pathExists(join(fixture.destination, "apps/admin-next")),
    true
  );
  assert.equal(
    await pathExists(join(fixture.destination, "apps/second-next")),
    true
  );
});
