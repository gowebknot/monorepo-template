# Fix OpenCode Plugin Server Error

- Checklist ID: CHECKLIST-20260827-fix-opencode-plugin-server-error
- Related implementation checklist: `docs/checklists/2026-08-27-implementation-contract-validator.md`
- Related release checklist: `docs/checklists/2026-08-27-create-mono-stack-0.1.45-release.md`
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

Repair the project OpenCode implementation-contract plugin so OpenCode can initialize it without a
generic server error and so the edit gate observes the actual plugin API. Preserve checklist-path and
plan-mode escape behavior, cover `edit`, `write`, and `apply_patch`, and make the tests independent of
the repository's current Git status.

## Implementation Contract

### Feature Boundaries

- Included product behavior: OpenCode starts normally and blocks implementation edits only when the active contract is missing or invalid.
- Excluded behavior and non-goals: No changes to OpenCode itself, model providers, repository permissions, or the Claude gate.
- Shared, app-wide, and feature-owned boundaries: The contract validator remains shared; the OpenCode adapter owns tool-shape translation; tests own deterministic fixtures.

### Route-Group Ownership

| Route group           | Entry routes                   | Owning feature          | App-wide composition       |
| --------------------- | ------------------------------ | ----------------------- | -------------------------- |
| (plugin startup)      | `.opencode/plugins/*.js`       | OpenCode plugin adapter | OpenCode runtime           |
| (implementation edit) | `edit`, `write`, `apply_patch` | contract edit gate      | active checklist validator |
| (planning)            | `docs/checklists/**`           | checklist workflow      | plan-mode workflow         |

### User Journey

1. Entry point: OpenCode starts in this repository.
2. User actions: The agent reads guidance, plans work, and requests an implementation edit.
3. Visible success result: OpenCode initializes without a server error and valid edits proceed.
4. Loading and empty states: The plugin discovers and reads the active uncommitted checklist.
5. Failure and recovery states: Invalid or missing contracts reject implementation edits with a useful reason while checklist edits remain available.
6. Final navigation or exit: The agent can leave plan mode after the contract is complete and continue implementation.

### Complete Test Matrix

| Test ID           | User intent      | Path                            | Exact expected result                                                          | Test place                                 | Limitation                                    |
| ----------------- | ---------------- | ------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------ | --------------------------------------------- |
| TEST-OPENCODE-001 | Start OpenCode   | valid startup path              | Plugin exports only one callable plugin and returns hooks                      | `scripts/opencode-plugin.test.mjs`         | OpenCode binary startup is separately checked |
| TEST-OPENCODE-002 | Edit a file      | valid contract path             | Hook reads `output.args` and allows a valid `edit` call                        | `scripts/opencode-plugin.test.mjs`         | None                                          |
| TEST-OPENCODE-003 | Edit a file      | invalid contract non-happy path | Hook rejects an invalid `edit` call                                            | `scripts/opencode-plugin.test.mjs`         | None                                          |
| TEST-OPENCODE-004 | Write a file     | invalid contract non-happy path | Hook rejects an invalid `write` call                                           | `scripts/opencode-plugin.test.mjs`         | None                                          |
| TEST-OPENCODE-005 | Edit a file      | missing contract non-happy path | Hook rejects implementation edits with a contract error                        | `scripts/opencode-plugin.test.mjs`         | None                                          |
| TEST-OPENCODE-006 | Create checklist | planning path                   | Checklist paths remain exempt                                                  | `scripts/opencode-plugin.test.mjs`         | None                                          |
| TEST-OPENCODE-007 | Apply patch      | valid single-file path          | Patch path is validated                                                        | `scripts/opencode-plugin.test.mjs`         | None                                          |
| TEST-OPENCODE-008 | Apply patch      | mixed-file non-happy path       | A patch touching implementation and checklist paths is validated, not exempted | `scripts/opencode-plugin.test.mjs`         | None                                          |
| TEST-OPENCODE-009 | Parse patch      | marker path                     | Add, update, delete, and move paths are extracted                              | `scripts/opencode-plugin.test.mjs`         | None                                          |
| TEST-OPENCODE-010 | Apply patch      | malformed non-happy path        | Patch without a path is rejected                                               | `scripts/opencode-plugin.test.mjs`         | None                                          |
| TEST-CONTRACT-006 | Run tests        | clean-checkout path             | Contract tests use an isolated temporary Git fixture                           | `scripts/implementation-contract.test.mjs` | Temporary filesystem only                     |
| TEST-OPENCODE-011 | Diagnose startup | success path                    | OpenCode debug config has no plugin hook errors                                | OpenCode diagnostic command                | Depends on local OpenCode binary              |

