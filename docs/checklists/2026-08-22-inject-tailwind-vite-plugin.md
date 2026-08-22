# Inject Tailwind Vite Plugin Into Generated React Apps

- Checklist ID: CHECKLIST-20260822-inject-tailwind-vite-plugin
- Created: 2026-08-22
- Planning completed: 2026-08-22
- Type: Bug fix
- Source request: Verify that newly created React apps activate the Tailwind Vite plugin.
- Related checklist: [Add Vite Framework Reference Templates](./2026-08-17-add-vite-framework-reference-templates.md)
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Acceptance Criteria

- [x] A generated React TypeScript app has a root `vite.config.ts` that imports `@tailwindcss/vite`.
- [x] The root Vite plugin list invokes `tailwindcss()`.
- [x] Existing native Vite configuration remains intact apart from the required Tailwind activation.
- [x] The focused scaffold tests and package checks pass.

## Exact Test Cases

### TEST-TAILWIND-001: Generated React app activates Tailwind

- **Small task:** Preserve Tailwind activation in the generated React app root configuration.
- **Source:** The managed web profile package includes `@tailwindcss/vite` and its reference Vite config invokes `tailwindcss()`; generated app code runs from the native root.
- **Test place:** `core/create-mono-stack/test/native-scaffold.test.js`.
- **Starting state:** A Vite React TypeScript scaffold is created and the managed `vite/react-ts` profile is applied.
- **Exact input or fixture:** One `web-vite` app named `dashboard` using the existing native scaffold fixture.
- **Interaction steps:** Run `scaffoldNativeApps`, read `apps/dashboard/vite.config.ts`, and inspect its merged package manifest.
- **Main behavior:** The generated root Vite config activates Tailwind.
- **Expected result:** The config imports `@tailwindcss/vite`, invokes `tailwindcss()`, and the package includes `@tailwindcss/vite`.
- **Must change:** The generated web app's root Vite configuration.
- **Must not happen:** The native Vite plugin configuration or unrelated app files must not be removed.
- **Planned command:** `pnpm --filter create-mono-stack exec node --test test/native-scaffold.test.js --test-name-pattern='TEST-TAILWIND-001'`
- **Expected result before the code change:** The test fails because the generated root config remains the native config without Tailwind activation.
- **First observed run:** `pnpm --filter create-mono-stack exec node --test test/native-scaffold.test.js --test-name-pattern='TEST-TAILWIND-001'` failed: generated `vite.config.ts` was `native-vite` and had no Tailwind import or invocation; 9 unrelated tests passed.
- **Passing rerun:** Pending.

## Test-To-Task Map

| Small task                                | Test IDs            |
| ----------------------------------------- | ------------------- |
| Activate Tailwind in generated React apps | `TEST-TAILWIND-001` |

## Implementation Plan

- [x] Update `REFERENCE_PROFILES["vite/react-ts"]` to augment the generated app's root Vite config with the Tailwind plugin while preserving the profile's existing reference entries and native plugins.
- [x] Add the focused assertion for the generated root config and merged dependency; the pre-change run fails as expected.
- [x] Run the focused regression test, the package test suite, lint, and formatting validation.

## Risks And Non-Goals

- This change does not alter Next.js, Expo, React Native, or delegated Vite framework profiles.
- The managed Vite config may require the existing managed web dependencies; dependency merging remains responsible for adding them.

## Validation Notes

- Focused pre-change run failed as expected: generated Vite config lacked Tailwind activation.
- Focused post-change run passed all 10 selected tests, including `TEST-TAILWIND-001`.
- `pnpm --filter create-mono-stack test` passed 257 of 258 tests; `selects additional stack features through the multiselect screen` failed on the existing one-second Ink render timeout, unrelated to the scaffold changes.
- The rerun of `pnpm --filter create-mono-stack test` passed all 258 tests.
- `pnpm --filter create-mono-stack lint` passed.
- Prettier check passed for all changed files.
