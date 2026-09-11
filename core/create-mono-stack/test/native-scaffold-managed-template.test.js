import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
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
async function createDestinationWithoutWebApp(t) {
  const root = await mkdtemp(join(tmpdir(), "native-scaffold-managed-"));
  const destination = join(root, "project");
  const temporaryRoot = join(root, "temporary");
  await mkdir(temporaryRoot, { recursive: true });
  t.after(() => rm(root, { force: true, recursive: true }));

  const runCommand = async (command, args) => {
    if (args[0] === "create" && args[1] === "vite") {
      await writeTree(join(temporaryRoot, args[2]), reactTypeScriptNativeTree);
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

test("TEST-MANAGED-001 scaffolds a Vite React+TS app from the managed template, not the live repo apps/web", async (t) => {
  const fixture = await createDestinationWithoutWebApp(t);

  const apps = await scaffoldNativeApps(
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

  assert.equal(apps[0].referenceProfile, "vite/react-ts");
  const appRoot = join(fixture.destination, "apps/dashboard");
  const [agentsMd, expected] = await Promise.all([
    readFile(join(appRoot, "AGENTS.md"), "utf8"),
    readFile(join(managedWebRoot, "AGENTS.md"), "utf8")
  ]);
  assert.equal(agentsMd, expected);
});
