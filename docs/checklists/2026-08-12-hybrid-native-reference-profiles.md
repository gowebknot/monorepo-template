# Hybrid Native Reference Profiles

- Checklist ID: CHECKLIST-20260812-hybrid-native-reference-profiles
- Created: 2026-08-12
- Planning completed: 2026-08-12
- Type: Bug fix and scaffolding architecture
- Source request: Keep fresh Vite and NestJS CLI scaffolds and their package versions, then apply
  matching source and reference templates so generated reference mode works.
- Related checklists:
  - [Native Vite and NestJS Scaffolding](./2026-08-12-native-vite-nest-scaffolding.md)
  - [Stable Generated Server Start](./2026-08-12-stable-generated-server-start.md)
  - [Latest Generated Dependencies](./2026-08-11-latest-generated-dependencies.md)
- Affected paths: `core/create-mono-stack/`, generated stack manifest handling, and generated-project
  documentation
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Planning Record

- [x] Confirm the regression began when native CLI output replaced complete Copier-rendered app
      directories.
- [x] Confirm the replacement drops Vite source/configuration, NestJS reference dependencies, app
      scripts, and workspace graph edges required by `dev:reference`.
- [x] Choose a hybrid merge policy.
  - [x] Native CLI package versions win for dependencies present in both manifests.
  - [x] Template-only dependencies are added at their authored versions.
  - [x] Template source, reference code, required configuration, and reference scripts are applied
        through a matching profile.
- [x] Limit the first Vite profile to the native React TypeScript scaffold.
- [x] Keep unsupported Vite variants as untouched native apps without web reference mode.
- [x] Treat the project as pre-stable and avoid compatibility layers for previously generated
      projects or obsolete native manifest shapes.
- [x] Revisit this active plan after the detailed-test-planning skills changed.
  - [x] Split broad scaffold cases into profile matching, package merging, file overlay, command,
        selection, manifest, and runnable-reference results.
  - [x] Give each separately failing branch an exact fixture and expected result.
  - [x] Record required and forbidden filesystem or subprocess effects for each rejection branch.

## Acceptance Criteria

- [ ] Native commands run without hiding their prompts.
  - [ ] Vite receives no forced `--template` value and inherits terminal input/output.
  - [ ] NestJS inherits terminal input/output and receives `--skip-install`.
  - [ ] Temporary install artifacts are removed before a native app is copied.
- [ ] A matching Vite React TypeScript app receives reference support.
  - [ ] React TypeScript with Oxlint matches `vite/react-ts`.
  - [ ] React TypeScript with ESLint matches `vite/react-ts`.
  - [ ] Rendered template `src/` replaces native starter `src/`.
  - [ ] Required Vite, TypeScript, router, styling, and lint configuration is copied.
- [ ] An unsupported Vite app remains a fresh native app.
  - [ ] React JavaScript does not match the TypeScript profile.
  - [ ] Vue TypeScript does not match the React profile.
  - [ ] React Compiler TypeScript does not match plain React TypeScript.
  - [ ] A React TypeScript-like package without `src/main.tsx` does not match.
  - [ ] An unexpected entry-file read error is reported instead of being treated as unsupported.
  - [ ] No template source, reference script, or reference profile is applied.
  - [ ] Completion output explains that web reference support was skipped.
- [ ] A native NestJS app receives `nestjs/default` reference support.
  - [ ] Rendered template `src/` replaces native starter `src/`.
  - [ ] Rendered `reference/` and `test/` directories are copied.
  - [ ] Main and reference Nest/TypeScript/lint configuration files are copied.
- [ ] The final package manifest follows the hybrid ownership rule.
  - [ ] Native versions win for a dependency present in both manifests.
  - [ ] Template-only dependencies are added.
  - [ ] Native-only dependencies are retained.
  - [ ] Template scripts needed by copied source/reference code win on name collisions.
  - [ ] Native-only scripts are retained.
  - [ ] The selected app name replaces the temporary CLI package name.
  - [ ] Native top-level metadata such as `version` is retained.
  - [ ] Native dependency placement wins when the template lists the same package in another section.
- [ ] App selection and naming produce only the requested final directories.
  - [ ] Default setup scaffolds `web` and `server` natively.
  - [ ] Custom names produce `apps/dashboard` and `apps/api`.
  - [ ] Equal selected names are rejected before commands or writes.
  - [ ] Vite-only selection removes the rendered server app.
  - [ ] Nest-only selection removes the rendered web app.
  - [ ] A selection without Vite or Nest removes both rendered placeholder apps.
- [ ] One current generated stack manifest is written.
  - [ ] It records schema version 3, selected features, app paths, and nullable profiles.
  - [ ] Template updates accept that exact shape.
  - [ ] Invalid JSON, version, features, and app records are rejected before Copier runs.
  - [ ] Missing and duplicate app records are rejected before Copier runs.
- [ ] Dependency setup happens after final manifests exist.
  - [ ] One `pnpm install --lockfile-only` call runs after native scaffolding and manifest writing.
  - [ ] A lockfile failure still removes the partial project.
- [ ] Generated reference mode is runnable.
  - [ ] Turbo finds the React TypeScript and NestJS reference tasks and required workspace builds.
  - [ ] The generated web app builds and the generated Nest reference app builds.
- [ ] A future profile requires only a new profile registration and overlay definition rather than a
      new scaffold control-flow branch.

## Small Task And Test Map

| Small task or rule                                                          | Source                                         | Test IDs                                             | Ready |
| --------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------- | ----- |
| Match supported React TypeScript output and allow localized future profiles | User clarification; current `apps/web`         | TEST-PROFILE-001, TEST-PROFILE-002, TEST-PROFILE-008 | Yes   |
| Reject distinct unsupported Vite outputs without hiding read errors         | User choice and fail-closed risk               | TEST-PROFILE-003 through TEST-PROFILE-007            | Yes   |
| Merge package versions, placement, and fields                               | User-selected hybrid policy                    | TEST-MERGE-001 through TEST-MERGE-008                | Yes   |
| Invoke native commands safely                                               | Original native-scaffold contract              | TEST-COMMAND-001 through TEST-COMMAND-004            | Yes   |
| Apply or skip web overlay                                                   | User request and `apps/web` imports/config     | TEST-OVERLAY-001 through TEST-OVERLAY-004            | Yes   |
| Apply Nest source/reference overlay                                         | User request and `apps/server/AGENTS.md`       | TEST-OVERLAY-005 through TEST-OVERLAY-007            | Yes   |
| Resolve names and selected apps                                             | Wizard/CLI options and feature definitions     | TEST-SELECTION-001 through TEST-SELECTION-006        | Yes   |
| Write and validate current stack metadata                                   | Launcher output; update wrapper                | TEST-MANIFEST-001 through TEST-MANIFEST-036          | Yes   |
| Regenerate only the final lockfile                                          | User hybrid policy; prior dependency checklist | TEST-CREATE-001, TEST-CREATE-002                     | Yes   |
| Explain missing web profile                                                 | User-selected unsupported-choice behavior      | TEST-CREATE-003                                      | Yes   |
| Prove generated reference tasks/builds                                      | Root scripts, Turbo graph, app scripts         | TEST-REFERENCE-001, TEST-REFERENCE-002               | Yes   |
| Document current profile/version behavior                                   | Generated README and launcher README           | TEST-DOCS-001                                        | Yes   |

## Exact Test Cases

### Profile Matching

- [x] TEST-PROFILE-001: An official-style React TypeScript package using Oxlint matches the web
      profile.
  - Small task/source: Match supported React TypeScript output; user clarification and current
    Create Vite `react-ts` output.
  - Test place: Unit test in `core/create-mono-stack/test/reference-profiles.test.js`.
  - Starting state/input: Package dependencies contain `react@^19.2.8` and `react-dom@^19.2.8`;
    development dependencies contain TypeScript, Vite, `@vitejs/plugin-react`, `@types/react`, and
    `oxlint`; `src/main.tsx` exists.
  - Action/result: Detect one generated app; return `vite/react-ts`.
  - Must change/not happen: No files change and no subprocess runs.
  - Planned first run: Run this named Node test; expect failure because profile detection does not
    exist. Observed result: failed in the focused file run because `reference-profiles.js` does not
    exist.
  - Passing rerun: Focused Node test passed and returned `vite/react-ts`.
