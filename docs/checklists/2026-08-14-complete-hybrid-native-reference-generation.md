# Complete Hybrid Native Reference Generation

- Checklist ID: CHECKLIST-20260814-complete-hybrid-native-reference-generation
- Created: 2026-08-14
- Planning completed: 2026-08-14
- Type: Bug fix and generated-project integration
- Source request: Continue the hybrid native reference work through plan reconciliation, implementation,
  generated-project validation, and final repository checks.
- Related checklists:
  - Origin: [Hybrid Native Reference Profiles](./2026-08-12-hybrid-native-reference-profiles.md)
  - Earlier native scaffold: [Native Vite and NestJS Scaffolding](./2026-08-12-native-vite-nest-scaffolding.md)
  - Earlier update contract: [Configuration-Based Stack Install](./2026-08-11-config-based-stack-install.md)
- Affected paths: `scripts/update-template.mjs`, `core/create-mono-stack/`, generated-project
  documentation, and the linked historical checklist
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Planning Record

- [x] Confirm the planning phase was completed before creating this checklist.
  - [x] Read the task request and applicable repository and package guidance.
  - [x] Read the committed hybrid checklist, its current worktree difference, the implementation,
        focused tests, and generated-project integration harness.
  - [x] Find the current rules in schema version 3, native profile matching, app records, Copier
        arguments, package scripts, Turbo tasks, environment validators, and documentation.
  - [x] Split update loading, update path safety, native integration, update preservation, task graph,
        each build, each ready application, process shutdown, documentation, and regression checks
        into separately testable results.
  - [x] Define exact cases, implementation steps, dependencies, and risks.
- [x] Confirm this checklist captures the completed plan before implementation begins.
  - [x] Keep implementation work in this active checklist.
  - [x] Add a checklist item before making a scope or approach change.
  - [x] Leave every observed result pending until its command runs after this checklist exists.

Use plain English throughout this checklist. A reference profile is the known set of template source,
configuration, scripts, and packages that can safely be applied to one recognized native command-line
scaffold.

## Context and Scope

- [x] Define the problem and requested outcome.
  - [x] Initial generation must run deterministic native Vite and NestJS output through the real
        profile matcher and merge before generated-project checks run.
  - [x] Real template updates must read and validate `.mono-stack.json`; the current production path
        skips that read unless a test-only file reader is injected.
  - [x] Copier must not recreate `apps/web` or `apps/server` when the corresponding native app has a
        custom path, has no matching reference profile, or was not selected.
  - [x] The generated default Vite React TypeScript and NestJS reference applications must appear in
        the Turbo task graph, build, become ready on local ports, and stop within a fixed bound.
  - [x] Current documentation and historical checklist handling must describe and preserve the actual
        behavior.
- [x] Record constraints and non-goals.
  - [x] Native command-line tools remain stubbed in the deterministic integration fixture; ordinary
        tests do not contact those tools or their registries.
  - [x] The repository-owned integration command may use its existing Docker, Python package, and npm
        registry boundaries; runtime readiness uses only local loopback addresses and synthetic data.
  - [x] Native command-line tools do not rerun during template updates.
  - [x] Custom-path and unsupported native app contents remain untouched by Copier updates in this
        correction; refreshing their profile source is a separate future design problem.
  - [x] No compatibility path for schema versions 1 or 2 is added because the project is pre-stable.
  - [x] No commit, push, publication, release, or validation bypass is authorized.

## Implementation Description

- Not applicable. This checklist tracks a post-commit correction and completion pass rather than a
  commit or release.

## Acceptance Criteria

- [x] The committed origin checklist remains immutable except for one dated update linking here.
- [x] `pnpm template:update` always validates the real schema version 3 manifest before Git or Copier
      work.
- [x] Copier excludes canonical Vite or NestJS paths when their generated app is custom-named,
      unsupported by a profile, or absent.
- [x] The create/update integration runs the real native profile orchestration over controlled native
      fixtures and writes the exact schema version 3 manifest.
- [x] Copier update preserves the launcher-owned manifest bytes.
- [x] Turbo reports both default `dev:reference` tasks with their required upstream builds.
- [x] The generated web reference app and NestJS reference app each build with expected output.
- [x] Turbo forwards the six validated web and reference-server environment variables to both
      persistent reference tasks.
- [x] One bounded root `pnpm dev:reference` run makes both local applications ready and then stops the
      complete process group without forced cleanup.
- [x] Source and generated documentation state the hybrid version rule, supported profiles, and update
      preservation behavior without promising a recursive latest-version refresh.
- [x] Focused, package, integration, formatting, skill synchronization, and repository checks pass.

## Small Task Breakdown

- [x] Preserve historical plan ownership.
  - [x] Restore the committed origin checklist body and append only one dated correction link.
    - Test IDs: TEST-HISTORY-001
    - Ready: Yes
- [x] Repair generated template-update input and path safety.
  - [x] Load a real schema version 3 file when no test reader is injected.
    - Test IDs: TEST-UPDATE-001
    - Ready: Yes
  - [x] Exclude the canonical web path for a supported web app stored at a custom path.
    - Test IDs: TEST-UPDATE-002
    - Ready: Yes
  - [x] Exclude the canonical web path for an unsupported native Vite app.
    - Test IDs: TEST-UPDATE-003
    - Ready: Yes
  - [x] Exclude the canonical server path when no NestJS app record exists.
    - Test IDs: TEST-UPDATE-004
    - Ready: Yes
  - [x] Exclude the canonical web path when no Vite app record exists.
    - Test IDs: TEST-UPDATE-005
    - Ready: Yes
  - [x] Exclude the canonical server path for a supported NestJS app stored at a custom path.
    - Test IDs: TEST-UPDATE-006
    - Ready: Yes
  - [x] Keep both canonical paths available to Copier for default supported apps.
    - Test IDs: TEST-UPDATE-007
    - Ready: Yes
- [x] Exercise initial generation and template update through one deterministic fixture.
  - [x] Apply both real profiles and write exact launcher metadata.
    - Test IDs: TEST-INTEGRATION-001
    - Ready: Yes
  - [x] Preserve launcher metadata through Copier update.
    - Test IDs: TEST-INTEGRATION-002
    - Ready: Yes
