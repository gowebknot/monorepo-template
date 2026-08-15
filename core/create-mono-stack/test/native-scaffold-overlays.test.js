import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";

import {
  nativeScaffoldDependencies,
  scaffoldNativeApps
} from "../src/native-scaffold.js";
import {
  createNativeScaffoldFixture,
  pathExists,
  vueTypeScriptNativeTree
} from "./native-scaffold.helpers.js";

function dependencies(fixture) {
  return {
    ...nativeScaffoldDependencies({}),
    runCommand: fixture.runCommand,
    temporaryRoot: fixture.temporaryRoot
  };
}

async function scaffoldWeb(t, nativeVite) {
  const fixture = await createNativeScaffoldFixture(t, { nativeVite });
  const apps = await scaffoldNativeApps(
    {
      appNames: { "web-vite": "dashboard" },
      destination: fixture.destination,
      features: ["web-vite"]
    },
    dependencies(fixture)
  );
  return { apps, fixture, root: join(fixture.destination, "apps/dashboard") };
}

async function scaffoldNest(t) {
  const fixture = await createNativeScaffoldFixture(t);
  const apps = await scaffoldNativeApps(
    {
      appNames: { "api-nest": "api" },
      destination: fixture.destination,
      features: ["api-nest"]
    },
    dependencies(fixture)
  );
  return { apps, fixture, root: join(fixture.destination, "apps/api") };
}

test("TEST-OVERLAY-001 replaces native React TypeScript source", async (t) => {
  const { root } = await scaffoldWeb(t);

  assert.equal(await fixtureText(root, "src/main.tsx"), "template-main");
  assert.equal(await pathExists(join(root, "src/App.tsx")), false);
  assert.equal(
    await fixtureText(root, "src/template-only.tsx"),
    "template-only"
  );
});

test("TEST-OVERLAY-002 copies required React TypeScript configuration", async (t) => {
  const { root } = await scaffoldWeb(t);
  const expectedMarkers = new Map([
    [".gitignore", "web-ignore-marker"],
    ["components.json", "components"],
    ["eslint.config.js", "web-eslint-marker"],
    ["tsconfig.app.json", "app-tsconfig"],
    ["tsconfig.json", "root-tsconfig"],
    ["tsconfig.node.json", "node-tsconfig"],
    ["vite.config.ts", "vite-config-marker"]
  ]);

  for (const [path, marker] of expectedMarkers) {
    assert.match(await fixtureText(root, path), new RegExp(marker));
  }
});

test("TEST-OVERLAY-003 keeps unsupported Vue TypeScript source", async (t) => {
  const { root } = await scaffoldWeb(t, vueTypeScriptNativeTree);

  assert.equal(await fixtureText(root, "src/main.ts"), "vue-main");
  assert.equal(await pathExists(join(root, "src/main.tsx")), false);
});

test("TEST-OVERLAY-004 omits web reference support for Vue TypeScript", async (t) => {
  const { apps, root } = await scaffoldWeb(t, vueTypeScriptNativeTree);
  const packageJson = JSON.parse(await fixtureText(root, "package.json"));

  assert.equal(packageJson.scripts["dev:reference"], undefined);
  assert.equal(packageJson.dependencies["@repo/env"], undefined);
  assert.equal(apps[0].referenceProfile, null);
});

test("TEST-OVERLAY-005 replaces native NestJS source", async (t) => {
  const { root } = await scaffoldNest(t);

  assert.match(await fixtureText(root, "src/main.ts"), /template-main/);
  assert.equal(await pathExists(join(root, "src/native.controller.ts")), false);
});

test("TEST-OVERLAY-006 copies NestJS reference and test source", async (t) => {
  const { root } = await scaffoldNest(t);

  assert.equal(await fixtureText(root, "reference/main.ts"), "reference-main");
  assert.equal(
    await fixtureText(root, "test/app.e2e-spec.ts"),
    "template-test"
  );
  assert.equal(await pathExists(join(root, "test/native.e2e-spec.ts")), false);
});

test("TEST-OVERLAY-007 copies exact NestJS profile configuration", async (t) => {
  const { apps, root } = await scaffoldNest(t);
  const expectedMarkers = new Map([
    [".prettierrc", "prettier"],
    ["eslint.config.mjs", "server-eslint-marker"],
    ["nest-cli.json", "nest-main"],
    ["nest-cli.reference.json", "nest-reference"],
    ["tsconfig.build.json", "build-tsconfig"],
    ["tsconfig.json", "root-tsconfig"],
    ["tsconfig.reference.build.json", "reference-tsconfig"]
  ]);

  for (const [path, marker] of expectedMarkers) {
    assert.match(await fixtureText(root, path), new RegExp(marker));
  }
  assert.equal(apps[0].referenceProfile, "nestjs/default");
});

test("TEST-OVERLAY-008 copies NestJS agent memory files", async (t) => {
  const { root } = await scaffoldNest(t);

  assert.equal(await fixtureText(root, "AGENTS.md"), "server-agent-marker");
  assert.equal(await fixtureText(root, "CLAUDE.md"), "server-claude-marker");
});

async function fixtureText(root, path) {
  const { readFile } = await import("node:fs/promises");
  return readFile(join(root, path), "utf8");
}
