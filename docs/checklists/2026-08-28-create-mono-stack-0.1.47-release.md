# create-mono-stack 0.1.47 Release

- Checklist ID: CHECKLIST-20260828-create-mono-stack-0.1.47-release
- Related implementation checklist: [Authentication and RBAC Skill and Agent Guidance](./2026-08-28-authentication-rbac-skill-agents-guidance.md)
- Previous release checklist: [create-mono-stack 0.1.46 Release](./2026-08-27-create-mono-stack-0.1.46-release.md)
- Release type: Patch
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

Release the completed portable authentication/RBAC skill and related agent guidance work as
`create-mono-stack` 0.1.47. The package runtime is unchanged; this patch release preserves the
template's documented authentication and authorization workflow for future generated projects.

## Implementation Contract

### Feature Boundaries

- Include the current authentication/RBAC skill, synchronized skill roots, agent guidance, and release metadata.
- Include no new runtime authentication, RBAC, database, environment, API, or generated-app behavior.
- Publish only `create-mono-stack` through `pnpm --filter create-mono-stack publish:package`.

### Route-Group Ownership

| Route group                       | Entry boundary                         | Owner                     | Composition                  |
| --------------------------------- | -------------------------------------- | ------------------------- | ---------------------------- |
| release                           | package publish wrapper                | create-mono-stack release | repository validation        |
| authentication/RBAC documentation | synchronized skill roots and AGENTS.md | portable skill guidance   | package/app local boundaries |

### User Journey

1. Validate the 0.1.47 package candidate and current documentation changes.
2. Inspect the npm artifact for the package allowlist and credential exclusion.
3. Commit with normal hooks, push `master`, create and push annotated `v0.1.47`.
4. Publish through the approved wrapper and verify npm latest, remote refs, and worktree state.

### Complete Test Matrix

| Test ID          | Path type         | Source                             | Test place       | Expected result                                | Limitation                                |
| ---------------- | ----------------- | ---------------------------------- | ---------------- | ---------------------------------------------- | ----------------------------------------- |
| TEST-RELEASE-001 | Happy/valid       | Release policy                     | package metadata | Version is 0.1.47                              | None                                      |
| TEST-RELEASE-002 | Happy/valid       | Repository validation              | just check       | Full gate passes                               | Existing non-blocking warnings may remain |
| TEST-RELEASE-003 | Happy/valid       | Package files allowlist            | npm pack dry-run | Artifact is 0.1.47 and contains no credentials | Registry not contacted                    |
| TEST-RELEASE-004 | Happy/valid       | Explicit publication authorization | Git/npm refs     | Commit, master, v0.1.47, and npm latest agree  | Registry propagation may delay            |
| TEST-RELEASE-005 | Non-happy/invalid | Release safety rules               | publish wrapper  | Missing auth or dirty tree stops publication   | No unsafe retry                           |

### Unresolved Conflicts

- The worktree contains uncommitted documentation changes from the related checklist. **Resolved decision:** include those intended changes in this release commit; do not publish until the worktree is clean.
- Version 0.1.46 is already published. **Resolved decision:** bump to the next patch version, 0.1.47.
- The release workflow requires commit, push, and tag before publish. **Resolved decision:** the user's confirmation authorizes the complete 0.1.47 release sequence.

## Exact Validation Cases

### TEST-RELEASE-001: Candidate metadata is 0.1.47

- Small task: Bump the launcher package version.
- Source: Current package metadata is 0.1.46 and the release policy requires the next patch version.
- Test place: `core/create-mono-stack/package.json` parser.
- Starting state: Package version is 0.1.46.
- Exact input or fixture: Expected version `0.1.47`.
- Interaction steps: Read package metadata and compare its version.
- Main behavior: The candidate is the next patch release.
- Expected result: Version equals `0.1.47`.
- Must change: Package version metadata.
- Must not happen: Major/minor bump or unrelated package version changes.
- Planned command: `node --input-type=module -e 'import { readFile } from "node:fs/promises"; const p=JSON.parse(await readFile("core/create-mono-stack/package.json","utf8")); if(p.version!=="0.1.47") process.exit(1)'`
- Expected result before the code change: The check fails because version is 0.1.46.
- First observed run: The metadata check failed as expected because `core/create-mono-stack/package.json` still reports 0.1.46. The focused publish test passed its existing safety cases.
- Passing rerun: The metadata check passed with version 0.1.47.

### TEST-RELEASE-002: Repository gate passes

- Small task: Validate the release candidate.
- Source: `core/create-mono-stack/AGENTS.md` and release-flow.
- Test place: Root `just check`.
- Starting state: Versioned candidate and intended documentation changes are present.
- Exact input or fixture: Complete 0.1.47 release candidate.
- Interaction steps: Run the repository gate without bypass flags.
- Main behavior: Required checks pass before release operations.
- Expected result: `just check` exits successfully.
- Must change: No source files as a side effect.
- Must not happen: No skipped hooks, disabled checks, or credential changes.
- Planned command: `just check`
- Expected result before the code change: The candidate has not yet passed the 0.1.47 gate.
- First observed run: The package-wide command exposed one expected fixture failure: `TEST-MANAGE-001` still expected template revision `v0.1.46` after the version bump. The artifact dry-run produced `create-mono-stack-0.1.47.tgz`; the publish safety tests passed.
- Passing rerun: `just check` passed with all repository checks successful; the existing non-blocking Next lint warning remains.

