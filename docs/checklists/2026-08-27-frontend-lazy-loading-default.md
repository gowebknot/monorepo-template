# Frontend Lazy Loading Default

- Checklist ID: CHECKLIST-20260827-frontend-lazy-loading-default
- Created: 2026-08-27
- Type: Portable-skill maintenance
- Source request: Make frontend lazy loading the default and document only justified normal-import exceptions.
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Acceptance Criteria

- The frontend skill makes lazy loading the default for code-splitting decisions.
- The React skill documents stable lazy declarations, `Suspense`, error boundaries, and bundler-analyzable dynamic imports.
- The app-structure skill directs route and feature boundaries toward lazy loading while preserving critical app-shell imports.
- The guidance covers web and native platform differences without requiring ineffective lazy loading.
- Normal imports are limited to runtime, bootstrap, critical shell, tiny ubiquitous primitives, global side effects, type-only imports, and unsupported chunking cases.
- All four skill roots remain byte-for-byte synchronized.

## Small Task and Test Map

| Small task or rule                                         | Test IDs      |
| ---------------------------------------------------------- | ------------- |
| Make lazy loading the default                              | TEST-LAZY-001 |
| Document route and feature boundaries                      | TEST-LAZY-002 |
| Document heavy and optional UI boundaries                  | TEST-LAZY-003 |
| Define justified normal-import exceptions                  | TEST-LAZY-004 |
| Define React loading and failure behavior                  | TEST-LAZY-005 |
| Define platform and bundler limits                         | TEST-LAZY-006 |
| Synchronize all skill roots and preserve portable metadata | TEST-LAZY-007 |

## Exact Test Cases

### TEST-LAZY-001: Lazy loading is the default

- **Small task:** Make lazy loading the default frontend import policy.
- **Source:** User request for lazy loading to be the default.
- **Test place:** Exact text scan of `frontend-standards` in all four skill roots.
- **Starting state:** No lazy-loading policy exists.
- **Exact input or fixture:** The four synchronized `frontend-standards/SKILL.md` files.
- **Interaction steps:** Search for the default policy and verify it requires a reason for normal imports.
- **Main behavior:** Agents choose lazy loading unless an explicit exception applies.
- **Expected result:** All four copies state that lazy loading is the default and normal imports require justification.
- **Must change:** The canonical frontend skill and synchronized copies.
- **Must not happen:** Lazy loading is presented as an optional optimization only.
- **Planned command:** `git grep -n -E 'lazy loading|lazy by default|normal import' -- skills/frontend-standards .agents/skills/frontend-standards .claude/skills/frontend-standards .opencode/skills/frontend-standards`
- **Expected result before the code change:** No default lazy-loading policy is found.
- **First observed run:** The scan returned no lazy-loading or normal-import policy in any frontend copy.
- **Passing rerun:** The scan found the default lazy-loading policy and explicit normal-import justification in all four frontend copies.

### TEST-LAZY-002: Route and feature boundaries

- **Small task:** Direct route and feature modules toward lazy loading.
- **Source:** Frontend architecture and route composition guidance.
- **Test place:** Exact text scan of the frontend and app-structure skills.
- **Starting state:** Routes and features have no code-splitting requirement.
- **Exact input or fixture:** Route modules, feature entry points, and rarely visited sections.
- **Interaction steps:** Search for route-level and feature-level lazy-loading guidance.
- **Main behavior:** Navigation boundaries defer code that is not needed for the initial screen.
- **Expected result:** Routes, large feature areas, and rarely visited sections are named as preferred lazy boundaries.
- **Must change:** The canonical frontend and app-structure skills and synchronized copies.
- **Must not happen:** Critical app bootstrap and shell code is required to load lazily.
- **Planned command:** `git grep -n -E 'route|feature|lazy boundary|code-splitting' -- skills/frontend-standards skills/domain-driven-app-structure`
- **Expected result before the code change:** No matching lazy-boundary policy is found.
- **First observed run:** The scan found route and feature terminology but no lazy-boundary or code-splitting policy.
- **Passing rerun:** The scan found lazy route and feature-boundary guidance in the synchronized frontend and app-structure skills.

