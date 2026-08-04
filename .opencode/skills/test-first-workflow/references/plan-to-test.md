# Plan-to-Test Guidance

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

1. Define acceptance criteria and cases.
2. Locate existing tests and test utilities.
3. Add the focused test or validation check.
4. Run it before implementation when a meaningful failing state is possible.
5. Implement the smallest change.
6. Run focused and package-level validation.
7. Update any checklist only after observing the actual result.
