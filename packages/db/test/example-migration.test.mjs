import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import * as example from "@monorepo-template/db/example";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const user = {
  id: "fixture-user",
  email: "fixture@example.test",
  createdAt: new Date(0),
  updatedAt: new Date(0)
};

function database(t, url = ":memory:") {
  const db = example.createExampleDb(url);
  t.after(() => db.$client.close());
  return db;
}

for (const name of [
  "users",
  "todos",
  "todoItems",
  "authAccounts",
  "authSessions"
]) {
  test(`TEST-MIGRATE-001 creates ${name} from the ORM schema`, (t) => {
    const db = database(t);
    example.migrateExampleDb(db);
    assert.deepEqual(db.select().from(example[name]).all(), []);
  });
}

test("TEST-MIGRATE-002 repeated migrations preserve existing records", (t) => {
  const db = database(t);
  example.migrateExampleDb(db);
  db.insert(example.users).values(user).run();
  example.migrateExampleDb(db);
  assert.deepEqual(db.select().from(example.users).all(), [
    { ...user, name: null }
  ]);
});

test("TEST-MIGRATE-003 migration failures propagate", () => {
  const db = example.createExampleDb(":memory:");
  db.$client.close();
  assert.throws(
    () => example.migrateExampleDb(db),
    (error) => {
      assert.match(error.message, /migration.*failed/i);
      assert.match(error.cause.cause.message, /not open|closed/);
      return true;
    }
  );
});

test("TEST-MIGRATE-004 unmanaged databases fail without deleting data", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "example-migration-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const url = join(directory, "legacy.sqlite");
  execFileSync(
    "pnpm",
    [
      "exec",
      "drizzle-kit",
      "push",
      "--dialect=sqlite",
      "--schema=./example/schema/index.ts",
      `--url=${url}`
    ],
    { cwd: packageRoot, stdio: "pipe", timeout: 30_000 }
  );
  const db = database(t, url);
  db.insert(example.users).values(user).run();
  assert.throws(() => example.migrateExampleDb(db), /migration.*failed/i);
  assert.deepEqual(db.select().from(example.users).all(), [
    { ...user, name: null }
  ]);
});
