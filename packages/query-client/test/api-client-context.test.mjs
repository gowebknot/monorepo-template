import assert from "node:assert/strict";
import test from "node:test";

import { resolveServiceOptions } from "#src/resolve-service-options";

test("inherits the provider service options", () => {
  assert.deepEqual(
    resolveServiceOptions(
      { baseURL: "https://primary.example.test" },
      undefined
    ),
    { baseURL: "https://primary.example.test", headers: undefined }
  );
});

test("allows an inline base URL override", () => {
  const options = resolveServiceOptions(
    { baseURL: "https://primary.example.test" },
    { baseURL: "https://alternate.example.test" }
  );

  assert.equal(options.baseURL, "https://alternate.example.test");
});

test("merges inline headers over provider headers", () => {
  assert.deepEqual(
    resolveServiceOptions(
      {
        baseURL: "https://primary.example.test",
        headers: { Authorization: "primary", "X-App": "reference" }
      },
      { headers: { Authorization: "alternate" } }
    ),
    {
      baseURL: "https://primary.example.test",
      headers: { Authorization: "alternate", "X-App": "reference" }
    }
  );
});

test("rejects missing effective base URL", () => {
  assert.throws(
    () => resolveServiceOptions(undefined, undefined),
    /ApiClientConfigProvider.*ServiceOptions/
  );
});

test("keeps resolved options distinct for different API targets", () => {
  const primary = resolveServiceOptions(
    { baseURL: "https://primary.example.test" },
    undefined
  );
  const alternate = resolveServiceOptions(
    { baseURL: "https://alternate.example.test" },
    undefined
  );

  assert.notDeepEqual(primary, alternate);
});
