---
name: test-first-workflow
description: "Required at the start of every repository task, including code, tests, documentation, configuration, package, and skill changes. Define the user's acceptance criteria and executable tests or equivalent validation checks before editing, use the results to guide the smallest implementation, and verify the final state. Use red-green-refactor for executable code and a plan-validate-execute loop for non-executable changes."
---

# Test-First Workflow

Make validation precede implementation for every task.

## Start With Evidence

1. Read the repository and package guidance that applies to the task.
2. Identify the affected package, module, files, public behavior, and user-visible acceptance
   criteria.
3. Locate existing tests, validators, checklists, build scripts, and fixtures before creating new
   ones.
4. Define validation cases before changing implementation files.

Use `TEST-<AREA>-<NUMBER>` identifiers when cases need durable tracking. Keep test cases close to
the owning package or module and reuse existing factories, schemas, constants, and harnesses.

## Executable Code

1. Write or update focused tests for the expected behavior and important rejection or error paths.
2. Confirm a new test fails for the missing behavior when the test runner and task make that practical.
3. Implement the smallest change that satisfies the test.
4. Run the focused test, then the affected package checks.
5. Refactor only after the behavior is passing, without weakening or deleting meaningful assertions.

Cover applicable happy paths, validation failures, edge cases, error states, authorization, state
transitions, idempotency, and compatibility behavior.

## Non-Executable Changes

For documentation, configuration, generated metadata, and skill changes, define a validation
procedure before editing. Examples include a format check, parser, schema validator, synchronization
command, snapshot comparison, link check, or exact reference scan. Run the check after the change and
fix failures before proceeding.

## Existing Tests

Read relevant tests before implementation. Infer input and output contracts from fixtures and
assertions, preserve established naming and placement conventions, and do not change an assertion
unless the requirement has explicitly changed or the assertion is demonstrably incorrect.

## Checklist Coordination

When cases or statuses are tracked in Markdown, load `checklist-tracking` and keep the checklist
synchronized with test creation and results. Do not mark a case passing without running the relevant
validation.

See [plan-to-test guidance](references/plan-to-test.md) for case design and validation sequencing.