- [x] TEST-PROFILE-002: An official-style React TypeScript package using ESLint also matches.
  - Small task/source: Keep the native linter choice from affecting framework compatibility; Create
    Vite offers both linters for `react-ts`.
  - Test place/input: Unit test in `reference-profiles.test.js`; use the previous fixture with ESLint
    dependencies instead of `oxlint`, while `src/main.tsx` still exists.
  - Action/result: Detect one generated app; return `vite/react-ts`.
  - Must change/not happen: No files change and no subprocess runs.
  - Planned first run: Named Node test; expect missing detection API. Observed result: failed in the
    focused file run because the imported module does not exist.
  - Passing rerun: Focused Node test passed and returned `vite/react-ts`.
- [x] TEST-PROFILE-003: React JavaScript does not match the TypeScript profile.
  - Small task/source: Keep unsupported Vite variants fresh; user decision.
  - Test place/input: Unit test in `reference-profiles.test.js`; React and Vite dependencies exist, but
    TypeScript, React type packages, `tsconfig.app.json`, and `src/main.tsx` are absent; `src/main.jsx`
    exists.
  - Action/result: Detect one generated app; return `null`.
  - Must change/not happen: Do not read a template source and do not write files.
  - Planned first run: Named Node test; expect missing detection API. Observed result: failed in the
    focused file run because the imported module does not exist.
  - Passing rerun: Focused Node test passed and returned `null`.
- [x] TEST-PROFILE-004: Vue TypeScript does not match the React profile.
  - Small task/source: Keep a different TypeScript framework fresh; user decision.
  - Test place/input: Unit test in `reference-profiles.test.js`; use `vue`, TypeScript, Vite, and
    `@vitejs/plugin-vue`, with no React packages.
  - Action/result: Detect one generated app; return `null`.
  - Must change/not happen: Do not apply React files or scripts.
  - Planned first run: Named Node test; expect missing detection API. Observed result: failed in the
    focused file run because the imported module does not exist.
  - Passing rerun: Focused Node test passed and returned `null`.
- [x] TEST-PROFILE-005: React Compiler TypeScript does not match plain React TypeScript.
  - Small task/source: Only the plain `react-ts` profile exists today; user clarification.
  - Test place/input: Unit test in `reference-profiles.test.js`; start from the supported fixture and
    add `@rolldown/plugin-babel` and `babel-plugin-react-compiler`.
  - Action/result: Detect one generated app; return `null`.
  - Must change/not happen: Do not overwrite compiler-specific native files.
  - Planned first run: Named Node test; expect missing detection API. Observed result: failed in the
    focused file run because the imported module does not exist.
  - Passing rerun: Focused Node test passed and returned `null`.
- [x] TEST-PROFILE-006: A React TypeScript-like manifest without the expected entry file does not
      match.
  - Small task/source: Fail closed when upstream scaffold shape is unknown; risk review.
  - Test place/input: Unit test in `reference-profiles.test.js`; use the supported manifest but make
    reading `src/main.tsx` fail with `ENOENT`.
  - Action/result: Detect one generated app; return `null`.
  - Must change/not happen: Do not apply the profile and do not hide non-`ENOENT` read errors.
  - Planned first run: Named Node test; expect missing detection API. Observed result: failed in the
    focused file run because the imported module does not exist.
  - Passing rerun: Focused Node test passed and returned `null` for `ENOENT`.
- [x] TEST-PROFILE-007: An unexpected entry-file read error propagates.
  - Small task/source: Do not hide filesystem failures as unsupported variants; fail-closed risk
    review.
  - Test place/input: Unit test in `reference-profiles.test.js`; use the supported manifest and make
    `readFile` throw `permission denied` with code `EACCES`.
  - Action/result: Detect one generated app; reject with the same `permission denied` error.
  - Must change/not happen: Do not return `null`, write files, or run a subprocess.
  - Planned first run: Run the named Node test; expect it to pass because the matcher already handles
    only `ENOENT`. Observed result: passed and returned the same `EACCES` error object.
  - Passing rerun: The first focused run passed; no implementation correction was required.
- [x] TEST-PROFILE-008: A future Vite profile can be supplied through the registry.
  - Small task/source: Future Vite reference templates must use localized profile registration;
    acceptance criterion.
  - Test place/input: Unit test in `reference-profiles.test.js`; provide a registry containing one
    `vite/vue-ts` profile whose matcher returns true for a Vue package fixture.
  - Action/result: Detect one generated app with that registry; return `vite/vue-ts`.
  - Must change/not happen: Do not add a Vue-specific branch to native scaffold orchestration.
  - Planned first run: Run the named Node test; expect failure because detection does not accept or
    iterate a supplied profile registry. Observed result: failed because detection returned `null`
    instead of `vite/vue-ts`.
  - Passing rerun: Full pure suite passed 16/16 and returned `vite/vue-ts` from only the supplied
    registry entry.

### Package Merging

- [x] TEST-MERGE-001: Native versions win for dependencies present in both manifests.
  - Small task/source: Preserve fresh CLI versions; user hybrid policy.
  - Test place/input: Unit test in `reference-profiles.test.js`; native has `react@^20.0.0`,
    `vite@^9.0.0`, and `typescript@~6.0.2`; template has older values for the same names.
  - Action/result: Merge once; final values equal the three native ranges.
  - Must change/not happen: Do not run a package-manager update.
  - Planned first run: Named Node test; expect missing merge API. Observed result: failed in the
    focused file run because the imported module does not exist.
  - Passing rerun: Focused Node test passed for all three native ranges.
- [x] TEST-MERGE-002: Template-only dependencies are added at their authored ranges.
  - Small task/source: Copied source must retain packages it imports; user request and app manifests.
  - Test place/input: Unit test; native omits `@repo/env` and `@tanstack/react-router`, while the
    template defines `workspace:^` and `^1.170.18`.
  - Action/result: Merge once; both names and exact template ranges exist.
  - Must change/not happen: Do not replace them with guessed latest ranges.
  - Planned first run: Named Node test; expect missing merge API. Observed result: failed in the
    focused file run because the imported module does not exist.
  - Passing rerun: Focused Node test passed for both exact template-only ranges.
- [x] TEST-MERGE-003: Native-only dependencies remain in the final manifest.
  - Small task/source: Keep the fresh native scaffold rather than replacing its manifest; user hybrid
    policy.
  - Test place/input: Unit test; native defines `oxlint@^1.75.0` and the template does not.
  - Action/result: Merge once; final `oxlint` range is `^1.75.0`.
  - Must change/not happen: Do not drop the native-only package.
  - Planned first run: Named Node test; expect missing merge API. Observed result: failed in the
    focused file run because the imported module does not exist.
  - Passing rerun: Focused Node test passed for native-only `oxlint`.
- [x] TEST-MERGE-004: Template scripts win when copied source needs a different command.
  - Small task/source: Run route generation and reference entry points; current app scripts.
  - Test place/input: Unit test; native `build` is `tsc -b && vite build`; template `build` is
    `pnpm routes:generate && tsc -b && vite build` and defines `dev:reference`.
  - Action/result: Merge once; final `build` and `dev:reference` equal template values.
  - Must change/not happen: Dependency ranges are not affected by script precedence.
  - Planned first run: Named Node test; expect missing merge API. Observed result: failed in the
    focused file run because the imported module does not exist.
  - Passing rerun: Focused Node test passed for `build` and `dev:reference`.
- [x] TEST-MERGE-005: A native-only script remains available.
  - Small task/source: Preserve native functionality not replaced by the profile; hybrid policy.
  - Test place/input: Unit test; native defines `inspect-native`, template does not.
  - Action/result: Merge once; final `inspect-native` is unchanged.
  - Must change/not happen: Do not remove unrelated native scripts.
  - Planned first run: Named Node test; expect missing merge API. Observed result: failed in the
    focused file run because the imported module does not exist.
  - Passing rerun: Focused Node test passed for `inspect-native`.
