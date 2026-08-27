# create-mono-stack 0.1.46 Release

- Checklist ID: CHECKLIST-20260827-create-mono-stack-0.1.46-release
- Related implementation checklist: `docs/checklists/2026-08-27-fix-opencode-plugin-server-error.md`
- Previous release checklist: `docs/checklists/2026-08-27-create-mono-stack-0.1.45-release.md`
- Release type: Patch
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

Release the repaired OpenCode implementation-contract plugin and its deterministic regression tests as
`create-mono-stack` 0.1.46. The release fixes plugin startup, uses the documented OpenCode tool-hook
arguments, and prevents `apply_patch` from bypassing the contract gate. Launcher runtime, database,
environment, and dependency contracts are unchanged.

## Implementation Contract

### Feature Boundaries

- Included product behavior: Publish the current OpenCode plugin repair and associated test and checklist changes as version 0.1.46.
- Excluded behavior and non-goals: No new launcher runtime features, database changes, environment changes, or dependency changes.
- Shared, app-wide, and feature-owned boundaries: OpenCode adapter and shared validator changes are repository tooling; package metadata, release fixture, and release documentation are release-owned.

### Route-Group Ownership

| Route group        | Entry routes                 | Owning feature               | App-wide composition  |
| ------------------ | ---------------------------- | ---------------------------- | --------------------- |
| (release)          | package publish wrapper      | create-mono-stack release    | repository validation |
| (OpenCode tooling) | plugin startup and edit hook | implementation-contract gate | OpenCode runtime      |

### User Journey

1. Entry point: Authorized publication request after the OpenCode plugin repair.
2. User actions: Validate the version and artifact, run the repository gate, commit, push, tag, publish, and verify.
3. Visible success result: npm latest reports 0.1.46 and source refs identify the release commit and tag.
4. Loading and empty states: Publish authentication is checked before the package wrapper runs.
5. Failure and recovery states: Failed validation, hooks, pushes, tags, or publication stop the sequence without bypasses.
6. Final navigation or exit: Release checklist and worktree record the final verified state.

### Complete Test Matrix

| Test ID          | User intent                 | Path                                | Exact expected result                                                        | Test place               | Limitation                                                                                                                         |
| ---------------- | --------------------------- | ----------------------------------- | ---------------------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| TEST-RELEASE-001 | Bump package                | valid patch path                    | Package metadata is 0.1.46                                                   | package metadata check   | None                                                                                                                               |
| TEST-RELEASE-002 | Validate candidate          | success and non-happy paths         | Full repository gate passes after the stale fixture is aligned               | `just check`             | Existing non-failing lint warnings remain                                                                                          |
| TEST-RELEASE-003 | Inspect artifact            | safe and credential-exclusion paths | Artifact is named `create-mono-stack-0.1.46.tgz` and contains no credentials | npm pack dry run         | None                                                                                                                               |
| TEST-RELEASE-004 | Publish release             | success and failure-stop paths      | Commit, branch, tag, and npm latest identify 0.1.46                          | Git and npm verification | Registry propagation may be delayed                                                                                                |
| TEST-RELEASE-005 | Validate generated template | integration success path            | Copier generation and update integration pass                                | package integration test | Requires local integration dependencies; descoped for 0.1.46 after finding an unrelated pre-existing bug, see Unresolved Conflicts |

### Unresolved Conflicts

- Conflict: The implementation fix is not included in the previous 0.1.45 release and the package currently reports 0.1.45.
- Winning rule or blocking question: The explicit publication request and patch-release policy require 0.1.46 for this follow-up.
- Blocked test IDs and implementation items: None.
- Conflict: TEST-RELEASE-005 discovered a real, pre-existing `addApp` managed-reference-template package-scope bug (`@monorepo-template/api-client` is never rescoped when copied into an already-generated project), unrelated to this release's diff and out of its declared feature boundaries.
- Winning rule or blocking question: User was asked how to handle the blocker; user chose to descope 0.1.46, track the bug in a new checklist, and proceed with the OpenCode-plugin-only release.
- Blocked test IDs and implementation items: TEST-RELEASE-005 is documented as a known-issue exception for this release and does not block it; the underlying bug is tracked in `docs/checklists/2026-08-27-addapp-managed-template-package-scope-bug.md`.

## Acceptance Criteria

