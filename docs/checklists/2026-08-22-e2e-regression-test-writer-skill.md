# Skill: E2E Regression Test Writer

- Checklist ID: CHECKLIST-20260822-e2e-regression-test-writer-skill
- Created: 2026-08-22
- Planning completed: 2026-08-22
- Type: Documentation
- Source request: Create a portable Playwright E2E regression-test-writing skill.
- Related checklists:
  - Origin: `None`
- Affected paths: `skills/e2e-regression-test-writer/`, synchronized skill roots, `.skills-sync.json`, and this checklist.
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Planning Record

- [x] Confirm the planning phase was completed before creating this checklist.
  - [x] Read the task request and applicable repository and skill guidance.
  - [x] Find the portable skill layout, synchronization, and validation rules.
  - [x] Split the work into small items that can each be validated on their own.
  - [x] Define exact cases, implementation steps, dependencies, and risks.
- [x] Confirm this checklist captures the completed plan before implementation begins.
  - [x] Keep implementation work in this checklist's nested items.
  - [x] Do not add a Playwright application, config, fixtures, or executable E2E tests in this task.

## Context and Scope

- [x] Create a portable skill that directs an agent to write user-facing Playwright regression tests after relevant UI work.
  - [x] Scope triggering to generated application projects; do not trigger for this template repository or its source/template maintenance.
  - [x] Keep `SKILL.md` concise and put the detailed journey checklist in `references/journey-checklist.md`.
  - [x] Include an example evaluation rubric without requiring a runnable Playwright project.
  - [x] Synchronize one canonical `skills/` copy to all provider roots.
  - [x] Non-goals: unit tests, API-only or backend-only work without a UI surface, cosmetic-only changes, unstable or mid-review flows, and visual screenshot regression.

## Implementation Description

Create `e2e-regression-test-writer` as a portable, instruction-only skill. Its metadata will explicitly trigger on newly implemented or modified user-facing flows, user-visible bug fixes, and explicit E2E/Playwright/regression-test requests. Its body will require existing-test discovery, journey reconstruction, independently runnable cases, resilient Playwright practices, and a self-review before reporting coverage and limitations.

## Acceptance Criteria

- [x] The skill has valid two-key frontmatter and the required portable layout.
- [x] The skill description accurately includes positive triggers and negative scope boundaries.
  - [x] Template-project maintenance is explicitly excluded from triggering.
- [x] The skill requires checking existing E2E conventions and extending existing coverage before creating duplicates.
- [x] The detailed reference covers journey reconstruction, test categories, selectors, waiting, isolation, assertions, and review.
- [x] The example rubric evaluates generated output quality without pretending this repository has a Playwright runner.
- [x] All four skill roots and `.skills-sync.json` are synchronized from the canonical root.
- [x] Repository skill tests and formatting checks pass.

## Small Task Breakdown

- [x] Define the canonical skill metadata and lean workflow.
  - [x] Add exact positive triggers for implemented, modified, and bug-fixed user flows plus explicit requests.
    - Test IDs: `TEST-SKILL-002`, `TEST-SKILL-003`
  - [x] Add exact non-goals for template maintenance, cosmetic, backend-only, unstable, and visual-only work.
    - Test IDs: `TEST-SKILL-003`, `TEST-SKILL-010`
- [x] Add detailed reusable guidance.
  - [x] Describe existing-test lookup and update-before-create behavior.
    - Test IDs: `TEST-SKILL-005`
  - [x] Describe journey reconstruction, separate case design, Playwright practices, and self-review.
    - Test IDs: `TEST-SKILL-004`, `TEST-SKILL-006`, `TEST-SKILL-007`, `TEST-SKILL-008`
- [/] Add a representative behavioral evaluation rubric.
  - [x] Provide a sample login/password-reset feature prompt and objective output checks.
  - [ ] Execute the rubric against a real generated Playwright project (deferred until that project exists).
    - Test IDs: `TEST-SKILL-009`
- [x] Synchronize and validate the portable skill.
  - [x] Verify the canonical source is copied byte-for-byte to all roots.
    - Test IDs: `TEST-SKILL-001`, `TEST-SKILL-011`

## Rules and Open Questions

