# Exhaustive Documentation Refresh

- Checklist ID: CHECKLIST-20260823-exhaustive-documentation-refresh
- Created: 2026-08-23
- Type: Documentation and portable-skill maintenance
- Source request: Address all stale and incomplete documentation findings from the exhaustive audit.
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Correct current test-runner, Playwright, and TypeScript guidance in the canonical skill tree.
- Document the locked native `shadcn` exception and the reason standalone skills may repeat policy fields.
- Synchronize the canonical skill tree into all provider discovery roots.
- Correct repository-level pre-commit, CI-plan, and structure documentation without rewriting historical checklists.

## Acceptance Criteria

- No current skill guidance claims that Nest uses Jest.
- No current skill example claims that this repository lacks a Playwright runner.
- The minimal-package guidance identifies TypeScript 7 as the active compiler and TypeScript 6 only as tooling compatibility.
- The locked native `shadcn` exception is documented where portable-skill rules are defined.
- Intentional standalone policy duplication is documented as a deliberate exception to the anti-duplication rule.
- Root agent guidance describes the actual pre-commit phases.
- The CI plan uses `pnpm e2e:web`.
- The root structure documentation lists current first-party apps and packages.
- All four skill roots remain byte-for-byte synchronized.

## Exact Test Cases

### [x] TEST-DOCS-001: Current Nest runner guidance

- **Small task:** Correct the Nest runner statement in all skill roots.
- **Source:** `apps/server/package.json` and `apps/server/AGENTS.md`.
- **Test place:** Exact text scan across four skill roots.
- **Starting state:** Runner guidance says Jest and `test:e2e`.
- **Exact input or fixture:** The four `test-runner-guidance.md` copies.
- **Interaction steps:** Search for `currently uses Jest`; search for `currently uses Vitest`.
- **Main behavior:** Skill guidance matches the current Nest test runner.
- **Expected result:** No Jest claim remains; the Vitest claim is present in all four roots.
- **Must change:** Four synchronized copies.
- **Must not happen:** Historical checklists or unrelated examples are rewritten.
- **Planned command:** `git grep -n -E 'currently uses (Jest|Vitest)' -- skills .agents/skills .claude/skills .opencode/skills`
- **Expected result before the code change:** Jest appears in all four copies.
- **First observed run:** The Jest claim appeared in all four synchronized copies.
- **Passing rerun:** `git grep` found the Vitest statement in all four roots and no Jest statement.

### [x] TEST-DOCS-002: Playwright evaluation boundary

- **Small task:** Update the E2E example's repository-status disclaimer.
- **Source:** `apps/playwright/` and root `package.json`.
- **Test place:** Exact text scan across four skill roots.
- **Starting state:** The example says no Playwright app or runner exists.
- **Exact input or fixture:** `login-flow-evaluation.md` in each skill root.
- **Interaction steps:** Search for the old absence claim and the current `pnpm e2e:web` command.
- **Main behavior:** The example remains synthetic while acknowledging the available runner.
- **Expected result:** No false absence claim remains; the example states that it is not evidence of execution.
- **Must change:** Four synchronized copies.
- **Must not happen:** The synthetic login scenario becomes an assertion about the existing product.
- **Planned command:** `git grep -n -E 'does not currently provide a Playwright|pnpm e2e:web' -- skills .agents/skills .claude/skills .opencode/skills`
- **Expected result before the code change:** The false absence claim appears in all four copies.
- **First observed run:** The false Playwright absence claim appeared in all four synchronized copies.
- **Passing rerun:** `git grep` found the current Playwright statement in all four roots and no false absence claim.

### [x] TEST-DOCS-003: TypeScript compiler guidance

- **Small task:** Clarify the TypeScript version in the package pattern.
- **Source:** Root `AGENTS.md` and the entities package configuration.
- **Test place:** Exact text scan in the four package-pattern copies.
- **Starting state:** The guidance presents TypeScript 6 as the compiler context.
- **Exact input or fixture:** The `baseUrl` paragraph.
- **Interaction steps:** Search for the old TypeScript 6 wording and the clarified TypeScript 7 wording.
- **Main behavior:** Active compiler and declaration-tooling compatibility are distinguished.
- **Expected result:** The paragraph names TypeScript 7 as active and TypeScript 6 only for tooling compatibility.
- **Must change:** Four synchronized copies.
- **Must not happen:** The `@typescript/typescript6` tooling dependency is described as the project compiler.
- **Planned command:** `git grep -n -E 'TypeScript 6 accepts|TypeScript 7|typescript6' -- skills .agents/skills .claude/skills .opencode/skills`
- **Expected result before the code change:** The old TypeScript 6 sentence appears in all four copies.
- **First observed run:** The TypeScript 6 wording appeared in all four synchronized copies.
- **Passing rerun:** `git grep` found the TypeScript 7 and tooling-compatibility statements in all four roots and no old sentence.

### [x] TEST-DOCS-004: Locked native skill exception

- **Small task:** Document why `shadcn` is exempt from portable metadata rules.
- **Source:** `skills-lock.json`, `scripts/skills.mjs`, and the portable-skill standard.
- **Test place:** Portable-skill standard and repository guidance.
- **Starting state:** The validator excludes locked native skills, but the exception is undocumented.
- **Exact input or fixture:** The `shadcn` lock entry and the portable metadata rules.
- **Interaction steps:** Read the exception guidance and verify `shadcn` is listed as locked native content.
- **Main behavior:** Contributors can distinguish portable skills from locked native skills.
- **Expected result:** Documentation states that locked native skills may retain provider-specific metadata and are excluded from portable validation.
- **Must change:** Portable-skill guidance and root repository guidance.
- **Must not happen:** Portable skills gain provider-specific syntax.
- **Planned command:** `pnpm skills:check`
- **Expected result before the code change:** Validation passes but the exception is not documented.
- **First observed run:** `pnpm skills:check` passed, while the locked native exception was not documented.
- **Passing rerun:** `pnpm skills:check` passed with the locked native exception documented.

