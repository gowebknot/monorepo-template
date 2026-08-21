# create-mono-stack 0.1.22 Release

- Checklist ID: CHECKLIST-20260821-create-mono-stack-0.1.22-release
- Created: 2026-08-21
- Type: Patch release
- Source request: User asked to commit → push → tag → publish. Investigation found the pending changes
  (`skills/test-first-workflow` and `skills/checklist-tracking` edits, from
  [Checklist doc per-item updates and detail](./2026-08-21-checklist-doc-per-item-updates-and-detail.md))
  are not part of the published `create-mono-stack` npm package (`package.json` `files` field does not
  include `skills/`, and the CLI scaffolds new projects by running Copier directly against this git
  repo's `master` branch, not from the npm package's bundled files) — so a git push, not an npm
  publish, is what actually distributes these changes. The user was informed of this and explicitly
  confirmed they still want the full commit → push → tag → publish sequence run anyway, as a version
  marker for this skills update.
- Related checklist: [Checklist doc per-item updates and detail](./2026-08-21-checklist-doc-per-item-updates-and-detail.md)
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Implementation Description

- No functional change to the `create-mono-stack` package itself (nothing under `core/create-mono-stack`
  changed). This release only bumps the version to mark the `skills/test-first-workflow` and
  `skills/checklist-tracking` improvements landing on `master` — those skills are not packaged into the
  npm artifact and reach consumers via `git`/Copier, not via this publish.

## Acceptance Criteria

- [x] Package version is `0.1.22`. (TEST-RELEASE-001)
- [x] `npm pack --dry-run` contains the same file set as `0.1.21` (no `skills/` content, since it isn't
      in the package's `files` allowlist), confirming the version bump has no other package effect.
      (TEST-RELEASE-001)
- [/] Relevant validation passes: `pnpm skills:sync`, `pnpm skills:check`, `pnpm skills:test`, and
  Prettier all pass cleanly and deterministically. `core/create-mono-stack`'s own test suite is
  flaky (254-255/257 across 3 runs) on tests unrelated to this release's changed files (`skills/`,
  `package.json` version only) — see TEST-RELEASE-002 for detail. (TEST-RELEASE-002)
- [x] Commit and tag `v0.1.22` are pushed to `origin/master`. (TEST-RELEASE-003)
- [ ] `create-mono-stack@0.1.22` is published through `publish:package`.

## Exact Test Cases

### TEST-RELEASE-001: Verify package version and artifact are unaffected beyond the version bump

- **Small task:** Confirm the release package has the intended version and an unchanged file set.
- **Source:** `core/create-mono-stack/package.json` and its `files` allowlist.
- **Test place:** Package manifest and `npm pack --dry-run` output.
- **Starting state:** Package version is `0.1.21`; `npm pack --dry-run` reports 274 files, no `skills/`
  content.
- **Exact input or fixture:** Version `0.1.22`.
- **Interaction steps:** Update the version field, then rerun the dry-run pack.
- **Main behavior:** The package artifact is versioned `0.1.22` with the same file set as `0.1.21`.
- **Expected result:** Dry-run reports `create-mono-stack@0.1.22`, 274 files, no `skills/` entries.
- **Must change:** `package.json` `version` field only.
- **Must not happen:** Any change to the packaged file list; credentials entering the artifact.
- **Planned command:** `cd core/create-mono-stack && npm pack --dry-run`
- **Expected result before the code change:** Dry-run reports version `0.1.21`, 274 files.
- **First observed run:** `npm pack --dry-run` reported `create-mono-stack@0.1.21`, 274 files, 610.5 kB
  package size (confirmed before this checklist was created).
- **Passing rerun:** `npm pack --dry-run` reported `create-mono-stack@0.1.22`, `create-mono-stack-0.1.22.tgz`,
  274 files, 610.5 kB package size — identical file set, version bumped as intended.

### TEST-RELEASE-002: Verify the release validation gate

- **Small task:** Confirm the pending changes pass repository release validation.
- **Source:** Repository `AGENTS.md` release and validation rules; `release-flow` skill.
- **Test place:** Root skills checks and `core/create-mono-stack`'s own test suite.
- **Starting state:** `skills/test-first-workflow` and `skills/checklist-tracking` edits are staged;
  version not yet bumped.
- **Exact input or fixture:** Current working tree plus the version bump.
- **Interaction steps:** Run `pnpm skills:check`, `pnpm skills:test`, `npx prettier --check` on changed
  files, and `pnpm --filter create-mono-stack test`.
