# Scaffold Claude Guidance Files

- Checklist ID: CHECKLIST-20260903-scaffold-claude-guidance
- Created: 2026-09-03
- Tier: standard
- Source request: Create `CLAUDE.md` alongside `AGENTS.md` in newly created packages and apps.
- Related checklist: [Project Package Scope Rename](./2026-08-24-project-package-scope.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Acceptance Criteria

- [x] A package made by `pnpm package:create` includes `CLAUDE.md` containing exactly `@AGENTS.md`.
- [x] A Vite React app made by the native app scaffolder includes `AGENTS.md` and a sibling `CLAUDE.md` containing exactly `@AGENTS.md`.
- [x] The canonical minimal-package skill documents both guidance files, and all four skill roots synchronize cleanly.
- [x] Focused scaffold tests, skill validation, and formatting checks pass.

## Implementation Contract

### Feature Boundaries

- Create the one-line Claude guidance bridge only for newly scaffolded packages and Vite React apps.
- Do not modify existing generated projects, app profiles that already copy both files, package APIs, or application runtime behavior.

### Route-Group Ownership

- Not applicable: this task has no routes or route groups.

### User Journey

1. A developer creates a package or selects the supported Vite React app profile.
2. The scaffold writes package or app guidance files.
3. Claude discovers the app- or package-local `AGENTS.md` through `CLAUDE.md`.

### Complete Test Matrix

| Small task                     | Test ID           | Covered outcome                                                           |
| ------------------------------ | ----------------- | ------------------------------------------------------------------------- |
| Package guidance bridge        | TEST-SCAFFOLD-001 | Isolated package output contains exact `CLAUDE.md` content.               |
| Vite app guidance pair         | TEST-SCAFFOLD-002 | Isolated React TypeScript app output contains the expected guidance pair. |
| Portable skill synchronization | TEST-SCAFFOLD-003 | All skill roots and formatting remain valid.                              |

### Unresolved Conflicts

- None. Existing managed NestJS, Next.js, Expo, and React Native profiles already copy both guidance files; Vite React is the only app path lacking them.

## Missing-Case Review

- Unsupported Vite variants intentionally receive no managed reference profile and are unchanged; this task must not add files to those native-only apps.
- Existing package collision and `--force` behavior is unchanged because the added file follows the scaffold's existing write model.
- No network, authorization, endpoint, persistence, or user-interface behavior applies.

## Exact Test Cases

### TEST-SCAFFOLD-001: Package Claude bridge

- **Small task:** Add Claude guidance to package scaffold output.
- **Source:** User request and existing package `CLAUDE.md` convention.
- **Test place:** `core/create-mono-stack/test/copier-template.test.js`.
- **Starting state:** An isolated root named `acme-platform`; package scaffolding creates `AGENTS.md` but no `CLAUDE.md`.
- **Exact input or fixture:** `billing` passed to `scaffold-package.mjs` with the isolated root.
- **Interaction steps:** Run the scaffold, read `packages/billing/CLAUDE.md`, and trim its content.
- **Main behavior:** Every newly scaffolded package has a Claude-to-Agents bridge.
- **Expected result:** The file exists and equals `@AGENTS.md` after trimming.
- **Must change:** Only the isolated scaffold output gains `CLAUDE.md`.
- **Must not happen:** The generated package name or existing `AGENTS.md` content changes.
- **Planned command:** `node --test --test-name-pattern='TEST-SCAFFOLD-001' core/create-mono-stack/test/copier-template.test.js`.
- **Expected result before the code change:** Fails because `CLAUDE.md` is absent.
- **First observed run:** Failed with `ENOENT` reading the generated `packages/billing/CLAUDE.md`.
- **Passing rerun:** Passed: `node --test --test-name-pattern='TEST-SCAFFOLD-001' core/create-mono-stack/test/copier-template.test.js`.

### TEST-SCAFFOLD-002: Vite app guidance pair

- **Small task:** Add guidance files to the supported Vite React app profile.
- **Source:** User request and managed app guidance convention.
- **Test place:** `core/create-mono-stack/test/native-scaffold-overlays.test.js`.
- **Starting state:** An isolated React TypeScript native Vite tree selected as `vite/react-ts`; profile output has neither guidance file.
- **Exact input or fixture:** Existing deterministic `reactTypeScriptNativeTree` fixture and the React TypeScript selection.
- **Interaction steps:** Run `scaffoldNativeApps`, read the generated app root's `AGENTS.md` and `CLAUDE.md`.
- **Main behavior:** The managed Vite React app profile supplies the same guidance pair as other managed app profiles.
- **Expected result:** `AGENTS.md` contains the managed web guidance and `CLAUDE.md` trims to `@AGENTS.md`.
- **Must change:** Only supported Vite React profile output gains the guidance pair.
- **Must not happen:** Native Vite source replacement or unsupported-profile behavior changes.
- **Planned command:** `node --test --test-name-pattern='TEST-SCAFFOLD-002' core/create-mono-stack/test/native-scaffold-overlays.test.js`.
- **Expected result before the code change:** Fails because the Vite app guidance files are absent.
- **First observed run:** Failed with `ENOENT` reading the generated Vite app `AGENTS.md`.
- **Passing rerun:** Passed: `node --test --test-name-pattern='TEST-SCAFFOLD-002' core/create-mono-stack/test/native-scaffold-overlays.test.js`.

### TEST-SCAFFOLD-003: Skill and formatting validation

- **Small task:** Keep the portable skill contract and changed files valid.
- **Source:** Repository skills and formatting policy.
- **Test place:** Canonical skill, synchronized skill roots, and changed source files.
- **Starting state:** The canonical skill describes only `AGENTS.md`; its mirrors must remain byte-identical.
- **Exact input or fixture:** Updated canonical `create-minimal-package` skill and generated mirror roots.
- **Interaction steps:** Synchronize skills, validate roots, then run formatting verification.
- **Main behavior:** Documentation accurately describes generated package guidance and all changes meet repository formatting rules.
- **Expected result:** `pnpm skills:check` and `pnpm format:check` exit successfully.
- **Must change:** The canonical skill and synchronized copies state that both files are created.
- **Must not happen:** Unrelated skill roots or pre-existing user changes are overwritten.
- **Planned command:** `pnpm skills:sync && pnpm skills:check && pnpm format:check`.
- **Expected result before the code change:** The canonical documentation is stale; validation cannot prove the requested behavior.
- **First observed run:** `pnpm skills:sync` first failed with sandbox `EPERM` while replacing a mirrored skill; the approved rerun synchronized 20 skills. `pnpm skills:check` passed, while `pnpm format:check` reported formatting needed in this checklist and `copier-template.test.js`.
- **Passing rerun:** Passed: `pnpm skills:check`, `pnpm format:check`, and `git diff --check` all exited successfully after synchronization and formatting.

## Implementation Plan

- [x] 1. Add and run the failing behavior-locking tests.
  - [x] 1.1 Add `TEST-SCAFFOLD-001` beside the isolated package scope scaffold test.
  - [x] 1.2 Add `TEST-SCAFFOLD-002` beside the React TypeScript Vite profile overlay test.
- [x] 2. Implement the smallest scaffold changes.
  - [x] 2.1 Write `CLAUDE.md` with `@AGENTS.md` in `scaffold-package.mjs`.
  - [x] 2.2 Add managed web `AGENTS.md` and `CLAUDE.md`, and copy both through the `vite/react-ts` profile.
- [x] 3. Synchronize and document the package scaffold contract.
  - [x] 3.1 Update the canonical minimal-package skill and required-shape reference.
  - [x] 3.2 Run `pnpm skills:sync` without overwriting unrelated divergent work.
- [x] 4. Rerun focused tests and validation; record results before marking each item complete.

## Validation Notes

- Pre-test reproduction: an isolated `billing` scaffold wrote `AGENTS.md` and no `CLAUDE.md`.
- Initial discovery: NestJS, Next.js, Expo, and React Native app profiles already copied both files; the managed Vite React profile copied neither.
- Passing rerun: 43 tests across `copier-template.test.js` and `native-scaffold-overlays.test.js` passed; `pnpm skills:check`, `pnpm format:check`, and `git diff --check` passed.
