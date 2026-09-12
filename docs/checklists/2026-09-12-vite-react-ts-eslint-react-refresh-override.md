# Fix generated vite/react-ts projects missing the react-refresh override for reference content

Checklist ID: 2026-09-12-vite-react-ts-eslint-react-refresh-override
Related checklists: [[2026-09-12-generator-app-rename-filter-fix]] (same generator, different bug
class — that one fixed hardcoded app-name references; this one fixes a missing lint-rule override)

## Change Tier

Tier: standard

## Context

A generated project (`jump-cloud=clone`, `apps/dashboard`, `vite/react-ts` profile) fails
`pnpm --filter dashboard lint` with `react-refresh/only-export-components` errors in
`reference/src/components/ui/button.tsx`, `reference/src/routes/form-demo.tsx`, and every
`reference/src/routes/**` file. These files are copied verbatim from
`core/create-mono-stack/reference-templates/managed/web/src` (the `vite/react-ts` profile's
`referenceEntries`) and intentionally export a non-component alongside a component
(`export { Button, buttonVariants }` in `button.tsx`; TanStack Router's `export const Route = ...`
convention in every route file) — a standard, accepted pattern for shadcn-style UI primitives and
file-based routing.

This template's own live `apps/web/eslint.config.js` already disables the rule for this exact
reason: `rules: { "react-refresh/only-export-components": "off" }`. But `apps/web` isn't a normal
generated app — it's this repo's own instantiated example, wired to extend the repo's shared root
`eslint.config.js`. A freshly generated project's `eslint.config.js` is produced entirely by the
native `pnpm create vite` scaffold (confirmed via `jump-cloud=clone/apps/dashboard/eslint.config.js`)
and never receives this override — `reference-profiles.js`'s `vite/react-ts` profile has no
`eslint.config.js` entry in its `referenceEntries` at all, so nothing patches it. `injectTailwindVitePlugin`
(`native-scaffold.js`, triggered by `profile.postProcess === "tailwind-vite"`) is the established
precedent for this exact kind of problem: a targeted, regex-based patch applied to a natively
generated config file after scaffolding. This fix adds a sibling patch of the same shape for
`eslint.config.js`, gated on the same `postProcess` flag (only the `vite/react-ts` profile sets it,
and it is the only profile that ships this `reference/` content).

## Implementation Contract

### Feature Boundaries

New function in `core/create-mono-stack/src/native-scaffold.js`, called alongside the existing
`injectTailwindVitePlugin` call wherever `profile.postProcess === "tailwind-vite"`. It patches only
the generated app's own `eslint.config.js`, is idempotent (no-op if the rule is already present), and
throws a clear error if the expected `languageOptions` block isn't found (matching
`injectTailwindVitePlugin`'s existing throw-on-unexpected-shape behavior, rather than silently doing
nothing). Does not touch any other profile (`next`, `expo`, `mobile`, delegated Vite profiles) — none
of them ship this `reference/` content or hit this rule.

### Route-Group Ownership

Not applicable — build-tooling configuration, not an HTTP route.

### User Journey

Generating a project with the `vite/react-ts` profile (the default `web-vite` selection), then
running `pnpm --filter` followed by the generated app's own name and `lint`, must pass with zero
errors against the shipped `reference/src` content — matching what `pnpm --filter web lint` already
does for this repo's own `apps/web`.

### Complete Test Matrix

| Test ID         | Path type | Small task                                                        | Trigger                                                                                                 | Expected result                                                                       | Status |
| --------------- | --------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------ |
| TEST-ESLINT-001 | happy     | Disable the rule in a freshly scaffolded vite/react-ts app        | scaffoldNativeApps with the vite/react-ts profile against the realistic native eslint.config.js fixture | Generated eslint.config.js contains `"react-refresh/only-export-components": "off"`   | Passed |
| TEST-ESLINT-002 | non-happy | Stay idempotent if the rule is already disabled                   | Run the patch function twice (or against fixture content that already contains the override)            | The override appears exactly once; content is otherwise unchanged on the second pass  | Passed |
| TEST-ESLINT-003 | non-happy | Fail loudly instead of silently on unexpected native output shape | Run the patch function against eslint.config.js content with no `languageOptions` block                 | Throws a descriptive error, matching `injectTailwindVitePlugin`'s existing convention | Passed |

### Unresolved Conflicts

None found.

## Acceptance Criteria

- [x] A new patch function in `native-scaffold.js`, invoked alongside `injectTailwindVitePlugin`,
      adds `rules: { "react-refresh/only-export-components": "off" }` to the generated
      `eslint.config.js`'s `**/*.{ts,tsx}` config object.