- [x] TEST-MERGE-006: The selected app name replaces the temporary CLI package name.
  - Small task/source: User-selected app names; wizard and CLI contract.
  - Test place/input: Unit test; native package name is `vite-dashboard`, selected name is
    `dashboard`.
  - Action/result: Merge once; final package name is `dashboard`.
  - Must change/not happen: Do not retain the temporary prefix.
  - Planned first run: Named Node test; expect missing merge API. Observed result: failed in the
    focused file run because the imported module does not exist.
  - Passing rerun: Focused Node test passed with package name `dashboard`.
- [x] TEST-MERGE-007: Native top-level version metadata remains authoritative.
  - Small task/source: Keep fresh scaffold metadata except the selected name; hybrid policy.
  - Test place/input: Unit test; native version is `1.0.0`, template version is `0.0.0`.
  - Action/result: Merge once; final version is `1.0.0`.
  - Must change/not happen: Do not copy the template version over the native version.
  - Planned first run: Named Node test; expect missing merge API. Observed result: failed in the
    focused file run because the imported module does not exist.
  - Passing rerun: Focused Node test passed with native version `1.0.0` and template-only Jest
    metadata retained.
- [x] TEST-MERGE-008: Native dependency placement wins across dependency sections.
  - Small task/source: Keep the CLI manifest authoritative for overlapping package ownership; hybrid
    policy.
  - Test place/input: Unit test in `reference-profiles.test.js`; native places `typescript@~6.0.2` in
    `devDependencies`, while the template places `typescript@^7.0.0` in `dependencies`.
  - Action/result: Merge once; final `devDependencies.typescript` is `~6.0.2` and final
    `dependencies.typescript` is absent.
  - Must change/not happen: Do not install two versions because the template used another section.
  - Planned first run: Run the named Node test; expect failure because the initial merge handles each
    dependency section independently. Observed result: failed because
    `dependencies.typescript` remained `^7.0.0` while native TypeScript also remained in
    `devDependencies`.
  - Passing rerun: The full focused file passed 15/15; the template dependency was omitted from the
    conflicting section and native `devDependencies.typescript@~6.0.2` remained.

### Native Commands And Files

- [x] TEST-COMMAND-001: Vite runs interactively without a forced template.
  - Small task/source: Preserve the user's native Vite choice; user request and original checklist.
  - Test place/input: Filesystem-backed test in `native-scaffold.test.js`; select `web-vite` named
    `dashboard` and capture `runCommand` arguments.
  - Action/result: Scaffold once; call exactly `pnpm create vite vite-dashboard --no-immediate` with
    `{ cwd: temporaryRoot, stdio: "inherit" }` and no `--template`.
  - Must change/not happen: Do not install or start Vite inside the temporary app.
  - Planned first run: Named Node test; expect current command assertion to pass. A first failure is
    not expected because this existing behavior is retained. Observed result: passed with the exact
    command, working directory, inherited stdio, and no `--template`.
  - Passing rerun: The first filesystem-backed run passed; no correction was required.
- [x] TEST-COMMAND-002: NestJS skips its nested install while retaining interactive output.
  - Small task/source: Perform one workspace install after merging; acceptance criterion.
  - Test place/input: Filesystem-backed test; select `api-nest` named `api` and capture the command.
  - Action/result: Scaffold once; Nest arguments include `new nestjs-api`, `--skip-git`,
    `--package-manager pnpm`, and `--skip-install`; options use inherited stdio.
  - Must change/not happen: The Nest command must not install dependencies or receive shell text.
  - Planned first run: Named Node test; expect failure because `--skip-install` is absent. Observed
    result: failed earlier in the old Nest overlay with `Cannot set properties of undefined (setting
'rootDir')`; the command assertion will be rerun after replacing that overlay.
  - Passing rerun: Filesystem-backed rerun passed with exact inherited stdio and `--skip-install`.
- [x] TEST-COMMAND-003: A native CLI failure leaves rendered app files untouched for project cleanup.
  - Small task/source: Preserve cleanup behavior; original native checklist.
  - Test place/input: Filesystem-backed test; rendered `apps/web/src/template.tsx` exists and the Vite
    command rejects with `Vite failed`.
  - Action/result: Scaffold once; reject with `Vite failed` and keep the rendered marker file.
  - Must change/not happen: Do not remove or replace `apps/web`; do not start the Nest command.
  - Planned first run: Named Node test; current code runs before replacement, so no initial failure is
    expected. Observed result: passed; the rendered marker remained and Nest was not invoked.
  - Passing rerun: The first filesystem-backed run passed; no correction was required.
- [x] TEST-COMMAND-004: Temporary install artifacts are removed before copying a native app.
  - Small task/source: Keep one workspace lockfile and install; dependency setup acceptance criterion.
  - Test place/input: Filesystem-backed test in `native-scaffold.test.js`; fake Vite output contains
    valid Vue source plus `node_modules/native.txt`, `pnpm-lock.yaml`, and `package-lock.json`.
  - Action/result: Scaffold once; final app keeps its Vue source but none of those three artifact paths
    exists.
  - Must change/not happen: Do not remove ordinary native source or `package.json`.
  - Planned first run: Named Node test; expect all three artifacts to be copied. Observed result:
    failed because `node_modules` remained in the final app; the lockfiles were not reached after that
    assertion.
  - Passing rerun: Rerun passed; Vue source and package remained while all three artifacts were absent.
- [x] TEST-OVERLAY-001: React TypeScript replaces native starter source with rendered source.
  - Small task/source: Copy template source after fresh setup; user request.
  - Test place/input: Filesystem-backed test; native output contains `src/App.tsx` and native
    `src/main.tsx`; rendered web contains `src/main.tsx` with `template-main` and no `App.tsx`.
  - Action/result: Scaffold once; final `src/main.tsx` contains `template-main` and `src/App.tsx` is
    absent.
  - Must change/not happen: Do not leave stale native source files beside the template source.
  - Planned first run: Named Node test; expect native source to remain. Observed result: failed because
    final `src/main.tsx` contained `native-main` instead of `template-main`.
  - Passing rerun: Rerun passed with rendered source and no stale native `App.tsx`.
- [x] TEST-OVERLAY-002: React TypeScript receives every required profile configuration file.
  - Small task/source: Copied source depends on Vite aliases, router generation, TypeScript, styling,
    and lint configuration in `apps/web`.
  - Test place/input: Filesystem-backed test; rendered files contain unique markers in
    `vite.config.ts`, all three tsconfig files, `components.json`, `eslint.config.js`, and `.gitignore`.
  - Action/result: Scaffold once; each final file contains its rendered marker.
  - Must change/not happen: Do not copy template `package.json` verbatim.
  - Planned first run: Named Node test; expect markers to be missing. Observed result: failed on the
    first marker because final `.gitignore` did not exist.
  - Passing rerun: Rerun passed for all rendered configuration markers.
- [x] TEST-OVERLAY-003: Unsupported Vue TypeScript source remains native.
  - Small task/source: Keep unsupported Vite choices fresh; user decision.
  - Test place/input: Filesystem-backed test; native Vue app has `src/main.ts` with `vue-main` and
    rendered React source has `template-main`.
  - Action/result: Scaffold once; final source contains `vue-main`, not `template-main`.
  - Must change/not happen: Do not copy any React profile configuration.
  - Planned first run: Named Node test; current code keeps native source, but profile metadata does not
    exist. Observed result: passed for untouched Vue source and absent React entry.
  - Passing rerun: The first filesystem-backed run passed; metadata is checked separately.
- [x] TEST-OVERLAY-004: Unsupported Vue TypeScript receives no web reference advertisement.
  - Small task/source: Unsupported choice behavior selected by user.
  - Test place/input: Continue the Vue fixture with native scripts containing only `dev` and `build`.
  - Action/result: Scaffold once; final package has no `dev:reference`, and returned app metadata has
    `referenceProfile: null`.
  - Must change/not happen: Do not add template-only React dependencies.
  - Planned first run: Named Node test; expect metadata mismatch because current code reports
    `vite-react`. Observed result: failed because `referenceProfile` was `undefined` instead of
    explicit `null`; native scripts and dependencies otherwise remained untouched.
  - Passing rerun: Rerun passed with no reference script/dependency and explicit `null` profile.
