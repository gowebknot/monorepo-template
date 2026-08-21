---
name: test-first-workflow
description: "Required at the start of every repository task, including code, tests, documentation, configuration, package, and skill changes. Split large work into small testable parts, list exact test cases for every part before implementation, create and follow a detailed checklist, record failures before fixes, and verify the final result."
---

# Test-First Workflow

Plan first, copy the completed plan into a checklist, and then use that checklist as the source of
truth for tests, implementation, and results.

## Plan Before the Checklist

Start every new task with a planning phase. Do not create the new checklist or change implementation
files until the plan covers the task context, small task breakdown, acceptance criteria, exact test
cases, implementation steps, dependencies, and risks.

1. Read the task request and the repository and package guidance that applies to it.
2. For a new bug, read relevant previous checklists first, including their updates, then inspect the
   implementations and tests they describe.
3. Identify the affected package, module, files, public behavior, user-visible acceptance criteria,
   dependencies, constraints, and non-goals.
4. Find the real rules in the request, schemas, validators, types, existing tests, current code, and
   documentation.
5. Locate relevant test files, test helpers, build scripts, sample data, and system boundaries.
6. Split the work into small parts and plan exact test or validation cases as described below.
7. Load `checklist-tracking` before creating the checklist and follow its nesting, status, matching,
   cross-reference, and history rules.

## Split the Work Until Each Part Is Small

Do not treat a feature name, screen name, endpoint name, or broad implementation step as a ready task.

1. Start with the requested outcome.
2. Split it into separate behaviors that a user or another system can notice.
3. Split each behavior into its separate rules, choices, success paths, failure paths, and state
   changes.
4. Keep splitting with as many checklist levels as needed.
5. Stop only when the smallest item has one clear result and can be tested on its own.

Split an item again if it contains two things that could pass or fail separately. Words such as
"and," "or," "all validations," "handle errors," or "add tests" often show that an item is still too
broad. A parent item is only a summary; its smaller child items define the real work.

Repeat this breakdown when repository discovery reveals another rule, choice, state, or failure path.

Use plain English for task items, test cases, expected results, required changes, forbidden work,
reasons, and questions. If a technical term is unavoidable, explain it in simple words the first time
it appears.

## Plan One Exact Test Situation at a Time

Plan exact test or validation cases for every smallest task item before writing tests or changing
implementation files. A heading such as "test validation," "add focused tests," "test edge cases," or
"test errors" is not a test case.

## Exact Test Case Rules

Every case must contain these fields: `Small task:`, `Source:`, `Test place:`, `Starting state:`,
`Exact input or fixture:`, `Interaction steps:`, `Main behavior:`, `Expected result:`, `Must change:`,
`Must not happen:`, `Planned command:`, `Expected result before the code change:`,
`First observed run:`, and `Passing rerun:`.

During planning, fill in `Planned command:` and `Expected result before the code change:`. Fill in
`First observed run:` only after its command has run. Fill in `Passing rerun:` only after its command
has run. Do not invent test results before running the command.

If trusted sources disagree, check which source wins under repository guidance. If no rule answers
that question, record the conflict, ask the user, and block the affected tests and implementation.

Give every case a `TEST-<AREA>-<NUMBER>` ID and use these fields:

- **Small task:** The smallest task item it proves.
- **Source:** The request, schema, validator, existing test, current public behavior, or other rule.
- **Test place:** The test kind and file where it belongs.
- **Starting state:** The exact state and sample data before the test.
- **Exact input or fixture:** The exact input or sample data.
- **Interaction steps:** Every step needed, such as enter a value and then submit.
- **Main behavior:** The one behavior or result being checked.
- **Expected result:** The exact visible result, returned value, error, status, or state.
- **Must change:** Data, calls, events, or files that must change, when relevant.
- **Must not happen:** Work that must not happen after rejection or failure, when relevant.
- **Planned command:** The command to run after the checklist exists.
- **Expected result before the code change:** The expected failure or other starting result.
- **First observed run:** The real result after the first command runs.
- **Passing rerun:** The real passing result after implementation.

Use a separate case when a different input, rule, branch, state, or expected result could fail on its
own. A table-based test may keep similar cases together in code, but every row must still have its own
case ID, exact values, and expected result.

For every known rule, check the normal valid situations and each separate invalid situation that can
reach the boundary. Check exact minimum and maximum values and the nearest values outside those limits
when limits exist. Check missing, `null`, empty, spaces-only, wrong-type, bad-format, unsupported,
duplicate, and conflicting values only when they can occur and have meaningful behavior. Also check
choices, states, errors, permissions, retries, repeated requests, compatibility, and side effects when
they apply.

Test values together when one value changes how another value should behave. Do not create every
possible mix of unrelated values.

If no source defines what should happen, search the repository first. If the answer is still unknown,
record an open question and ask the user instead of guessing, inventing a rule, or silently skipping
the case. If trusted sources disagree, check which source wins under repository guidance. If no rule
answers that question, record the conflict, ask the user, and block the affected tests and
implementation until it is resolved.

