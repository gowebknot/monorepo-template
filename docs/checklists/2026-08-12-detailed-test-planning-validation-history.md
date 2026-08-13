# Detailed Test Planning Validation History

- Parent checklist: [Detailed Test Planning](./2026-08-12-detailed-test-planning.md)
- Purpose: Preserve observed validation history while keeping each active checklist file focused and
  below 300 lines.

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
- 2026-08-13: After the closure corrections, scoped Prettier passed, `pnpm skills:test` passed 77/77,
  `pnpm skills:check` validated all 16 skills, scoped ESLint passed, and `git diff --check` passed.
- 2026-08-13: The repository-wide `pnpm format:check` still failed only for ten unrelated files in the
  active native-scaffold task. None of those files were changed by this task.
- 2026-08-13: A final read-only review found that several policy checks still grouped independently
  failing files or rules, undefined behavior was not explicitly blocked in every policy, test-file
  registration was manual, read-only tasks had no compliant path, the guide example omitted its own
  required fields, and this checklist exceeded 300 lines. The exact correction cases were added to the
  linked final review case record before implementation.
- 2026-08-13: The expanded wildcard suite passed 138/138, all 16 skills validated, scoped ESLint and
  `git diff --check` passed, and every checklist record was below 300 lines. The final line-count check
  found `scripts/test-planning-policy.test.mjs` at 302 lines after Prettier expanded its case data. This
  failure was recorded before reducing that test file.
- 2026-08-13: After removing three unnecessary blank lines, the focused planning suite passed 45/45,
  scoped ESLint passed, and the formatted planning-policy test was 299 lines. The complete line-count
  rerun confirmed every changed policy, test, example, and checklist file is below 300 lines.
- 2026-08-13: The final portability review found that the quoted `scripts/*.test.mjs` command fails on
  supported Node 20 because Node 20 does not expand that glob. It also found that `TEST-SKILL-136`
  protected field labels but not the testing policy's semantic instruction to preserve every
  interaction step while naming one main behavior. These failures were recorded before correction.
- 2026-08-13: The first local Node 20 validation command used `pnpm dlx node@20 node --test scripts`.
  The runner installed Node 20.20.2, then failed because the extra `node` argument was treated as a
  repository entry file. The corrected command is `pnpm dlx node@20 --test scripts`.
- 2026-08-13: After switching to `node --test scripts` and adding the semantic testing-policy rule,
  the focused Node 24 run passed 52/52. The corrected `pnpm dlx node@20 --test scripts` run used Node
  20.20.2, discovered every skill test file, and passed 140/140.
- 2026-08-13: The final root `pnpm skills:test` rerun then failed on Node 24 because Node 24 treated the
  explicit `scripts` directory as a missing module rather than discovering its test files. Scoped
  ESLint also reported an unnecessary escaped `[` in `scripts/skills.test.mjs`, and Prettier expanded
  `scripts/test-planning-policy.test.mjs` to 305 lines. These failures were recorded before replacing
  directory discovery, fixing the escape, and removing the duplicate semantic test case.
- 2026-08-13: The repository-local test enumerator sorted every `scripts/*.test.mjs` file and passed
  139/139 with Node 24.19.0 and Node 20.20.2. Scoped ESLint also passed after the discovery assertion
  was corrected.
- 2026-08-13: Final scoped validation passed: `pnpm skills:test` passed 139/139,
  `pnpm skills:check` validated all 16 skills, scoped Prettier and ESLint passed,
  `git diff --check` passed, and every changed file remained below 300 lines. The only remaining gate
  failure is the repository-wide formatter on ten unrelated native-scaffold files.
- 2026-08-13: The final test-strength review found that the runner's source-fragment assertions still
  passed if discovery was truncated with `.slice(0, 1)`. It also found that the affected-path list
  omitted `scripts/run-skills-tests.mjs`. The path was added and an exact controlled execution case was
  planned before strengthening the test.
- 2026-08-13: The first controlled runner test succeeded at the process level but failed its output
  assertion because nested tests use inherited output that is not returned in the outer `spawnSync`
  result. The controlled test will use temporary execution-marker files instead of output capture.
- 2026-08-13: Both marker-file reruns passed the nested runner but failed to find markers at the outer
  temporary root because a relative marker path depended on the nested test process's working
  directory. The fixtures will write explicit file URLs beside their own modules and the test will
  assert those exact paths.
- 2026-08-13: Explicit marker URLs still were not written because the controlled runner inherited
  Node's internal `NODE_TEST_CONTEXT` from the outer `node:test` worker. The fixture child will remove
  that one test-harness variable so it starts in the same environment shape as `pnpm skills:test`.
- 2026-08-13: After removing only `NODE_TEST_CONTEXT` from the controlled child environment,
  `TEST-SKILL-164` passed with Node 24.19.0 and Node 20.20.2. Both matching fixture tests wrote their
  execution markers, the non-test module did not run, and each focused command passed 7/7.
- 2026-08-13: The final full suite passed 140/140 on Node 24.19.0 and Node 20.20.2. All 16 skills
  validated, scoped ESLint and Prettier passed, `git diff --check` passed, and every changed file was at
  most 299 lines.