- [x] Prove generated reference operation.
  - [x] Report both reference development tasks and upstream builds.
    - Test IDs: TEST-REFERENCE-001
    - Ready: Yes
  - [x] Forward validated reference environment values through Turbo.
    - Test IDs: TEST-REFERENCE-007
    - Ready: Yes
  - [x] Build the generated web app.
    - Test IDs: TEST-REFERENCE-002
    - Ready: Yes
  - [x] Build the generated NestJS reference app.
    - Test IDs: TEST-REFERENCE-003
    - Ready: Yes
  - [x] Make the generated web app ready on a local temporary port.
    - Test IDs: TEST-REFERENCE-004
    - Ready: Yes
  - [x] Make the generated NestJS reference API ready on a local temporary port.
    - Test IDs: TEST-REFERENCE-005
    - Ready: Yes
  - [x] Stop the root development command and all child processes within the shutdown limit.
    - Test IDs: TEST-REFERENCE-006
    - Ready: Yes
- [x] Reconcile user-facing text and complete validation.
  - [x] Make source, launcher, generated, and test fixture wording agree.
    - Test IDs: TEST-DOCS-001
    - Ready: Yes
  - [x] Pass the affected package checks.
    - Test IDs: TEST-REGRESSION-001
    - Ready: Yes
  - [x] Pass the repository gate without changing unrelated skill work.
    - Test IDs: TEST-REGRESSION-002
    - Ready: Yes

## Rules and Open Questions

- [x] Native package versions win when the native and template manifests declare the same package.
  - Source: User-selected hybrid rule and `core/create-mono-stack/src/reference-profiles.js`.
  - Test IDs: TEST-INTEGRATION-001, TEST-REFERENCE-002, TEST-REFERENCE-003
- [x] Only `vite/react-ts` receives the web profile; unsupported Vite output remains native and records
      `null`.
  - Source: Origin checklist and schema version 3 validator.
  - Test IDs: TEST-UPDATE-003
- [x] Every generated NestJS app records `nestjs/default`.
  - Source: Origin checklist and schema version 3 validator.
  - Test IDs: TEST-INTEGRATION-001
- [x] The launcher, not Copier, owns `.mono-stack.json`.
  - Source: Origin checklist TEST-MANIFEST-036 and absence of `.mono-stack.json.jinja`.
  - Test IDs: TEST-HISTORY-001, TEST-INTEGRATION-002
- [x] Turbo strict mode must pass the environment values consumed by web and reference-server
      validators.
  - Source: `packages/env/src/create-web-env.ts`, `packages/env/src/reference-server-env.ts`, and the
    reached integration timeout.
  - Test IDs: TEST-REFERENCE-007, TEST-REFERENCE-004, TEST-REFERENCE-005
- [x] Custom-path, unsupported, and absent native apps are not canonical Copier update targets.
  - Source: Native app preservation rule, app records, and the prohibition on rerunning native tools
    during update.
  - Test IDs: TEST-UPDATE-002 through TEST-UPDATE-006
- [x] No unresolved expected result blocks this checklist.
  - Conflicting sources: None. The request and repository records agree on hybrid creation, unsupported
    Vite preservation, schema version 3 ownership, and runnable default references.

## Small Task and Test Map

| Small task or rule                      | Source                                   | Test IDs                                 | Ready or missing detail |
| --------------------------------------- | ---------------------------------------- | ---------------------------------------- | ----------------------- |
| Preserve committed checklist history    | Checklist lifecycle policy               | TEST-HISTORY-001                         | Ready                   |
| Read the production manifest            | Update contract and schema parser        | TEST-UPDATE-001                          | Ready                   |
| Protect a custom supported web path     | App record path and native preservation  | TEST-UPDATE-002                          | Ready                   |
| Protect an unsupported web app          | `referenceProfile: null` rule            | TEST-UPDATE-003                          | Ready                   |
| Protect an absent NestJS app            | Selected-feature and app-record contract | TEST-UPDATE-004                          | Ready                   |
| Protect an absent Vite app              | Selected-feature and app-record contract | TEST-UPDATE-005                          | Ready                   |
| Protect a custom supported NestJS path  | App record path and native preservation  | TEST-UPDATE-006                          | Ready                   |
| Update both default supported app paths | App record path and profile contract     | TEST-UPDATE-007                          | Ready                   |
| Apply real profiles in generated output | Hybrid source request                    | TEST-INTEGRATION-001                     | Ready                   |
| Preserve launcher metadata on update    | Manifest ownership rule                  | TEST-INTEGRATION-002                     | Ready                   |
| Verify the reference task graph         | Root and Turbo scripts                   | TEST-REFERENCE-001                       | Ready                   |
| Forward reference environment values    | Env validators and Turbo strict mode     | TEST-REFERENCE-007                       | Ready                   |
| Build web reference output              | Web package build contract               | TEST-REFERENCE-002                       | Ready                   |
| Build NestJS reference output           | Server package build contract            | TEST-REFERENCE-003                       | Ready                   |
| Start web locally                       | Root reference command                   | TEST-REFERENCE-004                       | Ready                   |
| Start the reference API locally         | Root reference command                   | TEST-REFERENCE-005                       | Ready                   |
| Stop every development process          | Bounded integration safety               | TEST-REFERENCE-006                       | Ready                   |
| Align documentation                     | User-facing hybrid behavior              | TEST-DOCS-001                            | Ready                   |
| Pass package and repository gates       | Package and root guidance                | TEST-REGRESSION-001, TEST-REGRESSION-002 | Ready                   |

## Exact Test Cases To Complete

- [x] TEST-HISTORY-001: The committed origin checklist changes only by one dated link to this correction.
  - Small task: Preserve the committed checklist body while recording the correction.
  - Source: `test-first-workflow` and `checklist-tracking` committed-history rules.
  - Test place: Exact Git-object and working-file comparison for the origin Markdown file.
  - Starting state: The origin checklist exists in commit `338a7bf` and currently has worktree edits
    inside its committed body.
  - Exact input or fixture: The `HEAD` file bytes plus one `2026-08-14` update paragraph linking this
    checklist.
  - Interaction steps: Read the committed file, read the working file, remove the exact appended update
    from the working value, and compare the remaining bytes.
  - Main behavior: Preserve immutable checklist history.
  - Expected result: The body equals `HEAD` byte for byte and the new update exists once at the bottom.
  - Must change: Only the dated bottom update remains as a worktree difference in the origin file.
  - Must not happen: Earlier wording, checkboxes, ordering, results, or formatting must not change.
  - Planned command: `node --input-type=module -e` exact comparison using `git show` and `readFile`.
  - Expected result before the code change: The comparison fails because current edits change earlier
    committed lines and do not link this checklist.
  - First observed run: The exact comparison failed as planned. Its first difference showed changed
    indentation inside the committed planning record, followed by table formatting and post-commit
    result edits; the required dated link was also absent.
  - Passing rerun: The exact `git show` and working-file comparison passed after restoring every
    committed byte and appending the one dated update shown in this case.