- [x] The canonical editable source is `skills/<skill-name>/`; synchronization projects it to `.agents/skills/`, `.claude/skills/`, and `.opencode/skills/`.
  - Source: `skills/create-portable-skill/SKILL.md`, `scripts/skills.mjs`
  - Test IDs: `TEST-SKILL-001`, `TEST-SKILL-011`
- [x] Every portable skill must contain `SKILL.md`, `scripts/`, `references/`, `assets/`, `templates/`, and `examples/`.
  - Source: `skills/create-portable-skill/references/portable-skill-standard.md`, `scripts/skills.mjs`
  - Test IDs: `TEST-SKILL-001`
- [x] No Playwright app, config, fixtures, CI tags, or executable E2E test files are part of this task.
  - Source: user clarification and repository discovery
  - Test IDs: `TEST-SKILL-009`, `TEST-SKILL-010`
- [x] The skill applies to generated application projects, not the template repository that distributes it.
  - Source: user clarification during implementation
  - Test IDs: `TEST-SKILL-003`, `TEST-SKILL-010`
- [x] No open questions block implementation.

## Small Task and Test Map

| Small task or rule                    | Source                               | Test IDs                                                               | Ready or missing detail      |
| ------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------- | ---------------------------- |
| Portable metadata and layout          | Portable skill standard              | `TEST-SKILL-001`                                                       | Ready                        |
| Positive and negative triggers        | User-defined trigger specification   | `TEST-SKILL-002`, `TEST-SKILL-003`                                     | Ready                        |
| Existing-test discovery               | User review and requested behavior   | `TEST-SKILL-005`                                                       | Ready                        |
| Journey and test-case guidance        | User-provided skill prompt           | `TEST-SKILL-004`, `TEST-SKILL-006`, `TEST-SKILL-007`, `TEST-SKILL-008` | Ready                        |
| Example output rubric                 | User review; no local Playwright app | `TEST-SKILL-009`                                                       | Ready with manual evaluation |
| Scope boundaries                      | User clarification                   | `TEST-SKILL-010`                                                       | Ready                        |
| Synchronization and repository checks | Repository scripts                   | `TEST-SKILL-011`                                                       | Ready                        |

## Exact Test Cases

- [x] TEST-SKILL-001: The skill has the required portable structure and valid metadata.
  - Small task: Define the canonical skill metadata and lean workflow.
  - Source: `skills/create-portable-skill/references/portable-skill-standard.md` and `scripts/skills.mjs`.
  - Test place: Portable skill validator, `pnpm skills:check`.
  - Starting state: The new canonical skill and synchronized copies exist.
  - Exact input or fixture: Folder name `e2e-regression-test-writer`; frontmatter keys exactly `name` and `description`.
  - Interaction steps: Run the skill validator against all synchronized roots.
  - Main behavior: The skill is accepted as a portable skill.
  - Expected result: Validation succeeds and all five resource directories exist.
  - Must change: The new skill tree and synchronization manifest.
  - Must not happen: Extra frontmatter keys, unsupported root directories, or missing resource directories.
  - Planned command: `pnpm skills:check`
  - Expected result before the code change: The new skill is absent, so this specific skill cannot yet be validated.
  - First observed run: `pnpm skills:check` passed before implementation and validated the existing 16 portable skills; the new skill was not yet present.
  - Passing rerun: `pnpm skills:check` passed after synchronization and validated 17 portable skills.
- [x] TEST-SKILL-002: A newly implemented user-facing flow triggers the skill.
  - Small task: Define exact positive triggers.
  - Source: User trigger specification.
  - Test place: Description and Automatic Triggers text scan.
  - Starting state: A feature agent has just implemented a checkout form.
  - Exact input or fixture: Prompt: `I just finished implementing the checkout form and payment confirmation flow.`
  - Interaction steps: Evaluate the skill description and trigger section against the prompt.
  - Main behavior: The skill is applicable without an explicit test request.
  - Expected result: The instructions direct the agent to write Playwright regression tests.
  - Must change: Skill metadata and trigger instructions.
  - Must not happen: The trigger must not require the user to repeat an explicit E2E request.
  - Planned command: `pnpm skills:test`
  - Expected result before the code change: No matching skill exists.
  - First observed run: No matching skill existed before implementation.
  - Passing rerun: `pnpm skills:test` passed; generated-project trigger wording is present in the canonical and synchronized skill.
