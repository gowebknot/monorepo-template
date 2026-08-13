import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const guide = await readFile(
  join(root, "skills/test-first-workflow/references/plan-to-test.md"),
  "utf8"
);
const example = await readFile(
  join(root, "skills/test-first-workflow/examples/quantity-field-plan.md"),
  "utf8"
).catch(() => "");
const simpleExample =
  guide.split("## Simple Example")[1]?.split("## Validation Sequence")[0] ?? "";
const taskMap =
  example
    .split("## Small Task and Test Map")[1]
    ?.split("## Exact Test Cases")[0] ?? "";
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

test("TEST-SKILL-142 links the guide to the complete quantity example", () => {
  assert.match(
    simpleExample,
    /\[complete quantity-field example\]\(\.\.\/examples\/quantity-field-plan\.md\)/i
  );
});

const taskCases = [
  ["143", "Show the quantity field", "TEST-FORM-001"],
  ["146", "Save the lowest allowed value", "TEST-FORM-002"],
  ["147", "Save a middle allowed value", "TEST-FORM-003"],
  ["148", "Save the highest allowed value", "TEST-FORM-004"],
  ["149", "Reject a missing value", "TEST-FORM-005"],
  ["150", "Reject a value below the minimum", "TEST-FORM-006"],
  ["151", "Reject a value above the maximum", "TEST-FORM-007"],
  ["152", "Reject a decimal value", "TEST-FORM-008"],
  [
    "153",
    "Show the validation message without saving",
    "TEST-FORM-005 through TEST-FORM-008"
  ]
];

for (const [id, taskName, testIds] of taskCases) {
  test(`TEST-SKILL-${id} maps ${taskName}`, () => {
    const row = taskMap.split("\n").find((line) => line.includes(taskName));
    assert.ok(row, `Missing task-map row for ${taskName}`);
    assert.match(row, new RegExp(testIds.replaceAll("-", "\\-")));
  });
}

const exactCases = [
  ["144", "TEST-FORM-001"],
  ["154", "TEST-FORM-002"],
  ["155", "TEST-FORM-003"],
  ["156", "TEST-FORM-004"],
  ["157", "TEST-FORM-005"],
  ["158", "TEST-FORM-006"],
  ["159", "TEST-FORM-007"],
  ["160", "TEST-FORM-008"]
];

for (const [id, caseId] of exactCases) {
  test(`TEST-SKILL-${id} keeps every field in ${caseId}`, () => {
    const block =
      example.split(`### ${caseId}`)[1]?.split(/\n### |\n## /)[0] ?? "";
    assert.ok(block, `Missing ${caseId}`);
    for (const field of fields) {
      assert.match(block, new RegExp(`${field}:`, "i"));
    }
  });
}
