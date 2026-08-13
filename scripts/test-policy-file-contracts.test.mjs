import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const files = [
  ["workflow", "skills/test-first-workflow/SKILL.md"],
  ["guide", "skills/test-first-workflow/references/plan-to-test.md"],
  ["template", "skills/test-first-workflow/templates/task-checklist.md"],
  ["testing policy", "skills/testing-policy/SKILL.md"],
  ["checklist skill", "skills/checklist-tracking/SKILL.md"],
  [
    "checklist reference",
    "skills/checklist-tracking/references/checklist-policy.md"
  ]
];
const contents = new Map(
  await Promise.all(
    files.map(async ([name, path]) => [
      name,
      await readFile(join(root, path), "utf8")
    ])
  )
);
const fields = [
  "Small task",
  "Source",
  "Test place",
  "Starting state",
  "Exact input or fixture",
  "Interaction steps",
  "Main behavior",
  "Expected result",
  "Must change",
  "Must not happen",
  "Planned command",
  "Expected result before the code change",
  "First observed run",
  "Passing rerun"
];

function fieldPattern(field) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`${escaped}:`, "i");
}

function normalize(markdown) {
  return markdown.replace(/\*\*|`/g, "").replace(/\s+/g, " ");
}

function exactCaseRules(markdown) {
  const marker = "## Exact Test Case Rules\n";
  assert.equal(
    markdown.split(marker).length,
    2,
    "Expected one Exact Test Case Rules section"
  );
  return normalize(markdown.split(marker)[1].split("\n## ")[0]);
}

for (const [index, [name]] of files.entries()) {
  const fieldId = String(81 + index).padStart(3, "0");
  const resultId = String(87 + index).padStart(3, "0");
  const conflictId = String(93 + index).padStart(3, "0");
  const unknownId = String(116 + index).padStart(3, "0");

  test(`TEST-SKILL-${fieldId} keeps every case field in the ${name}`, () => {
    const text = exactCaseRules(contents.get(name));
    for (const field of fields) assert.match(text, fieldPattern(field));
  });

  test(`TEST-SKILL-${resultId} keeps planned and observed results separate in the ${name}`, () => {
    const text = exactCaseRules(contents.get(name));
    assert.match(text, /During planning.*Planned command/i);
    assert.match(
      text,
      /During planning.*Expected result before the code change/i
    );
    assert.match(text, /First observed run.*only after.*command.*run/i);
    assert.match(text, /Passing rerun.*only after.*command.*run/i);
    assert.match(text, /Do not invent test results before running the command/);
  });

  test(`TEST-SKILL-${conflictId} blocks conflicting rules in the ${name}`, () => {
    const text = exactCaseRules(contents.get(name));
    assert.match(text, /trusted sources disagree/i);
    assert.match(text, /which source wins/i);
    assert.match(text, /ask the user/i);
    assert.match(
      text,
      /block the affected (tests and implementation|cases and implementation|work)/i
    );
  });

  test(`TEST-SKILL-${unknownId} blocks undefined behavior in the ${name}`, () => {
    const text = exactCaseRules(contents.get(name));
    assert.match(text, /no trusted source defines the expected behavior/i);
    assert.match(text, /search the repository/i);
    assert.match(text, /answer is still unknown/i);
    assert.match(text, /ask the user/i);
    assert.match(text, /block the affected work/i);
  });
}
