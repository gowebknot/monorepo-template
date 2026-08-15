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
  `scripts/test-policy-file-contracts.test.mjs`, `package.json`, all copied skill folders, and
  `.skills-sync.json`
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

## Small Task and Test Map

| Small task or rule                                   | Test IDs                              |
| ---------------------------------------------------- | ------------------------------------- |
| Reject broad headings and split broad work           | TEST-SKILL-019, TEST-SKILL-020        |
| Preserve real user flows                             | TEST-SKILL-034                        |
| Separate normal and rejected values                  | TEST-SKILL-022                        |
| Map every small task and rule                        | TEST-SKILL-023                        |
| Ask about missing rules                              | TEST-SKILL-024                        |
| Limit combined-value cases and keep table rows clear | TEST-SKILL-025, TEST-SKILL-026        |
| Keep all copied skill folders the same               | TEST-SKILL-027                        |
| Require plain English                                | TEST-SKILL-032                        |
| Review each easily missed situation separately       | TEST-SKILL-035 through TEST-SKILL-080 |
| Keep every case field in every policy file           | TEST-SKILL-081 through TEST-SKILL-086 |
| Keep planned and observed results separate per file  | TEST-SKILL-087 through TEST-SKILL-092 |
| Block conflicting rules in every policy file         | TEST-SKILL-093 through TEST-SKILL-098 |

## Exact Checks For This Change

The following fields apply to every row in the first table:

- Source: User request, repository rules, or a review correction named by the row.
- Test place: `scripts/test-planning-policy.test.mjs`.
- Starting state: The canonical workflow, guide, template, testing policy, checklist skill, and
  checklist reference are readable.
- Interaction steps: Read each named file and check the exact rule.
- Must change: Nothing; these are read-only text checks.
- Must not happen: No file writes, network calls, or product code runs.
- Planned command: `node --test scripts/test-planning-policy.test.mjs`.
- Expected result before the code change: The named case fails when its rule is absent.

| ID             | Small task               | Exact input or fixture                     | Main behavior                      | Expected result                                         | First observed run                                | Passing rerun                        |
| -------------- | ------------------------ | ------------------------------------------ | ---------------------------------- | ------------------------------------------------------- | ------------------------------------------------- | ------------------------------------ |
| TEST-SKILL-019 | Reject broad notes       | "add focused tests"                        | Check whether the note is complete | It is a heading only; exact cases are required          | Passed when first run separately                  | Passed in the final policy suite     |
| TEST-SKILL-020 | Split broad work         | A task with parts that can fail separately | Check when splitting stops         | Splitting continues at any depth                        | Failed because its first text check was too exact | Passed after the check was corrected |
| TEST-SKILL-022 | Separate rejected values | Normal and separately rejected values      | Check invalid-case detail          | One broad invalid-input case is not enough              | Passed when first run separately                  | Passed in the final policy suite     |
| TEST-SKILL-023 | Map work to tests        | Every small task and known rule            | Check the coverage map             | Every row maps to test IDs                              | Failed because its first text check was too exact | Passed after the check was corrected |
| TEST-SKILL-024 | Ask about missing rules  | Expected behavior with no trusted rule     | Check unanswered behavior          | Ask the user and block affected work                    | Passed when first run separately                  | Passed in the final policy suite     |
| TEST-SKILL-025 | Limit combined cases     | Related and unrelated values               | Check combination rules            | Related values combine; unrelated mixes are avoided     | Passed when first run separately                  | Passed in the final policy suite     |
| TEST-SKILL-026 | Keep rows trackable      | Rows in a table-based test                 | Check each row                     | Every row keeps its ID, input, and result               | Failed when one reference used different wording  | Passed after the wording was aligned |
| TEST-SKILL-032 | Require simple wording   | Task and test wording                      | Check writing rules                | Plain English is used and technical terms are explained | Failed before the rule was added                  | Passed after the rule was added      |
| TEST-SKILL-034 | Preserve real user flows | A flow with several interaction steps      | Check one focused behavior         | List all steps but name one main behavior               | Failed before the fields were added               | Passed after the fields were added   |

### Skill Copy Check

- [x] TEST-SKILL-027: All four skill folders contain the same files.
  - Small task: Keep copied skills synchronized.
  - Source: Repository skill rules.
  - Test place: `pnpm skills:check`.
  - Starting state: Canonical edits are complete.
  - Exact input or fixture: All 16 canonical skills and their three copied roots.
  - Interaction steps: Run `pnpm skills:sync`, then `pnpm skills:check`.
  - Main behavior: Validate identical skill copies.
  - Expected result: All 16 skills validate with no different copies.
  - Must change: Only intended copied skill files and saved hashes during synchronization.
  - Must not happen: No unrelated file changes.
  - Planned command: `pnpm skills:sync && pnpm skills:check`.
  - Expected result before the code change: The check fails until changed skills are synchronized.
  - First observed run: Both commands passed after the first synchronization.
  - Passing rerun: Both commands passed after the final synchronization.

