# Detailed Test Planning Final Review Cases

- Parent checklist: [Detailed Test Planning](./2026-08-12-detailed-test-planning.md)
- Review date: 2026-08-13
- Purpose: Exact cases added after the final read-only review found independently failing rules that
  were still grouped and several unprotected workflow requirements.
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Shared Case Fields

The following fields are part of every row below unless the row overrides them:

- Small task: Protect the one policy file and rule named by the row.
- Source: The 2026-08-13 final review and the parent checklist's requirements.
- Starting state: The named file is readable from the repository root.
- Exact input or fixture: The named file and exact rule in the row.
- Interaction steps: Run the planned command, locate the row's test ID, and inspect its independent
  result.
- Main behavior: Check only the named file and one cohesive rule.
- Expected result: The row receives its own visible passing or failing result without being hidden by
  a different policy file or independently failing rule.
- Must change: Only the named tests, policies, example, package command, synchronized skill copies, or
  checklist records required by the row.
- Must not happen: No product code, external calls, unrelated worktree files, commits, or releases.
- First observed run: The final review found the gap named by the row. The existing focused commands
  were then run on 2026-08-13: the 9 planning tests, 18 per-file tests, and 4 skill-tool tests all
  passed, confirming that the new rows and failure conditions were absent rather than already failing.
  After adding the new tests, `TEST-SKILL-024`, `116` through `121`, `137` through `144`, and `146`
  through `160` failed for the planned missing rules. `TEST-SKILL-138` through `141` confirmed the four
  missing read-only paths independently; all other newly separated existing policy rows passed.
- Passing rerun: The focused planning suite passed 45/45, per-file contracts passed 24/24, skill-tool
  tests passed 5/5, and example-policy tests passed 18/18 on 2026-08-13. The wildcard suite passed
  138/138. The final formatted line-count command first found
  `scripts/test-planning-policy.test.mjs` at 302 lines, then passed after that file was reduced to 299
  lines. Every changed policy, test, example, and checklist file is below 300 lines.

## Independent Policy Rows

For every row in this table:

- Test place: `scripts/test-planning-policy.test.mjs`.
- Planned command: `node --test scripts/test-planning-policy.test.mjs`.
- Expected result before the code change: The current suite passes, but the row is not reported
  independently; the final review therefore found that a different failure could hide this result.

