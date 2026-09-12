# Child: generation-time rewrite of `--filter &lt;default&gt;` in copied app docs

Checklist ID: 2026-09-12-generator-app-rename-filter-fix-generation-rewrite
Parent: docs/checklists/2026-09-12-generator-app-rename-filter-fix.md
Related checklists: none prior (new bug class, first checklist)

## Change Tier

Tier: standard

## Context

`core/create-mono-stack`'s native scaffolding copies each renameable app's `AGENTS.md`/`CLAUDE.md`
(and, for `expo`/`react-native`, `README.md`) from `reference-templates/managed/*` verbatim into the
generated app's own directory. Every one of those source files hardcodes
`pnpm --filter &lt;canonical-default-name&gt; ...` in its Validation section. When a user renames an app
away from its feature's default (e.g. `web-vite`'s default `web` renamed to `dashboard`), the copied
doc keeps telling agents/humans to run the wrong, non-resolving `--filter` command. This child adds a
new post-processing step, run once real app names are known, that rewrites those references in place.

## Implementation Contract

### Feature Boundaries

New module `core/create-mono-stack/src/app-name-references.js` exporting
`syncAppNameReferences(projectRoot, apps, { read, write } = {})`. It is wired into
`create-project.js` immediately after the existing `syncSkillTriggers(...)` call
(`create-project.js:409-412`), using the allocated-apps array that already carries each app's real
`name`, `path`, and `feature`. It does not touch cross-app shared files (playwright/maestro/scripts) —
that is the sibling child checklist's scope. It does not touch `package.json` (already correctly
renamed by the native scaffolder itself).

### Route-Group Ownership

Not applicable — no HTTP routes involved. "Ownership" here is file-scope: the function only ever
reads/writes files under each app's own `app.path`, never outside it.

### User Journey

The generator's own behavior on `pnpm create-mono-stack ... --web-app-name dashboard` (or any
renamed app): after generation completes, `apps/&lt;renamed&gt;/AGENTS.md` (and `CLAUDE.md`, and
`README.md` where the profile ships one) must read `--filter &lt;renamed&gt;`, not the feature's
canonical default. An unrenamed project's generated output must be byte-for-byte identical to
today's baseline (no unnecessary rewrite/diff noise).

### Complete Test Matrix

| Test ID          | Path type | Small task                                                     | Trigger                                                                                                                                             | Expected result                                                                                                  | Status |
| ---------------- | --------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------ |
| TEST-APPNAME-001 | happy     | Rewrite filter name in a renamed app's AGENTS.md and CLAUDE.md | Call syncAppNameReferences with an app whose name differs from its feature's canonical default                                                      | Both files' `--filter &lt;default&gt;` become `--filter &lt;realName&gt;`; write is called for each changed file | Passed |
| TEST-APPNAME-002 | happy     | Leave an unrenamed app's docs untouched                        | Call syncAppNameReferences with an app whose name equals its canonical default                                                                      | write is never called for that app                                                                               | Passed |
| TEST-APPNAME-003 | non-happy | Skip a profile with no overlaid AGENTS.md/CLAUDE.md/README.md  | Call syncAppNameReferences where read rejects with ENOENT for all three candidate files                                                             | Function resolves without throwing; write is never called for that app                                           | Passed |
| TEST-APPNAME-004 | non-happy | Keep each app's rewrite scoped to its own directory            | Call syncAppNameReferences with two renamed apps of different features                                                                              | Each app's write only targets paths under its own app.path; no cross-app writes occur                            | Passed |
| TEST-APPNAME-005 | non-happy | Do not falsely match a canonical name inside a longer word     | Provide AGENTS.md content containing the canonical name as a substring of a longer word (e.g. "webpack") alongside a real `--filter web` occurrence | Only the exact `--filter web` occurrence is rewritten; the longer word is left untouched                         | Passed |

### Unresolved Conflicts

None found.

## Acceptance Criteria

