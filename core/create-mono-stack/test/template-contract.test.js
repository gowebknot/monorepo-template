import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("..", import.meta.url)), "..", "..");

const serverRoots = [
  join(root, "apps/server"),
  join(root, "core/create-mono-stack/reference-templates/managed/server")
];

test("TEST-TEMPLATE-003 requires nested auth boundaries in both server sources", async () => {
  for (const serverRoot of serverRoots) {
    for (const path of [
      "src/http/auth/auth.controller.ts",
      "src/http/auth/auth.module.ts",
      "src/infra/auth/auth-handler.provider.ts",
      "src/infra/auth/auth.constants.ts"
    ]) {
      await access(join(serverRoot, path));
    }

    for (const path of [
      "src/auth.controller.ts",
      "src/auth.module.ts",
      "src/auth.constants.ts"
    ]) {
      await assert.rejects(access(join(serverRoot, path)));
    }
  }
});
