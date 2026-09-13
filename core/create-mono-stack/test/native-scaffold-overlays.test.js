import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";

import {
  nativeScaffoldDependencies,
  scaffoldNativeApps
} from "../src/native-scaffold.js";
import {
  createNativeScaffoldFixture,
  delegatedReactNativeTree,
  pathExists,
  reactCompilerTypeScriptNativeTree,
  vueTypeScriptNativeTree
} from "./native-scaffold.helpers.js";

function dependencies(fixture) {
  return {
    ...nativeScaffoldDependencies({}),
    runCommand: fixture.runCommand,
    runInteractiveCommand: fixture.runInteractiveCommand,
    temporaryRoot: fixture.temporaryRoot
  };
}

async function scaffoldWeb(t, nativeVite, viteSelection) {
  const fixture = await createNativeScaffoldFixture(t, {
    nativeVite,
    viteSelection
  });
  const apps = await scaffoldNativeApps(
    {
      appNames: { "web-vite": ["dashboard"] },
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
      appNames: { "api-nest": ["api"] },
      destination: fixture.destination,
      features: ["api-nest"]
    },
    dependencies(fixture)
  );
  return { apps, fixture, root: join(fixture.destination, "apps/api") };
}

test("TEST-REFERENCE-009 copies an isolated React TypeScript reference", async (t) => {
  const { root } = await scaffoldWeb(t);

  assert.equal(await fixtureText(root, "src/main.tsx"), "native-main");
  assert.equal(await fixtureText(root, "src/App.tsx"), "native-app");
  assert.equal(
    await fixtureText(root, "vitest.config.ts"),
    await managedText("web", "vitest.config.ts")
  );
  assert.equal(
    JSON.parse(await fixtureText(root, "package.json")).scripts.test,
    "vitest run"
  );
  assert.equal(
    await fixtureText(root, "reference/src/main.tsx"),
    await managedText("web", "src/main.tsx")
  );
  assert.equal(
    await fixtureText(root, "reference/src/lib/utils.ts"),
    await managedText("web", "src/lib/utils.ts")
  );
  assert.equal(
    await fixtureText(root, "reference/index.html"),
    await managedText("web", "index.html")
  );
  assert.equal(
    await pathExists(join(root, "reference/components.json")),
    false
  );
});

test("TEST-REFERENCE-012 wires up an editor-visible @reference/* alias for the reference tree", async (t) => {
  const { root } = await scaffoldWeb(t);

  const referenceTsconfig = await fixtureText(root, "reference/tsconfig.json");
  assert.match(referenceTsconfig, /"@reference\/\*":\s*\["\.\/src\/\*"\]/);
  assert.match(referenceTsconfig, /"include":\s*\["src"\]/);
});

test("TEST-SCAFFOLD-002 copies guidance files for a Vite React app", async (t) => {
  const { root } = await scaffoldWeb(t);

  assert.equal(
    await fixtureText(root, "AGENTS.md"),
    await managedText("web", "AGENTS.md")
  );
  assert.equal(
    await fixtureText(root, "CLAUDE.md"),
    await managedText("web", "CLAUDE.md")
  );
});

test("TEST-REFERENCE-008 preserves every native Vite file", async (t) => {
  const { apps, root } = await scaffoldWeb(
    t,
    reactCompilerTypeScriptNativeTree,
    {
      framework: "React",
      linter: "ESLint",
      variant: "TypeScript + React Compiler"
    }
  );
  const expectedMarkers = new Map([
    [".gitignore", "native-ignore"],
    ["components.json", "native"],
    ["eslint.config.js", "native-eslint"],
    ["index.html", "native-index"],
    ["src/App.tsx", "native-app"],
    ["src/main.tsx", "native-main"],
    ["tsconfig.app.json", "native"],
    ["tsconfig.json", "native"],
    ["tsconfig.node.json", "native"],
    ["vite.config.ts", "native-react-compiler-vite"]
  ]);

  for (const [path, marker] of expectedMarkers) {
    assert.match(await fixtureText(root, path), new RegExp(marker));
  }
  assert.equal(
    await fixtureText(root, "vitest.config.ts"),
    await managedText("web", "vitest.config.ts")
  );
  assert.equal(apps[0].referenceProfile, "vite/react-ts");
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
  assert.equal(packageJson.dependencies["@monorepo-template/env"], undefined);
  assert.equal(apps[0].referenceProfile, null);
});