- [x] `syncAppNameReferences(projectRoot, apps, { read, write })` rewrites `--filter &lt;canonicalName&gt;`
      (word-boundary) to `--filter &lt;app.name&gt;` in `AGENTS.md`, `CLAUDE.md`, and `README.md` under each
      renamed app's `app.path`, skipping files that do not exist and apps whose name matches their
      canonical default.
- [x] `create-project.js` calls this function right after `syncSkillTriggers`, before writing
      `.mono-stack.json`, using the same `{ read: dependencies.readFile ?? readFile, write:
dependencies.writeFile }` dependency shape as the two calls above it.
- [x] `core/create-mono-stack/test/native-scaffold-managed-template.test.js`'s `TEST-MANAGED-001` is left
      unmodified and still passes (it exercises a strictly earlier pipeline stage) — confirmed via
      `pnpm --filter create-mono-stack test` (287 tests, 0 failures, including the 5 new TEST-APPNAME
      cases and the unmodified TEST-MANAGED-001). The new test file was also added to
      `core/create-mono-stack/package.json`'s `test` script (explicit file list, not a glob).

## Exact Test Cases

### TEST-APPNAME-001

- Small task: Rewrite the stale filter name for a renamed app's own AGENTS.md/CLAUDE.md.
- Source: `DEFAULT_FEATURE_NAMES` (`core/create-mono-stack/src/feature-config.js`); observed
  `reference-templates/managed/web/AGENTS.md` content pattern.
- Test place: `core/create-mono-stack/test/app-name-references.test.js` (`node:test`).
- Starting state: In-memory fake `read` returns AGENTS.md content containing
  `pnpm --filter web typecheck` and CLAUDE.md content containing `pnpm --filter web build`, for an
  app `{ feature: "web-vite", name: "dashboard", path: "apps/dashboard" }`.
- Exact input or fixture: `apps = [{ feature: "web-vite", name: "dashboard", path: "apps/dashboard" }]`.
- Interaction steps: Call `syncAppNameReferences(root, apps, { read, write })`.
- Main behavior: Word-boundary replacement of `--filter web` with `--filter dashboard`.
- Expected result: `write` is called for `apps/dashboard/AGENTS.md` and `apps/dashboard/CLAUDE.md`
  with content where every `--filter web` became `--filter dashboard`; no other text changed.
- Must change: The two files' written content (in-memory, via injected `write`).
- Must not happen: `README.md` write is not attempted when the fake `read` rejects it with `ENOENT`.
- Planned command: `node --test core/create-mono-stack/test/app-name-references.test.js`.
- Expected result before the code change: Fails — `app-name-references.js` does not exist yet.
- First observed run: Failed with `ERR_MODULE_NOT_FOUND` for `src/app-name-references.js`, as expected.
- Passing rerun: Passed — `written` contained the two rewritten files, `README.md` was not attempted.

### TEST-APPNAME-002

- Small task: Do not rewrite or write anything for an app that was never renamed.
- Source: Same as TEST-APPNAME-001.
- Test place: `core/create-mono-stack/test/app-name-references.test.js`.
- Starting state: Fake `read` returns AGENTS.md content containing `pnpm --filter web typecheck` for
  an app `{ feature: "web-vite", name: "web", path: "apps/web" }` (name equals canonical default).
- Exact input or fixture: `apps = [{ feature: "web-vite", name: "web", path: "apps/web" }]`.
- Interaction steps: Call `syncAppNameReferences(root, apps, { read, write })`.
- Main behavior: Canonical-name equality short-circuits before any read/write attempt.
- Expected result: `write` is never called.
- Must change: Nothing.
- Must not happen: Any call to the injected `write` function.
- Planned command: `node --test core/create-mono-stack/test/app-name-references.test.js`.
- Expected result before the code change: Fails — module does not exist yet.
- First observed run: Failed with `ERR_MODULE_NOT_FOUND`, as expected.
- Passing rerun: Passed — `writeCalled` stayed `false`.

### TEST-APPNAME-003

