import assert from "node:assert/strict";
import test from "node:test";

import {
  allocateAppPorts,
  configureAppScripts
} from "../src/port-allocation.js";

const apps = [
  { generator: "nestjs", name: "server", path: "apps/server" },
  { generator: "nestjs", name: "server-app-2", path: "apps/server-app-2" },
  { generator: "vite", name: "web", path: "apps/web" },
  { generator: "vite", name: "web-app-2", path: "apps/web-app-2" },
  { generator: "expo", name: "expo", path: "apps/expo" },
  { generator: "expo", name: "expo-app-2", path: "apps/expo-app-2" }
];

test("TEST-PORT-001 assigns unique ports across app types and modes", async () => {
  const assigned = await allocateAppPorts(apps, {
    checkPort: async () => true
  });
  for (const mode of ["dev", "reference"]) {
    const ports = assigned.map((app) => app.ports[mode]);
    assert.equal(new Set(ports).size, ports.length);
  }
  assert.deepEqual(assigned[0].ports, { dev: 3000, reference: 3001 });
  assert.deepEqual(assigned[1].ports, { dev: 3001, reference: 3002 });
  assert.deepEqual(assigned[2].ports, { dev: 5173, reference: 5173 });
});

test("TEST-PORT-002 skips occupied ports", async () => {
  const assigned = await allocateAppPorts(
    [{ generator: "nestjs", name: "server", path: "apps/server" }],
    {
      checkPort: async (port) => port !== 3000
    }
  );

  assert.deepEqual(assigned[0].ports, { dev: 3001, reference: 3001 });
});

test("TEST-PORT-003 preserves existing assignments", async () => {
  const assigned = await allocateAppPorts(
    [
      {
        generator: "nestjs",
        name: "server",
        path: "apps/server",
        ports: { dev: 4100, reference: 4101 }
      },
      { generator: "nestjs", name: "server-app-2", path: "apps/server-app-2" }
    ],
    { checkPort: async () => true }
  );

  assert.deepEqual(assigned[0].ports, { dev: 4100, reference: 4101 });
  assert.notEqual(assigned[1].ports.dev, 4100);
  assert.notEqual(assigned[1].ports.reference, 4101);
});

test("TEST-PORT-009 reassigns an occupied saved management port", async () => {
  const assigned = await allocateAppPorts(
    [
      {
        generator: "nestjs",
        name: "server",
        path: "apps/server",
        ports: { dev: 4200, reference: 4301 }
      }
    ],
    { checkPort: async (port) => port !== 4200 }
  );

  assert.deepEqual(assigned[0].ports, { dev: 4201, reference: 4301 });
});

test("TEST-PORT-004 configures generated app scripts", async () => {
  const writes = [];
  await configureAppScripts(
    "/project",
    [{ name: "server", path: "apps/server" }],
    {
      read: async () =>
        JSON.stringify({
          name: "temporary-server",
          scripts: { build: "nest build", dev: "nest start --watch" }
        }),
      write: async (path, content) => writes.push({ content, path })
    }
  );

  const packageJson = JSON.parse(writes[0].content);
  assert.equal(packageJson.name, "temporary-server");
  assert.equal(packageJson.scripts.dev, "node ../../scripts/run-app.mjs dev");
  assert.equal(
    packageJson.scripts["dev:reference"],
    "node ../../scripts/run-app.mjs reference"
  );
});