test("TEST-OVERLAY-005 replaces native NestJS source", async (t) => {
  const { root } = await scaffoldNest(t);

  assert.equal(
    await fixtureText(root, "src/main.ts"),
    await managedText("server", "src/main.ts")
  );
  assert.equal(await pathExists(join(root, "src/native.controller.ts")), false);
});

test("TEST-OVERLAY-006 copies NestJS reference and test source", async (t) => {
  const { root } = await scaffoldNest(t);

  assert.equal(
    await fixtureText(root, "reference/main.ts"),
    await managedText("server", "reference/main.ts")
  );
  assert.equal(
    await fixtureText(root, "test/app.e2e-spec.ts"),
    await managedText("server", "test/app.e2e-spec.ts")
  );
  assert.equal(await pathExists(join(root, "test/native.e2e-spec.ts")), false);
});

test("TEST-OVERLAY-007 copies exact NestJS profile configuration", async (t) => {
  const { apps, root } = await scaffoldNest(t);
  const overlayFiles = [
    ".prettierrc",
    "eslint.config.mjs",
    "nest-cli.json",
    "nest-cli.reference.json",
    "tsconfig.build.json",
    "tsconfig.json",
    "tsconfig.reference.build.json",
    "vitest.config.ts",
    "vitest.e2e.config.ts"
  ];

  for (const path of overlayFiles) {
    assert.equal(
      await fixtureText(root, path),
      await managedText("server", path)
    );
  }
  assert.equal(apps[0].referenceProfile, "nestjs/default");
  const packageJson = JSON.parse(await fixtureText(root, "package.json"));
  const managedPackageJson = JSON.parse(
    await managedText("server", "package.json")
  );
  assert.equal(packageJson.scripts.test, managedPackageJson.scripts.test);
  assert.equal(packageJson.jest, undefined);
});

test("TEST-OVERLAY-008 copies NestJS agent memory files", async (t) => {
  const { root } = await scaffoldNest(t);

  assert.equal(
    await fixtureText(root, "AGENTS.md"),
    await managedText("server", "AGENTS.md")
  );
  assert.equal(
    await fixtureText(root, "CLAUDE.md"),
    await managedText("server", "CLAUDE.md")
  );
});

test("TEST-VITE-PROFILE-001 records matching observed profile evidence", async (t) => {
  const { apps } = await scaffoldWeb(t);

  assert.deepEqual(apps[0].selection, {
    framework: "React",
    linter: "ESLint",
    variant: "TypeScript"
  });
  assert.equal(apps[0].referenceProfile, "vite/react-ts");
});

test("TEST-VITE-PROFILE-002 keeps native source when observation conflicts", async (t) => {
  const { apps, root } = await scaffoldWeb(t, undefined, {
    framework: "Vue",
    variant: "TypeScript"
  });

  assert.deepEqual(apps[0].selection, {
    framework: "Vue",
    variant: "TypeScript"
  });
  assert.equal(apps[0].referenceProfile, null);
  assert.equal(await fixtureText(root, "src/main.tsx"), "native-main");
});

test("TEST-VITE-PROFILE-003 supports Oxlint without replacing native source", async (t) => {
  const { apps, root } = await scaffoldWeb(t, undefined, {
    framework: "React",
    linter: "Oxlint",
    variant: "TypeScript"
  });

  assert.equal(apps[0].referenceProfile, "vite/react-ts");
  assert.equal(await fixtureText(root, "src/main.tsx"), "native-main");
  assert.equal(
    await fixtureText(root, "reference/src/main.tsx"),
    await managedText("web", "src/main.tsx")
  );
});

