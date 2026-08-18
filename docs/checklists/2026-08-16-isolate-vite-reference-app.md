# Isolate the Vite reference app

Checklist ID: `ISOLATE-VITE-REFERENCE-2026-08-16`

Status legend: `[ ]` pending, `[x]` complete, `[/]` partial.

Related checklists:

- [Hybrid native reference profiles](./2026-08-12-hybrid-native-reference-profiles.md)
- [Observe Vite wizard selections](./2026-08-16-observe-vite-wizard-selections.md)
- [Portable Vite wizard transport](./2026-08-16-portable-vite-wizard-transport.md)

## Goal and acceptance criteria

- [x] Keep every Vite-generated source and configuration file unchanged.
- [x] Copy the template web application only into `reference/src` and `reference/index.html`.
- [x] Add missing reference dependencies without replacing native dependency versions or sections.
- [x] Add reference-specific route generation, development, build, and preview scripts without replacing native scripts.
- [x] Support every observed React variant containing `TypeScript`, including compiler and SWC variants.
- [x] Keep JavaScript React and non-React variants unsupported.
- [x] Make reference source independent of the template-only `@/` alias.
- [x] Keep NestJS reference behavior unchanged.

## Task and test map

| Small task                            | Test                                   |
| ------------------------------------- | -------------------------------------- |
| Preserve native Vite files            | TEST-REFERENCE-008                     |
| Copy isolated reference files         | TEST-REFERENCE-009                     |
| Merge only missing dependencies       | TEST-REFERENCE-010                     |
| Add only reference scripts            | TEST-REFERENCE-011                     |
| Accept React TypeScript variants      | TEST-REFERENCE-012, TEST-REFERENCE-013 |
| Reject incompatible variants          | TEST-REFERENCE-014                     |
| Remove template-only source aliases   | TEST-REFERENCE-015                     |
| Build and run the generated reference | TEST-REFERENCE-016                     |

Network, authorization, persistence, and external API cases do not apply. Unit fixtures are local and deterministic; the existing controlled Docker integration remains the end-to-end boundary.

## Exact test cases

### TEST-REFERENCE-008

- **Small task:** Preserve the selected Vite scaffold.
- **Source:** User requirement that no generated configuration or native source be replaced.
- **Test place:** `core/create-mono-stack/test/native-scaffold-overlays.test.js`.
- **Starting state:** A React Compiler TypeScript fixture contains distinct markers in native `src`, HTML, Vite, TypeScript, lint, and metadata files.
- **Exact input or fixture:** Observed `React`, `TypeScript + React Compiler`, `ESLint`.
- **Interaction steps:** Apply native scaffolding and inspect every native marker.
- **Main behavior:** Native files remain byte-for-byte unchanged.
- **Expected result:** Every marker remains and no native file is removed.
- **Must change:** Only `reference/` and permitted `package.json` fields.
- **Must not happen:** No native source, HTML, config, ignore, or metadata replacement.
- **Planned command:** `node --test test/native-scaffold-overlays.test.js`.
- **Expected result before the code change:** Fails because the compiler variant is skipped and supported plain TypeScript replaces native files.
- **First observed run:** Failed because the old overlay replaced native Vite files and rejected the compiler variant.
- **Passing rerun:** Passed in `native-scaffold-overlays.test.js`.

### TEST-REFERENCE-009

- **Small task:** Copy the isolated reference application.
- **Source:** Approved plan and user-selected `reference/` placement.
- **Test place:** `core/create-mono-stack/test/native-scaffold-overlays.test.js`.
- **Starting state:** The template fixture contains `src/main.tsx`, another source file, and `index.html`.
- **Exact input or fixture:** Supported React TypeScript selection.
- **Interaction steps:** Scaffold and inspect `reference/`.
- **Main behavior:** Copy only the reference HTML and source tree.
- **Expected result:** `reference/index.html`, `reference/src/main.tsx`, and the additional source file match template markers.
- **Must change:** Those reference paths are created.
- **Must not happen:** `components.json` or any template configuration is copied into `reference/`.
- **Planned command:** `node --test test/native-scaffold-overlays.test.js`.
- **Expected result before the code change:** Fails because no reference directory is created.
- **First observed run:** Failed because the old overlay did not create an isolated `reference/` directory.
- **Passing rerun:** Passed in `native-scaffold-overlays.test.js`.

### TEST-REFERENCE-010

