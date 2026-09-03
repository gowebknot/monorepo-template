import assert from "node:assert/strict";
import test from "node:test";

import { selectChecks } from "#scripts/pre-commit-checks.mjs";

test("TEST-SWAGGER-006 runs the Swagger convention check when the server exists", () => {
  const checks = selectChecks({ hasCoreLauncher: false, hasServer: true });

  assert.deepEqual(checks[2], {
    label: "swagger documentation",
    args: ["swagger:check"]
  });
});

test("TEST-SWAGGER-006 skips the Swagger convention check without a server", () => {
  const checks = selectChecks({ hasCoreLauncher: false, hasServer: false });

  assert.equal(
    checks.some(({ args }) => args.includes("swagger:check")),
    false
  );
});