Do not invent test results before running the command. During planning, record only the Planned
command and Expected result before the code change. Fill in the First observed run and Passing rerun
after the checklist exists and each command has actually run.

Before creating the checklist, map every smallest task item and every known rule to its test IDs. For
each common test area, list the test IDs or explain why that area does not apply. Do not start tests or
implementation while an item is still broad, a known rule has no case, a case is vague, or an expected
result is still unknown.

## Create the Checklist From the Plan

After planning is complete, create a new unique Markdown checklist for the task. Use
`docs/checklists/<YYYY-MM-DD>-<implementation-summary-slug>.md`; if that path exists, add a unique
suffix instead of reusing an existing checklist. The slug must describe the implementation rather
than use a generic label. Copy the completed plan into detailed nested checklist items, including the
small task breakdown, rule sources, open questions, acceptance criteria, exact cases, task-to-test
map, implementation steps, verification commands, dependencies, and risks.

Nest the implementation steps to the same depth and concreteness as the small task breakdown: exact
files, exact functions, components, or symbols, exact config keys, and the edge cases each smallest
task must handle. A one-line implementation summary per small task is not enough; use as many
checklist levels as needed so the implementation plan is real nested detail, not a summary.

When creating a checklist for a commit or release, include an `Implementation Description` section
that summarizes the concrete implementation included in that commit or release. This section is a
checklist content requirement, not a requirement to create a checklist for every commit or release.

1. Record a stable checklist ID and links to every relevant previous checklist.
2. Keep every parent item incomplete until all of its smaller items are complete.
3. Keep the new checklist as the source of truth for implementation and validation.
4. Do not begin tests or implementation until the new checklist contains the completed breakdown and
   exact case plan.
5. If discovery changes the scope or approach, add or revise the new checklist item before making the
   corresponding implementation change.
6. When a later task finds a previous committed plan or implementation defective, append a dated
   update with the reason, evidence, impact, corrective action, validation, and a link to the new
   checklist at the bottom of the original file. Never rewrite, reorder, delete, or change the
   original plan, items, or statuses.

## Checklist Lifecycle

Use commit state as the history boundary. A checklist that is staged or unstaged but not committed is
an active working document; a checklist present in a commit is historical.

1. For the same active task, re-plan any scope or approach change, then edit the uncommitted checklist
   in place before implementing the change.
2. Update active checklist items, statuses, and validation notes in place. Do not create a `## Updates`
   section for ordinary uncommitted task changes.
3. Record an active validation failure under the relevant validation item or `## Validation Notes`
   before correcting it. Record the passing rerun before marking the item complete.
4. For a genuinely new task or bug, create a new checklist regardless of whether a related checklist is
   committed.
5. When a later task corrects committed work, create a new checklist and append a concise dated `## Updates`
   section to the original only when the first post-commit correction needs to be recorded.
6. Link the original and new checklists in both directions without copying or rewriting the original plan.

## Follow the Checklist

Complete the smallest implementation and validation items in checklist order where one item depends
on another. Record observed results, including failures, against the matching test IDs before fixing
them. Fix failures, rerun the relevant checks, and record the passing result before marking an item
complete. Do not perform unlisted work; split and update the active checklist first when discovery
adds another behavior or case.

## Executable Code

1. Pick the next smallest task item and its planned cases.
2. Write the planned test cases without combining situations that can fail separately.
3. Run the Planned command before implementation when a real failing result is possible. Record the
   First observed run against the matching case IDs before changing implementation code.
4. Implement only the smallest change needed for those cases.
5. Run those cases again, then run the affected package checks.
6. Record every result, including failures, before making another correction.
7. Fix failures, rerun the checks, and record the passing result for each case ID.
8. Refactor only after the behavior passes, without weakening or deleting useful checks.
9. Write this item's status and results into the checklist file now. Do not select the next smallest
   item until the checklist file on disk reflects this one's status; never defer this write until
   later items are also finished.
10. Return to step 1 for the next smallest task item.

## Non-Executable Changes

For documentation, configuration, generated metadata, and skill changes, split the work in the same
way and define exact validation cases before editing. A case can use a format check, parser, schema
validator, synchronization command, snapshot comparison, link check, or exact text scan. Record its
input, command, and expected result. Run the check after the change and record failures before fixing
them. Rerun it and record the passing result before completing the matching case.

## Existing Tests

Read relevant tests before implementation. Infer input and output contracts from fixtures and
assertions, preserve established naming and placement conventions, and do not change an assertion
unless the requirement has explicitly changed or the assertion is demonstrably incorrect.

## Checklist Coordination

Update the checklist immediately after each smallest item completes; never batch checklist edits until
the task ends. Keep the active checklist synchronized with new rules, smaller task items, exact cases,
implementation, and results. Add newly discovered work and cases before implementing them. Record
failures when they happen, before fixing them, and do not mark a case passing without a passing rerun.
Treat committed checklists as immutable history; append corrections only under a bottom `## Updates`
section when a later task corrects committed work.

See [plan-to-test guidance](references/plan-to-test.md) for case design and validation sequencing.
