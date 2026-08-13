import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const workflowRoot = join(root, "skills/test-first-workflow");
const policies = Promise.all([
  readFile(join(workflowRoot, "references/plan-to-test.md"), "utf8"),
  readFile(join(workflowRoot, "templates/task-checklist.md"), "utf8")
]);

function listBullets(markdown, startHeading, endHeading) {
  const section = markdown.split(startHeading)[1].split(endHeading)[0];
  const bullets = new Map();
  let current;

  for (const line of section.split("\n")) {
    if (line.startsWith("- ")) {
      current = line.slice(2);
      bullets.set(current.split(/[,.]/)[0], current);
    } else if (current && /^\s+\S/.test(line)) {
      bullets.set(
        current.split(/[,.]/)[0],
        `${bullets.get(current.split(/[,.]/)[0])} ${line.trim()}`
      );
    } else if (!line.trim()) {
      current = undefined;
    }
  }

  return bullets;
}

const requiredCases = [
  ["035", "a missing value", "Missing value", /Missing value/, "Missing value"],
  [
    "036",
    "an explicit null value",
    "Missing value",
    /explicit `null`/,
    "Explicit `null` value"
  ],
  ["037", "an empty value", "Missing value", /empty value/, "Empty value"],
  [
    "038",
    "spaces-only text",
    "Missing value",
    /spaces-only text/,
    "Spaces-only text"
  ],
  [
    "039",
    "a wrong value type",
    "Missing value",
    /wrong value type/,
    "Wrong-type value"
  ],
  ["040", "a bad format", "Bad format", /Bad format/, "Bad-format value"],
  [
    "041",
    "an unsupported value",
    "Bad format",
    /unsupported value/,
    "Unsupported value"
  ],
  [
    "042",
    "a duplicate value",
    "Bad format",
    /duplicate value/,
    "Duplicate value"
  ],
  [
    "043",
    "conflicting values",
    "Bad format",
    /values that conflict/,
    "Conflicting values"
  ],
  [
    "044",
    "the exact minimum",
    "An exact minimum",
    /An exact minimum/,
    "Exact minimum"
  ],
  [
    "045",
    "the closest value below the minimum",
    "An exact minimum",
    /closest value below it/,
    "Below minimum"
  ],
  [
    "046",
    "the exact maximum",
    "An exact minimum",
    /an exact maximum/,
    "Exact maximum"
  ],
  [
    "047",
    "the closest value above the maximum",
    "An exact minimum",
    /closest value above it/,
    "Above maximum"
  ],
  ["048", "each choice", "Each choice or branch", /Each choice/, "Each choice"],
  ["049", "each branch", "Each choice or branch", /branch/, "Each branch"],
  ["050", "empty data", "Empty data", /Empty data/, "Empty data"],
  ["051", "one item", "Empty data", /one item/, "One item"],
  ["052", "many items", "Empty data", /many items/, "Many items"],
  [
    "053",
    "an allowed state change",
    "Each allowed state change and each blocked state change",
    /allowed state change/,
    "Allowed state change"
  ],
  [
    "054",
    "a blocked state change",
    "Each allowed state change and each blocked state change",
    /blocked state change/,
    "Blocked state change"
  ],
  ["055", "not found", "Not found", /Not found/, "Not found"],
  [
    "056",
    "a dependency failure",
    "Not found",
    /dependency failure/,
    "Dependency failure"
  ],
  ["057", "a timeout", "Not found", /timeout/, "Timeout"],
  [
    "058",
    "an unexpected error",
    "Not found",
    /unexpected error/,
    "Unexpected error"
  ],
  ["059", "a signed-out user", "Signed out", /Signed out/, "Signed-out access"],
  [
    "060",
    "a wrong permission",
    "Signed out",
    /wrong permission/,
    "Wrong-permission access"
  ],
  ["061", "a wrong owner", "Signed out", /wrong owner/, "Wrong-owner access"],
  [
    "062",
    "a wrong account",
    "Signed out",
    /wrong account/,
    "Wrong-account access"
  ],
  [
    "063",
    "required data changes",
    "Required data changes",
    /Required data changes/,
    "Required data changes"
  ],
  [
    "064",
    "required outside calls",
    "Required data changes",
    /outside calls/,
    "Required outside calls"
  ],
  [
    "065",
    "required messages",
    "Required data changes",
    /messages/,
    "Required messages"
  ],
  [
    "066",
    "required events",
    "Required data changes",
    /events/,
    "Required events"
  ],
  [
    "067",
    "required file changes",
    "Required data changes",
    /files/,
    "Required file changes"
  ],
  [
    "068",
    "required navigation",
    "Required data changes",
    /navigation/,
    "Required navigation"
  ],
  [
    "069",
    "forbidden work after rejection",
    "Work that must not happen after a rejected request or error",
    /must not happen after a rejected/,
    "Work that must not happen after rejection or failure"
  ],
  [
    "070",
    "a repeated request",
    "A repeated request",
    /repeated request/,
    "Repeated requests"
  ],
  ["071", "a retry", "A repeated request", /retry/, "Retries"],
  [
    "072",
    "duplicate delivery",
    "A repeated request",
    /duplicate delivery/,
    "Duplicate delivery"
  ],
  [
    "073",
    "old callers",
    "Old callers",
    /Old callers/,
    "Existing callers that must keep working"
  ],
  [
    "074",
    "stored data",
    "Old callers",
    /stored data/,
    "Stored data that must keep working"
  ],
  [
    "075",
    "existing public behavior",
    "Old callers",
    /public behavior/,
    "Public behavior that must keep working"
  ],
  ["076", "a loading view", "Loading", /Loading/, "Loading view"],
  ["077", "an empty view", "Loading", /empty/, "Empty view"],
  ["078", "a success view", "Loading", /success/, "Success view"],
  ["079", "an error view", "Loading", /error/, "Error view"],
  ["080", "a retry view", "Loading", /retry views/, "Retry view"]
];

for (const [
  number,
  name,
  bulletName,
  guidancePattern,
  templateLabel
] of requiredCases) {
  test(`TEST-SKILL-${number} requires ${name}`, async () => {
    const [guidance, template] = await policies;
    const guidanceBullets = listBullets(
      guidance,
      "## Find Every Needed Case",
      "## Missing-Case Review"
    );
    const templateSection = template
      .split("## Missing-Case Review")[1]
      .split("## Validation Cases for Non-Code Work")[0];

    assert.match(guidanceBullets.get(bulletName), guidancePattern);
    assert.match(
      templateSection,
      new RegExp(`^- \\[ \\] ${templateLabel}:`, "m")
    );
  });
}
