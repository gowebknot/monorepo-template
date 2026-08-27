#!/usr/bin/env node

import { readFile, stat } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const requiredHeadings = [
  "## Implementation Contract",
  "### Feature Boundaries",
  "### Route-Group Ownership",
  "### User Journey",
  "### Complete Test Matrix",
  "### Unresolved Conflicts"
];

const matrixHeading = "### Complete Test Matrix";
const conflictsHeading = "### Unresolved Conflicts";

function sectionBetween(markdown, startHeading, endHeading) {
  const start = markdown.indexOf(startHeading);
  if (start < 0) return "";
  const contentStart = start + startHeading.length;
  const end = endHeading ? markdown.indexOf(endHeading, contentStart) : -1;
  return markdown.slice(contentStart, end < 0 ? markdown.length : end);
}

function addError(errors, message) {
  errors.push(message);
}

export function validateImplementationContract(markdown) {
  const errors = [];
  if (typeof markdown !== "string" || markdown.trim() === "") {
    return { valid: false, errors: ["checklist is empty"] };
  }

  for (const heading of requiredHeadings) {
    if (!markdown.includes(heading)) addError(errors, `missing ${heading}`);
  }

  const contract = sectionBetween(
    markdown,
    "## Implementation Contract",
    "## Acceptance Criteria"
  );
  if (contract.includes("<") || contract.includes(">")) {
    addError(errors, "implementation contract still contains placeholders");
  }

  const matrix = sectionBetween(markdown, matrixHeading, conflictsHeading);
  const rows = matrix
    .split("\n")
    .filter((line) => /^\|\s*TEST-[A-Z0-9-]+\s*\|/.test(line));
  if (rows.length === 0) {
    addError(errors, "complete test matrix has no test rows");
  }

  const happy = rows.some((row) => /\bhappy\b|\bvalid\b|\bsuccess/i.test(row));
  const nonHappy = rows.some((row) =>
    /\bnon-happy\b|\binvalid\b|\bfail|\berror|\bretry|\btimeout|\boffline|\breject/i.test(
      row
    )
  );
  if (!happy)
    addError(errors, "complete test matrix has no happy or valid path");
  if (!nonHappy) addError(errors, "complete test matrix has no non-happy path");

  for (const [index, row] of rows.entries()) {
    const cells = row
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (
      cells.length < 6 ||
      cells.some((cell) => cell === "" || cell.startsWith("<"))
    ) {
      addError(errors, `complete test matrix row ${index + 1} is incomplete`);
    }
  }

  const conflicts = sectionBetween(markdown, conflictsHeading);
  const hasNoConflict = /none found/i.test(conflicts);
  const hasResolvedConflict = /resolved|winning rule|winning decision/i.test(
    conflicts
  );
  const hasBlockingConflict = /unresolved|blocked|blocking question/i.test(
    conflicts
  );
  if (!hasNoConflict && !hasResolvedConflict) {
    addError(
      errors,
      "unresolved conflicts must state None found or a winning decision"
    );
  }
  if (hasBlockingConflict && !hasResolvedConflict) {
    addError(
      errors,
      "blocking conflicts must be resolved before implementation"
    );
  }

  return { valid: errors.length === 0, errors };
}

export async function findActiveChecklist(cwd) {
  try {
    const { stdout } = await execFileAsync(
      "git",
      [
        "status",
        "--porcelain=v1",
        "--untracked-files=all",
        "--",
        "docs/checklists"
      ],
      { cwd }
    );
    const paths = stdout
      .split("\n")
      .map((line) => line.slice(3).trim())
      .filter((filePath) => filePath.endsWith(".md"));
    if (paths.length === 0) return undefined;

    const resolved = await Promise.all(
      paths.map(async (filePath) => ({
        filePath,
        modified: (await stat(`${cwd}/${filePath}`)).mtimeMs
      }))
    );
    return resolved.sort((left, right) => right.modified - left.modified)[0]
      .filePath;
  } catch {
    return undefined;
  }
}

export function formatValidationFailure(result) {
  return `Implementation contract is incomplete:\n- ${result.errors.join("\n- ")}`;
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error(
      "Usage: node scripts/implementation-contract.mjs <checklist>"
    );
    process.exitCode = 2;
  } else {
    const result = validateImplementationContract(
      await readFile(filePath, "utf8")
    );
    if (!result.valid) {
      console.error(formatValidationFailure(result));
      process.exitCode = 1;
    }
  }
}
