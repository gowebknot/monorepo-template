# create-mono-stack 0.1.11 Git Tag

- Checklist ID: CHECKLIST-20260818-create-mono-stack-0.1.11-git-tag
- Created: 2026-08-18
- Type: Authorized release metadata completion
- Source request: Create and push a GitHub tag for the already published npm release.
- Related checklist: [create-mono-stack 0.1.11 Release](./2026-08-18-create-mono-stack-0.1.11-release.md)
- Release commit: `46a2f30`
- Status legend: `[ ]` incomplete, `[x]` complete

## Implementation Description

- Create annotated tag `v0.1.11` pointing at the exact commit used to publish `create-mono-stack@0.1.11`.
- Push the tag to the configured GitHub remote.

## Acceptance Criteria

- [x] Tag `v0.1.11` points to commit `46a2f30`.
- [x] Remote GitHub repository contains tag `v0.1.11`.
- [x] npm version `0.1.11` remains the `latest` dist-tag.

## Exact Test Case

### TEST-RELEASE-004: Git tag matches npm release

- **Small task:** Attach the GitHub tag to the published package release commit.
- **Source:** User request and release commit metadata.
- **Test place:** Local Git refs, remote Git refs, and npm registry metadata.
- **Starting state:** Commit `46a2f30` is pushed; npm `latest` is `0.1.11`; tag `v0.1.11` does not exist.
- **Exact input or fixture:** Annotated tag name `v0.1.11`, target commit `46a2f30`.
- **Interaction steps:** Create the annotated tag, push it, then inspect local and remote refs.
- **Main behavior:** GitHub identifies the published npm release commit as `v0.1.11`.
- **Expected result:** Local and remote `v0.1.11` resolve to `46a2f30`; npm `latest` remains `0.1.11`.
- **Must change:** Add and push only the `v0.1.11` tag, plus this tracking record.
- **Must not happen:** No tag overwrite, force push, source change, or npm republish.
- **Planned command:** `git tag -a v0.1.11 46a2f30 -m "Release v0.1.11" && git push origin v0.1.11`
- **Expected result before the code change:** `git show-ref --verify refs/tags/v0.1.11` fails because the tag is absent.
- **First observed run:** `git show-ref --verify refs/tags/v0.1.11` failed as expected because the tag was absent.
- **Passing rerun:** Local and remote tag refs resolve to `46a2f30`; npm reports `latest: 0.1.11`.

## Verification

- [x] Confirm local annotated tag target and metadata.
- [x] Confirm remote tag target.
- [x] Confirm npm `latest` remains `0.1.11`.
- [ ] Commit this checklist without changing the release tag target.
