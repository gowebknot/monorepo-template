# Feature: Selectable TUI Presets

- Checklist ID: CHECKLIST-20260811-tui-selectable-presets
- Created: 2026-08-11
- Planning completed: 2026-08-11
- Type: Feature
- Source request: Make every create-mono-stack TUI field selectable instead of requiring typing.
- Related checklists:
  - Origin: `None`
- Affected paths: `core/create-mono-stack/src/interactive-wizard.js`, `core/create-mono-stack/test/interactive-wizard.test.js`
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Planning Record

- [x] Confirm the planning phase was completed before creating this checklist.
  - [x] Read the task request and applicable repository and package guidance.
  - [x] Define acceptance criteria, validation cases, implementation approach, dependencies, and risks.
- [x] Confirm this checklist captures the completed plan before implementation begins.
  - [x] Keep implementation work in this checklist's nested items.
  - [x] Add a checklist item before making any scope or approach change.

## Context and Scope

- [x] Replace routine free-form prompts with arrow-key selectable presets.
  - [x] Retain a `Custom` choice for arbitrary destinations, names, paths, sources, and revisions.
  - [x] Preserve existing argument output and cancellation behavior.
- [x] Refine presets to represent practical setup decisions rather than sample project layouts or
      pinned values.
  - [x] Keep recommended defaults, the documented GitHub alias, and `Custom` choices only where useful.
- [x] Add explicit back navigation to every selectable wizard screen.
  - [x] Back returns to the preceding configuration screen without cancelling setup.
  - [x] Escape and Ctrl+C continue to cancel the entire wizard.
- [x] Discover device-specific option values before rendering the TUI.
  - [x] Show supported installed Python executables and versions without triggering installation.
  - [x] Preserve auto-detect and custom fallback options when discovery finds nothing.
- [x] Affected boundary is the Ink wizard only; command-line parsing and project creation are out of scope.

## Acceptance Criteria

- [x] The default wizard path completes using Enter and arrow-key selection only.
- [x] Every wizard field has useful presets and a `Custom` path.
- [x] Selecting `Custom` opens the existing text input and preserves entered values.
- [x] Generated arguments remain compatible with `parseArguments`.

## Validation Cases

- [x] TEST-TUI-001: Complete the wizard using presets only.
- [x] TEST-TUI-002: Select custom values for every field and preserve them in generated arguments.
- [x] TEST-TUI-003: Escape and Ctrl+C still cancel from selectable and custom states.
- [x] TEST-TUI-004: Back navigates through selectable screens without completing or cancelling.
- [x] TEST-TUI-005: Display supported discovered Python executables and versions.
- [x] TEST-TUI-006: Ignore unavailable or unsupported discovered Python candidates.

## Implementation Plan

- [x] Add shared selectable-question and custom-input transitions.
- [x] Define presets for destination, project name, SSH alias, Python, template, and revision.
- [x] Update interactive wizard tests for keyboard selection and custom fallback.
- [x] Add Back choices and preceding-step transitions.
- [x] Add side-effect-free discovery and pass device-specific choices into the wizard.

## Verification

- [x] Run the focused wizard tests.
- [x] Run `pnpm --filter create-mono-stack test`.
- [x] Run `pnpm --filter create-mono-stack lint`.
- [x] Review the diff and re-scan this checklist for stale items.

## Validation Notes

- Existing advanced wizard test failed after the intentional UI change because it typed into fields
  that are now `SelectInput` controls. The test was updated to select `Custom` before typing.
- Focused wizard tests passed: 8 tests.
- Package validation passed: 55 tests and ESLint.
- Presets were narrowed to practical choices: `my-project`, destination-derived project name,
  optional `github-webknot`, auto-detected Python, and latest stable template/revision; custom input
  remains available for each field.
- Back-navigation coverage passed in the focused wizard suite; the full package suite passed 56 tests.
- The first discovery-enabled focused run exposed a timing assumption in the injected render test;
  the test now waits for asynchronous option discovery before completing the wizard.
- Discovery validation passed: 58 package tests, including unavailable and unsupported Python
  candidates; ESLint and Prettier also passed.
- Workspace validation found that filtered pnpm execution changes the working directory; discovery
  now honors `INIT_CWD` and searches ancestors for `copier.yml`, then reads revisions from that
  detected template repository.
- SSH alias validation found that host aliases are normally declared in `~/.ssh/config`, not Git URL
  rewrite config; discovery now parses concrete `Host` entries and merges them with Git aliases.

## Risks and Follow-Up

- [x] Presets are intentionally conservative; users can choose `Custom` for project-specific values.
