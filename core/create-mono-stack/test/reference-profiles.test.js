import assert from "node:assert/strict";
import test from "node:test";

import {
  REFERENCE_PROFILES,
  detectViteReferenceProfile,
  mergeProfilePackageJson,
  selectionSupportsViteProfile
} from "../src/reference-profiles.js";

const appRoot = "/tmp/native/vite-dashboard";

function reactTypeScriptPackage(overrides = {}) {
  return {
    name: "vite-dashboard",
    version: "0.0.0",
    scripts: { build: "tsc -b && vite build", dev: "vite" },
    dependencies: {
      react: "^19.2.8",
      "react-dom": "^19.2.8"
    },
    devDependencies: {
      "@types/react": "^19.2.17",
      "@types/react-dom": "^19.2.3",
      "@vitejs/plugin-react": "^6.0.4",
      oxlint: "^1.75.0",
      typescript: "~6.0.2",
      vite: "^8.2.0"
    },
    ...overrides
  };
}

function fixtureReader(files) {
  return async (path) => {
    if (files.has(path)) return files.get(path);
    const error = new Error(`Missing fixture: ${path}`);
    error.code = "ENOENT";
    throw error;
  };
}

test("TEST-PROFILE-001 detects React TypeScript with Oxlint", async () => {
  const profile = await detectViteReferenceProfile(
    { appRoot, packageJson: reactTypeScriptPackage() },
    {
      readFile: fixtureReader(
        new Map([[`${appRoot}/src/main.tsx`, "createRoot(root).render(app)"]])
      )
    }
  );

  assert.equal(profile, "vite/react-ts");
});

test("TEST-PROFILE-002 detects React TypeScript with ESLint", async () => {
  const packageJson = reactTypeScriptPackage();
  delete packageJson.devDependencies.oxlint;
  packageJson.devDependencies.eslint = "^10.8.0";

  const profile = await detectViteReferenceProfile(
    { appRoot, packageJson },
    {
      readFile: fixtureReader(
        new Map([[`${appRoot}/src/main.tsx`, "createRoot(root).render(app)"]])
      )
    }
  );

  assert.equal(profile, "vite/react-ts");
});

test("TEST-PROFILE-003 rejects React JavaScript", async () => {
  const profile = await detectViteReferenceProfile(
    {
      appRoot,
      packageJson: {
        dependencies: { react: "^19.2.8", "react-dom": "^19.2.8" },
        devDependencies: {
          "@vitejs/plugin-react": "^6.0.4",
          vite: "^8.2.0"
        }
      }
    },
    {
      readFile: fixtureReader(
        new Map([[`${appRoot}/src/main.jsx`, "createRoot(root).render(app)"]])
      )
    }
  );

  assert.equal(profile, null);
});

test("TEST-PROFILE-004 rejects Vue TypeScript", async () => {
  const profile = await detectViteReferenceProfile(
    {
      appRoot,
      packageJson: {
        dependencies: { vue: "^3.5.0" },
        devDependencies: {
          "@vitejs/plugin-vue": "^6.0.0",
          typescript: "~6.0.2",
          vite: "^8.2.0"
        }
      }
    },
    {
      readFile: fixtureReader(
        new Map([[`${appRoot}/src/main.ts`, "createApp(App).mount(root)"]])
      )
    }
  );

  assert.equal(profile, null);
});

test("TEST-REFERENCE-012 detects React Compiler TypeScript", async () => {
  const packageJson = reactTypeScriptPackage();
  packageJson.devDependencies["@rolldown/plugin-babel"] = "^0.2.3";
  packageJson.devDependencies["babel-plugin-react-compiler"] = "^1.0.0";

  const profile = await detectViteReferenceProfile(
    { appRoot, packageJson },
    {
      readFile: fixtureReader(
        new Map([[`${appRoot}/src/main.tsx`, "createRoot(root).render(app)"]])
      )
    }
  );

  assert.equal(profile, "vite/react-ts");
});