- Small task: Skip gracefully when a profile never overlaid AGENTS.md/CLAUDE.md/README.md at all.
- Source: Delegated Vite profiles (`react-router-v7`, `tanstack-router`, `redwood-sdk`, `vike`) —
  confirmed to ship no AGENTS.md/CLAUDE.md overlay.
- Test place: `core/create-mono-stack/test/app-name-references.test.js`.
- Starting state: Fake `read` rejects every path with an `ENOENT`-coded error, for an app
  `{ feature: "web-vite", name: "dashboard", path: "apps/dashboard" }`.
- Exact input or fixture: Same app array shape as TEST-APPNAME-001.
- Interaction steps: Call `syncAppNameReferences(root, apps, { read, write })`.
- Main behavior: Each `ENOENT` is caught and treated as "nothing to rewrite," not a fatal error.
- Expected result: The call resolves without throwing; `write` is never called.
- Must change: Nothing.
- Must not happen: An unhandled rejection or thrown error; any `write` call.
- Planned command: `node --test core/create-mono-stack/test/app-name-references.test.js`.
- Expected result before the code change: Fails — module does not exist yet.
- First observed run: Failed with `ERR_MODULE_NOT_FOUND`, as expected.
- Passing rerun: Passed — call resolved without throwing, `writeCalled` stayed `false`.

### TEST-APPNAME-004

- Small task: Keep each app's rewrite scoped to its own directory when multiple apps are renamed.
- Source: `create-project.js`'s allocated-apps array can contain several apps at once.
- Test place: `core/create-mono-stack/test/app-name-references.test.js`.
- Starting state: Fake `read` returns distinct AGENTS.md content for
  `{ feature: "web-vite", name: "dashboard", path: "apps/dashboard" }` (`--filter web`) and
  `{ feature: "api-nest", name: "api", path: "apps/api" }` (`--filter server`).
- Exact input or fixture: `apps` array with both app objects above.
- Interaction steps: Call `syncAppNameReferences(root, apps, { read, write })`.
- Main behavior: Each app's canonical name is looked up independently via its own `feature`.
- Expected result: `apps/dashboard/AGENTS.md` is written with `--filter dashboard`;
  `apps/api/AGENTS.md` is written with `--filter api`; neither write touches the other app's path.
- Must change: Both files, independently.
- Must not happen: `apps/dashboard`'s write containing `--filter api` or vice versa.
- Planned command: `node --test core/create-mono-stack/test/app-name-references.test.js`.
- Expected result before the code change: Fails — module does not exist yet.
- First observed run: Failed with `ERR_MODULE_NOT_FOUND`, as expected.
- Passing rerun: Passed — dashboard's AGENTS.md rewritten, api's independently rewritten to `api`.

### TEST-APPNAME-005

- Small task: Do not corrupt a longer word that merely contains the canonical name as a substring.
- Source: Regex safety requirement noted during design (word-boundary matching).
- Test place: `core/create-mono-stack/test/app-name-references.test.js`.
- Starting state: Fake `read` returns AGENTS.md content containing both
  `See the webpack notes below.` and `pnpm --filter web typecheck`, for
  `{ feature: "web-vite", name: "dashboard", path: "apps/dashboard" }`.
- Exact input or fixture: Same app array shape as TEST-APPNAME-001, with the combined fixture content
  above.
- Interaction steps: Call `syncAppNameReferences(root, apps, { read, write })`.
- Main behavior: Only the `--filter web` occurrence matches the word-boundary pattern.
- Expected result: Written content contains `pnpm --filter dashboard typecheck` and still contains
  the untouched literal `See the webpack notes below.`.
- Must change: Only the `--filter web` occurrence.
- Must not happen: `webpack` becoming `webpackdashboard`, `dashboardpack`, or any other corruption.
- Planned command: `node --test core/create-mono-stack/test/app-name-references.test.js`.
- Expected result before the code change: Fails — module does not exist yet.
- First observed run: Failed with `ERR_MODULE_NOT_FOUND`, as expected.
- Passing rerun: Passed — `webpack` untouched, `--filter web` became `--filter dashboard`.