| Status | ID             | Exact policy file   | Exact rule checked                                      |
| ------ | -------------- | ------------------- | ------------------------------------------------------- |
| [x]    | TEST-SKILL-019 | Workflow            | Broad test notes are headings, not cases                |
| [x]    | TEST-SKILL-099 | Guide               | Broad test notes are headings, not cases                |
| [x]    | TEST-SKILL-100 | Template            | Broad test notes are headings, not cases                |
| [x]    | TEST-SKILL-101 | Checklist skill     | Broad test notes are headings, not cases                |
| [x]    | TEST-SKILL-102 | Checklist reference | Broad test notes are headings, not cases                |
| [x]    | TEST-SKILL-020 | Workflow            | Broad work is recursively decomposed                    |
| [x]    | TEST-SKILL-103 | Workflow            | Checklist nesting can continue to any depth             |
| [x]    | TEST-SKILL-104 | Workflow            | Independently failing work is split                     |
| [x]    | TEST-SKILL-105 | Guide               | Splitting stops at one independently testable result    |
| [x]    | TEST-SKILL-106 | Template            | Checklist nesting can continue to any depth             |
| [x]    | TEST-SKILL-107 | Checklist reference | Independently failing work is split                     |
| [x]    | TEST-SKILL-108 | Workflow            | Broad work blocks tests and implementation              |
| [x]    | TEST-SKILL-022 | Workflow            | Valid and separately rejected values are listed         |
| [x]    | TEST-SKILL-109 | Guide               | Valid and separately rejected values are listed         |
| [x]    | TEST-SKILL-110 | Template            | Valid and separately rejected values are listed         |
| [x]    | TEST-SKILL-111 | Testing policy      | Separate rejected values are not hidden in a broad case |
| [x]    | TEST-SKILL-023 | Workflow            | Small tasks and rules map to test IDs                   |
| [x]    | TEST-SKILL-112 | Guide               | Small tasks and rules map to test IDs                   |
| [x]    | TEST-SKILL-113 | Template            | Small tasks and rules map to test IDs                   |
| [x]    | TEST-SKILL-114 | Checklist skill     | Small tasks and rules map to test IDs                   |
| [x]    | TEST-SKILL-115 | Checklist reference | Small tasks and rules map to test IDs                   |
| [x]    | TEST-SKILL-025 | Workflow            | Only behaviorally related values are combined           |
| [x]    | TEST-SKILL-122 | Guide               | Only behaviorally related values are combined           |
| [x]    | TEST-SKILL-123 | Template            | Related-value review remains explicit                   |
| [x]    | TEST-SKILL-124 | Testing policy      | Unrelated value combinations are excluded               |
| [x]    | TEST-SKILL-026 | Workflow            | Table rows keep IDs, inputs, and results                |
| [x]    | TEST-SKILL-125 | Guide               | Table rows keep IDs, inputs, and results                |
| [x]    | TEST-SKILL-126 | Testing policy      | Table rows keep IDs, inputs, and results                |
| [x]    | TEST-SKILL-127 | Checklist skill     | Table rows keep IDs, inputs, and results                |
| [x]    | TEST-SKILL-128 | Checklist reference | Table rows keep IDs, inputs, and results                |
| [x]    | TEST-SKILL-032 | Workflow            | Plain English and explained terms are required          |
| [x]    | TEST-SKILL-129 | Guide               | Plain English and explained terms are required          |
| [x]    | TEST-SKILL-130 | Template            | Plain English and explained terms are required          |
| [x]    | TEST-SKILL-131 | Testing policy      | Plain English and explained terms are required          |
| [x]    | TEST-SKILL-132 | Checklist skill     | Plain English and explained terms are required          |
| [x]    | TEST-SKILL-133 | Checklist reference | Plain English and explained terms are required          |
| [x]    | TEST-SKILL-034 | Workflow            | Interaction steps preserve one main behavior            |
| [x]    | TEST-SKILL-134 | Guide               | Interaction steps preserve one main behavior            |
| [x]    | TEST-SKILL-135 | Template            | Interaction steps preserve one main behavior            |
| [x]    | TEST-SKILL-136 | Testing policy      | Interaction steps preserve one main behavior            |

## Missing-Rule Rows

For `TEST-SKILL-116` through `121`:

- Test place: `scripts/test-policy-file-contracts.test.mjs`.
- Planned command: `node --test scripts/test-policy-file-contracts.test.mjs`.
- Expected result before the code change: The named exact-case section does not fully require searching
  for an unknown rule, asking the user, and blocking the affected work, so its new row fails.

| Status | ID             | Exact policy file   | Exact rule checked                      |
| ------ | -------------- | ------------------- | --------------------------------------- |
| [x]    | TEST-SKILL-116 | Workflow            | Undefined behavior blocks affected work |
| [x]    | TEST-SKILL-117 | Guide               | Undefined behavior blocks affected work |
| [x]    | TEST-SKILL-118 | Template            | Undefined behavior blocks affected work |
| [x]    | TEST-SKILL-119 | Testing policy      | Undefined behavior blocks affected work |
| [x]    | TEST-SKILL-120 | Checklist skill     | Undefined behavior blocks affected work |
| [x]    | TEST-SKILL-121 | Checklist reference | Undefined behavior blocks affected work |

`TEST-SKILL-024` remains the high-level workflow case for searching trusted sources and asking rather
than guessing. Its expected result is strengthened to require an explicit block while the answer is
unknown.

## Workflow Boundary Rows