test("TEST-PROFILE-006 rejects a missing React TypeScript entry file", async () => {
  const profile = await detectViteReferenceProfile(
    { appRoot, packageJson: reactTypeScriptPackage() },
    { readFile: fixtureReader(new Map()) }
  );

  assert.equal(profile, null);
});

test("TEST-PROFILE-007 propagates an unexpected entry read error", async () => {
  const error = new Error("permission denied");
  error.code = "EACCES";

  await assert.rejects(
    detectViteReferenceProfile(
      { appRoot, packageJson: reactTypeScriptPackage() },
      {
        readFile: async () => {
          throw error;
        }
      }
    ),
    (caught) => caught === error
  );
});

test("TEST-PROFILE-008 detects a profile supplied through the registry", async () => {
  const profile = await detectViteReferenceProfile(
    {
      appRoot,
      packageJson: {
        dependencies: { vue: "^3.5.0" },
        devDependencies: { typescript: "~6.0.2", vite: "^9.0.0" }
      }
    },
    { readFile: fixtureReader(new Map()) },
    {
      "vite/vue-ts": {
        generator: "vite",
        matches: async ({ packageJson }) =>
          typeof packageJson.dependencies?.vue === "string"
      }
    }
  );

  assert.equal(profile, "vite/vue-ts");
});

for (const { dependency, profile, testId, variant } of [
  {
    dependency: "react-router",
    profile: "vite/react-router-v7",
    testId: "TEST-PROFILE-101",
    variant: "React Router v7"
  },
  {
    dependency: "@tanstack/react-router",
    profile: "vite/tanstack-router",
    testId: "TEST-PROFILE-102",
    variant: "TanStack Router"
  },
  {
    dependency: "rwsdk",
    profile: "vite/redwood-sdk",
    testId: "TEST-PROFILE-103",
    variant: "RedwoodSDK"
  },
  {
    dependency: "vike",
    profile: "vite/vike",
    testId: "TEST-PROFILE-104",
    variant: "Vike"
  }
]) {
  test(`${testId} detects ${variant}`, async () => {
    const packageJson = reactTypeScriptPackage({
      dependencies: {
        react: "^19.2.8",
        "react-dom": "^19.2.8",
        [dependency]: "^1.0.0"
      }
    });

    const detected = await detectViteReferenceProfile(
      {
        appRoot,
        packageJson,
        selection: { framework: "React", variant }
      },
      { readFile: fixtureReader(new Map()) }
    );

    assert.equal(detected, profile);
  });
}

test("TEST-PROFILE-105 rejects delegated labels without generated evidence", async () => {
  for (const variant of [
    "React Router v7",
    "TanStack Router",
    "RedwoodSDK",
    "Vike"
  ]) {
    const detected = await detectViteReferenceProfile(
      {
        appRoot,
        packageJson: reactTypeScriptPackage(),
        selection: { framework: "React", variant }
      },
      { readFile: fixtureReader(new Map()) }
    );

    assert.equal(detected, null, variant);
  }
});

for (const { profileId, generator, canonicalName } of [
  { profileId: "expo/default", generator: "expo", canonicalName: "expo" },
  {
    profileId: "react-native/default",
    generator: "react-native",
    canonicalName: "mobile"
  }
]) {
  test(`TEST-PROFILE-110 ${profileId} is an overlay profile for ${generator}`, () => {
    const profile = REFERENCE_PROFILES[profileId];

    assert.ok(profile, `${profileId} is registered`);
    assert.equal(profile.generator, generator);
    assert.equal(profile.canonicalName, canonicalName);
    assert.ok(Array.isArray(profile.overlayEntries));
    assert.ok(profile.overlayEntries.includes("AGENTS.md"));
    assert.ok(profile.overlayEntries.includes("README.md"));
    assert.ok(profile.overlayEntries.includes("babel.config.js"));
    assert.ok(profile.overlayEntries.includes("metro.config.js"));
    assert.ok(profile.overlayEntries.includes("nativewind-env.d.ts"));
    assert.deepEqual(profile.mergeScriptNames, ["dev"]);
  });
}

