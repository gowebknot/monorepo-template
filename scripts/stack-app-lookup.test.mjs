import assert from "node:assert/strict";
import test from "node:test";

import { findAppByFeature } from "#scripts/stack-app-lookup.mjs";

const baseManifest = {
  schemaVersion: 3,
  features: ["api-nest"],
  apps: [
    {
      feature: "api-nest",
      generator: "nestjs",
      name: "api",
      path: "apps/api",
      referenceProfile: "nestjs/default"
    }
  ]
};

test("TEST-APPLOOKUP-001 resolves an app record by feature from a real manifest", () => {
  const app = findAppByFeature("/project", ["api-nest", "api-express"], {
    exists: () => true,
    read: () => JSON.stringify(baseManifest)
  });

  assert.deepEqual(app, baseManifest.apps[0]);
});

test("TEST-APPLOOKUP-002 returns null when no manifest exists", () => {
  const app = findAppByFeature("/repo", ["api-nest"], {
    exists: () => false,
    read: () => {
      throw new Error("read must not be called when no manifest exists");
    }
  });

  assert.equal(app, null);
});

test("TEST-APPLOOKUP-003 returns null when the manifest has no matching feature", () => {
  const manifest = {
    schemaVersion: 3,
    features: ["web-vite"],
    apps: [
      {
        feature: "web-vite",
        generator: "vite",
        name: "dashboard",
        path: "apps/dashboard",
        referenceProfile: "vite/react-ts"
      }
    ]
  };

  const app = findAppByFeature("/project", ["api-nest", "api-express"], {
    exists: () => true,
    read: () => JSON.stringify(manifest)
  });

  assert.equal(app, null);
});
