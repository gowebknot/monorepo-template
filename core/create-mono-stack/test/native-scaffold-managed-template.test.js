import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  nativeScaffoldDependencies,
  scaffoldNativeApps
} from "#src/native-scaffold.js";
import {
  reactTypeScriptNativeTree,
  writeTree
} from "./native-scaffold.helpers.js";

const managedWebRoot = fileURLToPath(
  new URL("../reference-templates/managed/web", import.meta.url)
);

// Intentionally does not reuse native-scaffold.helpers.js's createNativeScaffoldFixture: that
// helper writes a synthetic apps/web/AGENTS.md into its fixture destination, which would mask the
// bug this test guards against. This repo's own apps/web/ has never had an AGENTS.md, so a fresh
// destination here has no apps/web/ at all, matching the real condition that caused the live
// failure.
async function createDestinationWithoutWebApp(
  t,
  {
    projectName = "jump-cloud-clone",
    nativeTree = reactTypeScriptNativeTree
  } = {}
) {
  const root = await mkdtemp(join(tmpdir(), "native-scaffold-managed-"));
  const destination = join(root, "project");
  const temporaryRoot = join(root, "temporary");
  await mkdir(destination, { recursive: true });
  await mkdir(temporaryRoot, { recursive: true });
  await writeFile(
    join(destination, "package.json"),
    `${JSON.stringify({ name: projectName, private: true }, null, 2)}\n`
  );
  t.after(() => rm(root, { force: true, recursive: true }));

  const runCommand = async (command, args) => {
    if (args[0] === "create" && args[1] === "vite") {
      await writeTree(join(temporaryRoot, args[2]), nativeTree);
    }
  };

  return {
    destination,
    temporaryRoot,
    runCommand,
    runInteractiveCommand: async (...args) => {
      await runCommand(...args);
      return {
        observation: {
          framework: "React",
          linter: "ESLint",
          variant: "TypeScript"
        }
      };
    }
  };
}

async function scaffoldDashboard(fixture) {
  return scaffoldNativeApps(
    {
      appNames: { "web-vite": ["dashboard"] },
      destination: fixture.destination,
      features: ["web-vite"]
    },
    {
      ...nativeScaffoldDependencies({}),
      runCommand: fixture.runCommand,
      runInteractiveCommand: fixture.runInteractiveCommand,
      temporaryRoot: fixture.temporaryRoot
    }
  );
}

test("TEST-MANAGED-001 scaffolds a Vite React+TS app from the managed template, not the live repo apps/web", async (t) => {
  const fixture = await createDestinationWithoutWebApp(t);

  const apps = await scaffoldDashboard(fixture);

  assert.equal(apps[0].referenceProfile, "vite/react-ts");
  const appRoot = join(fixture.destination, "apps/dashboard");
  const [agentsMd, expected] = await Promise.all([
    readFile(join(appRoot, "AGENTS.md"), "utf8"),
    readFile(join(managedWebRoot, "AGENTS.md"), "utf8")
  ]);
  assert.equal(agentsMd, expected);
});

test("TEST-SCOPE-001 rewrites @monorepo-template/ to the destination project's own scope", async (t) => {
  const fixture = await createDestinationWithoutWebApp(t, {
    projectName: "jump-cloud-clone"
  });

  await scaffoldDashboard(fixture);

  const appRoot = join(fixture.destination, "apps/dashboard");
  const packageJson = JSON.parse(
    await readFile(join(appRoot, "package.json"), "utf8")
  );
  assert.equal(
    packageJson.dependencies["@jump-cloud-clone/env"],
    "workspace:^"
  );
  assert.equal(packageJson.dependencies["@monorepo-template/env"], undefined);
  const envSource = await readFile(
    join(appRoot, "reference/src/lib/env.ts"),
    "utf8"
  );
  assert.match(envSource, /@jump-cloud-clone\/env/);
  assert.doesNotMatch(envSource, /@monorepo-template\//);
});

test("TEST-SCOPE-002 leaves @monorepo-template/ untouched when the project is named monorepo-template", async (t) => {
  const fixture = await createDestinationWithoutWebApp(t, {
    projectName: "monorepo-template"
  });

  await scaffoldDashboard(fixture);

  const appRoot = join(fixture.destination, "apps/dashboard");
  const packageJson = JSON.parse(
    await readFile(join(appRoot, "package.json"), "utf8")
  );
  assert.equal(
    packageJson.dependencies["@monorepo-template/env"],
    "workspace:^"
  );
});

test("TEST-SCOPE-003 also rewrites a bare monorepo-template reference to the destination scope", async (t) => {
  const fixture = await createDestinationWithoutWebApp(t, {
    projectName: "jump-cloud-clone",
    nativeTree: {
      ...reactTypeScriptNativeTree,
      "src/root-ref.ts": 'export const ROOT_PACKAGE = "monorepo-template";\n'
    }
  });

  await scaffoldDashboard(fixture);

  const rootRef = await readFile(
    join(fixture.destination, "apps/dashboard/src/root-ref.ts"),
    "utf8"
  );
  assert.match(rootRef, /"jump-cloud-clone"/);
  assert.doesNotMatch(rootRef, /"monorepo-template"/);
});
