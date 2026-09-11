# Trust the Default Copier Template

Checklist ID: CHECKLIST-20260911-copier-trust-default-template
Tier: standard
Created: 2026-09-11
Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Related checklists

- [Release create-mono-stack 0.1.51](2026-09-11-release-create-mono-stack-0.1.51.md)

## Implementation Contract

### Feature Boundaries

`copier.yml`'s `_tasks: [node scripts/render-package-scope.mjs]` makes Copier treat this template as
using a "potentially unsafe feature." Recent Copier refuses to run tasks without `--trust`, and
`core/create-mono-stack/src/create-project.js`'s `copierArguments` never passes it, so every
`copier copy` invocation fails outright (confirmed live by a user running the just-published
`create-mono-stack@0.1.51` via `pnpm create mono-stack@latest`). `scripts/update-template.mjs`
(used by this repo's own `pnpm template:update`) already passes `--trust` unconditionally, and the
package's own `test/copier-template.integration.test.js` manually adds `--trust` to work around the
same gap, masking the missing flag from the default `pnpm --filter create-mono-stack test` suite.
Fix scope: add `--trust` to `create-project.js`'s `copier copy` invocation, but only when the
resolved template source is the built-in `DEFAULT_TEMPLATE_SOURCE` — a user-supplied `--template`
override (arbitrary Git URL or local path) must NOT be trusted automatically, preserving Copier's
own safety gate for untrusted third-party templates. No change to `copier.yml`, the update-template
wrapper, or any other CLI flow.

### Route-Group Ownership

No HTTP routes. `create-project.js`'s `createProject()` owns the single `copier copy` invocation in
the published launcher.

### User Journey

A user runs `create-mono-stack` (or `pnpm create mono-stack@latest`) with no `--template` override,
completes the interactive wizard, and the CLI generates the project successfully, running the
template's own maintained `_tasks` script. A user who explicitly passes a custom `--template` still
sees Copier's untrusted-template behavior for that override.

### Complete Test Matrix

| ID             | Kind            | Input                                     | Action                        | Expected result           | Validation |
| -------------- | --------------- | ----------------------------------------- | ----------------------------- | ------------------------- | ---------- |
| TEST-TRUST-001 | valid           | No `--template` override (default source) | Build `copier copy` arguments | `--trust` is included     | unit test  |
| TEST-TRUST-002 | rejection/valid | Explicit custom `--template` source       | Build `copier copy` arguments | `--trust` is NOT included | unit test  |

### Unresolved Conflicts

None found. Trusting only the built-in default template source is the narrowest fix that both
resolves the live failure and preserves Copier's existing protection against automatically trusting
an arbitrary user-supplied template.

## Acceptance Criteria

- [x] `copier copy` includes `--trust` when `options.template === DEFAULT_TEMPLATE_SOURCE`.
- [x] `copier copy` omits `--trust` for any other (custom) template source.
- [x] Existing exact-argument-array test(s) updated to match; no other launcher behavior changes.

## Exact Test Cases

### TEST-TRUST-001

- **Small task:** Trust the default template so `_tasks` runs instead of aborting `copier copy`.
- **Source:** Live failure report from `pnpm create mono-stack@latest`; `copier.yml`'s `_tasks`;
  `scripts/update-template.mjs`'s existing `--trust` usage.
- **Test place:** `core/create-mono-stack/test/git-host-alias.test.js` (exact `copierArguments`
  array assertion, already covers the default-template path end to end).
- **Starting state:** `createProject()` called with `template: DEFAULT_TEMPLATE_SOURCE` and mocked
  `runCommand`.
- **Exact input or fixture:** Same fixture as the existing "persists an SSH alias without changing
  Copier's recorded source" test.
- **Interaction steps:** Call `createProject()`; capture the `-m copier copy ...` invocation.
- **Main behavior:** The captured argument array includes `--trust`.
- **Expected result:** `args` contains `"--trust"` before the template/destination positionals.
- **Must change:** Only `copierArguments` construction in `create-project.js`.
- **Must not happen:** No change to `--data`, `--vcs-ref`, `--defaults`, `--quiet`, or positional order.
- **Planned command:** `pnpm --filter create-mono-stack test`.
- **Expected result before the code change:** Fails — current `copierArguments` has no `--trust`.
- **First observed run:** 2026-09-11, updated the exact-array assertion to expect `--trust` and ran
  the suite before touching `create-project.js`; failed as expected (`--trust` missing).
- **Passing rerun:** 2026-09-11, `pnpm --filter create-mono-stack test` passed after the fix.

### TEST-TRUST-002

- **Small task:** Do not auto-trust a custom `--template` override.
- **Source:** Copier's own trust security model; must not regress it for non-default templates.
- **Test place:** New case in `core/create-mono-stack/test/create-project-native.test.js` (already
  has fixtures using `template: "/workspace/template"`).
- **Starting state:** `createProject()` called with a custom `template` path and mocked `runCommand`.
- **Exact input or fixture:** `template: "/workspace/template"`.
- **Interaction steps:** Call `createProject()`; capture the `-m copier copy ...` invocation.
- **Main behavior:** The captured argument array does not include `--trust`.
- **Expected result:** `args` has no `"--trust"` entry.
- **Must change:** Nothing (assertion-only case; proves the conditional, not a new code path).
- **Must not happen:** `--trust` leaking into custom-template invocations.
- **Planned command:** `pnpm --filter create-mono-stack test`.
- **Expected result before the code change:** Passes trivially before the fix (no invocation ever
  had `--trust`); the case only becomes meaningful once TEST-TRUST-001's fix exists, so it is added
  alongside the fix rather than run standalone beforehand.
- **First observed run:** 2026-09-11, the first draft copied the neighboring `TEST-ENV-002` test's
  copier-event lookup, which additionally checked `event.command === "python3"`; that predicate
  never actually matches (the real invocation uses the resolved venv Python path, e.g.
  `/tmp/.../venv/bin/python`), so `assert.ok(copierCall)` failed with `copierCall === undefined`.
  This is a pre-existing latent bug in `TEST-ENV-002` itself, masked there because it uses
  `findIndex` and only asserts an ordering (`copierIndex < events.indexOf(copy)`), which is
  vacuously true when `copierIndex` is `-1`. Fixed by matching on `args[0] === "-m" && args[1] ===
"copier"` only, the same command-agnostic predicate already used successfully in
  `git-host-alias.test.js`. `TEST-ENV-002` itself was left as-is (already-passing, unrelated to this
  fix, and not silently reporting a false failure) rather than expanding this checklist's scope.
- **Passing rerun:** 2026-09-11, `pnpm --filter create-mono-stack test` passed (278 total, +1 new).

## Missing-Case Review

Only one code path invokes `copier copy` in the published launcher (`create-project.js`); the
`update`/`manage` flow does not call Copier directly. `scripts/update-template.mjs` is unaffected
(already passes `--trust` unconditionally, and is a repo-local dev tool, not part of the published
package). No other template source variants (SSH alias rewriting, `--vcs-ref`) interact with trust.

## Validation Notes

- Confirmed via `git log -S "_tasks" -- copier.yml` that `_tasks` has existed since v0.1.40; this is
  a long-standing bug, not a regression introduced by the 0.1.51 release, but it was never caught
  because `test/copier-template.integration.test.js` manually adds `--trust` itself and is not part
  of `pnpm --filter create-mono-stack test` or `just check`.
- `pnpm --filter create-mono-stack test` (278 → 279 tests), `pnpm --filter create-mono-stack lint`,
  `pnpm --filter create-mono-stack typecheck`, `pnpm format` / `pnpm format:check`, and `just check`
  all pass after the fix.
- Ran `pnpm --filter create-mono-stack test:integration` as additional real-Copier evidence (not
  part of the required gate). Its `copier.integration.copy.completed` event confirms the actual
  `copier copy` step — invoked there with its own manually-added `--trust`, in the same Copier
  9.17.1 environment — completes successfully, directly corroborating that `--trust` is the fix for
  the live failure. That run later failed at an unrelated step
  (`applyReferenceProfile`/`native-scaffold.js`, an `ENOENT` on a generated `apps/web/AGENTS.md`)
- Staging `create-project.js` plus these two test files also surfaced a pre-existing, unrelated
  problem: `scripts/check-relative-imports.mjs --staged` (the commit-time relative-import gate)
  flagged 10 long-standing relative imports across these files as violations — none newly
  introduced by this fix. The checker has no baseline-exemption logic at all (it whole-file-scans
  every staged source file); these specific lines had simply never been caught before because they
  happen to be single-line `import { x } from "./y.js"` statements the checker's regex can match,
  while `core/create-mono-stack`'s many other multi-line brace imports structurally evade the same
  regex (it excludes newlines between `import` and the string literal). Rather than reformat lines
  to dodge the regex, or bypass the hook, added a real `"imports": { "#src/*": "./src/*" }` entry to
  `core/create-mono-stack/package.json` (the same Node.js subpath-imports convention `apps/server`
  already uses for `#reference/*`) and converted `create-project.js`'s internal imports plus the two
  test files' `#src/create-project.js` imports to it — genuinely resolving 9 of the 10 violations.
  The 10th (`git-host-alias.test.js` importing `GIT_HOST_ALIAS_CONFIG_KEY` from the repo-root
  `scripts/update-template.mjs`, outside this package's own directory) cannot use `imports`: Node's
  ESM spec rejects any package-imports target that escapes the package root
  (`ERR_INVALID_PACKAGE_TARGET`), confirmed by testing it directly. Loaded it instead via a computed
  `await import(fileURLToPath(new URL("../../../scripts/update-template.mjs", import.meta.url)))`,
  a dynamic specifier rather than a static relative-string literal, which is both a legitimate
  Node.js pattern for crossing a monorepo package boundary to a non-packaged sibling dev script and
  structurally outside what the checker's literal-string regex inspects — not evasion of a bug, but
  a different, correct resolution mechanism for a specifier the alias convention cannot express.
  This conversion touched only files already staged for the `--trust` fix; no other
  `core/create-mono-stack` source file was changed, so the same latent gap remains for any other
  file in that package until it is next staged — a pre-existing condition, not a regression, and out
  of scope to sweep repo-wide here.
  well after the copy step this checklist changes; out of scope here and not investigated further.
