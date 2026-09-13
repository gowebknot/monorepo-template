import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { hashTree } from "#scripts/skills-hash.mjs";

test("TEST-SKILLSHASH-001 produces the same digest for identical trees", async (t) => {
  const left = await mkdtemp(join(tmpdir(), "skills-hash-left-"));
  const right = await mkdtemp(join(tmpdir(), "skills-hash-right-"));
  t.after(() =>
    Promise.all([
      rm(left, { force: true, recursive: true }),
      rm(right, { force: true, recursive: true })
    ])
  );

  for (const root of [left, right]) {
    await mkdir(join(root, "references"), { recursive: true });
    await writeFile(join(root, "SKILL.md"), "same content\n");
    await writeFile(join(root, "references", "notes.md"), "same notes\n");
  }

  assert.equal(await hashTree(left), await hashTree(right));
});

test("TEST-SKILLSHASH-002 produces a different digest when content differs", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "skills-hash-diff-"));
  t.after(() => rm(root, { force: true, recursive: true }));

  await writeFile(join(root, "SKILL.md"), "original\n");
  const before = await hashTree(root);

  await writeFile(join(root, "SKILL.md"), "changed\n");
  const after = await hashTree(root);

  assert.notEqual(before, after);
});

test("TEST-SKILLSHASH-003 rejects a symlink inside the tree", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "skills-hash-symlink-"));
  t.after(() => rm(root, { force: true, recursive: true }));

  await writeFile(join(root, "SKILL.md"), "content\n");
  await symlink(join(root, "SKILL.md"), join(root, "SKILL-link.md"));

  await assert.rejects(() => hashTree(root), /Symlinks are not allowed/);
});
