import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_FEATURES,
  FEATURE_DEFINITIONS,
  defaultInstanceName,
  normalizeFeatures,
  serializeFeatureData
} from "../src/feature-config.js";

test("normalizes the default stack when no features are supplied", () => {
  assert.deepEqual(normalizeFeatures(), DEFAULT_FEATURES);
  assert.deepEqual(normalizeFeatures("api-nest,web-vite"), [
    "web-vite",
    "api-nest"
  ]);
});

test("normalizes multiple feature selections in catalog order", () => {
  assert.deepEqual(normalizeFeatures(["api-nest", "web-vite"]), [
    "web-vite",
    "api-nest"
  ]);
});

test("rejects invalid feature selections", () => {
  for (const value of [
    "",
    "web-vite,",
    "unknown",
    "web-vite,web-vite",
    42,
    {}
  ]) {
    assert.throws(() => normalizeFeatures(value), /feature/i);
  }
});

test("serializes feature flags and the manifest payload for Copier", () => {
  assert.deepEqual(serializeFeatureData(["web-vite", "api-nest"]), [
    'features_json="[\\"web-vite\\",\\"api-nest\\"]"',
    "feature_web_vite=true",
    "feature_api_nest=true",
    "feature_web_next=false",
    "feature_api_express=false",
    "feature_mobile_expo=false",
    "feature_mobile_react_native=false"
  ]);
});

test("keeps feature definitions stable and uniquely identified", () => {
  assert.equal(
    new Set(FEATURE_DEFINITIONS.map(({ id }) => id)).size,
    FEATURE_DEFINITIONS.length
  );
});

test("TEST-MULTI-001 defaultInstanceName derives sequential default names", () => {
  assert.equal(defaultInstanceName("web-next", 0), "next-app-1");
  assert.equal(defaultInstanceName("web-next", 1), "next-app-2");
  assert.equal(defaultInstanceName("web-next", 2), "next-app-3");
});

test("TEST-FEATURE-001 documents every feature with a non-empty description", () => {
  for (const { description, id } of FEATURE_DEFINITIONS) {
    assert.equal(
      typeof description,
      "string",
      `${id} is missing a description`
    );
    assert.ok(description.trim().length > 0, `${id} has an empty description`);
  }
});
