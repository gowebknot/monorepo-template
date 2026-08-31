#!/usr/bin/env node

import { readFile, stat } from "node:fs/promises";
import { execFile } from "node:child_process";
import { resolve } from "node:path";
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

const LIGHT_ATTESTATION_MARKER = "LIGHT-TIER-ATTESTATION";
const LIGHT_ATTESTATION_WINDOW = 2000;

// The seven disqualifiers an agent must answer "no" to claim the light tier.
// Each entry only anchors on the leading "<n>." so the exact wording can evolve
// in the skill text without breaking the gate; the answer must be an explicit
// "yes" or "no" so the committed "<yes or no>" placeholder never counts.
function lightAnswerPattern(index) {
  return new RegExp(`(?:^|\\n)\\s*${index}\\.[^\\n]*?:\\s*(yes|no)\\b`, "i");
}

// Transcript text reaches the gate as JSON-encoded lines, so a multi-line
// attestation an agent typed arrives with "\n" (and "\"") escaped. Normalize a
// candidate block back to real newlines before matching, mirroring the
// [\s\S] bridging that parseReadPaths uses for the same reason.
function normalizeTranscriptBlock(block) {
  return block
    .replace(/\\r\\n|\\n|\\r/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"');
}

export function detectChangeTier(markdown) {
  if (typeof markdown !== "string") return "standard";
  const section = sectionBetween(markdown, "## Change Tier", "\n## ");
  const match = section.match(/Tier:\s*(light|standard|large)\b/i);
  return match ? match[1].toLowerCase() : "standard";
}

export function parseLightAttestation(text) {
  if (typeof text !== "string") return undefined;

  const declarations = [
    ...text.matchAll(/Change tier:\s*(light|standard|large)\b/gi)
  ].map((match) => ({ index: match.index, tier: match[1].toLowerCase() }));
  const markerIndex = text.lastIndexOf(LIGHT_ATTESTATION_MARKER);
  if (markerIndex >= 0) {
    declarations.push({ index: markerIndex, tier: "light" });
  }
  if (declarations.length === 0) return undefined;

  const last = declarations
    .sort((left, right) => left.index - right.index)
    .at(-1);
  if (last.tier !== "light" || markerIndex < 0) return undefined;

  const block = normalizeTranscriptBlock(
    text.slice(markerIndex, markerIndex + LIGHT_ATTESTATION_WINDOW)
  );
  for (let index = 1; index <= 7; index += 1) {
    const answer = block.match(lightAnswerPattern(index));
    if (!answer || answer[1].toLowerCase() !== "no") return undefined;
  }
  if (!/(?:^|\n)\s*Acceptance criteria:\s*\S/i.test(block)) return undefined;
  if (!/(?:^|\n)\s*Validation:\s*\S/i.test(block)) return undefined;
  return "light";
}

export async function validateLargeChecklist(
  markdown,
  { cwd = process.cwd(), readFile: read = readFile } = {}
) {
  const errors = [];
  if (!markdown.includes("## Change Tier")) {
    addError(errors, "missing ## Change Tier");
  }

  const section = sectionBetween(markdown, "## Child Checklists", "\n## ");
  const links = [
    ...new Set(
      [...section.matchAll(/(docs\/checklists\/[^)\s]+\.md)/g)].map(
        (match) => match[1]
      )
    )
  ];
  if (links.length < 2) {
    addError(
      errors,
      "large-tier parent must link at least two child checklists under ## Child Checklists"
    );
    return { valid: errors.length === 0, errors, tier: "large" };
  }

  for (const link of links) {
    try {
      const childMarkdown = await read(resolve(cwd, link), "utf8");
      if (!childMarkdown.includes("## Implementation Contract")) {
        addError(
          errors,
          `child checklist ${link} is missing its ## Implementation Contract`
        );
      }
    } catch {
      addError(errors, `child checklist ${link} does not exist`);
    }
  }

  return { valid: errors.length === 0, errors, tier: "large" };
}

export async function validateActiveChecklist(markdown, options = {}) {
  if (typeof markdown !== "string" || markdown.trim() === "") {
    return { valid: false, errors: ["checklist is empty"], tier: "standard" };
  }

  const tier = detectChangeTier(markdown);
  if (tier === "light") {
    return {
      valid: false,
      tier: "light",
      errors: [
        "light-tier changes must not create a checklist file; record the attestation, validation, and results in the response and commit body, or reclassify the change as standard"
      ]
    };
  }
  if (tier === "large") return validateLargeChecklist(markdown, options);
  return { ...validateImplementationContract(markdown), tier: "standard" };
}

export function extractChecklistReferences(markdown) {
  const section = sectionBetween(markdown, "Related checklists:", "##");
  return [
    ...section.matchAll(/(?:\]\(|^\s*[-*]\s+)(docs\/checklists\/[^)\s]+\.md)/gm)
  ].map((match) => match[1]);
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
  const label =
    result.tier === "large"
      ? "Large-tier checklist is incomplete"
      : result.tier === "light"
        ? "Light-tier declaration is incomplete"
        : "Implementation contract is incomplete";
  return `${label}:\n- ${result.errors.join("\n- ")}`;
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error(
      "Usage: node scripts/implementation-contract.mjs <checklist>"
    );
    process.exitCode = 2;
  } else {
    const result = await validateActiveChecklist(
      await readFile(filePath, "utf8"),
      { cwd: process.cwd() }
    );
    if (!result.valid) {
      console.error(formatValidationFailure(result));
      process.exitCode = 1;
    }
  }
}
