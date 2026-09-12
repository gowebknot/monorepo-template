# Fix eslint.config.js react-refresh patch throwing on current create-vite output

Checklist ID: 2026-09-12-vite-eslint-language-options-trailing-comma-fix
Related checklists: [[2026-09-12-vite-react-ts-eslint-react-refresh-override]] (original
implementation this checklist corrects — see its `## Updates` section for the cross-link)

## Change Tier

Tier: standard

## Context

Running the real `create-mono-stack` wizard (`React` -> `TypeScript + React Compiler` -> `ESLint`)
against a current `create-vite` install throws:

```
Vite ESLint config has no languageOptions block to extend: <target>/eslint.config.js
```

`disableReferenceReactRefreshRule` (`core/create-mono-stack/src/native-scaffold.js:135-156`) matches
the generated `eslint.config.js`'s `languageOptions` block with
`/languageOptions:\s*\{\s*globals:\s*globals\.browser\s*\}/` and throws when it does not match. The
current `create-vite` package (confirmed by unpacking `create-vite@9.2.1` from the npm registry and
reading `dist/index.js`'s embedded eslint template, function `At`) now writes:

```js
    languageOptions: {
      globals: globals.browser,
    },
```

— a trailing comma after `globals.browser` inside the object literal. The existing regex has no `,?`
before the closing `}`, so it no longer matches real output and the scaffold throws instead of
patching. The `TEST-ESLINT-*` suite in `core/create-mono-stack/test/native-scaffold.test.js` still
passes today only because `reactTypeScriptNativeTree`'s `eslint.config.js` fixture
(`core/create-mono-stack/test/native-scaffold.helpers.js:68-89`) was written without that trailing
comma — the fixture drifted from the real tool output it is supposed to model. This is the same
"native tool output format drift" risk class the original checklist's Context section called out, now
realized by an upstream `create-vite` release.

## Implementation Contract

### Feature Boundaries

Two changes, both scoped to `core/create-mono-stack`:

1. `disableReferenceReactRefreshRule`'s `languageOptionsPattern` in `src/native-scaffold.js` gains an
   optional trailing comma (`,?`) before the closing `}`, so it matches both the pre-comma and
   post-comma `create-vite` output shapes. No other behavior of the function changes (still idempotent,
   still throws with the same message when no `languageOptions` block exists at all).
2. `test/native-scaffold.helpers.js`'s `reactTypeScriptNativeTree.eslint.config.js` fixture is updated
   to include the trailing comma, matching real `create-vite@9.2.1` output, so the test suite would
   have caught this regression. `test/native-scaffold.test.js`'s `TEST-ESLINT-002` fixture-mutation
   string is updated to match the new fixture text it patches. A new `TEST-ESLINT-004` case locks in
   that the older (no-trailing-comma) shape still matches too, so the fix is additive, not a shape
   swap.

Does not touch `injectTailwindVitePlugin`, any other profile's post-processing, or any other part of
the eslint patch's insertion logic (the `rules` block content and placement are unchanged).

### Route-Group Ownership

Not applicable — build-tooling configuration, not an HTTP route.

### User Journey

Generating a project with the `vite/react-ts` profile against a current `create-vite` install must
scaffold successfully (no throw) and produce an `eslint.config.js` with
`"react-refresh/only-export-components": "off"` present, regardless of whether the installed
`create-vite` version emits a trailing comma inside `languageOptions` or not.

### Complete Test Matrix

| Test ID         | Path type | Small task                                                                | Trigger                                                                                          | Expected result                                                                       | Status |
| --------------- | --------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- | ------ |
| TEST-ESLINT-001 | happy     | Re-validate the happy path against the corrected (trailing-comma) fixture | `scaffoldNativeApps` against the updated `reactTypeScriptNativeTree` fixture                     | Generated `eslint.config.js` contains `"react-refresh/only-export-components": "off"` | Passed |
| TEST-ESLINT-002 | non-happy | Stay idempotent against the corrected (trailing-comma) fixture            | Run the patch against fixture content, pre-patched, that already contains the override           | The override appears exactly once; content otherwise unchanged                        | Passed |
| TEST-ESLINT-003 | non-happy | Unaffected — still fails loudly with no `languageOptions` block at all    | `scaffoldNativeApps` against fixture content with no `languageOptions` block                     | Throws a descriptive error naming the file path                                       | Passed |
| TEST-ESLINT-004 | happy     | Also match the older (no-trailing-comma) `languageOptions` shape          | `scaffoldNativeApps` against fixture content using the pre-fix (no-comma) `languageOptions` text | Generated `eslint.config.js` contains `"react-refresh/only-export-components": "off"` | Passed |

### Unresolved Conflicts

None found.

## Acceptance Criteria

- [x] `languageOptionsPattern` in `src/native-scaffold.js` matches
      `languageOptions: { globals: globals.browser }` with or without a trailing comma before the
      closing brace.
- [x] `reactTypeScriptNativeTree`'s `eslint.config.js` fixture matches real `create-vite@9.2.1` output
      (trailing comma present) so the suite exercises the shape that broke in the field.
- [x] `TEST-ESLINT-002`'s fixture-mutation string matches the updated fixture text.
- [x] New `TEST-ESLINT-004` proves the older (no-trailing-comma) shape still matches.
- [x] `pnpm --filter create-mono-stack test` passes in full (291/291), including the updated and new
      cases.
- [x] `just check` passes.

## Exact Test Cases

### TEST-ESLINT-001 (re-validated)

- Small task: Insert the react-refresh override into a freshly scaffolded vite/react-ts app's
  generated `eslint.config.js`, using a fixture that matches current real `create-vite` output.
- Source: `create-vite@9.2.1`'s `dist/index.js` embedded eslint template (function `At`), unpacked
  and read directly from the npm registry tarball.
- Test place: `core/create-mono-stack/test/native-scaffold.test.js` (`node:test`, real temp-directory
  fixture via `createNativeScaffoldFixture`).
- Starting state: `reactTypeScriptNativeTree`'s updated `eslint.config.js` fixture content (trailing
  comma inside `languageOptions`, no rule override yet).
