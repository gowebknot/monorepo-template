# Detailed Test Planning

- Checklist ID: CHECKLIST-20260812-detailed-test-planning
- Created: 2026-08-12
- Planning completed: 2026-08-12
- Type: Repository skill change
- Source request: Make agents split large tasks into small parts and write detailed test cases for
  every part instead of writing broad notes such as "add focused tests."
- Related checklists:
  - Original workflow: [Test-First Workflow Checklist](./2026-08-11-test-first-workflow-checklist.md)
  - Planning order: [Workflow Order Correction Checklist](./2026-08-11-plan-before-checklist-workflow.md)
  - Checklist history rules: [Checklist Lifecycle Policy](./2026-08-11-checklist-lifecycle.md)
- Affected paths: `skills/test-first-workflow`, `skills/testing-policy`,
  `skills/checklist-tracking`, `scripts/skills.test.mjs`,
  `scripts/test-planning-policy.test.mjs`, `scripts/test-case-coverage-policy.test.mjs`,
  `scripts/test-policy-file-contracts.test.mjs`, `scripts/test-workflow-example-policy.test.mjs`,
  `scripts/run-skills-tests.mjs`,
  `docs/checklists/2026-08-12-detailed-test-planning-case-catalog.md`,
  `docs/checklists/2026-08-12-detailed-test-planning-final-review-cases.md`,
  `docs/checklists/2026-08-12-detailed-test-planning-validation-history.md`, `package.json`, all copied
  skill folders, and `.skills-sync.json`
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## What Is Wrong Today

- [x] Read the current workflow, test guidance, checklist template, and skill tests.
- [x] Confirm the current instructions allow broad lines such as "write focused tests."
- [x] Confirm the current template does not make the agent write exact input and expected result for
      every test case.
- [x] Confirm the current instructions do not clearly tell the agent to keep splitting a large task
      into smaller parts.
- [x] Confirm there is no automated check protecting these rules.

## What Must Change

- [x] Make the agent split every large task into smaller parts.
  - [x] Split the requested feature into behaviors that a user or another system can notice.
  - [x] Split each behavior into its separate rules, choices, success paths, and failure paths.
  - [x] Keep splitting with as many checklist levels as needed.
  - [x] Stop only when each smallest item has one clear result that can be tested on its own.
  - [x] Split an item again when two parts of it could pass or fail separately.
- [x] Make the agent plan tests for every smallest task item before coding.
  - [x] Give every exact test situation its own `TEST-<AREA>-<NUMBER>` ID.
  - [x] Say where the expected behavior came from, such as the request, schema, validator, existing
        test, or current public behavior.
  - [x] Write the exact starting state and sample data.
  - [x] Write every interaction step and name the one main behavior being tested.
  - [x] Write the exact result that must be checked.
  - [x] Write what data or outside calls must change or must not happen when relevant.
  - [x] Record the first failing run and the later passing run for that test ID.
- [x] Make the agent check that no test situations were missed.
  - [x] List the normal valid situations.
  - [x] List each separate invalid situation required by the real rules.
  - [x] Check missing, `null`, empty, spaces-only, wrong type, bad format, unsupported value, duplicate,
        and conflicting value when each one can reach the code and has a different expected result.
  - [x] When a minimum or maximum exists, check the exact limit and the closest value outside it.
  - [x] Check each separate choice, state change, error, permission decision, retry, repeated request,
        and compatibility rule when it applies.
  - [x] Test values together when one value changes how another value should behave.
  - [x] Do not require every possible mix of values when the values do not affect one another.
- [x] Make the agent handle missing product rules safely.
  - [x] First search the request, schemas, validators, types, existing tests, code, and documentation.
  - [x] If the expected result is still unknown, write it as an open question and ask the user.
  - [x] Do not invent a rule and do not silently leave the situation out.
- [x] Add a final planning check before coding starts.
  - [x] Connect every smallest task item and every known rule to one or more test IDs.
  - [x] For every common test area, list its test IDs or explain in plain English why it does not
        apply.
  - [x] Do not start coding while a task item is still broad, a test description is still vague, a
        known rule has no test, or an expected result is unknown.

## Exact Cases

The original task map and `TEST-SKILL-019` through `098` records are in the linked
[case catalog](./2026-08-12-detailed-test-planning-case-catalog.md). The 2026-08-13 corrections use the
[final review case record](./2026-08-12-detailed-test-planning-final-review-cases.md).

## Work Steps

- [x] Add automated checks for the new wording before changing the skill files.
  - [x] Check task splitting, detailed test fields, missed-case review, unknown-rule handling, and
        related-value testing.
  - [x] Run the new check and record that it fails because the guidance is not present yet.
- [x] Update `skills/test-first-workflow`.
  - [x] Add the task-splitting rules to `SKILL.md`.
  - [x] Add the detailed method and a simple example to `references/plan-to-test.md`.
  - [x] Add small-task, exact-test, coverage, and open-question sections to the checklist template.
- [x] Update `skills/testing-policy`.
  - [x] Require one exact situation per test case.
  - [x] Allow table-based tests only when every row stays clear and trackable.
- [x] Update `skills/checklist-tracking`.
  - [x] Make broad parent items stay incomplete until all exact child items are complete.
  - [x] Make broad test headings stay incomplete until all exact test cases are listed and complete.
- [x] Add a note at the bottom of the original workflow checklist linking to this correction.
- [x] Copy the changed main skills to all supported skill folders with `pnpm skills:sync`.

## Review Corrections