- [x] TEST-UPDATE-001: A normal update reads the real schema version 3 file without a test-only reader.
  - Small task: Load production stack metadata before update subprocesses.
  - Source: `docs/checklists/2026-08-11-config-based-stack-install.md` TEST-STACK-006 and schema version 3.
  - Test place: Filesystem-backed Node test in `core/create-mono-stack/test/template-update-stack.test.js`.
  - Starting state: A temporary project contains a valid `.mono-stack.json`, a reported `.venv` Python
    path, and fake Git and Copier subprocess results.
  - Exact input or fixture: Features `web-vite` and `api-nest`; default `web` and `server` records with
    profiles `vite/react-ts` and `nestjs/default`.
  - Interaction steps: Call `updateTemplate(["--defaults"])` without `dependencies.readFile`, then
    inspect the Copier arguments.
  - Main behavior: Use the production file reader and serialize the selected features.
  - Expected result: Copier receives schema-derived `--data` arguments before `--defaults`.
  - Must change: One real manifest read affects the Copier argument array.
  - Must not happen: Git or Copier must not run before malformed or missing metadata is rejected.
  - Planned command: `node --test core/create-mono-stack/test/template-update-stack.test.js`.
  - Expected result before the code change: The case fails because production leaves `stackConfig`
    undefined and sends no feature arguments.
  - First observed run: Failed as planned. The real manifest existed, but the final Copier argument
    list did not contain `features_json` or either selected-feature flag.
  - Passing rerun: The focused file passed and the captured Copier arguments contained the exact
    `features_json`, `feature_web_vite=true`, and `feature_api_nest=true` values from the real file.

- [x] TEST-UPDATE-002: A supported web app at `apps/dashboard` prevents Copier from creating `apps/web`.
  - Small task: Protect a custom supported web path during update.
  - Source: Schema app paths, custom-name support, and launcher-owned app placement.
  - Test place: Argument-level Node test in `template-update-stack.test.js`.
  - Starting state: A valid manifest selects `web-vite`; its app is `dashboard` with
    `referenceProfile: "vite/react-ts"`.
  - Exact input or fixture: App path `apps/dashboard` and canonical template path `apps/web`.
  - Interaction steps: Call `updateTemplate([])` with controlled readers and subprocesses, then inspect
    the Copier arguments.
  - Main behavior: Exclude the unmatched canonical web path.
  - Expected result: Copier receives exactly one `--exclude`, `apps/web` pair for this rule.
  - Must change: The canonical path is added to Copier exclusions.
  - Must not happen: The custom app path is not excluded, moved, deleted, or passed to a native tool.
  - Planned command: `node --test core/create-mono-stack/test/template-update-stack.test.js`.
  - Expected result before the code change: The case fails because no canonical app exclusions exist.
  - First observed run: Failed as planned with an empty exclusion list instead of `apps/web`.
  - Passing rerun: The focused file passed with the exact exclusion list `["apps/web"]`.

- [x] TEST-UPDATE-003: An unsupported Vite app at `apps/web` remains outside Copier updates.
  - Small task: Protect an unsupported native Vite app during update.
  - Source: Unsupported Vite apps remain untouched and record `referenceProfile: null`.
  - Test place: Argument-level Node test in `template-update-stack.test.js`.
  - Starting state: A valid manifest selects `web-vite`; its default-named app has a null profile.
  - Exact input or fixture: App `web`, path `apps/web`, generator `vite`, and profile `null`.
  - Interaction steps: Call `updateTemplate([])` and inspect the Copier arguments.
  - Main behavior: Exclude template React source from an unsupported native app.
  - Expected result: Copier receives `--exclude`, `apps/web`.
  - Must change: The canonical web path is excluded.
  - Must not happen: React TypeScript source, scripts, packages, or a native command must be applied.
  - Planned command: `node --test core/create-mono-stack/test/template-update-stack.test.js`.
  - Expected result before the code change: The case fails because `referenceProfile: null` does not
    affect Copier arguments.
  - First observed run: Failed as planned with an empty exclusion list instead of `apps/web`.
  - Passing rerun: The focused file passed with the exact exclusion list `["apps/web"]`.

- [x] TEST-UPDATE-004: A selection without a NestJS app prevents Copier from creating `apps/server`.
  - Small task: Protect the canonical server path when NestJS is absent.
  - Source: Selected features and required app-record consistency in `scripts/stack-config.mjs`.
  - Test place: Argument-level Node test in `template-update-stack.test.js`.
  - Starting state: A valid manifest selects only `web-vite` and contains its supported default app.
  - Exact input or fixture: Features `web-vite`; app `web` at `apps/web` with profile `vite/react-ts`.
  - Interaction steps: Call `updateTemplate([])` and inspect the Copier arguments.
  - Main behavior: Exclude the absent canonical server app.
  - Expected result: Copier receives `--exclude`, `apps/server`.
  - Must change: The canonical server path is excluded.
  - Must not happen: A NestJS directory is created and no native command runs.
  - Planned command: `node --test core/create-mono-stack/test/template-update-stack.test.js`.
  - Expected result before the code change: The generic exclusion logic already exists, so this split
    regression case is expected to pass with only `apps/server` excluded.
  - First observed run: The first run after splitting the combined fixture passed with only
    `apps/server` excluded.
  - Passing rerun: The first split-case run passed; no implementation correction was required.

