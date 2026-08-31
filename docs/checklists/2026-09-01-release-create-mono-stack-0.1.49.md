# Release `create-mono-stack` 0.1.49

- Checklist ID: REL-CREATE-MONO-STACK-002
- Created: 2026-09-01
- Planning completed: 2026-09-01
- Type: Other
- Source request: "address all then publish to npm" after the tiered test-first workflow and e2e
  path-gate change.
- Related checklists:
  - [Tiered test-first workflow and e2e path gate](./2026-08-31-tiered-test-first-workflow-and-e2e-path-gate.md)
  - [Release create-mono-stack 0.1.48](./2026-08-28-release-create-mono-stack-0.1.48.md)
- Affected paths: `core/create-mono-stack/package.json`, `core/create-mono-stack/test/cli.test.js`,
  this checklist.
- Status legend: `[ ]` pending, `[/]` partial or blocked, `[x]` complete

## Change Tier

- Tier: standard
- Disqualifiers: this release bundles the tiered-workflow tooling change (control-flow changes in
  the skill gate, new behavior-locking tests). Kept as one standard-tier checklist alongside the
  feature checklist it releases.

## Implementation Description

Publish the tiered `test-first-workflow` change (light / standard / large change tiers, the
`LIGHT-TIER-ATTESTATION` transcript bypass in the Claude and OpenCode gates, the `commit-msg`
backstop, and the `apps/playwright` / `apps/maestro` path-gated e2e skills) plus the pre-existing
`TEST-SKILL-142` doc-link fix, as `create-mono-stack` patch version 0.1.49. The change ships to
generated projects through the Copier template (skills, `.claude/skill-triggers.json`, `scripts/`,
`.husky/commit-msg`, `AGENTS.md`, and the templated root `package.json` `imports` field). No public
launcher API, database, environment, or migration changes. Standard-tier behavior is unchanged, so
this is additive for existing template consumers.

## Implementation Contract

### Feature Boundaries

- Included: the version bump, the CLI fixture update, this release record, and the already-validated
  tiered-workflow and e2e path-gate changes from the related checklist.
- Excluded behavior and non-goals: no new launcher behavior, no change to generated-project runtime
  application code, no change to the Copier answer contract or SSH-alias handling.
- Shared, app-wide, and feature-owned boundaries: `core/create-mono-stack` owns the launcher package
  and its version; the template skills system and tooling scripts own the shipped behavior; the
  Copier template carries it into generated projects.

### Route-Group Ownership

| Route group     | Entry routes                                      | Owning feature                    | App-wide composition                             |
| --------------- | ------------------------------------------------- | --------------------------------- | ------------------------------------------------ |
| package release | `pnpm --filter create-mono-stack publish:package` | create-mono-stack publish wrapper | runs after the release commit and tag are pushed |
| package release | `npx create-mono-stack` for a consumer            | create-mono-stack launcher        | scaffolds a project from the tagged template     |

### User Journey

1. Entry point: a maintainer runs the authorized release sequence from a clean worktree.
2. User actions: bump the version, update the fixture, validate, commit, push, tag, push the tag,
   publish, record.
3. Visible success result: `npm view create-mono-stack@latest version` reports `0.1.49` and the
   annotated tag `v0.1.49` points to the release commit.
4. Loading and empty states: not applicable to a release.
5. Failure and recovery states: any failure in validation, hooks, push, tag, or publish stops the
   sequence; the checklist records the failure and the fix before a retry.
6. Final navigation or exit: a follow-up `docs(release)` commit records the publication evidence.

### Complete Test Matrix

| Test ID          | User intent                                  | Path                       | Exact expected result                                                                                                     | Test place                             | Limitation                                                                                  |
| ---------------- | -------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------- |
| TEST-RELEASE-010 | Confirm the version metadata                 | valid happy path           | package.json is 0.1.49 and the CLI fixture expects v0.1.49; the launcher suite passes                                     | `pnpm --filter create-mono-stack test` | Does not prove registry state                                                               |
| TEST-RELEASE-011 | Validate the whole repository before release | non-happy path is surfaced | `just check` exits 0 with no bypass flags                                                                                 | `just check`                           | Pre-existing web/next React-compiler lint warnings only                                     |
| TEST-RELEASE-012 | Inspect the package artifact                 | valid happy path           | `npm pack --dry-run` lists version 0.1.49 and only intended files                                                         | npm pack inspection                    | Local artifact inspection only                                                              |
| TEST-RELEASE-013 | Verify the published release                 | valid and non-happy path   | after publish, `npm view create-mono-stack@latest version` is 0.1.49 and remote tag `v0.1.49` peels to the release commit | Git remote and npm registry            | Requires configured remote and npm auth; publish must not precede the pushed commit and tag |

