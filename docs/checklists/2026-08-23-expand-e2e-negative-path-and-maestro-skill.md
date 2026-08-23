# Expand E2E Negative Paths and Add Maestro Writing Skill

- Checklist ID: CHECKLIST-20260823-E2E-NEGATIVE-PATHS-MAESTRO-SKILL
- Created: 2026-08-23
- Type: Portable skill and documentation
- Related prior records: `docs/checklists/2026-08-22-e2e-regression-test-writer-skill.md`,
  `docs/checklists/2026-08-23-add-maestro-mobile-e2e.md`
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Acceptance Criteria

- [x] Playwright guidance requires all reachable, applicable non-happy paths and explicit limitation
      reporting.
- [x] Both E2E writing skills require dedicated deterministic test data seeded for test preconditions.
- [x] A portable `maestro-mobile-e2e-test-writer` skill exists in all four skill roots.
- [x] The Maestro skill carries forward the previous implementation's navigation smoke, Todos CRUD,
      runner lifecycle, platform commands, and established selector conventions.
- [x] Skill validation, skill tests, and formatting pass.
- [x] No executable application E2E flows or device-dependent tests are added by this task.

## Small Task Breakdown

### 1. Expand Playwright guidance

- [x] Update the canonical Playwright skill and journey checklist.
  - [x] Require separate cases for every reachable applicable validation, empty, loading, retry,
        timeout, dependency, authorization, duplicate, conflict, recovery, and regression branch.
  - [x] Require a documented limitation when a branch cannot be executed or is not supported.
  - [x] Require dedicated deterministic seeded fixtures for preconditions, separate from demo data.
  - [x] Preserve per-run generated data only for records created or mutated by the test.

### 2. Add the Maestro writing skill

- [x] Scaffold `skills/maestro-mobile-e2e-test-writer/` with the required portable structure.
- [x] Add concise metadata and workflow for generated Expo/React Native projects using Maestro YAML.
- [x] Add a mobile journey checklist covering platform matrices, selectors, lifecycle, polling,
      seeded fixtures, generated mutation data, cleanup, and all applicable negative paths.
- [x] Add a representative evaluation example without pretending this template has device execution.
- [x] Include the existing `apps/maestro` runner, flow, command, and selector conventions as a
      concrete reference without making device execution part of this task.

### 3. Record historical correction and synchronize

- [x] Append a dated update to the prior Maestro checklist linking this checklist.
- [x] Run skill synchronization and verify all four roots and `.skills-sync.json` agree.

## Exact Test Cases

### TEST-E2E-001: Playwright guidance requires complete applicable negative-path coverage

- Small task: Expand Playwright guidance.
- Source: User requirement for all possible non-happy paths.
- Test place: Canonical skill and journey checklist text scan.
- Starting state: Guidance lists applicable categories but does not require a complete branch inventory.
- Exact input or fixture: A flow with validation, empty, loading, retry, timeout, dependency,
  authorization, duplicate, conflict, recovery, and regression branches.
- Interaction steps: Read the guidance and compare each reachable branch with the required test plan.
- Main behavior: Every applicable branch is assigned its own case or documented limitation.
- Expected result: The guidance rejects happy-path-only coverage and speculative unsupported cases.
- Must change: Canonical Playwright skill resources.
- Must not happen: The guidance must not claim that one broad negative-path test is sufficient.
- Planned command: `pnpm skills:test`
- Expected result before the code change: Existing wording does not explicitly require complete
  reachable-branch accounting.
- First observed run: Baseline `pnpm skills:test` passed before the guidance update.
- Passing rerun: `pnpm skills:test` passed after the update; 101 tests passed.

### TEST-E2E-002: E2E guidance requires dedicated seeded test data

- Small task: Add deterministic seed-fixture guidance.
- Source: User requirement and repository database-seeding convention.
- Test place: Both E2E skill resources and exact text scan.
- Starting state: E2E guidance mentions fixtures and test-data setup but does not require data seeded
  specifically for testing.
- Exact input or fixture: Stable records for populated, ownership, permission, duplicate, boundary,
  and error scenarios, plus unique per-run mutation data.
- Interaction steps: Inspect both skills for seed setup, isolation, rerun safety, and generated-data
  boundaries.
- Main behavior: Tests use dedicated test fixtures for preconditions rather than leftover demo state.
- Expected result: Both skills require deterministic, isolated, repeatable test seeding and distinguish
  seeded preconditions from generated records created by the test.
- Must change: Playwright and Maestro skill guidance.
- Must not happen: Tests must not rely on production, demo, or leftover state.
- Planned command: `pnpm skills:test`
- Expected result before the code change: No dedicated mobile skill exists and Playwright guidance is
  insufficiently explicit about seeded test data.
- First observed run: Baseline `pnpm skills:check` passed with 17 skills before the new skill existed.
- Passing rerun: `pnpm skills:check` passed with 18 synchronized skills.

### TEST-E2E-003: Maestro skill has portable structure and mobile workflow guidance

