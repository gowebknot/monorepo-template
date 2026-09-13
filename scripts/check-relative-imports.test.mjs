import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import test from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const { checkFiles, findRelativeImports, getStagedSourceFiles } = await import(
  pathToFileURL(
    join(dirname(fileURLToPath(import.meta.url)), "check-relative-imports.mjs")
  )
);

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const migratedDirectories = [
  "apps/server",
  "core/create-mono-stack/reference-templates/managed",
  "packages/env",
  "packages/api-client",
  "packages/db",
  "packages/query-client",
  "scripts"
];

function git(cwd, ...args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" });
}

async function createTempRepo(t) {
  const root = await mkdtemp(join(tmpdir(), "check-relative-imports-"));
  t.after(() => rm(root, { force: true, recursive: true }));
  git(root, "init", "-q", "--initial-branch", "main");
  git(root, "config", "user.email", "test@example.test");
  git(root, "config", "user.name", "Test");
  return root;
}

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

test("accepts relative exports in @monorepo-template/env's env.ts barrels", () => {
  assert.deepEqual(
    findRelativeImports(
      ['export * from "', ".", '/global-env.js";'].join(""),
      "packages/env/src/env.ts"
    ),
    []
  );
  assert.deepEqual(
    findRelativeImports(
      ['export * from "', ".", '/src/env.js";'].join(""),
      "packages/env/env.ts"
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

test("TEST-IMPORTS-001 returns nothing when there is no commit yet", async (t) => {
  const root = await createTempRepo(t);
  await writeFile(
    join(root, "feature.ts"),
    ['import helper from "', ".", '/helper";\n'].join("")
  );
  git(root, "add", "feature.ts");

  assert.deepEqual(getStagedSourceFiles(root), []);
});

test("TEST-IMPORTS-002 behaves as before once a commit exists", async (t) => {
  const root = await createTempRepo(t);
  await writeFile(
    join(root, "first.ts"),
    ['import helper from "', ".", '/helper";\n'].join("")
  );
  git(root, "add", "first.ts");
  git(root, "commit", "-q", "-m", "first commit");

  await writeFile(
    join(root, "second.ts"),
    ['import other from "', ".", '/other";\n'].join("")
  );
  git(root, "add", "second.ts");

  assert.deepEqual(getStagedSourceFiles(root), ["second.ts"]);
});

// eslint.config.{mjs,js} files that reach the workspace root's own eslint.config.js cannot use a
// package.json "imports" subpath instead: Node's "imports" field rejects any target outside the
// owning package's own directory (confirmed empirically this session -- ERR_INVALID_PACKAGE_TARGET),
// and these files are loaded directly by the ESLint CLI with no bundler in the loop, so there is no
// alias mechanism available at all. A genuine, structural exception, not an oversight.
const rootEslintConfigReferences = new Set([
  "apps/server/eslint.config.mjs",
  "core/create-mono-stack/reference-templates/managed/server/eslint.config.mjs",
  "core/create-mono-stack/reference-templates/managed/web/eslint.config.js"
]);

test("TEST-ALIASMIG-001 shipped/authored content has no relative imports outside barrels", async () => {
  const tracked = execFileSync(
    "git",
    ["ls-files", "--", ...migratedDirectories],
    { cwd: repoRoot, encoding: "utf8" }
  )
    .split("\n")
    .filter(Boolean)
    .filter((filePath) => /\.(?:cjs|js|jsx|mjs|ts|tsx)$/.test(filePath))
    .filter((filePath) => !rootEslintConfigReferences.has(filePath));

  assert.ok(
    tracked.length > 50,
    "expected to scan a realistic number of files"
  );
  assert.deepEqual(await checkFiles(tracked.map((f) => join(repoRoot, f))), []);
});