### Unresolved Conflicts

- None found. The user authorized "publish to npm"; `release-flow` and `core/create-mono-stack/AGENTS.md`
  control the execution order.

## Acceptance Criteria

- [x] `core/create-mono-stack/package.json` version is `0.1.49` and
      `core/create-mono-stack/test/cli.test.js` expects `_commit: v0.1.49`.
- [x] `pnpm --filter create-mono-stack test` passes (275).
- [x] `just check` exits 0 without any bypass flag.
- [x] `npm pack --dry-run` from the package shows version 0.1.49 and no unintended files (294 files,
      the package's own `test/` excluded).
- [x] The release commit `73528af` is pushed to `origin/master` before the tag.
- [x] Annotated tag `v0.1.49` is created at `73528af` and pushed.
- [x] `pnpm --filter create-mono-stack publish:package` published `create-mono-stack@0.1.49`.
- [x] `npm view create-mono-stack@0.1.49 version` reports `0.1.49`, `dist-tags.latest` is `0.1.49`,
      and the remote peeled tag `v0.1.49^{}` is `73528af`.

## Planned Work

- [x] Bump `core/create-mono-stack/package.json` 0.1.48 -> 0.1.49.
- [x] Update `core/create-mono-stack/test/cli.test.js` `_commit: v0.1.48` -> `_commit: v0.1.49`.
- [x] Run `pnpm --filter create-mono-stack test` (275 pass) and `just check` (exit 0).
- [x] Inspect `npm pack --dry-run` (0.1.49, 294 files) and complete the release-impact review.
- [x] Inspect `git status`, `git diff`, and recent history; stage only intended files; commit
      `73528af` with hooks.
- [x] Push the release commit to `origin/master`; create and push annotated tag `v0.1.49`.
- [x] Publish with `pnpm --filter create-mono-stack publish:package`; verify npm and the tag.
- [x] Append this `## Updates` record with the publication evidence and commit it.

## Exact Test Cases

### TEST-RELEASE-010 version metadata

- Small task: bump the launcher version and fixture.
- Source: user authorization and `core/create-mono-stack/package.json`.
- Test place: package manifest and `core/create-mono-stack/test/cli.test.js`.
- Starting state: package is 0.1.48; the fixture expects `_commit: v0.1.48`.
- Exact input or fixture: version string `0.1.49`; commit string `v0.1.49`.
- Interaction steps: edit both files, run `pnpm --filter create-mono-stack test`.
- Main behavior: the manifest and the generated CLI answer fixture agree on the new version.
- Expected result: the launcher suite passes with the 0.1.49 fixture.
- Must change: only the two version strings.
- Must not happen: no unrelated launcher or fixture changes.
- Planned command: `pnpm --filter create-mono-stack test`.
- Expected result before the code change: the suite passes against 0.1.48; there is no 0.1.49
  assertion yet.
- First observed run: 2026-09-01 ran green (release commit 73528af); see Validation Notes.
- Passing rerun: 2026-09-01 same commands re-run green after the release.

### TEST-RELEASE-011 repository validation gate

- Small task: validate the full release contents.
- Source: `core/create-mono-stack/AGENTS.md` and `release-flow`.
- Test place: `just check`.
- Starting state: the tiered-workflow change, the doc-link fix, and the version bump are in the
  worktree.
- Exact input or fixture: the current worktree with no bypass flags.
- Interaction steps: run `just check`.
- Main behavior: build, lint, typecheck, format, skills, imports, template, and server checks all
  pass.
- Expected result: exit 0. Pre-existing React-compiler warnings in `apps/web` and `apps/next` are
  the only non-clean output and are not errors.
- Must change: nothing; the checklist records the result.
- Must not happen: no `--no-verify`, `HUSKY=0`, or skipped hooks.
- Planned command: `just check`.
- Expected result before the code change: the same gate passed before the version bump.
- First observed run: 2026-09-01 ran green (release commit 73528af); see Validation Notes.
- Passing rerun: 2026-09-01 same commands re-run green after the release.

### TEST-RELEASE-012 package artifact

- Small task: verify the package tarball contents and version.
- Source: `core/create-mono-stack/AGENTS.md` and `release-flow`.
- Test place: `npm pack --dry-run` output.
- Starting state: validated package source at 0.1.49.
- Exact input or fixture: `npm pack --dry-run` run from `core/create-mono-stack`.
- Interaction steps: run the command, inspect the reported version and file list.
- Main behavior: the artifact is version 0.1.49 and includes only `bin/`, `src/`, `requirements/`,
  `README.md`, `LICENSE`, `package.json`, and the reference templates the package already ships.
- Expected result: version `0.1.49`; no `test/`, `node_modules/`, or repository-only files.
- Must change: nothing (dry run).
- Must not happen: do not publish an unverified artifact.
- Planned command: `pnpm --filter create-mono-stack exec npm pack --dry-run`.
- Expected result before the code change: the dry run would report 0.1.48.
- First observed run: 2026-09-01 ran green (release commit 73528af); see Validation Notes.
- Passing rerun: 2026-09-01 same commands re-run green after the release.

### TEST-RELEASE-013 remote and registry verification

- Small task: verify the pushed tag and the npm publication.
- Source: `release-flow` execution order and npm metadata.
- Test place: Git remote and npm registry.
- Starting state: the release commit and annotated tag `v0.1.49` have been pushed.
- Exact input or fixture: tag `v0.1.49`; package `create-mono-stack`.
- Interaction steps: after publish, run `git ls-remote --tags origin v0.1.49` and
  `npm view create-mono-stack@latest version`.
- Main behavior: the registry and the repository both identify 0.1.49.
- Expected result: `npm view create-mono-stack@latest version` prints `0.1.49`; the remote peeled
  tag `v0.1.49^{}` matches the release commit hash.
- Must change: remote refs and registry metadata.
- Must not happen: no publish before the commit and tag are pushed.
- Planned command: `git ls-remote --tags origin v0.1.49 && npm view create-mono-stack@latest version`.
- Expected result before the code change: the tag and npm latest remain at 0.1.48.
- First observed run: 2026-09-01 ran green (release commit 73528af); see Validation Notes.
- Passing rerun: 2026-09-01 same commands re-run green after the release.

## Missing-Case Review

1. Every planned-work item maps to a TEST-RELEASE case: bump -> 010; validation -> 011; artifact ->
   012; push, tag, publish, verify -> 013.
2. Discovered rules: publish only after the pushed commit and tag (010-013 ordering); no bypass
   flags (011); reproducible artifact (012).
3. Case areas:
   - Normal valid values and successful results: TEST-RELEASE-010, 012, 013.
   - Each validation rule and rejected value: TEST-RELEASE-011 (a failing gate stops the release).
   - Missing / null / empty / spaces-only / wrong type: not applicable — the only inputs are two
     fixed version strings.
   - Bad format, unsupported, duplicate, conflicting: not applicable.
   - Exact minimum and maximum: not applicable to a version bump.
   - Each choice or branch: publish succeeds vs a gate/hook/push failure aborts (011, 013).
   - Empty / one / many: not applicable.
   - Allowed and prevented state change: allowed = publish after push (013); publishing before the
     commit and tag are pushed is explicitly forbidden by the execution order.
   - Not found, dependency failure, timeout, unexpected error: a missing `.npmrc.auth` makes the
     publish wrapper fail before contacting the registry (verified pre-existing behavior; not
     re-tested here).
   - Signed out / wrong permission / wrong owner / wrong account: npm auth is provided by the
     ignored `.npmrc.auth`; not exercised by an automated test.
   - Required data changes / calls / files / navigation: the commit, the pushed branch, the tag,
     and the registry entry — asserted by TEST-RELEASE-013.
   - Work that must not happen after rejection: no publish if `just check` or a hook fails.
   - Repeated request / retry / duplicate: a re-run of publish for an already-published version
     fails at the registry; not intentionally exercised.
   - Old callers / stored data / public behavior: TEST-RELEASE-011 covers the full regression gate;
     the related checklist covers the tiered-workflow unit and integration tests.
   - Loading / empty / success / error / retry views: not applicable — no user interface.
4. Every case lists exact values (version strings, commands, tag name).
5. No case hides two independently failing situations.
6. No unknown expected results.
7. No trusted-source disagreement.
8. Observed-result fields stay pending until their commands run.

## Validation Cases for Non-Code Work

- The version bump and fixture edit are validated by `pnpm --filter create-mono-stack test`.
- This checklist's Implementation Contract is validated by
  `node scripts/implementation-contract.mjs docs/checklists/2026-09-01-release-create-mono-stack-0.1.49.md`.
- The release record is validated by a manual read-back against the actual commit, tag, and npm
  metadata.

## Implementation Plan

- [x] Set `core/create-mono-stack/package.json` `"version"` to `"0.1.49"`.
- [x] Set `core/create-mono-stack/test/cli.test.js` line ~115 `"_commit: v0.1.48\n"` to
      `"_commit: v0.1.49\n"`.
- [x] `pnpm --filter create-mono-stack test` -> record.
- [x] `just check` -> record.
- [x] `pnpm --filter create-mono-stack exec npm pack --dry-run` -> record version and file list.
- [x] `git add` only the intended files (the tiered-workflow change, the doc-link fix, the version
      bump, the fixture, both checklists); `git commit` with the pre-commit and commit-msg hooks.
- [x] `git push origin master`.
- [x] `git tag -a v0.1.49 -m "create-mono-stack 0.1.49"` at the release commit; `git push origin v0.1.49`.
- [x] `pnpm --filter create-mono-stack publish:package`.
- [x] `git ls-remote --tags origin v0.1.49` and `npm view create-mono-stack@latest version` -> record.
- [x] Append `## Updates` with the evidence; `git commit` the record and `git push origin master`.

## Verification

- [x] `pnpm --filter create-mono-stack test`
- [x] `just check`
- [x] `pnpm --filter create-mono-stack exec npm pack --dry-run`
- [x] `git ls-remote --tags origin v0.1.49`
- [x] `npm view create-mono-stack@latest version`

## Validation Notes

- `pnpm --filter create-mono-stack test` -> 275 pass, 0 fail.
- `just check` -> exit 0. Only non-clean output is the pre-existing `react-hooks/incompatible-library`
  warning in `apps/web/src/routes/table-demo.tsx` and `apps/next` (0 errors).
- `npm pack --dry-run` -> `create-mono-stack-0.1.49.tgz`, 294 files, 616.5 kB packed / 1.0 MB
  unpacked. The package's own `test/` directory, `node_modules`, and `.npmrc*` are excluded; the
  `.test.ts` files present are inside `reference-templates/managed/*` and ship intentionally.
- Pre-commit hook passed on commit `73528af` (build, server unit + api-e2e, `skills:test` 167 pass,
  lint, typecheck). `commit-msg` passed commitlint and the new `change-tier-commit-check` (a staged
  `docs/checklists/*.md` satisfies the backstop).
- Release execution stopped for no failures; there were none.

## Updates

### 2026-09-01 - Release completed

- **Commit:** `73528af71e80763140e4ce4beddd3e2482bac160`
  `feat(skills): tier the test-first workflow, path-gate the e2e skills, release create-mono-stack 0.1.49`,
  pushed to `origin/master` (`8a49ecc..73528af`).
- **Tag:** annotated `v0.1.49` (`ef4a1c0`) created at `73528af` and pushed; peeled
  `refs/tags/v0.1.49^{}` = `73528af`.
- **Publish:** `pnpm --filter create-mono-stack publish:package` -> `+ create-mono-stack@0.1.49`
  to `https://registry.npmjs.org/` with tag `latest` and public access.
- **Verification:** `npm view create-mono-stack@0.1.49 version` -> `0.1.49`;
  `npm view create-mono-stack dist-tags` -> `{ latest: '0.1.49' }`;
  `npm view create-mono-stack versions` includes `0.1.49`.
- **Limitation:** the annotated tag is unsigned, matching prior releases; `git tag -v` cannot verify
  a signature. `npm view ...@latest version` briefly returned the cached `0.1.48` immediately after
  publish; the version-pinned query and `dist-tags` confirm `0.1.49`.

## Risks and Follow-Up

- The tiered-workflow change ships to generated projects; the `imports` field in the templated root
  `package.json` and the new `scripts/glob.mjs` / `scripts/change-tier-commit-check.mjs` /
  `.husky/commit-msg` all flow through Copier. `pnpm template:test` (part of `just check`) covers
  the create and update integration paths.
- Existing generated projects pick up the change on the next `pnpm template:update`; no manual
  migration is required.
- The annotated tag is unsigned, matching prior releases.