- [x] TEST-UPDATE-005: A selection without a Vite app prevents Copier from creating `apps/web`.
  - Small task: Protect the canonical web path when Vite is absent.
  - Source: Selected features and required app-record consistency in `scripts/stack-config.mjs`.
  - Test place: Argument-level Node test in `template-update-stack.test.js`.
  - Starting state: A valid manifest selects only `api-nest` and contains its supported default app.
  - Exact input or fixture: Features `api-nest`; app `server` at `apps/server` with profile
    `nestjs/default`.
  - Interaction steps: Call `updateTemplate([])` and inspect the Copier arguments.
  - Main behavior: Exclude the absent canonical web app.
  - Expected result: Copier receives exactly `--exclude`, `apps/web` for app paths.
  - Must change: The canonical web path is excluded.
  - Must not happen: The supported default server path is not excluded and no native command runs.
  - Planned command: `node --test core/create-mono-stack/test/template-update-stack.test.js`.
  - Expected result before the code change: The generic exclusion logic already exists, so this new
    regression case is expected to pass without a production change.
  - First observed run: Passed on its first run with only `apps/web` excluded.
  - Passing rerun: The first run passed; no implementation correction was required.

- [x] TEST-UPDATE-006: A supported NestJS app at `apps/api` prevents Copier from creating `apps/server`.
  - Small task: Protect a custom supported NestJS path during update.
  - Source: Schema app paths, custom-name support, and launcher-owned app placement.
  - Test place: Argument-level Node test in `template-update-stack.test.js`.
  - Starting state: A valid manifest selects both native apps; Vite uses its supported default path and
    NestJS uses the custom path `apps/api` with `nestjs/default`.
  - Exact input or fixture: App name `api`, app path `apps/api`, and canonical path `apps/server`.
  - Interaction steps: Call `updateTemplate([])` and inspect the Copier arguments.
  - Main behavior: Exclude the unmatched canonical server path.
  - Expected result: Copier receives exactly `--exclude`, `apps/server` for app paths.
  - Must change: The canonical server path is added to Copier exclusions.
  - Must not happen: The custom app path or supported default web path is not excluded, moved, or deleted.
  - Planned command: `node --test core/create-mono-stack/test/template-update-stack.test.js`.
  - Expected result before the code change: The generic exclusion logic already exists, so this new
    regression case is expected to pass without a production change.
  - First observed run: Passed on its first run with only `apps/server` excluded.
  - Passing rerun: The first run passed; no implementation correction was required.

- [x] TEST-UPDATE-007: Default supported Vite and NestJS apps remain Copier update targets.
  - Small task: Avoid excluding canonical paths that own supported default profiles.
  - Source: Default app records and the requirement that matching reference profiles receive template
    updates.
  - Test place: Argument-level Node test in `template-update-stack.test.js`.
  - Starting state: A valid manifest contains the default `web` and `server` app records with their
    supported profiles.
  - Exact input or fixture: App paths `apps/web` and `apps/server`; profiles `vite/react-ts` and
    `nestjs/default`.
  - Interaction steps: Call `updateTemplate([])` and inspect every Copier exclusion argument.
  - Main behavior: Leave both supported canonical app paths available to Copier.
  - Expected result: The app-path exclusion list is empty.
  - Must change: No app path is added to the exclusion list.
  - Must not happen: Supported default profile source is skipped during update and no native command runs.
  - Planned command: `node --test core/create-mono-stack/test/template-update-stack.test.js`.
  - Expected result before the code change: The generic exclusion logic already exists, so this new
    regression case is expected to pass without a production change.
  - First observed run: Passed on its first run with an empty app-path exclusion list.
  - Passing rerun: The first run passed; no implementation correction was required.

- [x] TEST-INTEGRATION-001: Controlled Vite React TypeScript and NestJS output receives both real profiles.
  - Small task: Exercise the complete native profile stage in a generated project.
  - Source: Hybrid generation request and schema version 3 launcher output.
  - Test place: Docker-backed create/update integration in `copier-template.integration.test.js`.
  - Starting state: Copier has rendered the default source template into a temporary project; no stack
    manifest exists because Copier does not own it.
  - Exact input or fixture: Controlled native packages using the rendered dependency ranges, Vite
    `src/main.tsx`, and NestJS starter files; selected names are `web` and `server`.
  - Interaction steps: Run real `scaffoldNativeApps` with an injected native-command writer, write the
    returned records as schema version 3, and generate the final lockfile.
  - Main behavior: Apply registered source/configuration overlays and hybrid package merging.
  - Expected result: The exact `vite/react-ts` and `nestjs/default` records exist and both generated
    package manifests contain their reference scripts and workspace packages.
  - Must change: Rendered placeholders become merged native apps and `.mono-stack.json` is written.
  - Must not happen: No live Vite or NestJS command runs and Copier does not write the manifest.
  - Planned command: `pnpm --filter create-mono-stack test:integration`.
  - Expected result before the code change: The integration fails at its stale schema version 1
    assertion because direct Copier generation no longer creates `.mono-stack.json`.
  - First observed run: The new full-flow harness passed native profile detection, schema version 3,
    merged package, and final-lockfile assertions. The command then failed on a case-sensitive README
    assertion even though the generated text contained the required sentence with an initial capital.
  - Passing rerun: The second integration run passed the complete native-profile stage with exact app
    records, merged package scripts and workspace dependencies, schema version 3, and a regenerated
    lockfile.

- [x] TEST-INTEGRATION-002: Copier update preserves the launcher-written stack manifest exactly.
  - Small task: Keep generated app names and profiles launcher-owned through update.
  - Source: Origin TEST-MANIFEST-036 and absence of a Copier manifest adapter.
  - Test place: Docker-backed create/update integration after TEST-INTEGRATION-001.
  - Starting state: The generated project has committed schema version 3 metadata and the template has
    a newer local tag.
  - Exact input or fixture: The exact manifest bytes written by TEST-INTEGRATION-001.
  - Interaction steps: Save the bytes, run Copier update to the new tag, and read the file again.
  - Main behavior: Leave launcher metadata unchanged.
  - Expected result: The before and after strings are byte-for-byte equal.
  - Must change: Shared template files still receive the tagged update.
  - Must not happen: Copier must not delete, regenerate, reorder, or rewrite stack metadata.
  - Planned command: `pnpm --filter create-mono-stack test:integration`.
  - Expected result before the code change: The current integration cannot reach this assertion because
    it expects Copier to create schema version 1 metadata.
  - First observed run: Not reached because the same integration command stopped at the earlier
    generated README assertion before the project baseline commit and Copier update.
  - Passing rerun: The second integration run completed the local Copier update and the before and
    after manifest strings were byte-for-byte equal.

