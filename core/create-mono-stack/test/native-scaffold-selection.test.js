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
    temporaryRoot: fixture.temporaryRoot,
    ...overrides
  };
}

test("TEST-SELECTION-002 uses custom final app names only", async (t) => {
  const fixture = await createNativeScaffoldFixture(t);

  const apps = await scaffoldNativeApps(
    {
      appNames: { "api-nest": "api", "web-vite": "dashboard" },
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
      referenceProfile: "vite/react-ts"
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
        appNames: { "api-nest": "app", "web-vite": "app" },
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
      appNames: { "web-vite": "web" },
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
      appNames: { "api-nest": "server" },
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
