# Template Update Dry-Run Preview

- Checklist ID: CHECKLIST-20260825-template-update-dry-run
- Created: 2026-08-25
- Planning completed: 2026-08-25
- Type: Feature
- Source request: Generated-project agents must preview template updates before applying them.
- Affected modules: `scripts/update-template.mjs`, generated-project update documentation, updater tests
- Related checklist: [Template Update Reuses Project Answers](./2026-08-20-template-update-reuse-project-answers.md)
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Acceptance Criteria

- [x] `pnpm template:update --dry-run` previews changes without modifying the generated project.
- [x] The wrapper maps its dry-run flag to Copier's preview mode and does not forward the wrapper-only flag.
- [x] Dry-run preserves stack data, exclusions, defaults, explicit update arguments, and Git alias handling.
- [x] Dry-run does not synchronize skill triggers or write any post-update files.
- [x] Generated-project instructions require dry-run, conflict review, conflict resolution, and only then the real update.

## Exact Test Cases

### TEST-UPDATE-013: Preview without writing

- **Small task:** Preview a template update without changing project files.
- **Source:** User request and Copier update semantics.
- **Test place:** `core/create-mono-stack/test/template-update.test.js`.
- **Starting state:** Valid stack manifest, available updater environment, and mocked successful subprocesses.
- **Exact input or fixture:** `updateTemplate(["--dry-run"])`.
- **Interaction steps:** Execute the wrapper and inspect the Copier argument list and file writes.
- **Main behavior:** The wrapper invokes Copier in preview mode.
- **Expected result:** Copier receives `--pretend`; the wrapper-only `--dry-run` flag is absent; no writes occur.
- **Must change:** Copier invocation arguments include preview mode.
- **Must not happen:** The generated project or skill-trigger file is modified.
- **Planned command:** `node --test --test-name-pattern='Preview without writing' core/create-mono-stack/test/template-update.test.js`
- **Expected result before the code change:** The test fails because `--dry-run` is not translated and post-update synchronization occurs.
- **First observed run:** The focused tests failed as expected: `--dry-run` was forwarded to Copier and no preview flag was added.
- **Passing rerun:** The focused test passed after translating `--dry-run` to `--pretend` and skipping trigger synchronization during preview.

### TEST-UPDATE-014: Preserve update arguments during preview

- **Small task:** Preserve explicit Copier options while previewing.
- **Source:** Existing update argument forwarding contract.
- **Test place:** `core/create-mono-stack/test/template-update.test.js`.
- **Starting state:** Valid stack manifest and mocked successful subprocesses.
- **Exact input or fixture:** `updateTemplate(["--dry-run", "--vcs-ref", "v1.2.0"])`.
- **Interaction steps:** Execute the wrapper and inspect the final Copier arguments.
- **Main behavior:** Preview mode and explicit revision are both forwarded in valid order.
- **Expected result:** Copier receives `--pretend`, `--defaults`, and `--vcs-ref v1.2.0`; it does not receive `--dry-run`.
- **Must change:** Only the wrapper flag is translated; caller options remain intact.
- **Must not happen:** Explicit options are dropped, duplicated, or reordered before required stack arguments.
- **Planned command:** `node --test --test-name-pattern='Preserve update arguments during preview' core/create-mono-stack/test/template-update.test.js`
- **Expected result before the code change:** The test fails because the wrapper forwards `--dry-run` unchanged.
- **First observed run:** The focused test failed as expected: the wrapper forwarded `--dry-run`, so the expected `--pretend` argument was absent.
- **Passing rerun:** The focused test passed with `--pretend`, `--defaults`, and `--vcs-ref v1.2.0`, with no wrapper-only flag forwarded.

### TEST-UPDATE-015: Normal update side effects remain enabled