### TEST-LAZY-003: Heavy and optional UI boundaries

- **Small task:** Identify heavy and optional UI as lazy-load candidates.
- **Source:** User request to lazy load everything practical.
- **Test place:** Exact text scan of the frontend skill.
- **Starting state:** Heavy widgets and optional UI have no documented loading strategy.
- **Exact input or fixture:** Modals, drawers, editors, charts, maps, data grids, and client-only integrations.
- **Interaction steps:** Search for each category and verify it is described as a lazy candidate.
- **Main behavior:** Expensive or infrequently used code is excluded from the initial bundle.
- **Expected result:** The named categories are documented as preferred lazy-load candidates.
- **Must change:** The canonical frontend skill and synchronized copies.
- **Must not happen:** Every tiny leaf component is split regardless of network overhead.
- **Planned command:** `git grep -n -E 'modal|drawer|editor|chart|map|data grid|client-only' -- skills/frontend-standards`
- **Expected result before the code change:** The named categories are absent from frontend lazy-loading guidance.
- **First observed run:** The scan found none of the named heavy or optional UI categories in frontend lazy-loading guidance.
- **Passing rerun:** The scan found modal, drawer, editor, chart, map, data-grid, and client-only lazy-load candidates in the synchronized frontend skills.

### TEST-LAZY-004: Justified normal imports

- **Small task:** Define the narrow cases where normal imports remain correct.
- **Source:** User exception for imports that do not make sense to lazy load.
- **Test place:** Exact text scan of the frontend skill.
- **Starting state:** No documented exception list exists.
- **Exact input or fixture:** Runtime, bootstrap, providers, router setup, critical shell, tiny primitives, global styles, initialization side effects, type-only imports, and platforms without useful chunking.
- **Interaction steps:** Search for each exception category and verify the guidance says not to lazy load it.
- **Main behavior:** Necessary startup code remains available without creating ineffective chunks.
- **Expected result:** The exception list is explicit and bounded.
- **Must change:** The canonical frontend skill and synchronized copies.
- **Must not happen:** “It is convenient” or unmeasured familiarity is treated as sufficient justification.
- **Planned command:** `git grep -n -E 'runtime|bootstrap|provider|critical shell|global styles|type-only|chunk' -- skills/frontend-standards`
- **Expected result before the code change:** The bounded exception list is absent.
- **First observed run:** The scan found no bounded normal-import exception list.
- **Passing rerun:** The scan found the bounded runtime, bootstrap, provider, shell, global-style, type-only, and bundler exception guidance.

### TEST-LAZY-005: React loading and failure behavior

- **Small task:** Document safe React lazy-loading patterns.
- **Source:** React 19 skill and frontend UX requirements.
- **Test place:** Exact text scan of the React skill.
- **Starting state:** React lazy loading, loading states, and chunk failures are not documented.
- **Exact input or fixture:** `React.lazy`, dynamic `import()`, `Suspense`, error boundaries, stable module scope declarations, and retry behavior.
- **Interaction steps:** Search for each required pattern and verify loading and failure behavior are required.
- **Main behavior:** Lazy-loaded UI fails gracefully and does not recreate lazy component identities during render.
- **Expected result:** The React skill requires stable lazy declarations, bundler-analyzable imports, meaningful fallbacks, and error recovery.
- **Must change:** The canonical React skill and synchronized copies.
- **Must not happen:** Lazy components are declared inside render functions or failures are left unhandled.
- **Planned command:** `git grep -n -E 'React.lazy|dynamic import|Suspense|error boundary|render' -- skills/react-19`
- **Expected result before the code change:** The required lazy-loading patterns are absent.
- **First observed run:** The scan found no `React.lazy`, `Suspense`, dynamic-import, or error-boundary guidance in the React skill.
- **Passing rerun:** The scan found stable lazy declarations, dynamic imports, `Suspense`, error boundaries, and render-safety guidance in all synchronized React skills.

### TEST-LAZY-006: Platform and bundler limits

