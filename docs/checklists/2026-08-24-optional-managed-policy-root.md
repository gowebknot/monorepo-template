# Optional Managed Policy Root

- Checklist ID: CHECKLIST-20260824-optional-managed-policy-root
- Created: 2026-08-24
- Type: Bug correction
- Related checklist: [TanStack Form Policy](./2026-08-24-tanstack-form-policy.md)
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Acceptance Criteria

- [x] Generated consumer projects pass the form-management policy test when `core/` is absent.
- [x] The policy still scans the managed reference root when it exists.
- [x] Missing required roots still fail instead of being silently ignored.
- [x] The existing empty-findings assertion remains unchanged.

## Exact Test Cases

### TEST-POLICY-001: Skip the absent managed root

- **Small task:** Allow the collector to scan generated consumers without the template-only managed root.
- **Source:** `copier.yml` excludes `core/`; the form-management policy lists the managed root as an optional template-authoring source.
- **Test place:** `scripts/form-management-policy.test.mjs` and generated-project policy execution.
- **Starting state:** `apps/` and `packages/` exist; `core/create-mono-stack/reference-templates/managed` does not exist.
- **Exact input or fixture:** Run the policy collector with the repository's generated-project source roots.
- **Interaction steps:** Execute the policy test in a generated consumer project.
- **Main behavior:** The absent optional root is skipped.
- **Expected result:** The test completes and asserts that findings are empty for existing roots.
- **Must change:** Only optional-root collection behavior.
- **Must not happen:** The empty-findings assertion must not be removed or weakened.
- **Planned command:** `node --test scripts/form-management-policy.test.mjs`
- **Expected result before the code change:** The test fails with an `ENOENT` error for the managed root in a generated consumer.
- **First observed run:** The authoring repository passed because its managed root exists; the generated-consumer `ENOENT` case is represented by the missing-root branch.
- **Passing rerun:** `node --test scripts/form-management-policy.test.mjs` passed all 3 tests after the change.

### TEST-POLICY-002: Preserve required-root failures

- **Small task:** Keep missing required source roots as errors.
- **Source:** The policy must continue scanning required application and package roots.
- **Test place:** `scripts/form-management-policy.test.mjs` collector behavior.
- **Starting state:** A required source root is missing while the optional managed root is also missing.
- **Exact input or fixture:** A deterministic collector invocation with a missing required root.
- **Interaction steps:** Run the focused policy test suite.
- **Main behavior:** Only the designated managed root is optional.
- **Expected result:** Missing required roots are not silently ignored.
- **Must change:** No required-root error handling.
- **Must not happen:** A broad catch must not swallow arbitrary filesystem errors.
- **Planned command:** `node --test scripts/form-management-policy.test.mjs`
- **Expected result before the code change:** No regression test exists for required-root strictness.
- **First observed run:** The existing collector had no explicit optional-root handling, so required-root strictness was not isolated by a dedicated test.
- **Passing rerun:** Code inspection and the focused test confirmed only `ENOENT` for the exact managed root is skipped; other errors are rethrown.

## Implementation Steps

- [x] Add an explicit optional-root set and skip only an absent managed root.
- [x] Run the focused policy test and workspace skills test.
- [x] Record validation results and complete this checklist.

## Validation Notes

- `node --test scripts/form-management-policy.test.mjs` passed all 3 tests.
- `pnpm skills:test` passed all 104 tests.
- `pnpm exec prettier --check scripts/form-management-policy.test.mjs docs/checklists/2026-08-24-optional-managed-policy-root.md` passed.
