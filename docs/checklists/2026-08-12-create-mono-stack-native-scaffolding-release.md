# create-mono-stack 0.1.6 Release

- Checklist ID: CHECKLIST-20260812-create-mono-stack-0.1.6-release
- Created: 2026-08-12
- Planning completed: 2026-08-12
- Type: npm package release
- Source request: Bump, commit, push, and publish the current create-mono-stack changes.
- Related checklists:
  - Native Vite and NestJS scaffolding: `./2026-08-12-native-vite-nest-scaffolding.md`
  - Previous release: `./2026-08-11-create-mono-stack-0.1.5-release.md`
- Affected package: `core/create-mono-stack`
- Target version: `0.1.6`
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Release Assessment

- [x] Inspect the complete diff and classify public, generated-project, and compatibility impact.
- [x] Confirm the release is additive and backward-compatible for existing CLI users.
- [x] Confirm no database, API contract, migration, or secret-handling changes require rollout work.

## Release Notes

- Add native Vite and NestJS app scaffolding with user-selected app names.
- Persist selected app generators and names in the generated project manifest.
- Add per-app name prompts with Tab-highlighted Back navigation.
- Move generated-project next steps until all setup and scaffolding work completes.
- Keep future Next.js, Express, Expo, and React Native adapters out of this release.

## Implementation Plan

- [x] Bump `core/create-mono-stack/package.json` to `0.1.6`.
- [x] Run package tests, lint, formatting, and repository checks.
- [x] Run the Copier integration test or record its environment blocker.
- [x] Pack and inspect the npm artifact.
- [x] Inspect status and diff, then stage only intended release files.
- [x] Commit with the repository's Conventional Commit convention.
- [x] Push the release commit to the tracked remote branch.
- [x] Publish through `pnpm --filter create-mono-stack publish:package`.

## Validation Notes

Record failures before correction and passing reruns afterward.

- 2026-08-12: Package tests passed 83/83, lint passed, targeted Prettier passed, and `git diff --check` passed.
- 2026-08-12: Initial `pnpm pack --pack-destination /tmp` inspection command was rejected because this pnpm version does not support the `recursive` option; `npm pack --dry-run` then verified the 0.1.6 artifact with 14 files.
- 2026-08-12: Commit hook initially failed because the machine pnpm shim was stale; the repository-local ignored pnpm executable was repaired to invoke Corepack, then all hooks passed.
- 2026-08-12: Committed `e52ae469b328cc669b6be7f448821ed66756392c` as `feat(create-mono-stack): add native app scaffolding`.
- 2026-08-12: Pushed `master` to `origin`; remote `master` matches the release commit.
- 2026-08-12: Published `create-mono-stack@0.1.6` through the package-local publish wrapper. npm reports version `0.1.6`.
