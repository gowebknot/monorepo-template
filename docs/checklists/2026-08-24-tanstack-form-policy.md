# TanStack Form Policy

Related checklist: [Domain-Driven App Structure Skill Correction](./2026-08-24-domain-driven-app-structure-skill-correction.md)

## Checklist

- [x] Make TanStack Form mandatory in `domain-driven-app-structure`.
  - [x] Add the no-manual-form-state rule to `SKILL.md`.
  - [x] Add a linked TanStack Form example reference with allowed and prohibited patterns.
- [x] Remove manual form value management from application source.
  - [x] Migrate web and Next todo filters to TanStack Form state.
  - [x] Migrate web and Next todo title editing to TanStack Form state.
  - [x] Migrate mobile and Expo todo filters to TanStack Form state.
  - [x] Migrate mobile and Expo todo title editing to TanStack Form state.
  - [x] Apply the same changes to all managed generated-project templates.
  - [x] Migrate web, Next, mobile, and Expo table email filters to TanStack Form state.
- [x] Add a deterministic repository policy test for manual form management.
- [x] Synchronize the four skill roots and validate all affected apps and templates.

## Acceptance Criteria

- Every form, filter, edit flow, and submit interaction uses `@tanstack/react-form`.
- No application or managed-template source stores form field values with local React state.
- Existing UI-only state such as password visibility, menu state, edit-mode visibility, and table state remains allowed.
- The skill contains a usable TanStack Form example reference and explicitly prohibits manual form state.
- A repository test fails when prohibited manual form state is introduced.

## Test Cases

### TEST-FORM-001: Mandatory skill guidance

- **Small task:** Document TanStack Form as mandatory and link the example reference.
- **Source:** User requirement to use TanStack Form everywhere and prohibit manual form management.
- **Test place:** Exact text scan of `skills/domain-driven-app-structure/SKILL.md` and its reference.
- **Starting state:** The skill describes form fields generally but does not mandate TanStack Form or provide a form example.
- **Exact input or fixture:** Terms `@tanstack/react-form`, `mandatory`, `manual form management`, and the relative example reference path.
- **Interaction steps:** Search the canonical skill and reference after editing.
- **Main behavior:** Agents receive an explicit, actionable form rule.
- **Expected result:** The skill requires TanStack Form for every form and rejects local field state; the example demonstrates the required pattern.
- **Must change:** Canonical skill and example reference.
- **Must not happen:** The rule must not allow `useState` or ad hoc handlers to own form values.
- **Planned command:** `rg -n "@tanstack/react-form|mandatory|manual form management|tanstack-form" skills/domain-driven-app-structure`
- **Expected result before the code change:** The mandatory rule and example reference are absent.
- **First observed run:** The scan found only the unrelated phrase `mandatory checklist`; it found no TanStack Form mandate, manual-form prohibition, or example reference.
- **Passing rerun:** The scan found the mandatory TanStack Form rule, manual-management prohibition, and linked example reference.

### TEST-FORM-002: Web and Next form behavior

- **Small task:** Move web and Next todo filter and title-edit values into TanStack Form.
- **Source:** Existing todo demos and user requirement.
- **Test place:** Web/Next typechecks and focused source scan.
- **Starting state:** User filters and edit titles use `useState` with controlled inputs.
- **Exact input or fixture:** Filter value `user-1`; edit title `Updated title`; empty edit title; unchanged title.
- **Interaction steps:** Enter a filter value, load todos, enter edit mode, submit a changed title, cancel editing, and attempt empty or unchanged submissions.
- **Main behavior:** TanStack Form owns field values while query and mutation behavior remains unchanged.
- **Expected result:** Filtering uses the current TanStack Form value; changed titles mutate; empty and unchanged titles do not mutate; cancel discards edits.
- **Must change:** Web and Next reference todo routes.
- **Must not happen:** No local state setter may receive a form field value.
- **Planned command:** `pnpm --filter web typecheck && pnpm --filter next typecheck`
- **Expected result before the code change:** Existing code typechecks but the manual-form policy scan identifies field state.
- **First observed run:** Both web and Next typechecks passed before implementation; the source still contained manual field state.
- **Passing rerun:** Both web and Next typechecks passed after migrating filters, title edits, and table filters.

### TEST-FORM-003: Mobile and Expo form behavior

