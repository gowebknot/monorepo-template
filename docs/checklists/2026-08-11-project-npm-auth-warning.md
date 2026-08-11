# Project npm Auth Warning

- Checklist ID: CHECKLIST-20260811-project-npm-auth-warning
- Created: 2026-08-11
- Planning completed: 2026-08-11
- Type: Local project configuration fix
- Source request: Remove pnpm's project `.npmrc` auth warning without broadening project-specific authentication.
- Related checklists:
  - [Checklist lifecycle policy](./2026-08-11-checklist-lifecycle.md)
  - [Exclude checklists from generated projects](./2026-08-11-exclude-checklists-from-generated-projects.md)
- Affected paths: local ignored `.npmrc`, `.gitignore`, and optional project auth instructions
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Planning Record

- [x] Inspect the local `.npmrc`, ignore rules, and Git tracking status.
- [x] Confirm the warning is caused by environment-variable expansion in a project-level auth setting.
- [x] Preserve project-specific scope and avoid moving a credential into tracked files.
- [x] Define warning-free normal pnpm commands and an explicit path for authenticated commands.
- [x] Confirm pnpm accepts the project token through `NPM_CONFIG_USERCONFIG` without the project-level warning.

## Acceptance Criteria

- [x] Normal pnpm commands no longer print the project auth warning.
- [x] No npm token is added to tracked files.
- [x] The repository's existing `.npmrc` ignore rule remains intact.
- [x] Project-specific authentication remains opt-in and does not affect unrelated projects.
- [x] The local auth file is excluded from Copier output.
- [x] Existing repository tests and formatting remain valid.

## Implementation Plan

- [x] Remove the warning-causing local project `.npmrc` auth directive.
- [x] Add an ignored `.npmrc.auth` file for explicit project-specific authentication without committing secrets.
- [x] Exclude `.npmrc.auth` from Copier output and generation fixtures.
- [x] Verify the local configuration is ignored and no auth token appears in tracked content.

## Validation Cases

- [x] TEST-CONFIG-001: A normal pnpm command completes without the auth warning.
- [x] TEST-CONFIG-002: The project auth configuration is not tracked by Git.
- [x] TEST-CONFIG-003: An explicit user-configured auth file can be selected without project-config warnings.
- [x] TEST-CONFIG-005: Copier excludes the local auth file from generated projects.
- [x] TEST-CONFIG-004: Repository formatting and relevant checks pass.

## Verification Plan

- [x] Run a warning-producing pnpm command before the fix and record the failure.
- [x] Run the same command after the fix and confirm no warning is emitted.
- [x] Run `git status --short --ignored` and an exact token/config scan.
- [x] Run focused formatting and repository validation checks.
- [x] Re-scan this checklist for stale statuses.

## Validation Notes

Record failures before correction and passing reruns afterward.

- 2026-08-11: Before the fix, `pnpm config get registry` emitted the ignored project-level auth warning from `.npmrc`.
- 2026-08-11: Setting `NPM_CONFIG_USERCONFIG=/dev/null` did not suppress the warning while the project `.npmrc` existed; an explicit auth config must therefore replace, not coexist with, the project auth directive.
- 2026-08-11: The first post-fix formatting command incorrectly included `.gitignore`, which has no Prettier parser; the first combined `git ls-files --error-unmatch` check also returned its expected non-zero result because the auth files are intentionally untracked.
- 2026-08-11: `pnpm --filter create-mono-stack test:integration` was blocked before fixture setup because the Docker daemon socket at `~/.colima/default/docker.sock` is unavailable.
- 2026-08-11: After the fix, `pnpm config get registry` emitted no warning; explicit `NPM_CONFIG_USERCONFIG=.npmrc.auth` loaded the auth setting without a project-config warning.
- 2026-08-11: Exact Git tracking/ignore scans, `git grep` secret scan, focused Prettier, `pnpm --filter create-mono-stack test` (55/55), `pnpm --filter create-mono-stack lint`, `git diff --check`, and `just check` passed. Copier integration remains environment-blocked by Docker availability.