- [x] TEST-OVERLAY-005: NestJS replaces native starter source with rendered workspace source.
  - Small task/source: Copy template source after fresh Nest setup; user request.
  - Test place/input: Filesystem-backed test; native `src/main.ts` contains `native-main`; rendered
    `src/main.ts` contains `template-main` and imports `@repo/env/server`.
  - Action/result: Scaffold once; final source contains `template-main`.
  - Must change/not happen: Do not retain a stale native controller file absent from rendered source.
  - Planned first run: Named Node test; expect native source to remain. Observed result: failed before
    the source assertion because the old overlay tried to mutate missing
    `tsconfig.compilerOptions.rootDir`.
  - Passing rerun: Rerun passed with rendered main source and no stale native controller.
- [x] TEST-OVERLAY-006: NestJS copies reference and test directories.
  - Small task/source: Restore examples and runnable reference app; user report and server guidance.
  - Test place/input: Rendered server has `reference/main.ts` and `test/app.e2e-spec.ts` markers; native
    output has no `reference/`.
  - Action/result: Scaffold once; both final markers exist.
  - Must change/not happen: Do not synthesize an incomplete replacement reference tree.
  - Planned first run: Named Node test; reference may copy today but tests do not; expect failure.
    Observed result: failed before file assertions in the old tsconfig mutation.
  - Passing rerun: Rerun passed with both rendered directories and no stale native test.
- [x] TEST-OVERLAY-007: NestJS copies exact main/reference build and lint configuration.
  - Small task/source: Reference output path and workspace lint rules come from `apps/server`.
  - Test place/input: Rendered server has markers in `nest-cli.json`, `nest-cli.reference.json`,
    `tsconfig.json`, `tsconfig.build.json`, `tsconfig.reference.build.json`, `eslint.config.mjs`, and
    `.prettierrc`.
  - Action/result: Scaffold once; every final file contains its rendered marker.
  - Must change/not happen: Do not synthesize a different reference tsconfig or force a TypeScript
    version over the native manifest.
  - Planned first run: Named Node test; expect several markers to be missing or synthesized. Observed
    result: failed before marker assertions in the old tsconfig mutation.
  - Passing rerun: Rerun passed for every exact configuration marker and `nestjs/default`.

### Selection And Generated Metadata

- [x] TEST-SELECTION-001: Direct setup without explicit features or names scaffolds default apps.
  - Small task/source: Default stack is Vite plus NestJS; feature definitions and README.
  - Test place/input: `core/create-mono-stack/test/cli.test.js`; call `createProject` without features
    or app names and inject a scaffold spy.
  - Action/result: Create once; spy receives features `web-vite`, `api-nest` and names `web`, `server`.
  - Must change/not happen: Do not silently leave Copier-rendered apps uninitialized.
  - Planned first run: Named Node test; expect scaffold spy not to run. Observed result: the first
    file run was blocked before this assertion because the fixture returned the Python version for a
    captured Git branch query. After correcting the fixture, the case failed as planned because the
    scaffold spy was never called and `scaffoldOptions` remained undefined.
  - Passing rerun: Focused rerun passed with default features and `web`/`server` names.
- [x] TEST-SELECTION-002: Custom names produce only custom final app paths.
  - Small task/source: User-selected app names; wizard contract.
  - Test place/input: Filesystem-backed test; select both apps as `dashboard` and `api` from rendered
    `apps/web` and `apps/server`.
  - Action/result: Scaffold once; final records and directories are `apps/dashboard` and `apps/api`;
    canonical `apps/web` and `apps/server` are absent.
  - Must change/not happen: Do not keep duplicate canonical app directories.
  - Planned first run: Named Node test; current path moves may pass, but final package names/records
    should fail. Observed result: failed before record assertions in the old Nest tsconfig mutation.
  - Passing rerun: Rerun passed with exact records/package names and no canonical directories.
- [x] TEST-SELECTION-003: Equal Vite and NestJS names are rejected before side effects.
  - Small task/source: Two apps cannot own one final directory; filesystem constraint.
  - Test place/input: Filesystem-backed test; both selected app names are `app` and rendered markers
    exist.
  - Action/result: Scaffold once; reject with `App names must be unique: app`.
  - Must change/not happen: No CLI command, remove, copy, or write runs; rendered markers remain.
  - Planned first run: Named Node test; expect commands/copies instead of early rejection. Observed
    result: failed with an unrelated type error after side effects began instead of the required
    uniqueness error.
  - Passing rerun: Rerun passed with the expected error, no side effects, and both rendered apps intact.
- [x] TEST-SELECTION-004: Vite-only selection removes the rendered server placeholder.
  - Small task/source: Selected features control final apps; feature configuration.
  - Test place/input: Filesystem-backed test; select only `web-vite`; both rendered canonical apps
    exist.
  - Action/result: Scaffold once; final Vite app exists and `apps/server` does not.
  - Must change/not happen: Do not invoke NestJS.
  - Planned first run: Named Node test; expect failure from the shared `apps` selection key. Observed
    result: failed because `apps/server` remained after the Vite-only scaffold.
  - Passing rerun: Rerun passed with one Vite command and no rendered server placeholder.
- [x] TEST-SELECTION-005: Nest-only selection removes the rendered web placeholder.
  - Small task/source: Selected features control final apps; feature configuration.
  - Test place/input: Filesystem-backed test; select only `api-nest`; both rendered canonical apps
    exist.
  - Action/result: Scaffold once; final Nest app exists and `apps/web` does not.
  - Must change/not happen: Do not invoke Vite.
  - Planned first run: Named Node test; expect failure from the shared `apps` selection key. Observed
    result: failed before path assertions in the old Nest tsconfig mutation.
  - Passing rerun: Rerun passed with one Nest command and no rendered web placeholder.
- [x] TEST-SELECTION-006: A selection without Vite or Nest removes both rendered placeholders.
  - Small task/source: Deferred adapters must not accidentally retain default apps; feature contract.
  - Test place/input: Filesystem-backed test; select only `api-express`; both rendered canonical apps
    exist.
  - Action/result: Scaffold once; return no native app records and remove both canonical apps.
  - Must change/not happen: Do not invoke Vite or NestJS.
  - Planned first run: Named Node test; current code removes both and may pass. Observed result: passed
    with no app records and no CLI calls.
  - Passing rerun: The first filesystem-backed run passed; no correction was required.
- [x] TEST-MANIFEST-001: Project creation writes the exact current stack manifest.
  - Small task/source: Persist features, paths, and applied profiles; acceptance criterion.
  - Test place/input: `cli.test.js`; scaffold spy returns React TypeScript and Nest records for custom
    names while selected features are `web-vite`, `api-nest`.
  - Action/result: Create once; write schema version 3, the two features, and the exact records with
    `vite/react-ts` and `nestjs/default`.
  - Must change/not happen: Do not write obsolete `reference` or `packageName` fields.
  - Planned first run: Named Node test; expect schema version 2 and missing features/profile fields.
    Observed result: the first file run was blocked before this assertion because the test fixture
    returned the Python version for a captured Git branch query; the fixture will be corrected and
    this case rerun before implementation. The corrected rerun failed with schema version 2 and no
    `features` field.
  - Passing rerun: Focused rerun passed with exact schema version 3, features, and app records.
- [x] TEST-MANIFEST-002: Template updates accept one valid schema version 3 manifest.
  - Small task/source: Current generated metadata must feed Copier updates; update wrapper contract.
  - Test place/input: `core/create-mono-stack/test/stack-config.test.js`; use the exact manifest from
    TEST-MANIFEST-001.
  - Action/result: Read once; return the same validated features and apps.
  - Must change/not happen: Do not rerun native generators or rewrite the file.
  - Planned first run: Named Node test; expect rejection because only old schemas are accepted.
    Observed result: pending.
  - Passing rerun: Parser suite passed and returned the exact manifest.
- [x] TEST-MANIFEST-003: Invalid JSON is rejected.
  - Small task/source: Parse generated metadata safely; current updater behavior.
  - Test place/input: `stack-config.test.js`; file content is `not-json`.
  - Action/result: Read once; throw `Stack configuration is not valid JSON`.
  - Must change/not happen: Do not invoke Git or Copier.
  - Planned first run: Named Node test; existing behavior should pass. Observed result: pending.
  - Passing rerun: Parser suite passed with the exact invalid-JSON error.
