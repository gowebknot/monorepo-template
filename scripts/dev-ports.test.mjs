import assert from "node:assert/strict";
import { createServer } from "node:net";
import test from "node:test";

import {
  allocateAppPorts,
  configureAppScripts,
  ensureProjectPorts,
  isPortAvailable
} from "#scripts/dev-ports.mjs";
import { commandFor, environmentFor } from "#scripts/run-app.mjs";

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

test("TEST-PORT-008 reassigns an occupied saved runtime port", async () => {
  const assigned = await allocateAppPorts(
    [
      {
        generator: "react-native",
        name: "mobile",
        ports: { dev: 4100, reference: 4201 }
      }
    ],
    { checkPort: async (port) => port !== 4100 }
  );

  assert.deepEqual(assigned[0].ports, { dev: 4101, reference: 4201 });
});

test("TEST-PORT-011 detects wildcard-bound ports", async () => {
  const server = createServer();
  await new Promise((resolve) =>
    server.listen({ host: "0.0.0.0", port: 0 }, resolve)
  );
  const port = server.address().port;

  try {
    assert.equal(await isPortAvailable(port), false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("TEST-MOBILE-001 generates the named app root entry", async () => {
  const writes = [];
  const manifest = {
    apps: [
      {
        generator: "react-native",
        name: "mobile-app-1",
        path: "apps/mobile-app-1",
        ports: { dev: 4100, reference: 4101 }
      },
      {
        generator: "react-native",
        name: "customer-mobile",
        path: "apps/customer-mobile",
        ports: { dev: 4100, reference: 4101 }
      }
    ]
  };

  await ensureProjectPorts("/project", {
    read: async (path) =>
      path.endsWith(".mono-stack.json")
        ? JSON.stringify(manifest)
        : JSON.stringify({ scripts: {} }),
    write: async (path, contents) => writes.push({ path, contents }),
    checkPort: async () => true,
    remove: async () => assert.fail("named apps must generate root files")
  });

  const entry = writes.find(({ path }) => path === "/project/index.js");
  const metro = writes.find(({ path }) => path === "/project/metro.config.js");
  assert.match(entry.contents, /apps\/mobile-app-1/);
  assert.match(entry.contents, /apps\/customer-mobile/);
  assert.match(metro.contents, /apps\/mobile-app-1/);
  assert.match(metro.contents, /apps\/customer-mobile/);
  assert.doesNotMatch(entry.contents, /apps\/mobile['"]\/index/);

  let requiredEntry;
  new Function("require", "process", entry.contents)(
    (path) => {
      requiredEntry = path;
    },
    { env: { MONO_STACK_APP_PATH: "apps/customer-mobile" } }
  );
  assert.equal(requiredEntry, "./apps/customer-mobile/index.js");

  let requiredConfig;
  const module = {};
  new Function("require", "process", "module", metro.contents)(
    (path) => {
      requiredConfig = path;
      return { path };
    },
    { env: { MONO_STACK_APP_PATH: "apps/customer-mobile" } },
    module
  );
  assert.equal(requiredConfig, "./apps/customer-mobile/metro.config.js");
});

test("TEST-MOBILE-002 generates the canonical single app", async () => {
  const writes = [];
  const manifest = {
    apps: [
      {
        generator: "react-native",
        name: "mobile",
        path: "apps/mobile",
        ports: { dev: 4100, reference: 4101 }
      }
    ]
  };

  await ensureProjectPorts("/project", {
    read: async (path) =>
      path.endsWith(".mono-stack.json")
        ? JSON.stringify(manifest)
        : JSON.stringify({ scripts: {} }),
    write: async (path, contents) => writes.push({ path, contents }),
    checkPort: async () => true,
    remove: async () => assert.fail("canonical app must generate root files")
  });

  assert.match(
    writes.find(({ path }) => path === "/project/index.js").contents,
    /apps\/mobile/
  );
  assert.match(
    writes.find(({ path }) => path === "/project/metro.config.js").contents,
    /apps\/mobile/
  );
});

test("TEST-MOBILE-004 passes the selected app path to Metro", () => {
  const env = environmentFor(
    {
      generator: "react-native",
      path: "apps/customer-mobile",
      ports: { dev: 4100, reference: 4101 }
    },
    "reference",
    { PATH: "/bin" }
  );

  assert.equal(env.MONO_STACK_APP_PATH, "apps/customer-mobile");
  assert.equal(env.PATH, "/bin");
});

test("TEST-MOBILE-005 removes generated native roots when no native app exists", async () => {
  const removed = [];
  const manifest = { apps: [{ generator: "vite", path: "apps/web" }] };

  await ensureProjectPorts("/project", {
    read: async (path) =>
      path.endsWith(".mono-stack.json")
        ? JSON.stringify(manifest)
        : JSON.stringify({ scripts: {} }),
    write: async () => {},
    checkPort: async () => true,
    remove: async (path) => removed.push(path)
  });

  assert.deepEqual(removed, ["/project/index.js", "/project/metro.config.js"]);
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