- Small task: Add the Maestro mobile writing skill.
- Source: Portable skill standard and existing `apps/maestro` package conventions.
- Test place: `skills/maestro-mobile-e2e-test-writer/` and synchronized roots.
- Starting state: `pnpm e2e:mobile` exists, but no dedicated writing skill exists.
- Exact input or fixture: Maestro YAML flows, iOS and Android targets, Expo Go deep links, seeded
  fixtures, visible labels, limited test IDs, and no arbitrary sleeps.
- Interaction steps: Validate metadata/layout, read the workflow and reference checklist, then compare
  all four provider copies.
- Main behavior: An agent can author deterministic Maestro coverage for a generated mobile flow.
- Expected result: The skill describes discovery, independent flows, complete applicable success and
  failure coverage, seed setup, platform execution, cleanup, and limitations.
- Must change: New canonical skill and synchronized copies.
- Must not happen: Add provider-specific frontmatter, executable scripts, or device tests.
- Planned command: `pnpm skills:check`
- Expected result before the code change: The new skill is absent and cannot be validated.
- First observed run: The initial post-scaffold skill had no continuity guidance.
- Passing rerun: `pnpm skills:test` passed after adding the previous implementation's flow, runner,
  command, and selector conventions.

### TEST-E2E-004: Maestro guidance preserves the previous implementation plan

- Small task: Carry forward the existing Maestro implementation conventions.
- Source: `docs/checklists/2026-08-23-add-maestro-mobile-e2e.md` and `apps/maestro/AGENTS.md`.
- Test place: Maestro skill and reference checklist text scan.
- Starting state: Existing implementation has navigation smoke, Todos CRUD, platform scripts, runner
  cleanup, and four established input IDs, but no authoring skill references them.
- Exact input or fixture: `mobile-navigation.yaml`, `todos-crud.yaml`, `test:ios`, `test:android`,
  combined `test`, runner startup/readiness/cleanup, and the four `todos-*` IDs.
- Interaction steps: Read the new skill and verify each previous-plan convention is actionable.
- Main behavior: Future agents extend the implemented mobile test architecture instead of replacing it.
- Expected result: The skill requires preserving both flows, runner lifecycle, platform commands, and
  selector conventions.
- Must change: Maestro skill resources and checklist.
- Must not happen: The skill must not recommend duplicate runners, coordinate taps, arbitrary sleeps,
  or selector changes that alter the existing flow contract.
- Planned command: `pnpm skills:test`
- Expected result before the code change: The new skill has no repository-specific implementation
  continuity guidance.
- First observed run: `pnpm skills:check` passed after synchronization; formatting then failed on
  line wrapping in the updated Playwright copies.
- Passing rerun: `pnpm skills:check`, `pnpm skills:test`, and `pnpm format:check` all passed after
  formatting and synchronization.

### TEST-E2E-005: Skill synchronization and repository formatting pass

- Small task: Synchronize and validate the changes.
- Source: Repository skill synchronization rules.
- Test place: Four skill roots, `.skills-sync.json`, and repository formatting.
- Starting state: Only the existing skills are synchronized.
- Exact input or fixture: Updated Playwright skill plus new Maestro skill tree.
- Interaction steps: Synchronize, validate, run skill tests, and check formatting.
- Main behavior: Portable skill sources remain byte-identical and repository checks accept the changes.
- Expected result: All commands pass and only intended skill/checklist files change.
- Must change: Synchronized skill roots and manifest.
- Must not happen: No package manifests, lockfiles, application flows, or unrelated files change.
- Planned command: `pnpm skills:sync && pnpm skills:check && pnpm skills:test && pnpm format:check`
- Expected result before the code change: The new skill is not synchronized; baseline checks should pass.
- First observed run: `pnpm skills:check` failed because the canonical Playwright skill differed from
  its synchronized provider copies after the guidance update.
- Passing rerun:

## Implementation Plan

1. [x] Run the planned baseline validation and record its result.
2. [x] Update the canonical Playwright skill and reference checklist with complete applicable negative-path
       accounting and dedicated seeded test-data requirements.
3. [x] Scaffold and author `maestro-mobile-e2e-test-writer` using the portable skill layout.
4. [x] Append the historical Maestro checklist update and link this checklist.
5. [x] Synchronize all provider roots, run focused validation, record failures before fixes, and rerun.

## Risks and Constraints

- “All possible” means all behaviorally reachable and applicable branches; speculative unsupported
  product behavior must not become invented tests.
- Maestro execution remains device and CLI dependent; this task only adds authoring guidance.
- Seeded preconditions and generated per-run mutation data must remain distinct.

## Validation Notes

- Baseline before implementation: `pnpm skills:check`, `pnpm skills:test`, and `pnpm format:check`
  passed; 17 portable skills were validated and 101 tests passed.
- Failure recorded before correction: the first post-edit `pnpm skills:check` detected stale
  synchronized Playwright copies, as expected before synchronization.
- Second validation failure recorded before correction: synchronized validation passed, but
  `pnpm format:check` found line-wrap differences in the four updated Playwright `SKILL.md` copies.
- Final checklist-edit validation failure recorded before correction: `pnpm format:check` found
  formatting differences in this newly updated checklist.
