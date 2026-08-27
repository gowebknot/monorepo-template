# Agent Skill Enforcement

- Checklist ID: CHECKLIST-20260827-AGENT-SKILL-ENFORCEMENT
- Created: 2026-08-27
- Type: Agent configuration and portable skill guidance
- Related records: `docs/checklists/2026-08-24-domain-driven-app-structure-skill-correction.md`, `docs/checklists/2026-08-23-expand-e2e-negative-path-and-maestro-skill.md`
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Problem

The Claude hook checks whether skills were invoked before edits, but OpenCode has no equivalent
project agent policy. Neither mechanism verifies that the agent produced a feature boundary, route
ownership decision, complete branch matrix, or conflict decision before implementation.

## Acceptance Criteria

- [x] OpenCode's build agent requires the planning, conflict, route-ownership, and branch-matrix
      workflow before implementation edits.
- [x] `test-first-workflow` requires a small implementation contract that records feature boundaries,
      route ownership, reachable branches, test IDs, and source conflicts.
- [x] `domain-driven-app-structure` explicitly requires route-group ownership and feature mapping.
- [x] Playwright and Maestro guidance triggers during planning of user-facing behavior, not only after
      a stable flow has been implemented.
- [x] All portable skill roots remain synchronized and repository validation passes.

## Exact Test Cases

### TEST-AGENT-001: OpenCode build policy requires the implementation contract

- Small task: Add an OpenCode build-agent policy.
- Source: User requirement that agents, rather than the user, enforce conventions.
- Test place: `.opencode/agents/build.md` exact text scan.
- Starting state: No project build-agent policy exists; OpenCode falls back to its generic build agent.
- Exact input or fixture: A user-facing feature involving routes, forms, and failure states.
- Interaction steps: Read the project build-agent policy and compare its required pre-edit steps with
  the feature fixture.
- Main behavior: The build agent must plan boundaries, route ownership, branches, and conflicts before
  editing.
- Expected result: The policy names the implementation contract, required skills, user-instruction
  precedence, and the no-edit-until-plan rule.
- Must change: `.opencode/agents/build.md`.
- Must not happen: The policy must not claim that skill invocation alone proves compliance.
- Planned command: `pnpm format:check`
- Expected result before the code change: The build-agent policy file is absent.
- First observed run: Baseline `pnpm skills:check && pnpm skills:test && pnpm format:check` passed before implementation; 104 tests passed.
- Passing rerun: `.opencode/agents/build.md` contains the required policy and `pnpm format:check` passed.

### TEST-AGENT-002: Planning guidance requires route and branch accounting

- Small task: Strengthen `test-first-workflow`.
- Source: User-reported missed route groups and sign-in non-happy paths.
- Test place: Canonical skill and synchronized copies; exact text scan and skill tests.
- Starting state: The workflow requires exact cases but does not name route ownership or an explicit
  implementation contract.
- Exact input or fixture: Welcome and sign-in routes with invalid credentials, transport failure, API
  error, malformed response, and retry behavior.
- Interaction steps: Inspect the planning requirements and compare each route, feature, and branch with
  a contract field and test ID.
- Main behavior: Planning identifies ownership and every reachable branch before implementation.
- Expected result: The guidance requires a contract, route-to-feature map, branch inventory, and
  unresolved-conflict record.
- Must change: Canonical `test-first-workflow` skill and synchronized copies.
- Must not happen: A broad "add tests" item or happy-path-only plan must not be considered complete.
- Planned command: `pnpm skills:check && pnpm skills:test`
- Expected result before the code change: The new contract and route-ownership terms are absent.
- First observed run: Baseline skill tests passed before the contract guidance update; the new terms were absent.
- Passing rerun: `pnpm skills:check` and `pnpm skills:test` passed after synchronization; 104 tests passed.

### TEST-AGENT-003: Architecture guidance requires route-group ownership

- Small task: Clarify route and feature ownership.
- Source: `domain-driven-app-structure` and the reported grouped-route failure.
- Test place: Canonical architecture skill and source-layout reference; exact text scan.
- Starting state: The reference shows route folders but does not require a route-to-feature ownership
  decision before creating or moving files.
- Exact input or fixture: `(auth)` and `(welcome)` route groups with corresponding `auth` and `welcome`
  feature directories.
