# Latest Generated Dependencies Checklist

- Checklist ID: CHECKLIST-20260811-latest-generated-dependencies
- Created: 2026-08-11
- Type: Generated project dependency refresh
- Related checklists: [Test-first workflow](./2026-08-11-test-first-workflow-checklist.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Scope

- [x] Refresh generated workspace dependency specifications from npm's latest releases.
  - [x] Cover root, `apps/*`, and `packages/*` manifests.
  - [x] Preserve `workspace:` dependencies and package metadata.
  - [x] Keep `core/*` excluded from generated projects.
  - [x] Regenerate the generated lockfile to match refreshed manifests.

## Validation Cases

- [x] TEST-DEPS-001: Project creation invokes the latest dependency refresh in the generated destination.
- [x] TEST-DEPS-002: The refresh uses argument arrays and does not interpolate project input into a shell.
- [x] TEST-DEPS-003: A dependency refresh failure removes the partial generated project and temporary setup environment.
- [/] TEST-DEPS-004: Generated integration output has refreshed manifests and a consistent lockfile. Docker integration is blocked by the unavailable Colima socket.

## Implementation

- [x] Add the post-Copier dependency refresh command.
- [x] Extend launcher unit coverage for ordering, working directory, and failure cleanup.
- [x] Extend Copier integration assertions for generated dependency metadata.
- [x] Update generated project documentation.

## Verification

- [x] Run focused launcher tests.
- [x] Run `pnpm --filter create-mono-stack test`.
- [x] Run `pnpm --filter create-mono-stack lint`.
- [/] Run `pnpm --filter create-mono-stack test:integration`. Docker integration is blocked by the unavailable Colima socket.
- [x] Run `pnpm format:check`.
- [x] Review diff and rescan this checklist for stale statuses.

## Validation Notes

- 2026-08-11: Focused test command was blocked before Node started because the workspace `pnpm` executable reported `This: command not found`. The repository code was not executed.
- 2026-08-11: Direct launcher tests ran with one expected adapter-synchronization failure because the edited README adapter had an extra indentation space. The implementation tests and lint passed.
- 2026-08-11: Corrected the adapter indentation and reran the full launcher suite: 64/64 tests passed. Corepack package test, lint, targeted Prettier, and `git diff --check` passed. Docker integration was attempted and blocked before fixture setup because the Docker daemon is unavailable.
- 2026-08-11: Root `pnpm format:check` passed through Corepack.

## Risks

- [ ] Network access is required during project creation; failures must be explicit rather than silently producing stale versions.
- [ ] The integration test must remain deterministic with respect to its existing controlled fixture and lockfile.

## Updates

- 2026-08-12: Native scaffolding introduced a second dependency authority. Recursively rewriting all
  manifests with `pnpm update --latest` after combining native and template apps can replace both the
  CLI-selected versions and the template-only tested ranges. The hybrid policy now keeps native
  versions for overlapping packages, adds template-only packages at their authored ranges, and
  regenerates only the lockfile. The correction is tracked in
  [Hybrid Native Reference Profiles](./2026-08-12-hybrid-native-reference-profiles.md); validation is
  pending there.