test("TEST-PROFILE-112 next/default is a reference-folder profile", () => {
  const profile = REFERENCE_PROFILES["next/default"];

  assert.ok(profile, "next/default is registered");
  assert.equal(profile.generator, "next");
  assert.equal(profile.canonicalName, "next");
  assert.equal(profile.overlayEntries, undefined);
  assert.ok(Array.isArray(profile.referenceEntries));
  assert.ok(
    profile.referenceEntries.some(
      (entry) => entry.destination === "reference/src" && entry.source === "src"
    ),
    "copies the demo src into reference/"
  );
  assert.ok(
    profile.referenceEntries.some((entry) => entry.destination === "AGENTS.md"),
    "keeps AGENTS.md at the app root"
  );
});

test("TEST-PROFILE-111 Vite detection ignores non-Vite generators", async () => {
  const detected = await detectViteReferenceProfile(
    {
      appRoot,
      packageJson: {
        dependencies: { next: "^15.0.0", react: "^19.0.0" },
        devDependencies: { typescript: "^5.6.0" }
      }
    },
    { readFile: fixtureReader(new Map()) }
  );

  assert.equal(detected, null);
});

function nativePackage() {
  return {
    name: "vite-dashboard",
    private: true,
    version: "1.0.0",
    scripts: {
      build: "tsc -b && vite build",
      dev: "vite",
      "inspect-native": "vite --debug",
      lint: "eslint .",
      preview: "vite preview"
    },
    dependencies: {
      react: "^20.0.0"
    },
    devDependencies: {
      oxlint: "^1.75.0",
      typescript: "~6.0.2",
      vite: "^9.0.0"
    }
  };
}

function templatePackage() {
  return {
    name: "web",
    private: true,
    version: "0.0.0",
    scripts: {
      build: "pnpm routes:generate && tsc -b && vite build",
      "build:reference":
        "pnpm routes:generate:reference && vite build reference --config vite.config.ts",
      "dev:reference":
        "pnpm routes:generate:reference && vite reference --config vite.config.ts",
      "preview:reference": "vite preview reference --config vite.config.ts",
      "routes:generate": "tsr generate",
      "routes:generate:reference":
        "node --eval \"process.chdir('reference'); process.argv = ['node', 'tsr', 'generate']; import('@tanstack/router-cli');\""
    },
    dependencies: {
      "@repo/env": "workspace:^",
      "@tanstack/react-router": "^1.170.18",
      react: "^19.2.7"
    },
    devDependencies: {
      typescript: "^7.0.0",
      vite: "^8.1.1"
    },
    jest: { testEnvironment: "jsdom" }
  };
}

test("TEST-MERGE-001 keeps native versions for overlapping dependencies", () => {
  const merged = mergeProfilePackageJson(
    nativePackage(),
    templatePackage(),
    "dashboard"
  );

  assert.equal(merged.dependencies.react, "^20.0.0");
  assert.equal(merged.devDependencies.typescript, "~6.0.2");
  assert.equal(merged.devDependencies.vite, "^9.0.0");
});

test("TEST-MERGE-002 adds template-only dependencies", () => {
  const merged = mergeProfilePackageJson(
    nativePackage(),
    templatePackage(),
    "dashboard"
  );

  assert.equal(merged.dependencies["@repo/env"], "workspace:^");
  assert.equal(merged.dependencies["@tanstack/react-router"], "^1.170.18");
});

test("TEST-MERGE-003 retains native-only dependencies", () => {
  const merged = mergeProfilePackageJson(
    nativePackage(),
    templatePackage(),
    "dashboard"
  );

  assert.equal(merged.devDependencies.oxlint, "^1.75.0");
});