| Status | ID             | Test place                                      | Exact input or fixture                         | Main behavior                         | Expected result before the code change                              | Planned command                                             |
| ------ | -------------- | ----------------------------------------------- | ---------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------- |
| [x]    | TEST-SKILL-137 | `scripts/skills.test.mjs`                       | Root `skills:test` package script              | Discover every skill test file        | The explicit filename list can silently omit a policy suite         | `node --test scripts/skills.test.mjs`                       |
| [x]    | TEST-SKILL-138 | `scripts/test-planning-policy.test.mjs`         | Workflow read-only instructions                | Preserve an explicitly read-only task | The workflow unconditionally requires a repository checklist        | `node --test scripts/test-planning-policy.test.mjs`         |
| [x]    | TEST-SKILL-139 | `scripts/test-planning-policy.test.mjs`         | Guide read-only instructions                   | Preserve an explicitly read-only task | The guide unconditionally requires a repository checklist           | `node --test scripts/test-planning-policy.test.mjs`         |
| [x]    | TEST-SKILL-140 | `scripts/test-planning-policy.test.mjs`         | Checklist-skill read-only instructions         | Preserve an explicitly read-only task | The checklist skill unconditionally requires a repository checklist | `node --test scripts/test-planning-policy.test.mjs`         |
| [x]    | TEST-SKILL-141 | `scripts/test-planning-policy.test.mjs`         | Checklist-reference read-only instructions     | Preserve an explicitly read-only task | The checklist reference has no explicit read-only boundary          | `node --test scripts/test-planning-policy.test.mjs`         |
| [x]    | TEST-SKILL-142 | `scripts/test-workflow-example-policy.test.mjs` | Guide `Simple Example` section                 | Link to a complete example            | The guide contains incomplete one-line cases                        | `node --test scripts/test-workflow-example-policy.test.mjs` |
| [x]    | TEST-SKILL-145 | Repository line-count validation                | Every changed policy, test, and checklist file | Keep each changed file focused        | The parent checklist currently exceeds 300 lines                    | `wc -l <all changed policy, test, and checklist files>`     |

### Node 20 Closure Cases

These cases were added after the final portability review:

- First observed run: A read-only Node 20.20.2 run reported that the quoted `scripts/*.test.mjs` path
  was not expanded. The same review found that `TEST-SKILL-136` checked only field labels rather than
  the testing policy's meaning. The first local Node 20 command then used an extra `node` argument and
  failed by trying to load a nonexistent repository file named `node`; the corrected runner command is
  recorded below.
- Passing rerun: The focused Node 24 run passed 52/52 after both initial fixes. The corrected Node
  20.20.2 directory command passed 140/140, but the same package command then failed on Node 24 because
  that version treated `scripts` as a module path. The final repository-local enumerator passed 139/139
  with both Node 24.19.0 and Node 20.20.2.

| Status | ID             | Test place                | Exact input or fixture         | Main behavior                                 | Expected result                                                        | Planned command                                 |
| ------ | -------------- | ------------------------- | ------------------------------ | --------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------- |
| [x]    | TEST-SKILL-161 | `scripts/skills.test.mjs` | Root `skills:test` command     | Keep automatic discovery across Node versions | The command invokes one runner with no quoted glob or manual test list | `node --test scripts/skills.test.mjs`           |
| [x]    | TEST-SKILL-162 | Node 20 repository runner | All `scripts/*.test.mjs` files | Execute the real discovery runner             | Node 20 runs every focused skill test and exits successfully           | `pnpm dlx node@20 scripts/run-skills-tests.mjs` |

`TEST-SKILL-136` now owns the corrected semantic interaction-step assertion. The duplicate
`TEST-SKILL-163` draft was retired before finalization because it checked the same independently
failing rule rather than a separate result.

The final test-strength review added one more independent case:

