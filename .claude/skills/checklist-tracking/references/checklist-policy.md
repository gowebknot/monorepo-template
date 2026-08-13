# Checklist Policy

## Matching

Match work to checklist items in this order:

1. Exact phrases in the task and checklist item.
2. Shared domain or package keywords.
3. The nearest section and subsection headings.
4. Affected file or directory paths.
5. Explicit identifiers mentioned in the task or implementation plan.

If a match is ambiguous, inspect surrounding context and report the ambiguity. Do not mark a
checklist item based only on a broad keyword.

## Plan Gate

The implementation plan must be completed before a new checklist is created. The new checklist must
capture that plan in detailed nested items before implementation begins. If the scope or approach
changes, update the new checklist before making the corresponding implementation change.

If the user explicitly requires a read-only review, explanation, or research task, perform the same
planning, decomposition, and validation design in memory. Do not create or update a checklist, and do
not edit repository files. Report findings and validation gaps directly.

## Task Lists

Use the following states:

```text
- [ ] incomplete
- [/] partially complete <!-- partial: explain what remains -->
- [x] complete
```

Nested items at any depth are independently tracked. A parent item may be marked complete only after
all of its children and descendants are complete. If work is blocked or intentionally skipped, keep it
incomplete and add a brief explanatory comment.

Split work until each smallest item has one clear result that can be checked on its own. If two parts
could pass or fail separately, they must be separate child items. Broad items such as "build the
feature," "handle validation," or "add tests" are parent summaries, not ready work.

Use plain English for checklist items, cases, results, effects, reasons, and questions. Explain an
unavoidable technical term in simple words the first time it appears.

## Status Tables

Read the table's status legend before editing. Match rows by their exact identifier, update only the
status cell, and preserve all other cells. If no status legend exists, use the repository's documented
convention or ask for clarification rather than inventing a new status.

For test cases, use identifiers in the form `TEST-<AREA>-<NUMBER>`, for example:

```text
| TEST-API-001 | Rejects an invalid request | planned |
```

## Exact Test Case Rules

Every case must contain these fields: `Small task:`, `Source:`, `Test place:`, `Starting state:`,
`Exact input or fixture:`, `Interaction steps:`, `Main behavior:`, `Expected result:`, `Must change:`,
`Must not happen:`, `Planned command:`, `Expected result before the code change:`,
`First observed run:`, and `Passing rerun:`.

During planning, fill in `Planned command:` and `Expected result before the code change:`. Fill in
`First observed run:` only after its command has run. Fill in `Passing rerun:` only after its command
has run. Do not invent test results before running the command.

If trusted sources disagree, check which source wins under repository guidance. If no rule answers
that question, record the conflict, ask the user, and block the affected work.

If no trusted source defines the expected behavior, search the repository. If the answer is still
unknown, record the open question, ask the user, and block the affected work until it is resolved.

A broad row such as "test invalid requests" is not enough. Add a separate row or checklist item for
each exact situation that could pass or fail on its own. Use these fields for every case: `Small task:`,
`Source:`, `Test place:`, `Starting state:`, `Exact input or fixture:`, `Interaction steps:`,
`Main behavior:`, `Expected result:`, `Must change:`, `Must not happen:`, `Planned command:`,
`Expected result before the code change:`, `First observed run:`, and `Passing rerun:`. Every smallest
task and known rule must map to test IDs before implementation begins.

Leave observed results pending during planning and fill them only after their commands run.
Do not invent test results before running the command. When trusted sources disagree, check which
source wins under repository guidance. If no rule answers that question, record the conflict, ask the
user, and block the affected work until it is resolved.

When one table-based test uses similar input rows, keep every row linked to its own test ID, input, and
expected result. A broad parent remains incomplete while an exact case is missing, unresolved, failed,
or incomplete.

## Cross-References

When a summary item references granular rows, the granular rows determine the summary status. Do not
mark the summary complete while any referenced row remains incomplete, failed, or ambiguous.

For related task checklists, use relative Markdown links in both directions. A new task checklist
should link to the relevant prior checklist. For an active uncommitted checklist, update the existing
file in place after replanning the same task and do not add `## Updates` for ordinary changes. For a
later correction to committed prior work, append a dated entry at the bottom of the original checklist
under `## Updates` and link the new checklist back to it. Keep all committed earlier plans, items, and
statuses unchanged.