- [x] TEST-REFERENCE-001: Turbo reports both reference development tasks and required upstream builds.
  - Small task: Verify the generated reference task graph.
  - Source: Root `dev:reference`, Turbo `^build`, and generated app package scripts.
  - Test place: Generated-project integration after a frozen install.
  - Starting state: The merged default project is updated and dependencies are installed.
  - Exact input or fixture: Tasks `web#dev:reference` and `server#dev:reference`.
  - Interaction steps: Run Turbo's dry JSON graph for `dev:reference` and inspect both task records.
  - Main behavior: Resolve each persistent app task after its workspace dependencies build.
  - Expected result: Web depends on API client, entities, env, and query client builds; server depends
    on db and env builds; each task definition depends on `^build`.
  - Must change: No files; only graph output is produced.
  - Must not happen: Persistent application processes must not start during this dry run.
  - Planned command: `pnpm --filter create-mono-stack test:integration`.
  - Expected result before the code change: The integration checks `dev` instead of `dev:reference`, so
    this required graph is not proved.
  - First observed run: Not reached because the integration stopped at the earlier generated README
    assertion.
  - Passing rerun: The second integration run passed the exact `dev:reference` dry graph for both apps
    and all required upstream builds without starting a persistent task during the graph check.

- [x] TEST-REFERENCE-007: Turbo forwards every validated reference environment value.
  - Small task: Pass runtime configuration through Turbo strict environment mode.
  - Source: Web and reference-server environment validators plus the first reached runtime failure.
  - Test place: Turbo configuration assertion in `copier-template.test.js` and the generated-project
    runtime integration.
  - Starting state: `turbo.json` defines `dev:reference` as persistent but has no `env` allowlist; the
    spawned process receives custom local URLs, database mode, and API port.
  - Exact input or fixture: `DATABASE_URL=:memory:`, `NODE_ENV=test`, `REFERENCE_ALLOWED_ORIGINS` set to
    the local web URL, a dynamic `REFERENCE_PORT`, `WEB_PUBLIC_API_BASE_URL` set to the same API URL,
    and `WEB_PUBLIC_APP_URL` set to the local web URL.
  - Interaction steps: Assert the exact six-name `dev:reference.env` list, spawn the documented root
    command, and probe the dynamic API port.
  - Main behavior: Forward validated runtime configuration to persistent web and NestJS tasks.
  - Expected result: The generated Turbo task contains all six names and NestJS listens on the supplied
    dynamic port.
  - Must change: `turbo.json` gains one explicit environment list for `dev:reference`.
  - Must not happen: Secret values are not stored in Turbo configuration, undeclared environment names
    are not added, and the test does not use a fixed external port.
  - Planned command: `node --test --test-name-pattern='builds workspace dependencies before starting development' core/create-mono-stack/test/copier-template.test.js` followed by `pnpm --filter create-mono-stack test:integration`.
  - Expected result before the code change: The focused configuration assertion fails because no
    allowlist exists; the reached integration run times out on the dynamic API port while Nest logs a
    successful start using its default value.
  - First observed run: The second integration run passed update, graph, and both builds, then timed out
    for 120 seconds on the dynamic `/users` URL. Nest logged successful startup and route mapping, while
    the source Turbo task had no environment list, confirming strict-mode filtering. The subsequent
    focused configuration test failed with actual value `undefined` instead of the exact six-name list.
  - Passing rerun: The focused configuration test passed with the exact six-name list, and the third
    integration run reached the supplied dynamic API port successfully.

- [x] TEST-REFERENCE-002: The generated Vite React TypeScript reference app builds.
  - Small task: Build the merged web profile output.
  - Source: User-reported reference regression and web package build script.
  - Test place: Generated-project integration after frozen install.
  - Starting state: The generated project contains the merged `web` package and built upstream packages.
  - Exact input or fixture: `pnpm --filter web build` and `apps/web/dist/index.html`.
  - Interaction steps: Run the build once and read the expected output path.
  - Main behavior: Compile and bundle copied reference source with native-owned overlapping versions.
  - Expected result: The command exits zero and `dist/index.html` exists.
  - Must change: Web build output is created.
  - Must not happen: No development watcher or live API request starts.
  - Planned command: `pnpm --filter create-mono-stack test:integration`.
  - Expected result before the code change: The integration runs only the broad root build and has no
    exact web profile output assertion.
  - First observed run: Not reached because the integration stopped at the earlier generated README
    assertion.
  - Passing rerun: The second integration run exited zero for the exact web build and found
    `apps/web/dist/index.html`.

- [x] TEST-REFERENCE-003: The generated NestJS reference app builds.
  - Small task: Build the copied NestJS reference entry point.
  - Source: User-reported reference regression and server `build:reference` script.
  - Test place: Generated-project integration after frozen install.
  - Starting state: The generated project contains the merged `server` package and built upstream packages.
  - Exact input or fixture: `pnpm --filter server build:reference` and
    `apps/server/dist/reference/main.js`.
  - Interaction steps: Run the reference build once and read the expected output path.
  - Main behavior: Compile copied reference source with template-only workspace dependencies.
  - Expected result: The command exits zero and `dist/reference/main.js` exists.
  - Must change: NestJS reference build output is created.
  - Must not happen: No watcher, server, external database, or native command starts.
  - Planned command: `pnpm --filter create-mono-stack test:integration`.
  - Expected result before the code change: The integration never runs `build:reference` and does not
    prove this output.
  - First observed run: Not reached because the integration stopped at the earlier generated README
    assertion.
  - Passing rerun: The second integration run exited zero for `build:reference` and found
    `apps/server/dist/reference/main.js`.

- [x] TEST-REFERENCE-004: Root reference development makes the generated web app ready locally.
  - Small task: Prove web startup from the documented root command.
  - Source: User request that `pnpm dev:reference` work after installation.
  - Test place: Bounded generated-project integration using local loopback ports.
  - Starting state: Both reference builds pass; the temporary web script is assigned an unused strict
    loopback port for this test only.
  - Exact input or fixture: `GET http://127.0.0.1:<web-port>/`.
  - Interaction steps: Spawn `pnpm dev:reference`, poll the web URL until the deadline, and read the
    response.
  - Main behavior: Serve the generated web reference application.
  - Expected result: The endpoint returns HTTP 200 before the readiness timeout.
  - Must change: Only temporary integration process state and build caches may change.
  - Must not happen: No external host is contacted by the readiness probe.
  - Planned command: `pnpm --filter create-mono-stack test:integration`.
  - Expected result before the code change: No bounded startup check exists, so the current integration
    cannot prove readiness.
  - First observed run: Not reached because the integration stopped at the earlier generated README
    assertion.
  - Passing rerun: The third integration run received HTTP 200 from the generated Vite app on its
    reserved loopback port.

