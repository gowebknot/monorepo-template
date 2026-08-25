# create-mono-stack 0.1.42 Release

- Checklist ID: CHECKLIST-20260825-create-mono-stack-0.1.42-release
- Previous release checklist: `docs/checklists/2026-08-24-create-mono-stack-0.1.41-release.md`
- Release type: Minor additive template capability bundled with patch-level package release
- Status: In progress

## Implementation Description

Release the complete current worktree as `create-mono-stack@0.1.42`. This includes PostgreSQL
Better Auth email/password scaffolding, generated NestJS auth boundaries and contracts, the mandatory
template-update dry-run preview workflow, generated-project documentation, and the current workspace
configuration and validation updates.

## Acceptance Criteria

- [x] Package metadata is version `0.1.42`.
- [x] The complete repository validation gate passes without bypasses.
- [x] The npm artifact contains the intended launcher files and no credentials.
- [x] Release commit, branch, annotated tag, and npm `latest` metadata identify `0.1.42`.
- [x] This checklist records user-visible behavior, compatibility impact, and validation results.

## Exact Validation Cases

### TEST-RELEASE-005: Candidate metadata is patch version 0.1.42

- Small task: Bump the launcher package version for release.
- Source: Repository release workflow and currently published version `0.1.41`.
- Test place: `core/create-mono-stack/package.json` and package metadata parser.
- Starting state: Package metadata is `0.1.41`.
- Exact input or fixture: Version `0.1.42`.
- Interaction steps: Read package metadata and compare the version.
- Main behavior: The candidate has a new release version.
- Expected result: Package version equals `0.1.42`.
- Must change: `core/create-mono-stack/package.json`.
- Must not happen: The package must not remain at or regress below `0.1.41`.
- Planned command: `node -e 'const p=require("./core/create-mono-stack/package.json"); if(p.version!=="0.1.42") process.exit(1)'`.
- Expected result before the code change: Fails because metadata is `0.1.41`.
- First observed run: The metadata command passed after the package version was updated.
- Passing rerun: `0.1.42` was confirmed.

### TEST-RELEASE-006: Complete release quality gate passes

- Small task: Validate the complete repository before publishing.
- Source: Root `just check` release gate and package-local validation guidance.
- Test place: Repository checks.
- Starting state: Candidate changes and version metadata are prepared.
- Exact input or fixture: Complete current worktree.
- Interaction steps: Run the required checks without bypass flags.
- Main behavior: The release candidate passes repository validation.
- Expected result: `just check` exits successfully.
- Must change: No source files as a side effect.
- Must not happen: No skipped hooks, disabled checks, or credential changes.
- Planned command: `just check`.
- Expected result before the code change: The final release gate has not yet been run for `0.1.42`.
- First observed run: `just check` failed only at `format:check` for the release-coupled CLI fixture and dry-run checklist; builds, lint, typechecks, skills checks, and tests completed.
- Passing rerun: `just check` passed with all 275 launcher tests, 104 skills tests, builds, lint, typechecks, formatting, server unit tests, and API E2E tests passing.

### TEST-RELEASE-007: Published artifact is safe and complete

- Small task: Inspect the package artifact before publication.
- Source: Package release workflow and package `files` allowlist.
- Test place: npm pack dry run.
- Starting state: Versioned candidate package.
- Exact input or fixture: `create-mono-stack@0.1.42`.
- Interaction steps: Render the npm pack manifest and inspect paths, version, and credential absence.
- Main behavior: The artifact is reproducible and excludes secrets.
- Expected result: Artifact is `create-mono-stack-0.1.42.tgz` and contains no credential files.
- Must change: No source files.
- Must not happen: `.npmrc.auth`, tokens, or unrelated ignored files enter the artifact.
- Planned command: `pnpm --filter create-mono-stack exec npm pack --dry-run --json`.
- Expected result before the code change: The artifact reports `0.1.41`.
- First observed run: `npm pack --dry-run --json` reported `create-mono-stack@0.1.42`, a `create-mono-stack-0.1.42.tgz` artifact, 294 files, and no credential files.
- Passing rerun: Artifact inspection remains valid after the final formatting and validation rerun.

### TEST-RELEASE-008: Remote release references and npm metadata agree

- Small task: Publish and verify the release.
- Source: Explicit user authorization and repository release workflow.
- Test place: Git remote refs and npm registry metadata.
- Starting state: Release commit is validated and publish authentication is available.
- Exact input or fixture: Release commit, annotated tag `v0.1.42`, and npm package `0.1.42`.
- Interaction steps: Commit, push branch, create and push tag, publish through the approved wrapper, then query refs and npm metadata.
- Main behavior: Source and registry identify the same release.
- Expected result: `origin/master`, `v0.1.42`, and npm `latest` resolve to `0.1.42`.
- Must change: Git history, remote refs, and npm registry.
- Must not happen: No force push, skipped hooks, direct `npm publish`, or missing current-worktree changes.
- Planned command: `git push origin master`, `git tag -a v0.1.42 -m "Release v0.1.42"`, `git push origin v0.1.42`, `pnpm --filter create-mono-stack publish:package`.
- Expected result before the code change: `v0.1.42` and npm `0.1.42` do not exist.
- First observed run: Git push, annotated tag push, and wrapper publication completed; the first npm metadata query temporarily returned `0.1.41` while the exact package version was still propagating.
- Passing rerun: `master` and `v0.1.42` resolve to `be18eb3`; npm exposes `create-mono-stack@0.1.42` and `latest` resolves to `0.1.42`.

## Implementation Plan

- [x] Update `core/create-mono-stack/package.json` from `0.1.41` to `0.1.42`.
- [ ] Run focused tests, `just check`, formatting, diff validation, and artifact inspection.
- [ ] Inspect the complete diff and stage every current-worktree change requested by the user, excluding credentials and generated transient files.
- [x] Commit the release with a detailed Conventional Commit body and normal hooks.
- [x] Push `master`, create and push annotated `v0.1.42`, and publish through `publish:package`.
- [x] Verify remote refs and npm metadata, then record completion.

## Validation Notes

- The initial `just check` completed builds, lint, typechecks, and package checks but failed
  `format:check` for `core/create-mono-stack/test/cli.test.js` and
  `docs/checklists/2026-08-25-template-update-dry-run.md`. Those files require formatting before the
  release gate can pass.

## Impact And Risks

- Auth adds PostgreSQL schema and environment requirements for consumers that enable the auth example;
  OAuth, email delivery, and SES remain out of scope.
- Template updates now require generated-project users and agents to preview with `--dry-run` before applying changes.
- The release contains all current worktree changes by explicit user instruction, including the existing workspace configuration change.
- Publishing requires the repository's configured npm auth and remote Git access.
- The first post-release documentation commit was rejected by the normal pre-commit hook because the
  known intermittent `selects additional stack features through the multiselect screen` test timed
  out at 274/275. No hook bypass was used; the documentation commit will be retried after a clean suite.

## Completion

- Release commit: `be18eb3` (`chore(release): prepare create-mono-stack 0.1.42`)
- Branch: `master` pushed to `origin`
- Tag: annotated `v0.1.42`, pushed to `origin`
- npm: `create-mono-stack@0.1.42` published with `latest` pointing to `0.1.42`
- Artifact: `create-mono-stack-0.1.42.tgz`, 294 files, no credential files
