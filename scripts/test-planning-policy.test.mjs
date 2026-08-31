import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));

async function readPolicies() {
  const workflowRoot = join(repositoryRoot, "skills/test-first-workflow");
  const [
    workflow,
    guidance,
    template,
    testingPolicy,
    checklistSkill,
    checklistReference
  ] = await Promise.all([
    readFile(join(workflowRoot, "SKILL.md"), "utf8"),
    readFile(join(workflowRoot, "references/plan-to-test.md"), "utf8"),
    readFile(join(workflowRoot, "templates/task-checklist.md"), "utf8"),
    readFile(join(repositoryRoot, "skills/testing-policy/SKILL.md"), "utf8"),
    readFile(
      join(repositoryRoot, "skills/checklist-tracking/SKILL.md"),
      "utf8"
    ),
    readFile(
      join(
        repositoryRoot,
        "skills/checklist-tracking/references/checklist-policy.md"
      ),
      "utf8"
    )
  ]);

  return {
    workflow,
    guidance,
    template,
    testingPolicy,
    checklistSkill,
    checklistReference
  };
}

test("TEST-SKILL-019 rejects broad test notes", async () => {
  const { workflow, guidance, template, checklistSkill, checklistReference } =
    await readPolicies();

  assert.match(
    workflow,
    /"add focused tests," "test edge cases," or\s+"test errors" is not a test case/
  );
  assert.match(guidance, /headings only when exact cases are listed below/);
  assert.match(template, /only a heading/);
  assert.match(
    checklistSkill,
    /A broad test heading does not count as a test case/
  );
  assert.match(
    checklistReference,
    /A broad row such as "test invalid requests" is not enough/
  );
});

test("TEST-SKILL-020 splits work into testable parts", async () => {
  const { workflow, guidance, template, checklistReference } =
    await readPolicies();

  assert.match(workflow, /Split the Work Until Each Part Is Small/);
  assert.match(
    workflow,
    /Keep splitting with as many checklist levels as needed/
  );
  assert.match(workflow, /could pass or fail separately/);
  assert.match(
    guidance,
    /Keep splitting until each smallest item has one clear result/
  );
  assert.match(template, /Use as many checklist levels as needed/);
  assert.match(checklistReference, /two parts\s+could pass or fail separately/);
  assert.match(workflow, /Do not start tests or\s+implementation/);
});

test("TEST-SKILL-021 requires the durable implementation contract", async () => {
  const { workflow, template } = await readPolicies();
  for (const text of [workflow, template]) {
    assert.match(text, /Implementation Contract/);
    assert.match(text, /Feature\s+Boundaries/);
    assert.match(text, /Route-Group Ownership/);
    assert.match(text, /User Journey/);
    assert.match(text, /Complete Test Matrix/);
    assert.match(text, /Unresolved Conflicts/);
  }
  assert.match(workflow, /happy and non-happy path/);
  assert.match(template, /Every reachable happy and non-happy path/);
});

test("TEST-SKILL-022 separates normal and rejected values", async () => {
  const { workflow, guidance, template, testingPolicy } = await readPolicies();

  assert.match(
    workflow,
    /normal valid situations and each separate invalid situation/
  );
  assert.match(guidance, /Normal valid values and successful results/);
  assert.match(
    guidance,
    /Each validation rule and each separate kind of rejected value/
  );
  assert.match(template, /Normal valid values and successful results/);
  assert.match(template, /Each separate validation rule and rejected value/);
  assert.match(testingPolicy, /Do not hide them inside one broad\s+case/);
});

test("TEST-SKILL-023 maps every small task and rule to cases", async () => {
  const { workflow, guidance, template, checklistSkill, checklistReference } =
    await readPolicies();

  assert.match(
    workflow,
    /map every smallest task item and every known rule to its test IDs/
  );
  assert.match(
    guidance,
    /Map every smallest task item to one or more test IDs/
  );
  assert.match(guidance, /Map every discovered rule to one or more test IDs/);
  assert.match(template, /Small Task and Test Map/);
  assert.match(template, /Every smallest task and every known rule must map/);
  assert.match(
    checklistSkill,
    /every smallest task item and every known rule maps to one or more test\s+IDs/i
  );
  assert.match(
    checklistReference.replace(/\s+/g, " "),
    /Every smallest task and known rule must map to test IDs/
  );
});

test("TEST-SKILL-024 asks about undefined behavior", async () => {
  const { workflow, guidance, template, testingPolicy } = await readPolicies();

  assert.match(
    workflow,
    /ask the user instead of guessing, inventing a rule, or silently skipping/
  );
  assert.match(guidance, /ask the user instead of guessing/);
  assert.match(
    template,
    /Needed answer: <plain-English question for the user>/
  );
  assert.match(template, /Blocking items:/);
  assert.match(testingPolicy, /ask the user instead of guessing/);
});

test("TEST-SKILL-025 limits combined-value cases", async () => {
  const { workflow, guidance, template, testingPolicy } = await readPolicies();

  assert.match(
    workflow,
    /Test values together when one value changes how another value should behave/
  );
  assert.match(
    workflow,
    /Do not create every\s+possible mix of unrelated values/
  );
  assert.match(guidance, /Test two or more values together/);
  assert.match(guidance, /Do not list every possible mix of unrelated values/);
  assert.match(
    template,
    /Values that affect one another, check order, or multiple errors/
  );
  assert.match(
    testingPolicy,
    /Do not test every possible mix of unrelated values/
  );
});

