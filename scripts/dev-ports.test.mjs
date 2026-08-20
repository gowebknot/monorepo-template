import assert from "node:assert/strict";
import test from "node:test";

import { allocateAppPorts, configureAppScripts } from "./dev-ports.mjs";
import { commandFor } from "./run-app.mjs";

test("TEST-PORT-005 allocates unique generated-project ports", async () => {
  const apps = await allocateAppPorts(
    [
      { generator: "vite", name: "web" },
      { generator: "vite", name: "web-app-2" },
      { generator: "nestjs", name: "server" }
    ],
    { checkPort: async () => true }
  );
  for (const mode of ["dev", "reference"]) {
    const ports = apps.map((app) => app.ports[mode]);
    assert.equal(new Set(ports).size, ports.length);
  }
});

test("TEST-PORT-006 builds framework-specific port commands", () => {
  assert.deepEqual(commandFor({ generator: "vite" }, "dev", 5175).args, [
    "exec",
    "vite",
    "--port",
    "5175",
    "--strictPort"
  ]);
  assert.deepEqual(commandFor({ generator: "next" }, "reference", 3005).args, [
    "exec",
    "next",
    "dev",
    "reference",
    "--port",
    "3005"
  ]);
  assert.deepEqual(commandFor({ generator: "expo" }, "dev", 8085).args, [
    "exec",
    "expo",
    "start",
    "--port",
    "8085"
  ]);
  assert.deepEqual(
    commandFor({ generator: "react-native" }, "reference", 8086).args,
    ["exec", "react-native", "start", "--port", "8086"]
  );
});

test("TEST-PORT-007 migrates legacy app scripts", async () => {
  const writes = [];
  await configureAppScripts("/project", [{ path: "apps/server" }], {
    read: async () =>
      JSON.stringify({ scripts: { dev: "nest start --watch" } }),
    write: async (path, contents) => writes.push({ contents, path })
  });

  const packageJson = JSON.parse(writes[0].contents);
  assert.equal(packageJson.scripts.dev, "node ../../scripts/run-app.mjs dev");
  assert.equal(
    packageJson.scripts["dev:reference"],
    "node ../../scripts/run-app.mjs reference"
  );
});
