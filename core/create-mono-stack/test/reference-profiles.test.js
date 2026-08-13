import assert from "node:assert/strict";
import test from "node:test";

import {
  detectViteReferenceProfile,
  mergeProfilePackageJson
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

test("TEST-PROFILE-005 rejects React Compiler TypeScript", async () => {
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

  assert.equal(profile, null);
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

function nativePackage() {
  return {
    name: "vite-dashboard",
    private: true,
    version: "1.0.0",
    scripts: {
      build: "tsc -b && vite build",
      dev: "vite",
      "inspect-native": "vite --debug"
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
      "dev:reference": "vite",
      "routes:generate": "tsr generate"
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

test("TEST-MERGE-004 lets profile scripts replace native scripts", () => {
  const merged = mergeProfilePackageJson(
    nativePackage(),
    templatePackage(),
    "dashboard"
  );

  assert.equal(
    merged.scripts.build,
    "pnpm routes:generate && tsc -b && vite build"
  );
  assert.equal(merged.scripts["dev:reference"], "vite");
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

test("TEST-MERGE-007 retains native top-level version metadata", () => {
  const merged = mergeProfilePackageJson(
    nativePackage(),
    templatePackage(),
    "dashboard"
  );

  assert.equal(merged.version, "1.0.0");
  assert.deepEqual(merged.jest, { testEnvironment: "jsdom" });
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
