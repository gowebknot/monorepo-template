import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  validateControllerSource,
  validateSwaggerDocumentation
} from "#scripts/swagger-documentation-check.mjs";

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

test("TEST-SWAGGER-007 scans a custom server app path instead of the default apps/server", async () => {
  const root = await mkdtemp(join(tmpdir(), "swagger-check-"));
  try {
    const controllerDir = join(root, "apps/api/src");
    await mkdir(controllerDir, { recursive: true });
    await writeFile(
      join(controllerDir, "widgets.controller.ts"),
      `
        @Controller("widgets")
        export class WidgetsController {
          @Get()
          findAll() {}
        }
      `,
      "utf8"
    );

    const errors = await validateSwaggerDocumentation(root, {
      serverAppPath: "apps/api"
    });

    assert.deepEqual(errors, [
      "apps/api/src/widgets.controller.ts: WidgetsController.findAll is missing @ApiOperation",
      "apps/api/src/widgets.controller.ts: WidgetsController.findAll is missing @ApiResponse"
    ]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
