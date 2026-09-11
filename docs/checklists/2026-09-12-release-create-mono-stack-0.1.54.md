# Release `create-mono-stack` 0.1.54

- Checklist ID: REL-CREATE-MONO-STACK-007
- Created: 2026-09-12
- Planning completed: 2026-09-12
- Type: Patch release (hotfix)
- Source request: user reported a third live failure (`ERR_PNPM_WORKSPACE_PKG_NOT_FOUND` for
  `@monorepo-template/api-client` while running `pnpm install` in a generated `jump-cloud-clone`
  project) immediately after the 0.1.53 hotfix let native scaffolding complete for the first time;
  explicitly authorized shipping the fix as an immediate 0.1.54 patch release once implemented and
  validated.
- Related checklists:
  - [Render Project Scope Into Managed-Template Content](2026-09-12-render-managed-template-scope.md)
  - [Use the Managed Template for Fresh Native Scaffolding](2026-09-11-native-scaffold-managed-template.md)
  - [Release create-mono-stack 0.1.53](2026-09-11-release-create-mono-stack-0.1.53.md)
- Affected paths: `core/create-mono-stack/package.json`, `core/create-mono-stack/test/cli.test.js`,
  `core/create-mono-stack/src/native-scaffold.js`, `core/create-mono-stack/src/project-management.js`,
  `core/create-mono-stack/test/native-scaffold-managed-template.test.js`,
  `core/create-mono-stack/test/native-scaffold.helpers.js`,
  `core/create-mono-stack/test/project-management.test.js`, this checklist.
- Status legend: `[ ]` pending, `[/]` partial or blocked, `[x]` complete

## Change Tier

