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

## Task Lists

Use the following states:

```text
- [ ] incomplete
- [/] partially complete <!-- partial: explain what remains -->
- [x] complete
```

Nested items are independently tracked. A parent item may be marked complete only after all of its
children are complete. If work is blocked or intentionally skipped, keep it incomplete and add a
brief explanatory comment.

## Status Tables

Read the table's status legend before editing. Match rows by their exact identifier, update only the
status cell, and preserve all other cells. If no status legend exists, use the repository's documented
convention or ask for clarification rather than inventing a new status.

For test cases, use identifiers in the form `TEST-<AREA>-<NUMBER>`, for example:

```text
| TEST-API-001 | Rejects an invalid request | planned |
```

## Cross-References

When a summary item references granular rows, the granular rows determine the summary status. Do not
mark the summary complete while any referenced row remains incomplete, failed, or ambiguous.
