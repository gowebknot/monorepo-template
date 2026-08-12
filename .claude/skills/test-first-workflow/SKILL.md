---
name: test-first-workflow
description: "Required at the start of every repository task, including code, tests, documentation, configuration, package, and skill changes. Plan the work and review relevant prior checklists first, create a new detailed checklist from that plan before implementation, edit active uncommitted checklists in place, preserve committed checklists as history, record failures before correcting them, and verify the final state. Use red-green-refactor for executable code and a plan-validate-execute loop for non-executable changes."
---

# Test-First Workflow

Make planning precede checklist creation and implementation, then use the checklist as the source of
truth for the work.

## Plan Before the Checklist

Start every new task with a planning phase. Do not create the new checklist or change implementation
files until the plan has established the task context, acceptance criteria, validation approach, and
implementation strategy.

1. Read the task request and the repository and package guidance that applies to it.
2. For a new bug, read relevant previous checklists first, including their updates, then inspect the
   implementations and tests they describe.
3. Identify the affected package, module, files, public behavior, user-visible acceptance criteria,
   dependencies, constraints, and non-goals.
4. Locate relevant existing tests, validators, build scripts, fixtures, and integration boundaries.
5. Define the smallest meaningful validation cases and the implementation approach before editing.
6. Load `checklist-tracking` before creating the checklist and follow its nesting, status, matching,
   cross-reference, and history rules.

## Create the Checklist From the Plan

After planning is complete, when the workflow calls for a checklist, create a new unique Markdown
checklist for the task. Use `docs/checklists/<YYYY-MM-DD>-<implementation-summary-slug>.md`; if that
path exists, add a unique suffix instead of reusing an existing checklist. The slug must describe the
implementation covered by the task rather than use a generic label. Copy the completed plan into
detailed nested checklist items, including acceptance criteria, validation cases, implementation
steps, verification commands, dependencies, and risks. Use as many nesting levels as the work
requires.

When creating a checklist for a commit or release, include an `Implementation Description` section
that summarizes the concrete implementation included in that commit or release. This section is a
checklist content requirement, not a requirement to create a checklist for every commit or release.

1. Record a stable checklist ID and links to every relevant previous checklist.
2. Keep the new checklist as the source of truth for implementation and validation.
3. Do not begin implementation until the new checklist exists and reflects the plan.
4. If discovery changes the scope or approach, add or revise the new checklist item before making the
   corresponding implementation change.
5. When a later task finds a previous committed plan or implementation defective, append a dated
   update with the reason, evidence, impact, corrective action, validation, and a link to the new
   checklist at the bottom of the original file. Never rewrite, reorder, delete, or change the
   original plan, items, or statuses.

Use `TEST-<AREA>-<NUMBER>` identifiers when cases need durable tracking. Keep test cases close to
the owning package or module and reuse existing factories, schemas, constants, and harnesses.

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

Complete implementation and validation items in checklist order where dependencies require it. Record
observed results, including failures, in the active checklist before correcting them. Fix failures,
rerun the relevant checks, and record the final result before marking an item complete. Do not perform
unlisted implementation work; re-plan and update the active checklist first when the approved scope
changes.

## Executable Code

1. Write or update focused tests for the expected behavior and important rejection or error paths.
2. Run the focused test when the test runner and task make that practical, and record the observed
   result, including an expected failure, in the new checklist before implementation.
3. Implement the smallest change that satisfies the test.
4. Run the focused test, then the affected package checks.
5. Record every observed validation result, including failures, in the new checklist before making a
   correction.
6. Fix failures, rerun the relevant checks, and record the final result before marking the item
   complete.
7. Refactor only after the behavior is passing, without weakening or deleting meaningful assertions.

Cover applicable happy paths, validation failures, edge cases, error states, authorization, state
transitions, idempotency, and compatibility behavior.

## Non-Executable Changes

For documentation, configuration, generated metadata, and skill changes, define a validation
procedure before editing. Examples include a format check, parser, schema validator, synchronization
command, snapshot comparison, link check, or exact reference scan. Run the check after the change and
record the observed result, including failures, in the active checklist before correcting them. Fix
failures, rerun the check, and record the final result before proceeding.

## Existing Tests

Read relevant tests before implementation. Infer input and output contracts from fixtures and
assertions, preserve established naming and placement conventions, and do not change an assertion
unless the requirement has explicitly changed or the assertion is demonstrably incorrect.

## Checklist Coordination

Keep the active checklist synchronized with discovery, implementation, test creation, and results.
Record failures when they are observed, before fixing them, and do not mark a case passing without a
passing rerun. Treat committed checklists as immutable history; append corrections only under a bottom
`## Updates` section when a later task corrects committed work.

See [plan-to-test guidance](references/plan-to-test.md) for case design and validation sequencing.
