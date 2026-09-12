# Child: dynamic app-name resolution for shared runtime scripts

Checklist ID: 2026-09-12-generator-app-rename-filter-fix-runtime-lookup
Parent: docs/checklists/2026-09-12-generator-app-rename-filter-fix.md
Related checklists: [[2026-09-12-generator-app-rename-filter-fix-generation-rewrite]] (sibling child,
same parent, covers the generation-time doc-rewrite mechanism instead of this child's runtime
dynamic-resolution mechanism)

## Change Tier

Tier: standard

## Context

Four files are copied verbatim into every generated project and hardcode a default app name/path
instead of resolving the project's real one: `apps/playwright/playwright.config.ts` (`--filter web`),
`apps/maestro/scripts/run-flows.mjs` (`spawnDevServer("server")` / `spawnDevServer("expo", ...)`),
`scripts/pre-commit-checks.mjs` (`apps/server` existence check + `--filter server`), and
`scripts/swagger-documentation-check.mjs` (`apps/server/src`). `scripts/run-app.mjs` already resolves
its target app dynamically via the project's `.mono-stack.json`; `scripts/stack-config.mjs` already
exports a validated `readStackConfig(cwd, readFile)` reader. This child adds a small shared lookup
helper on top of that reader and rewires the four files to use it, falling back to today's literal
default when no manifest exists (so this template repo's own dogfood tree, which has no
`.mono-stack.json`, keeps behaving exactly as it does today).

## Implementation Contract

### Feature Boundaries