- **Small task:** Add only missing reference dependencies.
- **Source:** Approved dependency policy.
- **Test place:** `core/create-mono-stack/test/reference-profiles.test.js`.
- **Starting state:** Native package has newer React, Vite, and TypeScript versions plus a native-only dependency; template has overlapping and reference-only dependencies.
- **Exact input or fixture:** Merge the two package fixtures.
- **Interaction steps:** Apply the profile package merge.
- **Main behavior:** Native entries and versions win; missing template dependencies are added.
- **Expected result:** Existing versions and sections are unchanged, reference-only entries exist, and template-only top-level metadata is absent.
- **Must change:** Only missing dependency entries and final package name.
- **Must not happen:** No dependency moves, version replacement, or template metadata merge.
- **Planned command:** `node --test test/reference-profiles.test.js`.
- **Expected result before the code change:** Fails because current merge spreads template top-level metadata into the native package.
- **First observed run:** Failed because template top-level metadata was spread into the native package.
- **Passing rerun:** Passed in `reference-profiles.test.js`.

### TEST-REFERENCE-011

- **Small task:** Add a separate reference script lifecycle.
- **Source:** User selected full lifecycle while preserving native scripts.
- **Test place:** `core/create-mono-stack/test/reference-profiles.test.js`.
- **Starting state:** Native package defines `dev`, `build`, `lint`, `preview`, and a native-only script.
- **Exact input or fixture:** Reference scripts for route generation, development, build, and preview.
- **Interaction steps:** Merge package manifests.
- **Main behavior:** Add four `*:reference` scripts.
- **Expected result:** All native scripts are byte-for-byte unchanged and all four reference scripts have their exact commands.
- **Must change:** Only the four reference script keys.
- **Must not happen:** Native `build`, `dev`, `lint`, or `preview` replacement.
- **Planned command:** `node --test test/reference-profiles.test.js`.
- **Expected result before the code change:** Fails because the template `build` currently replaces the native build and the lifecycle is incomplete.
- **First observed run:** Failed because native lifecycle scripts were replaced and the reference lifecycle was incomplete.
- **Passing rerun:** Passed in `reference-profiles.test.js` and the controlled integration.

### TEST-REFERENCE-012

- **Small task:** Accept the reported React Compiler TypeScript selection.
- **Source:** User-reported skipped reference behavior.
- **Test place:** `core/create-mono-stack/test/native-scaffold-overlays.test.js` and `test/reference-profiles.test.js`.
- **Starting state:** Generated package contains React Compiler dependencies and `src/main.tsx`.
- **Exact input or fixture:** `React`, `TypeScript + React Compiler`, `ESLint`.
- **Interaction steps:** Detect and gate the profile.
- **Main behavior:** Select `vite/react-ts`.
- **Expected result:** Reference profile is recorded and reference files are copied.
- **Must change:** App metadata records `vite/react-ts`.
- **Must not happen:** Compiler dependencies or Vite config are removed.
- **Planned command:** `node --test test/reference-profiles.test.js test/native-scaffold-overlays.test.js`.
- **Expected result before the code change:** Fails because compiler dependencies and the exact variant label are rejected.
- **First observed run:** Failed because React Compiler dependencies and its observed variant label were rejected.
- **Passing rerun:** Passed in both focused profile and scaffold tests.

### TEST-REFERENCE-013

- **Small task:** Accept future React TypeScript variant labels without a catalog.
- **Source:** Approved all-React-TypeScript policy and dynamic Vite observation design.
- **Test place:** `core/create-mono-stack/test/reference-profiles.test.js`.
- **Starting state:** Generated package and entry file provide React TypeScript evidence.
- **Exact input or fixture:** Labels `TypeScript`, `TypeScript + SWC`, and `TypeScript + SWC + React Compiler`.
- **Interaction steps:** Gate each label.
- **Main behavior:** Recognize TypeScript semantically rather than by exact catalog entry.
- **Expected result:** Every row returns supported.
- **Must change:** No persistent catalog.
- **Must not happen:** Linter or compiler label rejection.
- **Planned command:** `node --test test/reference-profiles.test.js`.
- **Expected result before the code change:** SWC/compiler rows fail exact variant comparison.
- **First observed run:** Failed for SWC/compiler labels due to exact catalog matching.
- **Passing rerun:** Passed for all parameterized React TypeScript labels.

### TEST-REFERENCE-014

- **Small task:** Reject incompatible frameworks and JavaScript variants.
- **Source:** Approved React TypeScript boundary.
- **Test place:** `core/create-mono-stack/test/reference-profiles.test.js`.
- **Starting state:** Profile ID is `vite/react-ts`.
- **Exact input or fixture:** React JavaScript, Vue TypeScript, missing observation, and missing TypeScript file evidence.
- **Interaction steps:** Detect or gate each case.
- **Main behavior:** Fail closed outside React TypeScript.
- **Expected result:** Each case returns unsupported or no profile.
- **Must change:** Nothing.
- **Must not happen:** Reference source or scripts are applied.
- **Planned command:** `node --test test/reference-profiles.test.js`.
- **Expected result before the code change:** Existing cases mostly pass; this guards the broadened matcher.
- **First observed run:** Existing rejection cases passed and guarded the broadened matcher.
- **Passing rerun:** Passed with JavaScript, Vue, missing-observation, and missing-evidence cases.

