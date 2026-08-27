# Implementation Contract Validator

- Checklist ID: CHECKLIST-20260827-IMPLEMENTATION-CONTRACT-VALIDATOR
- Created: 2026-08-27
- Type: Agent workflow and repository validation
- Related records: `docs/checklists/2026-08-27-agent-skill-enforcement.md`
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Problem

The planning skill names an implementation contract, but the checklist template has no contract
section and no validator proves that a plan contains feature boundaries, route ownership, a user
journey, complete success and failure coverage, and conflict decisions.

## Implementation Contract

### Feature Boundaries

- Included product behavior: Validate durable planning contracts before implementation edits.
- Excluded behavior and non-goals: Do not infer product truth or validate device execution.
- Shared, app-wide, and feature-owned boundaries: Shared validator module; app-specific gates; checklist-owned contract.

### Route-Group Ownership

| Route group | Entry routes | Owning feature      | App-wide composition |
| ----------- | ------------ | ------------------- | -------------------- |
| (planning)  | checklist    | test-first-workflow | agent edit gate      |

### User Journey

1. Entry point: Agent receives a repository implementation request.
2. User actions: Agent reads guidance, invokes skills, and creates the contract.
3. Visible success result: Contract validation passes before implementation.
4. Loading and empty states: Not applicable to this repository tooling workflow.
5. Failure and recovery states: Validator reports missing sections; agent updates the checklist.
6. Final navigation or exit: Edit proceeds only after validation passes.

### Complete Test Matrix

| Test ID           | User intent       | Path                            | Exact expected result                  | Test place                               | Limitation                 |
| ----------------- | ----------------- | ------------------------------- | -------------------------------------- | ---------------------------------------- | -------------------------- |
| TEST-CONTRACT-005 | Validate contract | valid happy path                | Validator accepts complete contract    | scripts/implementation-contract.test.mjs | None                       |
| TEST-CONTRACT-003 | Validate contract | happy and non-happy paths       | Validator rejects happy-path-only plan | scripts/implementation-contract.test.mjs | None                       |
| TEST-CONTRACT-006 | Gate edit         | missing contract non-happy path | Edit is denied                         | scripts/skill-gate.test.mjs              | OpenCode hook test pending |

### Unresolved Conflicts

- Conflict: Existing skill wording only named the contract without defining its shape.
- Winning rule or blocking question: Current user requirement wins; the new template and validator define the shape.
- Blocked test IDs and implementation items: None.

## Acceptance Criteria

- [x] The checklist template contains the complete contract sections above.
- [x] The validator rejects missing sections, placeholders, incomplete matrices, and unresolved
      blocking conflicts.
- [x] The validator accepts a complete happy and non-happy contract with explicit limitations.
- [x] Claude's edit gate validates the active contract before implementation edits.
- [x] OpenCode's plugin validates the active contract before implementation edits.
- [x] Portable skills remain synchronized and all focused and repository checks pass.

## Exact Test Cases

### TEST-CONTRACT-001: Reject a missing implementation contract

- Small task: Validate required contract headings.
- Source: This checklist's contract requirement.
- Test place: `scripts/implementation-contract.test.mjs`.
- Starting state: A checklist contains context and test cases but no implementation contract.
- Exact input or fixture: Markdown without `## Implementation Contract`.
- Interaction steps: Pass the checklist to the validator.
- Main behavior: Missing contract is rejected.
- Expected result: Validation fails and names the missing contract heading.
- Must change: Validator and test.
- Must not happen: A missing contract must not be accepted because exact test cases exist.
- Planned command: `node --test scripts/implementation-contract.test.mjs`
- Expected result before the code change: The validator and test do not exist.
- First observed run: Not run before implementation; the validator did not exist.
- Passing rerun: `node --test scripts/implementation-contract.test.mjs`

### TEST-CONTRACT-002: Reject missing route ownership and user journey

- Small task: Validate structural contract sections.
- Source: Required route and journey planning policy.
- Test place: `scripts/implementation-contract.test.mjs`.
- Starting state: A contract has feature boundaries and a test matrix but omits route ownership and
  user journey sections.
- Exact input or fixture: Contract missing `### Route-Group Ownership` and `### User Journey`.
- Interaction steps: Pass the checklist to the validator.
- Main behavior: Structural omissions are rejected.
- Expected result: Validation fails and names both missing sections.
- Must change: Validator and test.
- Must not happen: Generic references to routes or interaction steps must not satisfy the headings.
- Planned command: `node --test scripts/implementation-contract.test.mjs`
- Expected result before the code change: The validator and test do not exist.
- First observed run: Not run before implementation; the validator did not exist.
- Passing rerun: `node --test scripts/implementation-contract.test.mjs`

### TEST-CONTRACT-003: Reject happy-path-only coverage