- **Small task:** Distinguish useful web chunking from native bundler limitations.
- **Source:** Repository frontend skill applies to web and mobile targets.
- **Test place:** Exact text scan of frontend and app-structure skills.
- **Starting state:** Guidance does not distinguish web and native runtime chunking.
- **Exact input or fixture:** Web route chunks, Expo/React Native bundles, and platform-specific dynamic import support.
- **Interaction steps:** Search for web/native platform guidance and verify ineffective chunking is an exception.
- **Main behavior:** Agents apply lazy loading where it produces real deferred work rather than blindly everywhere.
- **Expected result:** Web code splitting is preferred where supported; native code is lazy only when the target bundler provides useful behavior.
- **Must change:** The canonical frontend and app-structure skills and synchronized copies.
- **Must not happen:** Native projects are promised browser-style runtime chunks without verification.
- **Planned command:** `git grep -n -E 'web|native|Expo|React Native|bundler|chunk' -- skills/frontend-standards skills/domain-driven-app-structure`
- **Expected result before the code change:** No platform-specific lazy-loading policy is found.
- **First observed run:** The scan found no platform-specific lazy-loading policy; existing route-loading references were architectural only.
- **Passing rerun:** The scan found explicit web/native, Expo/React Native, bundler, and useful-chunk guidance in the synchronized frontend and app-structure skills.

### TEST-LAZY-007: Synchronization and metadata

- **Small task:** Keep the modified portable skills valid and synchronized.
- **Source:** Portable-skill standard and repository synchronization rules.
- **Test place:** Skill checker and skill test suite.
- **Starting state:** Existing skill roots are synchronized.
- **Exact input or fixture:** Three modified canonical skills and their four provider copies.
- **Interaction steps:** Synchronize, check, test, and format the changed Markdown files.
- **Main behavior:** All provider roots contain identical valid portable skill content.
- **Expected result:** Synchronization, checking, tests, and formatting all pass.
- **Must change:** Canonical skills, synchronized copies, and `.skills-sync.json` if hashes change.
- **Must not happen:** Provider-specific syntax or divergent copies are introduced.
- **Planned command:** `pnpm skills:sync && pnpm skills:check && pnpm skills:test && pnpm exec prettier --check skills/frontend-standards/SKILL.md skills/react-19/SKILL.md skills/domain-driven-app-structure/SKILL.md`
- **Expected result before the code change:** Existing validation passes; new policy is not present.
- **First observed run:** `pnpm skills:check` and `pnpm skills:test` passed; the focused Prettier check failed only for this checklist file, which needed formatting.
- **Passing rerun:** `pnpm skills:check`, `pnpm skills:test`, and the focused Prettier check passed; all 104 skill tests passed.

## Implementation Plan

- [x] Update `skills/frontend-standards/SKILL.md` with the default lazy-loading policy, preferred boundaries, bounded normal-import exceptions, loading/error UX, and web/native caveat.
  - [x] Keep route composition and critical shell imports eager.
  - [x] Name routes, large features, optional UI, and heavy widgets as lazy boundaries.
  - [x] Require intent-based prefetching only when beneficial and avoid splitting tiny ubiquitous components.
- [x] Update `skills/react-19/SKILL.md` with `React.lazy`, dynamic import, `Suspense`, error-boundary, stable-declaration, and chunk-retry guidance.
- [x] Update `skills/domain-driven-app-structure/SKILL.md` and `references/source-layout.md` so route and feature organization supports lazy boundaries without moving shared primitives into feature chunks by default.
- [x] Run `pnpm skills:sync` and verify every provider root matches the canonical content.
- [x] Run focused scans, skill checks, skill tests, and Markdown formatting checks.

## Risks and Non-Goals

- This changes agent guidance only; it does not rewrite an existing frontend application.
- Over-splitting tiny shared components can increase requests and hurt interaction latency, so the policy must preserve a measured exception.
- Native bundlers may not provide browser-equivalent runtime chunking; guidance must require platform verification.

## Validation Notes

- Baseline scans confirmed that the requested lazy-loading policy was absent from the frontend and React skills.
- The first post-change skill checker passed, the skill test suite passed all 104 tests, and the focused policy scan found the new guidance in all four roots.
- The first focused Prettier check failed for this checklist only; the skill files were already formatted.