- First observed run: Source-fragment checks still passed if the runner truncated discovered files
  with `.slice(0, 1)`, so the permanent regression check was insufficient. The first controlled test
  then passed the runner but failed because inherited nested test output was not returned in the outer
  `spawnSync` result. The next marker-file attempt also passed the runner but looked in the wrong
  relative directory. Explicit marker URLs still did not run because the controlled child inherited
  Node's internal `NODE_TEST_CONTEXT` from the outer test worker. The controlled child will remove that
  one harness variable so it starts like the real package command.
- Passing rerun: The controlled test passed 7/7 on Node 24.19.0 and Node 20.20.2. Both matching fixture
  tests wrote their markers and the non-test module did not execute.

| Status | ID             | Test place                | Exact input or fixture                                   | Main behavior                 | Expected result                                          | Planned command                       |
| ------ | -------------- | ------------------------- | -------------------------------------------------------- | ----------------------------- | -------------------------------------------------------- | ------------------------------------- |
| [x]    | TEST-SKILL-164 | `scripts/skills.test.mjs` | A copied runner beside two controlled `*.test.mjs` files | Execute every discovered file | Both named fixture tests run; an unrelated file does not | `node --test scripts/skills.test.mjs` |

For the following task-map rows:

- Test place: `scripts/test-workflow-example-policy.test.mjs`.
- Exact input or fixture: The named smallest task and expected `TEST-FORM-*` mapping.
- Main behavior: Keep that one smallest task mapped independently.
- Planned command: `node --test scripts/test-workflow-example-policy.test.mjs`.
- Expected result before the code change: The current inline example has no task-to-test map, so the
  row fails.

| Status | ID             | Smallest example task                      | Expected example case IDs           |
| ------ | -------------- | ------------------------------------------ | ----------------------------------- |
| [x]    | TEST-SKILL-143 | Show the quantity field                    | TEST-FORM-001                       |
| [x]    | TEST-SKILL-146 | Save the lowest allowed value              | TEST-FORM-002                       |
| [x]    | TEST-SKILL-147 | Save a middle allowed value                | TEST-FORM-003                       |
| [x]    | TEST-SKILL-148 | Save the highest allowed value             | TEST-FORM-004                       |
| [x]    | TEST-SKILL-149 | Reject a missing value                     | TEST-FORM-005                       |
| [x]    | TEST-SKILL-150 | Reject a value below the minimum           | TEST-FORM-006                       |
| [x]    | TEST-SKILL-151 | Reject a value above the maximum           | TEST-FORM-007                       |
| [x]    | TEST-SKILL-152 | Reject a decimal value                     | TEST-FORM-008                       |
| [x]    | TEST-SKILL-153 | Show the validation message without saving | TEST-FORM-005 through TEST-FORM-008 |

For the following exact example-case rows:

- Test place: `scripts/test-workflow-example-policy.test.mjs`.
- Exact input or fixture: The named `TEST-FORM-*` block.
- Main behavior: Keep all fourteen required fields in that one example case.
- Planned command: `node --test scripts/test-workflow-example-policy.test.mjs`.
- Expected result before the code change: The current inline case omits required fields, so the row
  fails.

| Status | ID             | Exact example case |
| ------ | -------------- | ------------------ |
| [x]    | TEST-SKILL-144 | TEST-FORM-001      |
| [x]    | TEST-SKILL-154 | TEST-FORM-002      |
| [x]    | TEST-SKILL-155 | TEST-FORM-003      |
| [x]    | TEST-SKILL-156 | TEST-FORM-004      |
| [x]    | TEST-SKILL-157 | TEST-FORM-005      |
| [x]    | TEST-SKILL-158 | TEST-FORM-006      |
| [x]    | TEST-SKILL-159 | TEST-FORM-007      |
| [x]    | TEST-SKILL-160 | TEST-FORM-008      |

## Completion Rules

- [x] Keep every row incomplete until its independent result passes.
- [x] Record each failed command before changing the implementation it covers.
- [x] Update passing reruns here before completing the corresponding parent-checklist item.