- [x] Package metadata is version `0.1.46`.
- [x] Release-coupled fixtures use template revision `v0.1.46`.
- [x] `just check` passes without bypasses.
- [/] Package integration tests pass. Descoped by explicit user decision: the run uncovered a real,
  pre-existing `addApp` package-scope bug unrelated to this release's diff (see Unresolved
  Conflicts and TEST-RELEASE-005); tracked separately in
  `docs/checklists/2026-08-27-addapp-managed-template-package-scope-bug.md` and not required for
  this release.
- [x] The npm artifact is `create-mono-stack-0.1.46.tgz` and contains no credentials.
- [ ] Release commit, `master`, annotated tag `v0.1.46`, and npm `latest` identify this release.
- [ ] Release documentation records the changes and validation.

## Exact Validation Cases

### TEST-RELEASE-001: Candidate metadata is patch version 0.1.46

- Small task: Bump the launcher package version for release.
- Source: Published package is `0.1.45`; repository release policy requires a patch increment.
- Test place: `core/create-mono-stack/package.json` metadata parser.
- Starting state: Package metadata is `0.1.45`.
- Exact input or fixture: Version `0.1.46`.
- Interaction steps: Read package metadata and compare its version.
- Main behavior: The candidate is the next patch release.
- Expected result: Package version equals `0.1.46`.
- Must change: `core/create-mono-stack/package.json`.
- Must not happen: Major or minor version changes.
- Planned command: `node -e 'const p=require("./core/create-mono-stack/package.json"); if(p.version!=="0.1.46") process.exit(1)'`
- Expected result before the code change: Fails because metadata is `0.1.45`.
- First observed run: The metadata check observed version `0.1.45` and failed for the 0.1.46 requirement.
- Passing rerun: Metadata check passed with version `0.1.46`.

### TEST-RELEASE-002: Repository release gate passes

- Small task: Validate the complete repository before publication.
- Source: `core/create-mono-stack/AGENTS.md`, release-flow guidance, and the OpenCode fix checklist.
- Test place: Root `just check`.
- Starting state: Candidate version, release fixture, and OpenCode repair are present in the working tree.
- Exact input or fixture: Complete 0.1.46 release candidate.
- Interaction steps: Run the repository gate without bypass flags.
- Main behavior: The release candidate passes required validation.
- Expected result: All checks exit successfully.
- Must change: No source files as a side effect.
- Must not happen: No skipped hooks, disabled checks, or credential changes.
- Planned command: `just check`
- Expected result before the code change: The candidate has not yet passed the 0.1.46 release gate.
- First observed run: Failed at `format-check`: `docs/checklists/2026-08-27-create-mono-stack-0.1.46-release.md` had a Prettier formatting issue introduced while drafting this checklist.
- Passing rerun: After running `pnpm exec prettier --write` on the checklist file, `just check` completed with exit code 0, including build, lint, typecheck, format-check, skills-check, skills-test, and template-test.

### TEST-RELEASE-003: Published artifact is safe and complete

- Small task: Inspect the npm artifact before publication.
- Source: Package `files` allowlist and release workflow.
- Test place: npm pack dry run.
- Starting state: Validated versioned release candidate.
- Exact input or fixture: `create-mono-stack@0.1.46`.
- Interaction steps: Render the pack manifest and inspect file paths and package version.
- Main behavior: The artifact is reproducible and excludes credentials.
- Expected result: Artifact is named `create-mono-stack-0.1.46.tgz` and contains no auth or credential files.
- Must change: No source files.
- Must not happen: Secrets enter the artifact.
- Planned command: `pnpm --filter create-mono-stack exec npm pack --dry-run --json`
- Expected result before the code change: The artifact reports `0.1.45`.
- First observed run: The initial broad filename filter matched nine legitimate `auth` source paths; this was a false positive, not an artifact credential.
- Passing rerun: Precise credential-path inspection reported `create-mono-stack-0.1.46.tgz`, 294 files, and no unsafe paths.

### TEST-RELEASE-004: Git and npm release references agree