### TEST-REFERENCE-015

- **Small task:** Make copied reference imports portable.
- **Source:** Approved no-config-copy policy.
- **Test place:** `core/create-mono-stack/test/copier-template.test.js` exact source scan.
- **Starting state:** Canonical web source currently uses `@/` imports.
- **Exact input or fixture:** Every TypeScript/TSX file under `apps/web/src`.
- **Interaction steps:** Scan import specifiers.
- **Main behavior:** Use relative local imports.
- **Expected result:** No source import begins with `@/`.
- **Must change:** Local import specifiers only.
- **Must not happen:** Component behavior or external/workspace imports change.
- **Planned command:** `node --test test/copier-template.test.js`.
- **Expected result before the code change:** Fails on existing alias imports.
- **First observed run:** Failed on canonical `@/` imports.
- **Passing rerun:** Passed after converting local source imports to relative paths; the canonical web build also passed.

### TEST-REFERENCE-016

- **Small task:** Prove the generated native and reference applications work independently.
- **Source:** Approved buildable isolated-reference outcome.
- **Test place:** Existing controlled Copier/Docker integration harness.
- **Starting state:** A clean generated React TypeScript project with dependencies installed.
- **Exact input or fixture:** Native build plus reference route generation, build, bounded dev readiness, and preview readiness.
- **Interaction steps:** Run each lifecycle command in order and inspect Turbo/app results.
- **Main behavior:** Both applications build and the reference lifecycle runs without config replacement.
- **Expected result:** All commands succeed and both dev/preview probes become ready.
- **Must change:** Only normal build outputs and caches.
- **Must not happen:** Manual config edits or external service traffic.
- **Planned command:** `pnpm --filter create-mono-stack test:integration`.
- **Expected result before the code change:** Existing integration expects the reference to replace the native app and lacks the isolated lifecycle.
- **First observed run:** Failed successively on stale assertions, an unrealistic fixture tsconfig, a package-less `reference/` working directory, and a preview harness separator; each failure is recorded below.
- **Passing rerun:** Passed copy/update, install, native build, reference build, preview, and development readiness in 52 seconds.

## Implementation and validation

Validation log:

- The first integration attempt could not access the Docker socket inside the sandbox; the controlled rerun was authorized outside it.
- The first authorized integration run reached generated-project assertions and failed on the obsolete `Native CLI versions win` README expectation. This was an integration-fixture mismatch after the new preservation policy, before lifecycle execution.
- The next integration assertion used a shortened policy phrase and expected source Markdown backticks after Copier rendering. The generated README contained the complete intended policy; the assertion was corrected before rerunning lifecycle validation.
- The first lifecycle run reached the root build and failed in the controlled native web fixture. The harness previously reported only Turbo's stderr summary, so its failure output was changed to retain both stderr and stdout before diagnosing the fixture or implementation.
- Complete output showed TypeScript 7 checking an upstream Babel declaration because the hand-built native fixture omitted Vite's standard `skipLibCheck`. The controlled fixture was aligned with Vite's baseline compiler settings; production native configuration remains untouched.
- The next lifecycle run proved the native build passed, then `pnpm --dir reference exec` failed because `reference/` intentionally has no package manifest. The reference route script was changed to a cross-platform Node invocation that changes only the CLI process working directory and imports the workspace-installed TanStack Router CLI.
- The following run completed native and reference builds. Its preview probe timed out because the harness passed a literal `--` through pnpm, causing Vite to remain on port 4173 instead of the reserved test port. Removing that harness-only separator lets pnpm forward the host and port options correctly.
- Final validation passed `just check` (lint, typecheck, format check, skills checks/tests, and 203 launcher/template tests). The controlled Docker integration passed all copy/update and native/reference lifecycle stages.

- [x] Write and run focused failing unit tests.
- [x] Restrict Vite overlay copying to `reference/index.html` and `reference/src`.
- [x] Preserve native package metadata while adding missing reference requirements.
- [x] Broaden React TypeScript detection and selection gating.
- [x] Convert canonical local source imports to relative paths.
- [x] Update documentation and integration expectations.
- [x] Run focused tests, launcher tests, integration, and `just check`.
