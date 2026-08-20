# create-mono-stack 0.1.15 Release

- Checklist ID: CHECKLIST-20260820-create-mono-stack-0.1.15-release
- Created: 2026-08-20
- Planning completed: 2026-08-20
- Type: Package release
- Source request: Bump version, commit, push, tag, and publish the completed launcher changes.
- Previous release: `v0.1.14` / `af3dfcd`
- Related implementation: [Generated Project App And Package Management](./2026-08-20-project-app-package-management.md)
- Related fix: [Template Update Reuses Project Answers](./2026-08-20-template-update-reuse-project-answers.md)
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Implementation Description

- Release `create-mono-stack` version `0.1.15`.
- Include generated-project app and user-package management through the `manage` workflow.
- Include the `template:update` non-interactive defaults fix.
- Publish through the package-local authenticated wrapper.

## Acceptance Criteria

- [ ] Only intended feature, checklist, and package-version files are included; unrelated `apps/expo/tsconfig.json` remains unstaged.
- [ ] Package version is `0.1.15` and the release artifact contains the intended package files.
- [ ] Required tests, lint, formatting, skills checks, and package dry-run pass or have documented unrelated blockers.
- [ ] Release commit uses the repository's conventional commit format.
- [ ] Release commit is pushed to `origin/master`.
- [ ] New tag `v0.1.15` is created and pushed.
- [ ] `create-mono-stack@0.1.15` is published through `publish:package`.

## Validation Notes

- The first `pnpm format:check` run reported formatting issues in this new checklist and the
  unrelated pre-existing `apps/expo/tsconfig.json`. The checklist will be formatted; the Expo file
  remains intentionally untouched and unstaged.

## Exact Test Cases

### TEST-RELEASE-001: Version and artifact

- **Small task:** Validate the package version and packed release contents.
- **Source:** Package manifest and release workflow in `core/create-mono-stack/AGENTS.md`.
- **Test place:** Package metadata and npm pack dry-run.
- **Starting state:** Package version `0.1.14`, intended feature changes unstaged.
- **Exact input or fixture:** `core/create-mono-stack/package.json` and package files.
- **Interaction steps:** Bump the version, run `npm pack --dry-run`, and inspect the file list.
- **Main behavior:** The release artifact identifies version `0.1.15` and includes launcher sources, tests excluded.
- **Expected result:** Dry-run succeeds and reports package `create-mono-stack@0.1.15` with expected files.
- **Must change:** Only the package version metadata.
- **Must not happen:** Credentials, `.npmrc.auth`, generated projects, or unrelated app changes enter the artifact.
- **Planned command:** `npm pack --dry-run`
- **Expected result before the code change:** Reports version `0.1.14` before the bump.
- **First observed run:** `npm pack --dry-run` reported `create-mono-stack@0.1.15` and the expected 29 package files.
- **Passing rerun:** `npm pack --dry-run` passed with the same version and artifact contents.

### TEST-RELEASE-002: Release validation

- **Small task:** Verify the implementation and release checks before commit.
- **Source:** Package validation commands and repository release workflow.
- **Test place:** Launcher tests, lint, formatting, skills validation, and diff checks.
- **Starting state:** Current implementation and release metadata.
- **Exact input or fixture:** Current repository source and intended staged files.
- **Interaction steps:** Run focused package tests, lint, formatting, skills validation, and whitespace checks.
- **Main behavior:** The release candidate is locally valid.
- **Expected result:** All applicable checks pass; unrelated pre-existing failures are documented.
- **Must change:** No source behavior during validation.
- **Must not happen:** Checks must not be bypassed.
- **Planned command:** `pnpm --filter create-mono-stack test && pnpm --filter create-mono-stack lint && pnpm format:check && pnpm skills:check && git diff --check`
- **Expected result before the code change:** Existing implementation checks pass except any known unrelated worktree issue.
- **First observed run:** Package tests passed 246/246, package lint passed, integration passed 1/1, skills validation passed, and `git diff --check` passed; `pnpm format:check` failed only on the new checklist and unrelated Expo formatting.
- **Passing rerun:** Package tests, lint, integration, skills validation, and whitespace checks remain passing; repository-wide formatting remains blocked only by `apps/expo/tsconfig.json` after the checklist is formatted.

### TEST-RELEASE-003: Publish

- **Small task:** Publish the verified release using repository credentials and wrapper.
- **Source:** Explicit user authorization and package-local release workflow.
- **Test place:** npm registry package metadata after publish.
- **Starting state:** Pushed commit and tag `v0.1.15`, authenticated `.npmrc.auth` or configured auth path.
- **Exact input or fixture:** Package version `0.1.15`.
- **Interaction steps:** Run `pnpm --filter create-mono-stack publish:package`, then inspect the published version.
- **Main behavior:** The intended package version becomes available on npm.
- **Expected result:** Publish exits successfully and `create-mono-stack@0.1.15` is available.
- **Must change:** npm registry package state only.
- **Must not happen:** No unpublished version, wrong tag, or credential file committed.
- **Planned command:** `pnpm --filter create-mono-stack publish:package`
- **Expected result before the code change:** Version `0.1.15` is not yet published.
- **First observed run:**
- **Passing rerun:**

## Test-To-Task Map

| Small task           | Test IDs           |
| -------------------- | ------------------ |
| Version and artifact | `TEST-RELEASE-001` |
| Release validation   | `TEST-RELEASE-002` |
| Publish              | `TEST-RELEASE-003` |

## Risks And Non-Goals

- The unrelated `apps/expo/tsconfig.json` change is not part of this release.
- Publishing requires valid npm authentication and network access.
- No dependency, database, API contract, migration, or environment changes are introduced by the version bump.