### Missed-Case Rows

The following shared fields are part of every row from `TEST-SKILL-035` through `080`:

- Small task: Review the exact situation named in the row.
- Source: User request and second review correction.
- Test place: `scripts/test-case-coverage-policy.test.mjs`.
- Starting state: The case-design guide and checklist template are readable.
- Exact input or fixture: The exact situation named in the row.
- Interaction steps: Read both files and look for that exact situation.
- Main behavior: Require a separate checklist prompt for the named situation.
- Expected result: Both files name the situation; the template requires test IDs or a reason.
- Must change: Nothing; these are read-only text checks.
- Must not happen: No file writes, network calls, or product code runs.
- Planned command: `node --test scripts/test-case-coverage-policy.test.mjs`.
- Expected result before the code change: A row fails if either file omits its situation.
- Passing rerun: Every row passed in the final 46-case coverage run.

| ID             | Exact situation                 | First observed run                                       |
| -------------- | ------------------------------- | -------------------------------------------------------- |
| TEST-SKILL-035 | Missing value                   | Passed                                                   |
| TEST-SKILL-036 | Explicit `null` value           | Passed                                                   |
| TEST-SKILL-037 | Empty value                     | Passed                                                   |
| TEST-SKILL-038 | Spaces-only text                | Passed                                                   |
| TEST-SKILL-039 | Wrong value type                | Passed                                                   |
| TEST-SKILL-040 | Bad format                      | Passed                                                   |
| TEST-SKILL-041 | Unsupported value               | Passed                                                   |
| TEST-SKILL-042 | Duplicate value                 | Passed                                                   |
| TEST-SKILL-043 | Conflicting values              | Passed                                                   |
| TEST-SKILL-044 | Exact minimum                   | Passed                                                   |
| TEST-SKILL-045 | Closest value below the minimum | Passed                                                   |
| TEST-SKILL-046 | Exact maximum                   | Passed                                                   |
| TEST-SKILL-047 | Closest value above the maximum | Passed                                                   |
| TEST-SKILL-048 | Each choice                     | Passed                                                   |
| TEST-SKILL-049 | Each branch                     | Passed                                                   |
| TEST-SKILL-050 | Empty data                      | Failed because the template omitted this prompt          |
| TEST-SKILL-051 | One item                        | Passed                                                   |
| TEST-SKILL-052 | Many items                      | Failed because the template omitted this prompt          |
| TEST-SKILL-053 | Allowed state change            | Failed because the template grouped both state changes   |
| TEST-SKILL-054 | Blocked state change            | Passed                                                   |
| TEST-SKILL-055 | Not found                       | Passed                                                   |
| TEST-SKILL-056 | Dependency failure              | Passed                                                   |
| TEST-SKILL-057 | Timeout                         | Passed                                                   |
| TEST-SKILL-058 | Unexpected error                | Passed                                                   |
| TEST-SKILL-059 | Signed-out access               | Passed                                                   |
| TEST-SKILL-060 | Wrong-permission access         | Passed                                                   |
| TEST-SKILL-061 | Wrong-owner access              | Passed                                                   |
| TEST-SKILL-062 | Wrong-account access            | Passed                                                   |
| TEST-SKILL-063 | Required data changes           | Failed because the template grouped all required effects |
| TEST-SKILL-064 | Required outside calls          | Passed                                                   |
| TEST-SKILL-065 | Required messages               | Passed                                                   |
| TEST-SKILL-066 | Required events                 | Passed                                                   |
| TEST-SKILL-067 | Required file changes           | Passed                                                   |
| TEST-SKILL-068 | Required navigation             | Passed                                                   |
| TEST-SKILL-069 | Forbidden work after rejection  | Passed                                                   |
| TEST-SKILL-070 | Repeated request                | Passed                                                   |
| TEST-SKILL-071 | Retry                           | Passed                                                   |
| TEST-SKILL-072 | Duplicate delivery              | Passed                                                   |
| TEST-SKILL-073 | Existing callers                | Passed                                                   |
| TEST-SKILL-074 | Stored data                     | Passed                                                   |
| TEST-SKILL-075 | Existing public behavior        | Passed                                                   |
| TEST-SKILL-076 | Loading view                    | Passed                                                   |
| TEST-SKILL-077 | Empty view                      | Passed                                                   |
| TEST-SKILL-078 | Success view                    | Passed                                                   |
| TEST-SKILL-079 | Error view                      | Passed                                                   |
| TEST-SKILL-080 | Retry view                      | Passed                                                   |

