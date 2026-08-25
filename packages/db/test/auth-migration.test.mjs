import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));

test("contains a PostgreSQL auth migration for the Better Auth tables", async () => {
  const migrationRoot = join(packageRoot, "drizzle", "auth");
  const entries = await readdir(migrationRoot);
  const sqlFile = entries.find((entry) => entry.endsWith(".sql"));

  assert.ok(sqlFile);
  const sql = await readFile(join(migrationRoot, sqlFile), "utf8");

  for (const table of ["user", "session", "account", "verification"]) {
    assert.match(sql, new RegExp(`CREATE TABLE[^;]*"auth"[.]"${table}"`));
  }
  assert.match(sql, /CREATE SCHEMA IF NOT EXISTS "auth"/);
});