- [x] TEST-SKILL-003: Explicit requests in generated projects trigger the skill while unrelated or template-repository work does not.
  - Small task: Define positive triggers and non-goals.
  - Source: User trigger and non-goal specification.
  - Test place: Description and trigger-boundary text scan.
  - Starting state: Evaluate positive and negative request examples independently.
  - Exact input or fixture: Positive generated-project request: `write Playwright tests for this flow`; negative: `update this template repository skill`; negative: `update this CSS color`; negative: `add unit tests for this database utility`.
  - Interaction steps: Compare each request with the metadata description and non-goal rules.
  - Main behavior: Trigger accuracy is bounded rather than universally broad.
  - Expected result: Positive generated-project requests apply; template maintenance, cosmetic, and backend/unit-only requests do not.
  - Must change: Trigger description and non-goal wording.
  - Must not happen: The skill must not claim ownership of unit, API-only, or visual regression testing.
  - Planned command: `pnpm skills:test`
  - Expected result before the code change: No trigger-boundary rules exist.
  - First observed run: No trigger-boundary rules existed before implementation.
  - Passing rerun: `pnpm skills:test` passed; generated-project scope and template-maintenance exclusion are present in `SKILL.md`.
- [x] TEST-SKILL-004: The agent reconstructs the journey before writing tests.
  - Small task: Describe journey reconstruction.
  - Source: User-provided Skill Prompt, Step 1.
  - Test place: `references/journey-checklist.md` exact text scan.
  - Starting state: A modified password-reset flow has a known implementation.
  - Exact input or fixture: Entry point, actions, branches, success criteria, and failure modes.
  - Interaction steps: Read the reference checklist before drafting test cases.
  - Main behavior: Test planning is based on the actual implemented user journey.
  - Expected result: All five journey elements are explicitly captured.
  - Must change: Reference checklist.
  - Must not happen: The agent must not guess behavior from generic assumptions.
  - Planned command: `pnpm skills:test`
  - Expected result before the code change: No reference checklist exists.
  - First observed run: No reference checklist existed before implementation.
  - Passing rerun: `pnpm skills:test` passed and `references/journey-checklist.md` contains all five journey elements.
- [x] TEST-SKILL-005: Existing E2E coverage is found and extended before a new file is created.
  - Small task: Require duplicate-test prevention.
  - Source: User review and requested existing-test behavior.
  - Test place: `references/journey-checklist.md` exact text scan.
  - Starting state: The project already has an E2E file covering the same checkout journey.
  - Exact input or fixture: Existing `tests/e2e/checkout.spec.ts` and matching `test.describe` block.
  - Interaction steps: Inspect the project’s Playwright config, test directories, fixtures, and matching describe blocks.
  - Main behavior: Coverage is updated in the existing convention.
  - Expected result: The instructions say to extend or update matching coverage rather than create a parallel duplicate.
  - Must change: Reference checklist.
  - Must not happen: A second test file must not be created solely because the flow changed.
  - Planned command: `pnpm skills:test`
  - Expected result before the code change: Duplicate-test prevention is not documented.
  - First observed run: Duplicate-test prevention was not documented.
  - Passing rerun: `pnpm skills:test` passed and the reference requires config, directory, fixture, and matching-block lookup before file creation.
- [x] TEST-SKILL-006: Test cases are separated by user intent and relevant branch.
  - Small task: Describe case design.
  - Source: User-provided Skill Prompt, Step 2.
  - Test place: `references/journey-checklist.md` exact text scan.
  - Starting state: A form has valid, invalid, empty, permission, and regression paths.
  - Exact input or fixture: One case each for valid submission, invalid input, empty result, signed-out access, and the fixed bug.
  - Interaction steps: Map each intent to an independently runnable Playwright test.
  - Main behavior: The suite avoids mega-tests and missing branches.
  - Expected result: The reference requires separate named cases for applicable categories.
  - Must change: Reference checklist.
  - Must not happen: Unrelated branches must not be hidden in one test.
  - Planned command: `pnpm skills:test`
  - Expected result before the code change: Case categories are not documented.
  - First observed run: Case categories were not documented.
  - Passing rerun: `pnpm skills:test` passed and the reference separates applicable success, alternate, validation, edge, permission, and regression cases.
