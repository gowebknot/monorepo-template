# Enforce Relative Import Policy

Related checklist: [Strict Relative Import Policy](./2026-08-24-strict-relative-import-policy.md)

## Implementation Contract

### Feature Boundaries

- Make the existing relative-import policy explicit in workspace and package guidance.
- Add a deterministic staged-source check that rejects relative imports outside barrel files.
- Keep existing baseline relative imports unchanged; enforcement applies to newly staged files.
- Do not rewrite framework-generated or historical source in this task.

### Route-Group Ownership

- No application routes or route groups change. Route ownership is not applicable.
- The import check applies to staged implementation, test, and configuration source files regardless of route ownership.

### User Journey

- No runtime user journey changes.
- An agent or developer staging a forbidden relative import receives a file, line, and import-specifier diagnostic and a non-zero check result.

### Complete Test Matrix

| ID              | Path type     | Source              | Test place                                               | Expected result                                          | Limitation                                    |
| --------------- | ------------- | ------------------- | -------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------- |
| TEST-IMPORT-001 | Valid         | Import policy       | `scripts/check-relative-imports.test.mjs`                | Alias and package imports pass                           | Does not resolve modules                      |
| TEST-IMPORT-002 | Valid         | Barrel exception    | `scripts/check-relative-imports.test.mjs`                | Relative exports in `index.ts` pass                      | Only basename-based barrel exception          |
| TEST-IMPORT-003 | Invalid       | Import policy       | `scripts/check-relative-imports.test.mjs`                | Relative implementation/test/config imports are reported | Parser is intentionally lightweight           |
| TEST-IMPORT-004 | Integration   | Pre-commit boundary | `scripts/check-relative-imports.test.mjs` and script CLI | Staged source scan returns failure for forbidden imports | Existing unstaged baseline is not scanned     |
| TEST-IMPORT-005 | Documentation | Repository guidance | Exact text scan and formatting check                     | Guidance says aliases are required except barrels        | Does not force external agents to load skills |

- Runtime, API, database, Playwright, Maestro, and authentication behavior are not applicable.

### Unresolved Conflicts

- Existing repository source contains relative imports in historical and framework-generated files. **Resolved decision:** preserve that baseline and enforce only staged source changes so adoption is non-destructive.
- Barrel files require relative exports for declaration portability. **Resolved decision:** permit relative specifiers only in files whose basename is `index` with a supported source extension.
- Some external CLIs may emit relative imports. **Resolved decision:** those files are accepted at baseline but any later staged modification must follow the policy; the check does not rewrite generator output.

## Small Task Breakdown

- [x] Make import guidance imperative in root and package ownership instructions.
- [x] Add a staged relative-import checker.
  - [x] Detect static imports, exports-from, dynamic imports, and CommonJS relative requires.
  - [x] Permit only relative specifiers in barrel files.
  - [x] Report actionable file and line diagnostics.
- [x] Integrate the checker into repository scripts and pre-commit validation.
- [x] Add focused unit and CLI-boundary tests, and include the unit suite in `just check`.
- [x] Run formatting, skills, focused tests, and repository checks.

## Exact Test Cases

### TEST-IMPORT-001: Alias and package imports pass

- **Small task:** Detect only forbidden relative specifiers.
- **Source:** Root import convention and code-quality skill.
- **Test place:** `scripts/check-relative-imports.test.mjs`.
- **Starting state:** Checker receives implementation text with alias and package imports.
- **Exact input or fixture:** `import Button from "@/components/button"; import type { User } from "@monorepo-template/entities";`.
- **Interaction steps:** Pass the text to the pure scanner as `src/components/page.tsx`.
- **Main behavior:** Non-relative imports are accepted.
- **Expected result:** Scanner returns no violations.
- **Must change:** Checker test and implementation.
- **Must not happen:** No false positive for aliases or package names.
- **Planned command:** `node --test scripts/check-relative-imports.test.mjs`.
- **Expected result before the code change:** The test file and checker are absent, so the command cannot pass.
- **First observed run:** `node --test scripts/check-relative-imports.test.mjs` failed because the test file does not exist.
- **Passing rerun:** `node --test scripts/check-relative-imports.test.mjs` passed all three focused cases after duplicate diagnostics were removed.

### TEST-IMPORT-002: Barrel relative exports pass