test("TEST-MERGE-009 prefers the template version for a non-owned overlapping dependency", () => {
  const native = {
    name: "MobileApp",
    dependencies: {
      "react-native": "^0.76.0",
      "react-native-safe-area-context": "^5.5.2"
    }
  };
  const template = {
    name: "mobile",
    dependencies: {
      "react-native": "0.87.0",
      "react-native-safe-area-context": "5.9.1"
    }
  };

  const merged = mergeProfilePackageJson(
    native,
    template,
    "mobile",
    [],
    ["react-native"]
  );

  assert.equal(merged.dependencies["react-native-safe-area-context"], "5.9.1");
});

test("TEST-MERGE-010 keeps the native version for a dependency listed as native-owned", () => {
  const native = {
    name: "MobileApp",
    dependencies: {
      "react-native": "^0.76.0",
      "react-native-safe-area-context": "^5.5.2"
    }
  };
  const template = {
    name: "mobile",
    dependencies: {
      "react-native": "0.87.0",
      "react-native-safe-area-context": "5.9.1"
    }
  };

  const merged = mergeProfilePackageJson(
    native,
    template,
    "mobile",
    [],
    ["react-native"]
  );

  assert.equal(merged.dependencies["react-native"], "^0.76.0");
});

test("TEST-REFERENCE-011 preserves native scripts and adds reference scripts", () => {
  const merged = mergeProfilePackageJson(
    nativePackage(),
    templatePackage(),
    "dashboard"
  );

  assert.equal(merged.scripts.build, "tsc -b && vite build");
  assert.equal(merged.scripts.dev, "vite");
  assert.equal(merged.scripts.lint, "eslint .");
  assert.equal(merged.scripts.preview, "vite preview");
  assert.equal(
    merged.scripts["routes:generate:reference"],
    "node --eval \"process.chdir('reference'); process.argv = ['node', 'tsr', 'generate']; import('@tanstack/router-cli');\""
  );
  assert.match(
    merged.scripts["dev:reference"],
    /^pnpm routes:generate:reference/
  );
  assert.match(merged.scripts["build:reference"], /vite build reference/);
  assert.match(merged.scripts["preview:reference"], /vite preview reference/);
  assert.equal(merged.scripts["routes:generate"], undefined);
});

test("TEST-MERGE-005 retains native-only scripts", () => {
  const merged = mergeProfilePackageJson(
    nativePackage(),
    templatePackage(),
    "dashboard"
  );

  assert.equal(merged.scripts["inspect-native"], "vite --debug");
});

test("TEST-MERGE-006 replaces the temporary package name", () => {
  const merged = mergeProfilePackageJson(
    nativePackage(),
    templatePackage(),
    "dashboard"
  );

  assert.equal(merged.name, "dashboard");
});

test("TEST-REFERENCE-010 retains only native top-level metadata", () => {
  const merged = mergeProfilePackageJson(
    nativePackage(),
    templatePackage(),
    "dashboard"
  );

  assert.equal(merged.version, "1.0.0");
  assert.equal(merged.jest, undefined);
});

test("TEST-REFERENCE-013 accepts every observed React TypeScript variant", () => {
  for (const variant of [
    "TypeScript",
    "TypeScript + SWC",
    "TypeScript + React Compiler",
    "TypeScript + SWC + React Compiler"
  ]) {
    assert.equal(
      selectionSupportsViteProfile(
        { framework: "React", linter: "Oxlint", variant },
        "vite/react-ts"
      ),
      true,
      variant
    );
  }
});

test("TEST-REFERENCE-014 rejects incompatible observed selections", () => {
  for (const selection of [
    undefined,
    { framework: "React", variant: "JavaScript" },
    { framework: "Vue", variant: "TypeScript" }
  ]) {
    assert.equal(
      selectionSupportsViteProfile(selection, "vite/react-ts"),
      false
    );
  }
});

test("TEST-MERGE-008 keeps native dependency placement", () => {
  const template = templatePackage();
  template.dependencies.typescript = "^7.0.0";
  delete template.devDependencies.typescript;

  const merged = mergeProfilePackageJson(
    nativePackage(),
    template,
    "dashboard"
  );

  assert.equal(merged.devDependencies.typescript, "~6.0.2");
  assert.equal(merged.dependencies.typescript, undefined);
});