- [x] TEST-SKILL-007: Generated tests use resilient Playwright practices.
  - Small task: Describe selectors, waits, isolation, and assertions.
  - Source: User-provided Skill Prompt, Step 3.
  - Test place: `references/journey-checklist.md` exact text scan.
  - Starting state: A generated test targets a user-facing form.
  - Exact input or fixture: Accessible roles/labels, fixture setup, web-first assertions, and no arbitrary delays.
  - Interaction steps: Inspect the generated test against the reference rubric.
  - Main behavior: The test observes the UI as a user would.
  - Expected result: Instructions prefer accessible locators, auto-waiting, isolated data, and user-visible assertions.
  - Must change: Reference checklist and example rubric.
  - Must not happen: CSS/XPath structure selectors or `page.waitForTimeout()` must not be recommended.
  - Planned command: `pnpm skills:test`
  - Expected result before the code change: Playwright quality rules are not present.
  - First observed run: Playwright quality rules were not present.
  - Passing rerun: `pnpm skills:test` passed and the reference forbids arbitrary waits and brittle selectors while requiring user-facing assertions.
- [x] TEST-SKILL-008: The self-review requires coverage and reliability checks.
  - Small task: Describe the final review.
  - Source: User-provided Skill Prompt, Step 4.
  - Test place: `references/journey-checklist.md` exact text scan.
  - Starting state: A candidate test file has been drafted.
  - Exact input or fixture: Journey coverage, failure behavior, selectors, waits, isolation, naming, and limitations.
  - Interaction steps: Apply every self-review item before presenting the test file.
  - Main behavior: The skill catches incomplete or flaky output before handoff.
  - Expected result: The checklist requires explicit review of each listed quality condition.
  - Must change: Reference checklist.
  - Must not happen: A happy-path-only test must not be treated as complete.
  - Planned command: `pnpm skills:test`
  - Expected result before the code change: No self-review checklist exists.
  - First observed run: No self-review checklist existed.
  - Passing rerun: `pnpm skills:test` passed and the reference includes coverage, reliability, isolation, selector, and limitation checks.
- [/] TEST-SKILL-009: The example rubric evaluates a representative output without a local Playwright app.
  - Small task: Add a behavioral evaluation example.
  - Source: User review and repository discovery.
  - Test place: `examples/login-flow-evaluation.md` and manual skill evaluation.
  - Starting state: No Playwright config, app, fixture, or E2E directory exists in this repository.
  - Exact input or fixture: A login/password-reset feature prompt and rubric for user journeys, edge cases, auth, selectors, waits, isolation, and assertions.
  - Interaction steps: Use the example request with the skill, then compare the produced test plan/file to the rubric.
  - Main behavior: The skill’s intended output quality is testable without pretending it is executable here.
  - Expected result: The rubric identifies pass/fail criteria and explicitly records unavailable environment dependencies.
  - Must change: Example evaluation file.
  - Must not happen: No Playwright app or fake test-run result must be added.
  - Planned command: Manual agent evaluation using `examples/login-flow-evaluation.md`.
  - Expected result before the code change: No evaluation example exists.
  - First observed run: No evaluation example existed.
  - Passing rerun: The rubric file exists and is formatted; execution against a generated Playwright project is deferred because none exists yet.
- [x] TEST-SKILL-010: Explicit non-goals prevent scope creep.
  - Small task: State non-goals in metadata and instructions.
  - Source: User clarification.
  - Test place: `SKILL.md` exact text scan.
  - Starting state: A request concerns CSS-only changes, backend-only code, unstable flows, or screenshot diffs.
  - Exact input or fixture: Template-project maintenance, CSS-only changes, backend-only code, unstable flows, and screenshot diffs.
  - Interaction steps: Read the skill metadata and non-goal section.
  - Main behavior: The skill remains scoped to stable user-facing Playwright regression work.
  - Expected result: Each non-goal, including template-project maintenance, is explicitly excluded.
  - Must change: Skill metadata and body.
  - Must not happen: The skill must not broaden into unit, contract, visual, or premature design-locking tests.
  - Planned command: `pnpm skills:test`
  - Expected result before the code change: Non-goals are not represented.
  - First observed run: Non-goals were not represented.
  - Passing rerun: `pnpm skills:test` passed and `SKILL.md` excludes template maintenance, cosmetic, backend/unit, unstable, and visual work.