for (const { dependency, marker, profile, testId, variant } of [
  {
    dependency: "react-router",
    marker: "react-router-v7-reference",
    profile: "vite/react-router-v7",
    testId: "TEST-PROFILE-101",
    variant: "React Router v7"
  },
  {
    dependency: "@tanstack/react-router",
    marker: "tanstack-router-reference",
    profile: "vite/tanstack-router",
    testId: "TEST-PROFILE-102",
    variant: "TanStack Router"
  },
  {
    dependency: "rwsdk",
    marker: "redwood-sdk-reference",
    profile: "vite/redwood-sdk",
    testId: "TEST-PROFILE-103",
    variant: "RedwoodSDK"
  },
  {
    dependency: "vike",
    marker: "vike-reference",
    profile: "vite/vike",
    testId: "TEST-PROFILE-104",
    variant: "Vike"
  }
]) {
  test(`${testId} copies the ${variant} code-only reference`, async (t) => {
    const nativeTree = delegatedReactNativeTree(dependency);
    const originalPackage = JSON.parse(nativeTree["package.json"]);
    const { apps, root } = await scaffoldWeb(t, nativeTree, {
      framework: "React",
      variant
    });
    const finalPackage = JSON.parse(await fixtureText(root, "package.json"));

    assert.equal(apps[0].referenceProfile, profile);
    assert.match(
      await fixtureText(root, "reference/README.md"),
      new RegExp(marker)
    );
    assert.equal(
      await fixtureText(root, "src/main.tsx"),
      "delegated-native-main"
    );
    assert.equal(
      await fixtureText(root, "vite.config.ts"),
      "delegated-native-config"
    );
    assert.deepEqual(finalPackage, { ...originalPackage, name: "dashboard" });
  });
}

async function scaffoldSingle(t, { appNames, feature, name }) {
  const fixture = await createNativeScaffoldFixture(t);
  const apps = await scaffoldNativeApps(
    { appNames, destination: fixture.destination, features: [feature] },
    dependencies(fixture)
  );
  return { apps, fixture, root: join(fixture.destination, `apps/${name}`) };
}

test("TEST-OVERLAY-009 keeps the generated Next app and copies the demo into reference/", async (t) => {
  const { apps, root } = await scaffoldSingle(t, {
    appNames: { "web-next": ["next"] },
    feature: "web-next",
    name: "next"
  });
  const packageJson = JSON.parse(await fixtureText(root, "package.json"));

  // The generated create-next-app's own source is preserved (user's starter).
  assert.equal(await fixtureText(root, "src/app/page.tsx"), "next-native-page");
  assert.equal(await fixtureText(root, "next.config.ts"), "next-native-config");
  // The root tsconfig is overlaid so the app build excludes reference/.
  const managedTsconfig = await managedText("next", "tsconfig.json");
  assert.equal(await fixtureText(root, "tsconfig.json"), managedTsconfig);
  assert.equal(
    await fixtureText(root, "reference/tsconfig.json"),
    managedTsconfig
  );
  // The canonical demo is copied into a runnable reference/ sub-app.
  assert.equal(
    await fixtureText(root, "reference/src/app/page.tsx"),
    await managedText("next", "src/app/page.tsx")
  );
  assert.equal(
    await fixtureText(root, "reference/src/app/reference/todos/page.tsx"),
    await managedText("next", "src/app/reference/todos/page.tsx")
  );
  assert.equal(
    await fixtureText(root, "reference/components.json"),
    await managedText("next", "components.json")
  );
  assert.equal(
    await fixtureText(root, "reference/next.config.ts"),
    await managedText("next", "next.config.ts")
  );
  assert.equal(
    await fixtureText(root, "vitest.config.ts"),
    await managedText("next", "vitest.config.ts")
  );
  // Agent docs + env example land at the app root.
  assert.equal(
    await fixtureText(root, "AGENTS.md"),
    await managedText("next", "AGENTS.md")
  );
  assert.equal(
    await fixtureText(root, "CLAUDE.md"),
    await managedText("next", "CLAUDE.md")
  );
  assert.equal(
    await fixtureText(root, ".env.example"),
    await managedText("next", ".env.example")
  );
  // Native (generated) versions win; @repo deps + reference scripts are merged.
  const managedNextPackageJson = JSON.parse(
    await managedText("next", "package.json")
  );
  assert.equal(packageJson.dependencies.next, "^15.0.0");
  assert.equal(
    packageJson.dependencies["@monorepo-template/env"],
    managedNextPackageJson.dependencies["@monorepo-template/env"]
  );
  assert.equal(
    packageJson.scripts["build:reference"],
    managedNextPackageJson.scripts["build:reference"]
  );
  assert.equal(
    packageJson.scripts["dev:reference"],
    managedNextPackageJson.scripts["dev:reference"]
  );
  assert.equal(packageJson.name, "next");
  assert.equal(apps[0].referenceProfile, "next/default");
  assert.equal(apps[0].selection, undefined);
});

