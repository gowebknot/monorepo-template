# API Chain Skill Gate Contract Scope Correction

- Checklist ID: CHECKLIST-20260823-api-chain-skill-gate-contract-scope
- Created: 2026-08-23
- Type: Skill-gate configuration correction and regression coverage
- Related checklist: `docs/checklists/2026-08-23-api-chain-skill-gate.md`
- Source request: Keep the API-client and query-client trigger scope limited to the two identified gaps; do not broaden the API-client rule with `contract-validation`.
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Retain `end-to-end-api-flow` for edits under `packages/api-client/**` and `packages/query-client/**`.
- Remove only the extra `contract-validation` requirement from `packages/api-client/**`.
- Keep entity, DTO, and schema rules unchanged.
- Do not change application runtime behavior or unrelated skill triggers.

## Acceptance Criteria

- API-client edits require `end-to-end-api-flow` and do not require `contract-validation` solely because of their package path.
- Query-client edits require `end-to-end-api-flow` and do not require `contract-validation` or frontend skills solely because of their package path.
- Existing entity and schema paths still require `contract-validation`.
- All configured skill names remain real installed skills.
- No application runtime files change.

## Exact Test Cases

### TEST-GATE-025: API-client trigger scope

- **Small task:** Keep API-client edits within the end-to-end API flow boundary without adding contract validation.
- **Source:** User clarification and `skills/end-to-end-api-flow/SKILL.md`; `contract-validation/SKILL.md` does not name the API-client package.
- **Test place:** `scripts/skill-gate.test.mjs`.
- **Starting state:** A source file under `packages/api-client/src/` is edited with only `test-first-workflow` invoked.
- **Exact input or fixture:** `packages/api-client/src/users.ts`.
- **Interaction steps:** Evaluate the path against the trigger fixture and canonical trigger table; inspect required and missing skills.
- **Main behavior:** The API-client package path selects only its intended package-boundary skill.
- **Expected result:** Required package-specific skill is `end-to-end-api-flow`; `contract-validation` is absent.
- **Must change:** The API-client rule and its assertions.
- **Must not happen:** The entities/schema contract rule must not be removed or broadened.
- **Planned command:** `node --test scripts/skill-gate.test.mjs --test-name-pattern='API-client'`.
- **Expected result before the code change:** The test fails because the API-client rule currently includes `contract-validation`.
- **First observed run:** The focused run failed in TEST-GATE-020 because the canonical API-client rule still reported `contract-validation`, and TEST-GATE-024 reported the same stale extra skill.
- **Passing rerun:** The focused gate run passed all 24 tests after the trigger fixture and canonical rule were corrected.

### TEST-GATE-026: Query-client trigger scope

- **Small task:** Keep query-client edits within the end-to-end API flow boundary.
- **Source:** User clarification and `skills/end-to-end-api-flow/SKILL.md`.
- **Test place:** `scripts/skill-gate.test.mjs`.
- **Starting state:** A source file under `packages/query-client/src/` is edited with only `test-first-workflow` invoked.
- **Exact input or fixture:** `packages/query-client/src/users.ts`.
- **Interaction steps:** Evaluate the path against the trigger fixture and canonical trigger table; inspect required and missing skills.
- **Main behavior:** The query-client package path selects the API-flow skill without unrelated requirements.
- **Expected result:** Required package-specific skill is `end-to-end-api-flow`; `contract-validation` and `frontend-standards` are absent.
- **Must change:** The query-client assertions only if needed to make the scope explicit.
- **Must not happen:** Query-client source edits must not require contract validation solely from the package path.
- **Planned command:** `node --test scripts/skill-gate.test.mjs --test-name-pattern='query-client|API chain'`.
- **Expected result before the code change:** The existing query-client assertion passes; it remains a regression guard.
- **First observed run:** The focused run passed the existing query-client case while the API-client scope assertions failed; the query-client rule already had the intended scope.
- **Passing rerun:** The focused gate run passed all 24 tests after the trigger fixture and canonical rule were corrected.

## Implementation Plan

- [x] Update `.claude/skill-triggers.json` to remove `contract-validation` from the API-client rule while retaining `end-to-end-api-flow`.
- [x] Update `scripts/skill-gate.test.mjs` so API-client and canonical trigger-table expectations reject the stale extra requirement.
- [x] Append the correction evidence and link to the historical API-chain checklist without rewriting its original content.
- [x] Run focused tests, skill synchronization checks, formatting, and the repository gate.

## Validation Notes

- Initial observations: the API-client rule currently requires both `end-to-end-api-flow` and `contract-validation`; the query-client rule already has the intended scope.
- First observed run: The focused gate run failed in two API-client assertions because the old rule still included `contract-validation`.
- Passing rerun: The focused gate run passed all 24 tests after the rule and fixture were corrected.
- Formatting failure: `pnpm format:check` reported that `scripts/skill-gate.test.mjs` needed Prettier formatting.
- Validation rerun: `pnpm format:check`, `pnpm skills:check`, `pnpm skills:test`, and `just check` all passed. The full gate completed lint, typecheck, formatting, skills validation, skills tests, template tests, and 264 launcher tests; existing React Compiler warnings remained non-fatal.

## Non-Goals

- Do not modify application runtime behavior.
- Do not modify `skills/end-to-end-api-flow/SKILL.md` or `skills/contract-validation/SKILL.md`.
- Do not add contract validation to query-client edits.
- Do not change frontend, backend, or generic trigger rules.
