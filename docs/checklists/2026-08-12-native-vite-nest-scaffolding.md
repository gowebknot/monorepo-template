# Feature: Native Vite and NestJS Scaffolding

- Checklist ID: CHECKLIST-20260812-native-vite-nest-scaffolding
- Created: 2026-08-12
- Planning completed: 2026-08-12
- Type: Feature
- Source request: Use native Vite and NestJS CLI setup with user-selected app names.
- Related checklists:
  - Configuration foundation: `docs/checklists/2026-08-11-config-based-stack-install.md`
- Affected paths: `core/create-mono-stack/`, generated app setup, and project manifest
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Planning Record

- [x] Confirm the native CLI flow and the current reference-directory collision.
- [x] Define temporary native scaffolding followed by reference integration as the first slice.
- [x] Limit this implementation to Vite and NestJS; defer other adapters.

## Acceptance Criteria

- [x] Setup asks for web and server app names before advanced options.
- [x] App-name input screens provide Back navigation.
- [x] Vite runs as `pnpm create vite <temporary-app-path>` without a template flag.
- [x] NestJS runs through its native CLI with the generated temporary app path.
- [x] Native CLI input and output remain interactive.
- [x] Native CLI failures clean up the generated project and temporary scaffold.
- [x] Generated app records persist app names, paths, generators, and references.
- [x] Existing reference integration and shared workspace setup remain available.
- [x] Next.js, Express, Expo, and React Native are not implemented in this slice.

## Validation Cases

- [x] TEST-SCAFFOLD-001: Use default `web` and `server` app names.
- [x] TEST-SCAFFOLD-002: Preserve custom app names in CLI arguments and manifest data.
- [x] TEST-SCAFFOLD-003: Reject unsafe, empty, or colliding app names.
- [x] TEST-SCAFFOLD-004: Invoke Vite without framework or template flags.
- [x] TEST-SCAFFOLD-005: Invoke NestJS with the selected app path.
- [x] TEST-SCAFFOLD-006: Preserve native CLI stdio.
- [x] TEST-SCAFFOLD-007: Clean up after native CLI failure.
- [x] TEST-SCAFFOLD-008: Do not rerun native CLIs during template update.
- [x] TEST-SCAFFOLD-009: Navigate backward from each selected app-name screen.

## Implementation Plan

- [x] Add validated app-name configuration and wizard screens.
- [x] Add isolated native scaffold orchestration.
- [x] Replace generated app directories with native output before reference integration.
- [x] Persist app records in `.mono-stack.json`.
- [x] Update focused tests and generated-project assertions.
- [x] Update documentation for the Vite and NestJS flow.

## Verification

- [x] Run focused scaffold, CLI, wizard, and cleanup tests.
- [x] Run `pnpm --filter create-mono-stack test`.
- [x] Run `pnpm --filter create-mono-stack lint`.
- [x] Run Prettier validation and `git diff --check`.
- [ ] Run the Copier integration test when Docker is available.

## Validation Notes

Record failures before correcting them and passing reruns afterward.

- 2026-08-12: Native scaffold and wizard tests passed, and the expanded package suite passed 80/80;
  lint then found an unused `DEFAULT_APP_NAMES` import before correction.
- 2026-08-12: The combined final formatting command failed because `README.md.jinja` has no
  configured Prettier parser; rerun formatting excludes Jinja adapter files.
