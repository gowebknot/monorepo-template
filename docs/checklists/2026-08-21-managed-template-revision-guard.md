# Managed Template Revision Guard

- Checklist ID: CHECKLIST-20260821-managed-template-revision-guard
- Created: 2026-08-21
- Type: Feature correction
- Source request: `manage` must require the project template update before managing apps.
- Related checklist: [Publish Managed App Profiles](./2026-08-21-publish-managed-app-profiles.md)
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Implementation Description

- Check `.copier-answers.yml` before opening the management wizard.
- Compare the project template revision with the launcher’s packaged release revision.
- Tell users to run the template update when the revision is missing or stale.

## Acceptance Criteria

- [x] Current projects can enter management.
- [x] Stale projects are rejected before prompts or side effects.
- [x] Projects without Copier revision metadata are rejected with update instructions.
- [x] The guard is included in the published launcher version `0.1.21`.

## Exact Test Cases

### TEST-REVISION-001: Allow management at the current revision

- **Small task:** Preserve management for an updated project.
- **Source:** `ancd/.copier-answers.yml` after updating to `v0.1.21`.
- **Test place:** `core/create-mono-stack/test/cli.test.js`.
- **Starting state:** Project has `.mono-stack.json` and `_commit: v0.1.21`.
- **Exact input or fixture:** `main(["manage", projectRoot])` with a current revision.
- **Interaction steps:** Invoke the CLI and provide a management prompt stub.
- **Main behavior:** The prompt is opened.
- **Expected result:** Management proceeds normally.
- **Must change:** Prompt and management callbacks run.
- **Must not happen:** An update-required error is thrown.
- **Planned command:** `node --test test/cli.test.js --test-name-pattern='TEST-MANAGE-001'`
- **Expected result before the code change:** Existing test continues to pass.
- **First observed run:** Existing management test passed before the guard implementation.
- **Passing rerun:** Focused CLI tests passed, including the current-revision management path.

### TEST-REVISION-002: Reject a stale revision before prompting

- **Small task:** Block management for a project on `v0.1.19`.
- **Source:** User report that `ancd` remained on `v0.1.19`.
- **Test place:** `core/create-mono-stack/test/cli.test.js`.
- **Starting state:** Project has `_commit: v0.1.19`.
- **Exact input or fixture:** Expected launcher revision `v0.1.21`.
- **Interaction steps:** Invoke `main(["manage", projectRoot])`.
- **Main behavior:** Stale management is rejected.
- **Expected result:** Error instructs the user to run template update for `v0.1.21`.
- **Must change:** None.
- **Must not happen:** Prompt or management callback runs.
- **Planned command:** `node --test test/cli.test.js --test-name-pattern='older template revision'`
- **Expected result before the code change:** Existing code reports missing `.mono-stack.json` instead.
- **First observed run:** Failed with the existing `.mono-stack.json` error, confirming the guard was absent.
- **Passing rerun:** Focused CLI tests passed with the stale revision rejected before manifest or prompt access.

### TEST-REVISION-003: Reject missing revision metadata

- **Small task:** Block management when Copier metadata is missing.
- **Source:** Same update prerequisite as TEST-REVISION-002.
- **Test place:** `core/create-mono-stack/test/cli.test.js`.
- **Starting state:** Project has no `.copier-answers.yml`.
- **Exact input or fixture:** Expected launcher revision `v0.1.21`.
- **Interaction steps:** Invoke `main(["manage", projectRoot])`.
- **Main behavior:** Missing update metadata is rejected.
- **Expected result:** Error instructs the user to run template update for `v0.1.21`.
- **Must change:** None.
- **Must not happen:** Prompt or management callback runs.
- **Planned command:** `node --test test/cli.test.js --test-name-pattern='revision is missing'`
- **Expected result before the code change:** Existing code reports missing `.mono-stack.json` instead.
- **First observed run:** Failed with the existing `.mono-stack.json` error, confirming the guard was absent.
- **Passing rerun:** Focused CLI tests passed with missing revision metadata rejected before management.

## Implementation Steps

- [x] Add revision parsing and validation before management.
- [x] Run focused and package tests.
- [x] Release `create-mono-stack@0.1.21`.
- [x] Verify `ancd` can add `mobileApp3` with the published `0.1.21` manager implementation.

## Validation Notes

- `ancd` was updated from `_commit: v0.1.19` to `v0.1.20`, then to `v0.1.21` after the guard release.
- `mobileApp3` was created with `react-native/default`; Metro responded with HTTP `200` on port `8087`.