- Tier: standard
- Disqualifiers: the release publishes a public npm artifact and changes generated-project
  dependency resolution (native apps now depend on the generated project's own workspace scope
  instead of the template repository's literal `@monorepo-template/*` scope).

## Implementation Description

Release `create-mono-stack` 0.1.54 as a third hotfix in this chain. The 0.1.53 fix correctly
switched native app scaffolding to copy reference-profile content from the curated
`core/create-mono-stack/reference-templates/managed/<name>/` templates, but that content still
carries its own literal `@monorepo-template/` scope references (in `package.json` dependencies and
TypeScript source imports) that Copier's own `_tasks` scope-rendering script never touches, since it
runs once, before native scaffolding, over the destination project only. Every native app therefore
ended up depending on `@monorepo-template/<pkg>` workspace packages that do not exist in the
generated project (whose own `packages/*` were correctly renamed) — confirmed live by a user's real
`jump-cloud-clone` project failing `pnpm install` with `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND`. The fix
(see the linked "Render Project Scope" checklist for full detail) rewrites `@monorepo-template/` to
the destination project's actual scope across the affected native app directory, mirroring
`scripts/render-package-scope.mjs`'s own substitution rule exactly, right after
`applyReferenceProfile()` finishes copying managed-template content. Also fixes the same latent gap
in `project-management.js`'s `addApp()` (the `create-mono-stack manage` flow), which has always
shared this code path.

## Implementation Contract

### Feature Boundaries

- Included: the scope-rewrite fix, two new regression tests plus a fixture correction that let an
  existing `addApp()` test exercise it, package/fixture version markers, release record, release
  validation, pushed release commit and annotated tag, wrapper-based npm publication.
- Excluded: any other CLI behavior change, `scripts/render-package-scope.mjs` itself, `copier.yml`,
  and any profile definition.
- Ownership: `core/create-mono-stack` owns the published CLI; `applyReferenceProfile()` in
  `native-scaffold.js` owns copying and merging reference-profile content, shared by
  `scaffoldNativeApps()` and `project-management.js`'s `addApp()`.

### Route-Group Ownership

| Route group               | Entry point                                       | Owner                      | Result                                        |
| ------------------------- | ------------------------------------------------- | -------------------------- | --------------------------------------------- |
| Managed-template scaffold | `applyReferenceProfile()`                         | create-mono-stack launcher | Native apps depend on the project's own scope |
| Release artifact          | `npm pack --dry-run`                              | create-mono-stack package  | Inspectable 0.1.54 tarball                    |
| Release publish           | `pnpm --filter create-mono-stack publish:package` | package-local wrapper      | Public npm package after remote tag           |

### User Journey

1. A user creates a project (or adds an app to an existing one), and `pnpm install` fails with
   `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND` for an `@monorepo-template/*` package that does not exist.
2. The package version and template fixture move to 0.1.54; the scope-rewrite fix and its
   regression tests are already committed and validated (see the linked checklist).
3. The release commit is pushed, annotated as `v0.1.54`, and the tag is pushed.
4. The wrapper publishes the verified artifact; npm latest and the remote tag identify 0.1.54.
5. A user creating (or extending) a project ends up with native apps depending on their own
   project's workspace scope, and `pnpm install` succeeds.

### Complete Test Matrix

| Test ID          | Intent                | Path               | Expected result                                             | Test place      | Limitation                      |
| ---------------- | --------------------- | ------------------ | ----------------------------------------------------------- | --------------- | ------------------------------- |
| TEST-RELEASE-060 | Version marker        | valid              | Manifest and fixture both use 0.1.54; launcher suite passes | package test    | Does not prove registry state   |
| TEST-RELEASE-061 | Repository validation | valid/failure gate | `just check` exits 0; failures stop release                 | repository gate | Does not inspect artifact       |
| TEST-RELEASE-062 | Artifact inspection   | valid              | Dry-run tarball is 0.1.54 and excludes credentials/tests    | npm pack        | Does not publish                |
| TEST-RELEASE-063 | Publish verification  | valid/failure gate | Pushed tag peels to release commit and npm latest is 0.1.54 | Git/npm         | Requires network and local auth |

### Unresolved Conflicts

None found. The user explicitly authorized shipping this as an immediate patch release once the fix
was implemented and validated; package and repository instructions prescribe the commit, push, tag,
then publish order, which this release follows.

## Acceptance Criteria

- [x] `core/create-mono-stack/package.json` and the CLI fixture state `0.1.54` / `v0.1.54`.
- [x] Package suite, full repository gate, and dry-run artifact validation pass.
- [x] The release commit and annotated `v0.1.54` tag are pushed to `origin` before publication.
- [x] The package-local wrapper publishes `create-mono-stack@0.1.54`; npm latest and remote tag
      confirm it.

## Exact Test Cases

### TEST-RELEASE-060 version metadata

- Small task: align the package version and CLI template-revision fixture.
- Source: `core/create-mono-stack/package.json`, `core/create-mono-stack/test/cli.test.js`, and
  `release-flow`.
- Test place: `pnpm --filter create-mono-stack test`.
- Starting state: package and fixture use 0.1.53; npm latest is 0.1.53.
- Exact input or fixture: `0.1.54` and `_commit: v0.1.54\n`.
- Interaction steps: update the two version markers and run the package suite.
- Main behavior: the launcher test fixture tracks the released package version.
- Expected result: suite passes with both markers at 0.1.54.
- Must change: exactly the manifest and fixture version strings.
- Must not happen: no launcher behavior or unrelated fixture changes.
- Planned command: `pnpm --filter create-mono-stack test`.
- Expected result before the code change: suite passes at 0.1.53; no fixture expects v0.1.54.
- First observed run: 2026-09-12, updated both markers to 0.1.54 and ran the suite.
- Passing rerun: 2026-09-12, `pnpm --filter create-mono-stack test` passed: 282/282, both markers at
  0.1.54.

### TEST-RELEASE-061 release validation

- Small task: validate all shipped repository behavior before release.
- Source: root and package `AGENTS.md`, `release-flow`.
- Test place: `just check`, plus `pnpm --filter create-mono-stack lint`/`typecheck`.
- Starting state: versioned release candidate with the scope-rewrite fix and its regression tests
  applied.
- Exact input or fixture: repository HEAD with no bypass flags.
- Interaction steps: run `just check`, `pnpm --filter create-mono-stack lint`,
  `pnpm --filter create-mono-stack typecheck`.
- Main behavior: all required build, lint, type, skills, template, and test checks pass.
- Expected result: exit 0 on every command.
- Must change: no source file beyond recorded validation state.
- Must not happen: a hook/check bypass or publication after a failed gate.
- Planned command: `just check`.
- Expected result before the code change: prior committed state (0.1.53) passes; candidate version
  and the scope-rewrite fix are absent.
- First observed run: 2026-09-12, `just check` exited 0 with the fix, its regression tests, and
  both version markers already applied.
- Passing rerun: 2026-09-12, same as first observed run; `pnpm --filter create-mono-stack lint` and
  `pnpm --filter create-mono-stack typecheck` also passed cleanly.

### TEST-RELEASE-062 artifact inspection

- Small task: inspect the exact npm artifact before publishing.
- Source: `core/create-mono-stack/AGENTS.md` and `release-flow`.
- Test place: `npm pack --dry-run` within the package.
- Starting state: validated 0.1.54 package source.
- Exact input or fixture: `pnpm --filter create-mono-stack exec npm pack --dry-run`.
- Interaction steps: run the dry pack and inspect version and file list.
- Main behavior: public artifact contains only declared package files and no auth material.
- Expected result: 0.1.54 tarball; no `.npmrc*`, package test directory, or node_modules.
- Must change: no generated tarball (dry run only).
- Must not happen: publishing an uninspected or credential-containing artifact.
- Planned command: `pnpm --filter create-mono-stack exec npm pack --dry-run`.
- Expected result before the code change: reports 0.1.53.
- First observed run: 2026-09-12, dry run reported `create-mono-stack-0.1.54.tgz`, 299 files,
  617.6 kB packed, 1.0 MB unpacked; same file set as 0.1.53 aside from the fixed source/test files.
- Passing rerun: 2026-09-12, same as first observed run — no code change was needed after inspection.

### TEST-RELEASE-063 remote and registry verification

- Small task: verify the immutable release tag and npm publication.
- Source: `release-flow`, package publish wrapper, and user authorization.
- Test place: `git ls-remote` and `npm view`.
- Starting state: clean release commit and annotated `v0.1.54` pushed to origin.
- Exact input or fixture: `v0.1.54`, expected release commit SHA, package `create-mono-stack@0.1.54`.
- Interaction steps: push commit, create/push tag, publish with wrapper, query tag and registry.
- Main behavior: Git and npm identify the same release version.
- Expected result: remote peeled tag matches the release commit; npm latest version is 0.1.54.
- Must change: origin branch/tag and npm registry metadata.
- Must not happen: direct npm publish, credentials in Git, or publish before the pushed tag.
- Planned command: `git ls-remote --tags origin v0.1.54 && npm view create-mono-stack@latest version`.
- Expected result before the code change: tag does not exist and npm latest is 0.1.53.
- First observed run: 2026-09-12, before pushing, `origin/master` had no `v0.1.54` tag and
  `npm view create-mono-stack@latest version` returned `0.1.53`.
- Passing rerun: 2026-09-12, `git push origin master` (`ae29a1e..1c4a7b4`), `git tag -a v0.1.54`
  then `git push origin v0.1.54` (`git ls-remote --tags origin v0.1.54` returned
  `c8d9cffcbd2a2af91898c9887f44e89d22d22895`, peeling via `git rev-parse v0.1.54^{}` to
  `1c4a7b449e36cfb0cb404cbdd37f41d27274a5be`, equal to `HEAD`), then
  `pnpm --filter create-mono-stack publish:package` succeeded. `npm view create-mono-stack@latest
version` reported `0.1.53` on the first poll, `0.1.54` on the second (~10s propagation delay).

## Missing-Case Review

1. Version marker maps to TEST-RELEASE-060; release gate to 061; artifact to 062; push/tag/publish
   to 063. The functional fix itself (the scope rewrite) is covered by TEST-SCOPE-001/002/003 in
   the linked "Render Project Scope" checklist, not re-derived here.
2. This is a hotfix release; no new acceptance criteria beyond confirming the fix ships and the
   registry reflects it.
3. Invalid form/API/auth/data boundary cases do not apply: fixed version strings only, no runtime
   endpoint, contract, or authorization change beyond the already-covered scaffolding fix.
4. The only retry/duplicate outcome is registry rejection of a duplicate version; not exercised
   intentionally because npm publications are irreversible.
5. Unlike 0.1.53, this release was additionally verified against the real CLI end to end (not only
   unit tests): a local run with `node bin/create-mono-stack.js ... --features api-nest` produced a
   generated project whose `apps/server-app-1/package.json` correctly depended on
   `@create-mono-stack-scope-smoke/{auth,db,entities,env}` with zero remaining
   `@monorepo-template/` references, and a full `pnpm install` in that project completed without
   `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND` — the exact live failure, reproduced and resolved outside the
   unit-test harness. See the linked checklist's Validation Notes for full detail.

## Implementation Plan

- [x] Set `core/create-mono-stack/package.json` version to 0.1.54.
- [x] Set the CLI fixture to `_commit: v0.1.54`.
- [x] Record TEST-RELEASE-060 and 062 validation results in this checklist.
- [x] Run `just check` and record TEST-RELEASE-061.
- [x] Commit release metadata with hooks, push `master`, create/push annotated `v0.1.54`.
- [x] Publish with the package wrapper and record TEST-RELEASE-063 evidence.

## Validation Notes

- Registry baseline: `npm view create-mono-stack version` (before this release) is `0.1.53`.
- TEST-RELEASE-060: `pnpm --filter create-mono-stack test` passed at 0.1.54 (282/282).
- TEST-RELEASE-062: dry run produced `create-mono-stack-0.1.54.tgz`, 299 files, 617.6 kB packed,
  1.0 MB unpacked; excludes the package `test/` directory, `node_modules`, and `.npmrc*`.
- TEST-RELEASE-063: `v0.1.54` was pushed as annotated tag `c8d9cffcbd2a2af91898c9887f44e89d22d22895`,
  peeling to release commit `1c4a7b449e36cfb0cb404cbdd37f41d27274a5be`. The package-local wrapper
  published `create-mono-stack@0.1.54`; npm reports that version as `latest`.

## Updates

### 2026-09-12 - Hotfix released

- Release commit: `1c4a7b449e36cfb0cb404cbdd37f41d27274a5be`
  (`fix(create-mono-stack): render project scope into managed-template content`), pushed to
  `origin/master`.
- Tag: annotated `v0.1.54` (`c8d9cffcbd2a2af91898c9887f44e89d22d22895`) pushed to origin; peeled ref
  `v0.1.54^{}` is `1c4a7b449e36cfb0cb404cbdd37f41d27274a5be`.
- Publication: `pnpm --filter create-mono-stack publish:package` completed successfully with public
  latest access.
- Verification: `npm view create-mono-stack@latest version` reports `0.1.54` (after ~10s
  registry propagation delay).
- This closes out the three-bug chain from this session (`--trust`, managed-template scaffolding,
  scope rendering) with both unit-level and real-CLI end-to-end verification. GitHub's Dependabot
  notice on push remains outstanding and unrelated; not addressed in this release.
