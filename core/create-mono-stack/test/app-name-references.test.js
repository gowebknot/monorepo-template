import assert from "node:assert/strict";
import test from "node:test";

import { syncAppNameReferences } from "#src/app-name-references.js";

function enoent() {
  const error = new Error("not found");
  error.code = "ENOENT";
  return error;
}

test("TEST-APPNAME-001 rewrites the filter name in a renamed app's AGENTS.md and CLAUDE.md", async () => {
  const written = {};
  const contents = {
    "/project/apps/dashboard/AGENTS.md": "pnpm --filter web typecheck",
    "/project/apps/dashboard/CLAUDE.md": "pnpm --filter web build"
  };

  await syncAppNameReferences(
    "/project",
    [{ feature: "web-vite", name: "dashboard", path: "apps/dashboard" }],
    {
      read: async (path) => {
        if (path in contents) return contents[path];
        throw enoent();
      },
      write: async (path, content) => {
        written[path] = content;
      }
    }
  );

  assert.equal(
    written["/project/apps/dashboard/AGENTS.md"],
    "pnpm --filter dashboard typecheck"
  );
  assert.equal(
    written["/project/apps/dashboard/CLAUDE.md"],
    "pnpm --filter dashboard build"
  );
  assert.equal("/project/apps/dashboard/README.md" in written, false);
});

test("TEST-APPNAME-002 leaves an unrenamed app's docs untouched", async () => {
  let writeCalled = false;

  await syncAppNameReferences(
    "/project",
    [{ feature: "web-vite", name: "web", path: "apps/web" }],
    {
      read: async () => "pnpm --filter web typecheck",
      write: async () => {
        writeCalled = true;
      }
    }
  );

  assert.equal(writeCalled, false);
});

test("TEST-APPNAME-003 skips a profile with no overlaid reference docs", async () => {
  let writeCalled = false;

  await syncAppNameReferences(
    "/project",
    [{ feature: "web-vite", name: "dashboard", path: "apps/dashboard" }],
    {
      read: async () => {
        throw enoent();
      },
      write: async () => {
        writeCalled = true;
      }
    }
  );

  assert.equal(writeCalled, false);
});

test("TEST-APPNAME-004 scopes each app's rewrite to its own directory", async () => {
  const written = {};
  const contents = {
    "/project/apps/dashboard/AGENTS.md": "pnpm --filter web typecheck",
    "/project/apps/api/AGENTS.md": "pnpm --filter server test"
  };

  await syncAppNameReferences(
    "/project",
    [
      { feature: "web-vite", name: "dashboard", path: "apps/dashboard" },
      { feature: "api-nest", name: "api", path: "apps/api" }
    ],
    {
      read: async (path) => {
        if (path in contents) return contents[path];
        throw enoent();
      },
      write: async (path, content) => {
        written[path] = content;
      }
    }
  );

  assert.equal(
    written["/project/apps/dashboard/AGENTS.md"],
    "pnpm --filter dashboard typecheck"
  );
  assert.equal(
    written["/project/apps/api/AGENTS.md"],
    "pnpm --filter api test"
  );
});

test("TEST-APPNAME-005 does not corrupt a longer word containing the canonical name", async () => {
  const written = {};
  const source = "See the webpack notes below.\npnpm --filter web typecheck";

  await syncAppNameReferences(
    "/project",
    [{ feature: "web-vite", name: "dashboard", path: "apps/dashboard" }],
    {
      read: async () => source,
      write: async (path, content) => {
        written[path] = content;
      }
    }
  );

  const output = written["/project/apps/dashboard/AGENTS.md"];
  assert.match(output, /See the webpack notes below\./);
  assert.match(output, /pnpm --filter dashboard typecheck/);
});
