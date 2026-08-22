# Shared Web UI Package

- Checklist ID: CHECKLIST-20260822-shared-web-ui-package
- Created: 2026-08-22
- Planning completed: 2026-08-22
- Type: Feature implementation
- Source request: Create a shared shadcn-based web UI package whose Tailwind styling can be consumed by web applications.
- Affected areas: `packages/ui`, `apps/web`, `apps/next`
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial
- Related checklist: `docs/checklists/2026-08-20-project-app-package-management.md`

## Implementation Description

- Create `@repo/ui` using the repository package pattern.
- Move the shared shadcn component source and `cn` helper into the package.
- Export a shared Tailwind v4/shadcn stylesheet through the package exports map.
- Configure both web consumers to import the stylesheet and scan the package for utility classes.
- Remove the duplicated web and Next UI component implementations after consumers compile against the package.

## Acceptance Criteria

- [x] `@repo/ui` builds, typechecks, and lints as an ESM React library.
- [x] The package exports the shared UI components from its root entrypoint.
- [x] The package exports a stylesheet that contains the shared theme tokens and shadcn base styling.
- [x] `apps/web` imports shared components and stylesheet from `@repo/ui` and builds successfully.
- [x] `apps/next` imports shared components and stylesheet from `@repo/ui` and builds successfully.
- [x] Tailwind v4 scans `@repo/ui` in both consumers so component utility classes are generated.
- [x] Existing native apps and unrelated package-management behavior remain unchanged.

## Exact Test Cases

### TEST-UI-001: Shared package public build

- **Small task:** Create the package with the repository library build contract.
- **Source:** Repository package pattern in `packages/entities` and the user request for a shared package.
- **Test place:** Package build, typecheck, and lint commands.
- **Starting state:** No `packages/ui` package exists.
- **Exact input or fixture:** React 19 shadcn component source and package exports for `.` and `./styles.css`.
- **Interaction steps:** Build, typecheck, and lint `@repo/ui`.
- **Main behavior:** The package emits JavaScript, declarations, and its stylesheet-facing public contract without unresolved aliases.
- **Expected result:** All three package commands exit successfully and `dist/index.js` plus `dist/index.d.ts` exist.
- **Must change:** `packages/ui` package files and generated build output.
- **Must not happen:** React, primitives, or styling runtime dependencies must not be bundled as duplicate application copies.
- **Planned command:** `pnpm --filter @repo/ui build && pnpm --filter @repo/ui typecheck && pnpm --filter @repo/ui lint`
- **Expected result before the code change:** The package does not exist, so the filter command cannot run.
- **First observed run:** The package filter failed because `packages/ui` did not exist before implementation.
- **Passing rerun:** `pnpm --filter @repo/ui build`, `typecheck`, and `lint` passed after adding JSX configuration, peer dependencies, and the shared source.

### TEST-UI-002: Shared stylesheet contract

- **Small task:** Export shared Tailwind v4 and shadcn theme styling.
- **Source:** Existing duplicated `apps/web/src/index.css` and `apps/next/src/app/globals.css` theme definitions.
- **Test place:** Package export inspection and consumer CSS build.
- **Starting state:** Theme variables and base rules are duplicated in both applications.
- **Exact input or fixture:** `@import "@repo/ui/styles.css"` from each web app global stylesheet.
- **Interaction steps:** Resolve the package stylesheet through the exports map and build each consumer.
- **Main behavior:** Consumers can load shared tokens/base styling through the public CSS subpath.
- **Expected result:** The stylesheet resolves without a package export error, and both web builds process the shared CSS.
- **Must change:** `packages/ui/package.json`, shared stylesheet, and both app global CSS files.
- **Must not happen:** Consumers must not import private package source paths or depend on a package-local Tailwind config.
- **Planned command:** `pnpm --filter web build && pnpm --filter next build`
- **Expected result before the code change:** The stylesheet subpath and package imports do not exist.
- **First observed run:** Both consumers initially used local CSS and had no `@repo/ui/styles.css` export.
- **Passing rerun:** `pnpm --filter web build` and `pnpm --filter next build` passed after importing the shared stylesheet and adding Tailwind `@source` directives.

