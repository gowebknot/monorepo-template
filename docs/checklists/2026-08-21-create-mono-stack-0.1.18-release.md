# create-mono-stack 0.1.18 Release

- Checklist ID: CHECKLIST-20260821-create-mono-stack-0.1.18-release
- Created: 2026-08-21
- Type: Patch release
- Source request: Publish the manifest-driven React Native root generation and template-update preflight fix.
- Related checklist: [Fix Named React Native Entry Files](./2026-08-21-fix-named-react-native-entry.md)
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Implementation Description

- Generate static React Native root entry/config branches from `.mono-stack.json`.
- Pass `MONO_STACK_APP_PATH` to named React Native processes.
- Run `scripts/dev-ports.mjs` after successful Copier updates.

## Acceptance Criteria

- [x] Package version is `0.1.18`.
- [/] Required tests, lint, formatting, and integration validation pass; full `just check` is blocked only by the pre-existing unrelated `apps/expo/tsconfig.json` formatting change.
- [x] `npm pack --dry-run` contains the intended package files.
- [ ] Commit and tag `v0.1.18` are pushed.
- [ ] `create-mono-stack@0.1.18` is published through `publish:package`.
- [ ] `pnpm template:update` in `ancd` regenerates the reverted native root files.
- [ ] The `ancd` Android bundle returns HTTP `200` for the named app.

## Exact Test Cases

### TEST-RELEASE-001: Verify package version and artifact

- **Small task:** Confirm the release package has the intended version and files.
- **Source:** `core/create-mono-stack/package.json` and package release workflow.
- **Test place:** Package manifest and `npm pack --dry-run` output.
- **Starting state:** Package version is `0.1.17` before the release edit.
- **Exact input or fixture:** Version `0.1.18` and the package file allowlist.
- **Interaction steps:** Update the version and inspect the dry-run artifact.
- **Main behavior:** The package artifact is versioned and contains the implementation files.
- **Expected result:** Dry-run reports `create-mono-stack@0.1.18` and includes `src`, `bin`, `reference-templates`, and `requirements`.
- **Must change:** Package version metadata.
- **Must not happen:** Credentials or unrelated files enter the artifact.
- **Planned command:** `npm pack --dry-run`
- **Expected result before the code change:** Dry-run reports version `0.1.17`.
- **First observed run:** `npm pack --dry-run` reported `create-mono-stack@0.1.18` with 30 files and the intended package directories.
- **Passing rerun:** The same dry-run passed with no credentials or unrelated files in the artifact.

### TEST-RELEASE-002: Verify the release validation gate

- **Small task:** Confirm the implementation passes repository release validation.
- **Source:** Repository `AGENTS.md` release and validation rules.
- **Test place:** Root checks and launcher tests.
- **Starting state:** Version and implementation changes are present.
- **Exact input or fixture:** Current working tree.
- **Interaction steps:** Run tests, lint, formatting, skills, and integration checks.
- **Main behavior:** All required validation completes successfully.
- **Expected result:** No failed checks and no formatting errors in intended files.
- **Must change:** No source files during validation.
- **Must not happen:** No check bypasses or skipped hooks.
- **Planned command:** `just check`
- **Expected result before the code change:** The release gate reflects the pre-release state.
- **First observed run:** `just check` passed lint and typecheck, then failed `format:check` on the unrelated pre-existing `apps/expo/tsconfig.json` change.
- **Passing rerun:** Targeted launcher tests passed 255/255, Copier integration passed, ESLint, Prettier on changed files, and skills checks passed.

### TEST-RELEASE-003: Verify generated-project update behavior

- **Small task:** Confirm the released update script repairs reverted native roots.
- **Source:** Named React Native entry bug and `template:update` behavior.
- **Test place:** `/Users/mr_adventurous/my-adventures/experiments/ancd`.
- **Starting state:** `index.js` or `metro.config.js` is reverted to the stale canonical `apps/mobile` path.
- **Exact input or fixture:** Published `create-mono-stack@0.1.18` template and `ancd` manifest.
- **Interaction steps:** Run `pnpm template:update`, inspect root files, start `mobile-app-2` Metro, and request the Android bundle.
- **Main behavior:** Template update runs the refreshed preflight and Metro resolves the named app.
- **Expected result:** Root files contain `mobile-app-1` and `mobile-app-2`; bundle returns HTTP `200`.
- **Must change:** Only template-owned generated root files and expected update metadata.
- **Must not happen:** The stale `apps/mobile` import or unrelated user files remain changed.
- **Planned command:** `pnpm template:update`
- **Expected result before the code change:** Reverted root files remain stale after update.
- **First observed run:**
- **Passing rerun:**

## Release Steps

- [ ] Bump `core/create-mono-stack/package.json` to `0.1.18`.
- [ ] Run validation and inspect status/diff/log.
- [ ] Commit the intended files with a conventional commit.
- [ ] Push the commit and create/push tag `v0.1.18`.
- [ ] Run `pnpm --filter create-mono-stack publish:package`.
- [ ] Update and verify `ancd`.