### Unresolved Conflicts

- Conflict: The committed plugin used a named helper export and the wrong hook argument object.
- Winning rule or blocking question: Official OpenCode plugin documentation and installed declarations define one or more plugin exports, `(input, output)` hooks, and `output.args`; the helper must not be exported as a plugin.
- Blocked test IDs and implementation items: None.

## Acceptance Criteria

- [x] OpenCode initializes without the reported generic server error.
- [x] The plugin exposes only valid plugin functions and uses the documented hook signature.
- [x] `edit`, `write`, and `apply_patch` implementation edits are gated.
- [x] Checklist creation and planning remain possible.
- [x] Focused tests pass on both dirty and clean repository states.
- [x] Full skill tests, formatting, and OpenCode diagnostic checks pass.

## Exact Test Cases

### TEST-OPENCODE-001: Plugin exports only valid plugin functions

- Small task: Remove the helper from OpenCode's plugin export surface.
- Source: Official OpenCode plugin documentation and current startup error.
- Test place: `scripts/opencode-plugin.test.mjs`.
- Starting state: The plugin exports `validateBeforeEdit` and a default plugin; OpenCode treats both as plugins.
- Exact input or fixture: Import `.opencode/plugins/implementation-contract-gate.js` and inspect its exports and returned hook object.
- Interaction steps: Import the module, enumerate exports, invoke the default export with a plugin context, and inspect the result.
- Main behavior: Only plugin functions are discovered and each returns a hooks object.
- Expected result: The module has one plugin export and its result is an object containing `tool.execute.before`.
- Must change: Plugin export surface and test.
- Must not happen: A helper function must not be auto-loaded as a second plugin.
- Planned command: `node --test scripts/opencode-plugin.test.mjs`
- Expected result before the code change: The test fails because the named helper export is present.
- First observed run: Failed because the plugin exported both `default` and `validateBeforeEdit`; the test expected only `default`.
- Passing rerun: `node --test scripts/opencode-plugin.test.mjs` passed the plugin export and hook-shape assertion.

### TEST-OPENCODE-002: Hook reads output arguments for edit

- Small task: Adapt the hook to OpenCode's actual callback signature.
- Source: Installed `@opencode-ai/plugin` declarations and official OpenCode plugin examples.
- Test place: `scripts/opencode-plugin.test.mjs`.
- Starting state: The hook reads `input.args`, so valid edit calls are silently ignored.
- Exact input or fixture: Valid temporary Git fixture, `input.tool` equal to `edit`, and `output.args.filePath` pointing to an implementation file.
- Interaction steps: Invoke the plugin, call the returned hook with `(input, output)`, and assert it resolves for a valid contract.
- Main behavior: File-based implementation edits are checked using `output.args`.
- Expected result: The hook resolves for a valid `edit` call.
- Must change: Hook callback arguments and tests.
- Must not happen: A missing or invalid contract must not be bypassed because `input.args` is absent.
- Planned command: `node --test scripts/opencode-plugin.test.mjs`
- Expected result before the code change: The test cannot exercise the actual argument shape and invalid calls are not rejected.
- First observed run: Failed because the current hook reads `input.args` and did not reject the invalid contract supplied through `output.args`.
- Passing rerun: `node --test scripts/opencode-plugin.test.mjs` passed the valid `edit` assertion.

### TEST-OPENCODE-003: Invalid edit is rejected using output arguments

