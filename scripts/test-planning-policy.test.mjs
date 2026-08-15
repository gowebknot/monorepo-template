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
