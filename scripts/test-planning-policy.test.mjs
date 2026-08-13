import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const policyPaths = {
  workflow: "skills/test-first-workflow/SKILL.md",
  guide: "skills/test-first-workflow/references/plan-to-test.md",
  template: "skills/test-first-workflow/templates/task-checklist.md",
  testingPolicy: "skills/testing-policy/SKILL.md",
  checklistSkill: "skills/checklist-tracking/SKILL.md",
  checklistReference: "skills/checklist-tracking/references/checklist-policy.md"
};
const policies = Object.fromEntries(
  await Promise.all(
    Object.entries(policyPaths).map(async ([name, path]) => [
      name,
      (await readFile(new URL(`../${path}`, import.meta.url), "utf8")).replace(
        /\s+/g,
        " "
      )
    ])
  )
);
const policyCases = [
  [
    "019",
    "rejects broad test notes in the workflow",
    "workflow",
    /"add focused tests," "test edge cases," or "test errors" is not a test case/
  ],
  [
    "099",
    "rejects broad test notes in the guide",
    "guide",
    /headings only when exact cases are listed below/
  ],
  [
    "100",
    "rejects broad test notes in the template",
    "template",
    /only a heading/
  ],
  [
    "101",
    "rejects broad test notes in the checklist skill",
    "checklistSkill",
    /A broad test heading does not count as a test case/
  ],
  [
    "102",
    "rejects broad test notes in the checklist reference",
    "checklistReference",
    /A broad row such as "test invalid requests" is not enough/
  ],
  [
    "020",
    "starts recursive work decomposition in the workflow",
    "workflow",
    /Split the Work Until Each Part Is Small/
  ],
  [
    "103",
    "allows work nesting at any depth in the workflow",
    "workflow",
    /Keep splitting with as many checklist levels as needed/
  ],
  [
    "104",
    "splits independently failing work in the workflow",
    "workflow",
    /could pass or fail separately/
  ],
  [
    "105",
    "stops at independently testable work in the guide",
    "guide",
    /Keep splitting until each smallest item has one clear result/
  ],
  [
    "106",
    "allows work nesting at any depth in the template",
    "template",
    /Use as many checklist levels as needed/
  ],
  [
    "107",
    "splits independently failing work in the checklist reference",
    "checklistReference",
    /two parts could pass or fail separately/
  ],
  [
    "108",
    "blocks broad work in the workflow",
    "workflow",
    /Do not start tests or implementation while an item is still broad/
  ],
  [
    "022",
    "separates valid and rejected values in the workflow",
    "workflow",
    /normal valid situations and each separate invalid situation/
  ],
  [
    "109",
    "separates valid and rejected values in the guide",
    "guide",
    /Normal valid values and successful results.*Each validation rule and each separate kind of rejected value/
  ],
  [
    "110",
    "separates valid and rejected values in the template",
    "template",
    /Normal valid values and successful results.*Each separate validation rule and rejected value/
  ],
  [
    "111",
    "separates rejected values in the testing policy",
    "testingPolicy",
    /Do not hide them inside one broad case/
  ],
  [
    "023",
    "maps tasks and rules in the workflow",
    "workflow",
    /map every smallest task item and every known rule to its test IDs/i
  ],
  [
    "112",
    "maps tasks and rules in the guide",
    "guide",
    /Map every smallest task item to one or more test IDs.*Map every discovered rule to one or more test IDs/
  ],
  [
    "113",
    "maps tasks and rules in the template",
    "template",
    /Every smallest task and every known rule must map/
  ],
  [
    "114",
    "maps tasks and rules in the checklist skill",
    "checklistSkill",
    /every smallest task item and every known rule maps to one or more test IDs/i
  ],
  [
    "115",
    "maps tasks and rules in the checklist reference",
    "checklistReference",
    /Every smallest task and known rule must map to test IDs/
  ],
  [
    "024",
    "asks and blocks when workflow behavior is undefined",
    "workflow",
    /If no source defines what should happen.*search the repository.*answer is still unknown.*ask the user.*block the affected work/
  ],
  [
    "025",
    "limits combined values in the workflow",
    "workflow",
    /Test values together when one value changes how another value should behave.*Do not create every possible mix of unrelated values/
  ],
  [
    "122",
    "limits combined values in the guide",
    "guide",
    /Test two or more values together.*Do not list every possible mix of unrelated values/
  ],
  [
    "123",
    "reviews related values in the template",
    "template",
    /Values that affect one another, check order, or multiple errors/
  ],
  [
    "124",
    "limits combined values in the testing policy",
    "testingPolicy",
    /Do not test every possible mix of unrelated values/
  ],
  [
    "026",
    "keeps workflow table rows traceable",
    "workflow",
    /table-based test.*every row.*case ID.*exact values.*expected result/i
  ],
  [
    "125",
    "keeps guide table rows traceable",
    "guide",
    /table-based test.*every row.*test ID.*exact values.*expected result/i
  ],
  [
    "126",
    "keeps testing-policy table rows traceable",
    "testingPolicy",
    /table-based test.*every row.*test ID.*exact input.*expected result/i
  ],
  [
    "127",
    "keeps checklist-skill table rows traceable",
    "checklistSkill",
    /table-based test.*each row.*test ID.*expected result/i
  ],
  [
    "128",
    "keeps checklist-reference table rows traceable",
    "checklistReference",
    /table-based test.*every row.*test ID.*input.*expected result/i
  ],
  [
    "032",
    "requires plain English in the workflow",
    "workflow",
    /Use plain English.*technical term/
  ],
  [
    "129",
    "requires plain English in the guide",
    "guide",
    /Use plain English.*technical term/
  ],
  [
    "130",
    "requires plain English in the template",
    "template",
    /Use plain English.*technical term/
  ],
  [
    "131",
    "requires plain English in the testing policy",
    "testingPolicy",
    /Use plain English.*technical term/
  ],
  [
    "132",
    "requires plain English in the checklist skill",
    "checklistSkill",
    /Use plain English.*technical term/
  ],
  [
    "133",
    "requires plain English in the checklist reference",
    "checklistReference",
    /Use plain English.*technical term/
  ],
  [
    "034",
    "preserves one workflow behavior across interaction steps",
    "workflow",
    /Interaction steps.*Main behavior/i
  ],
  [
    "134",
    "preserves one guide behavior across interaction steps",
    "guide",
    /Interaction steps.*Main behavior/i
  ],
  [
    "135",
    "preserves one template behavior across interaction steps",
    "template",
    /Interaction steps.*Main behavior/i
  ],
  [
    "136",
    "preserves one testing-policy behavior across interaction steps",
    "testingPolicy",
    /List every interaction step.*one main behavior.*Do not split one behavior merely because it needs several steps/i
  ],
  [
    "138",
    "keeps explicit read-only workflow tasks in memory",
    "workflow",
    /explicitly requires a read-only review, explanation, or research task.*in memory.*do not create or update a checklist/i
  ],
  [
    "139",
    "keeps explicit read-only guide tasks in memory",
    "guide",
    /explicitly requires a read-only review, explanation, or research task.*in memory.*do not create or update a checklist/i
  ],
  [
    "140",
    "keeps explicit read-only checklist tasks in memory",
    "checklistSkill",
    /explicitly requires a read-only review, explanation, or research task.*in memory.*do not create or update a checklist/i
  ],
  [
    "141",
    "keeps explicit read-only reference tasks in memory",
    "checklistReference",
    /explicitly requires a read-only review, explanation, or research task.*in memory.*do not create or update a checklist/i
  ]
];
for (const [id, name, policy, pattern] of policyCases) {
  test(`TEST-SKILL-${id} ${name}`, () => {
    assert.match(policies[policy], pattern);
  });
}
