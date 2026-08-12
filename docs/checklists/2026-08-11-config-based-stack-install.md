# Feature: Configuration-Based Stack Install

- Checklist ID: CHECKLIST-20260811-config-based-stack-install
- Created: 2026-08-11
- Planning completed: 2026-08-11
- Type: Feature
- Source request: Start the configuration-based install implementation for selectable project stacks.
- Related plans:
  - `docs/plans/update-feature-semantics.md`
- Affected paths: `core/create-mono-stack/`, `copier.yml`, `.mono-stack.json.jinja`, and `scripts/update-template.mjs`
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Planning Record

- [x] Read the generator, wizard, Copier configuration, updater, and relevant tests.
- [x] Define the first vertical slice: feature contract, selection, manifest, and updater input.
- [x] Keep update behavior for newly available features out of scope.

## Acceptance Criteria

- [x] The default stack remains Vite web plus NestJS API.
- [x] Interactive setup supports multiselect feature choices with defaults preselected.
- [x] CLI setup accepts the same feature selection deterministically.
- [x] Generated projects contain a validated, tracked stack manifest.
- [x] Template updates read the manifest and pass its feature selection to Copier.
- [x] Unknown, duplicate, empty, or malformed feature selections are rejected.
- [x] Existing Git alias, Python environment, and project cleanup behavior remains intact.

## Validation Cases

- [x] TEST-STACK-001: Parse default features when no feature option is supplied.
- [x] TEST-STACK-002: Parse and normalize multiple valid feature IDs.
- [x] TEST-STACK-003: Reject unknown, duplicate, empty, and malformed feature values.
- [x] TEST-STACK-004: Select and confirm multiple features through the TUI.
- [x] TEST-STACK-005: Render the generated manifest with the selected features.
- [x] TEST-STACK-006: Pass manifest features to Copier during template update.
- [x] TEST-STACK-007: Reject a missing or invalid update manifest before Copier runs.

## Implementation Plan

- [x] Add the shared feature catalog and normalization functions.
- [x] Add CLI parsing and Copier data serialization for feature selections.
- [x] Add the TUI multiselect screen with preselected defaults.
- [x] Add the generated project manifest.
- [x] Make the updater load and validate the manifest.
- [x] Update focused and generation tests and documentation.

## Verification

- [x] Run focused feature, CLI, wizard, and updater tests.
- [x] Run `pnpm --filter create-mono-stack test`.
- [x] Run `pnpm --filter create-mono-stack lint`.
- [x] Run Prettier validation and `git diff --check`.
- [/] Run the Copier integration test. The generated project reached the manifest assertions, then
  failed an unrelated existing `AGENTS.md` exclusion assertion because current source content
  contains `core/create-mono-stack`.

## Validation Notes

Record failures before correcting them and passing reruns afterward.

- 2026-08-11: The first feature contract test run failed as expected because
  `core/create-mono-stack/src/feature-config.js` did not exist yet.
- 2026-08-11: Focused feature, wizard, and updater tests passed (28/28), but Prettier reported
  formatting issues in five changed JavaScript files before correction.
- 2026-08-11: After serializing the manifest payload as a Copier string, focused CLI, feature, and
  updater tests passed (30/30); Prettier then reported a formatting issue in `test/cli.test.js`.
- 2026-08-11: Full package validation found one README adapter synchronization failure caused by
  indentation in the expected fixture; the broad Prettier command also failed because `.jinja` has
  no configured parser.
- 2026-08-11: Full package tests passed (76/76) after correcting the README adapter fixture; package
  lint passed.
- 2026-08-11: Targeted Prettier validation and `git diff --check` passed.
- 2026-08-11: Copier integration created and updated the fixture through the generated manifest
  assertions, then failed on the pre-existing generated `AGENTS.md` exclusion assertion.
- 2026-08-11: Final Prettier validation found formatting issues in this checklist before correction.