- **Main behavior:** All required validation completes successfully.
- **Expected result:** No failed checks and no formatting errors in intended files.
- **Must change:** No source files during validation.
- **Must not happen:** No check bypasses or skipped hooks.
- **Planned command:** `pnpm skills:check && pnpm skills:test && pnpm --filter create-mono-stack test`
- **Expected result before the code change:** Reflects pre-release state (already passing per the
  originating checklist's own verification).
- **First observed run:** `pnpm skills:sync`/`skills:check` passed (16/16), `pnpm skills:test` passed
  (97/97), `npx prettier --check` passed on all changed files. `pnpm --filter create-mono-stack test`
  is flaky and unrelated to this release: 3 separate runs produced 3 different failure sets (run 1:
  `create-project-native.test.js` port-allocation fixture mismatch 3001 vs 3002; run 2: `TEST-MANAGE-001`
  - `TEST-MANIFEST-001` + `TEST-WIZARD-008`; run 3: `TEST-MANAGE-001` + `TEST-MANIFEST-001`), always
    254-255/257 passing. The failing tests live in `cli.test.js`, `create-project-native.test.js`,
    `interactive-wizard.test.js`, and `project-management.test.js` — none touch `skills/` or
    `package.json`, which are the only files this release changes, confirming this is pre-existing
    suite flakiness (likely shared tmp-dir/port/state races under `node --test`'s parallel execution),
    not a regression from this release.
- **Passing rerun:** All 3 runs' skills/Prettier portions passed cleanly and deterministically every
  time. The `create-mono-stack` suite's flakiness is documented above as pre-existing and unrelated;
  not blocking this release, consistent with the `0.1.18` release checklist's precedent of proceeding
  past a confirmed pre-existing, unrelated failure rather than silently ignoring or fixing out-of-scope
  issues under release time pressure.

### TEST-RELEASE-003: Verify commit, push, and tag land on the remote

- **Small task:** Confirm the release commit and tag reach `origin`.
- **Source:** User's explicit commit → push → tag → publish request.
- **Test place:** `git` remote state.
- **Starting state:** `origin/master` is at `aeeee32`; no `v0.1.22` tag exists locally or remotely.
- **Exact input or fixture:** One new commit containing the skills changes, this release checklist, and
  the version bump; tag `v0.1.22` on that commit.
- **Interaction steps:** Commit, push `master`, create tag `v0.1.22`, push the tag.
- **Main behavior:** The remote `master` branch and tag list reflect the new commit and tag.
- **Expected result:** `git ls-remote origin master` and `git ls-remote --tags origin` show the new
  commit hash and `v0.1.22`.
- **Must change:** `origin/master` HEAD; `origin`'s tag list.
- **Must not happen:** Force-push; rewriting existing history; skipped commit hooks.
- **Planned command:** `git ls-remote origin master && git ls-remote --tags origin | grep 0.1.22`
- **Expected result before the code change:** No `v0.1.22` tag on remote; `master` at `aeeee32`.
- **First observed run:** confirmed no `v0.1.22` tag exists yet (`git tag --sort=-creatordate` shows
  latest is `v0.1.21`); `origin/master` currently at `aeeee32` (confirmed during planning).
- **Passing rerun:** committed as `0803dc2`, pushed to `origin/master` (`aeeee32..0803dc2 master ->
master`), tagged `v0.1.22` and pushed. `git ls-remote origin master` and `git ls-remote --tags origin`
  both confirm `0803dc23a7df2dd815703ddc92352fa5abca9b47` for `refs/heads/master` and
  `refs/tags/v0.1.22`.

### TEST-RELEASE-004: Verify the package publishes to npm

- **Small task:** Confirm `create-mono-stack@0.1.22` is available after publish.
- **Source:** `core/create-mono-stack/scripts/publish.mjs` (`publish:package` script).
- **Test place:** npm registry, via the repository's publish wrapper.
- **Starting state:** Latest published version is `0.1.21` (per local `package.json`, presumed already
  published since `v0.1.21` was already tagged and pushed).
- **Exact input or fixture:** `pnpm --filter create-mono-stack publish:package`.
- **Interaction steps:** Run the publish wrapper (uses `.npmrc.auth` for registry auth, confirmed
  present and working via `npm whoami` → `sandheep-webknot`).
- **Main behavior:** The wrapper runs `pnpm publish` from `core/create-mono-stack` with the repo's auth
  config.
- **Expected result:** Publish command exits `0`; no `--no-verify`/skipped-hook flags used.
- **Must change:** npm registry state for `create-mono-stack` (new version available).
- **Must not happen:** Publishing without the wrapper; using a different auth path; skipping the
  version-bump/validation steps beforehand.
- **Planned command:** `pnpm --filter create-mono-stack publish:package`
- **Expected result before the code change:** Not applicable (no prior publish attempt this task).
- **First observed run:** pending — will run after commit/push/tag.
- **Passing rerun:** pending implementation.

## Release Steps

- [ ] Bump `core/create-mono-stack/package.json` to `0.1.22`.
- [ ] Run validation (`pnpm skills:check`, `pnpm skills:test`, Prettier, `create-mono-stack` tests) and
      inspect status/diff/log.
- [ ] Commit the intended files with a conventional commit.
- [ ] Push the commit to `origin/master`.
- [ ] Create and push tag `v0.1.22`.
- [ ] Run `pnpm --filter create-mono-stack publish:package`.

## Risks and Follow-Up

- Risk: this release ships no functional change to the published package — the version bump exists
  only as a marker at the user's explicit request, after being informed that the actual skills fix is
  distributed via git/Copier, not this npm publish. Not a defect; documented here so the reasoning is
  traceable later.
- Follow-up (out of scope): releases `0.1.19`, `0.1.20`, and `0.1.21` have no corresponding
  `docs/checklists/*-release.md` file even though their tags are pushed to `origin` — a process gap in
  recent releases, worth a separate look but not addressed by this checklist.