test("TEST-OVERLAY-010 overlays the Expo canonical app and merges dependencies", async (t) => {
  const { apps, root } = await scaffoldSingle(t, {
    appNames: { "mobile-expo": ["expo"] },
    feature: "mobile-expo",
    name: "expo"
  });
  const packageJson = JSON.parse(await fixtureText(root, "package.json"));

  assert.equal(
    await fixtureText(root, "app/index.tsx"),
    await managedText("expo", "app/index.tsx")
  );
  assert.equal(
    await fixtureText(root, "app/todos.tsx"),
    await managedText("expo", "app/todos.tsx")
  );
  assert.equal(
    await fixtureText(root, "app/form-demo.tsx"),
    await managedText("expo", "app/form-demo.tsx")
  );
  assert.equal(
    await fixtureText(root, "app/reference/todos.tsx"),
    await managedText("expo", "app/reference/todos.tsx")
  );
  assert.equal(
    await fixtureText(root, "globals.css"),
    await managedText("expo", "globals.css")
  );
  assert.equal(
    await fixtureText(root, "babel.config.js"),
    await managedText("expo", "babel.config.js")
  );
  assert.equal(
    await fixtureText(root, "metro.config.js"),
    await managedText("expo", "metro.config.js")
  );
  assert.equal(
    await fixtureText(root, ".env.example"),
    await managedText("expo", ".env.example")
  );
  assert.equal(
    await fixtureText(root, "AGENTS.md"),
    await managedText("expo", "AGENTS.md")
  );
  assert.equal(
    await fixtureText(root, "CLAUDE.md"),
    await managedText("expo", "CLAUDE.md")
  );
  // Expo Router entry + config are overlaid so the router boots; native was replaced.
  assert.equal(
    await fixtureText(root, "index.ts"),
    await managedText("expo", "index.ts")
  );
  assert.equal(
    await fixtureText(root, "app.json"),
    await managedText("expo", "app.json")
  );
  const managedExpoPackageJson = JSON.parse(
    await managedText("expo", "package.json")
  );
  assert.equal(packageJson.dependencies.expo, "^52.0.0");
  assert.equal(
    packageJson.dependencies["react-native-safe-area-context"],
    managedExpoPackageJson.dependencies["react-native-safe-area-context"]
  );
  assert.equal(
    packageJson.dependencies["@monorepo-template/env"],
    managedExpoPackageJson.dependencies["@monorepo-template/env"]
  );
  assert.equal(
    packageJson.dependencies["expo-router"],
    managedExpoPackageJson.dependencies["expo-router"]
  );
  assert.equal(packageJson.scripts.dev, managedExpoPackageJson.scripts.dev);
  assert.equal(
    packageJson.scripts["dev:reference"],
    managedExpoPackageJson.scripts["dev:reference"]
  );
  assert.equal(packageJson.scripts.test, "vitest run");
  assert.equal(
    await fixtureText(root, "vitest.config.ts"),
    await managedText("expo", "vitest.config.ts")
  );
  assert.equal(apps[0].referenceProfile, "expo/default");
  assert.equal(apps[0].selection, undefined);
});