test("TEST-SKILL-026 keeps table-based rows traceable", async () => {
  const {
    workflow,
    guidance,
    testingPolicy,
    checklistSkill,
    checklistReference
  } = await readPolicies();

  for (const text of [
    workflow,
    guidance,
    testingPolicy,
    checklistSkill,
    checklistReference
  ]) {
    assert.match(text, /table-based test/);
    assert.match(text, /(each|every) row/);
    assert.match(text, /test ID|case ID/);
    assert.match(text, /exact (values|input)/i);
    assert.match(text, /expected result/);
  }
});

test("TEST-SKILL-032 requires plain English", async () => {
  const {
    workflow,
    guidance,
    template,
    testingPolicy,
    checklistSkill,
    checklistReference
  } = await readPolicies();

  for (const text of [
    workflow,
    guidance,
    template,
    testingPolicy,
    checklistSkill,
    checklistReference
  ]) {
    assert.match(text, /Use plain English/);
    assert.match(text, /technical term/);
  }
});

test("TEST-SKILL-034 lists interaction steps and one main behavior", async () => {
  const { workflow, guidance, template, testingPolicy } = await readPolicies();

  for (const text of [workflow, guidance, template, testingPolicy]) {
    assert.match(text, /Interaction steps/);
    assert.match(text, /main behavior/i);
  }
});

async function readTierFiles() {
  const workflowRoot = join(repositoryRoot, "skills/test-first-workflow");
  const [workflow, guidance, template, lightRecord, agents] = await Promise.all(
    [
      readFile(join(workflowRoot, "SKILL.md"), "utf8"),
      readFile(join(workflowRoot, "references/plan-to-test.md"), "utf8"),
      readFile(join(workflowRoot, "templates/task-checklist.md"), "utf8"),
      readFile(join(workflowRoot, "templates/light-change-record.md"), "utf8"),
      readFile(join(repositoryRoot, "AGENTS.md"), "utf8")
    ]
  );
  return { workflow, guidance, template, lightRecord, agents };
}

test("TEST-SKILL-161 documents the three change tiers", async () => {
  const { workflow, guidance } = await readTierFiles();
  assert.match(workflow, /## Choose the Change Tier/);
  assert.match(guidance, /## Change Tier Selection/);
  for (const text of [workflow, guidance]) {
    assert.match(text, /\blight\b/);
    assert.match(text, /\bstandard\b/);
    assert.match(text, /\blarge\b/);
  }
});

test("TEST-SKILL-162 lists the disqualifiers and the any-yes rule", async () => {
  const { guidance } = await readTierFiles();
  for (let index = 1; index <= 7; index += 1) {
    assert.match(guidance, new RegExp(`(^|\\n)\\s*${index}\\. `));
  }
  assert.match(
    guidance,
    /any (disqualifier |answer )?(is |answered )?["']?yes/i
  );
});

test("TEST-SKILL-163 states light-tier never invokes the e2e skills", async () => {
  const { workflow, guidance } = await readTierFiles();
  for (const text of [workflow, guidance]) {
    assert.match(text, /e2e-regression-test-writer/);
    assert.match(text, /maestro-mobile-e2e-test-writer/);
    assert.match(text, /light[- ]tier changes? (never|do not)/i);
  }
});

test("TEST-SKILL-164 ships the light attestation template", async () => {
  const { workflow, guidance, lightRecord } = await readTierFiles();
  for (const text of [workflow, guidance, lightRecord]) {
    assert.match(text, /LIGHT-TIER-ATTESTATION/);
    for (let index = 1; index <= 7; index += 1) {
      assert.match(text, new RegExp(`(^|\\n)\\s*${index}\\. `));
    }
  }
});

test("TEST-SKILL-165 requires a large parent to link standard-tier children", async () => {
  const { workflow, guidance } = await readTierFiles();
  for (const text of [workflow, guidance]) {
    assert.match(text, /at least two child checklists/i);
    assert.match(text, /standard[- ]tier/i);
  }
});

test("TEST-SKILL-166 keeps the light-change record lightweight", async () => {
  const { lightRecord } = await readTierFiles();
  assert.match(lightRecord, /## Acceptance Criteria/);
  assert.match(lightRecord, /## Validation Cases/);
  assert.match(lightRecord, /## Recorded Results/);
  assert.doesNotMatch(lightRecord, /## Implementation Contract/);
  assert.doesNotMatch(lightRecord, /## Missing-Case Review/);
  assert.doesNotMatch(lightRecord, /## Exact Test Case Rules/);
});

test("TEST-SKILL-167 adds the tier headings to the task checklist template", async () => {
  const { template } = await readTierFiles();
  assert.match(template, /## Change Tier/);
  assert.match(template, /## Child Checklists/);
});

test("TEST-SKILL-168 documents the e2e skill boundaries in AGENTS.md", async () => {
  const { agents } = await readTierFiles();
  assert.match(agents, /change tier/i);
  assert.match(agents, /e2e-regression-test-writer/);
  assert.match(agents, /maestro-mobile-e2e-test-writer/);
  assert.match(agents, /apps\/playwright/);
  assert.match(agents, /apps\/maestro/);
});