### TEST-RELEASE-003: Artifact is safe and complete

- Small task: Inspect the npm artifact.
- Source: Package `files` allowlist and release-flow.
- Test place: `npm pack --dry-run`.
- Starting state: Validated 0.1.47 candidate.
- Exact input or fixture: `create-mono-stack@0.1.47`.
- Interaction steps: Render the pack manifest and inspect paths and version.
- Main behavior: Artifact is reproducible and credential-free.
- Expected result: Artifact is named `create-mono-stack-0.1.47.tgz` and contains no credentials.
- Must change: No source files.
- Must not happen: Secrets or unrelated workspace files enter the artifact.
- Planned command: `pnpm --filter create-mono-stack exec npm pack --dry-run --json`
- Expected result before the code change: Artifact reports version 0.1.46.
- First observed run: The dry run reported `create-mono-stack-0.1.47.tgz`, 294 files, and no credential paths.
- Passing rerun: The final wrapper inspection reported `create-mono-stack-0.1.47.tgz`, 294 files, and no credential paths.

### TEST-RELEASE-004: Git and npm references agree

- Small task: Commit, tag, publish, and verify the release.
- Source: Explicit user authorization and release-flow.
- Test place: Git remote refs and npm registry metadata.
- Starting state: Validated candidate, available npm auth, and clean release commit.
- Exact input or fixture: `master`, annotated `v0.1.47`, and npm `latest`.
- Interaction steps: Commit, push, tag, push tag, publish via wrapper, and query refs/metadata.
- Main behavior: Source control and npm identify the same release.
- Expected result: `origin/master`, `v0.1.47`, and npm latest resolve to 0.1.47.
- Must change: Git history, remote refs, and npm registry.
- Must not happen: No direct `npm publish`, force push, skipped hooks, or unrelated files.
- Planned command: `git push origin master && git tag -a v0.1.47 -m "Release v0.1.47" && git push origin v0.1.47 && pnpm --filter create-mono-stack publish:package`
- Expected result before the code change: Version 0.1.47 refs and npm metadata do not exist.
- First observed run: Not run before commit because the release workflow requires validation and a clean release commit first.
- Passing rerun: `master` and annotated `v0.1.47` were pushed; the package wrapper published successfully; npm latest reports 0.1.47.

### TEST-RELEASE-005: Publication failure stops safely

- Small task: Confirm the approved wrapper rejects unsafe publication prerequisites.
- Source: Existing `publish.test.js` and release-flow.
- Test place: `core/create-mono-stack/test/publish.test.js`.
- Starting state: Synthetic missing `.npmrc.auth` and no publish process started.
- Exact input or fixture: `ENOENT` for `/workspace/.npmrc.auth`.
- Interaction steps: Invoke the wrapper's publish helper with the missing auth fixture.
- Main behavior: Publication stops before spawning pnpm.
- Expected result: A missing-auth error is raised and no publish command starts.
- Must change: No runtime code or tests.
- Must not happen: No network or registry request.
- Planned command: `pnpm --filter create-mono-stack exec node --test test/publish.test.js`
- Expected result before the code change: Existing focused safety test passes for the current wrapper.
- First observed run: The package-wide test command included the publish tests and they passed, but it also exposed the unrelated-to-publish version fixture failure recorded under TEST-RELEASE-001.
- Passing rerun: The focused publish test passed after the version bump.

## Implementation Plan

- [x] Create and validate this release checklist.
- [x] Bump `core/create-mono-stack/package.json` to 0.1.47.
- [x] Run focused tests, artifact inspection, and `just check`.
- [x] Inspect diff and commit only intended files with normal hooks. Release commit: `8982362`.
- [x] Push `master`, create/push annotated `v0.1.47`.
- [x] Publish through the package-local wrapper.
- [x] Verify registry metadata, remote refs, artifact safety, and final status.

## Risks and Non-Goals

- The npm artifact's allowlist excludes the new skill and AGENTS documentation; those changes remain in the repository release commit, not the package payload.
- Publication requires the ignored `.npmrc.auth` or explicit `NPM_CONFIG_USERCONFIG`.
- No runtime auth/RBAC feature is introduced by this release.

## Validation Notes

- The initial package-wide test run exposed the expected version fixture mismatch; updating the
  controlled `TEST-MANAGE-001` fixture to `v0.1.47` resolved it.
- The first release-commit hook run reached the full checks but hit a transient `TEST-WIZARD` Ink
  timeout; no source failure was identified and the commit was not created.
- A second normal-hook attempt hit another transient interactive-wizard timeout in
  `TEST-MULTI-007`; rerunning the complete package suite passed all 275 tests before retrying the
  documentation commit.
- `just check` passed all repository checks, including 275 launcher tests, 22 typechecks, formatting,
  skill validation, and server tests. Existing non-blocking React Compiler warnings remain in table
  demo files.
- `pnpm --filter create-mono-stack publish:package` published `create-mono-stack@0.1.47` with the
  `latest` tag. `npm view` reports version/latest 0.1.47; remote `master` and tag `v0.1.47` resolve
  to release commit `8982362`. npm emitted existing unknown-config warnings but publication succeeded.
- The follow-up release-documentation commit is pending after this checklist update; the package
  release itself is already published and the working tree must be revalidated before pushing the
  documentation record.
