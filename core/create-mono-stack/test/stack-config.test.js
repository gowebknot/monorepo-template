import assert from "node:assert/strict";
import test from "node:test";

import { readStackConfig } from "../../../scripts/stack-config.mjs";

const projectRoot = "/workspace/project";

const validApps = [
  {
    feature: "web-vite",
    generator: "vite",
    name: "dashboard",
    path: "apps/dashboard",
    referenceProfile: "vite/react-ts"
  },
  {
    feature: "api-nest",
    generator: "nestjs",
    name: "api",
    path: "apps/api",
    referenceProfile: "nestjs/default"
  }
];

function manifest(overrides = {}) {
  return {
    schemaVersion: 3,
    features: ["web-vite", "api-nest"],
    apps: validApps,
    ...overrides
  };
}

function read(value) {
  return readStackConfig(projectRoot, () =>
    typeof value === "string" ? value : JSON.stringify(value)
  );
}

function assertInvalid(id, value, pattern) {
  test(`${id} rejects its exact malformed stack manifest`, () => {
    assert.throws(() => read(value), pattern);
  });
}

test("TEST-MANIFEST-002 accepts schema version 3", () => {
  assert.deepEqual(read(manifest()), manifest());
});

assertInvalid("TEST-MANIFEST-003", "not-json", /not valid JSON/);
assertInvalid(
  "TEST-MANIFEST-004",
  manifest({ schemaVersion: 2 }),
  /schemaVersion 3/
);
assertInvalid(
  "TEST-MANIFEST-005",
  { schemaVersion: 3, apps: [] },
  /features must be an array/
);
assertInvalid(
  "TEST-MANIFEST-006",
  manifest({ apps: [], features: [] }),
  /features must contain known non-empty feature IDs/
);
assertInvalid(
  "TEST-MANIFEST-007",
  manifest({ apps: [], features: ["unknown"] }),
  /known non-empty feature IDs/
);
assertInvalid(
  "TEST-MANIFEST-008",
  manifest({ apps: [], features: ["web-vite", "web-vite"] }),
  /features must not contain duplicates/
);
assertInvalid(
  "TEST-MANIFEST-009",
  manifest({ apps: {} }),
  /apps must be an array/
);
assertInvalid(
  "TEST-MANIFEST-010",
  manifest({ features: ["api-nest"] }),
  /app feature is not selected: web-vite/
);
assertInvalid(
  "TEST-MANIFEST-011",
  manifest({
    apps: [{ ...validApps[0], generator: "nestjs" }, validApps[1]]
  }),
  /generator must be vite for web-vite/
);
assertInvalid(
  "TEST-MANIFEST-012",
  manifest({ apps: [{ ...validApps[0], path: "apps/other" }, validApps[1]] }),
  /path must equal apps\/dashboard/
);
assertInvalid(
  "TEST-MANIFEST-013",
  manifest({
    apps: [{ ...validApps[0], referenceProfile: true }, validApps[1]]
  }),
  /referenceProfile must be a string or null/
);
assertInvalid(
  "TEST-MANIFEST-014",
  manifest({
    apps: [{ ...validApps[0], referenceProfile: "vite/vue-ts" }, validApps[1]]
  }),
  /unknown referenceProfile: vite\/vue-ts/
);
assertInvalid(
  "TEST-MANIFEST-015",
  manifest({ apps: [], features: ["web-vite"] }),
  /missing app metadata for selected feature: web-vite/
);
assertInvalid(
  "TEST-MANIFEST-016",
  manifest({
    apps: [
      validApps[0],
      { ...validApps[0], name: "portal", path: "apps/portal" }
    ],
    features: ["web-vite"]
  }),
  /duplicate app feature: web-vite/
);
assertInvalid(
  "TEST-MANIFEST-017",
  manifest({
    apps: [
      { ...validApps[0], name: "app", path: "apps/app" },
      { ...validApps[1], name: "app", path: "apps/app" }
    ]
  }),
  /duplicate app name: app/
);
assertInvalid("TEST-MANIFEST-018", "null", /schemaVersion 3 object/);
assertInvalid(
  "TEST-MANIFEST-019",
  { schemaVersion: 3, features: ["api-express"] },
  /apps must be an array/
);
assertInvalid(
  "TEST-MANIFEST-020",
  manifest({ apps: [null], features: ["web-vite"] }),
  /app records must be objects/
);
assertInvalid(
  "TEST-MANIFEST-021",
  manifest({ apps: [{ ...validApps[0], feature: 1 }, validApps[1]] }),
  /app feature must be web-vite or api-nest/
);
assertInvalid(
  "TEST-MANIFEST-022",
  manifest({ apps: [{ ...validApps[0], name: undefined }, validApps[1]] }),
  /invalid app name/
);
assertInvalid(
  "TEST-MANIFEST-023",
  manifest({
    apps: [
      { ...validApps[0], name: "../web", path: "apps/../web" },
      validApps[1]
    ]
  }),
  /invalid app name/
);
assertInvalid(
  "TEST-MANIFEST-024",
  manifest({ apps: [{ ...validApps[0], generator: null }, validApps[1]] }),
  /generator must be vite or nestjs/
);
assertInvalid(
  "TEST-MANIFEST-025",
  manifest({
    apps: [
      { ...validApps[0], referenceProfile: "nestjs/default" },
      validApps[1]
    ]
  }),
  /referenceProfile is incompatible with web-vite/
);
assertInvalid(
  "TEST-MANIFEST-026",
  manifest({
    apps: [validApps[0], { ...validApps[1], referenceProfile: null }]
  }),
  /referenceProfile is incompatible with api-nest/
);

test("TEST-MANIFEST-027 accepts a deferred-only selection", () => {
  const value = manifest({ apps: [], features: ["api-express"] });
  assert.deepEqual(read(value), value);
});

test("TEST-MANIFEST-028 accepts a Vite app without a profile", () => {
  const value = manifest({
    apps: [{ ...validApps[0], referenceProfile: null }],
    features: ["web-vite"]
  });
  assert.deepEqual(read(value), value);
});

assertInvalid(
  "TEST-MANIFEST-029",
  { apps: [], features: ["api-express"] },
  /schemaVersion 3/
);
assertInvalid(
  "TEST-MANIFEST-030",
  manifest({ apps: [{ ...validApps[0], feature: undefined }, validApps[1]] }),
  /app feature must be web-vite or api-nest/
);
assertInvalid(
  "TEST-MANIFEST-031",
  manifest({ apps: [{ ...validApps[0], name: 1 }, validApps[1]] }),
  /invalid app name/
);
assertInvalid(
  "TEST-MANIFEST-032",
  manifest({ apps: [{ ...validApps[0], generator: undefined }, validApps[1]] }),
  /generator must be vite or nestjs/
);
assertInvalid(
  "TEST-MANIFEST-033",
  manifest({ apps: [{ ...validApps[0], path: undefined }, validApps[1]] }),
  /path must equal apps\/dashboard/
);
assertInvalid(
  "TEST-MANIFEST-034",
  manifest({ apps: [{ ...validApps[0], path: null }, validApps[1]] }),
  /path must equal apps\/dashboard/
);
assertInvalid(
  "TEST-MANIFEST-035",
  manifest({
    apps: [{ ...validApps[0], referenceProfile: undefined }, validApps[1]]
  }),
  /referenceProfile must be a string or null/
);