All rows above passed in the final rerun. The four rows with an earlier failure passed after the
template gained separate prompts for their exact situations.

### Per-File Contract Rows

These shared fields apply to `TEST-SKILL-081` through `098`:

- Small task: Protect one rule in one exact policy file.
- Source: Final review correction.
- Test place: `scripts/test-policy-file-contracts.test.mjs`.
- Starting state: The named canonical policy file is readable.
- Exact input or fixture: The exact field list, result-timing rule, or conflict rule named below.
- Interaction steps: Read only the named file and check the named rule.
- Main behavior: Prevent one policy file from relying on another for required instructions.
- Expected result: The named file contains the complete rule.
- Must change: Nothing; these are read-only text checks.
- Must not happen: No file writes, network calls, or product code runs.
- Planned command: `node --test scripts/test-policy-file-contracts.test.mjs`.
- Expected result before the code change: A case fails when its named file omits the rule.
- Passing rerun: All 18 cases passed after every policy file received the complete contract.

| ID             | Exact policy file   | Exact rule                                      | First observed run                        | Passing rerun                      |
| -------------- | ------------------- | ----------------------------------------------- | ----------------------------------------- | ---------------------------------- |
| TEST-SKILL-081 | Workflow            | Every exact case field                          | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-082 | Guide               | Every exact case field                          | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-083 | Template            | Every exact case field                          | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-084 | Testing policy      | Every exact case field                          | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-085 | Checklist skill     | Every exact case field                          | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-086 | Checklist reference | Every exact case field                          | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-087 | Workflow            | Planned and observed results stay separate      | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-088 | Guide               | Planned and observed results stay separate      | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-089 | Template            | Planned and observed results stay separate      | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-090 | Testing policy      | Planned and observed results stay separate      | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-091 | Checklist skill     | Planned and observed results stay separate      | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-092 | Checklist reference | Planned and observed results stay separate      | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-093 | Workflow            | Conflicting sources ask the user and block work | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-094 | Guide               | Conflicting sources ask the user and block work | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-095 | Template            | Conflicting sources ask the user and block work | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-096 | Testing policy      | Conflicting sources ask the user and block work | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-097 | Checklist skill     | Conflicting sources ask the user and block work | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-098 | Checklist reference | Conflicting sources ask the user and block work | Failed: exact contract section was absent | Passed after the section was added |

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
- [/] Review all changes and confirm unrelated work was not changed. The first review found corrections
  listed above.
- [/] Review this checklist and do not mark a parent complete while one of its smaller items is open.
  Review corrections remain open.

## Test Results

Record every failed check here before fixing it. Record the later passing run before marking the
related test complete.

- 2026-08-12: The first broad skill test failed at its first assertion because the permanent skill did
  not yet contain "Split the Work Until Each Part Is Small." Later assertions did not run, so no
  starting result was claimed for them. Separate named tests were added afterward.
- 2026-08-12: After adding the permanent instructions, the focused check found the new stop rule but
  failed because Markdown wrapped "tests or implementation" onto two lines. The check will allow normal
  spaces or line breaks without weakening the wording it requires.
- 2026-08-12: The next focused run reached the detailed guide and failed only because the check used
  lowercase letters for the heading "One Exact Test Situation." The check will match the real heading.
- 2026-08-12: The then-current focused skill check passed after the wording and check corrections. It
  was later replaced by separately named policy checks.
- 2026-08-12: `pnpm skills:sync` copied the canonical changes to all supported skill folders and
  reported 16 synchronized skills. `TEST-SKILL-027` remains partial until `pnpm skills:check` confirms
  the copies are identical.
- 2026-08-12: `pnpm skills:test` passed all 5 tests, including the new permanent guidance check.
- 2026-08-12: `pnpm skills:check` validated all 16 skills and completed `TEST-SKILL-027`.
- 2026-08-12: `git diff --check` passed with no whitespace errors.
- 2026-08-12: The first targeted Prettier check failed for the detailed guide, checklist template, and
  skill test file. This failure was recorded before formatting those files.
- 2026-08-12: Prettier formatted the three reported files. The rerun passed for all changed canonical
  skill files, the skill test, and both checklist files.
- 2026-08-12: After formatting and resynchronizing, `pnpm skills:test` passed 5/5,
  `pnpm skills:check` validated all 16 skills, and `git diff --check` passed again.
