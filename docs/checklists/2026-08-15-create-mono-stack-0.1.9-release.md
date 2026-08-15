# create-mono-stack 0.1.9 Release

- Checklist ID: CHECKLIST-20260815-create-mono-stack-0.1.9-release
- Created: 2026-08-15
- Type: Authorized package release
- Source request: Bump the package version, commit all worktree changes, push, and publish.
- Related checklists:
  - [Environment Example Generation](./2026-08-15-env-example-generation.md)
  - [Complete Hybrid Native Reference Generation](./2026-08-14-complete-hybrid-native-reference-generation.md)
- Affected package: `core/create-mono-stack`
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Implementation Description

- Release `create-mono-stack` as patch version `0.1.9`.
- Include the current environment-file generation, native reference-profile, test-policy, and
  related repository changes already present in the worktree.
- Commit all current worktree changes, push the release commit, and publish through the package-local
  authenticated wrapper.

## Acceptance Criteria

- [x] Package metadata reports version `0.1.9`.
- [x] Required tests, lint, formatting, integration, and repository checks pass.
- [x] The packed artifact contains the intended launcher files and excludes repository-only content.
- [ ] All current worktree changes are included in one release commit without secrets.
- [ ] The release commit is pushed to its tracked remote branch.
- [ ] `create-mono-stack@0.1.9` is published through `publish:package`.

## Exact Test Cases

- [x] TEST-RELEASE-001: Package metadata and repository checks pass for version `0.1.9`.
  - Small task: Verify the versioned source before release operations.
  - Source: Package release workflow and `core/create-mono-stack/package.json`.
  - Test place: Repository validation commands.
  - Starting state: Package version is `0.1.8` and the worktree contains the release changes.
  - Exact input or fixture: Version `0.1.9` and the current repository contents.
  - Interaction steps: Bump the version, run tests and checks, and inspect the diff.
  - Main behavior: Confirm the release source is valid and reproducible.
  - Expected result: All required checks pass and only intended files are changed.
  - Must change: Package version becomes `0.1.9`.
  - Must not happen: Secrets, auth files, or unrelated generated artifacts enter the release.
  - Planned command: `just check && pnpm --filter create-mono-stack test:integration && git diff --check`.
  - Expected result before the code change: Version check reports `0.1.8` before the bump.
  - First observed run: `just check` and `pnpm --filter create-mono-stack test:integration` passed after the version bump.
  - Passing rerun: `just check && pnpm --filter create-mono-stack test:integration && git diff --check` passed.

- [x] TEST-RELEASE-002: The npm package dry-run contains only intended publish files.
  - Small task: Verify the package artifact before publishing.
  - Source: Package `files` field and package release workflow.
  - Test place: `npm pack --dry-run` from `core/create-mono-stack`.
  - Starting state: Versioned package source passes repository checks.
  - Exact input or fixture: `create-mono-stack@0.1.9` package directory.
  - Interaction steps: Run the dry-run pack command and inspect its file list.
  - Main behavior: Confirm the publish artifact is scoped to the launcher.
  - Expected result: Dry-run succeeds and excludes worktree-only tests, skills, checklists, and auth files.
  - Must change: No source changes are required by this check.
  - Must not happen: `.npmrc.auth`, `.env`, credentials, or repository-only test fixtures are packed.
  - Planned command: `npm pack --dry-run` from `core/create-mono-stack`.
  - Expected result before the code change: The artifact reports version `0.1.8` before the bump.
  - First observed run: `npm pack --dry-run` produced `create-mono-stack-0.1.9.tgz` with 15 intended files.
  - Passing rerun: Same dry-run passed with no repository-only tests, checklists, auth files, or environment files.

- [ ] TEST-RELEASE-003: Commit, push, and publish complete through approved commands.
  - Small task: Execute the explicitly authorized release operations.
  - Source: User authorization and `core/create-mono-stack/AGENTS.md`.
  - Test place: Git status/history, remote tracking, and npm registry metadata.
  - Starting state: Validation and artifact checks pass; auth remains in the ignored repository config.
  - Exact input or fixture: Release commit and `create-mono-stack@0.1.9`.
  - Interaction steps: Inspect status/diff/log, stage intended changes, commit, push, and run the package
    publish wrapper.
  - Main behavior: Make the verified release available from the tracked branch and npm registry.
  - Expected result: Commit, push, and publish all succeed without bypassing hooks.
  - Must change: Git remote and npm registry contain the release.
  - Must not happen: Force push, skipped hooks, direct `npm publish`, or credentials committed.
  - Planned command: `pnpm --filter create-mono-stack publish:package` after commit and push.
  - Expected result before the code change: No `0.1.9` release exists.
  - First observed run: Pending.
  - Passing rerun: Pending.

## Verification

- [x] Run `just check`.
- [x] Run `pnpm --filter create-mono-stack test:integration`.
- [x] Run `npm pack --dry-run` from `core/create-mono-stack`.
- [x] Inspect `git status`, `git diff`, and `git log --oneline -10` before staging.
- [ ] Commit with repository-compliant Conventional Commit syntax.
- [ ] Push the tracked branch without force.
- [ ] Publish with `pnpm --filter create-mono-stack publish:package`.
- [ ] Confirm registry version and final clean/pushed state.

## Risks and Follow-Up

- [ ] Publishing requires valid ignored npm authentication; stop before publish if credentials are unavailable.
- [ ] The worktree contains pre-existing related changes; all must be reviewed and included as explicitly requested.
