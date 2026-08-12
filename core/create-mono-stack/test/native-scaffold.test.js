import assert from "node:assert/strict";
import test from "node:test";

import {
  nativeScaffoldDependencies,
  scaffoldNativeApps,
  validateAppName
} from "../src/native-scaffold.js";

test("validates safe native app names", () => {
  assert.equal(validateAppName("admin-dashboard"), "admin-dashboard");
  for (const name of ["", "../web", "web/app", "web app", "--web"]) {
    assert.throws(() => validateAppName(name), /Invalid app name/);
  }
});

test("scaffolds selected Vite and NestJS apps with native commands", async () => {
  const calls = [];
  const copied = [];
  const files = new Map([
    ["/tmp/native/vite-dashboard/package.json", '{"name":"dashboard"}'],
    ["/tmp/native/nestjs-api/package.json", '{"name":"api"}']
  ]);
  const apps = await scaffoldNativeApps(
    {
      destination: "/workspace/project",
      features: ["web-vite", "api-nest"],
      serverAppName: "api",
      webAppName: "dashboard"
    },
    {
      cp: async (...args) => copied.push(args),
      readFile: async (path) => files.get(path),
      rm: async () => {},
      runCommand: async (...args) => calls.push(args),
      temporaryRoot: "/tmp/native"
    }
  );

  assert.deepEqual(calls, [
    [
      "pnpm",
      ["create", "vite", "/tmp/native/vite-dashboard"],
      {
        cwd: "/workspace/project",
        stdio: "inherit"
      }
    ],
    [
      "pnpm",
      [
        "dlx",
        "@nestjs/cli",
        "new",
        "/tmp/native/nestjs-api",
        "--skip-git",
        "--package-manager",
        "pnpm"
      ],
      {
        cwd: "/workspace/project",
        stdio: "inherit"
      }
    ]
  ]);
  assert.deepEqual(apps, [
    {
      generator: "vite",
      name: "dashboard",
      packageName: "dashboard",
      path: "apps/dashboard",
      reference: "vite-react"
    },
    {
      generator: "nestjs",
      name: "api",
      packageName: "api",
      path: "apps/api",
      reference: "nestjs"
    }
  ]);
  assert.equal(copied.length, 2);
});

test("provides native filesystem dependencies by default", () => {
  const dependencies = nativeScaffoldDependencies({});
  assert.equal(typeof dependencies.cp, "function");
  assert.equal(typeof dependencies.readFile, "function");
  assert.equal(typeof dependencies.rm, "function");
});
