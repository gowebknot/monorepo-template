import test from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const { findRelativeImports } = await import(
  pathToFileURL(
    join(dirname(fileURLToPath(import.meta.url)), "check-relative-imports.mjs")
  )
);

test("accepts aliases and package-name imports", () => {
  const source =
    'import Button from "@/components/button";\nimport type { User } from "@monorepo-template/entities";';
  assert.deepEqual(findRelativeImports(source, "src/components/page.tsx"), []);
});

test("accepts relative exports in barrel files", () => {
  assert.deepEqual(
    findRelativeImports(
      ['export * from "', ".", '/feature.js";'].join(""),
      "src/index.ts"
    ),
    []
  );
});

test("rejects relative imports, exports, dynamic imports, and requires outside barrels", () => {
  const source = [
    ['import helper from "', "..", '/lib/helper";'].join(""),
    ['export { value } from "', ".", '/value";'].join(""),
    ['const lazy = import("', ".", '/lazy");'].join(""),
    ['const loaded = require("', ".", '/loaded");'].join("")
  ].join("\n");
  assert.deepEqual(findRelativeImports(source, "src/feature.ts"), [
    { line: 1, specifier: "../lib/helper" },
    { line: 2, specifier: "./value" },
    { line: 3, specifier: "./lazy" },
    { line: 4, specifier: "./loaded" }
  ]);
});
