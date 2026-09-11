# Use the Managed Template for Fresh Native Scaffolding

Checklist ID: CHECKLIST-20260911-native-scaffold-managed-template
Tier: standard
Created: 2026-09-11
Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Related checklists

- [Trust the Default Copier Template](2026-09-11-copier-trust-default-template.md)
- [Release create-mono-stack 0.1.52](2026-09-11-release-create-mono-stack-0.1.52.md)

## Implementation Contract

### Feature Boundaries

`scaffoldNativeApps()` in `core/create-mono-stack/src/native-scaffold.js` calls
`applyReferenceProfile()` without `useManagedTemplate: true`, so it falls back to reading each
profile's reference files (`AGENTS.md`, `CLAUDE.md`, source overlays, ...) from the copier-rendered
`apps/{canonicalName}/` in the destination project — i.e. this repo's own live `apps/web/`,
`apps/server/`, etc. `apps/web/` has never had an `AGENTS.md` or `CLAUDE.md` in this repo's history,
so every fresh project creation that resolves a Vite reference profile (e.g. React + TypeScript,
selected interactively) fails with `ENOENT ... apps/web/AGENTS.md` after native Vite scaffolding
completes, confirmed live by a user running the fixed (0.1.52) `create-mono-stack` interactively.
`project-management.js`'s `addApp()` (the `create-mono-stack manage` flow for an existing project)
already passes `useManagedTemplate: true` and reads from the stable, curated
`core/create-mono-stack/reference-templates/managed/{name}/` copy instead — confirmed to have
`AGENTS.md` for every profile with a `managedTemplateRoot`. Fix scope: pass
`useManagedTemplate: true` from `scaffoldNativeApps()` too, matching `addApp()`'s existing pattern.
No change to `applyReferenceProfile()` itself, `project-management.js`, or any profile definition.

### Route-Group Ownership

No HTTP routes. `native-scaffold.js`'s `scaffoldNativeApps()` owns the fresh-project native
scaffolding path; `applyReferenceProfile()` (shared with `project-management.js`) owns applying a
reference profile's files onto a native-generated app.

### User Journey

A user creates a new project selecting a Vite reference profile (React + TypeScript, with or without
the React Compiler, with or without ESLint) interactively or non-interactively. Native scaffolding
completes and the reference files (`AGENTS.md`, `CLAUDE.md`, source overlays) are copied from the
maintained managed-template copy rather than requiring this repo's own live `apps/{name}/` to
happen to contain every file each profile expects.

### Complete Test Matrix