- Small task: Preserve fail-closed behavior for `edit` implementation changes.
- Source: Implementation-contract requirement and OpenCode edit hook.
- Test place: `scripts/opencode-plugin.test.mjs`.
- Starting state: Temporary Git fixture contains an invalid uncommitted checklist.
- Exact input or fixture: `edit` call with `output.args.filePath` set to `src/example.ts`.
- Interaction steps: Invoke the hook in the temporary fixture and capture the rejection.
- Main behavior: Invalid active checklist blocks implementation.
- Expected result: Rejection names the incomplete implementation contract.
- Must change: Test fixture and adapter behavior only as needed.
- Must not happen: The hook must not silently allow the edit.
- Planned command: `node --test scripts/opencode-plugin.test.mjs`
- Expected result before the code change: The current hook reads `input.args` and resolves instead of validating `output.args`.
- First observed run: Failed because the current hook ignored the file path in `output.args` and resolved instead of rejecting.
- Passing rerun: `node --test scripts/opencode-plugin.test.mjs` rejected the invalid `edit` assertion as expected.

### TEST-OPENCODE-004: Invalid write is rejected using output arguments

- Small task: Preserve fail-closed behavior for `write` implementation changes.
- Source: Implementation-contract requirement and OpenCode edit hook.
- Test place: `scripts/opencode-plugin.test.mjs`.
- Starting state: Temporary Git fixture contains an invalid uncommitted checklist.
- Exact input or fixture: `write` call with `output.args.filePath` set to `src/example.ts`.
- Interaction steps: Invoke the hook and capture the rejection.
- Main behavior: Invalid active checklist blocks a write implementation edit.
- Expected result: Rejection names the incomplete implementation contract.
- Must change: Hook callback arguments and tests.
- Must not happen: A write edit must not bypass validation because its arguments are in `output.args`.
- Planned command: `node --test scripts/opencode-plugin.test.mjs`
- Expected result before the code change: The current hook reads `input.args` and resolves instead of validating `output.args`.
- First observed run: Failed because the current hook ignored the file path in `output.args` and resolved instead of rejecting.
- Passing rerun: `node --test scripts/opencode-plugin.test.mjs` rejected the invalid `write` assertion as expected.

### TEST-OPENCODE-005: Missing active contract rejects implementation edits

- Small task: Preserve fail-closed behavior for implementation edits.
- Source: Implementation-contract requirement and OpenCode edit hook.
- Test place: `scripts/opencode-plugin.test.mjs`.
- Starting state: Temporary Git fixture has no uncommitted checklist.
- Exact input or fixture: `edit` call with `output.args.filePath` set to `src/example.ts`.
- Interaction steps: Invoke the hook in the temporary fixture and capture the rejection.
- Main behavior: Missing active checklist blocks implementation.
- Expected result: Rejection names the missing active checklist or implementation contract.
- Must change: Test fixture and adapter behavior only as needed.
- Must not happen: The hook must not silently allow the edit.
- Planned command: `node --test scripts/opencode-plugin.test.mjs`
- Expected result before the code change: Existing hook reads `input.args` and resolves instead of checking the file path in `output.args`.
- First observed run: Failed because the current hook ignored the file path in `output.args` and resolved instead of rejecting.
- Passing rerun: `node --test scripts/opencode-plugin.test.mjs` rejected the missing-checklist implementation edit as expected.

### TEST-OPENCODE-006: Checklist paths remain exempt

- Small task: Preserve the workflow escape hatch for creating or updating the contract.
- Source: Existing Claude gate exemptions and checklist workflow.
- Test place: `scripts/opencode-plugin.test.mjs`.
- Starting state: Temporary Git fixture has no active checklist.
- Exact input or fixture: `edit` call with `output.args.filePath` set to `docs/checklists/new-plan.md`.
- Interaction steps: Invoke the hook and await completion.
- Main behavior: Checklist edits are allowed without an existing contract.
- Expected result: The hook resolves without reading an active checklist.
- Must change: No unrelated permissions.
- Must not happen: Checklist creation must not be blocked by the contract it creates.
- Planned command: `node --test scripts/opencode-plugin.test.mjs`
- Expected result before the code change: Existing helper exempts checklist paths, but the actual hook path is not tested.
- First observed run: Passed before implementation because the current helper returns early for checklist paths; the real hook path remains covered.
- Passing rerun: `node --test scripts/opencode-plugin.test.mjs` allowed the checklist-path edit as expected.

### TEST-OPENCODE-007: Single-file apply_patch is gated

