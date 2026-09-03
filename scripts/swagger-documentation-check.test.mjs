import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { validateControllerSource } from "#scripts/swagger-documentation-check.mjs";

test("TEST-SWAGGER-003 rejects a route without operation and response documentation", () => {
  const result = validateControllerSource(
    `
      @Controller("widgets")
      export class WidgetsController {
        @Get()
        findAll() {}
      }
    `,
    "widgets.controller.ts"
  );

  assert.deepEqual(result.errors, [
    "widgets.controller.ts: WidgetsController.findAll is missing @ApiOperation",
    "widgets.controller.ts: WidgetsController.findAll is missing @ApiResponse"
  ]);
});

test("TEST-SWAGGER-004 accepts a route with operation and response documentation", () => {
  const result = validateControllerSource(
    `
      @Controller("widgets")
      export class WidgetsController {
        @Get()
        @ApiOperation({ summary: "List widgets" })
        @ApiOkResponse({ description: "Widgets returned" })
        findAll() {}
      }
    `,
    "widgets.controller.ts"
  );

  assert.deepEqual(result.errors, []);
});

test("TEST-SWAGGER-005 requires the production Better Auth boundary to be documented", async () => {
  const source = await readFile(
    new URL("../apps/server/src/http/auth/auth.controller.ts", import.meta.url),
    "utf8"
  );

  assert.deepEqual(
    validateControllerSource(source, "auth.controller.ts").errors,
    []
  );
});