- Small task: Commit, tag, publish, and verify the release.
- Source: User authorization and repository release workflow.
- Test place: Git remote refs and npm registry metadata.
- Starting state: Validated release commit and available publish auth configuration.
- Exact input or fixture: `master`, annotated tag `v0.1.46`, and npm package `0.1.46`.
- Interaction steps: Commit, push `master`, create and push the annotated tag, publish through the package wrapper, then query refs and npm metadata.
- Main behavior: Source control and npm identify the same release.
- Expected result: `origin/master`, `v0.1.46`, and npm `latest` resolve to this release.
- Must change: Git history, remote refs, and npm registry.
- Must not happen: No force push, skipped hooks, direct `npm publish`, or unrelated files in the commit.
- Planned command: `git push origin master && git tag -a v0.1.46 -m "Release v0.1.46" && git push origin v0.1.46 && pnpm --filter create-mono-stack publish:package`
- Expected result before the code change: `v0.1.46` and npm `0.1.46` do not exist.
- First observed run: `git push origin master` succeeded (`a9b666a..d2dec5a`). `git tag -a v0.1.46` and `git push origin v0.1.46` succeeded (new tag). `pnpm --filter create-mono-stack publish:package` was blocked by the local auto-mode permission classifier before it ran (npm publish requires explicit interactive approval); no publish attempt reached npm.
- Passing rerun: Pending explicit approval to run the publish command.

### TEST-RELEASE-005: Package integration validation passes

- Small task: Validate the generated template and update flow before publication.
- Source: `core/create-mono-stack/AGENTS.md` package validation requirements.
- Test place: `core/create-mono-stack/test/copier-template.integration.test.js`.
- Starting state: Versioned release candidate has passed local unit and lint checks.
- Exact input or fixture: Controlled local Copier integration fixture.
- Interaction steps: Run the package integration test without contacting the template remote or PyPI.
- Main behavior: Generated-project creation and update behavior remain valid.
- Expected result: The integration test exits successfully.
- Must change: No source files as a side effect.
- Must not happen: Ordinary tests must not contact uncontrolled external services.
- Planned command: `pnpm --filter create-mono-stack test:integration`
- Expected result before the code change: The package integration test has not yet run for 0.1.46.
- First observed run: The integration flow reached generated copy, update, install, build, reference preview, and reference development successfully, then exceeded the 120-second command timeout during managed-member cleanup.
- Second observed run (10-minute timeout): The flow completed copy, update, install, build, reference preview, and reference development, then failed adding a managed `web-vite` app (`admin`): `pnpm install` reported `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND` because `@monorepo-template/api-client@workspace:^` (hardcoded in `core/create-mono-stack/reference-templates/managed/web/package.json`) does not match the rescoped project's actual package name. This is a real, pre-existing bug in `addApp`'s managed-reference-template copy path, confirmed unrelated to this release's diff (see Unresolved Conflicts) and out of this release's declared feature boundaries.
- Passing rerun: Not applicable to this release. Descoped by explicit user decision; the bug is tracked in `docs/checklists/2026-08-27-addapp-managed-template-package-scope-bug.md` for separate follow-up.

## Implementation Plan

- [x] Bump `core/create-mono-stack/package.json` from `0.1.45` to `0.1.46`.
- [x] Update the release-coupled management fixture from `v0.1.45` to `v0.1.46`.
- [x] Run metadata validation, the complete repository gate, and npm pack dry-run inspection. All three pass; the full gate needed one Prettier formatting fix to the release checklist itself before passing.
- [/] Run `pnpm --filter create-mono-stack test:integration`. Descoped: the retry with a 10-minute timeout got past the original timeout point and found a real, pre-existing, unrelated `addApp` package-scope bug (see TEST-RELEASE-005 and Unresolved Conflicts). Tracked in `docs/checklists/2026-08-27-addapp-managed-template-package-scope-bug.md` per explicit user decision; not required for this release.
- [x] Inspect the complete diff and stage only intended release files.
- [ ] Commit with a detailed Conventional Commit message and normal hooks.
- [ ] Push `master`, create and push annotated tag `v0.1.46`.
- [ ] Publish using `pnpm --filter create-mono-stack publish:package`.
- [ ] Verify remote refs, npm metadata, artifact contents, and final worktree state.

## Risks And Non-Goals

- This is a patch release for repository tooling and OpenCode integration correctness.
- The already-published 0.1.45 artifact is not modified.
- Publication requires the ignored `.npmrc.auth` or explicit `NPM_CONFIG_USERCONFIG`.
- npm registry metadata may take a short time to propagate after publication.

## Validation Notes

- First observed and passing results will be recorded after each planned command runs.
