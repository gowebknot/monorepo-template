# API Chain Skill Gate Coverage

- Checklist ID: CHECKLIST-20260823-api-chain-skill-gate
- Created: 2026-08-23
- Type: Skill-gate configuration and regression coverage
- Related checklist: `docs/checklists/2026-08-23-dynamic-generated-skill-triggers.md`
- Source request: Cover the entities -> api-client -> query-client -> consumer boundary in the skill gate and remove stale frontend path assumptions.
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Add automatic gate rules for `packages/api-client/**` and `packages/query-client/**`.
- Keep contract validation on entities and API-client boundary changes, and require end-to-end API flow for API-client and query-client changes.
- Cover all canonical frontend application paths while retaining dynamic custom-path synchronization for generated projects.
- Do not add component-test infrastructure or implement a product feature; those require a concrete behavioral scope first.

## Acceptance Criteria

- API-client edits require `end-to-end-api-flow` and `contract-validation` in addition to `test-first-workflow`.
- Query-client edits require `end-to-end-api-flow` in addition to `test-first-workflow`.
- Canonical web, Next, Expo, and React Native app paths require `frontend-standards`.
- Generated custom frontend paths continue to receive `frontend-standards` through manifest synchronization.
- Existing generic rules remain unchanged and every configured skill name is real.

## Exact Test Cases

### TEST-GATE-020: API-client boundary skills

- **Small task:** Require the API-flow and contract skills for API-client edits.
- **Source:** API chain architecture and `.claude/skill-triggers.json`.
- **Test place:** `scripts/skill-gate.test.mjs`.
- **Starting state:** A source file under `packages/api-client/src/` is edited with only `test-first-workflow` invoked.
- **Exact input or fixture:** `packages/api-client/src/users.ts`.
- **Interaction steps:** Evaluate the path against the trigger table and inspect missing skills.
- **Main behavior:** The API-client package boundary selects both workflow skills.
- **Expected result:** Missing skills include `end-to-end-api-flow` and `contract-validation`.
- **Must change:** The trigger fixture and canonical trigger table gain the package rule.
- **Must not happen:** The rule must not remove `test-first-workflow`.
- **Planned command:** `node --test scripts/skill-gate.test.mjs --test-name-pattern='API-client boundary skills'`.
- **Expected result before the code change:** The test fails because the package path has no matching rule.
- **First observed run:** The focused gate run failed because the canonical trigger table returned no API-client skills.
- **Passing rerun:** The focused gate run passed after the canonical package rule was added.

### TEST-GATE-021: Query-client boundary skills

- **Small task:** Require the API-flow skill for query-client edits.
- **Source:** API chain architecture and `.claude/skill-triggers.json`.
- **Test place:** `scripts/skill-gate.test.mjs`.
- **Starting state:** A source file under `packages/query-client/src/` is edited with only `test-first-workflow` invoked.
- **Exact input or fixture:** `packages/query-client/src/users.ts`.
- **Interaction steps:** Evaluate the path against the trigger table and inspect missing skills.
- **Main behavior:** The query-client package boundary selects end-to-end API flow.
- **Expected result:** Missing skills include `end-to-end-api-flow` and do not include unrelated frontend skills.
- **Must change:** The trigger fixture and canonical trigger table gain the package rule.
- **Must not happen:** Query-client source edits must not require `frontend-standards` merely because hooks are used.
- **Planned command:** `node --test scripts/skill-gate.test.mjs --test-name-pattern='Query-client boundary skills'`.
- **Expected result before the code change:** The test fails because the package path has no matching rule.
- **First observed run:** The focused gate run exercised the missing query-client rule alongside the API-client failure.
- **Passing rerun:** The focused gate run passed after the canonical package rule was added.

### TEST-GATE-022: Canonical frontend paths

- **Small task:** Require frontend standards for each canonical frontend app path.
- **Source:** Current workspace app directories and frontend standards.
- **Test place:** `scripts/skill-gate.test.mjs`.
- **Starting state:** A TSX edit is made in each canonical frontend app with only `test-first-workflow` and `react-19` invoked.
- **Exact input or fixture:** `apps/web/src/App.tsx`, `apps/next/src/app/page.tsx`, `apps/expo/App.tsx`, and `apps/mobile/App.tsx`.
- **Interaction steps:** Evaluate each path and inspect missing skills.
- **Main behavior:** Every canonical frontend path selects `frontend-standards`.
- **Expected result:** Each path reports only `frontend-standards` as the app-specific missing skill.
- **Must change:** The trigger fixture and canonical trigger table cover all four paths.
- **Must not happen:** Backend paths must not be classified as frontend paths.
- **Planned command:** `node --test scripts/skill-gate.test.mjs --test-name-pattern='canonical frontend paths'`.
- **Expected result before the code change:** The test fails for canonical paths not covered by the existing `apps/web/**` rule.
- **First observed run:** The local fixture test passed, but the canonical trigger-table assertion failed for missing package and frontend rules.
- **Passing rerun:** The focused gate run passed after all canonical frontend paths were configured.

