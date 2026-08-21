---
name: checklist-tracking
description: "Use when a task creates, edits, reviews, or completes Markdown checklists, implementation plans, task lists, status tables, or tracked test cases. Scan relevant documentation before work, match items to the affected scope, update parent and child statuses after work, preserve each file's status legend, and detect stale checklist entries before finalizing. Use generic TEST-AREA-NNN identifiers for durable test cases."
---

# Checklist Tracking

Keep documented work status synchronized with the actual repository state.

## Before Work

1. Locate relevant checklist-bearing Markdown files under `docs/` and any checklist files near the
   affected package or module.
2. Identify the checklist format: task-list checkboxes, status tables, or both.
3. Match candidate items using the task description, affected paths, section headings, and explicit
   identifiers. Record the file and line context before editing.
4. Read each file's status legend before changing a table status. Do not invent status values.

Complete the planning phase before creating a checklist. During planning, read relevant previous
checklists, implementations, tests, and updates for a new bug. After planning, create a new unique
checklist under `docs/checklists/` from that plan and before implementation. Do not reuse an existing
checklist. Link the new checklist to the prior records.

## Checklist Lifecycle

Treat a checklist that is staged or unstaged but not committed as an active working document. For the
same task, re-plan scope or approach changes, then update the active checklist in place before
implementation. Do not add `## Updates` for ordinary uncommitted changes. A genuinely new task or bug
must receive a new checklist regardless of the related checklist's commit state.

Treat a checklist present in a commit as immutable history. When a later task corrects committed work,
append a dated `## Updates` section at the bottom of the original only when that correction needs to be
recorded, and link the original and new checklists in both directions.

## After Work

Update items immediately when the smallest item finishes; never batch checklist edits until the task
ends.

1. Mark only items completed by the current task.
2. Use `[x]` for complete task items, `[ ]` for incomplete items, and `[/]` for partial items.
3. Add a concise inline explanation after a partial item describing what remains.
4. Update table rows by their exact identifier and preserve the row's structure.
5. Update any documented last-updated field when the file requires one.
6. Keep parent items incomplete until all independently tracked child items and descendants are
   complete.
7. When the same work appears in multiple checklists, update the granular record first and then
   reconcile the parent or summary record.

Nested checklist items may continue to any depth required by the work. Track every level
independently and do not flatten meaningful dependencies or implementation detail.

Split a broad item into smaller child items until each smallest item has one clear result that can be
tested on its own. Split it again when two parts could pass or fail separately. A broad parent such as
"build the feature," "handle validation," or "add tests" is a summary and stays incomplete until all
of its exact child items are complete.

Use plain English for every checklist item, test case, result, effect, reason, and question. If a
technical term is unavoidable, explain it in simple words the first time it appears.

## Test Checklists

Use `TEST-<AREA>-<NUMBER>` identifiers for test cases, such as `TEST-API-001` or
`TEST-SERVER-002`. Do not use project-specific identifier prefixes unless the repository explicitly
defines them.

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

A broad test heading does not count as a test case. Keep it as an incomplete parent and add one child
case for every exact situation that could pass or fail separately. Use these fields for every case:
`Small task:`, `Source:`, `Test place:`, `Starting state:`, `Exact input or fixture:`,
`Interaction steps:`, `Main behavior:`, `Expected result:`, `Must change:`, `Must not happen:`,
`Planned command:`, `Expected result before the code change:`, `First observed run:`, and
`Passing rerun:`. A table-based test may group similar rows in code, but each row must remain linked to
its own test ID and expected result.

Leave observed results pending during planning. Fill them only after their commands run.
Do not invent test results before running the command. If trusted sources disagree, check which source
wins under repository guidance. If no rule answers that question, record the conflict, ask the user,
and block the affected work until it is resolved.

Before implementation, confirm every smallest task item and every known rule maps to one or more test
IDs. For common test areas without a case, require a plain-English reason they do not apply. Keep the
parent test heading incomplete while any exact case is missing, unresolved, failed, or incomplete.

## Historical Updates

Treat the original plans, checklist items, and statuses in committed checklists as immutable history.
If a later task shows that committed prior work was defective, append a new dated entry at the bottom
of that same file under `## Updates`. Include the reason, evidence, impact, corrective action,
validation, and a link to the new related checklist. Never rewrite, reorder, delete, or change the
earlier content. The new task must still have its own new checklist.

## Validation

Before finalizing a task:

- Re-scan affected checklist files for stale items.
- Confirm every changed status is allowed by its file's status legend.
- Confirm partial and blocked work is explained without falsely marking it complete.
- Report checklist items that cannot be matched confidently instead of guessing.
- Confirm the Implementation Plan is not flatter than its matching Small Task Breakdown item; reject a
  summary-only Implementation Plan that collapses nested implementation detail into one line.

See [checklist policy](references/checklist-policy.md) for matching, nesting, and status rules.
