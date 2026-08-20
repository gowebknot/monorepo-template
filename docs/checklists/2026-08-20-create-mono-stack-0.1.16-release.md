# create-mono-stack 0.1.16 Release

- Checklist ID: CHECKLIST-20260820-create-mono-stack-0.1.16-release
- Created: 2026-08-20
- Planning completed: 2026-08-20
- Type: Package release
- Source request: Bump version, commit, push, tag, and publish the port allocation implementation.
- Previous release: `v0.1.15` / `af74c2a`
- Related implementation: [Multi-Instance Development Port Allocation](./2026-08-20-multi-instance-port-allocation.md)
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Implementation Description

- Release `create-mono-stack` version `0.1.16`.
- Include stable per-instance development port allocation for generated apps.
- Include the shared runtime launcher for Vite, Next.js, NestJS, Expo, and React Native.
- Publish through the package-local authenticated wrapper.

## Acceptance Criteria

- [ ] Only intended port-allocation, documentation, checklist, and package-version files are included; unrelated `apps/expo/tsconfig.json` remains unstaged.
- [ ] Package version is `0.1.16` and the release artifact contains the intended package files.
- [ ] Launcher tests, lint, integration, formatting, skills validation, and whitespace checks pass or have documented unrelated blockers.
- [ ] Release commit uses the repository's conventional commit format.
- [ ] Release commit is pushed to `origin/master`.
- [ ] New tag `v0.1.16` is created and pushed.
- [ ] `create-mono-stack@0.1.16` is published through `publish:package`.

## Validation Notes

- The first release validation passed launcher lint, Copier integration, skills validation, and
  `npm pack --dry-run` for `create-mono-stack@0.1.16`. One Ink wizard test failed its one-second
  render timing assertion; it will be rerun. Formatting reported this new checklist and the
  unrelated pre-existing `apps/expo/tsconfig.json`; only this checklist will be formatted.
- The focused Ink rerun passed, and the complete launcher suite then passed `252/252`. The root
  format check remains blocked only by the unrelated `apps/expo/tsconfig.json` change.

## Exact Test Cases

### TEST-RELEASE-004: Version and artifact

- **Small task:** Validate the package version and packed release contents.
- **Source:** Package manifest and release workflow in `core/create-mono-stack/AGENTS.md`.
- **Test place:** Package metadata and npm pack dry-run.
- **Starting state:** Package version `0.1.15`, port allocation changes unstaged.
- **Exact input or fixture:** `core/create-mono-stack/package.json` and package files.
- **Interaction steps:** Bump the version, run `npm pack --dry-run`, and inspect the file list.
- **Main behavior:** The release artifact identifies version `0.1.16` and includes the shared runtime sources.
- **Expected result:** Dry-run succeeds and reports package `create-mono-stack@0.1.16`.
- **Must change:** Only package version metadata for the release step.
- **Must not happen:** Credentials, `.npmrc.auth`, generated projects, or unrelated Expo changes enter Git or the artifact.
- **Planned command:** `npm pack --dry-run`
- **Expected result before the code change:** Reports version `0.1.15` before the bump.
- **First observed run:** `npm pack --dry-run` reported `create-mono-stack@0.1.16`, tarball `create-mono-stack-0.1.16.tgz`, and 30 files.
- **Passing rerun:** `npm pack --dry-run` completed successfully with the same version and artifact contents.

### TEST-RELEASE-005: Release validation

- **Small task:** Verify the implementation and release checks before commit.
- **Source:** Package validation commands and repository release workflow.
- **Test place:** Launcher tests, lint, integration, formatting, skills validation, and diff checks.
- **Starting state:** Current port allocation implementation and release metadata.
- **Exact input or fixture:** Current repository source and intended staged files.
- **Interaction steps:** Run package tests, lint, integration, formatting, skills validation, and whitespace checks.
- **Main behavior:** The release candidate is locally valid.
- **Expected result:** All applicable checks pass; unrelated pre-existing failures are documented.
- **Must change:** No source behavior during validation.
- **Must not happen:** Checks must not be bypassed.
- **Planned command:** `pnpm --filter create-mono-stack test && pnpm --filter create-mono-stack lint && pnpm --filter create-mono-stack test:integration && pnpm format:check && pnpm skills:check && git diff --check`
- **Expected result before the code change:** Existing implementation checks pass except any known unrelated worktree issue.
- **First observed run:** Launcher tests had one intermittent Ink timing failure (`251/252`); lint, integration, skills validation, and whitespace checks passed, while root formatting reported only the unrelated Expo file and this checklist.
- **Passing rerun:** Focused Ink test passed, full launcher tests passed `252/252`, lint and integration passed, changed-file formatting passed, skills validation passed, and `git diff --check` passed. Root formatting remains blocked only by `apps/expo/tsconfig.json`.

### TEST-RELEASE-006: Publish

- **Small task:** Publish the verified release using repository credentials and wrapper.
- **Source:** Explicit user authorization and package-local release workflow.
- **Test place:** npm registry package metadata after publish.
- **Starting state:** Pushed commit and tag `v0.1.16`, authenticated `.npmrc.auth` or configured auth path.
- **Exact input or fixture:** Package version `0.1.16`.
- **Interaction steps:** Run `pnpm --filter create-mono-stack publish:package`, then inspect the published version.
- **Main behavior:** The intended package version becomes available on npm.
- **Expected result:** Publish exits successfully and `create-mono-stack@0.1.16` is available.
- **Must change:** npm registry package state only.
- **Must not happen:** No unpublished version, wrong tag, or credential file committed.
- **Planned command:** `pnpm --filter create-mono-stack publish:package`
- **Expected result before the code change:** Version `0.1.16` is not yet published.
- **First observed run:**
- **Passing rerun:**

## Test-To-Task Map

| Small task           | Test IDs           |
| -------------------- | ------------------ |
| Version and artifact | `TEST-RELEASE-004` |
| Release validation   | `TEST-RELEASE-005` |
| Publish              | `TEST-RELEASE-006` |

## Risks And Non-Goals

- The unrelated `apps/expo/tsconfig.json` change is not part of this release.
- Publishing requires valid npm authentication and network access.
- No database, API contract, migration, or dependency changes are introduced by the version bump.