- [x] Replace the one broad automated policy test with separate named tests.
  - [x] Give each policy test its own `TEST-SKILL-*` ID.
  - [x] Check every required test-case field.
  - [x] Check every missed-case area separately instead of relying on one broad phrase check.
  - [x] Keep the portable-skill tool tests in `scripts/skills.test.mjs`.
  - [x] Move the detailed policy checks to `scripts/test-planning-policy.test.mjs` so each test file
        remains small and focused.
  - [x] Update `pnpm skills:test` to run every focused policy test file.
- [x] Separate planning from recorded test results.
  - [x] During planning, write the command to run and the result expected before the code change.
  - [x] After the checklist exists, record the real failing result and later passing result.
  - [x] Never ask the agent to invent a result before running a command.
- [x] Require plain English throughout the plan and checklist.
  - [x] Use plain English for small tasks, test cases, expected results, side effects, reasons, and
        questions.
  - [x] Explain unavoidable technical terms the first time they are used.
- [x] Stop when trusted sources disagree about expected behavior.
  - [x] Record which sources disagree.
  - [x] Ask the user unless the repository gives a clear rule about which source wins.
- [x] Clarify the test action field.
  - [x] Write every interaction step needed to perform the test.
  - [x] Name one main behavior or trigger being checked instead of forcing a real user flow into one
        physical action.
- [x] Rewrite this checklist's policy cases so they follow the detailed case format they require.
  - [x] Split broad coverage checks into smaller cases that can fail separately.
  - [x] Add the small task, source, test file, exact files being checked, expected result, allowed
        effects, forbidden effects, planned command, and observed results.
- [x] Record a final passing formatter run after the last checklist edit.

## Second Review Corrections

- [x] Give every missed-case area its own test ID.
  - [x] Split missing, `null`, empty, spaces-only, wrong-type, bad-format, unsupported, duplicate, and
        conflicting values.
  - [x] Split each exact limit and nearest outside value.
  - [x] Split choices, data amounts, state changes, errors, access decisions, required and forbidden
        effects, repeated work, compatibility, and user-interface states.
  - [x] Put these checks in `scripts/test-case-coverage-policy.test.mjs` so no test file exceeds 300
        lines.
- [x] Check each required canonical file directly instead of searching joined file content.
  - [x] Load `skills/checklist-tracking/references/checklist-policy.md` in the semantic tests.
  - [x] Require `Test place` in that reference as well as the other exact case fields.
- [x] Correct the active checklist's test records.
  - [x] Do not claim the first broad failure proved cases that were not run separately.
  - [x] Record unobserved pre-change runs honestly.
  - [x] Give each case separate required fields rather than a combined "command and results" line.
- [x] Replace the remaining old "one action" wording with interaction steps and one main behavior.

## Final Review Corrections

- [x] Check planned-versus-observed and conflicting-source rules in each policy file separately.
- [x] Protect every required case field in every policy file that defines the case format.
  - [x] Add `Test place` to `testing-policy`.
  - [x] Check ordinary expected result, pre-change expected result, required changes, and forbidden
        work as separate fields.
- [x] Make every missed-case check read the exact bullet from the missed-case section.
  - [x] Do not let words elsewhere in the guide satisfy the check.
  - [x] Do not let a retry operation satisfy a retry-view check or general public behavior satisfy the
        compatibility check.
- [x] Remove the stale note that calls one stopped-at-first-failure run the failure for eight cases.

## Closure Review Corrections

- [x] Make every per-file contract check read only the exact contract section.
  - [x] Require every case field inside that section, not elsewhere in the file.
  - [x] Require the full timing rule inside that section: plan first, record real results only after
        commands run, and never invent results.
  - [x] Require the full conflict rule inside that section: check which rule wins, ask the user when it
        is still unclear, and block the affected work.
- [x] Give `TEST-SKILL-081` through `098` one result row per ID.
  - [x] Keep the first observed result separate from the passing rerun.
  - [x] Name the exact file and rule checked by each ID.
- [x] Remove retired test IDs from active validation notes.
- [x] Record and fix the final checklist formatting failure.

## 2026-08-13 Review Corrections

Exact case definitions and results are tracked in the
[final review case record](./2026-08-12-detailed-test-planning-final-review-cases.md).

- [x] Report each independently failing policy-file rule under its own test ID.
- [x] Require unknown expected behavior to block affected work in every exact-case policy section.
- [x] Make `pnpm skills:test` discover every `scripts/*.test.mjs` file instead of maintaining a manual
      filename list.
- [x] Define a no-write path for tasks that explicitly request only review, explanation, or research.
- [x] Replace the incomplete quantity example with a linked example that follows its own exact-case
      contract and maps every smallest example task.
- [x] Split this active record so every changed file remains under 300 lines.
- [x] Use automatic skill-test discovery across supported Node versions.
- [x] Require the testing policy to preserve every interaction step while naming one main behavior.
- [x] Prove the discovery runner executes every matching test file, not only a subset.

## Final Checks

- [x] Run the new focused automated check and record the first expected failure.
- [x] Run the focused check again after the changes and record the pass.
- [x] Run `pnpm skills:sync`.
- [x] Run `pnpm skills:test`.
- [x] Run `pnpm skills:check`.
- [x] Run Prettier on the changed files and check formatting again.
- [x] Run `git diff --check`.
- [/] Run `just check`. Lint and typecheck passed, but the repository-wide format check is blocked by
  an unrelated active checklist.
- [x] Review all changes and confirm unrelated work was not changed.
- [x] Review this checklist and do not mark a parent complete while one of its smaller items is open.

## Test Results

The complete observed-result log is in the linked
[validation history](./2026-08-12-detailed-test-planning-validation-history.md).

## Risks

- [x] Make sure detailed planning does not cause the agent to invent rules that were never requested.
- [x] Make sure the agent does not create a huge list of every possible mix of unrelated values.
- [x] Make sure the example explains the method without becoming a fixed rule for every product.
