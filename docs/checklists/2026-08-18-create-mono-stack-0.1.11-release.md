# create-mono-stack 0.1.11 Release

- Checklist ID: CHECKLIST-20260818-create-mono-stack-0.1.11-release
- Created: 2026-08-18
- Planning completed: 2026-08-18
- Type: Authorized package release
- Source request: Bump version, commit all worktree changes, push, and publish.
- Related checklists:
  - [create-mono-stack 0.1.10 Release](./2026-08-18-create-mono-stack-0.1.10-release.md)
  - [Native Demo Parity](./2026-08-18-native-demo-parity.md)
- Affected package: `core/create-mono-stack`
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Implementation Description

- Release `create-mono-stack` as patch version `0.1.11`.
- Include the RN 0.87 Android build dependencies, Metro 8082/root-entry fixes, and current lockfile.
- Commit all current repository changes, push the release commit, and publish through the approved
  package-local authenticated wrapper.

## Acceptance Criteria

- [x] Package metadata reports version `0.1.11`.
- [x] Repository and generator checks pass.
- [x] The packed artifact contains only intended launcher files and excludes secrets.
- [ ] All current repository changes are included in the release commit.
- [ ] The release commit is pushed to the tracked branch.
- [ ] `create-mono-stack@0.1.11` is published through `publish:package`.

## Exact Test Cases

### TEST-RELEASE-001: Repository validation

- **Small task:** Verify the RN template and release source.
- **Source:** Release workflow and current RN build fixes.
- **Test place:** Repository checks, package tests, and Copier integration.
- **Starting state:** Package version is `0.1.10`; RN template fixes are unstaged.
- **Exact input or fixture:** Version `0.1.11` and current repository contents.
- **Interaction steps:** Bump the version and run the repository gates.
- **Main behavior:** Confirm the release source is valid.
- **Expected result:** Checks pass and the lockfile is accepted by frozen installation.
- **Must change:** Package version becomes `0.1.11`.
- **Must not happen:** No secrets or generated-project files are staged.
- **Planned command:** `pnpm install --offline --frozen-lockfile && just check && pnpm --filter create-mono-stack test:integration`
- **Expected result before the code change:** Metadata reports `0.1.10` before the bump.
- **First observed run:** Frozen install, `just check`, and package validation were run after the version bump.
- **Passing rerun:** Frozen install passed; `just check` passed with 15 successful tasks and 228 tests; Copier integration passed.

### TEST-RELEASE-002: Publish artifact contents

- **Small task:** Verify the npm artifact before publishing.
- **Source:** Package `files` field and release workflow.
- **Test place:** `npm pack --dry-run` from `core/create-mono-stack`.
- **Starting state:** Versioned source passes repository validation.
- **Exact input or fixture:** `create-mono-stack@0.1.11` package directory.
- **Interaction steps:** Run the dry-run pack command and inspect its file list.
- **Main behavior:** Confirm the artifact is scoped to the launcher.
- **Expected result:** Dry run succeeds without credentials, environment files, tests, or checklists.
- **Must change:** No source changes are required by this check.
- **Must not happen:** Auth files or generated mobile projects are packed.
- **Planned command:** `npm pack --dry-run` from `core/create-mono-stack`.
- **Expected result before the code change:** Artifact reports version `0.1.10` before the bump.
- **First observed run:** `npm pack --dry-run` produced `create-mono-stack-0.1.11.tgz` with 25 launcher files.
- **Passing rerun:** Passed without auth, environment, test, checklist, or generated-project files.

### TEST-RELEASE-003: Commit, push, and publish

- **Small task:** Execute the explicitly authorized release operations.
- **Source:** User authorization and `core/create-mono-stack/AGENTS.md`.
- **Test place:** Git history, remote tracking, and npm registry metadata.
- **Starting state:** Validation and artifact checks pass; auth remains ignored.
- **Exact input or fixture:** Release commit and `create-mono-stack@0.1.11`.
- **Interaction steps:** Inspect status/diff/log, stage, commit, push, and run the publish wrapper.
- **Main behavior:** Make the release available on Git and npm.
- **Expected result:** Commit, push, and publish succeed without bypassing hooks.
- **Must change:** Remote branch and npm registry contain the release.
- **Must not happen:** No force push, skipped hooks, direct `npm publish`, or credentials committed.
- **Planned command:** `source "$HOME/.zshrc" && pnpm --filter create-mono-stack publish:package` after commit and push.
- **Expected result before the code change:** No `0.1.11` release exists.
- **First observed run:** Pending.
- **Passing rerun:** Pending.

## Verification

- [ ] Verify frozen installation, repository checks, and integration.
- [ ] Run `npm pack --dry-run`.
- [ ] Inspect status, diff, and recent history before staging.
- [ ] Commit with Conventional Commit syntax and passing hooks.
- [ ] Push without force.
- [ ] Publish through `publish:package`.
- [ ] Confirm registry metadata and clean pushed state.
