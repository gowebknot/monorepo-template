# TUI Wizard Question and Option Descriptions

- Checklist ID: CHECKLIST-20260815-tui-wizard-option-descriptions
- Created: 2026-08-15
- Planning completed: 2026-08-15 (backfilled — see Planning Record note below)
- Type: Feature (interactive CLI UX) and test-coverage backfill
- Source request: The `create-mono-stack` interactive wizard TUI showed no description for the
  questions it asks or the options it offers, so a user could not tell why they were being asked a
  question or what an option meant. Add descriptions for both, shown inline for the currently
  highlighted option and as a subtitle under each question label.
- Related checklists: none found for this area.
- Affected paths: `core/create-mono-stack/src/feature-config.js`,
  `core/create-mono-stack/src/interactive-wizard.js`,
  `core/create-mono-stack/test/feature-config.test.js`,
  `core/create-mono-stack/test/interactive-wizard.test.js`
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Planning Record

**Note on process:** This checklist was created after the feature was already implemented and its
first two tests were written, not before, because `test-first-workflow` / `testing-policy` /
`checklist-tracking` were not invoked at the start of that work. This is a backfill: the "Expected
result before the code change" fields below were verified for real, after the fact, by temporarily
`git stash`-ing only `src/feature-config.js` and `src/interactive-wizard.js` (not the test files) and
re-running the new/renamed cases against the pre-change source, then restoring. They are not invented.
See `feedback_invoke_skills_every_task` memory for the corrective standing rule going forward.

- [x] Read `interactive-wizard.js`, `feature-config.js`, and their existing tests to find the question
      and option data shapes (`{ label, value }`, no `description` field anywhere) and the two
      rendering paths (`ink-select-input`'s `SelectInput` for `ChoiceQuestion`/`Confirmation`, a
      hand-rolled multiselect for `FeatureQuestion`).
- [x] Confirmed no existing `description`/`hint`/`subtitle` field existed in the data model (grep
      returned zero matches before implementation).
- [x] Split the work into a question-level description (one per question, shown once under the label)
      and an option-level description (shown only for the currently highlighted option) since these
      are independently testable behaviors.
