import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_TEMPLATE_SOURCE,
  createProject
} from "../src/create-project.js";

test("restores a pre-existing empty destination when setup fails", async () => {
  const filesystemEvents = [];
  const destination = "/workspace/empty-project";
  let destinationReads = 0;

  await assert.rejects(
    createProject(
      {
        destination,
        projectName: "Empty Project",
        python: "python3",
        template: DEFAULT_TEMPLATE_SOURCE,
        vcsRef: undefined
      },
      {
        environment: { PATH: "/usr/bin" },
        mkdtemp: async () => "/tmp/create-mono-stack-cleanup",
        platform: "darwin",
        readdir: async () => {
          destinationReads += 1;
          return destinationReads === 1 ? [] : ["generated.txt", ".git"];
        },
        rm: async (...args) => filesystemEvents.push(["rm", ...args]),
        runCommand: async (command, args, options = {}) => {
          if (command === "git" && args[0] === "--version") {
            return { stderr: "", stdout: "git version 2.50.0\n" };
          }
          if (args[0] === "-m" && args[1] === "copier") {
            throw new Error("Copier failed");
          }
          return options.capture
            ? { stderr: "", stdout: "3.14.7\n" }
            : { stderr: "", stdout: "" };
        },
        temporaryDirectory: "/tmp"
      }
    ),
    /Copier failed/
  );

  assert.deepEqual(filesystemEvents, [
    ["rm", `${destination}/generated.txt`, { force: true, recursive: true }],
    ["rm", `${destination}/.git`, { force: true, recursive: true }],
    ["rm", "/tmp/create-mono-stack-cleanup", { force: true, recursive: true }]
  ]);
});

test("preserves setup and cleanup failures while attempting all cleanup", async () => {
  const cleanupAttempts = [];
  const destination = "/workspace/failed-project";

  await assert.rejects(
    createProject(
      {
        destination,
        projectName: "Failed Project",
        python: "python3",
        template: DEFAULT_TEMPLATE_SOURCE,
        vcsRef: undefined
      },
      {
        environment: { PATH: "/usr/bin" },
        mkdtemp: async () => "/tmp/create-mono-stack-failed-cleanup",
        platform: "darwin",
        readdir: async () => {
          const error = new Error("missing");
          error.code = "ENOENT";
          throw error;
        },
        rm: async (path) => {
          cleanupAttempts.push(path);
          throw new Error(
            path === destination
              ? "destination cleanup failed"
              : "temporary cleanup failed"
          );
        },
        runCommand: async (command, args, options = {}) => {
          if (command === "git" && args[0] === "--version") {
            return { stderr: "", stdout: "git version 2.50.0\n" };
          }
          if (args[0] === "-m" && args[1] === "copier") {
            throw new Error("Copier failed");
          }
          return options.capture
            ? { stderr: "", stdout: "3.14.7\n" }
            : { stderr: "", stdout: "" };
        },
        temporaryDirectory: "/tmp"
      }
    ),
    (error) => {
      assert.ok(error instanceof AggregateError);
      assert.deepEqual(
        error.errors.map(({ message }) => message),
        [
          "Copier failed",
          "destination cleanup failed",
          "temporary cleanup failed"
        ]
      );
      return true;
    }
  );
  assert.deepEqual(cleanupAttempts, [
    destination,
    "/tmp/create-mono-stack-failed-cleanup"
  ]);
});
