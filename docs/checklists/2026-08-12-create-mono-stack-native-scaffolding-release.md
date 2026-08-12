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

- [ ] Inspect the complete diff and classify public, generated-project, and compatibility impact.
- [ ] Confirm the release is additive and backward-compatible for existing CLI users.
- [ ] Confirm no database, API contract, migration, or secret-handling changes require rollout work.

## Release Notes

- Add native Vite and NestJS app scaffolding with user-selected app names.
- Persist selected app generators and names in the generated project manifest.
- Add per-app name prompts with Tab-highlighted Back navigation.
- Move generated-project next steps until all setup and scaffolding work completes.
- Keep future Next.js, Express, Expo, and React Native adapters out of this release.

## Implementation Plan

- [ ] Bump `core/create-mono-stack/package.json` to `0.1.6`.
- [ ] Run package tests, lint, formatting, and repository checks.
- [ ] Run the Copier integration test or record its environment blocker.
- [ ] Pack and inspect the npm artifact.
- [ ] Inspect status and diff, then stage only intended release files.
- [ ] Commit with the repository's Conventional Commit convention.
- [ ] Push the release commit to the tracked remote branch.
- [ ] Publish through `pnpm --filter create-mono-stack publish:package`.

## Validation Notes

Record failures before correction and passing reruns afterward.
