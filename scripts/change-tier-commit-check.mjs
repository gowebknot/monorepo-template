#!/usr/bin/env node

// commit-msg backstop for the change-tier workflow. A commit that touches a
// non-exempt path must carry an audit trail: either a checklist file in the
// same commit (standard or large tier) or a complete LIGHT-TIER-ATTESTATION
// block with a filled "Recorded results:" line in the commit message body
// (light tier). Exempt-only commits pass untouched.
//
// Like scripts/skill-gate.mjs this fails OPEN on any unexpected problem (no
// trigger table, no git, unreadable message) so a backstop bug can never brick
// commits, and fails CLOSED only on a real "non-exempt change with no audit
// trail" verdict.

import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { matchesAny } from "#scripts/glob.mjs";
import { parseLightAttestation } from "#scripts/implementation-contract.mjs";

const execFileAsync = promisify(execFile);

async function stagedPaths(cwd) {
  const { stdout } = await execFileAsync(
    "git",
    ["diff", "--cached", "--name-only", "--diff-filter=d"],
    { cwd }
  );
  return stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

async function loadExemptGlobs(cwd) {
  const raw = await readFile(`${cwd}/.claude/skill-triggers.json`, "utf8");
  return JSON.parse(raw).exempt ?? [];
}

function isChecklistFile(path) {
  return /^docs\/checklists\/.+\.md$/.test(path);
}

function hasCompleteLightBlock(message) {
  return (
    parseLightAttestation(message) === "light" &&
    /(?:^|\n)\s*Recorded results:\s*\S/i.test(message)
  );
}

export async function evaluateCommit({ cwd, message }) {
  let exemptGlobs;
  let paths;
  try {
    [exemptGlobs, paths] = await Promise.all([
      loadExemptGlobs(cwd),
      stagedPaths(cwd)
    ]);
  } catch {
    return { ok: true }; // Fail open: no trigger table or no git.
  }

  const gated = paths.filter((path) => !matchesAny(path, exemptGlobs));
  if (gated.length === 0) return { ok: true };
  if (paths.some(isChecklistFile)) return { ok: true };
  if (hasCompleteLightBlock(message)) return { ok: true };

  return {
    ok: false,
    reason:
      "change-tier gate: this commit changes non-exempt files with no audit " +
      "trail. Add the standard/large checklist to the commit, or, for a " +
      "light-tier change, paste the LIGHT-TIER-ATTESTATION block (all seven " +
      'answers "no", plus a filled "Recorded results:" line) into the commit ' +
      "message. See skills/test-first-workflow/templates/light-change-record.md.\n" +
      `Non-exempt files: ${gated.join(", ")}`
  };
}

async function main() {
  const messagePath = process.argv[2];
  if (!messagePath) return; // Fail open: nothing to check.

  let message;
  try {
    message = await readFile(messagePath, "utf8");
  } catch {
    return; // Fail open: unreadable message file.
  }

  const result = await evaluateCommit({ cwd: process.cwd(), message });
  if (result.ok) return;

  process.stderr.write(`${result.reason}\n`);
  process.exitCode = 1;
}

if (
  process.argv[1] &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href
) {
  await main();
}