- [x] TEST-MANIFEST-004: An obsolete schema version is rejected.
  - Small task/source: No compatibility layer before stability; user clarification.
  - Test place/input: `stack-config.test.js`; schema version is 2 with otherwise valid fields.
  - Action/result: Read once; throw an error requiring schema version 3.
  - Must change/not happen: Do not translate the old shape.
  - Planned first run: Named Node test; expect old schema 2 to be accepted. Observed result: pending.
  - Passing rerun: Parser suite passed and rejected schema version 2.
- [x] TEST-MANIFEST-005: A missing features array is rejected.
  - Small task/source: Selected features are required for updates; manifest contract.
  - Test place/input: `stack-config.test.js`; schema version 3 has only `apps: []`.
  - Action/result: Read once; throw an error requiring a features array.
  - Must change/not happen: Do not infer features from app generators.
  - Planned first run: Named Node test; expect unsupported-version error before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed with the required-array error.
- [x] TEST-MANIFEST-006: An empty features array is rejected.
  - Small task/source: Feature normalization requires at least one feature; existing contract.
  - Test place/input: `stack-config.test.js`; schema version 3 has `features: []`, `apps: []`.
  - Action/result: Read once; throw `features must contain known non-empty feature IDs`.
  - Must change/not happen: Do not invoke Copier.
  - Planned first run: Named Node test; old schema path may reject for another reason. Observed result:
    pending.
  - Passing rerun: Parser suite passed with the non-empty known-feature error.
- [x] TEST-MANIFEST-007: An unknown feature is rejected.
  - Small task/source: Feature IDs come from the declared stack list; existing contract.
  - Test place/input: `stack-config.test.js`; features contain only `unknown`.
  - Action/result: Read once; throw the known-feature error.
  - Must change/not happen: Do not pass `feature_unknown` to Copier.
  - Planned first run: Named Node test; old schema path may reject for another reason. Observed result:
    pending.
  - Passing rerun: Parser suite passed with the known-feature error.
- [x] TEST-MANIFEST-008: Duplicate features are rejected.
  - Small task/source: Each feature is selected once; existing update contract.
  - Test place/input: `stack-config.test.js`; features are `web-vite`, `web-vite`.
  - Action/result: Read once; throw `features must not contain duplicates`.
  - Must change/not happen: Do not deduplicate silently.
  - Planned first run: Named Node test; old schema path may reject for another reason. Observed result:
    pending.
  - Passing rerun: Parser suite passed with the duplicate-feature error.
- [x] TEST-MANIFEST-009: A non-array apps value is rejected.
  - Small task/source: App records are a list in the current contract.
  - Test place/input: `stack-config.test.js`; schema version 3 uses `apps: {}`.
  - Action/result: Read once; throw `apps must be an array`.
  - Must change/not happen: Do not ignore malformed app metadata.
  - Planned first run: Named Node test; expect unsupported-version error before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed with the required-array error.
- [x] TEST-MANIFEST-010: An app record for a feature not selected is rejected.
  - Small task/source: App records must belong to selected features; manifest consistency rule.
  - Test place/input: `stack-config.test.js`; features contain only `api-nest`, but an app record uses
    `web-vite`.
  - Action/result: Read once; throw an error naming the unselected app feature.
  - Must change/not happen: Do not add the missing feature automatically.
  - Planned first run: Named Node test; expect unsupported-version error before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed and named the unselected feature.
- [x] TEST-MANIFEST-011: A generator that conflicts with its feature is rejected.
  - Small task/source: `web-vite` maps to Vite and `api-nest` maps to NestJS; scaffold definitions.
  - Test place/input: `stack-config.test.js`; a `web-vite` record uses generator `nestjs`.
  - Action/result: Read once; throw an error naming the invalid generator.
  - Must change/not happen: Do not reinterpret the feature.
  - Planned first run: Named Node test; expect unsupported-version error before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed and named the required Vite generator.
- [x] TEST-MANIFEST-012: An app path that does not equal `apps/<name>` is rejected.
  - Small task/source: Generated app paths are derived from validated names; scaffold contract.
  - Test place/input: `stack-config.test.js`; name is `dashboard`, path is `apps/other`.
  - Action/result: Read once; throw an error naming the invalid path.
  - Must change/not happen: Do not allow updates to target a different directory.
  - Planned first run: Named Node test; expect unsupported-version error before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed and named `apps/dashboard`.
- [x] TEST-MANIFEST-013: A non-string, non-null profile is rejected.
  - Small task/source: Unsupported apps use `null`; supported apps use a profile ID; manifest contract.
  - Test place/input: `stack-config.test.js`; `referenceProfile` is `true`.
  - Action/result: Read once; throw an error naming the invalid profile.
  - Must change/not happen: Do not coerce the value.
  - Planned first run: Named Node test; expect unsupported-version error before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed with the string-or-null error.
- [x] TEST-MANIFEST-014: An unknown string profile is rejected.
  - Small task/source: Profile IDs come from the profile registry; current manifest contract.
  - Test place/input: `stack-config.test.js`; a `web-vite` record uses `vite/vue-ts`.
  - Action/result: Read once; throw an error naming the unknown profile.
  - Must change/not happen: Do not assume a future profile exists.
  - Planned first run: Named Node test; expect unsupported-version error before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed and named `vite/vue-ts`.
- [x] TEST-MANIFEST-015: A selected native feature without an app record is rejected.
  - Small task/source: Successful native generation writes one record per selected supported feature;
    current manifest contract.
  - Test place/input: `stack-config.test.js`; features contain `web-vite`, while `apps` is empty.
  - Action/result: Read once; throw an error naming missing `web-vite` app metadata.
  - Must change/not happen: Do not infer an app path or profile.
  - Planned first run: Named Node test; expect unsupported-version error before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed and named missing `web-vite` metadata.
- [x] TEST-MANIFEST-016: Duplicate app feature records are rejected.
  - Small task/source: One generated app represents each supported feature; current manifest contract.
  - Test place/input: `stack-config.test.js`; two valid-looking records both use `web-vite` with
    different names.
  - Action/result: Read once; throw an error naming duplicate `web-vite` app metadata.
  - Must change/not happen: Do not choose one record silently.
  - Planned first run: Named Node test; expect unsupported-version error before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed and named duplicate `web-vite` records.
- [x] TEST-MANIFEST-017: Duplicate final app names are rejected.
  - Small task/source: Two app records cannot target one logical app identity; scaffold uniqueness rule.
  - Test place/input: `stack-config.test.js`; valid Vite and Nest records both use name `app` and path
    `apps/app`.
  - Action/result: Read once; throw an error naming duplicate app name `app`.
  - Must change/not happen: Do not pass conflicting metadata to Copier.
  - Planned first run: Named Node test; expect unsupported-version error before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed and named duplicate app name `app`.
- [x] TEST-MANIFEST-018: A non-object top-level value is rejected.
  - Small task/source: The stack manifest has named schema fields; current manifest contract.
  - Test place/input: `stack-config.test.js`; JSON value is `null`.
  - Action/result: Read once; throw an error requiring a schema version 3 object.
  - Must change/not happen: Do not inspect fields or invoke Copier.
  - Planned first run: Named Node test; expect an old-schema error rather than the new exact contract.
    Observed result: pending.
  - Passing rerun: Parser suite passed with the schema version 3 object error.
- [x] TEST-MANIFEST-019: A missing apps field is rejected.
  - Small task/source: Schema version 3 always records generated native apps; current contract.
  - Test place/input: `stack-config.test.js`; schema version 3 has valid `features` but no `apps`.
  - Action/result: Read once; throw `apps must be an array`.
  - Must change/not happen: Do not replace the missing value with an empty list.
  - Planned first run: Named Node test; expect unsupported-version error before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed with the required apps-array error.