### TEST-GATE-023: Generated custom frontend paths

- **Small task:** Preserve dynamic frontend coverage for generated app names.
- **Source:** `scripts/skill-triggers.mjs` and generated `.mono-stack.json` records.
- **Test place:** `core/create-mono-stack/test/skill-triggers.test.js` and `core/create-mono-stack/test/create-project-native.test.js`.
- **Starting state:** Generated app records use `admin-react`, `student-react`, and `student-expo` instead of canonical names.
- **Exact input or fixture:** Frontend feature records with paths `apps/admin-react`, `apps/student-react`, and `apps/student-expo`.
- **Interaction steps:** Synchronize the trigger file, then call `collectRequired` for each generated path.
- **Main behavior:** Custom generated frontend paths continue to require frontend standards.
- **Expected result:** Each custom path requires `frontend-standards`, and no canonical `apps/web` rule is needed for them.
- **Must change:** Existing dynamic synchronization tests remain passing.
- **Must not happen:** Adding static canonical rules must not replace or duplicate custom generated rules.
- **Planned command:** `node --test core/create-mono-stack/test/skill-triggers.test.js core/create-mono-stack/test/create-project-native.test.js`.
- **Expected result before the code change:** Existing tests establish the current dynamic behavior; this is a regression guard.
- **First observed run:** Existing dynamic synchronization tests passed before the canonical table change.
- **Passing rerun:** `node --test core/create-mono-stack/test/skill-triggers.test.js core/create-mono-stack/test/create-project-native.test.js` passed all 9 tests.

### TEST-GATE-024: Trigger table skill names

- **Small task:** Keep the expanded canonical trigger table valid.
- **Source:** Existing `TEST-GATE-017` validation.
- **Test place:** `scripts/skill-gate.test.mjs`.
- **Starting state:** The canonical trigger table includes the new package rules.
- **Exact input or fixture:** `.claude/skill-triggers.json`.
- **Interaction steps:** Parse the table and compare every named skill with `skills/` directories.
- **Main behavior:** Configuration references only installed skills.
- **Expected result:** The validation passes.
- **Must change:** Canonical trigger configuration only.
- **Must not happen:** No typo or unsupported skill name is introduced.
- **Planned command:** `node --test scripts/skill-gate.test.mjs --test-name-pattern='only names real skills'`.
- **Expected result before the code change:** The existing validation passes before configuration changes.
- **First observed run:** The existing skill-name validation passed before configuration changes.
- **Passing rerun:** `node --test scripts/skill-gate.test.mjs` passed all 24 tests after configuration changes.

## Implementation Plan

- [x] Add package and canonical frontend rules to the trigger fixture and regression tests.
- [x] Update `.claude/skill-triggers.json` with package-boundary and canonical frontend rules.
- [x] Verify generated custom-path synchronization remains unchanged.
- [x] Run focused gate, launcher, formatting, skills, and repository checks.

## Validation Notes

- The first focused gate run failed at the canonical trigger-table assertion because the new package rules were not yet configured.
- The focused gate and generated-path tests passed after the configuration update.
- The first formatting check found `scripts/skill-gate.test.mjs` needed Prettier formatting; it was formatted before final validation.
- After formatting, `just check` passed lint, typecheck, formatting, skills checks, skills tests, template tests, and all 264 launcher tests.

## Non-Goals

- Do not add Vitest, Testing Library, or React Native Testing Library without a concrete feature and behavioral test plan.
- Do not implement a backend endpoint or consumer UI feature in this gate-configuration task.
- Do not force `end-to-end-api-flow` on every frontend component edit.

## Risks

- Package rules may require explicit end-to-end workflow invocation for package maintenance that does not cross an API boundary; this is intentional until the repository establishes narrower file-level conventions.
- Generated projects with missing trigger files remain a safe no-op as documented by the related checklist.