- Small task: Validate complete branch coverage.
- Source: User requirement for happy and non-happy test cases.
- Test place: `scripts/implementation-contract.test.mjs`.
- Starting state: A user-facing contract contains one valid sign-in row and no rejected or recovery row.
- Exact input or fixture: Matrix with only `TEST-AUTH-001` for valid credentials.
- Interaction steps: Pass the checklist to the validator.
- Main behavior: Happy-path-only planning is rejected.
- Expected result: Validation fails because no non-happy path is present.
- Must change: Validator and test.
- Must not happen: A broad row named “errors” must not satisfy non-happy coverage.
- Planned command: `node --test scripts/implementation-contract.test.mjs`
- Expected result before the code change: The validator and test do not exist.
- First observed run: Not run before implementation; the validator did not exist.
- Passing rerun: `node --test scripts/implementation-contract.test.mjs`

### TEST-CONTRACT-004: Reject incomplete matrix rows and blocking conflicts

- Small task: Validate row completeness and conflict state.
- Source: Exact test-case and conflict policies.
- Test place: `scripts/implementation-contract.test.mjs`.
- Starting state: A matrix row lacks an expected result, and the conflict section records unresolved
  disagreement with blocked implementation items.
- Exact input or fixture: Incomplete `TEST-AUTH-002` row and `Status: blocked` conflict.
- Interaction steps: Pass the checklist to the validator.
- Main behavior: Implementation cannot proceed with incomplete evidence.
- Expected result: Validation fails and names the row and blocking conflict.
- Must change: Validator and test.
- Must not happen: Unresolved conflicts must not be treated as documentation-only notes.
- Planned command: `node --test scripts/implementation-contract.test.mjs`
- Expected result before the code change: The validator and test do not exist.
- First observed run: Not run before implementation; the validator did not exist.
- Passing rerun: `node --test scripts/implementation-contract.test.mjs`

### TEST-CONTRACT-005: Accept complete coverage with explicit limitations

- Small task: Validate a complete contract.
- Source: Required planning policy and E2E limitation rules.
- Test place: `scripts/implementation-contract.test.mjs`.
- Starting state: Contract has feature boundaries, route ownership, journey, valid sign-in, invalid
  credentials, API error, transport failure, malformed response, retry recovery, and a device-blocked
  limitation.
- Exact input or fixture: Complete contract fixture with unique `TEST-AUTH-*` rows.
- Interaction steps: Pass the checklist to the validator.
- Main behavior: Complete plans are accepted without requiring unsupported speculative behavior.
- Expected result: Validation succeeds.
- Must change: Validator and test.
- Must not happen: Explicit limitations must not be mistaken for missing coverage.
- Planned command: `node --test scripts/implementation-contract.test.mjs`
- Expected result before the code change: The validator and test do not exist.
- First observed run: Not run before implementation; the validator did not exist.
- Passing rerun: `node --test scripts/implementation-contract.test.mjs`

### TEST-CONTRACT-006: Gate implementation edits on the active contract

- Small task: Integrate contract validation with Claude and OpenCode edit paths.
- Source: Existing `scripts/skill-gate.mjs` and OpenCode plugin API.
- Test place: `scripts/skill-gate.test.mjs` and plugin unit test.
- Starting state: Implementation edit has required skills invoked but no valid active contract.
- Exact input or fixture: `apps/web/src/routes/auth.tsx` edit with missing or incomplete checklist.
- Interaction steps: Evaluate the edit gate and OpenCode hook.
- Main behavior: Skill invocation alone does not authorize implementation.
- Expected result: Both integrations deny the edit and identify the contract requirement.
- Must change: Gate, plugin, and tests.
- Must not happen: Plan-mode edits and checklist creation must remain possible.
- Planned command: `node --test scripts/implementation-contract.test.mjs scripts/skill-gate.test.mjs`
- Expected result before the code change: Existing path gate allows edits after skill invocation.
- First observed run: Existing gate allowed edits after skill invocation.
- Passing rerun: `node --test scripts/implementation-contract.test.mjs scripts/skill-gate.test.mjs`

## Implementation Plan

- [x] Add the contract section to `skills/test-first-workflow/templates/task-checklist.md`.
- [x] Add the validator module and focused acceptance/rejection tests.
- [x] Update planning guidance and policy tests to require the exact contract headings.
- [x] Integrate the validator into the Claude gate without blocking checklist edits or plan mode.
- [x] Add and test the OpenCode implementation-contract plugin.
- [x] Synchronize portable skill roots and run full validation.

## Risks and Constraints

- A Markdown validator can enforce structure and evidence fields, not product truth.
- The active checklist must be identifiable deterministically for edit-time enforcement.
- Plan-mode and checklist edits must remain available so agents can create the required contract.

## Validation Notes

- First observed and passing results will be recorded after each planned command runs.