| ID               | Kind                         | Input                                                                            | Action                       | Expected result                                                      | Validation                                                          |
| ---------------- | ---------------------------- | -------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| TEST-MANAGED-001 | valid                        | Fresh destination with no `apps/web/AGENTS.md` (matching this repo's real state) | Scaffold a Vite React+TS app | Succeeds; `AGENTS.md` matches the real managed-template file content | unit test, real filesystem                                          |
| TEST-MANAGED-002 | rejection (regression guard) | Same fixture, unpatched behavior                                                 | Scaffold without the fix     | Fails with `ENOENT` on `apps/web/AGENTS.md`                          | Recorded as the pre-fix observed run, not a separate committed case |

### Unresolved Conflicts

None found. `project-management.js`'s `addApp()` already establishes `useManagedTemplate: true` as
the correct pattern for this exact operation; `scaffoldNativeApps()` was simply never updated to
match when the managed-template mechanism was introduced.

## Acceptance Criteria

- [x] `scaffoldNativeApps()` passes `useManagedTemplate: true` to `applyReferenceProfile()`.
- [x] A real-filesystem regression test proves scaffolding a Vite React+TS app succeeds without a
      synthetic `apps/web/AGENTS.md` in the destination, reading instead from
      `core/create-mono-stack/reference-templates/managed/web/`.
- [x] Existing native-scaffold test suite passes (12 tests across
      `native-scaffold-overlays.test.js` and `native-scaffold.test.js` required updating — see
      Validation Notes; the fix is a genuine, wide-reaching behavior change, not a no-op for them).

## Exact Test Cases

### TEST-MANAGED-001

- **Small task:** Scaffold a fresh Vite React+TS app without relying on the live repo's `apps/web/`.
- **Source:** Live failure report from a real `create-mono-stack@0.1.52` interactive run;
  `project-management.js`'s `addApp()` as the established correct pattern; verified
  `apps/web/AGENTS.md` does not exist and never has (`git log --all -- apps/web/AGENTS.md` is empty)
  while `core/create-mono-stack/reference-templates/managed/web/AGENTS.md` does exist.
- **Test place:** `core/create-mono-stack/test/native-scaffold-managed-template.test.js` (new file;
  intentionally does not reuse `native-scaffold.helpers.js`'s `createNativeScaffoldFixture`, since
  that helper writes its own synthetic `apps/web/AGENTS.md` into the fixture destination and would
  mask this exact bug).
- **Starting state:** A temp destination directory containing only `apps/server/` (unrelated,
  absent here) — specifically no `apps/web/` directory at all — plus a temp `temporaryRoot`
  pre-populated with a native Vite-scaffolded app tree (mimicking what the real Vite CLI produces),
  using real `node:fs/promises` operations, not mocked reads/writes.
- **Exact input or fixture:** `appNames: { "web-vite": ["dashboard"] }`, `features: ["web-vite"]`,
  a `runInteractiveCommand` stub returning a React + TypeScript + ESLint selection (matching
  `vite/react-ts`'s `selectionMatches`).
- **Interaction steps:** Call `scaffoldNativeApps()` with real `nativeScaffoldDependencies({})`
  (real `readFile`/`cp`/`mkdir`/`rm`) merged with the stubbed `runCommand`/`runInteractiveCommand`
  and `temporaryRoot`.
- **Main behavior:** Scaffolding completes without throwing; the resulting `apps/dashboard/AGENTS.md`
  content equals the real `core/create-mono-stack/reference-templates/managed/web/AGENTS.md` file
  content read directly from disk.
- **Expected result:** No `ENOENT`; `AGENTS.md` content matches the managed-template source exactly.
- **Must change:** Only the isolated temp destination/temporary directories.
- **Must not happen:** Reading from or writing to this repo's real `apps/web/`.
- **Planned command:** `pnpm --filter create-mono-stack test`.
- **Expected result before the code change:** Fails with `ENOENT: no such file or directory, lstat
'.../apps/web/AGENTS.md'`, reproducing the live failure exactly.
- **First observed run:** 2026-09-11, ran the new test against the unpatched `native-scaffold.js`;
  failed with the expected `ENOENT` on `apps/web/AGENTS.md`.
- **Passing rerun:** 2026-09-11, `pnpm --filter create-mono-stack test` passed (280/280) after
  adding `useManagedTemplate: true` and registering the new test file in the package's `test`
  script (it was not otherwise discovered, since that script enumerates files explicitly).

## Missing-Case Review

The same `useManagedTemplate` gap also affects the `server`/`next`/`expo`/`mobile` profiles in
`scaffoldNativeApps()`, but it is currently invisible for them because this repo's own
`apps/server/AGENTS.md`, `apps/next/AGENTS.md`, `apps/expo/AGENTS.md`, and `apps/mobile/AGENTS.md`
all happen to exist today. The fix is a single unconditional flag on the one `applyReferenceProfile`
call site, so it corrects all profiles at once, not only the Vite one that is currently failing;
TEST-MANAGED-001 exercises only the Vite path because that is the one with a real, reproducible
pre-fix failure to assert against.

## Validation Notes

- Applying `useManagedTemplate: true` broke 12 pre-existing tests across
  `native-scaffold-overlays.test.js` (TEST-REFERENCE-008/009, TEST-SCAFFOLD-002,
  TEST-OVERLAY-005/006/007/008/009/010/011, TEST-VITE-PROFILE-003) and `native-scaffold.test.js`
  (TEST-TAILWIND-001). Root cause: those tests' shared `createNativeScaffoldFixture()` helper
  writes synthetic single-word marker files (e.g. `"server-agent-marker"`) into
  `<destination>/apps/{web,server,next,expo,mobile}/`, and before this fix that synthetic
  destination copy was exactly what got read (via the `templateTarget` fallback) — so the markers
  round-tripped and the tests passed without ever exercising the real managed-template content.
  With the fix, `profileTemplateTarget` always resolves to the real, fixed
  `core/create-mono-stack/reference-templates/managed/{name}/` directory instead (Node's package
  imports aside, this is a plain absolute path computed from `import.meta.url`, not something the
  test fixture can inject), so those synthetic markers are simply never read anymore.
- Fixed each by comparing against the real managed-template file content at test time (a
  `managedText(name, path)` helper added to `native-scaffold-overlays.test.js`, reading
  `core/create-mono-stack/reference-templates/managed/{name}/{path}` directly) rather than
  hand-transcribing expected values, since manual transcription proved error-prone: several real
  values differ from what the old synthetic markers implied (e.g. managed `expo`'s
  `expo-router` is `~57.0.14`, not the old fixture's assumed `^3.0.0`; managed `mobile`'s
  `dev`/`dev:reference` scripts are `react-native start --port 8082`, not `react-native start`;
  `@tailwindcss/vite` lives under `dependencies` in the real `managed/web/package.json`, not
  `devDependencies` as the old synthetic fixture had it). Two assertions referenced paths that do
  not exist in the real managed templates at all (`reference/src/template-only.tsx` for `web`,
  `app/reference/todos/[todoId].tsx` for `expo`) and were replaced with real existing files
  (`reference/src/lib/utils.ts`; `app/reference/todos.tsx`) that still prove the same "was the
  managed template's tree actually copied" behavior.
- While fixing TEST-OVERLAY-005/006, discovered `native-scaffold-overlays.test.js` never listed
  `pathExists` as unused — no change needed there — but did discover `createNativeScaffoldFixture`
  still writes its synthetic `apps/{web,server,next,expo,mobile}` trees even though
  `scaffoldNativeApps` no longer reads from them; left as-is (out of scope) since other assertions
  in the same fixture-consuming tests (e.g. native-file preservation checks) still depend on it,
  and removing dead fixture writes is a separable cleanup, not required to fix this bug.
- `pnpm --filter create-mono-stack test` (280/280), `pnpm --filter create-mono-stack lint`, and
  `pnpm --filter create-mono-stack typecheck` all pass after the fix and test updates.

- Confirmed via `git log --all --oneline -- apps/web/AGENTS.md` (empty output) that this file has
  never existed in this repository.
- Confirmed `core/create-mono-stack/reference-templates/managed/web/AGENTS.md` exists and
  `project-management.js:172-181`'s `addApp()` already passes `useManagedTemplate: true`.