### [x] TEST-DOCS-005: Intentional standalone policy duplication

- **Small task:** Explain why exact test-case fields remain duplicated across independently loaded skills.
- **Source:** Portable-skill standard and the affected testing/checklist skills.
- **Test place:** Portable-skill standard.
- **Starting state:** The standard says to avoid duplication without describing the standalone-policy exception.
- **Exact input or fixture:** The four documents named in the audit.
- **Interaction steps:** Read the anti-duplication rule and the new standalone-policy note.
- **Main behavior:** The maintenance rationale is explicit without removing needed standalone instructions.
- **Expected result:** The standard permits concise duplication when a skill must remain independently actionable and requires synchronized edits.
- **Must change:** One canonical portable-skill reference and its synchronized copies.
- **Must not happen:** Conflicting versions of the required fields are introduced.
- **Planned command:** `pnpm skills:check && pnpm exec prettier --check skills/create-portable-skill/references/portable-skill-standard.md`
- **Expected result before the code change:** No standalone-policy exception is documented.
- **First observed run:** The portable standard had an anti-duplication rule but no standalone-policy exception.
- **Passing rerun:** The portable standard now documents the deliberate standalone-policy duplication exception.

### [x] TEST-REPO-006: Pre-commit documentation

- **Small task:** Align root agent guidance with the actual pre-commit script.
- **Source:** `scripts/pre-commit-checks.mjs` and the pre-commit checklist.
- **Test place:** Exact text scan in `AGENTS.md`.
- **Starting state:** Documentation says every commit runs only two checks.
- **Exact input or fixture:** Current pre-commit phases and conditional checks.
- **Interaction steps:** Search for the old two-check claim and the new phase summary.
- **Main behavior:** Repository guidance accurately describes the hook.
- **Expected result:** The old claim is absent and the documented phases include staged checks, build/tests, lint, and typecheck.
- **Must change:** `AGENTS.md`.
- **Must not happen:** Browser or device E2E is described as an implicit hook dependency.
- **Planned command:** `git grep -n -E 'Every commit runs two checks|pre-commit.*build|pre-commit.*typecheck' -- AGENTS.md`
- **Expected result before the code change:** The two-check claim appears.
- **First observed run:** `AGENTS.md` contained the two-check claim and no matching phase summary.
- **Passing rerun:** `git grep` found the staged-check wording and actual phase summary; the old two-check wording is absent.

### [x] TEST-REPO-007: Playwright CI plan command

- **Small task:** Align the planned CI command with the current root script.
- **Source:** Root `package.json` and `AGENTS.md`.
- **Test place:** `docs/plans/2026-08-23-ci-playwright-e2e.md`.
- **Starting state:** The plan uses the removed `pnpm e2e` command.
- **Exact input or fixture:** All four occurrences in the plan.
- **Interaction steps:** Search for `pnpm e2e` and confirm only `pnpm e2e:web` remains.
- **Main behavior:** Future CI implementation has an executable current command.
- **Expected result:** The plan consistently uses `pnpm e2e:web`.
- **Must change:** The active plan only.
- **Must not happen:** Historical checklist records are rewritten.
- **Planned command:** `git grep -n -E 'pnpm e2e($|[^:])|pnpm e2e:web' -- docs/plans/2026-08-23-ci-playwright-e2e.md`
- **Expected result before the code change:** The old command appears four times.
- **First observed run:** The plan contained four references to the removed `pnpm e2e` command.
- **Passing rerun:** `git grep` found four `pnpm e2e:web` references and no standalone `pnpm e2e` command.

### [x] TEST-REPO-008: Root structure documentation

- **Small task:** List current first-party apps and packages in the root README and generated README source.
- **Source:** Workspace manifests and recent app/package commits.
- **Test place:** `README.md` and `README.md.jinja`.
- **Starting state:** The structure section omits newer apps, E2E packages, and `@repo/ui`.
- **Exact input or fixture:** Current workspace directories and package names.
- **Interaction steps:** Compare documented entries with the current workspace inventory.
- **Main behavior:** The structure overview identifies all maintained first-party apps and packages.
- **Expected result:** Web, Next, mobile, Expo, Playwright, Maestro, server, and all workspace packages are represented.
- **Must change:** Root README structure content and its generated-template source.
- **Must not happen:** Optional generated app behavior is described as mandatory in every project.
- **Planned command:** `pnpm exec prettier --check README.md README.md.jinja && git grep -n -E 'apps/(next|mobile|expo|playwright|maestro)|packages/ui' -- README.md README.md.jinja`
- **Expected result before the code change:** New app/package entries are absent from the structure list.
- **First observed run:** The structure scan found no entries for the newer apps or `packages/ui`.
- **Passing rerun:** `git grep` found all current app and package entries in `README.md`; `README.md.jinja` delegates content through the README include.

## Validation Notes

- Historical release and implementation checklists remain immutable records and are intentionally excluded from content rewrites.
- Device-backed Maestro tests are not required for documentation-only changes.
- The first focused Prettier command included `README.md.jinja` and failed because no parser is configured for that template extension; the passing rerun excludes that template from Prettier and validates its exact source references separately.
- `just check` reached the template test gate but had one unrelated Ink timing failure in `test/interactive-wizard.test.js` (`260/261` tests passed); a second full-gate run reproduced that same failure.
- The focused `pnpm --filter create-mono-stack test` rerun passed all 261 tests, including the previously timing-sensitive wizard case.
