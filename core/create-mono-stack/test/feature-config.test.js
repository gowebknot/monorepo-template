import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_FEATURES,
  FEATURE_DEFINITIONS,
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
  assert.deepEqual(
    normalizeFeatures(["mobile-expo", "web-next", "api-express"]),
    ["web-next", "api-express", "mobile-expo"]
  );
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
    "feature_web_next=false",
    "feature_api_nest=true",
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