- [x] `core/create-mono-stack/test/native-scaffold.helpers.js`'s `reactTypeScriptNativeTree` fixture's
      `eslint.config.js` entry is realistic enough (matching real `pnpm create vite` output) for the
      new patch's regex to match, while keeping the existing `"native-eslint"` marker substring intact
      so `TEST-REFERENCE-008` in `native-scaffold-overlays.test.js` keeps passing unmodified —
      confirmed passing.
- [x] `pnpm --filter create-mono-stack test` passes in full (290/290), including the 3 new cases and
      every existing test that exercises the `vite/react-ts` profile.
- [x] `just check` passes.

## Exact Test Cases

### TEST-ESLINT-001

- Small task: Add the react-refresh rule override to a freshly scaffolded vite/react-ts app's
  generated `eslint.config.js`.
- Source: Observed `jump-cloud=clone/apps/dashboard/eslint.config.js` (real native output shape);
  `apps/web/eslint.config.js`'s existing `"react-refresh/only-export-components": "off"` override.
- Test place: `core/create-mono-stack/test/native-scaffold.test.js` (`node:test`, real temp-directory
  fixture via `createNativeScaffoldFixture`).
- Starting state: `reactTypeScriptNativeTree`'s realistic `eslint.config.js` fixture content (no rule
  override yet).
- Exact input or fixture: `scaffoldNativeApps({ appNames: { "web-vite": ["dashboard"] }, features: ["web-vite"] }, ...)`.
- Interaction steps: Run `scaffoldNativeApps`, then read `apps/dashboard/eslint.config.js` from the
  fixture's real temp directory.
- Main behavior: The patch locates the `**/*.{ts,tsx}` config object's `languageOptions` block and
  inserts a `rules` property after it.
- Expected result: The written file matches
  `/rules:\s*\{\s*"react-refresh\/only-export-components":\s*"off"\s*\}/`.
- Must change: Only `eslint.config.js`'s content (in the fixture's real temp directory).
- Must not happen: Any change to `vite.config.ts`'s own Tailwind injection behavior (still asserted
  by the existing `TEST-TAILWIND-001`).
- Planned command: `node --test core/create-mono-stack/test/native-scaffold.test.js`.
- Expected result before the code change: Fails — no such rule override is written yet.
- First observed run: Failed — file content was still the bare `"native-eslint"` placeholder, no
  `rules` block, as expected.
- Passing rerun: Passed.

### TEST-ESLINT-002

- Small task: Do not duplicate the override or otherwise corrupt the file if it is already present.
- Source: Same as TEST-ESLINT-001; mirrors `injectTailwindVitePlugin`'s own existing idempotence
  checks (`if (!config.includes(...))`).
- Test place: `core/create-mono-stack/test/native-scaffold.test.js`.
- Starting state: Fixture `eslint.config.js` content that already contains
  `"react-refresh/only-export-components": "off"`.
- Exact input or fixture: Same scaffold call as TEST-ESLINT-001, with the pre-patched fixture content.
- Interaction steps: Run `scaffoldNativeApps`, then read the resulting file.
- Main behavior: The patch function detects the existing override and returns without rewriting.
- Expected result: The string `"react-refresh/only-export-components"` appears exactly once in the
  output.
- Must change: Nothing.
- Must not happen: A duplicate `rules` block or a second occurrence of the override.
- Planned command: `node --test core/create-mono-stack/test/native-scaffold.test.js`.
- Expected result before the code change: Fails — the function does not exist yet to test.
- First observed run: Failed — occurrence count was `undefined` (0 occurrences, patch never applied),
  as expected.
- Passing rerun: Passed.

### TEST-ESLINT-003

- Small task: Throw a clear, descriptive error instead of silently no-op'ing when the native tool's
  output shape doesn't match what the patch expects.
- Source: `injectTailwindVitePlugin`'s existing `throw new Error(...)` convention for the same class
  of risk (native tool output format drift).
- Test place: `core/create-mono-stack/test/native-scaffold.test.js`.
- Starting state: Fixture `eslint.config.js` content with no `languageOptions` block at all.
- Exact input or fixture: Same scaffold call as TEST-ESLINT-001, with a malformed fixture.
- Interaction steps: Run `scaffoldNativeApps` and capture the rejection.
- Main behavior: The regex match fails, triggering the explicit throw path.
- Expected result: `scaffoldNativeApps` rejects with an error naming the file path and the missing
  block.
- Must change: Nothing (the write never happens).
- Must not happen: A silent success with the override missing.
- Planned command: `node --test core/create-mono-stack/test/native-scaffold.test.js`.
- Expected result before the code change: Fails — the function does not exist yet to test.
- First observed run: Failed — no rejection occurred at all (nothing patched or validated the shape
  yet), as expected.
- Passing rerun: Passed.