- [x] Reviewed the already-written tests against this skill's "one clear result per case" rule and
      found two compound tests (each checking both "shows when highlighted" and "moves with the
      cursor" in one case) and three rendering paths — `Confirmation`, `TextQuestion`, and an
      `advancedSteps` sub-step — that were implemented but never independently exercised.
- [x] Found an untested edge case during this review: dynamically-discovered choices (from
      `wizard-discovery.js`, e.g. probed Python executables) carry no `description` field at all, and
      nothing proved `DescribedItem` degrades to plain-label rendering (no dangling separator) for
      them.
- [x] Mid-checklist, the user reviewed the shipped copy live and flagged that the `Python executable`,
      `Template source`, and `Template revision` descriptions restated the label instead of explaining
      the underlying concept in plain English (e.g. "Chooses the Copier template source used to
      scaffold the project" doesn't explain what a template source is or why it matters). Rewrote
      those three plus `Git SSH host alias` for consistency; see Updates-equivalent note in Exact Test
      Cases below — this was caught before commit, so no `## Updates` section was needed, only the
      relevant cases were updated in place per the checklist's uncommitted-work rule.

## Acceptance Criteria

- [x] Every question (`Destination directory`, `Project name`, `Stack features`, `Advanced options`,
      each `advancedSteps` sub-step, feature-name steps, custom text-entry steps, `Ready to create`)
      shows a one-line description under its label explaining why it's being asked, in plain English.
- [x] Every option list where the option itself isn't self-explanatory shows a description, appended
      inline only to the currently highlighted row (not shown for unfocused rows).
- [x] Options and questions with no authored description render exactly as before — no crash, no
      dangling separator.
- [x] Descriptions for Python executable / Template source / Template revision / Git SSH host alias
      explain the underlying concept, not just restate the option label.

## Exact Test Cases

- [x] TEST-FEATURE-001: Every `FEATURE_DEFINITIONS` entry has a non-empty description.
  - Small task: Add stack-feature descriptions.
  - Source: User request; `core/create-mono-stack/src/feature-config.js`.
  - Test place: `core/create-mono-stack/test/feature-config.test.js`.
  - Starting state: `FEATURE_DEFINITIONS` entries have no `description` field.
  - Exact input or fixture: The six `FEATURE_DEFINITIONS` entries.
  - Interaction steps: Iterate `FEATURE_DEFINITIONS` and check each entry's `description`.
  - Main behavior: Every stack-feature choice documents what it is.
  - Expected result: `typeof description === "string"` and non-empty for all six entries.
  - Must change: `FEATURE_DEFINITIONS` gains a `description` on each entry.
  - Must not happen: An entry ships with a missing or empty description.
  - Planned command: `node --test --test-name-pattern='TEST-FEATURE-001' test/feature-config.test.js`.
  - Expected result before the code change: Fails — `description` is `undefined` for every entry.
  - First observed run (pre-change, via `git stash`): Failed as expected —
    `1 fail` (assert.equal `typeof description` "string" vs "undefined").
  - Passing rerun: `node --test --test-name-pattern='TEST-FEATURE-001' test/feature-config.test.js`
    → `1 pass`, `0 fail`.

- [x] TEST-WIZARD-001: Stack features shows its question description and the default-highlighted
      feature's description.
  - Small task: `QuestionHeader` + `DescribedItem` on the `FeatureQuestion` multiselect.
  - Source: User request; `interactive-wizard.js` `FeatureQuestion`.
  - Test place: `core/create-mono-stack/test/interactive-wizard.test.js`.
  - Starting state: Wizard rendered, navigated to the Stack features step (cursor on `web-vite`,
    index 0).
  - Exact input or fixture: `FEATURE_DEFINITIONS[0]` (`web-vite`) and `[1]` (`api-nest`).
  - Interaction steps: Send Enter through Destination and Project name, land on Stack features.
  - Main behavior: The question subtitle and the highlighted option's description both render; a
    non-highlighted option's description does not.
  - Expected result: Frame matches the Stack-features question description and `web-vite`'s
    description; does not match `api-nest`'s description.
  - Must change: n/a (read-only render assertion).
  - Must not happen: `api-nest`'s description leaks into the frame while unfocused.
  - Planned command: `node --test --test-name-pattern='TEST-WIZARD-001' test/interactive-wizard.test.js`.
  - Expected result before the code change: Fails — no question subtitle, no per-option description.
  - First observed run (pre-change, via `git stash`): Failed as expected — `1 fail`.
  - Passing rerun: `1 pass`, `0 fail`.

- [x] TEST-WIZARD-002: Moving the Stack features cursor swaps which option's description is shown.
  - Small task: Cursor-driven description swap in `FeatureQuestion`.
  - Source: Same as TEST-WIZARD-001; split out per "one clear result per case."
  - Test place: `core/create-mono-stack/test/interactive-wizard.test.js`.
  - Starting state: On Stack features, cursor on `web-vite`.
  - Exact input or fixture: Down-arrow keypress.
  - Interaction steps: Send down-arrow; wait for `api-nest`'s description to appear.
  - Main behavior: The previously-highlighted option's description disappears when the highlight
    moves.
  - Expected result: `api-nest`'s description appears; `web-vite`'s no longer matches the frame.
  - Must change: n/a.
  - Must not happen: Both descriptions shown at once.
  - Planned command: `node --test --test-name-pattern='TEST-WIZARD-002' test/interactive-wizard.test.js`.
  - Expected result before the code change: Fails — no descriptions rendered at all, so the wait for
    `api-nest`'s description times out.
  - First observed run (pre-change, via `git stash`): Failed as expected — `1 fail`.
  - Passing rerun: `1 pass`, `0 fail`.

- [x] TEST-WIZARD-003: Advanced options `ChoiceQuestion` shows its question description and the
      default-highlighted choice's description.
  - Small task: `QuestionHeader` + `DescribedItem` on `ChoiceQuestion`/`SelectInput`.
  - Source: User request; `interactive-wizard.js` `ChoiceQuestion`, `advancedChoices`.
  - Test place: `core/create-mono-stack/test/interactive-wizard.test.js`.
  - Starting state: Wizard navigated to Advanced options (default features, "Use defaults"
    highlighted).
  - Exact input or fixture: `advancedChoices[0]` ("Use defaults") and `[1]` ("Configure advanced
    options").
  - Interaction steps: Send Enter through the earlier steps to reach Advanced options.
  - Main behavior: Question subtitle and default-highlighted choice's description render; the other
    choice's description does not.
  - Expected result: Frame matches the (revised, plain-English) Advanced-options question description
    and "Use defaults"'s description; does not match "Configure advanced options"'s description.
  - Must change: n/a.
  - Must not happen: The unfocused choice's description leaks in.
  - Planned command: `node --test --test-name-pattern='TEST-WIZARD-003' test/interactive-wizard.test.js`.
  - Expected result before the code change: Fails — no descriptions rendered.
  - First observed run (pre-change, via `git stash`): Failed as expected — `1 fail`.
  - Passing rerun (after the plain-English wording revision): `1 pass`, `0 fail`.

- [x] TEST-WIZARD-004: Moving the Advanced options cursor swaps which choice's description is shown.
  - Small task: Cursor-driven description swap via `DescribedItem`/`SelectInput`'s `onHighlight`-free
    per-item render.
  - Source: Same as TEST-WIZARD-003; split out per "one clear result per case."
  - Test place: `core/create-mono-stack/test/interactive-wizard.test.js`.
  - Starting state: On Advanced options, "Use defaults" highlighted.
  - Exact input or fixture: Down-arrow keypress.
  - Interaction steps: Send down-arrow; wait for "Configure advanced options — <description>" text.
  - Main behavior: The previous choice's description disappears when the highlight moves.
  - Expected result: "Configure advanced options" shows its description; "Use defaults"'s description
    no longer matches.
  - Must change: n/a.
  - Must not happen: Both descriptions shown at once.
  - Planned command: `node --test --test-name-pattern='TEST-WIZARD-004' test/interactive-wizard.test.js`.
  - Expected result before the code change: Fails — the wait for the appended description times out.
  - First observed run (pre-change, via `git stash`): Failed as expected — `1 fail`.
  - Passing rerun (after the plain-English wording revision): `1 pass`, `0 fail`.

- [x] TEST-WIZARD-005: `Confirmation` ("Ready to create") shows its question description and the
      default-highlighted choice's description.
  - Small task: `QuestionHeader` + `DescribedItem` on the `Confirmation` screen (previously untested).
  - Source: User request; `interactive-wizard.js` `Confirmation`, `confirmationChoices`.
  - Test place: `core/create-mono-stack/test/interactive-wizard.test.js`.
  - Starting state: Wizard navigated all the way to the confirmation screen with default answers.
  - Exact input or fixture: `confirmationChoices[0]` ("Create project") and `[1]` ("Cancel").
  - Interaction steps: Send Enter through every prior step to reach "Ready to create".
  - Main behavior: Question subtitle and the default-highlighted choice's description render;
    "Cancel"'s description does not.
  - Expected result: Frame matches the confirm-screen description and "Create project"'s description;
    does not match "Cancel"'s description.
  - Must change: n/a.
  - Must not happen: "Cancel"'s description leaks in while unfocused.
  - Planned command: `node --test --test-name-pattern='TEST-WIZARD-005' test/interactive-wizard.test.js`.
  - Expected result before the code change: Fails — `Confirmation` used a bare bold `Text` label and
    the default `ink-select-input` `Item`, neither of which render a description.
  - First observed run (pre-change, via `git stash`): Failed as expected — `1 fail`.
  - Passing rerun: `1 pass`, `0 fail`.

- [x] TEST-WIZARD-006: A `TextQuestion` screen (custom destination) shows its question description.
  - Small task: `QuestionHeader` on `TextQuestion` (previously untested).
  - Source: User request; `interactive-wizard.js` `TextQuestion`, `destinationDescription`.
  - Test place: `core/create-mono-stack/test/interactive-wizard.test.js`.
  - Starting state: Wizard on the Destination step, "Custom destination" highlighted.
  - Exact input or fixture: `destinationDescription` string.
  - Interaction steps: Down-arrow to "Custom destination", Enter to reach the free-text step.
  - Main behavior: The question subtitle renders above the text input on a `TextQuestion` screen.
  - Expected result: Frame matches the destination description text.
  - Must change: n/a.
  - Must not happen: n/a (positive presence check only).
  - Planned command: `node --test --test-name-pattern='TEST-WIZARD-006' test/interactive-wizard.test.js`.
  - Expected result before the code change: Fails — `TextQuestion` rendered only a bare bold label.
  - First observed run (pre-change, via `git stash`): Failed as expected — `1 fail`.
  - Passing rerun: `1 pass`, `0 fail`.

- [x] TEST-WIZARD-007: An `advancedSteps` sub-step (Git SSH host alias) shows its question description
      and its default-highlighted option's description.
  - Small task: `QuestionHeader` + `DescribedItem` on an `advancedSteps`-driven `ChoiceQuestion`
    (previously only the top-level "Advanced options" menu was tested, not a sub-step).
  - Source: User request; `interactive-wizard.js` `advancedSteps[0]` (`gitHostAlias`).
  - Test place: `core/create-mono-stack/test/interactive-wizard.test.js`.
  - Starting state: Wizard navigated to "Configure advanced options" → "Git SSH host alias".
  - Exact input or fixture: `advancedSteps[0].description` and its first choice's description.
  - Interaction steps: Send Enter/down-arrow through prior steps to reach the sub-step.
  - Main behavior: The sub-step's question description and default-highlighted option's description
    both render.
  - Expected result: Frame matches the (revised) Git-SSH-alias question description and "No alias
    (default: none)"'s (revised) description.
  - Must change: n/a.
  - Must not happen: n/a (positive presence check only).
  - Planned command: `node --test --test-name-pattern='TEST-WIZARD-007' test/interactive-wizard.test.js`.
  - Expected result before the code change: Fails — sub-steps used the same undescribed `ChoiceQuestion`
    rendering as everything else pre-change.
  - First observed run (pre-change, via `git stash`): Failed as expected — `1 fail`.
  - Passing rerun (after the plain-English wording revision): `1 pass`, `0 fail`.

- [x] TEST-WIZARD-008: A dynamically-discovered choice with no authored description renders its label
      only, even while highlighted.
  - Small task: `DescribedItem` degrades gracefully when `description` is absent (edge case surfaced
    while reviewing coverage, not part of the original two tests).
  - Source: `interactive-wizard.js` `DescribedItem`; `wizard-discovery.js` (discovered Python/SSH/
    template/revision choices carry no `description`).
  - Test place: `core/create-mono-stack/test/interactive-wizard.test.js`.
  - Starting state: Wizard given an injected `options.python` choice with no `description`, navigated
    to Python executable, highlight moved onto that choice.
  - Exact input or fixture: `{ label: "pyenv-python (3.12.4)", value: "pyenv-python" }`.
  - Interaction steps: Navigate to Python executable; down-arrow until the cursor glyph (`❯`) is next
    to `pyenv-python (3.12.4)`.
  - Main behavior: A highlighted option with no `description` shows plain label text, no dangling
    separator.
  - Expected result: Frame matches the label; does not match the label followed by " — ".
  - Must change: n/a.
  - Must not happen: A trailing "—" with nothing after it, or a crash.
  - Planned command: `node --test --test-name-pattern='TEST-WIZARD-008' test/interactive-wizard.test.js`.
  - Expected result before the code change: **This case does not discriminate before/after** — before
    the feature existed, no choice had a description either, so the "no dangling separator" assertion
    was already trivially true. Recorded honestly rather than claimed as a red→green case: it is a
    regression guard for the future (if `DescribedItem` is later changed to append unconditionally),
    not proof the feature works.
  - First observed run (pre-change, via `git stash`): Passed (as predicted above) — `1 pass`.
  - Passing rerun: `1 pass`, `0 fail`.

## Implementation Plan

- [x] Add `description` to `FEATURE_DEFINITIONS` (`feature-config.js`).
- [x] Add `QuestionHeader` (question-level subtitle) and `DescribedItem` (option-level, highlighted-row
      only) components in `interactive-wizard.js`; wire into `TextQuestion`, `ChoiceQuestion`,
      `FeatureQuestion`, and `Confirmation`.
- [x] Add `description` to every static choice array (`advancedChoices`, `destinationChoices`,
      `confirmationChoices`, the `Back` choice, `advancedSteps[*].choices`, `projectNameChoices`) and a
      per-question description threaded through every call site.
- [x] Split the two original compound tests into `TEST-WIZARD-001..004`; add `TEST-WIZARD-005..008` to
      close the `Confirmation` / `TextQuestion` / advanced-sub-step / no-description-edge-case gaps.
- [x] Rewrite the `Python executable`, `Template source`, `Template revision`, and `Git SSH host alias`
      descriptions in plain English after user review flagged they restated the label instead of
      explaining the concept; updated the two test assertions that quoted the old wording.

## Verification

- [x] Ran every `TEST-WIZARD-*` / `TEST-FEATURE-001` case individually with
      `node --test --test-name-pattern=...`, recording first (pre-change, via targeted `git stash` of
      only the two source files) and passing reruns above.
- [x] `cd core/create-mono-stack && npm test` — `176 pass`, `0 fail`.
- [x] `cd core/create-mono-stack && npm run lint` — clean, no output.
- [x] `npx prettier --write` run on all changed source and test files.

## Risks and Follow-Up

- [x] Long descriptions can word-wrap inside the wizard's bordered box at narrower terminal widths;
      tests account for this with a border-stripping/whitespace-collapsing frame normalizer
      (`normalizeFrame`/`flattenFrame`/`wrapped` in `interactive-wizard.test.js`), but very narrow real
      terminals will visually wrap mid-sentence. Not addressed here — pre-existing wizard text (e.g.
      the app-name prompts) has the same property, so this matches existing behavior rather than
      introducing a new class of issue.
- [ ] Only one `advancedSteps` sub-step (`gitHostAlias`) has a dedicated per-sub-step test
      (TEST-WIZARD-007); `python`, `template`, and `vcsRef` share the exact same `ChoiceQuestion`
      rendering path and were covered indirectly (full-suite pass, manual description review), but
      don't have their own `TEST-WIZARD-*` case. Low risk since the rendering code is identical, but
      flagged rather than silently claimed as fully covered.
