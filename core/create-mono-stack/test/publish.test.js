import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  buildPublishCommand,
  normalizePublishArguments,
  publishPackage
} from "../scripts/publish.mjs";

const packageRoot = "/workspace/core/create-mono-stack";
const authConfig = "/workspace/.npmrc.auth";

test("TEST-PACKAGE-101 publishes framework reference templates", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8")
  );

  assert.ok(manifest.files.includes("reference-templates"));
});

test("strips the package-script argument separator", () => {
  assert.deepEqual(normalizePublishArguments(["--", "--tag", "next"]), [
    "--tag",
    "next"
  ]);
  assert.deepEqual(normalizePublishArguments(["--tag", "next"]), [
    "--tag",
    "next"
  ]);
});

test("builds a cross-platform publish command with the project auth config", () => {
  assert.deepEqual(
    buildPublishCommand({
      args: ["--tag", "next"],
      authConfig,
      environment: { PATH: "/usr/bin" },
      packageRoot,
      platform: "darwin"
    }),
    {
      args: ["publish", "--tag", "next"],
      command: "pnpm",
      options: {
        cwd: packageRoot,
        env: {
          NPM_CONFIG_USERCONFIG: authConfig,
          PATH: "/usr/bin"
        },
        shell: false,
        stdio: "inherit"
      }
    }
  );
  assert.equal(
    buildPublishCommand({
      args: [],
      authConfig,
      environment: {},
      packageRoot,
      platform: "win32"
    }).command,
    "pnpm.cmd"
  );
});

test("uses an explicit auth config and forwards publish arguments", async () => {
  let accessPath;
  let command;
  const result = await publishPackage({
    args: ["--tag", "next"],
    access: async (path) => {
      accessPath = path;
    },
    environment: {
      NPM_CONFIG_USERCONFIG: "/workspace/custom-auth.npmrc",
      PATH: "/usr/bin"
    },
    packageRoot,
    platform: "darwin",
    run: async (publishCommand) => {
      command = publishCommand;
      return "published";
    }
  });

  assert.equal(accessPath, "/workspace/custom-auth.npmrc");
  assert.equal(result, "published");
  assert.deepEqual(command, {
    args: ["publish", "--tag", "next"],
    command: "pnpm",
    options: {
      cwd: packageRoot,
      env: {
        NPM_CONFIG_USERCONFIG: "/workspace/custom-auth.npmrc",
        PATH: "/usr/bin"
      },
      shell: false,
      stdio: "inherit"
    }
  });
});

test("fails before publishing when the default project auth file is missing", async () => {
  let publishStarted = false;

  await assert.rejects(
    publishPackage({
      access: async () => {
        const error = new Error("missing");
        error.code = "ENOENT";
        throw error;
      },
      environment: { PATH: "/usr/bin" },
      packageRoot,
      repositoryRoot: "/workspace",
      run: async () => {
        publishStarted = true;
      }
    }),
    /Publish auth config not found.*\/workspace\/\.npmrc\.auth/
  );
  assert.equal(publishStarted, false);
});
