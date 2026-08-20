import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  addApp,
  addPackage,
  listUserPackages,
  removeApp,
  removePackage
} from "../src/project-management.js";

const defaultApps = [
  {
    feature: "web-vite",
    generator: "vite",
    name: "web",
    path: "apps/web",
    referenceProfile: "vite/react-ts"
  },
  {
    feature: "api-nest",
    generator: "nestjs",
    name: "server",
    path: "apps/server",
    referenceProfile: "nestjs/default"
  }
];

async function project() {
  const cwd = await mkdtemp(join(tmpdir(), "project-management-"));
  await mkdir(join(cwd, "apps", "web"), { recursive: true });
  await mkdir(join(cwd, "apps", "server"), { recursive: true });
  await writeFile(join(cwd, "apps", "web", "sentinel.txt"), "keep");
  await writeFile(
    join(cwd, ".mono-stack.json"),
    `${JSON.stringify(
      {
        schemaVersion: 3,
        features: ["web-vite", "api-nest"],
        apps: defaultApps
      },
      null,
      2
    )}\n`
  );
  return cwd;
}

async function cleanup(cwd) {
  await rm(cwd, { force: true, recursive: true });
}

function commandRecorder(cwd) {
  const calls = [];
  const runCommand = async (command, args) => {
    calls.push({ args, command });
    if (args.includes("create-next-app@latest")) {
      await mkdir(join(cwd, "apps", "admin-next"), { recursive: true });
    }
    if (args[0] === "package:create") {
      await mkdir(join(cwd, "packages", args[1]), { recursive: true });
      await writeFile(
        join(cwd, "packages", args[1], "package.json"),
        JSON.stringify({ name: `@repo/${args[1]}` })
      );
    }
  };
  return { calls, runCommand };
}

test("TEST-MANAGE-002 adds an app without replacing existing apps", async () => {
  const cwd = await project();
  try {
    const recorder = commandRecorder(cwd);
    const app = await addApp(
      cwd,
      { feature: "web-next", name: "admin-next" },
      recorder
    );
    const manifest = JSON.parse(
      await readFile(join(cwd, ".mono-stack.json"), "utf8")
    );
    assert.equal(app.path, "apps/admin-next");
    assert.equal(
      await readFile(join(cwd, "apps/web/sentinel.txt"), "utf8"),
      "keep"
    );
    assert.equal(manifest.apps.length, 3);
    assert.deepEqual(recorder.calls.at(-1), {
      command: "pnpm",
      args: ["install"]
    });
  } finally {
    await cleanup(cwd);
  }
});

test("TEST-MANAGE-003 removes an app and updates its feature", async () => {
  const cwd = await project();
  try {
    const recorder = commandRecorder(cwd);
    assert.equal(
      await removeApp(cwd, "server", { confirmed: true, ...recorder }),
      true
    );
    await assert.rejects(readFile(join(cwd, "apps/server")), {
      code: "ENOENT"
    });
    const manifest = JSON.parse(
      await readFile(join(cwd, ".mono-stack.json"), "utf8")
    );
    assert.deepEqual(manifest.features, ["web-vite"]);
    assert.equal(manifest.apps[0].name, "web");
  } finally {
    await cleanup(cwd);
  }
});

test("TEST-MANAGE-004 declines app removal without side effects", async () => {
  const cwd = await project();
  try {
    let installed = false;
    assert.equal(
      await removeApp(cwd, "server", {
        confirmed: false,
        runCommand: async () => {
          installed = true;
        }
      }),
      false
    );
    assert.equal(installed, false);
    assert.equal(
      await readFile(join(cwd, "apps/server"), "utf8").catch(() => "exists"),
      "exists"
    );
  } finally {
    await cleanup(cwd);
  }
});

test("TEST-MANAGE-005 lists and adds user packages", async () => {
  const cwd = await project();
  try {
    await mkdir(join(cwd, "packages", "entities"), { recursive: true });
    await writeFile(
      join(cwd, "packages", "entities", "package.json"),
      JSON.stringify({ name: "@repo/entities" })
    );
    const recorder = commandRecorder(cwd);
    await addPackage(cwd, "billing", recorder);
    const packages = await listUserPackages(cwd);
    assert.deepEqual(
      packages.map(({ name }) => name),
      ["billing"]
    );
    assert.deepEqual(recorder.calls.at(-1), {
      command: "pnpm",
      args: ["install"]
    });
  } finally {
    await cleanup(cwd);
  }
});

test("TEST-MANAGE-006 rejects template-owned package removal", async () => {
  let removed = false;
  await assert.rejects(
    removePackage("/workspace/project", "entities", {
      confirmed: true,
      remove: async () => {
        removed = true;
      }
    }),
    /template-owned package cannot be removed/
  );
  assert.equal(removed, false);
});