- Exact input or fixture: `scaffoldNativeApps({ appNames: { "web-vite": ["dashboard"] }, features: ["web-vite"] }, ...)`.
- Interaction steps: Run `scaffoldNativeApps`, then read `apps/dashboard/eslint.config.js` from the
  fixture's real temp directory.
- Main behavior: The patch locates the `**/*.{ts,tsx}` config object's `languageOptions` block
  (trailing-comma shape) and inserts a `rules` property after it.
- Expected result: The written file matches
  `/rules:\s*\{\s*"react-refresh\/only-export-components":\s*"off"\s*\}/`.
- Must change: Only `eslint.config.js`'s content.
- Must not happen: A thrown error; any change to `vite.config.ts`'s Tailwind injection.
- Planned command: `node --test core/create-mono-stack/test/native-scaffold.test.js`.
- Expected result before the code change: Fails — the trailing-comma fixture does not match the old
  regex, so `scaffoldNativeApps` rejects instead of writing the override.
- First observed run: Failed, as expected —
  `Error: Vite ESLint config has no languageOptions block to extend: <tmp>/vite-dashboard/eslint.config.js`
  thrown from `native-scaffold.js:144`.
- Passing rerun: Pending.

### TEST-ESLINT-002 (re-validated)

- Small task: Do not duplicate the override when it is already present, using the trailing-comma
  fixture shape.
- Source: Same as TEST-ESLINT-001.
- Test place: `core/create-mono-stack/test/native-scaffold.test.js`.
- Starting state: Fixture `eslint.config.js` content (trailing-comma shape) that already contains
  `"react-refresh/only-export-components": "off"`.