- **Small task:** Move mobile and Expo todo filter and title-edit values into TanStack Form.
- **Source:** Existing native todo demos and user requirement.
- **Test place:** Mobile/Expo typechecks and focused source scan.
- **Starting state:** User filters and edit titles use `useState` with controlled inputs.
- **Exact input or fixture:** Filter value `user-1`; edit title `Updated title`; empty edit title; unchanged title.
- **Interaction steps:** Enter a filter value, load todos, enter edit mode, submit a changed title, cancel editing, and attempt empty or unchanged submissions.
- **Main behavior:** Native TanStack Form fields own values while query and mutation behavior remains unchanged.
- **Expected result:** Filtering and title mutation behave as before without local form field state.
- **Must change:** Mobile and Expo todo screens.
- **Must not happen:** No `value={...}` plus local setter may manage a form field.
- **Planned command:** `pnpm --filter mobile typecheck && pnpm --filter expo typecheck`
- **Expected result before the code change:** Existing code typechecks but the manual-form policy scan identifies field state.
- **First observed run:** Both mobile and Expo typechecks passed before implementation; the source still contained manual field state.
- **Passing rerun:** Both mobile and Expo typechecks passed after migrating filters, title edits, and table filters.

### TEST-FORM-004: Generated template parity

- **Small task:** Keep generated web, Next, mobile, and Expo templates free of manual form state.
- **Source:** Template ownership rules and generated-project contract.
- **Test place:** `core/create-mono-stack/test` template tests plus policy scan.
- **Starting state:** Managed templates duplicate the manual filter and title-edit state from the apps.
- **Exact input or fixture:** All managed todo route/screen files containing `userId`, `editTitle`, `onChange`, or `onChangeText` field state.
- **Interaction steps:** Scan managed templates and run launcher tests.
- **Main behavior:** Generated projects inherit the TanStack Form policy.
- **Expected result:** No prohibited manual form patterns remain in managed templates and launcher tests pass.
- **Must change:** Managed web, Next, mobile, and Expo template sources.
- **Must not happen:** The generated templates must not drift from application source form behavior.
- **Planned command:** `pnpm --filter create-mono-stack test`
- **Expected result before the code change:** Launcher tests pass but the policy scan finds duplicated manual form state.
- **First observed run:** The launcher suite passed 263 of 264 tests; `selects additional stack features through the multiselect screen` failed because Ink did not render the expected state within one second.
- **Passing rerun:** The launcher suite passed all 264 tests.

### TEST-FORM-005: Static policy enforcement

- **Small task:** Prevent future manual form management from entering apps or generated templates.
- **Source:** User requirement that no manual form management exist in the codebase.
- **Test place:** Repository Node test under `scripts/`.
- **Starting state:** The policy test does not exist.
- **Exact input or fixture:** Application and managed-template source roots; allowed UI-state patterns such as `showPassword`, `isOpen`, and table sorting.
- **Interaction steps:** Run the policy test against all selected source roots.
- **Main behavior:** The policy distinguishes prohibited field state from allowed UI state.
- **Expected result:** The test passes with current migrated code and would fail on a controlled fixture containing local form value state.
- **Must change:** A deterministic policy test and its test registration.
- **Must not happen:** The test must not ban legitimate UI-only state or require network access.
- **Planned command:** `node --test scripts/form-management-policy.test.mjs`
- **Expected result before the code change:** The test file does not exist.
- **First observed run:** The command failed because `scripts/form-management-policy.test.mjs` did not exist yet.
- **Passing rerun:** The policy test passed all 3 cases, and `pnpm skills:test` passed all 104 tests including the policy cases.

## Implementation Description

Make TanStack Form the mandatory form-management library in the domain-driven app structure skill, add a concrete reference example, migrate existing web/native demo field state in apps and managed templates, and enforce the rule with a deterministic repository scan.

## Validation Notes

- The first post-change formatting command reported style issues in `scripts/form-management-policy.test.mjs` and four table demo files; its unquoted `$todoId` path was also expanded by the shell and did not match a file. The affected files were formatted with literal paths before the passing rerun.
- `pnpm skills:sync` synchronized 19 portable skills and `pnpm skills:check` validated them successfully.
- The corrected Prettier check passed for all changed skill, checklist, policy, and application files.
- Web and Next lint completed with existing React Compiler compatibility warnings only. Mobile and Expo do not define lint scripts.
