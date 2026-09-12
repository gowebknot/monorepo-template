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
  reactTypeScriptNativeTree,
  vueTypeScriptNativeTree
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

test("TEST-TAILWIND-001 activates Tailwind in generated React apps", async (t) => {
  const fixture = await createNativeScaffoldFixture(t);

  await scaffoldNativeApps(
    {
      appNames: { "web-vite": ["dashboard"] },
      destination: fixture.destination,
      features: ["web-vite"]
    },
    dependencies(fixture)
  );

  const appRoot = join(fixture.destination, "apps/dashboard");
  const viteConfig = await fixture.read(join(appRoot, "vite.config.ts"));
  const packageJson = JSON.parse(
    await fixture.read(join(appRoot, "package.json"))
  );

  assert.match(viteConfig, /import tailwindcss from "@tailwindcss\/vite"/);
  assert.match(viteConfig, /tailwindcss\(\)/);
  assert.equal(typeof packageJson.dependencies["@tailwindcss/vite"], "string");
});

test("TEST-ESLINT-001 disables react-refresh/only-export-components for the reference content", async (t) => {
  const fixture = await createNativeScaffoldFixture(t);

  await scaffoldNativeApps(
    {
      appNames: { "web-vite": ["dashboard"] },
      destination: fixture.destination,
      features: ["web-vite"]
    },
    dependencies(fixture)
  );

  const appRoot = join(fixture.destination, "apps/dashboard");
  const eslintConfig = await fixture.read(join(appRoot, "eslint.config.js"));

  assert.match(
    eslintConfig,
    /rules:\s*\{\s*"react-refresh\/only-export-components":\s*"off"\s*\}/
  );
});

test("TEST-ESLINT-002 stays idempotent when the override is already present", async (t) => {
  const fixture = await createNativeScaffoldFixture(t, {
    nativeVite: {
      ...reactTypeScriptNativeTree,
      "eslint.config.js": reactTypeScriptNativeTree["eslint.config.js"].replace(
        "languageOptions: {\n      globals: globals.browser,\n    }",
        'languageOptions: {\n      globals: globals.browser,\n    },\n    rules: {\n      "react-refresh/only-export-components": "off"\n    }'
      )
    }
  });

  await scaffoldNativeApps(
    {
      appNames: { "web-vite": ["dashboard"] },
      destination: fixture.destination,
      features: ["web-vite"]
    },
    dependencies(fixture)
  );

  const appRoot = join(fixture.destination, "apps/dashboard");
  const eslintConfig = await fixture.read(join(appRoot, "eslint.config.js"));
  const occurrences = eslintConfig.match(
    /"react-refresh\/only-export-components"/g
  );

  assert.equal(occurrences?.length, 1);
});

test("TEST-ESLINT-003 fails loudly when the native output has no languageOptions block", async (t) => {
  const fixture = await createNativeScaffoldFixture(t, {
    nativeVite: {
      ...reactTypeScriptNativeTree,
      "eslint.config.js":
        "export default []; // native-eslint-no-language-options"
    }
  });

  await assert.rejects(
    scaffoldNativeApps(
      {
        appNames: { "web-vite": ["dashboard"] },
        destination: fixture.destination,
        features: ["web-vite"]
      },
      dependencies(fixture)
    ),
    /languageOptions/
  );
});

test("TEST-ESLINT-004 also matches languageOptions without a trailing comma", async (t) => {
  const fixture = await createNativeScaffoldFixture(t, {
    nativeVite: {
      ...reactTypeScriptNativeTree,
      "eslint.config.js": reactTypeScriptNativeTree["eslint.config.js"].replace(
        "languageOptions: {\n      globals: globals.browser,\n    }",
        "languageOptions: {\n      globals: globals.browser\n    }"
      )
    }
  });

  await scaffoldNativeApps(
    {
      appNames: { "web-vite": ["dashboard"] },
      destination: fixture.destination,
      features: ["web-vite"]
    },
    dependencies(fixture)
  );

  const appRoot = join(fixture.destination, "apps/dashboard");
  const eslintConfig = await fixture.read(join(appRoot, "eslint.config.js"));

  assert.match(
    eslintConfig,
    /rules:\s*\{\s*"react-refresh\/only-export-components":\s*"off"\s*\}/
  );
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
        },
        runInteractiveCommand: async (...args) => {
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