### TEST-UI-003: Web consumer migration

- **Small task:** Replace the Vite app's local shadcn imports with `@repo/ui` imports.
- **Source:** Existing `apps/web/src/components/ui` usage and frontend package conventions.
- **Test place:** `apps/web` typecheck, lint, and build.
- **Starting state:** The Vite app imports local UI files and local `cn` utility.
- **Exact input or fixture:** Existing todos UI behavior using Button, Card, Field, Input, Select, Table, and related components.
- **Interaction steps:** Compile and bundle the Vite app after switching imports to `@repo/ui`.
- **Main behavior:** Existing web routes compile and retain their shared component APIs and styles.
- **Expected result:** `apps/web` typecheck, lint, and build pass with no local UI source dependency.
- **Must change:** Web imports, global stylesheet, and local duplicate component removal.
- **Must not happen:** Route behavior, API/query boundaries, or app-specific fonts must not change.
- **Planned command:** `pnpm --filter web typecheck && pnpm --filter web lint && pnpm --filter web build`
- **Expected result before the code change:** The app still builds from its local components; the new package imports are unavailable.
- **First observed run:** The existing web lint/build passed before migration; the app has no dedicated `typecheck` script.
- **Passing rerun:** `pnpm --filter web lint && pnpm --filter web build` passed after replacing implementations with package re-export shims.

### TEST-UI-004: Next consumer migration

- **Small task:** Replace the Next app's local shadcn imports with `@repo/ui` imports.
- **Source:** Existing `apps/next/src/components/ui` usage and Next App Router conventions.
- **Test place:** `apps/next` typecheck, lint, and build.
- **Starting state:** The Next app imports local UI files and local `cn` utility.
- **Exact input or fixture:** Existing Next todos UI behavior using the same shared component API.
- **Interaction steps:** Compile and bundle the Next app after switching imports to `@repo/ui`.
- **Main behavior:** Existing Next routes compile and retain client-component boundaries and styles.
- **Expected result:** `apps/next` typecheck, lint, and build pass with no local UI source dependency.
- **Must change:** Next imports, global stylesheet, and local duplicate component removal.
- **Must not happen:** App Router server/client boundaries, route behavior, API/query boundaries, or app-specific fonts must not change.
- **Planned command:** `pnpm --filter next typecheck && pnpm --filter next lint && pnpm --filter next build`
- **Expected result before the code change:** The app still builds from its local components; the new package imports are unavailable.
- **First observed run:** `pnpm --filter next typecheck && pnpm --filter next lint && pnpm --filter next build` passed before migration.
- **Passing rerun:** The same command passed after preserving per-component client boundaries; server pages now call shared `cn` and `buttonVariants` directly, and only the existing TanStack Table React Compiler warning remains.

### TEST-UI-007: Server-safe utility export

- **Small task:** Allow a Next Server Component to call `cn` and `buttonVariants` from the shared package.
- **Source:** User requirement that variants and `cn` are CSS/string-only and should not require a client boundary.
- **Test place:** Next Server Component build and prerender.
- **Starting state:** The package root is marked `use client`, so all root exports are treated as client exports.
- **Exact input or fixture:** `apps/next/src/app/page.tsx` imports `cn` and `buttonVariants` from `@repo/ui` and invokes them while rendering links.
- **Interaction steps:** Build and prerender the Next application.
- **Main behavior:** Server-safe styling utilities execute on the server while interactive UI components remain client-bound.
- **Expected result:** Next build and prerender complete without the client-function invocation error.
- **Must change:** Package module boundaries and build output; the server page may use shared utility exports directly.
- **Must not happen:** `cn` or `buttonVariants` must not require React hooks, browser APIs, or a client component boundary.
- **Planned command:** `pnpm --filter next build`
- **Expected result before the code change:** The existing root client boundary rejects direct server invocation of these utilities.
- **First observed run:** The existing Next build passed only because server pages used local utilities and rendered `Button` components; direct root utility usage was not covered.
- **Passing rerun:** `pnpm --filter next build` passed after the root client directive was removed, component modules retained their own client directives, and the package build preserved module boundaries.