test("TEST-OVERLAY-011 overlays the bare React Native canonical app and merges dependencies", async (t) => {
  const { apps, root } = await scaffoldSingle(t, {
    appNames: { "mobile-react-native": ["mobile"] },
    feature: "mobile-react-native",
    name: "mobile"
  });
  const packageJson = JSON.parse(await fixtureText(root, "package.json"));

  assert.equal(
    await fixtureText(root, "App.tsx"),
    await managedText("mobile", "App.tsx")
  );
  assert.equal(
    await fixtureText(root, "src/screens/home.tsx"),
    await managedText("mobile", "src/screens/home.tsx")
  );
  assert.equal(
    await fixtureText(root, "src/app.tsx"),
    await managedText("mobile", "src/app.tsx")
  );
  assert.equal(
    await fixtureText(root, "src/global.css"),
    await managedText("mobile", "src/global.css")
  );
  assert.equal(
    await fixtureText(root, "src/lib/utils.ts"),
    await managedText("mobile", "src/lib/utils.ts")
  );
  assert.equal(
    await fixtureText(root, "src/lib/env.ts"),
    await managedText("mobile", "src/lib/env.ts")
  );
  assert.equal(
    await fixtureText(root, "AGENTS.md"),
    await managedText("mobile", "AGENTS.md")
  );
  assert.equal(
    await fixtureText(root, "CLAUDE.md"),
    await managedText("mobile", "CLAUDE.md")
  );
  assert.equal(
    await fixtureText(root, "metro.config.js"),
    await managedText("mobile", "metro.config.js")
  );
  assert.equal(
    await fixtureText(root, "index.js"),
    await managedText("mobile", "index.js")
  );
  assert.equal(packageJson.scripts.test, "vitest run");
  assert.equal(
    await fixtureText(root, "vitest.config.ts"),
    await managedText("mobile", "vitest.config.ts")
  );
  const managedMobilePackageJson = JSON.parse(
    await managedText("mobile", "package.json")
  );
  assert.equal(packageJson.dependencies["react-native"], "^0.76.0");
  assert.equal(
    packageJson.dependencies["react-native-safe-area-context"],
    managedMobilePackageJson.dependencies["react-native-safe-area-context"]
  );
  assert.equal(
    packageJson.dependencies["@react-navigation/native"],
    managedMobilePackageJson.dependencies["@react-navigation/native"]
  );
  assert.equal(
    packageJson.dependencies["@monorepo-template/env"],
    managedMobilePackageJson.dependencies["@monorepo-template/env"]
  );
  assert.equal(packageJson.scripts.dev, managedMobilePackageJson.scripts.dev);
  assert.equal(
    packageJson.scripts["dev:reference"],
    managedMobilePackageJson.scripts["dev:reference"]
  );
  assert.equal(packageJson.name, "mobile");
  assert.equal(apps[0].referenceProfile, "react-native/default");
  assert.equal(apps[0].selection, undefined);
});

test("TEST-MULTI-008 detects reference profiles independently for two Vite instances", async (t) => {
  const fixture = await createNativeScaffoldFixture(t);
  const selections = [
    { framework: "React", linter: "ESLint", variant: "TypeScript" },
    { framework: "Vue", variant: "TypeScript" }
  ];
  let callCount = 0;
  const runInteractiveCommand = async (...args) => {
    await fixture.runCommand(...args);
    const selection = selections[callCount];
    callCount += 1;
    return { observation: selection };
  };

  const apps = await scaffoldNativeApps(
    {
      appNames: { "web-vite": ["dashboard-one", "dashboard-two"] },
      destination: fixture.destination,
      features: ["web-vite"]
    },
    {
      ...nativeScaffoldDependencies({}),
      runCommand: fixture.runCommand,
      runInteractiveCommand,
      temporaryRoot: fixture.temporaryRoot
    }
  );

  assert.equal(apps[0].referenceProfile, "vite/react-ts");
  assert.deepEqual(apps[0].selection, selections[0]);
  assert.equal(apps[1].referenceProfile, null);
  assert.deepEqual(apps[1].selection, selections[1]);
});

async function fixtureText(root, path) {
  const { readFile } = await import("node:fs/promises");
  return readFile(join(root, path), "utf8");
}

const managedTemplatesRoot = new URL(
  "../reference-templates/managed/",
  import.meta.url
);

async function managedText(name, path) {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  return readFile(
    fileURLToPath(new URL(`${name}/${path}`, managedTemplatesRoot)),
    "utf8"
  );
}
