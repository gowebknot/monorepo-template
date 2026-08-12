# Plan-to-Test Guidance

## Plan and Checklist Sequence

1. Read the task request and applicable repository and package guidance during the planning phase.
2. For a new bug, scan and read relevant previous checklists, their updates, and the implementations
   and tests they describe before defining the fix.
3. Define acceptance criteria, validation cases, implementation approach, dependencies, and risks.
4. When the workflow calls for a checklist, create a new unique checklist under
   `docs/checklists/<YYYY-MM-DD>-<implementation-summary-slug>.md` from the completed plan. The slug
   should describe the implementation included in the task. Never reuse an existing checklist for a
   new task.
5. For a commit or release checklist, add an `Implementation Description` section describing the
   concrete implementation included in that commit or release. This does not require creating a
   checklist for every commit or release.
6. Add detailed nested work items and link the new checklist to every relevant previous checklist.
7. Begin implementation only after the new checklist captures the plan.
8. If later work finds committed previous work defective, append a dated update with the reason,
   evidence, impact, corrective action, validation, and a backlink to the bottom of the original
   checklist. Do not edit its prior plan, items, or statuses.

## Checklist Lifecycle

1. Treat a staged or unstaged but uncommitted checklist as an active working document.
2. For the same task, re-plan scope or approach changes, then edit the active checklist in place before
   implementing them. Do not add `## Updates` for ordinary uncommitted changes.
3. Record active validation failures under the current validation item or `## Validation Notes` before
   correcting them, then record the passing rerun.
4. Treat a committed checklist as immutable history. A genuinely new task or bug gets a new checklist,
   and a later correction to committed work is recorded in a bottom `## Updates` section on the original.

## Case Design

For each acceptance criterion, define the smallest meaningful cases that prove behavior:

- Happy path with valid inputs.
- Validation failures for missing, malformed, or out-of-range inputs.
- Boundary and empty-state behavior.
- Downstream, timeout, not-found, and unexpected error handling.
- Authorization or access-control decisions when applicable.
- State transitions and invalid transitions when state exists.
- Retry and idempotency behavior when an operation can be repeated.

Use the repository's actual terminology and test runner. Do not create speculative tests for behavior
outside the task's acceptance criteria.

## Test IDs

Use `TEST-<AREA>-<NUMBER>` for durable test case IDs:

```text
TEST-API-001
TEST-SERVER-002
TEST-QUERY-003
```

Use the owning package or module for `AREA`, and keep numbering stable when cases are reordered.

## Validation Sequence

1. Define acceptance criteria and cases during planning.
2. Locate existing tests and test utilities during planning.
3. Create the new checklist from the completed plan.
4. Add the focused test or validation check.
5. Run it before implementation when a meaningful failing state is possible, and record the observed
   result in the new checklist before implementation.
6. Implement the smallest change from the checklist.
7. Run focused and package-level validation.
8. Record each observed result, including failures, before correcting them.
9. Fix failures, rerun the relevant checks, and record the final result before marking the item
   complete.
10. For a later defect in committed prior work, append the update to the bottom of its original checklist
    without changing the earlier content.