- **Small task:** Preserve post-update synchronization for real updates.
- **Source:** Existing skill-trigger synchronization behavior.
- **Test place:** `core/create-mono-stack/test/template-update.test.js`.
- **Starting state:** Valid stack manifest, mocked successful real update, and trigger file fixture.
- **Exact input or fixture:** `updateTemplate(["--defaults"])`.
- **Interaction steps:** Execute the wrapper and inspect the recorded trigger-file write.
- **Main behavior:** A non-preview update still synchronizes skill triggers.
- **Expected result:** Exactly one trigger-file write occurs after successful Copier execution.
- **Must change:** No behavior change for ordinary updates.
- **Must not happen:** The dry-run branch must not disable real-update synchronization.
- **Planned command:** `node --test --test-name-pattern='Normal update side effects remain enabled' core/create-mono-stack/test/template-update.test.js`
- **Expected result before the code change:** Existing behavior should pass; this protects the regression boundary.
- **First observed run:** The implementation rerun passed the preview and normal-update cases; the argument-preservation assertion failed because its slice included `apps/mobile`.
- **Passing rerun:** The focused test passed with exactly one trigger-file write for a successful non-preview update.

### TEST-UPDATE-016: Generated documentation states the required sequence

- **Small task:** Document the mandatory preview-before-apply workflow.
- **Source:** User request and agent workflow requirements.
- **Test place:** Root `AGENTS.md`, root `README.md`, and `core/create-mono-stack/README.md`; exact reference scan and format check.
- **Starting state:** Existing template-update instructions only describe the real update command.
- **Exact input or fixture:** Documentation changes containing `pnpm template:update --dry-run`, conflict review, conflict resolution, and the real update command.
- **Interaction steps:** Search the affected documentation and run formatting validation.
- **Main behavior:** Agents and generated-project users can follow the required sequence.
- **Expected result:** All affected documents explicitly instruct preview, inspect, resolve, then apply.
- **Must change:** Update instructions explain the sequence and show the preview command.
- **Must not happen:** Documentation must not imply that the real update should run before review.
- **Planned command:** `pnpm exec prettier --check AGENTS.md README.md core/create-mono-stack/README.md docs/checklists/2026-08-25-template-update-dry-run.md`
- **Expected result before the code change:** Existing files lack the complete mandatory sequence.
- **First observed run:** The documentation formatting check reported the new checklist needed Prettier formatting; the other affected files passed.
- **Passing rerun:** The focused Prettier check passed after formatting the new checklist.

## Validation Notes

- Copier 9.17.1 documents `--pretend` as the update preview flag: “Run but do not make any changes.”
- A formatting command that included `README.md.jinja` failed because Prettier has no parser for that
  template extension. The supported Markdown and JavaScript files passed when checked separately.
- The full launcher suite reached 274/275 passing; the unrelated `selects additional stack features
through the multiselect screen` case hit its existing ten-second Ink rendering timeout.
- The isolated rerun `node --test test/interactive-wizard.test.js` passed all 24 cases, confirming the
  timeout was intermittent and unrelated to the updater change.

## Test-To-Task Map

| Small task                                               | Test IDs          |
| -------------------------------------------------------- | ----------------- |
| Translate dry-run to Copier preview without side effects | `TEST-UPDATE-013` |
| Preserve explicit update arguments during preview        | `TEST-UPDATE-014` |
| Preserve normal update synchronization                   | `TEST-UPDATE-015` |
| Document the mandatory preview sequence                  | `TEST-UPDATE-016` |

## Implementation Steps

- [x] Add a wrapper-owned dry-run argument parser in `scripts/update-template.mjs` that removes `--dry-run` from caller arguments and adds Copier `--pretend`.
- [x] Gate `synchronizeSkillTriggers` so it runs only after a real successful update.
- [x] Add focused regression tests for preview arguments, no-write behavior, explicit argument preservation, and normal update synchronization.
- [x] Update root and generated-project documentation with the mandatory preview-review-resolve-apply sequence.
- [ ] Run focused tests, package tests, lint, formatting, and relevant template contract checks.

## Risks And Dependencies

- Copier must support `update --pretend` in the pinned requirements used by generated projects.
- The wrapper must continue passing arguments as arrays and must not interpolate user input into a shell command.
- Generated-project template contract tests must continue to verify the updater source is included.