- [x] TEST-MANIFEST-020: A non-object app record is rejected.
  - Small task/source: Every app record has named fields; current contract.
  - Test place/input: `stack-config.test.js`; features contain `web-vite` and apps contain `null`.
  - Action/result: Read once; throw an error requiring app records to be objects.
  - Must change/not happen: Do not treat `null` as a missing optional app.
  - Planned first run: Named Node test; expect unsupported-version error before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed with the app-object error.
- [x] TEST-MANIFEST-021: A non-string app feature is rejected.
  - Small task/source: App feature IDs map records to selected stack features; current contract.
  - Test place/input: `stack-config.test.js`; an otherwise valid app record uses `feature: 1`.
  - Action/result: Read once; throw an error requiring a known native app feature.
  - Must change/not happen: Do not coerce the number.
  - Planned first run: Named Node test; expect unsupported-version error before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed with the native-feature error.
- [x] TEST-MANIFEST-022: A missing app name is rejected.
  - Small task/source: App path and identity require the selected name; current contract.
  - Test place/input: `stack-config.test.js`; an otherwise valid Vite record omits `name`.
  - Action/result: Read once; throw an invalid app-name error.
  - Must change/not happen: Do not derive the name from `path`.
  - Planned first run: Named Node test; expect unsupported-version error before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed with the invalid-name error.
- [x] TEST-MANIFEST-023: An unsafe app name is rejected.
  - Small task/source: Native app names allow only letters, numbers, and hyphens; existing validator.
  - Test place/input: `stack-config.test.js`; an otherwise valid Vite record uses name `../web` and
    path `apps/../web`.
  - Action/result: Read once; throw an invalid app-name error.
  - Must change/not happen: Do not accept path traversal or normalize the value.
  - Planned first run: Named Node test; expect unsupported-version error before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed with the invalid-name error.
- [x] TEST-MANIFEST-024: A non-string generator is rejected.
  - Small task/source: Generators are the exact strings `vite` or `nestjs`; current contract.
  - Test place/input: `stack-config.test.js`; an otherwise valid Vite record uses `generator: null`.
  - Action/result: Read once; throw an invalid generator error.
  - Must change/not happen: Do not infer the generator from the feature.
  - Planned first run: Named Node test; expect unsupported-version error before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed with the exact generator error.
- [x] TEST-MANIFEST-025: A known profile attached to the wrong feature is rejected.
  - Small task/source: Registered profiles belong to one generator/feature; profile registry.
  - Test place/input: `stack-config.test.js`; a `web-vite` record uses `nestjs/default`.
  - Action/result: Read once; throw an incompatible reference-profile error.
  - Must change/not happen: Do not apply the Nest profile to a Vite app.
  - Planned first run: Named Node test; expect unsupported-version error before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed with the incompatible-profile error.
- [x] TEST-MANIFEST-026: A NestJS record without its required profile is rejected.
  - Small task/source: Every generated NestJS app receives `nestjs/default`; acceptance criterion.
  - Test place/input: `stack-config.test.js`; a valid `api-nest` record uses
    `referenceProfile: null`.
  - Action/result: Read once; throw an incompatible reference-profile error.
  - Must change/not happen: Do not accept a Nest app that cannot run reference mode.
  - Planned first run: Named Node test; expect unsupported-version error before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed and rejected missing Nest profile support.
- [x] TEST-MANIFEST-027: A deferred-only feature selection with no native app records is accepted.
  - Small task/source: Deferred adapters remain selectable without native records; feature contract.
  - Test place/input: `stack-config.test.js`; schema version 3 has features `api-express` and apps `[]`.
  - Action/result: Read once; return the same manifest.
  - Must change/not happen: Do not require an app record for an adapter that is not implemented here.
  - Planned first run: Named Node test against the current parser; expected result is rejection because
    schema version 3 is unsupported. Observed result: pending.
  - Passing rerun: Parser suite passed and returned the exact deferred-only manifest.
- [x] TEST-MANIFEST-028: A Vite app without a matching profile is accepted with `null`.
  - Small task/source: Unsupported Vite choices stay fresh and record `null`; user decision.
  - Test place/input: `stack-config.test.js`; select `web-vite` with one valid Vite app record whose
    `referenceProfile` is `null`.
  - Action/result: Read once; return the same manifest.
  - Must change/not happen: Do not require `vite/react-ts` or add web reference mode.
  - Planned first run: Named Node test against the current parser; expected result is rejection because
    schema version 3 is unsupported. Observed result: pending.
  - Passing rerun: Parser suite passed and retained explicit `null`.
- [x] TEST-MANIFEST-029: A missing schema version is rejected.
  - Small task/source: The parser accepts exactly schema version 3; current contract.
  - Test place/input: `stack-config.test.js`; top-level object has valid features/apps but no
    `schemaVersion`.
  - Action/result: Read once; throw an error requiring schema version 3.
  - Must change/not happen: Do not infer the current version.
  - Planned first run: Named Node test; expect the current old-schema error. Observed result: pending.
  - Passing rerun: Parser suite passed with the schema version 3 error.
- [x] TEST-MANIFEST-030: A missing app feature is rejected.
  - Small task/source: Every app record maps to one native feature; current contract.
  - Test place/input: `stack-config.test.js`; an otherwise valid Vite record omits `feature`.
  - Action/result: Read once; throw an error requiring `web-vite` or `api-nest`.
  - Must change/not happen: Do not infer the feature from generator or profile.
  - Planned first run: Named Node test; expect schema-version rejection before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed with the native-feature error.
- [x] TEST-MANIFEST-031: A non-string app name is rejected.
  - Small task/source: Selected app names use the string validator; existing app-name contract.
  - Test place/input: `stack-config.test.js`; an otherwise valid Vite record uses `name: 1`.
  - Action/result: Read once; throw an invalid app-name error.
  - Must change/not happen: Do not coerce the number.
  - Planned first run: Named Node test; expect schema-version rejection before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed with the invalid-name error.
- [x] TEST-MANIFEST-032: A missing generator is rejected.
  - Small task/source: Every app records which native CLI created it; current contract.
  - Test place/input: `stack-config.test.js`; an otherwise valid Vite record omits `generator`.
  - Action/result: Read once; throw an error requiring `vite` or `nestjs`.
  - Must change/not happen: Do not infer the generator from feature.
  - Planned first run: Named Node test; expect schema-version rejection before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed with the exact generator error.
- [x] TEST-MANIFEST-033: A missing app path is rejected.
  - Small task/source: Template updates need the exact final app path; current contract.
  - Test place/input: `stack-config.test.js`; an otherwise valid Vite record omits `path`.
  - Action/result: Read once; throw an error requiring `apps/dashboard`.
  - Must change/not happen: Do not derive or write the missing value.
  - Planned first run: Named Node test; expect schema-version rejection before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed with the expected app path.
- [x] TEST-MANIFEST-034: A non-string app path is rejected.
  - Small task/source: App paths are serialized strings; current contract.
  - Test place/input: `stack-config.test.js`; an otherwise valid Vite record uses `path: null`.
  - Action/result: Read once; throw an error requiring `apps/dashboard`.
  - Must change/not happen: Do not coerce or ignore the value.
  - Planned first run: Named Node test; expect schema-version rejection before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed with the expected app path.
- [x] TEST-MANIFEST-035: A missing reference profile field is rejected.
  - Small task/source: Supported profiles use a string and unsupported Vite apps use explicit `null`;
    current contract.
  - Test place/input: `stack-config.test.js`; an otherwise valid Vite record omits
    `referenceProfile`.
  - Action/result: Read once; throw an error requiring a string or `null`.
  - Must change/not happen: Do not treat a missing field as explicit unsupported status.
  - Planned first run: Named Node test; expect schema-version rejection before implementation.
    Observed result: pending.
  - Passing rerun: Parser suite passed with the string-or-null error.
- [ ] TEST-MANIFEST-036: Copier does not own the launcher-written stack manifest.
  - Small task/source: Template updates must preserve custom app names and profiles; generated
    manifest ownership rule.
  - Test place/input: `copier-template.test.js`; inspect template adapters and update-script imports.
  - Action/result: Read once; `.mono-stack.json.jinja` is absent, `scripts/stack-config.mjs` exists,
    and `scripts/update-template.mjs` imports it.
  - Must change/not happen: Copier must not regenerate or overwrite `.mono-stack.json` during update.
  - Planned first run: Named Node test; expect failure because `.mono-stack.json.jinja` still exists.
    Observed result: pending.
  - Passing rerun: Pending.