- [x] TEST-SKILL-011: Synchronization and repository validation pass.
  - Small task: Synchronize and validate the portable skill.
  - Source: Repository scripts and `AGENTS.md`.
  - Test place: Repository validation commands.
  - Starting state: Canonical skill files are authored and provider roots may be stale.
  - Exact input or fixture: Four skill roots and `.skills-sync.json`.
  - Interaction steps: Run sync, skill checks, skill tests, and formatting checks.
  - Main behavior: The repository accepts the new skill and detects drift.
  - Expected result: Every command exits successfully and the four copies are byte-identical.
  - Must change: Synchronized skill roots and manifest only.
  - Must not happen: No unrelated files or divergent provider-specific copies.
  - Planned command: `pnpm skills:sync && pnpm skills:check && pnpm skills:test && pnpm format:check`
  - Expected result before the code change: The new skill is not included in synchronization.
  - First observed run: The new skill was not included in synchronization.
  - Passing rerun: `pnpm skills:sync`, `pnpm skills:check`, `pnpm skills:test`, and `pnpm format:check` all passed; 17 skills are synchronized and all 97 skill tests pass.

## Missing-Case Review

- [x] Normal valid values and successful results: Covered conceptually by `TEST-SKILL-006` and the example rubric in `TEST-SKILL-009`.
- [x] Validation, empty, permission, error, and regression branches: Covered by `TEST-SKILL-006` and `TEST-SKILL-008`.
- [x] Exact input boundaries, nulls, wrong types, and persistence: Not applicable; this task defines a skill, not an application contract.
- [x] Loading, empty, success, retry, and error views: Covered as required output categories in `TEST-SKILL-008`; execution is deferred until a Playwright app exists.
- [x] External systems and uncontrolled requests: Not applicable; no executable tests or external integrations are added.
- [x] Confirm no broad case hides situations that could pass or fail separately.
- [x] Confirm no observed test result was written before its command ran.

## Implementation Plan

- [x] Create the canonical portable skill.
  - [x] Scaffold `skills/e2e-regression-test-writer/` with the repository command.
    - [x] Use the exact skill name and approved description.
    - [x] Preserve all five required resource directories and do not add speculative scripts.
  - [x] Replace the generated `SKILL.md` body.
    - [x] Add Automatic Triggers with positive triggers and explicit non-goals.
    - [x] Require existing Playwright convention and duplicate-coverage lookup.
    - [x] Point to `references/journey-checklist.md`.
  - [x] Add `references/journey-checklist.md`.
    - [x] Add journey reconstruction, case design, implementation, waiting, selector, isolation, assertion, and self-review guidance.
  - [x] Add `examples/login-flow-evaluation.md`.
    - [x] Include a representative prompt, expected rubric, and limitation note for the absent Playwright app.
- [x] Synchronize the canonical skill.
  - [x] Run `pnpm skills:sync` so all provider roots are copied from the canonical source.
  - [x] Confirm `.skills-sync.json` includes the new skill hash.
- [x] Validate the completed skill.
  - [x] Run `pnpm skills:check`.
  - [x] Run `pnpm skills:test`.
  - [x] Run `pnpm format:check`.
  - [x] Review the complete diff and re-scan this checklist.

## Verification

- [x] Record each planned command result against its test ID.
- [x] Record validation failures before correcting them.
- [x] Record passing reruns before marking cases complete.
- [/] Run the manual example evaluation and report that no runnable Playwright app exists yet. The rubric is present; execution is deferred until a generated Playwright project exists.
- [x] Review the complete diff and re-scan this checklist for stale items.

## Validation Notes

Baseline: `pnpm skills:check` passed before implementation, validating the existing 16 portable skills.

Failure resolved: targeted `pnpm exec prettier --check "skills/e2e-regression-test-writer/**/*.md" "docs/checklists/2026-08-22-e2e-regression-test-writer-skill.md"` initially found formatting issues. Prettier fixed them; the targeted check and full `pnpm format:check` now pass.

Final validation: `pnpm skills:check` validated 17 synchronized skills, `pnpm skills:test` passed all 97 tests, and `pnpm format:check` passed.

## Risks and Follow-Up

- [x] Behavioral evaluation is rubric-based for this task because the repository has no Playwright app or skill-runtime harness; execute the generated tests when that app is created.
- [ ] Playwright tags remain deferred until a target project exposes an established CI tagging convention.
