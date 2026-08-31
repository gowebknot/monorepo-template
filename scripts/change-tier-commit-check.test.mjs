import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { promisify } from "node:util";

import { evaluateCommit } from "#scripts/change-tier-commit-check.mjs";
import { withGitRepository } from "#scripts/test-helpers/implementation-contract-fixture.mjs";

const execFileAsync = promisify(execFile);

const exemptTable = JSON.stringify({
  always: ["test-first-workflow"],
  rules: [],
  exempt: [
    "docs/checklists/**",
    ".claude/**",
    "**/node_modules/**",
    "**/dist/**",
    "**/.turbo/**"
  ]
});

const lightBlock = [
  "chore(dev): raise the dev server port",
  "",
  "LIGHT-TIER-ATTESTATION",
  "1. Changes runtime behavior, control flow, or a conditional branch: no",
  "2. Adds or changes an API contract, schema, DTO, validator, or shared type: no",
  "3. Changes a route, navigation, form behavior, or user-facing validation: no",
  "4. Touches authentication, authorization, sessions, roles, permissions, or ownership: no",
  "5. Adds or changes an endpoint, background job, scheduled task, or data migration: no",
  "6. Adds or modifies an e2e/integration/behavior test or any file under apps/playwright or apps/maestro: no",
  "7. Needs more than one small cohesive edit, or is really a large multi-behavior change: no",
  "Acceptance criteria: dev server listens on 4100",
  "Validation: pnpm --filter server typecheck -> passes",
  "Recorded results: pnpm --filter server typecheck -> passed"
].join("\n");

async function stage(directory, files) {
  for (const [path, content] of Object.entries(files)) {
    const full = join(directory, path);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, content);
    await execFileAsync("git", ["add", "--", path], { cwd: directory });
  }
}

test("TEST-COMMIT-001 accepts a commit that touches only exempt paths", async () => {
  await withGitRepository(async (directory) => {
    await stage(directory, {
      ".claude/skill-triggers.json": exemptTable,
      "docs/checklists/2026-08-31-x.md": "# plan\n"
    });
    const result = await evaluateCommit({
      cwd: directory,
      message: "docs: notes\n"
    });
    assert.equal(result.ok, true);
  });
});

test("TEST-COMMIT-002 accepts a non-exempt change staged with its checklist", async () => {
  await withGitRepository(async (directory) => {
    await stage(directory, {
      ".claude/skill-triggers.json": exemptTable,
      "src/example.ts": "export const x = 1;\n",
      "docs/checklists/2026-08-31-example.md": "# plan\n"
    });
    const result = await evaluateCommit({
      cwd: directory,
      message: "feat: example\n"
    });
    assert.equal(result.ok, true);
  });
});

test("TEST-COMMIT-003 accepts a non-exempt change with a complete light block", async () => {
  await withGitRepository(async (directory) => {
    await stage(directory, {
      ".claude/skill-triggers.json": exemptTable,
      "src/example.ts": "export const x = 1;\n"
    });
    const result = await evaluateCommit({
      cwd: directory,
      message: lightBlock
    });
    assert.equal(result.ok, true);
  });
});

test("TEST-COMMIT-003b rejects a light block that has no recorded results", async () => {
  await withGitRepository(async (directory) => {
    await stage(directory, {
      ".claude/skill-triggers.json": exemptTable,
      "src/example.ts": "export const x = 1;\n"
    });
    const message = lightBlock.replace(/\nRecorded results: .*/, "");
    const result = await evaluateCommit({ cwd: directory, message });
    assert.equal(result.ok, false);
  });
});

test("TEST-COMMIT-004 rejects a bare non-exempt change", async () => {
  await withGitRepository(async (directory) => {
    await stage(directory, {
      ".claude/skill-triggers.json": exemptTable,
      "src/example.ts": "export const x = 1;\n"
    });
    const result = await evaluateCommit({
      cwd: directory,
      message: "refactor: tidy example\n"
    });
    assert.equal(result.ok, false);
    assert.match(result.reason, /change-tier gate/);
    assert.match(result.reason, /src\/example\.ts/);
  });
});

test("TEST-COMMIT-005 fails open when the trigger table is missing", async () => {
  await withGitRepository(async (directory) => {
    await stage(directory, { "src/example.ts": "export const x = 1;\n" });
    const result = await evaluateCommit({
      cwd: directory,
      message: "refactor: tidy example\n"
    });
    assert.equal(result.ok, true);
  });
});