- 2026-08-12: `just check` passed lint and typecheck, then stopped at `pnpm format:check` because the
  unrelated active file `docs/checklists/2026-08-12-hybrid-native-reference-profiles.md` is not
  formatted. This task did not create or change that file, so it was left untouched. The checks after
  the format step will be run separately.
- 2026-08-12: The separately run template tests passed 86/86: 1 core test and 85 launcher tests.
- 2026-08-12: The next targeted Prettier check found formatting drift in this active checklist after
  new result notes were added. The failure was recorded before formatting the checklist again.
- 2026-08-12: A final policy review found that the one automated policy test was too broad, planning
  and observed results were mixed together, plain English was not a direct rule, conflicting sources
  did not clearly block work, the "one action" wording could split normal user flows incorrectly, and
  this checklist's own cases did not yet use the full case format. These corrections were added above
  before changing the implementation again.
- 2026-08-12: The first review-specific run failed because the permanent files were missing rules for
  planned versus real results, plain English, conflicting sources, and multi-step interactions.
- 2026-08-12: After adding those rules, the plain-English check passed. The user-flow check found the
  required "Main behavior" field but failed because its text check expected a lowercase `m`. The check
  was changed to ignore capitalization while still requiring the field in every policy file.
- 2026-08-12: The next `TEST-SKILL-034` run reached `testing-policy` and found that it said "every
  Interaction step" rather than using the shared field name "Interaction steps." The policy wording
  will be aligned before rerunning the case.
- 2026-08-12: The then-current policy suite passed 11 cases. Four checks failed because they required
  one exact sentence even though the required rules and fields were present with equivalent wording.
  The checks were changed to verify meaning without requiring one fixed sentence.
- 2026-08-12: After making those four checks meaning-based, all 15 named policy cases passed.
- 2026-08-12: The policy checks were moved to a separate 238-line file; the portable-skill test file is
  168 lines. The targeted Prettier check then found formatting changes needed in the new policy test
  file and this checklist. This failure was recorded before formatting both files.
- 2026-08-12: The first separate run of `TEST-SKILL-035` through `080` passed 42 cases and failed four:
  `050` empty data, `052` many items, `053` an allowed state change, and `063` required data changes.
  The checklist template grouped or omitted those exact prompts. The same review run found that
  the field-contract check lacked `Test place` in checklist policy and the table-row check lacked the
  shared "table-based test" wording in its reference. These failures were recorded before correction.
- 2026-08-12: After adding separate checklist prompts and aligning the policy fields, all 46 detailed
  coverage cases and the then-current main policy cases passed. Earlier broad coverage checks were
  replaced by the separate `TEST-SKILL-035` through `080` cases.
- 2026-08-12: The test files are 168, 220, 277, and 95 lines, so each remains below 300 lines. The next
  targeted Prettier check found formatting changes needed in the two policy test files and this
  checklist. The failure was recorded before formatting them.
- 2026-08-12: The first per-file contract run found missing complete field wording and conflict-result
  wording in the checklist policies. It also exposed a hidden control character accidentally added to
  the new test helper. The helper will be replaced cleanly, then each reported policy file will be
  corrected and rerun.
- 2026-08-12: The first section-only coverage run passed 44/46 and failed the two state-change cases
  because the bullet parser treated the word "and" as part of the bullet name. The test data will use
  the actual shared bullet name while still keeping separate IDs and assertions for allowed and blocked
  changes.
- 2026-08-12: After adding the complete contract to each policy file, the per-file tests found only
  Markdown matching problems: bold field labels and normal line wrapping hid exact text from the test.
  The test will remove Markdown bold and extra whitespace before checking, while still requiring every
  field and rule separately in every file.
- 2026-08-12: All 18 per-file contract checks and all 46 section-only missed-case checks passed. Two
  older policy checks then failed only on a Markdown line break and capitalization. Those older checks
  will use formatting-safe matching without weakening the newer per-file or section-only checks.
- 2026-08-12: The final synchronized skill suite passed 77/77. It includes four skill-tool tests, nine
  main planning-policy tests, 46 separate missed-situation tests, and 18 per-file contract tests.
  `pnpm skills:check` also validated all 16 portable skills.
- 2026-08-12: The closure review found that per-file checks still searched whole files, the 18
  per-file results were grouped, and active notes still named retired aggregate IDs. The targeted
  Prettier check also found formatting drift in this checklist. These corrections were recorded above
  before changing the tests and checklist again.

## Risks

- [x] Make sure detailed planning does not cause the agent to invent rules that were never requested.
- [x] Make sure the agent does not create a huge list of every possible mix of unrelated values.
- [x] Make sure the example explains the method without becoming a fixed rule for every product.