- [x] TEST-REFERENCE-005: Root reference development makes the generated NestJS API ready locally.
  - Small task: Prove reference API startup from the documented root command.
  - Source: User request and the NestJS reference users endpoint.
  - Test place: The same bounded generated-project integration process as TEST-REFERENCE-004.
  - Starting state: The process receives an in-memory SQLite URL, an unused API port, and matching local
    origin values.
  - Exact input or fixture: `GET http://127.0.0.1:<reference-port>/users`.
  - Interaction steps: Poll the API URL until the deadline, require HTTP 200, and parse the body.
  - Main behavior: Start the generated reference API and initialize its local example database.
  - Expected result: The endpoint returns HTTP 200 and a JSON array before the readiness timeout.
  - Must change: Only in-memory database state and temporary process state may change.
  - Must not happen: No persistent database file or external service is used.
  - Planned command: `pnpm --filter create-mono-stack test:integration`.
  - Expected result before the code change: No runtime API check exists, so the current integration
    cannot prove readiness.
  - First observed run: The first integration stopped before runtime. The next run reached runtime,
    logged a successful Nest start, and timed out on the supplied dynamic port because Turbo did not
    forward `REFERENCE_PORT`.
  - Passing rerun: After adding the Turbo environment list, the third integration run received HTTP
    200 and a JSON array from `/users` on the supplied loopback port.

- [x] TEST-REFERENCE-006: The bounded development check stops pnpm, Turbo, Vite, and NestJS cleanly.
  - Small task: Prevent persistent integration processes from leaking after readiness or failure.
  - Source: Integration isolation and security-testing policy.
  - Test place: Process-group cleanup in the generated-project integration helper.
  - Starting state: The root reference process and both applications are running in one detached local
    process group.
  - Exact input or fixture: One `SIGTERM` sent to the process group and a ten-second shutdown limit.
  - Interaction steps: Register cleanup before polling, prove readiness, send `SIGTERM`, wait for exit,
    and use `SIGKILL` only as a failing cleanup fallback.
  - Main behavior: End the complete local process tree within the bound.
  - Expected result: The root process closes within ten seconds and forced cleanup is not required.
  - Must change: All child processes stop.
  - Must not happen: No watcher survives the test and no passing result is recorded after `SIGKILL`.
  - Planned command: `pnpm --filter create-mono-stack test:integration`.
  - Expected result before the code change: The integration has no persistent-process harness or
    process-tree cleanup assertion.
  - First observed run: Not reached because the integration stopped at the earlier generated README
    assertion.
  - Passing rerun: The third integration run sent one `SIGTERM`, observed process-group closure inside
    ten seconds, and returned `forcedKill: false`.

- [x] TEST-DOCS-001: All user-facing sources describe the same hybrid and update behavior.
  - Small task: Align source, launcher, generated, and fixture documentation.
  - Source: Hybrid ownership rule, supported profile registry, and update path preservation in this plan.
  - Test place: Exact text assertions in `core/create-mono-stack/test/copier-template.test.js`.
  - Starting state: The root README still promises latest dependency refreshes and the expected adapter
    fixture does not equal the current generated README adapter.
  - Exact input or fixture: `README.md`, `README.md.jinja`, `core/create-mono-stack/README.md`, and the
    adapter expectation.
  - Interaction steps: Read each source and run the focused Copier-template tests.
  - Main behavior: State the native-version precedence, template-only packages, supported profiles,
    and preservation of custom or unsupported native apps during update.
  - Expected result: Required wording exists, forbidden recursive-latest wording is absent, and the
    adapter source equals its expected fixture.
  - Must change: Stale documentation and fixture text become consistent.
  - Must not happen: Documentation must not claim all Vite choices receive React source or that custom
    native apps are refreshed by Copier.
  - Planned command: `node --test --test-name-pattern='TEST-DOCS-001|keeps project identity adapters synchronized' core/create-mono-stack/test/copier-template.test.js`.
  - Expected result before the code change: The run fails because the adapter fixture is stale and the
    root source still promises latest dependency refreshes.
  - First observed run: Both selected tests failed as planned. The root README lacked the native
    version rule and still promised latest dependency refreshes; the generated adapter lacked the
    custom-path and unsupported-app update-preservation sentence required by its expected fixture.
  - Passing rerun: Both focused tests passed after allowing ordinary Markdown whitespace. All three
    sources contain the required hybrid, profile, and update-preservation text; the adapter equals its
    expected fixture and the obsolete latest-refresh promise is absent.

- [x] TEST-REGRESSION-001: The complete create-mono-stack package remains correct after focused fixes.
  - Small task: Preserve launcher, schema, Git, cleanup, wizard, and profile behavior.
  - Source: `core/create-mono-stack/AGENTS.md`.
  - Test place: Package test and lint commands.
  - Starting state: Focused update, documentation, and integration corrections are complete.
  - Exact input or fixture: Every test listed by the package `test` script and every package JavaScript file.
  - Interaction steps: Run the package test command, then package lint.
  - Main behavior: Keep all affected and existing package contracts passing.
  - Expected result: Both commands exit zero with no skipped cases or lint errors.
  - Must change: Only normal test caches or temporary files allowed by existing harnesses.
  - Must not happen: Assertions, hooks, or checks must not be disabled or weakened.
  - Planned command: `pnpm --filter create-mono-stack test && pnpm --filter create-mono-stack lint`.
  - Expected result before the code change: The package test fails because the README adapter fixture
    is stale; lint may also report the currently unused stack feature set.
  - First observed run: The first complete package run after the focused corrections passed all
    158 tests, and the parallel package lint command exited zero.
  - Passing rerun: After final missing-case expansion, the complete package rerun passed 161/161 and
    package lint again exited zero.

