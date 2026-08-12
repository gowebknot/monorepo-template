# TypeScript 7 And Native Scaffolding Release

- Checklist ID: CHECKLIST-20260812-typescript7-native-scaffolding-release
- Created: 2026-08-12
- Type: Corrective release and repository delivery
- Related checklists:
  - [Native Vite and Nest Scaffolding](./2026-08-12-native-vite-nest-scaffolding.md)
  - [Native Scaffolding Release](./2026-08-12-create-mono-stack-native-scaffolding-release.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Add the TypeScript 6 compiler API fallback required by `unplugin-dts` under TypeScript 7.
- Correct native Vite and NestJS temporary scaffolding paths and non-interactive behavior.
- Preserve synchronized portable skill documentation and refresh the workspace lockfile.
- Release `create-mono-stack` as version `0.1.7`.

## Plan

- [ ] Inspect all current changes, release metadata, remote state, and package artifact contents.
- [ ] Set the launcher version to `0.1.7` and validate release metadata.
- [x] Run `just check`, launcher tests, integration tests, and package artifact checks. Initial run found lockfile formatting drift and one interactive wizard timeout; package dry-run command also needs the package-local wrapper.
- [ ] Commit all current changes with a Conventional Commit.
- [ ] Push the commit to `origin/master`.
- [ ] Publish through `pnpm --filter create-mono-stack publish:package`.
- [ ] Verify the remote revision and published npm metadata.

## Validation Notes

- 2026-08-12: Initial `just check` passed lint and typecheck but failed `format:check` because `pnpm-lock.yaml` was not formatted.
- 2026-08-12: Initial launcher test run passed 83/84; the advanced keyboard-driven wizard test timed out waiting for expected Ink output.
- 2026-08-12: `pnpm --filter create-mono-stack pack --dry-run` is unsupported by pnpm 9; use `npm pack --dry-run` from the package directory instead.
- 2026-08-12: Copier integration initially failed because the generated `AGENTS.md` adapter did not remove all launcher references; the adapter was broadened to remove source-only launcher lines.
- 2026-08-12: Copier integration passed after the adapter correction; the subsequent `just check` run found only Prettier formatting drift in the updated test.
- 2026-08-12: Final `just check`, launcher tests (84/84), Copier integration, `git diff --check`, and `npm pack --dry-run` for `create-mono-stack@0.1.7` passed.