- **Small task:** Preserve the declaration-portable barrel exception.
- **Source:** Package AGENTS.md barrel rules.
- **Test place:** `scripts/check-relative-imports.test.mjs`.
- **Starting state:** Checker receives a barrel file containing relative exports.
- **Exact input or fixture:** `export * from "./feature.js";` in `src/index.ts`.
- **Interaction steps:** Scan the exact file text and filename.
- **Main behavior:** Barrel relative exports remain allowed.
- **Expected result:** Scanner returns no violations.
- **Must change:** Checker test and implementation.
- **Must not happen:** No requirement to rewrite public barrel exports to aliases.
- **Planned command:** `node --test scripts/check-relative-imports.test.mjs`.
- **Expected result before the code change:** The test file and checker are absent, so the command cannot pass.
- **First observed run:** `node --test scripts/check-relative-imports.test.mjs` failed because the test file does not exist.
- **Passing rerun:** `node --test scripts/check-relative-imports.test.mjs` passed the barrel exception case.

### TEST-IMPORT-003: Non-barrel relative imports fail

- **Small task:** Reject relative imports outside barrels.
- **Source:** `skills/code-quality/SKILL.md` rule 6.
- **Test place:** `scripts/check-relative-imports.test.mjs`.
- **Starting state:** Checker receives implementation, test, and configuration source text.
- **Exact input or fixture:** `import helper from "../lib/helper"; export { value } from "./value"; const x = require("./x");` in `src/feature.ts`.
- **Interaction steps:** Scan the exact text and inspect returned diagnostics.
- **Main behavior:** Every relative dependency in a non-barrel file is rejected.
- **Expected result:** Three violations are reported with line numbers and specifiers.
- **Must change:** Checker test and implementation.
- **Must not happen:** The checker must not silently allow tests or config files.
- **Planned command:** `node --test scripts/check-relative-imports.test.mjs`.
- **Expected result before the code change:** The test file and checker are absent, so the command cannot pass.
- **First observed run:** `node --test scripts/check-relative-imports.test.mjs` failed because the test file does not exist.
- **Passing rerun:** `node --test scripts/check-relative-imports.test.mjs` passed the four non-barrel violation assertions after duplicate diagnostics were removed.

### TEST-IMPORT-004: Staged CLI scan fails on a forbidden import

- **Small task:** Wire the checker into staged validation.
- **Source:** `.husky/pre-commit` and repository validation policy.
- **Test place:** Checker CLI with a controlled staged fixture or exported staged-file helper.
- **Starting state:** A staged source file contains `import x from "./x"` and is not named `index.ts`.
- **Exact input or fixture:** One staged `*.ts` file with the forbidden import.
- **Interaction steps:** Invoke the checker in staged mode and capture exit status and stderr.
- **Main behavior:** Staged violations block validation.
- **Expected result:** Non-zero exit status and an actionable diagnostic.
- **Must change:** Package script and pre-commit integration.
- **Must not happen:** Existing unstaged baseline files must not cause unrelated failures.
- **Planned command:** `pnpm imports:check`.
- **Expected result before the code change:** The script is absent, so the command cannot pass.
- **First observed run:** `pnpm imports:check` failed on a controlled staged `scripts/__relative-import-fixture.ts` with `scripts/__relative-import-fixture.ts:1 uses relative import ./value` and exit code 1.
- **Passing rerun:** `pnpm imports:check` passed with the fixture removed and the current staged set containing no source files with forbidden imports.

### TEST-IMPORT-005: Guidance is imperative and formatted

- **Small task:** Remove “may” ambiguity from agent guidance.
- **Source:** User request and existing strict relative-import checklist.
- **Test place:** Root/package AGENTS scans plus Prettier.
- **Starting state:** Several package instructions say implementation files “may” use aliases.
- **Exact input or fixture:** Root and affected package import sections.
- **Interaction steps:** Scan for required “must” language, then run formatting validation.
- **Main behavior:** Agents see one clear rule and the barrel exception.
- **Expected result:** Guidance requires aliases/package names outside barrels and explicitly preserves the exception.
- **Must change:** Applicable AGENTS.md files.
- **Must not happen:** No contradiction that permits convenience relative imports.
- **Planned command:** `pnpm exec prettier --check AGENTS.md apps/server/AGENTS.md packages/*/AGENTS.md`.
- **Expected result before the code change:** Existing “may” wording remains in package guidance.
- **First observed run:** The planned Prettier command found formatting issues in the new checklist and checker files.
- **Passing rerun:** The targeted Prettier check passed for all changed guidance, checklist, script, and configuration files.

## Validation Notes

- This task intentionally does not mass-rewrite the existing baseline; the staged gate prevents new violations while allowing incremental cleanup.
- `node --test scripts/check-relative-imports.test.mjs` passed all 3 focused cases.
- A controlled staged forbidden-import fixture was rejected with a file/line diagnostic; the clean staged scan passed after fixture removal.
- `pnpm skills:check`, `pnpm skills:test` (122 passing), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `just check` passed.
- One supplemental Prettier command incorrectly included `Justfile`, which Prettier cannot parse; the repository's canonical `pnpm format:check` passed afterward.
- Existing non-blocking React Compiler/TanStack Table lint warnings remain; no new errors were introduced.