- [x] TEST-REGRESSION-002: The complete repository gate passes without altering unrelated worktree edits.
  - Small task: Validate the final repository state and synchronized skill roots.
  - Source: Root `AGENTS.md` and current user-authored skill changes.
  - Test place: Root checks, exact formatting checks for touched files, and Git whitespace validation.
  - Starting state: Package and integration cases pass; unrelated user edits remain present.
  - Exact input or fixture: Current worktree with this task's files plus preserved skill and planning edits.
  - Interaction steps: Run targeted Prettier, skill synchronization validation, `just check`, and
    `git diff --check`; inspect final status and diff.
  - Main behavior: Prove repository-wide consistency without absorbing or reverting unrelated work.
  - Expected result: Every command exits zero and the final diff contains only intended changes plus
    the pre-existing user edits.
  - Must change: Formatting may change only files owned by this task when required.
  - Must not happen: No unrelated file is reverted, committed, pushed, published, or staged.
  - Planned command: `just check && git diff --check` after targeted formatting and `pnpm skills:check`.
  - Expected result before the code change: The gate is expected to fail because focused source,
    fixture, checklist-history, and integration work is incomplete.
  - First observed run: The targeted format check reported seven task-owned files, `pnpm skills:check`
    reported that the current `test-first-workflow` content did not match `.skills-sync.json`, and
    `git diff --check` passed. No unrelated content was reverted or staged.
  - Passing rerun: After formatting only the reported files and synchronizing the user's portable skill
    state, final `just check` passed lint, typecheck, repository formatting, 16-skill synchronization,
    77 skill-policy tests, the core package check, and 161 launcher tests. `git diff --check` and the
    exact historical-checklist comparison also passed.

## Missing-Case Review

- [x] Normal valid values and successful results: TEST-UPDATE-001, TEST-INTEGRATION-001,
      TEST-INTEGRATION-002, and TEST-REFERENCE-001 through TEST-REFERENCE-006.
- [x] Each separate validation rule and rejected value: Schema rejection is already covered by
      TEST-MANIFEST-003 through TEST-MANIFEST-035 in the origin checklist; this task adds no schema rule.
- [x] Missing value: Missing NestJS and Vite records are represented separately by TEST-UPDATE-004 and
      TEST-UPDATE-005; missing manifest behavior
      remains in the existing template-update test.
- [x] Explicit `null` value: TEST-UPDATE-003 covers the meaningful null profile.
- [x] Empty, spaces-only, wrong-type, bad-format, duplicate, conflicting, minimum, and maximum values:
      no new input validator is introduced; all schema and app-name forms remain covered by the origin
      manifest, selection, and profile cases.
- [x] Unsupported value: TEST-UPDATE-003 covers unsupported Vite output.
- [x] Each choice and branch: Default supported app updates are TEST-UPDATE-007; custom web and NestJS
      paths are TEST-UPDATE-002/006; unsupported web is TEST-UPDATE-003; absent NestJS and Vite apps are
      TEST-UPDATE-004/005.
- [x] Empty data, one item, and many items: Empty app records remain covered by the schema parser; one
      selected native app is TEST-UPDATE-004/005; both default apps are TEST-UPDATE-007 and
      TEST-INTEGRATION-001.
- [x] Allowed and blocked state changes: Supported default profiles change generated placeholders in
      TEST-INTEGRATION-001; update exclusions block app changes in TEST-UPDATE-002 through 004.
- [x] Dependency failure and unexpected error: Existing launcher cleanup and profile read-error cases
      remain unchanged; integration command failures report captured command output.
- [x] Timeout: TEST-REFERENCE-004 through TEST-REFERENCE-006 define readiness and shutdown deadlines.
- [x] Signed-out, permission, owner, and account access: No account or authorization boundary exists in
      local project generation.
- [x] Required data and file changes: TEST-HISTORY-001, TEST-INTEGRATION-001, TEST-REFERENCE-002, and
      TEST-REFERENCE-003.
- [x] Required outside calls: TEST-UPDATE-001 proves controlled Git and Copier calls; the integration
      boundary is explicitly owned by TEST-INTEGRATION-001 and 002.
- [x] Required messages, events, and navigation: No new UI, message, event, or navigation behavior is
      introduced.
- [x] Work that must not happen after rejection or failure: Existing update tests prove no Copier call
      after manifest rejection; TEST-REFERENCE-006 prevents leaked processes.
- [x] Repeated requests, retries, and duplicate delivery: Project updates are user-run operations with
      no automatic retry or delivery contract.
- [x] Existing callers and public behavior: TEST-REGRESSION-001 covers all existing update, launcher,
      schema, Git, cleanup, and wizard tests.
- [x] Stored data that must keep working: Only current schema version 3 is supported; older schemas are
      intentionally rejected.
- [x] Loading, empty, success, error, and retry views: No UI view is changed; process readiness and
      command failure output are the relevant integration states.
- [x] Values that affect one another or check order: App path and profile jointly determine exclusions
      in TEST-UPDATE-002 and TEST-UPDATE-003; scaffold, manifest, lockfile, update, install, graph,
      builds, and startup run in that order in integration.
- [x] Confirm no broad case hides situations that could pass or fail separately.
- [x] Confirm every open question is answered before blocked work begins.
- [x] Confirm every conflict between trusted sources is resolved before blocked work begins.
- [x] Confirm no observed test result was written before its command ran.

## Implementation Plan

- [x] Reconcile checklist history.
  - [x] Complete TEST-HISTORY-001.
  - [x] Restore the committed origin body and append one dated link to this checklist.
  - [x] Record the first run and passing rerun.
- [x] Repair update metadata loading and canonical path exclusions.
  - [x] Write TEST-UPDATE-001 through TEST-UPDATE-007 and record their first results.
  - [x] Always call the schema version 3 reader and derive the smallest Copier exclusion list.
  - [x] Update existing update fixtures to provide valid current metadata where they test other behavior.
  - [x] Keep the changed update test below 300 lines by extracting its shared current-manifest fixture.
    - Test IDs: TEST-REGRESSION-001
  - [x] Record passing reruns.
- [x] Complete deterministic generated-project integration.
  - [x] Write TEST-INTEGRATION-001 and TEST-INTEGRATION-002 and record their first results.
  - [x] Add a focused helper that writes controlled native output and runs real profile orchestration.
  - [x] Extract template-fixture copying so the changed integration test remains below 300 lines.
    - Test IDs: TEST-REGRESSION-001
  - [x] Extract generated build checks because the completed integration test is still 307 lines.
    - Test IDs: TEST-REGRESSION-001
  - [x] Write schema version 3, generate the final lockfile, and preserve manifest bytes through update.
  - [x] Record passing reruns.