### Project Completion And Runnable Reference Mode

- [x] TEST-CREATE-001: Lockfile generation runs once after scaffold metadata is written.
  - Small task/source: Resolve merged manifests without changing their ranges; hybrid policy.
  - Test place/input: `cli.test.js`; record scaffold, stack-manifest write, and command events.
  - Action/result: Create once; call `pnpm install --lockfile-only` in the destination after both
    scaffold and manifest events.
  - Must change/not happen: Do not call `pnpm update --latest`.
  - Planned first run: Named Node test; expect current `update --latest` command. Observed result:
    the first file run was blocked before this assertion by the same captured-Git fixture error; the
    fixture will be corrected and this case rerun before implementation. The corrected rerun failed
    because the command remained `pnpm update --latest --recursive --lockfile-only`.
  - Passing rerun: Focused rerun passed with one `pnpm install --lockfile-only` event after scaffold
    and manifest writing.
- [x] TEST-CREATE-002: A lockfile failure removes the generated project and temporary root.
  - Small task/source: Existing setup cleanup contract.
  - Test place/input: Existing cleanup test in `cli.test.js`; make only `pnpm install --lockfile-only`
    throw `Registry unavailable`.
  - Action/result: Create once; reject with that error and remove destination plus temporary root.
  - Must change/not happen: Do not initialize Git or create the persistent Python environment.
  - Planned first run: Named Node test; update its trigger to the new command and expect cleanup to
    remain passing. Observed result: passed after the trigger update.
  - Passing rerun: Full package suite passed and also proved persistent Python and Git initialization
    did not run after the lockfile failure.
- [x] TEST-CREATE-003: Completion output explains an unsupported web profile.
  - Small task/source: User chose “keep fresh app, no reference” for unsupported Vite variants.
  - Test place/input: `cli.test.js`; setup returns one Vite app named `portal` with
    `referenceProfile: null`.
  - Action/result: Run `main` once; emitted completion text names `portal` and says web reference mode
    was skipped because only React TypeScript is supported.
  - Must change/not happen: Do not report setup failure and do not claim `dev:reference` exists for
    that app.
  - Planned first run: Named Node test; expect the warning to be absent. Observed result: failed as
    expected because completion output contained only the general next steps and no skipped-reference
    message.
  - Passing rerun: Focused rerun passed with the exact non-fatal `portal` reference notice.
- [ ] TEST-REFERENCE-001: Turbo's reference graph includes both supported apps and upstream builds.
  - Small task/source: Root `dev:reference` task and workspace dependency declarations.
  - Test place/input: Copier integration test after deterministic native fixture overlay and install;
    apps are named `web` and `server` with profiles `vite/react-ts` and `nestjs/default`.
  - Action/result: Run `pnpm exec turbo run dev:reference --dry=json`; find `web#dev:reference`
    depending on API client, entities, env, and query client builds, and `server#dev:reference`
    depending on db and env builds.
  - Must change/not happen: Do not start persistent dev servers during this graph check.
  - Planned first run: Integration command; expect missing graph assertion before test addition.
    Observed result: pending.
  - Passing rerun: Pending.
- [ ] TEST-REFERENCE-002: Both supported reference applications build after installation.
  - Small task/source: User-reported `pnpm install && pnpm dev:reference` regression; buildable startup
    prerequisite.
  - Test place/input: Copier integration project from TEST-REFERENCE-001.
  - Action/result: Run `pnpm --filter web build` and `pnpm --filter server build:reference`; both exit
    0 and create their expected dist output.
  - Must change/not happen: Do not contact a live API or start an unbounded watcher.
  - Planned first run: Integration commands; expect server reference build to expose missing merge
    dependencies before implementation. Observed result: pending.
  - Passing rerun: Pending.
- [ ] TEST-DOCS-001: Documentation states the current hybrid and profile behavior.
  - Small task/source: Users must know which versions and references are available; user clarification.
  - Test place/input: Exact text assertions in `copier-template.test.js` over launcher and generated
    README sources.
  - Action/result: Read docs once; find that native overlapping versions win, template-only packages
    are added, only Vite React TypeScript currently receives web reference code, and Nest receives its
    reference profile.
  - Must change/not happen: Do not claim all Vite variants support reference mode or that every
    dependency is force-updated to latest.
  - Planned first run: Named Node test; expect old “refreshes dependencies to latest” text. Observed
    result: pending.
  - Passing rerun: Pending.

## Missing-Case Review

- [x] Normal successful results: TEST-PROFILE-001, TEST-PROFILE-002, TEST-OVERLAY-001 through
      TEST-OVERLAY-007, TEST-MANIFEST-001, TEST-REFERENCE-001, TEST-REFERENCE-002.
- [x] Separate rejected values/rules: TEST-PROFILE-003 through TEST-PROFILE-007 and
      TEST-MANIFEST-003 through TEST-MANIFEST-026 plus TEST-MANIFEST-029 through TEST-MANIFEST-035.
- [x] Missing, `null`, empty, spaces-only, wrong-type, bad-format, unsupported, duplicate, and
      conflicting values: missing profile file is TEST-PROFILE-006; `null` is the valid unsupported
      profile in TEST-OVERLAY-004; empty features is TEST-MANIFEST-006; wrong type is
      TEST-MANIFEST-009/013; bad JSON/path is TEST-MANIFEST-003/012; unsupported feature is
      TEST-MANIFEST-007; duplicate features, app features, and app names are TEST-MANIFEST-008/016/017
      and TEST-SELECTION-003; conflicting feature/generator is TEST-MANIFEST-011. Spaces-only app-name
      validation is unchanged and remains covered by the existing native scaffold validation test;
      missing/unsafe manifest names are TEST-MANIFEST-022/023; null object/generator inputs are
      TEST-MANIFEST-018/020/024; missing feature/generator/path/profile fields are
      TEST-MANIFEST-030/032/033/035; wrong-type name/path values are TEST-MANIFEST-031/034.
- [x] Exact minimum and maximum values: no numeric limit is defined by this task. The only collection
      minimum is one selected feature, covered by TEST-MANIFEST-006; no maximum exists.
- [x] Choices and branches: both React TypeScript linter choices and four distinct unsupported/missing
      profile branches are TEST-PROFILE-001 through TEST-PROFILE-006; unexpected read errors are
      TEST-PROFILE-007; feature-selection branches are
      TEST-SELECTION-004 through TEST-SELECTION-006.
- [x] Allowed/blocked state changes: profile application is covered by TEST-OVERLAY-001/002 and its
      blocked counterpart by TEST-OVERLAY-003/004.
- [x] Dependency failure, timeout, and unexpected error: lockfile failure is TEST-CREATE-002, CLI
      failure is TEST-COMMAND-003, and unexpected profile reads are TEST-PROFILE-007. No timeout behavior
      exists in this synchronous scaffold contract.
- [x] Authorization/access cases: no account, permission, or authorization boundary exists in local
      project generation.
- [x] Required files/calls/messages: TEST-COMMAND-001/002, TEST-OVERLAY-001 through 007,
      TEST-CREATE-001/003, and TEST-DOCS-001.
- [x] Forbidden work after rejection/failure: TEST-COMMAND-003, TEST-SELECTION-003, and
      TEST-CREATE-002 explicitly assert it.
- [x] Repeated requests/retries: project creation rejects a non-empty destination in an existing test;
      native overlay is intentionally a one-time operation and has no retry/idempotency contract.
- [x] Existing callers/stored data/compatibility: direct default CLI behavior is TEST-SELECTION-001;
      old generated manifests are intentionally unsupported before stability per TEST-MANIFEST-004;
      custom current metadata remains launcher-owned per TEST-MANIFEST-036.
- [x] Loading/empty/error/retry views: no UI view is implemented; terminal completion messaging is
      TEST-CREATE-003.
- [x] Related values/check order: duplicate app names are checked together in TEST-SELECTION-003;
      scaffold-before-manifest-before-lockfile order is TEST-CREATE-001.