### TEST-UI-008: All variant factories remain server-safe

- **Small task:** Keep field and input-group variant factories out of client-only component modules.
- **Source:** Audit of all `cva` factories in `packages/ui/src`.
- **Test place:** Package build and Next Server Component prerender.
- **Starting state:** `fieldVariants`, `inputGroupAddonVariants`, and `inputGroupButtonVariants` are defined inside client component files.
- **Exact input or fixture:** Server-safe imports from `@repo/ui` for all four variant factories.
- **Interaction steps:** Build the package and Next application after extracting the factories into `src/lib/*-variants.ts`.
- **Main behavior:** Every styling-only variant factory can be imported without requiring a client boundary.
- **Expected result:** Package and Next builds pass, with no server/client boundary error.
- **Must change:** Variant module placement and component imports.
- **Must not happen:** No `cva` factory should depend on React hooks or browser APIs.
- **Planned command:** `pnpm --filter @repo/ui build && pnpm --filter next build`
- **Expected result before the code change:** The field and input-group factories are coupled to client component modules.
- **First observed run:** The audit found three additional factories in `field.tsx` and `input-group.tsx`.
- **Passing rerun:** Package build and Next prerender passed after extracting all three factories into server-safe library modules.

## Test-To-Task Map

| Small task                        | Test IDs                                                             |
| --------------------------------- | -------------------------------------------------------------------- |
| Create the shared library package | `TEST-UI-001`                                                        |
| Export shared styling             | `TEST-UI-002`                                                        |
| Migrate the Vite web app          | `TEST-UI-003`                                                        |
| Migrate the Next app              | `TEST-UI-004`                                                        |
| Preserve server-safe styling APIs | `TEST-UI-007`                                                        |
| Extract all variant factories     | `TEST-UI-008`                                                        |
| API contract validation           | Not applicable; no API boundary changes                              |
| Security testing                  | Not applicable; no security boundary or external integration changes |

## Implementation Plan

- [x] Run the focused baseline commands listed in `TEST-UI-001` through `TEST-UI-004` where meaningful and record their observed results.
- [x] Scaffold `packages/ui` with `pnpm package:create ui`.
- [x] Copy the existing web shadcn component source into `packages/ui/src/components/ui` and move `cn` into `packages/ui/src/lib/utils.ts`.
- [x] Add package-level React/types, Base UI, icon, class utility, and Tailwind-related dependency declarations with runtime externals configured in Vite.
- [x] Add `styles.css` with shared Tailwind imports, shadcn imports, theme tokens, dark variant, and component base rules; export it from `package.json`.
- [x] Update the package barrel and Vite entry/build configuration to emit the single public index and declarations.
- [x] Update `apps/web` imports and CSS source scanning, then replace its duplicated UI files with package re-export shims.
- [x] Update `apps/next` imports and CSS source scanning, then replace its duplicated UI files with package re-export shims.
- [x] Remove the root client directive, preserve component client boundaries in the built package, and verify server-side `cn` and `buttonVariants` calls.
- [x] Extract `fieldVariants`, `inputGroupAddonVariants`, and `inputGroupButtonVariants` into absolute-imported server-safe modules and re-export them from the root index.
- [x] Run each focused validation, record failures before fixes, and record passing reruns in the matching test cases.
- [x] Run final formatting, package, and app checks.

## Risks And Non-Goals

- The package does not make Tailwind configuration automatically inherit across arbitrary consumers; each consumer still owns its Tailwind plugin and `@source` directive.
- App-specific fonts and document-level rules remain in each consumer.
- Native apps do not consume this DOM/shadcn package.
- Template propagation and generated-project package ownership are intentionally out of scope.