- [x] Prove generated reference operation.
  - [x] Write TEST-REFERENCE-001 through TEST-REFERENCE-007 and record their first results.
  - [x] Check the exact Turbo graph and build outputs.
  - [x] Forward the six validated reference environment names through Turbo.
  - [x] Add bounded local readiness and process-group cleanup without a new dependency.
  - [x] Record passing reruns.
- [x] Reconcile documentation and regression validation.
  - [x] Write TEST-DOCS-001 and record its first result.
  - [x] Align the three README sources and adapter fixture.
  - [x] Run TEST-REGRESSION-001 and TEST-REGRESSION-002, correcting only failures owned by this task.
  - [x] Record final results and re-scan every checklist item.

## Verification

- [x] Confirm implementation followed this checklist.
- [x] Run each planned case and record the actual first result.
- [x] Record failures before making corrections.
- [x] Rerun corrected cases and record final results.
- [x] Run the package test and lint commands.
- [x] Run the Docker-backed generated-project integration.
- [x] Run required repository checks and Git whitespace validation.
- [x] Review the complete diff and re-scan both linked checklists for stale items.

## Validation Notes

Record active-task validation results here. Record each failure before correcting it, then record the
passing rerun before marking the related item complete. Do not invent test results before running the
command.

- 2026-08-14: TEST-HISTORY-001 failed its first exact comparison. The working origin checklist differs
  from `HEAD` inside the committed body and does not yet contain the required bottom update linking this
  correction.
- 2026-08-14: TEST-HISTORY-001 passed after the committed body was restored byte for byte and the one
  permitted dated correction link was appended at the bottom.
- 2026-08-14: TEST-UPDATE-001 through TEST-UPDATE-004 failed 0/4 as planned. Production omitted all
  schema-derived feature arguments, and every custom, unsupported, or absent canonical-app exclusion
  list was empty.
- 2026-08-14: TEST-DOCS-001 and the adapter synchronization case failed 0/2 as planned. The root source
  retained obsolete latest-refresh wording, and the generated adapter did not yet describe update
  preservation for custom-path and unsupported native apps.
- 2026-08-14: TEST-UPDATE-001 through TEST-UPDATE-004 passed 4/4 after production manifest loading and
  canonical-app exclusions were implemented.
- 2026-08-14: The focused documentation rerun passed adapter synchronization but TEST-DOCS-001 stopped
  on `Vite React TypeScript` because Markdown wrapped between `React` and `TypeScript`. The required
  words and behavior were present; the assertion will accept ordinary whitespace before rerunning.
- 2026-08-14: TEST-DOCS-001 and adapter synchronization passed 2/2 after the whitespace correction.
- 2026-08-14: The existing template-update file passed 2/10 after production loading became mandatory.
  Seven tests for update-environment or Git behavior had no valid manifest fixture and therefore stopped
  at the newly enforced boundary; the feature-forwarding assertion also lacked the two canonical-path
  exclusions required by its custom-web and absent-Nest fixture. These fixtures will be updated without
  changing their original environment or Git expectations.
- 2026-08-14: The first Docker integration reached controlled native profile application and passed the
  schema version 3, merged package, lockfile, and generated-project structure assertions. It failed at a
  case-sensitive generated README regex despite the exact required sentence being present with an
  initial capital, so update, graph, build, readiness, and shutdown stages were not reached.
- 2026-08-14: The second Docker integration passed native profile application, manifest preservation,
  the exact reference graph, both builds, and web startup. Nest compiled, mapped every route, seeded its
  in-memory database, and logged successful startup, but the dynamic API probe timed out because
  `dev:reference` had no Turbo environment allowlist and therefore used the default API port.
- 2026-08-14: Focused TEST-REFERENCE-007 failed with `dev:reference.env` equal to `undefined` instead of
  the six validated web and reference-server environment names.
- 2026-08-14: Focused TEST-REFERENCE-007 passed after `turbo.json` gained the six-name list. The third
  Docker integration then passed 1/1 in about 55 seconds, including native profiles, manifest
  preservation, graph checks, both builds, both HTTP readiness probes, and non-forced process-group
  shutdown.
- 2026-08-14: Shared update fixtures and generated build checks were extracted. The two changed test
  entry files are 279 and 297 lines respectively; every new helper is below 160 lines.
- 2026-08-14: TEST-REGRESSION-001 passed on its first complete run with 158/158 package tests and a
  clean package lint result.
- 2026-08-14: The first TEST-REGRESSION-002 subchecks found seven task-owned files needing Prettier and
  a stale `.skills-sync.json` entry for the user's synchronized `test-first-workflow` changes;
  `git diff --check` passed.
- 2026-08-14: The first `just check` run passed repository lint and typecheck, then failed
  `format:check` on eight directly related native-scaffold and test files whose current worktree
  differences are formatting-only. Repository Prettier will be applied to those exact files before the
  gate is rerun.
- 2026-08-14: Final missing-case review found that one deferred-only fixture combined absent web and
  NestJS behavior, while custom NestJS and default no-exclusion behavior were only implicit. The update
  cases were split before finalization; the generic production logic is already present, so the four
  revised or new focused cases are expected to pass without another implementation change.
- 2026-08-14: The expanded update file passed 7/7. The separately isolated absent NestJS, absent Vite,
  custom NestJS, and default supported-app branches all passed without another production change.
- 2026-08-14: The complete package rerun passed 161/161 after the final update cases were added;
  package lint also passed again.
- 2026-08-14: Final `just check` passed repository lint and typecheck, complete Prettier validation,
  synchronization of 16 portable skills, 77 skill-policy tests, the core package test, and 161 launcher
  tests. The existing React Compiler warning for TanStack Table remained non-failing. Final whitespace,
  historical-checklist, line-limit, status, and diff review found no remaining correctness findings.

## Risks and Follow-Up

- [x] Docker, Python package installation, and npm registry access completed successfully in the final
      integration without weakening its assertions.
- [x] Persistent process cleanup covered pnpm, Turbo, Vite, and NestJS descendants on the current POSIX
      integration environment without forced cleanup.
- [x] Record the non-blocking follow-up that custom-path and unsupported native apps are preserved rather
      than profile-refreshed during Copier updates; a future design must retain native versions and user
      edits.
- [x] Keep upstream native scaffold changes fail-closed through the existing profile matcher and its
      rejection tests.