- Small task: Add support for OpenCode's patch edit tool.
- Source: Official OpenCode tools documentation.
- Test place: `scripts/opencode-plugin.test.mjs`.
- Starting state: Temporary Git fixture has no active checklist and receives an implementation patch.
- Exact input or fixture: `input.tool` equal to `apply_patch`; `output.args.patchText` contains `*** Update File: src/example.ts`.
- Interaction steps: Invoke the hook with the patch payload and capture the rejection.
- Main behavior: Patch paths are extracted and validated.
- Expected result: The implementation patch is rejected when the contract is missing.
- Must change: Patch path extraction and test.
- Must not happen: `apply_patch` must not bypass the contract gate.
- Planned command: `node --test scripts/opencode-plugin.test.mjs`
- Expected result before the code change: Existing tool set does not include `apply_patch`, so the patch is ignored.
- First observed run: Failed because the current tool set does not include `apply_patch`, so the implementation patch was ignored.
- Passing rerun: `node --test scripts/opencode-plugin.test.mjs` rejected the single-file implementation patch as expected.

### TEST-OPENCODE-008: Mixed apply_patch paths are not broadly exempted

- Small task: Handle multi-file patches without allowing implementation changes through a checklist path.
- Source: Official OpenCode patch format and checklist exemption rule.
- Test place: `scripts/opencode-plugin.test.mjs`.
- Starting state: Temporary Git fixture has no active checklist and receives a patch containing one checklist add and one source update.
- Exact input or fixture: `*** Add File: docs/checklists/new-plan.md` plus `*** Update File: src/example.ts`.
- Interaction steps: Invoke the hook and capture the rejection.
- Main behavior: Every implementation path in a patch is gated.
- Expected result: The mixed patch is rejected because it includes `src/example.ts`.
- Must change: Patch path extraction and test.
- Must not happen: Presence of an exempt checklist path must not exempt unrelated implementation paths.
- Planned command: `node --test scripts/opencode-plugin.test.mjs`
- Expected result before the code change: Existing hook ignores the patch tool completely.
- First observed run: Failed because the current hook ignores `apply_patch`; a mixed patch was allowed without an active checklist.
- Passing rerun: `node --test scripts/opencode-plugin.test.mjs` rejected the mixed patch as expected.

### TEST-OPENCODE-009: All documented apply_patch markers are extracted

- Small task: Cover every file marker supported by OpenCode's patch tool.
- Source: Official OpenCode tools documentation.
- Test place: `scripts/opencode-plugin.test.mjs`.
- Starting state: Patch parser receives one add, update, delete, and move marker.
- Exact input or fixture: `*** Add File: src/added.ts`, `*** Update File: src/updated.ts`, `*** Delete File: src/deleted.ts`, and `*** Move to: src/moved.ts`.
- Interaction steps: Pass the patch text to the path extractor and compare the returned paths.
- Main behavior: Every documented patch marker produces one path.
- Expected result: The extractor returns all four paths in source order.
- Must change: Patch parser test only.
- Must not happen: Any documented marker must not be silently ignored.
- Planned command: `node --test scripts/opencode-plugin.test.mjs`
- Expected result before the code change: No direct marker extraction test exists.
- First observed run: Focused suite passed after adding the marker-coverage test; no direct marker assertion existed before implementation.
- Passing rerun: `node --test scripts/opencode-plugin.test.mjs` passed all 10 plugin tests.

### TEST-OPENCODE-010: Patch without a path is rejected

- Small task: Fail closed when a patch payload cannot identify its target.
- Source: Implementation-contract gate safety boundary.
- Test place: `scripts/opencode-plugin.test.mjs`.
- Starting state: Temporary Git fixture receives `apply_patch` with only begin and end markers.
- Exact input or fixture: `*** Begin Patch\n*** End Patch`.
- Interaction steps: Invoke the hook and capture the rejection.
- Main behavior: Unknown patch targets cannot bypass validation.
- Expected result: Rejection states that `apply_patch` did not contain a file path.
- Must change: Patch payload guard and test.
- Must not happen: An unscoped patch must not be allowed.
- Planned command: `node --test scripts/opencode-plugin.test.mjs`
- Expected result before the code change: Existing hook ignores `apply_patch` and resolves.
- First observed run: Focused suite passed after adding the malformed-patch test; no malformed-patch assertion existed before implementation.
- Passing rerun: `node --test scripts/opencode-plugin.test.mjs` passed all 10 plugin tests.