New module `scripts/stack-app-lookup.mjs` exporting `findAppByFeature(cwd, features, { exists, read
} = {})`, returning the matching app record or `null`. Four call sites updated to use it:
`apps/playwright/playwright.config.ts`, `apps/maestro/scripts/run-flows.mjs`,
`scripts/pre-commit-checks.mjs`, `scripts/swagger-documentation-check.mjs`. Does not touch the
generation-time doc rewrite (sibling child checklist's scope) or `scripts/stack-config.mjs`'s own
validated read/parse logic (reused as-is, not modified).

### Route-Group Ownership

Not applicable — these are build/test-tooling scripts, not HTTP routes.

### User Journey

1. **Playwright**: running `pnpm --filter playwright-tests test` in a generated project with a
   renamed web app must start that app's real dev server, not fail resolving `--filter web`.
2. **Maestro**: running `pnpm --filter maestro-tests test` (or `test:ios`/`test:android`) in a
   generated project with a renamed server and/or expo app must start both real dev servers.
3. **Pre-commit**: committing in a generated project with a renamed server app must still run the
   Swagger and server-unit-test checks against the real app, not silently skip them.
4. **Swagger check**: `pnpm swagger:check` in a generated project with a renamed server app must
   scan that app's real controller directory, not crash on a nonexistent `apps/server/src`.
5. **Unchanged baseline**: running any of the above in this template repo itself (no
   `.mono-stack.json` present) must behave exactly as it does today.

### Complete Test Matrix

| Test ID            | Path type | Small task                                             | Trigger                                                                        | Expected result                                                          | Status |
| ------------------ | --------- | ------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------ |
| TEST-APPLOOKUP-001 | happy     | Resolve an app by feature from a real manifest         | findAppByFeature with an existing `.mono-stack.json` containing a matching app | Returns the matching app record                                          | Passed |
| TEST-APPLOOKUP-002 | non-happy | Return null when no manifest exists                    | findAppByFeature where exists() returns false                                  | Returns null without attempting to read the manifest                     | Passed |
| TEST-APPLOOKUP-003 | non-happy | Return null when the manifest has no matching feature  | findAppByFeature with a manifest present but no app of the requested features  | Returns null                                                             | Passed |
| TEST-PRECOMMIT-007 | happy     | Use the real server app name/path in pre-commit checks | selectChecks/main with a renamed server app resolved via the manifest          | hasServer check targets the real path; `--filter` arg uses the real name | Passed |
| TEST-SWAGGER-007   | happy     | Scan the real server app's controllers                 | validateSwaggerDocumentation with a custom serverAppPath                       | findControllerFiles is called against the custom path's `src` directory  | Passed |

### Unresolved Conflicts

None found.

## Acceptance Criteria

- [x] `findAppByFeature(cwd, features, { exists, read })` returns the first app whose `feature` is in
      `features`, or `null` when the manifest is absent or has no match.
- [x] `apps/playwright/playwright.config.ts`'s `webServer.command` uses the resolved web app's real
      name, falling back to `"web"`. Verified via `pnpm --filter playwright-tests typecheck` (required
      adding `"allowJs": true` to its `tsconfig.json` so TS can consume the untyped `.mjs` helper),
      `pnpm --filter playwright-tests lint`, and `npx playwright test --list` (loads the config and lists
      tests; this repo has no `.mono-stack.json`, so it falls back to `"web"`, matching today's baseline).
- [x] `apps/maestro/scripts/run-flows.mjs`'s two `spawnDevServer` calls use the resolved server/expo
      app names, falling back to `"server"`/`"expo"`. Verified via `node --check` (this file has no
      existing unit test — it is a top-level side-effecting script that spawns real dev servers and
      Maestro, same as before this change; not newly untested by this edit). Reused the file's existing
      `workspaceRoot` constant directly, since it already resolves 3 levels up to the true project root
      (corrected from the plan's mistaken claim that it only reached `apps/`).
- [x] `scripts/pre-commit-checks.mjs`'s `selectChecks` accepts a `serverAppName` parameter (default
      `"server"`) used in its `--filter` arg; `main()` resolves the real server app for both the
      existence check and this parameter.
- [x] `scripts/swagger-documentation-check.mjs`'s `validateSwaggerDocumentation` accepts a
      `serverAppPath` parameter (default `"apps/server"`); `main()` resolves the real server app's path.
- [x] Existing tests in `pre-commit-checks.test.mjs` and `swagger-documentation-check.test.mjs` (which
      call these functions without the new parameter) keep passing unmodified.
- [x] `apps/maestro` and `apps/playwright` import `scripts/stack-app-lookup.mjs` (and, for
      `run-flows.mjs`, `scripts/dev-ports.mjs`) by package name rather than a relative path, since
      Node's package `"imports"` field cannot target a path outside its own package (confirmed via a
      runtime `ERR_INVALID_PACKAGE_TARGET`) and the repo's staged-file relative-import check flags any
      relative cross-package import the moment the file is touched — including the pre-existing,
      previously-dormant `../../../scripts/dev-ports.mjs` import in `run-flows.mjs`. Fixed at the root:
      added `"exports": {"./scripts/*": "./scripts/*"}` to the root `package.json` and
      `"monorepo-template": "workspace:*"` as a devDependency of both `apps/maestro` and
      `apps/playwright`, then imported via `monorepo-template/scripts/<file>.mjs`. Verified with
      `pnpm install`, a direct Node resolution check from `apps/maestro`, and the typecheck/lint/test
      commands above.

## Exact Test Cases

### TEST-APPLOOKUP-001

- Small task: Resolve an app record by feature when a manifest exists and matches.
- Source: `scripts/stack-config.mjs`'s `readStackConfig` contract (schemaVersion 3, `apps` array with
  `feature`/`name`/`path`).
- Test place: `scripts/stack-app-lookup.test.mjs` (`node:test`).
- Starting state: Fake `exists` returns `true`; fake `read` returns a valid schemaVersion-3 manifest
  JSON with one app `{ feature: "api-nest", name: "api", path: "apps/api", generator: "nestjs",
referenceProfile: null }` under features `["api-nest"]`.
- Exact input or fixture: `findAppByFeature("/project", ["api-nest", "api-express"], { exists, read })`.
- Interaction steps: Call the function once.
- Main behavior: Delegates to `readStackConfig`, then finds the first app whose feature is requested.
- Expected result: Returns the `api` app record unchanged.
- Must change: Nothing (pure read).
- Must not happen: Throwing, or returning a different app.
- Planned command: `node --test scripts/stack-app-lookup.test.mjs`.
- Expected result before the code change: Fails — module does not exist yet.
- First observed run: Failed with `ERR_MODULE_NOT_FOUND`, as expected.
- Passing rerun: Passed — returned the `api` app record unchanged.

### TEST-APPLOOKUP-002

- Small task: Return `null` immediately when no manifest file exists.
- Source: Requirement that this template repo's own dogfood tree (no `.mono-stack.json`) is
  unaffected.