- Exact input or fixture: Same scaffold call as TEST-ESLINT-001, with the pre-patched fixture content
  produced by the updated `.replace(...)` string matching the new fixture text.
- Interaction steps: Run `scaffoldNativeApps`, then read the resulting file.
- Main behavior: The patch function detects the existing override and returns without rewriting.
- Expected result: The string `"react-refresh/only-export-components"` appears exactly once in the
  output.
- Must change: Nothing.
- Must not happen: A duplicate `rules` block; a thrown error.
- Planned command: `node --test core/create-mono-stack/test/native-scaffold.test.js`.
- Expected result before the code change: Predicted to fail (see correction below).
- First observed run: Passed, correcting the plan's prediction — `disableReferenceReactRefreshRule`
  short-circuits on `if (config.includes("react-refresh/only-export-components")) return;` before it
  ever reaches `languageOptionsPattern`, so a fixture that already contains the override never
  exercises the broken regex and this case was never actually coupled to the trailing-comma bug. The
  `.replace(...)` `oldString` update was still correct and necessary (it must match the updated fixture
  text to apply the pre-patch at all), but the regex bug could not have failed this specific case
  either before or after the fix.
- Passing rerun: Passed (unchanged by the source fix, as explained above).

### TEST-ESLINT-003 (unchanged, re-run for confidence)

- Small task: Keep throwing loudly when there is no `languageOptions` block at all.
- Source: Original checklist's TEST-ESLINT-003; unaffected by this fix.
- Test place: `core/create-mono-stack/test/native-scaffold.test.js`.
- Starting state: Fixture `eslint.config.js` content with no `languageOptions` block.
- Exact input or fixture: Same scaffold call as TEST-ESLINT-001, with the malformed fixture.
- Interaction steps: Run `scaffoldNativeApps` and capture the rejection.
- Main behavior: The regex match fails, triggering the explicit throw path.
- Expected result: `scaffoldNativeApps` rejects with an error naming the file path and the missing
  block.
- Must change: Nothing (the write never happens).
- Must not happen: A silent success with the override missing.
- Planned command: `node --test core/create-mono-stack/test/native-scaffold.test.js`.
- Expected result before the code change: Passes already (unaffected by this fix); re-run to confirm
  no regression.
- First observed run: Passed, as expected.
- Passing rerun: Passed.

### TEST-ESLINT-004 (new)

- Small task: Continue matching the older `create-vite` shape (no trailing comma inside
  `languageOptions`) so the fix is additive across tool versions, not a shape swap.
- Source: The pre-fix `reactTypeScriptNativeTree` fixture text (the shape observed and recorded by the
  original checklist before this `create-vite` release added the trailing comma).
- Test place: `core/create-mono-stack/test/native-scaffold.test.js`.
- Starting state: Fixture `eslint.config.js` content built from `reactTypeScriptNativeTree` with the
  trailing comma removed from `languageOptions` (the no-comma shape), no rule override yet.
- Exact input or fixture: Same scaffold call as TEST-ESLINT-001, with the no-comma fixture variant.
- Interaction steps: Run `scaffoldNativeApps`, then read `apps/dashboard/eslint.config.js`.
- Main behavior: The updated regex's `,?` is optional, so it still matches the no-comma shape.
- Expected result: The written file matches
  `/rules:\s*\{\s*"react-refresh\/only-export-components":\s*"off"\s*\}/`.
- Must change: Only `eslint.config.js`'s content.
- Must not happen: A thrown error.
- Planned command: `node --test core/create-mono-stack/test/native-scaffold.test.js`.
- Expected result before the code change: Passes already under the old regex (this case documents and
  locks in behavior that must survive the fix, run once implemented to confirm no regression).
- First observed run: Passed, as expected — confirms the no-comma shape was never the problem; the fix
  must remain additive.
- Passing rerun: Passed.
