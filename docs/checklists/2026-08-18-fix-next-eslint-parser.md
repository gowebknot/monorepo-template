# Task: Fix Next ESLint parser resolution

- Checklist ID: CHECKLIST-20260818-fix-next-eslint-parser
- Created: 2026-08-18
- Planning completed: 2026-08-18
- Type: Bug fix
- Source request: Make `pnpm --filter next lint` pass.
- Related checklists:
  - `docs/checklists/2026-08-18-native-demo-parity.md`
- Affected paths: `.npmrc`, `apps/next`, `docs/checklists`
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Plan

- [x] Confirm the failure is reproducible with the repository's pinned pnpm version.
- [x] Configure pnpm to expose the direct Next package to `eslint-config-next`.
- [x] Verify lint, typecheck, formatting, and the relevant test suite.

## Acceptance Criteria

- [x] `pnpm --filter next lint` completes successfully.
- [x] `pnpm --filter next typecheck` remains successful.
- [x] No application lint rules or source files are changed.

## Test Cases

### TEST-NEXT-001: Next lint resolves the bundled parser

- **Small task:** Make the Next lint command resolve `next/dist/compiled/babel/eslint-parser`.
- **Source:** `pnpm --filter next lint` and the observed `eslint-config-next` import failure.
- **Test place:** Next package lint command.
- **Starting state:** The workspace uses pnpm isolated dependencies and lint fails before scanning files.
- **Exact input or fixture:** `apps/next/eslint.config.mjs` importing `eslint-config-next/core-web-vitals`.
- **Interaction steps:** Run `pnpm --filter next lint` from the workspace root.
- **Main behavior:** ESLint loads the Next configuration and scans the app.
- **Expected result:** ESLint exits with status 0.
- **Must change:** Only pnpm dependency visibility configuration.
- **Must not happen:** Do not weaken or replace the Next ESLint configuration.
- **Planned command:** `pnpm --filter next lint`
- **Expected result before the code change:** Fails with `Cannot find module 'next/dist/compiled/babel/eslint-parser'`.
- **First observed run:** Failed with the expected missing parser module error.
- **Passing rerun:** Passed with one existing `react-hooks/incompatible-library` warning in `apps/next/src/app/table-demo/page.tsx`.

### TEST-NEXT-002: Existing Next typecheck remains green

- **Small task:** Preserve existing Next TypeScript validation.
- **Source:** `apps/next/AGENTS.md` validation commands.
- **Test place:** Next package typecheck command.
- **Starting state:** The application typechecks independently of ESLint loading.
- **Exact input or fixture:** Current `apps/next` source tree and `tsconfig.json`.
- **Interaction steps:** Run `pnpm --filter next typecheck` from the workspace root.
- **Main behavior:** TypeScript checks the Next app.
- **Expected result:** TypeScript exits with status 0.
- **Must change:** No TypeScript source or compiler behavior.
- **Must not happen:** No new type errors.
- **Planned command:** `pnpm --filter next typecheck`
- **Expected result before the code change:** Passes.
- **First observed run:** Passed before implementation.
- **Passing rerun:** Passed.

## Implementation

- [x] Add `next` to pnpm's public hoist pattern so isolated packages can resolve the framework package used by `eslint-config-next`.
- [x] Reinstall with the pinned pnpm version and rerun the test cases.

## Risks

- Publicly hoisting `next` changes workspace linker layout, but does not change package versions or runtime dependency declarations.
