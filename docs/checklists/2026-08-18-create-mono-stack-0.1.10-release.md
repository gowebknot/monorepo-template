# create-mono-stack 0.1.10 Release

- Checklist ID: CHECKLIST-20260818-create-mono-stack-0.1.10-release
- Created: 2026-08-18
- Planning completed: 2026-08-18
- Type: Authorized package release
- Source request: Bump version, commit all worktree changes, push, and publish.
- Related checklists:
  - [create-mono-stack 0.1.9 Release](./2026-08-15-create-mono-stack-0.1.9-release.md)
  - [Native Demo Parity](./2026-08-18-native-demo-parity.md)
  - [Fix Expo Query Provider](./2026-08-18-fix-expo-query-provider.md)
- Affected package: `core/create-mono-stack`
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Release `create-mono-stack` as patch version `0.1.10`.
- Include the current native Expo/RN/Next reference, generator, environment, query-provider, and
  documentation changes already present in the worktree.
- Commit all repository worktree changes, push the release commit, and publish through the approved
  package-local authenticated wrapper.

## Acceptance Criteria

- [x] Package metadata reports version `0.1.10`.
- [x] Required tests, lint, formatting, integration, and repository checks pass or have documented
      non-release blockers.
- [x] The packed artifact contains only intended launcher files and excludes secrets.
- [ ] All current repository worktree changes are included in one release commit.
- [ ] The release commit is pushed to the tracked remote branch.
- [ ] `create-mono-stack@0.1.10` is published through `publish:package`.

## Exact Test Cases

### TEST-RELEASE-001: Version and repository validation

- **Small task:** Verify the release source before Git and registry operations.
- **Source:** Release workflow and `core/create-mono-stack/package.json`.
- **Test place:** Package metadata, repository checks, and package tests.
- **Starting state:** Package version is `0.1.9`; repository changes are unstaged.
- **Exact input or fixture:** Version `0.1.10` and the complete current worktree.
- **Interaction steps:** Bump the version, run checks, and inspect status and diff.
- **Main behavior:** Confirm the release source is valid and reproducible.
- **Expected result:** Required checks pass and intended files are present without auth files.
- **Must change:** Package version becomes `0.1.10`.
- **Must not happen:** Do not stage `.npmrc.auth`, `.env`, emulator artifacts, or secrets.
- **Planned command:** `just check && pnpm --filter create-mono-stack test:integration && git diff --check`
- **Expected result before the code change:** Metadata reports `0.1.9` before the bump.
- **First observed run:** `just check` reached formatting after lint and typecheck passed, then failed because this checklist was not formatted.
- **Passing rerun:** `just check` passed; all 15 lint/typecheck tasks, formatting, skills checks, and 228 launcher tests passed.

### TEST-RELEASE-002: Publish artifact contents

- **Small task:** Verify the npm artifact before publishing.
- **Source:** `core/create-mono-stack/package.json` `files` field and release workflow.
- **Test place:** npm pack dry run.
- **Starting state:** Versioned source passes repository validation.
- **Exact input or fixture:** `create-mono-stack@0.1.10` package directory.
- **Interaction steps:** Run `npm pack --dry-run` from the package directory and inspect files.
- **Main behavior:** Confirm the artifact is scoped to the launcher.
- **Expected result:** Dry run succeeds without repository-only files or secrets.
- **Must change:** No source changes are required by this check.
- **Must not happen:** Auth files, environment files, tests, checklists, or emulator artifacts are packed.
- **Planned command:** `npm pack --dry-run` from `core/create-mono-stack`.
- **Expected result before the code change:** Artifact reports version `0.1.9` before the bump.
- **First observed run:** `npm pack --dry-run` produced `create-mono-stack-0.1.10.tgz` with 25 launcher files.
- **Passing rerun:** Passed; no auth, environment, test, checklist, or emulator files were included.

### TEST-RELEASE-003: Authorized commit, push, and publish

- **Small task:** Execute the explicitly authorized release operations.
- **Source:** User authorization and `core/create-mono-stack/AGENTS.md`.
- **Test place:** Git history, remote tracking, and npm registry metadata.
- **Starting state:** Validation and artifact checks pass; auth remains ignored.
- **Exact input or fixture:** Release commit and `create-mono-stack@0.1.10`.
- **Interaction steps:** Inspect status/diff/log, stage intended files, commit, push, and run the publish wrapper.
- **Main behavior:** Make the verified release available on Git and npm.
- **Expected result:** Commit, push, and publish succeed without bypassing hooks.
- **Must change:** Remote branch and npm registry contain the release.
- **Must not happen:** No force push, skipped hooks, direct `npm publish`, or credentials committed.
- **Planned command:** `pnpm --filter create-mono-stack publish:package` after commit and push.
- **Expected result before the code change:** No `0.1.10` release exists.
- **First observed run:** Pending.
- **Passing rerun:** Pending.

## Verification

- [ ] Run repository checks and native/package validation.
- [ ] Run `pnpm --filter create-mono-stack test:integration`.
- [ ] Run `npm pack --dry-run` from `core/create-mono-stack`.
- [ ] Inspect status, diff, and recent history before staging.
- [ ] Commit with Conventional Commit syntax and passing hooks.
- [ ] Push the tracked branch without force.
- [ ] Publish with `pnpm --filter create-mono-stack publish:package`.
- [ ] Confirm registry metadata and final clean/pushed state.

## Risks and Follow-Up

- [ ] Full `just check` may retain the previously observed Next ESLint or transient Ink timing blocker;
      record exact results before release operations.
- [ ] Device/emulator runtime validation is not part of the npm artifact and remains local-only.