- Interaction steps: Read the architecture guidance and map each route group to one feature owner.
- Main behavior: Routes are organized by product boundary rather than incidental screen names.
- Expected result: The skill requires recording route groups, feature owners, shared-shell ownership,
  and the rule that route modules compose feature components.
- Must change: Canonical architecture skill and synchronized copies.
- Must not happen: A route file must not become the only owner of feature behavior by default.
- Planned command: `pnpm skills:check && pnpm skills:test`
- Expected result before the code change: No explicit route-group ownership rule exists.
- First observed run: Baseline skill tests passed before the route-ownership guidance update; no explicit route-group rule existed.
- Passing rerun: `pnpm skills:check` and `pnpm skills:test` passed after synchronization; 104 tests passed.

### TEST-AGENT-004: E2E skills trigger during planning

- Small task: Move E2E guidance to the planning boundary.
- Source: User requirement for non-happy-path test cases and existing E2E skills.
- Test place: Playwright and Maestro skill metadata and workflow text.
- Starting state: Both skills primarily describe post-implementation regression authoring.
- Exact input or fixture: A new authentication flow with invalid credentials, API error, transport
  failure, malformed response, and retry recovery.
- Interaction steps: Inspect the trigger descriptions and workflow order before implementation.
- Main behavior: E2E expectations influence implementation planning while the user journey is designed.
- Expected result: Both skills require branch inventory during planning and regression flow authoring after
  the behavior is stable.
- Must change: Canonical E2E and Maestro skills and synchronized copies.
- Must not happen: E2E coverage must not be deferred until after architecture and failure behavior are
  already fixed by user feedback.
- Planned command: `pnpm skills:check && pnpm skills:test`
- Expected result before the code change: The skills describe a QA pass after a stable flow only.
- First observed run: Baseline skill tests passed before the E2E trigger guidance update; the skills described post-stability authoring.
- Passing rerun: `pnpm skills:check` and `pnpm skills:test` passed after synchronization; 104 tests passed.

### TEST-AGENT-005: Synchronization and formatting

- Small task: Synchronize and validate the guidance and OpenCode policy.
- Source: Repository skill synchronization and formatting rules.
- Test place: Four skill roots, `.skills-sync.json`, and changed Markdown files.
- Starting state: Existing skill roots are synchronized before this change.
- Exact input or fixture: Updated canonical skills and `.opencode/agents/build.md`.
- Interaction steps: Synchronize the skills, run the checker, run skill tests, and run formatting.
- Main behavior: Every supported agent receives identical portable guidance and config remains valid.
- Expected result: All checks pass and only intended files change.
- Must change: Synchronized skill roots and manifest, plus the OpenCode agent policy.
- Must not happen: No application runtime or test-flow behavior changes.
- Planned command: `pnpm skills:sync && pnpm skills:check && pnpm skills:test && pnpm format:check`
- Expected result before the code change: The updated canonical skills are not yet synchronized.
- First observed run: `pnpm skills:sync` and `pnpm skills:check && pnpm skills:test` passed; `pnpm format:check` failed because Prettier wrapped the updated Playwright metadata in all four synchronized copies. After formatting, `pnpm skills:check` failed because `.skills-sync.json` still contained the pre-format hashes.
- Passing rerun: `pnpm skills:sync && pnpm skills:check && pnpm skills:test && pnpm format:check` passed; 19 skills validated and 104 tests passed.

## Implementation Plan

- [x] Add `.opencode/agents/build.md` with mandatory pre-edit workflow and conflict precedence.
- [x] Update canonical `test-first-workflow` with the implementation-contract requirement.
- [x] Update canonical domain architecture guidance with route-group ownership.
- [x] Update canonical Playwright and Maestro triggers and workflow timing.
- [x] Synchronize all four portable skill roots.
- [x] Run focused and repository validation, recording failures before fixes. Skill synchronization, 104 skill tests, and formatting pass after the recorded formatting and manifest corrections.

## Risks and Constraints

- OpenCode agent instructions are a behavioral guardrail, not a hard runtime validator.
- The existing Claude gate remains path-based and should not be weakened.
- Existing reference Todos guidance remains valid for this template's reference app unless product
  scope explicitly changes; it is not silently removed by this enforcement task.

## Validation Notes

- Validation completed: baseline checks passed before edits; formatting first failed on synchronized E2E metadata, then skill hashes failed after formatting, and both were corrected and rerun successfully.
