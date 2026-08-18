import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { updateTemplate } from "../../../scripts/update-template.mjs";

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

function manifest(overrides = {}) {
  return {
    schemaVersion: 3,
    features: ["web-vite", "api-nest"],
    apps: defaultApps,
    ...overrides
  };
}

function runUpdate(config, options = {}) {
  const calls = [];
  const execute = (command, args, commandOptions) => {
    calls.push({ args, command, options: commandOptions });
    return command === "git"
      ? { status: 1, stderr: "", stdout: "" }
      : { status: 0, stderr: "", stdout: "" };
  };
  const dependencies = {
    cwd: options.cwd ?? "/workspace/project",
    environment: { PATH: "/usr/bin" },
    execute,
    exists: () => true,
    platform: "darwin"
  };
  if (options.injectReader !== false) {
    dependencies.readFile = () => JSON.stringify(config);
  }

  assert.equal(updateTemplate(["--defaults"], dependencies), 0);
  return calls.at(-1).args;
}

function exclusions(args) {
  return args.flatMap((argument, index) =>
    argument === "--exclude" ? [args[index + 1]] : []
  );
}

test("TEST-UPDATE-001 reads the production stack manifest", async (t) => {
  const projectRoot = await mkdtemp(join(tmpdir(), "template-update-stack-"));
  t.after(() => rm(projectRoot, { force: true, recursive: true }));
  await writeFile(
    join(projectRoot, ".mono-stack.json"),
    `${JSON.stringify(manifest(), null, 2)}\n`
  );

  const args = runUpdate(manifest(), {
    cwd: projectRoot,
    injectReader: false
  });

  assert.ok(args.includes('features_json="[\\"web-vite\\",\\"api-nest\\"]"'));
  assert.ok(args.includes("feature_web_vite=true"));
  assert.ok(args.includes("feature_api_nest=true"));
});

test("TEST-UPDATE-002 excludes a custom supported web path", () => {
  const apps = [
    {
      ...defaultApps[0],
      name: "dashboard",
      path: "apps/dashboard"
    },
    defaultApps[1]
  ];

  assert.deepEqual(exclusions(runUpdate(manifest({ apps }))), [
    "apps/web",
    "apps/next",
    "apps/expo",
    "apps/mobile"
  ]);
});

test("TEST-UPDATE-003 excludes an unsupported native Vite app", () => {
  const apps = [{ ...defaultApps[0], referenceProfile: null }, defaultApps[1]];

  assert.deepEqual(exclusions(runUpdate(manifest({ apps }))), [
    "apps/web",
    "apps/next",
    "apps/expo",
    "apps/mobile"
  ]);
});

test("TEST-UPDATE-004 excludes server without a NestJS app record", () => {
  const config = manifest({
    features: ["web-vite"],
    apps: [defaultApps[0]]
  });

  assert.deepEqual(exclusions(runUpdate(config)), [
    "apps/next",
    "apps/server",
    "apps/expo",
    "apps/mobile"
  ]);
});

test("TEST-UPDATE-005 excludes web without a Vite app record", () => {
  const config = manifest({
    features: ["api-nest"],
    apps: [defaultApps[1]]
  });

  assert.deepEqual(exclusions(runUpdate(config)), [
    "apps/web",
    "apps/next",
    "apps/expo",
    "apps/mobile"
  ]);
});

test("TEST-UPDATE-006 excludes a custom supported NestJS path", () => {
  const apps = [
    defaultApps[0],
    {
      ...defaultApps[1],
      name: "api",
      path: "apps/api"
    }
  ];

  assert.deepEqual(exclusions(runUpdate(manifest({ apps }))), [
    "apps/next",
    "apps/server",
    "apps/expo",
    "apps/mobile"
  ]);
});

test("TEST-UPDATE-007 updates both default supported app paths", () => {
  assert.deepEqual(exclusions(runUpdate(manifest())), [
    "apps/next",
    "apps/expo",
    "apps/mobile"
  ]);
});

test("TEST-UPDATE-008 keeps selected native canonical app paths", () => {
  const nativeApps = [
    {
      feature: "web-next",
      generator: "next",
      name: "next",
      path: "apps/next",
      referenceProfile: "next/default"
    },
    {
      feature: "mobile-expo",
      generator: "expo",
      name: "expo",
      path: "apps/expo",
      referenceProfile: "expo/default"
    },
    {
      feature: "mobile-react-native",
      generator: "react-native",
      name: "mobile",
      path: "apps/mobile",
      referenceProfile: "react-native/default"
    }
  ];
  const config = manifest({
    features: nativeApps.map((app) => app.feature),
    apps: nativeApps
  });

  assert.deepEqual(exclusions(runUpdate(config)), ["apps/web", "apps/server"]);
});
