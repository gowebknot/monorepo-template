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

## After Work

1. Mark only items completed by the current task.
2. Use `[x]` for complete task items, `[ ]` for incomplete items, and `[/]` for partial items.
3. Add a concise inline explanation after a partial item describing what remains.
4. Update table rows by their exact identifier and preserve the row's structure.
5. Update any documented last-updated field when the file requires one.
6. Keep parent items incomplete until all independently tracked child items are complete.
7. When the same work appears in multiple checklists, update the granular record first and then
   reconcile the parent or summary record.

## Test Checklists

Use `TEST-<AREA>-<NUMBER>` identifiers for test cases, such as `TEST-API-001` or
`TEST-SERVER-002`. Do not use project-specific identifier prefixes unless the repository explicitly
defines them.

## Validation

Before finalizing a task:

- Re-scan affected checklist files for stale items.
- Confirm every changed status is allowed by its file's status legend.
- Confirm partial and blocked work is explained without falsely marking it complete.
- Report checklist items that cannot be matched confidently instead of guessing.

See [checklist policy](references/checklist-policy.md) for matching, nesting, and status rules.
