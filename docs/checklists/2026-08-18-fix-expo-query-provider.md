# Task: Fix Expo query provider and form cycles

- Checklist ID: CHECKLIST-20260818-fix-expo-query-provider
- Created: 2026-08-18
- Planning completed: 2026-08-18
- Type: Bug fix
- Source request: Fix the Expo reference runtime error and warnings shown by `expo:dev:reference`.
- Related checklists:
  - `docs/checklists/2026-08-18-native-demo-parity.md`
- Affected paths: `apps/expo`, `apps/mobile`, `packages/query-client`, `core/create-mono-stack/reference-templates`
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Plan

- [x] Reproduce and trace the missing query context to duplicate TanStack Query module instances.
- [x] Trace form warning cycles to field components importing contexts through `form-core`.
- [x] Use the exact `@repo/query-client/example` provider entry in Expo, bare RN, and Next apps so it matches the native todo hooks.
- [x] Move form contexts to a dependency-neutral module and remove native form cycles.
- [x] Enforce absolute `@/*` imports in Expo, bare RN, and Next implementation files.
- [x] Verify native typechecks, package build, and static cycle scans.

## Acceptance Criteria

- [x] Expo web export bundles the matching provider and todo-hook entry without build errors; generated-app runtime requires a dependency rebuild and Metro cache reset.
- [x] Expo, bare RN, and Next providers use the same TanStack Query module instance as shared hooks.
- [x] Expo, bare RN, and Next form modules have no circular imports.
- [x] Shared query-client package builds and native apps typecheck.
- [x] Local implementation imports use `@/*` aliases with no relative-import scan matches.

## Test Cases

### TEST-EXPO-001: Native query hooks receive the provider context

- **Small task:** Use the shared query package's provider exports in native providers.
- **Source:** Expo runtime error `No QueryClient set, use QueryClientProvider to set one`.
- **Test place:** Expo and mobile provider modules plus package build.
- **Starting state:** Native providers import `QueryClientProvider` directly while shared hooks import it through the workspace package.
- **Exact input or fixture:** Render the reference todo route with its existing `Providers` wrapper.
- **Interaction steps:** Start the Expo reference development command and open the Todos route.
- **Main behavior:** Query hooks access the configured client.
- **Expected result:** The Todos screen renders without a missing-provider error.
- **Must change:** Provider and shared package export boundaries.
- **Must not happen:** Do not duplicate query clients or rewrite the todo hooks.
- **Planned command:** `pnpm --filter @repo/query-client build && pnpm --filter expo typecheck && pnpm --filter mobile typecheck`
- **Expected result before the code change:** Typechecks pass, but runtime still reports the missing provider due to duplicate module instances.
- **First observed run:** Expo runtime reported `No QueryClient set`; module resolution showed separate React Query instances for Expo and the shared package.
- **Passing rerun:** Shared query-client build, Expo web export, and Expo/mobile/Next typechecks passed; the generated Expo app loaded on the Android emulator after rebuilding and clearing Metro.

### TEST-EXPO-002: Native form imports contain no cycles

- **Small task:** Remove form context cycles from both native apps.
- **Source:** Expo warnings naming `field-wrapper.tsx`, `form-core.ts`, and field components.
- **Test place:** Native form source import scan.
- **Starting state:** `form-core` imports field components, while field wrappers and submit buttons import contexts from `form-core`.
- **Exact input or fixture:** Expo and mobile `components/forms` trees.
- **Interaction steps:** Scan native form implementation imports after refactoring.
- **Main behavior:** Form module dependencies flow from context to components without returning through `form-core`.
- **Expected result:** No circular import paths are reported.
- **Must change:** Extract shared form contexts into a separate module in each native app.
- **Must not happen:** Do not change field validation or rendered controls.
- **Planned command:** `pnpm --filter expo typecheck && pnpm --filter mobile typecheck`
- **Expected result before the code change:** Typechecks pass but runtime reports circular import warnings.
- **First observed run:** Expo reported six form require-cycle warnings.
- **Passing rerun:** Expo and mobile typechecks passed, and exact relative-import scans returned no matches.

## Implementation

- [x] Export `QueryClient` and `QueryClientProvider` from `@repo/query-client`.
- [x] Import those exports in Expo, bare RN, and Next providers.
- [x] Add standalone form context modules and update form imports in all three apps.
- [x] Convert local implementation imports to `@/*` aliases.
- [x] Keep generator reference templates synchronized with canonical native source.

## Validation Notes

- The canonical template package build, Expo/mobile/Next typechecks, formatting, and diff checks passed.
- The full `create-mono-stack` suite had one transient Ink timing failure in `interactive-wizard.test.js`; native overlay tests passed. Earlier isolated wizard reruns passed.

## Risks

- The query provider export adds a small public package surface but preserves the existing hook and peer dependency boundary.
- Native source and generator templates must remain byte-for-byte aligned where overlays copy them.