- Test place: `scripts/stack-app-lookup.test.mjs`.
- Starting state: Fake `exists` returns `false`.
- Exact input or fixture: `findAppByFeature("/repo", ["api-nest"], { exists, read })` where `read`
  would throw if called.
- Interaction steps: Call the function once.
- Main behavior: Short-circuits on the existence check before attempting to read/parse anything.
- Expected result: Returns `null`; the fake `read` is never invoked.
- Must change: Nothing.
- Must not happen: Any call to `read`.
- Planned command: `node --test scripts/stack-app-lookup.test.mjs`.
- Expected result before the code change: Fails — module does not exist yet.
- First observed run: Failed with `ERR_MODULE_NOT_FOUND`, as expected.
- Passing rerun: Passed — returned `null`, fake `read` was never called.

### TEST-APPLOOKUP-003

- Small task: Return `null` when the manifest exists but has no app for the requested features.
- Source: Same as TEST-APPLOOKUP-001.
- Test place: `scripts/stack-app-lookup.test.mjs`.
- Starting state: Fake `exists` returns `true`; fake `read` returns a valid manifest whose only app
  has `feature: "web-vite"`.
- Exact input or fixture: `findAppByFeature("/project", ["api-nest", "api-express"], { exists, read })`.
- Interaction steps: Call the function once.
- Main behavior: `Array.prototype.find` finds no match.
- Expected result: Returns `null`.
- Must change: Nothing.
- Must not happen: Throwing, or returning the unrelated `web-vite` app.
- Planned command: `node --test scripts/stack-app-lookup.test.mjs`.
- Expected result before the code change: Fails — module does not exist yet.
- First observed run: Failed with `ERR_MODULE_NOT_FOUND`, as expected.
- Passing rerun: Passed — returned `null` for the unrelated `web-vite`-only manifest.

### TEST-PRECOMMIT-007

- Small task: Use the real, renamed server app's name/path in the pre-commit check selection.
- Source: `scripts/pre-commit-checks.mjs`'s existing `selectChecks`/`main` structure and its existing
  `TEST-SWAGGER-006` tests (default `"server"` behavior, must keep passing).
- Test place: `scripts/pre-commit-checks.test.mjs`.
- Starting state: `selectChecks` called directly with `{ hasCoreLauncher: false, hasServer: true,
serverAppName: "api" }`.
- Exact input or fixture: The object literal above.
- Interaction steps: Call `selectChecks` once; inspect the returned array.
- Main behavior: The server-unit-test entry's `args` uses the given `serverAppName`.
- Expected result: `checks` contains `{ label: "server unit tests", args: ["--filter", "api", "test"] }`.
- Must change: Nothing (pure function).
- Must not happen: The literal `"server"` appearing in that entry's args when a custom name is given.
- Planned command: `node --test scripts/pre-commit-checks.test.mjs`.
- Expected result before the code change: Fails — `serverAppName` parameter does not exist yet.
- First observed run: Failed (unexpected args) before `serverAppName` was added, as expected.
- Passing rerun: Passed — 3/3 tests, including both pre-existing default-name cases unchanged.

### TEST-SWAGGER-007

- Small task: Scan a custom server app path's controllers instead of the hardcoded default.
- Source: `scripts/swagger-documentation-check.mjs`'s existing `validateSwaggerDocumentation` and its
  existing tests (default `apps/server/src` behavior, must keep passing).
- Test place: `scripts/swagger-documentation-check.test.mjs`.
- Starting state: A temporary/fake root containing controller files only under a custom
  `apps/api/src` path (not `apps/server/src`).
- Exact input or fixture: `validateSwaggerDocumentation(root, { serverAppPath: "apps/api" })`.
- Interaction steps: Call the function once.
- Main behavior: `findControllerFiles` is invoked against `join(root, "apps/api", "src")`.
- Expected result: The function finds and validates the controllers under `apps/api/src` (not
  `apps/server/src`).
- Must change: Nothing (read-only validation).
- Must not happen: An `ENOENT` from looking under the unused default `apps/server/src`.
- Planned command: `node --test scripts/swagger-documentation-check.test.mjs`.
- Expected result before the code change: Fails — `serverAppPath` parameter does not exist yet.
- First observed run: Failed (parameter did not exist / default path only), as expected.
- Passing rerun: Passed — 4/4 tests, including all pre-existing default-path cases unchanged.