- [x] No broad case above hides branches with separately defined expected results.
- [x] No open product question remains after the user's hybrid, React TypeScript-only, unsupported
      Vite, and pre-stable compatibility decisions.

## Implementation Plan

- [x] Implement profile matching.
  - [x] Write TEST-PROFILE-001 through TEST-PROFILE-008 and record their first results.
  - [x] Add fail-closed React TypeScript matching and profile registration.
  - [x] Record passing reruns for each profile case.
- [x] Implement package merging.
  - [x] Write TEST-MERGE-001 through TEST-MERGE-008 and record their first results.
  - [x] Add one merge function with native dependency/top-level precedence and template script
        precedence.
  - [x] Record passing reruns for each merge case.
- [x] Implement command and overlay behavior.
  - [x] Write TEST-COMMAND-001 through TEST-COMMAND-004 and TEST-OVERLAY-001 through
        TEST-OVERLAY-007.
  - [x] Preserve rendered app snapshots before invoking either CLI.
  - [x] Apply registered file lists only after a matching native scaffold succeeds.
  - [x] Add `--skip-install` to NestJS.
  - [x] Record passing reruns for every command/overlay case.
- [x] Implement selection behavior.
  - [x] Write TEST-SELECTION-001 through TEST-SELECTION-006.
  - [x] Normalize default features/names and reject duplicate final names before side effects.
  - [x] Remove unselected canonical Vite and Nest placeholders independently.
  - [x] Record passing reruns for every selection case.
- [x] Implement one current stack metadata contract.
  - [/] Write TEST-MANIFEST-001 through TEST-MANIFEST-036. <!-- partial: TEST-MANIFEST-036 remains. -->
  - [x] Write schema version 3 for every generated selection.
  - [x] Validate only schema version 3 in template updates.
  - [x] Record passing reruns for every manifest case.
- [x] Implement project completion behavior.
  - [x] Write TEST-CREATE-001 through TEST-CREATE-003.
  - [x] Regenerate only the lockfile after final manifests.
  - [x] Report unsupported Vite reference status without failing setup.
  - [x] Record passing reruns for every create case.
- [ ] Implement generated reference validation and documentation.
  - [ ] Write TEST-REFERENCE-001, TEST-REFERENCE-002, and TEST-DOCS-001.
  - [ ] Extend deterministic integration setup to exercise the merged output.
  - [ ] Update launcher and generated README wording.
  - [ ] Record passing reruns or an explicit environment blocker for each case.

## Verification

- [ ] Run each named focused case and record its first failure and passing rerun above.
- [ ] Run `pnpm --filter create-mono-stack test`.
- [ ] Run `pnpm --filter create-mono-stack lint`.
- [ ] Run `pnpm --filter create-mono-stack test:integration` when Docker is available.
- [ ] Generate a controlled React TypeScript and NestJS project and run install/reference builds.
- [ ] Run `pnpm format:check` and `git diff --check`.
- [ ] Reconcile this checklist and append corrective updates to affected historical checklists.

## Risks

- [ ] Upstream CLI template shapes can change; profile matching must fail closed so an unknown Vite
      app is not overwritten with incompatible React code.
- [ ] Template configuration can require dependencies not present in native output; merge tests must
      prove template-only dependencies survive.
- [ ] Native NestJS TypeScript versions must remain CLI-owned while TEST-REFERENCE-002 proves the
      workspace overlay compiles.

## Validation Notes

Record failures before correcting them and passing reruns afterward.

- 2026-08-12: `node --test core/create-mono-stack/test/reference-profiles.test.js` failed before
  loading its 13 named cases with `ERR_MODULE_NOT_FOUND` for `src/reference-profiles.js`. This is the
  shared first failure for TEST-PROFILE-001 through TEST-PROFILE-006 and TEST-MERGE-001 through
  TEST-MERGE-007; the module will now be implemented.
- 2026-08-12: The focused rerun passed all 13 profile and package-merge cases after adding the
  fail-closed matcher, profile registry, and asymmetric hybrid merge.
- 2026-08-12: A focused run of TEST-PROFILE-007 and TEST-MERGE-008 passed the unexpected-read case but
  failed dependency placement: template `dependencies.typescript@^7.0.0` survived alongside native
  `devDependencies.typescript@~6.0.2`. Cross-section native precedence will be added before rerunning.
- 2026-08-12: The complete pure profile/merge suite passed 15/15 after filtering every template
  dependency name already owned by either native dependency section.
- 2026-08-12: The first filesystem-backed command/overlay/selection run passed 6/18 and failed 12/18.
  Existing behavior passed TEST-COMMAND-001, TEST-COMMAND-003, TEST-OVERLAY-003, and
  TEST-SELECTION-006. TEST-OVERLAY-001/002 showed the missing React template overlay;
  TEST-OVERLAY-004 showed missing nullable profile metadata; TEST-SELECTION-003/004 showed missing
  early name collision and independent placeholder removal; TEST-COMMAND-004 showed copied install
  artifacts. Nest-related cases reached the obsolete manual tsconfig mutation and failed there before
  their exact final-file checks, confirming it must be replaced by the registered overlay.
- 2026-08-12: The filesystem-backed rerun passed 18/18 after replacing the partial Nest workaround
  with staged registered profiles, adding early name validation, removing temporary install
  artifacts, and independently removing rendered placeholders before final copies.
- 2026-08-12: The first `create-project-native.test.js` run failed 4/4. TEST-CREATE-003 reached its
  planned assertion and confirmed the unsupported-profile warning is absent. TEST-SELECTION-001,
  TEST-MANIFEST-001, and TEST-CREATE-001 were blocked by a test-fixture bug that returned the Python
  version for captured Git branch commands; that fixture will be corrected before interpreting those
  three cases.
- 2026-08-12: After fixing the test fixture, the same file failed 4/4 at the intended product
  boundaries: default setup skipped native scaffolding, the manifest remained schema 2 without
  features, dependency setup still used recursive `--latest`, and the unsupported Vite message was
  absent.
- 2026-08-12: The launcher-focused rerun passed 4/4 after normalizing defaults, always scaffolding
  selected native apps, writing schema version 3, generating only the final lockfile, and returning
  generated metadata for completion notices.
- 2026-08-12: `node --test core/create-mono-stack/test/stack-config.test.js` failed before loading its
  25 named cases with `ERR_MODULE_NOT_FOUND` for `src/stack-config.js`. This is the shared first failure
  for TEST-MANIFEST-002 through TEST-MANIFEST-026; the current schema parser will now be implemented.
- 2026-08-12: The parser boundary moved to generated-project path `scripts/stack-config.mjs` so
  `update-template.mjs` can import it after `core/` is excluded. The expanded parser suite then passed
  34/34 exact schema version 3 acceptance and rejection cases.
- 2026-08-12: TEST-PROFILE-008 failed as planned because Vite detection ignored the supplied profile
  registry and returned `null`; matcher ownership will move into each registry entry.
- 2026-08-12: The pure suite passed 16/16 after moving React TypeScript matching into its registry
  entry and making Vite detection iterate supplied profile definitions.
- 2026-08-12: The first full launcher run passed 81/88. Four older create-project fixtures reached real
  native scaffolding without creating fake CLI output or providing manifest writes; three
  template-update tests still supplied obsolete schema 1/2 manifests. The focused native and schema
  tests already pass, so these callers will be updated to inject completed scaffolds and use only the
  current schema without weakening their environment, Git, cleanup, or Copier assertions.
- 2026-08-12: After updating old fixtures, the legacy package list passed 86/86. After adding every new
  profile, overlay, selection, launcher, and schema file to the package test command, the complete
  launcher suite passed 152/152.

## Updates

- 2026-08-14: Post-commit review found that the production template updater skips schema version 3
  loading unless a test-only reader is injected, while the generated-project integration still bypasses
  native profile orchestration and expects obsolete schema version 1 metadata. This leaves update
  selection and runnable reference mode unproved. Corrective implementation and validation are tracked
  in [Complete Hybrid Native Reference Generation](./2026-08-14-complete-hybrid-native-reference-generation.md).