### TEST-CONTRACT-006: Contract tests pass on a clean checkout

- Small task: Remove repository-status dependence from the plugin contract test.
- Source: `findActiveChecklist` behavior and clean-checkout regression.
- Test place: `scripts/implementation-contract.test.mjs`.
- Starting state: Test process runs in a clean repository with no uncommitted checklist.
- Exact input or fixture: Isolated temporary Git repository containing a valid uncommitted checklist and implementation path.
- Interaction steps: Create the fixture, run the contract helper, and remove the fixture.
- Main behavior: The test verifies a valid active contract deterministically.
- Expected result: Contract test passes without requiring the main repository to be dirty.
- Must change: Test fixture setup only.
- Must not happen: Test outcome must not depend on this checklist remaining uncommitted.
- Planned command: `node --test scripts/implementation-contract.test.mjs`
- Expected result before the code change: The test fails on a clean checkout with `no active checklist was found`.
- First observed run: Failed on the clean checkout with `ERR_MODULE_NOT_FOUND` for the planned adapter module; the prior test also depended on an uncommitted checklist.
- Passing rerun: `node --test scripts/implementation-contract.test.mjs scripts/opencode-plugin.test.mjs` passed all 16 tests.

### TEST-OPENCODE-011: OpenCode diagnostic has no plugin hook errors

- Small task: Verify the user-visible startup failure is gone.
- Source: Reported error and OpenCode diagnostic commands.
- Test place: OpenCode debug configuration command.
- Starting state: Project plugin is present and OpenCode is installed locally.
- Exact input or fixture: Current project configuration and plugin directory.
- Interaction steps: Run OpenCode's debug configuration command with debug logging and inspect plugin diagnostics.
- Main behavior: Plugin initialization completes without hook-shape errors.
- Expected result: No `plugin config hook failed`, `plugin dispose hook failed`, or generic startup server error appears.
- Must change: No runtime project state.
- Must not happen: Diagnostic must not contact application APIs or alter repository files.
- Planned command: `opencode debug config --print-logs --log-level DEBUG`
- Expected result before the code change: Diagnostic reports the invalid named helper plugin or equivalent hook error.
- First observed run: The pre-fix diagnostic reported invalid plugin hook registration errors.
- Passing rerun: `opencode debug config --print-logs --log-level DEBUG` initialized and disposed the project without plugin hook errors.

## Implementation Plan

- [x] Add deterministic plugin API regression tests and a temporary Git fixture helper.
- [x] Move `validateBeforeEdit` out of the auto-discovered plugin module.
- [x] Change the OpenCode hook to use `(input, output)` and `output.args`.
- [x] Parse `apply_patch` paths and gate mixed patches conservatively.
- [x] Update the clean-checkout contract test and root test command if needed.
- [x] Run focused tests, package skill tests, formatting, and OpenCode diagnostics.

## Risks And Non-Goals

- OpenCode plugin startup behavior depends on the installed OpenCode version; the documented API and local declarations are the sources of truth.
- Patch syntax must be parsed conservatively so implementation files cannot be exempted by an adjacent checklist path.
- No changes are planned to the already-published `create-mono-stack@0.1.45` artifact; this is a follow-up repository fix.

## Validation Notes

- The pre-fix focused run failed 7 of 14 tests: the extra plugin export, ignored `output.args`, missing active-checklist rejection, unhandled `apply_patch`, and missing adapter module.
- `node --test scripts/implementation-contract.test.mjs scripts/opencode-plugin.test.mjs` passed all 16 focused tests after the fix.
- `pnpm skills:test` passed all 122 tests, including the new OpenCode plugin tests.
- Targeted ESLint, `pnpm format:check`, and `just check` passed. Existing TanStack Table React Compiler warnings remain non-failing.
- `opencode debug config --print-logs --log-level DEBUG` discovered the project plugin and completed without plugin hook errors.
