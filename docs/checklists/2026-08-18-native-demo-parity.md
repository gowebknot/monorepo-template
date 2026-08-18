# Task: Native Expo and React Native demo parity

- Checklist ID: CHECKLIST-20260818-native-demo-parity
- Created: 2026-08-18
- Planning completed: 2026-08-18
- Type: Task
- Source request: Add full web-demo parity to Expo and bare React Native apps with NativeWind v5 and Tailwind v4.
- Related checklists:
  - Origin: `docs/checklists/2026-08-17-wire-next-expo-react-native-targets.md`
- Affected paths: `apps/expo`, `apps/mobile`, `core/create-mono-stack`, `scripts/stack-config.mjs`
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Planning Record

- [x] Confirm the planning phase was completed before creating this checklist.
  - [x] Read the task request and applicable repository and package guidance.
  - [x] Read the existing native-target checklist, native app guidance, and generator tests.
  - [x] Find rules in the existing web demos, schemas, query hooks, package scripts, and current native setup.
  - [x] Split the work into small items that can each be tested on their own.
  - [x] Define exact cases, implementation steps, dependencies, and risks.
- [x] Confirm this checklist captures the completed plan before implementation begins.
  - [x] Keep implementation work in this checklist's nested items.
  - [x] Add a checklist item before making any scope or approach change.
  - [x] No unresolved decision blocks the initial compatibility proof.

## Context and Scope

- [ ] Add the home, form demo, table demo, reference todo list, and todo detail flows to both native apps.
  - [ ] Preserve the existing shared `@repo/entities/example`, `@repo/query-client/example`, and `@repo/api-client/example` boundaries.
  - [ ] Keep Expo Router and bare React Navigation as separate navigation adapters.
  - [ ] Keep UI components and form components duplicated per app; a shared component package is out of scope.
- [ ] Replace the broken gluestack experiment with NativeWind v5 and Tailwind v4 CSS-first configuration.
  - [ ] Do not add gluestack packages or a gluestack provider because gluestack v5 imports the removed NativeWind v4 `cssInterop` API.
  - [ ] Do not preserve the incompatible NativeWind v4 preset, Babel plugin, or Tailwind v3 PostCSS configuration.
- [ ] Complete the generator overlays and package-script behavior for the expanded native apps.
  - [ ] Preserve generated native-owned files where the overlay does not need to replace them.
  - [ ] Add `dev` and `dev:reference` aliases without changing existing `start` behavior.
- [ ] Non-goals:
  - [ ] Do not change shared API contracts or add new `@repo` packages.
  - [ ] Do not add iOS or Android project directories to the canonical bare RN app.
  - [ ] Do not run uncontrolled third-party CLI downloads in ordinary unit tests.

## Implementation Description

Implement duplicated NativeWind v5/Tailwind v4 native component layers, TanStack Form field adapters,
full demo routes/screens, native clipboard and notification adapters, and complete Expo/RN reference
profile overlays. Extend generator script merging and stack manifest validation so generated projects
retain the same behavior.

## Acceptance Criteria

- [ ] Expo NativeWind v5 configuration typechecks and produces a Metro bundle without gluestack or `cssInterop` errors.
- [ ] Bare RN NativeWind v5 configuration typechecks and produces a Metro bundle from `index.js`.
- [ ] Both native apps expose home navigation to Reference, Form Demo, and Table Demo.
- [ ] Both native apps implement the bug-report form with the existing schema limits, field errors, password masking, select, switch, checkbox, and native success notification.
- [ ] Both native apps implement table filtering, sorting, pagination, column visibility, row selection, empty results, and payment ID copy.
- [ ] Both native apps implement todo creation, user filtering, detail navigation, title editing, todo-item creation, completion toggling, and deletion.
- [ ] Generated Expo and RN overlays contain the runtime configuration, UI components, forms, screens/routes, and `dev:reference` alias.
- [ ] New Expo/RN stack manifests are accepted by `readStackConfig` and template-update argument generation.
- [ ] Focused tests, app typechecks, native bundles, scaffolder tests, formatting, and `just check` pass.

## Small Task Breakdown

- [ ] Establish the NativeWind v5 compatibility baseline.
  - [x] Repair Expo CSS, PostCSS, Metro, Babel, and type declaration files.
    - Test IDs: TEST-TOOLCHAIN-001
    - Ready: Yes
  - [x] Add and validate the bare RN NativeWind Metro pipeline and CSS entry.
    - Test IDs: TEST-TOOLCHAIN-002
    - Ready: Yes
  - [x] Pin only versions compatible with Expo SDK 57, RN 0.87, and NativeWind v5.
    - Test IDs: TEST-TOOLCHAIN-001, TEST-TOOLCHAIN-002
    - Ready: Yes
  - [x] RN 0.87 remains supported; the hybrid Expo/RN Metro configuration avoids the source-map and polyfill incompatibilities, so no canonical downgrade is needed.
    - Test IDs: TEST-TOOLCHAIN-003
    - Ready: Yes
- [ ] Build the duplicated local native UI layer.
  - [ ] Add controls, typography, layout, table, and notification/clipboard adapters to Expo.
    - Test IDs: TEST-UI-001
    - Ready: Yes
  - [ ] Add the equivalent controls, typography, layout, table, and adapters to bare RN.
    - Test IDs: TEST-UI-002
    - Ready: Yes
- [ ] Add the duplicated native form system.
  - [ ] Add TanStack Form field registration and submit handling.
    - Test IDs: TEST-FORM-001, TEST-FORM-002, TEST-FORM-003, TEST-FORM-004
    - Ready: Yes
  - [ ] Add exact bug-report validation boundaries and error rendering.
    - Test IDs: TEST-FORM-001, TEST-FORM-002, TEST-FORM-003, TEST-FORM-004
    - Ready: Yes
- [ ] Implement Expo feature parity.
  - [ ] Add home, form-demo, table-demo, reference, todos, and todo detail routes.
    - Test IDs: TEST-EXPO-001, TEST-EXPO-002, TEST-EXPO-003, TEST-EXPO-004
    - Ready: Yes
  - [ ] Wire Expo env and shared query/API/entity hooks into every data screen.
    - Test IDs: TEST-EXPO-003, TEST-EXPO-004
    - Ready: Yes
- [ ] Implement bare RN feature parity.
  - [ ] Add Home, FormDemo, TableDemo, Reference, Todos, and TodoDetail stack screens.
    - Test IDs: TEST-MOBILE-001, TEST-MOBILE-002, TEST-MOBILE-003, TEST-MOBILE-004
    - Ready: Yes
  - [ ] Wire RN runtime env and shared query/API/entity hooks into every data screen.
    - Test IDs: TEST-MOBILE-003, TEST-MOBILE-004
    - Ready: Yes
- [ ] Complete generator and update metadata.
  - [ ] Expand Expo and RN overlay entries and fixture trees.
    - Test IDs: TEST-OVERLAY-001, TEST-OVERLAY-002
    - Ready: Yes
  - [ ] Merge `dev` and `dev:reference` scripts while preserving native dependency versions.
    - Test IDs: TEST-SCRIPTS-001
    - Ready: Yes
  - [ ] Accept native app records in stack validation and update exclusions.
    - Test IDs: TEST-MANIFEST-001
    - Ready: Yes
- [ ] Run end-to-end and repository verification.
  - [ ] Scaffold local Expo and RN projects from the template and validate their files and bundles.
    - Test IDs: TEST-GENERATED-001, TEST-GENERATED-002
    - Ready: Yes, subject to a committed local template snapshot for Copier.
  - [ ] Run the affected package checks and repository gate.
    - Test IDs: TEST-GATE-001
    - Ready: Yes

## Rules and Open Questions

- [x] Native styling uses NativeWind v5 with Tailwind v4 CSS-first configuration, not gluestack.
  - Source: user-confirmed compatibility decision and installed NativeWind v5 exports.
  - Test IDs: TEST-TOOLCHAIN-001, TEST-TOOLCHAIN-002
- [x] Each app owns its own native component and form source.
  - Source: user-confirmed architecture decision.
  - Test IDs: TEST-UI-001, TEST-UI-002, TEST-OVERLAY-001, TEST-OVERLAY-002
- [x] Bare RN local implementation imports use the `@/*` alias mapped to `src`; relative imports remain permitted only for barrel files.
  - Source: user clarification during implementation and updated `apps/mobile/tsconfig.json` / Metro resolver.
  - Test IDs: TEST-TOOLCHAIN-002, TEST-MOBILE-001, TEST-MOBILE-002
- [x] Native demo data uses the existing example contracts and query hooks.
  - Source: `packages/entities/example`, `packages/query-client/example`, and `packages/api-client/example`.
  - Test IDs: TEST-EXPO-003, TEST-EXPO-004, TEST-MOBILE-003, TEST-MOBILE-004
- [x] Native notification uses a cross-platform `Alert` equivalent for the web Sonner result.
  - Source: user context's native platform constraint.
  - Test IDs: TEST-FORM-001
- [ ] Bare RN NativeWind v5 Metro compatibility must be proven before all screens are ported.
  - Source: NativeWind v5 package behavior and user-confirmed risk.
  - Test IDs: TEST-TOOLCHAIN-002
- [ ] Native optimistic mutations must have a working `crypto.randomUUID` implementation at runtime.
  - Sources checked: `packages/query-client/example/todo-hooks.ts`, `todo-item-hooks.ts`, RN runtime guidance.
  - Conflicting sources: None; verify the current RN/Expo runtime before adding a polyfill.
  - Needed answer: Runtime validation during the native smoke check.
  - Blocking items: TEST-EXPO-003, TEST-EXPO-004, TEST-MOBILE-003, TEST-MOBILE-004

## Small Task and Test Map

| Small task or rule                        | Source                                        | Test IDs                               | Ready or missing detail    |
| ----------------------------------------- | --------------------------------------------- | -------------------------------------- | -------------------------- |
| Expo NativeWind pipeline                  | `apps/expo`, NativeWind v5 package            | TEST-TOOLCHAIN-001                     | Ready                      |
| RN NativeWind pipeline                    | `apps/mobile`, NativeWind v5 package          | TEST-TOOLCHAIN-002                     | Ready                      |
| Canonical RN/Metro compatibility fallback | Expo SDK 57 bundled RN and NativeWind v5      | TEST-TOOLCHAIN-003                     | Ready                      |
| Local native controls                     | User request and native platform constraints  | TEST-UI-001, TEST-UI-002               | Ready                      |
| Bug-report form success                   | `apps/web/src/routes/-form-demo-option.ts`    | TEST-FORM-001                          | Ready                      |
| Bug-report title limits                   | Existing bug-report schema                    | TEST-FORM-002                          | Ready                      |
| Bug-report description limits             | Existing bug-report schema                    | TEST-FORM-003                          | Ready                      |
| Bug-report password and agreement rules   | Existing bug-report schema                    | TEST-FORM-004                          | Ready                      |
| Expo navigation and demos                 | User request                                  | TEST-EXPO-001, TEST-EXPO-002           | Ready                      |
| Expo todo/detail behavior                 | Existing web routes and query hooks           | TEST-EXPO-003, TEST-EXPO-004           | Ready                      |
| RN navigation and demos                   | User request                                  | TEST-MOBILE-001, TEST-MOBILE-002       | Ready                      |
| RN todo/detail behavior                   | Existing web routes and query hooks           | TEST-MOBILE-003, TEST-MOBILE-004       | Ready                      |
| Native overlay files                      | `reference-profiles.js` and scaffold fixtures | TEST-OVERLAY-001, TEST-OVERLAY-002     | Ready                      |
| Native scripts                            | `mergeProfilePackageJson`                     | TEST-SCRIPTS-001                       | Ready                      |
| Native stack manifest                     | `scripts/stack-config.mjs`                    | TEST-MANIFEST-001                      | Ready                      |
| Generated projects                        | Copier integration boundary                   | TEST-GENERATED-001, TEST-GENERATED-002 | Ready after local snapshot |
| Repository validation                     | `AGENTS.md` commands                          | TEST-GATE-001                          | Ready                      |

## Exact Test Cases

- [ ] TEST-TOOLCHAIN-001: Expo NativeWind v5 typecheck and bundle
  - Small task: Repair the Expo NativeWind pipeline.
  - Source: User-confirmed Tailwind v4 decision and `apps/expo` current configuration.
  - Test place: Expo typecheck and Metro export.
  - Starting state: Expo source contains unresolved gluestack imports and v4-style NativeWind configuration.
  - Exact input or fixture: Expo app with one local `Button` rendered from the home route; no gluestack imports or dependencies.
  - Interaction steps: Run the typecheck, then export an iOS bundle to a temporary output directory.
  - Main behavior: NativeWind CSS and local native components resolve through Expo Metro.
  - Expected result: Typecheck and export exit 0 with no missing UI modules, `cssInterop`, PostCSS, or Tailwind preset errors.
  - Must change: Expo config, dependencies, CSS entry, and local UI imports.
  - Must not happen: No gluestack package or `nativewind/preset` import remains.
  - Planned command: `pnpm --filter expo typecheck && pnpm --filter expo exec expo export --platform ios --output-dir /tmp/monorepo-template-expo-export`
  - Expected result before the code change: Typecheck fails on missing gluestack modules; export cannot prove the corrected pipeline.
  - First observed run: `pnpm --filter expo typecheck` failed with TS2307 for `@/components/ui/gluestack-ui-provider` and `@/components/ui/button`; the chained export did not run. After the initial compatibility edit, typecheck passed but Expo export failed while deserializing `globals.css`.
  - Passing rerun: `pnpm --filter expo typecheck && pnpm --filter expo exec expo export --platform ios --output-dir /tmp/monorepo-template-expo-poc3` passed; Expo bundled the iOS entry and emitted the export metadata.

- [x] TEST-TOOLCHAIN-002: Bare RN NativeWind v5 typecheck and bundle
  - Small task: Add the bare RN NativeWind Metro pipeline.
  - Source: User-confirmed NativeWind v5 compatibility risk and `apps/mobile` current stock Metro setup.
  - Test place: Bare RN typecheck and Metro bundle.
  - Starting state: Bare RN app has no NativeWind, CSS entry, or CSS-aware Metro wrapper.
  - Exact input or fixture: `index.js` registering `App`, with a local NativeWind `Button` rendered by `App.tsx`.
  - Interaction steps: Run typecheck, then create an iOS development-disabled bundle and temporary asset directory.
  - Main behavior: RN Metro resolves the NativeWind v5 CSS pipeline without native project directories.
  - Expected result: Both commands exit 0 and the bundle file is created.
  - Must change: RN dependencies, Metro, CSS entry, Babel/typing setup, and App import.
  - Must not happen: No Expo Router entry or gluestack dependency is introduced into bare RN.
  - Planned command: `pnpm --filter mobile typecheck && pnpm --filter mobile exec react-native bundle --entry-file index.js --platform ios --dev false --bundle-output /tmp/monorepo-template-mobile.jsbundle --assets-dest /tmp/monorepo-template-mobile-assets`
  - Expected result before the code change: Typecheck passes for the existing primitive app, but there is no NativeWind bundle path to validate.
  - First observed run: `pnpm --filter mobile typecheck` passed, then the baseline and POC bundle failed because the CLI dependency was missing, the relative entry resolved from the workspace root, and NativeWind/Metro later hit RN source-map and helper-resolution failures.
  - Passing rerun: `pnpm install`, `pnpm --filter mobile typecheck`, and the direct RN 0.87 bundle with the absolute app entry passed; Metro copied 25 assets and emitted the bundle.

- [x] TEST-TOOLCHAIN-003: Aligned canonical RN toolchain bundles when RN 0.87 is incompatible
  - Small task: Provide the NativeWind v5 compatibility fallback for the canonical mobile reference app.
  - Source: NativeWind v5 current peer/toolchain support and Expo SDK 57 bundled RN 0.86.2.
  - Test place: Bare RN typecheck and Metro bundle with aligned RN package versions.
  - Starting state: Canonical mobile app uses RN 0.87 and its Metro 0.87 bundle fails in the NativeWind source-map path.
  - Exact input or fixture: Canonical mobile package aligned to RN 0.86.2, matching Babel/Metro/TypeScript configs, and the same `index.js` entry.
  - Interaction steps: Install the aligned dependencies, run typecheck, and bundle from the mobile app directory.
  - Main behavior: The canonical reference app has a working NativeWind v5 bundle while generated RN projects retain native generator versions.
  - Expected result: Typecheck and bundle exit 0; the profile merge keeps generated `react-native` and native config versions authoritative.
  - Must change: Only canonical mobile toolchain versions if TEST-TOOLCHAIN-002 cannot pass on RN 0.87.
  - Must not happen: The generator must not overwrite generated RN-owned dependencies or native directories.
  - Planned command: `pnpm install && pnpm --filter mobile typecheck && ./node_modules/.bin/react-native bundle --entry-file /Users/mr_adventurous/my-adventures/experiments/monorepo-template/apps/mobile/index.js --platform ios --dev false --bundle-output /tmp/monorepo-template-mobile-aligned.jsbundle --assets-dest /tmp/monorepo-template-mobile-aligned-assets`
  - Expected result before the code change: The RN 0.87 bundle fails with `Unexpected module with full source map found` after Metro resolves the graph.
  - First observed run: The temporary RN 0.86.2 alignment bundled successfully, but the fallback was not needed after the hybrid Metro config was applied.
  - Passing rerun: Not applicable; TEST-TOOLCHAIN-002 passed on the requested RN 0.87 toolchain, so no downgrade was retained.

- [ ] TEST-UI-001: Expo local controls render and expose native interactions
  - Small task: Add the Expo duplicated local UI layer.
  - Source: User styling decision and Expo platform controls.
  - Test place: Expo bundle smoke check and manual native screen check.
  - Starting state: Expo home route with local Button, Input, Text, Card, Select, Switch, Checkbox, Table, and layout components.
  - Exact input or fixture: Pressable button, editable text input, three-option select (`bug`, `feature`, `docs`), false-to-true switch, and unchecked-to-checked checkbox.
  - Interaction steps: Open home, press each control, enter text, open and choose the select option, toggle switch and checkbox.
  - Main behavior: Controls update native state and preserve accessible labels.
  - Expected result: Press, text, select, switch, and checkbox state changes are visible; disabled controls do not activate.
  - Must change: `apps/expo/components/ui` and its utility/config files.
  - Must not happen: No DOM elements, Radix controls, or gluestack provider are required.
  - Planned command: `pnpm --filter expo typecheck && pnpm --filter expo exec expo export --platform ios --output-dir /tmp/monorepo-template-expo-ui-export`
  - Expected result before the code change: Existing missing gluestack modules prevent a complete UI check.
  - First observed run: The full launcher command ran; the target overlay assertions passed, but the suite finished 225/226 because the unrelated Ink multiselect test timed out.
  - Passing rerun: pending

- [ ] TEST-UI-002: Bare RN local controls render and expose native interactions
  - Small task: Add the bare RN duplicated local UI layer.
  - Source: User styling decision and bare RN platform controls.
  - Test place: RN bundle smoke check and manual native screen check.
  - Starting state: RN `App.tsx` with the same local control set under `src/components/ui`.
  - Exact input or fixture: Pressable button, editable text input, three-option select, switch, and checkbox.
  - Interaction steps: Open the app, press each control, enter text, choose an option, and toggle both boolean controls.
  - Main behavior: Controls update state through native event APIs.
  - Expected result: State changes are visible and controls expose meaningful accessibility labels.
  - Must change: `apps/mobile/src/components/ui` and its utility/config files.
  - Must not happen: No Expo Router or web DOM dependency is introduced.
  - Planned command: `pnpm --filter mobile typecheck && pnpm --filter mobile exec react-native bundle --entry-file index.js --platform ios --dev false --bundle-output /tmp/monorepo-template-mobile-ui.jsbundle --assets-dest /tmp/monorepo-template-mobile-ui-assets`
  - Expected result before the code change: The current app has no NativeWind component layer or CSS bundle path.
  - First observed run: The full launcher command ran; the target overlay assertions passed, but the suite finished 225/226 because the unrelated Ink multiselect test timed out.
  - Passing rerun: pending

- [ ] TEST-FORM-001: Valid bug report submits through the native form system
  - Small task: Add TanStack Form field adapters and valid submission.
  - Source: `apps/web/src/routes/-form-demo-option.ts` and the form-demo request.
  - Test place: Manual UI smoke check on Expo and RN form-demo screens.
  - Starting state: Empty bug-report form.
  - Exact input or fixture: title `Broken login`, description `The login form crashes after submit.`, category `bug`, isPublic `true`, agreeToTerms `true`, password `password1`.
  - Interaction steps: Enter all values, choose `bug`, toggle the switch and checkbox, then press submit.
  - Main behavior: Valid values pass the shared schema and submit the form action.
  - Expected result: A native alert shows the submitted JSON; no field error is visible.
  - Must change: Form state, validation state, and one native notification.
  - Must not happen: No browser submit, DOM event, or API request occurs.
  - Planned command: `pnpm --filter expo typecheck && pnpm --filter mobile typecheck`
  - Expected result before the code change: The native apps have no form-demo screen or shared native form system.
  - First observed run: The full launcher command ran; existing manifest cases passed, but no native app-record case exists yet and the current validator still rejects native records.
  - Passing rerun: pending

- [ ] TEST-FORM-002: Title minimum and maximum boundaries validate
  - Small task: Preserve title validation limits.
  - Source: `bugReportSchema.title`.
  - Test place: Native form UI validation.
  - Starting state: Form otherwise valid with description `The login form crashes after submit.`, category `bug`, isPublic `false`, agreeToTerms `true`, password `password1`.
  - Exact input or fixture: Test title values `abcd`, `abcde`, a 32-character title, and a 33-character title as separate submissions.
  - Interaction steps: Enter one title value, fill the remaining valid fields, and press submit.
  - Main behavior: Title length boundaries are enforced.
  - Expected result: 4 and 33 characters show the exact schema error and do not submit; 5 and 32 characters submit.
  - Must change: Field error state only for rejected values; alert only for accepted values.
  - Must not happen: Rejected values must not trigger the success notification.
  - Planned command: `pnpm --filter expo typecheck && pnpm --filter mobile typecheck`
  - Expected result before the code change: No native form exists to enforce this rule.
  - First observed run: pending
  - Passing rerun: pending

- [ ] TEST-FORM-003: Description minimum and maximum boundaries validate
  - Small task: Preserve description validation limits.
  - Source: `bugReportSchema.description`.
  - Test place: Native form UI validation.
  - Starting state: Form otherwise valid with title `Broken login`, category `bug`, isPublic `false`, agreeToTerms `true`, password `password1`.
  - Exact input or fixture: Description values of 19, 20, 100, and 101 ASCII `a` characters as separate submissions.
  - Interaction steps: Enter one description value, fill the remaining valid fields, and press submit.
  - Main behavior: Description length boundaries are enforced.
  - Expected result: 19 and 101 characters show the exact schema error and do not submit; 20 and 100 characters submit.
  - Must change: Field error state only for rejected values; alert only for accepted values.
  - Must not happen: Rejected values must not trigger the success notification.
  - Planned command: `pnpm --filter expo typecheck && pnpm --filter mobile typecheck`
  - Expected result before the code change: No native form exists to enforce this rule.
  - First observed run: pending
  - Passing rerun: pending

- [ ] TEST-FORM-004: Password, category, and agreement rules validate
  - Small task: Preserve password, enum, and agreement validation.
  - Source: `bugReportSchema.password`, `category`, and `agreeToTerms`.
  - Test place: Native form UI validation.
  - Starting state: Valid title and 20-character description, isPublic `false`.
  - Exact input or fixture: Password values `1234567` and `12345678`; category options `bug`, `feature`, `docs`; agreeToTerms values `false` and `true` as separate submissions.
  - Interaction steps: Submit each password/agreement case and select each category option in a valid submission.
  - Main behavior: Minimum password length, required agreement, and supported category choices are enforced.
  - Expected result: Seven-character password and unchecked agreement show schema errors; eight-character password and checked agreement submit; all three category choices are selectable.
  - Must change: Field validation state and successful submission for accepted cases.
  - Must not happen: Unsupported category values cannot be selected or submitted through the UI.
  - Planned command: `pnpm --filter expo typecheck && pnpm --filter mobile typecheck`
  - Expected result before the code change: No native form exists to enforce these rules.
  - First observed run: pending
  - Passing rerun: pending

- [ ] TEST-EXPO-001: Expo home navigation reaches all top-level demos
  - Small task: Add Expo Router home and top-level routes.
  - Source: User route list and existing Expo Router entry.
  - Test place: Expo manual navigation smoke check.
  - Starting state: Expo app at `/`.
  - Exact input or fixture: Routes `/reference`, `/form-demo`, and `/table-demo`.
  - Interaction steps: Press each home link, confirm the destination, and navigate back home.
  - Main behavior: Top-level route links work.
  - Expected result: Each route renders its intended screen and back navigation returns to home.
  - Must change: Expo route files and home links.
  - Must not happen: No route opens a blank screen or uses a web-only navigation API.
  - Planned command: `pnpm --filter expo typecheck && pnpm --filter expo exec expo export --platform ios --output-dir /tmp/monorepo-template-expo-routes-export`
  - Expected result before the code change: Only home and todos routes exist.
  - First observed run: pending
  - Passing rerun: pending

- [ ] TEST-EXPO-002: Expo table demo filters, sorts, paginates, hides columns, and selects rows
  - Small task: Port the headless payment table to native rows.
  - Source: `apps/web/src/routes/table-demo.tsx`.
  - Test place: Expo manual table smoke check.
  - Starting state: Five payment fixtures: `m5gr84i9`, `3u1reuv4`, `derv1ws0`, `5kma53ae`, and `bhqecj4p`.
  - Exact input or fixture: Filter `ken99@example.com`; filter `does-not-exist@example.com`; email sort toggles; select-all; hide `status`; copy payment ID `m5gr84i9`.
  - Interaction steps: Filter, clear, toggle email sort twice, select the current page, hide and show status, open row actions, copy the ID, and page forward/back.
  - Main behavior: TanStack Table state drives native table rows and controls.
  - Expected result: The first filter leaves `m5gr84i9`; the second shows `No results`; sort order changes; selected count and visibility update; clipboard contains `m5gr84i9`; pagination buttons disable at boundaries.
  - Must change: Filter, sorting, pagination, visibility, selection, and clipboard state.
  - Must not happen: No HTML table or browser clipboard API is used.
  - Planned command: `pnpm --filter expo typecheck && pnpm --filter expo exec expo export --platform ios --output-dir /tmp/monorepo-template-expo-table-export`
  - Expected result before the code change: No Expo table demo exists.
  - First observed run: pending
  - Passing rerun: pending

- [ ] TEST-EXPO-003: Expo reference todo list creates, filters, opens, and deletes todos
  - Small task: Port the Expo reference landing and todo list.
  - Source: Existing web reference todo route and shared todo hooks.
  - Test place: Expo manual API smoke check with the reference server.
  - Starting state: Reference server running at the configured API base URL; empty filter input.
  - Exact input or fixture: Create `{ userId: "native-user", title: "Native parity todo" }`.
  - Interaction steps: Submit the create form, enter `native-user` in the filter, press the todo title, return, and press delete.
  - Main behavior: Shared optimistic todo hooks and navigation are connected to native controls.
  - Expected result: The created todo appears for `native-user`, title navigation opens its detail route, and delete removes it from the list.
  - Must change: API calls, query cache, list rendering, and navigation state.
  - Must not happen: Native code must not define a duplicate todo request type or call Axios directly.
  - Planned command: `pnpm --filter expo typecheck && pnpm --filter expo exec expo export --platform ios --output-dir /tmp/monorepo-template-expo-todos-export`
  - Expected result before the code change: Expo has only a single non-reference todos screen and no detail navigation.
  - First observed run: pending
  - Passing rerun: pending

- [ ] TEST-EXPO-004: Expo todo detail edits todos and manages items
  - Small task: Port the Expo todo detail screen.
  - Source: `apps/web/src/routes/reference/todos.$todoId.tsx` and shared todo-item hooks.
  - Test place: Expo manual API smoke check.
  - Starting state: Todo created by TEST-EXPO-003.
  - Exact input or fixture: Rename to `Updated native parity todo`; add item `Ship native parity`; initial completed `false`; route parameter from the created todo ID; not-found route parameter `missing-id`.
  - Interaction steps: Open detail, enter edit mode, save the new title, add the item, toggle completion, delete the item, and open `missing-id`.
  - Main behavior: Todo and todo-item optimistic mutations update detail state.
  - Expected result: Title updates, item appears, completion changes, deletion removes the item, and `missing-id` shows `Todo not found.`
  - Must change: Detail and item query caches, API mutation calls, and route state.
  - Must not happen: Empty trimmed titles must not issue an update request.
  - Planned command: `pnpm --filter expo typecheck && pnpm --filter expo exec expo export --platform ios --output-dir /tmp/monorepo-template-expo-detail-export`
  - Expected result before the code change: Expo has no detail or todo-item UI.
  - First observed run: pending
  - Passing rerun: pending

- [ ] TEST-MOBILE-001: Bare RN home navigation reaches all top-level demos
  - Small task: Add the RN stack routes and home navigation.
  - Source: User route list and existing RN navigation.
  - Test place: RN manual navigation smoke check.
  - Starting state: Bare RN app at `Home`.
  - Exact input or fixture: Stack routes `Reference`, `FormDemo`, and `TableDemo`.
  - Interaction steps: Press each home button, confirm the destination, and use the stack back action.
  - Main behavior: Top-level stack navigation works.
  - Expected result: Each screen renders and back navigation returns to Home.
  - Must change: `App.tsx`, navigation types, and screen files.
  - Must not happen: No Expo Router dependency or web navigation API is used.
  - Planned command: `pnpm --filter mobile typecheck && pnpm --filter mobile exec react-native bundle --entry-file index.js --platform ios --dev false --bundle-output /tmp/monorepo-template-mobile-routes.jsbundle --assets-dest /tmp/monorepo-template-mobile-routes-assets`
  - Expected result before the code change: Only Home and Todos stack routes exist.
  - First observed run: pending
  - Passing rerun: pending

- [ ] TEST-MOBILE-002: Bare RN table and form demos match Expo behavior
  - Small task: Port the table and bug-report screens to the RN stack.
  - Source: Existing web demos and native component requirements.
  - Test place: RN manual screen smoke check.
  - Starting state: RN app at Home.
  - Exact input or fixture: The TEST-FORM-001 through TEST-FORM-004 values and the TEST-EXPO-002 payment fixtures/actions.
  - Interaction steps: Open FormDemo and TableDemo and perform the exact actions from the referenced cases.
  - Main behavior: RN controls provide the same user-visible behavior as Expo.
  - Expected result: Form validation/submission and table state match the Expo results.
  - Must change: RN screen state and native UI interactions.
  - Must not happen: No duplicated API or contract implementation is added.
  - Planned command: `pnpm --filter mobile typecheck && pnpm --filter mobile exec react-native bundle --entry-file index.js --platform ios --dev false --bundle-output /tmp/monorepo-template-mobile-demos.jsbundle --assets-dest /tmp/monorepo-template-mobile-demos-assets`
  - Expected result before the code change: RN has no form-demo or table-demo screen.
  - First observed run: pending
  - Passing rerun: pending

- [ ] TEST-MOBILE-003: Bare RN reference todo list creates, filters, opens, and deletes todos
  - Small task: Port the RN reference landing and todo list.
  - Source: Existing web reference todo route and shared todo hooks.
  - Test place: RN manual API smoke check with the reference server.
  - Starting state: Reference server running; RN app at `Reference`.
  - Exact input or fixture: Create `{ userId: "native-user", title: "Native parity todo" }`.
  - Interaction steps: Submit, filter by `native-user`, press the title, return, and delete.
  - Main behavior: Shared optimistic todo hooks and RN stack navigation are connected.
  - Expected result: Created todo appears, detail opens, and delete removes it.
  - Must change: API calls, cache, list rendering, and stack navigation.
  - Must not happen: No direct transport call or local duplicate contract is added.
  - Planned command: `pnpm --filter mobile typecheck && pnpm --filter mobile exec react-native bundle --entry-file index.js --platform ios --dev false --bundle-output /tmp/monorepo-template-mobile-todos.jsbundle --assets-dest /tmp/monorepo-template-mobile-todos-assets`
  - Expected result before the code change: RN has only its existing single todos screen and no detail route.
  - First observed run: pending
  - Passing rerun: pending

- [ ] TEST-MOBILE-004: Bare RN todo detail edits todos and manages items
  - Small task: Port the RN todo detail screen.
  - Source: Existing web detail route and shared todo-item hooks.
  - Test place: RN manual API smoke check.
  - Starting state: Todo created by TEST-MOBILE-003.
  - Exact input or fixture: Rename to `Updated native parity todo`; add `Ship native parity`; toggle true; delete; route parameter `missing-id`.
  - Interaction steps: Edit/save, add item, toggle, delete, and open the missing route.
  - Main behavior: Todo and todo-item mutations update the RN detail screen.
  - Expected result: Title/item/completion/deletion behave as expected and missing data shows `Todo not found.`
  - Must change: Detail and item query caches and stack state.
  - Must not happen: Empty trimmed title must not issue an update request.
  - Planned command: `pnpm --filter mobile typecheck && pnpm --filter mobile exec react-native bundle --entry-file index.js --platform ios --dev false --bundle-output /tmp/monorepo-template-mobile-detail.jsbundle --assets-dest /tmp/monorepo-template-mobile-detail-assets`
  - Expected result before the code change: RN has no detail or todo-item UI.
  - First observed run: pending
  - Passing rerun: pending

- [ ] TEST-OVERLAY-001: Expo overlay carries the complete native reference tree
  - Small task: Expand the Expo reference profile and fixture.
  - Source: `core/create-mono-stack/src/reference-profiles.js` and user overlay requirements.
  - Test place: `core/create-mono-stack/test/native-scaffold-overlays.test.js`.
  - Starting state: Mock `mobile-expo` generator output and canonical Expo tree.
  - Exact input or fixture: CSS entry, PostCSS, Metro, Babel, type declarations, UI components, forms, all Expo route files, docs, and package scripts.
  - Interaction steps: Run `scaffoldNativeApps`, read the generated app root and package JSON.
  - Main behavior: The overlay replaces the generated source with the complete canonical reference app.
  - Expected result: Required files exist, generated-owned native files remain where specified, and `dev` plus `dev:reference` are present.
  - Must change: Profile entries, rendered tree fixtures, and assertions.
  - Must not happen: Missing overlay sources or gluestack files are not silently ignored.
  - Planned command: `pnpm --filter create-mono-stack test -- native-scaffold-overlays`
  - Expected result before the code change: Existing assertions cover only the partial Expo tree and do not require NativeWind/form/demo files.
  - First observed run: pending
  - Passing rerun: pending

- [ ] TEST-OVERLAY-002: RN overlay carries the complete native reference tree
  - Small task: Expand the RN reference profile and fixture.
  - Source: `core/create-mono-stack/src/reference-profiles.js` and user overlay requirements.
  - Test place: `core/create-mono-stack/test/native-scaffold-overlays.test.js`.
  - Starting state: Mock `mobile-react-native` generator output and canonical mobile tree.
  - Exact input or fixture: CSS entry, PostCSS, Metro, Babel, type declarations, UI components, forms, all RN screens, docs, and package scripts.
  - Interaction steps: Run `scaffoldNativeApps`, read the generated app root and package JSON.
  - Main behavior: The overlay replaces generated JS/TS source with the complete RN reference app.
  - Expected result: Required files exist, generated native `ios`/`android` directories and entry remain supported, and `dev` plus `dev:reference` are present.
  - Must change: Profile entries, rendered tree fixtures, and assertions.
  - Must not happen: Expo Router files or gluestack packages are introduced.
  - Planned command: `pnpm --filter create-mono-stack test -- native-scaffold-overlays`
  - Expected result before the code change: Existing assertions cover only the partial RN tree and do not require NativeWind/form/demo files.
  - First observed run: pending
  - Passing rerun: pending

- [ ] TEST-SCRIPTS-001: Native generated packages receive both development aliases
  - Small task: Merge `dev` and `dev:reference` without replacing native scripts or dependency versions.
  - Source: User script decision and `mergeProfilePackageJson`.
  - Test place: `core/create-mono-stack/test/native-scaffold-overlays.test.js` and helper fixtures.
  - Starting state: Native package has `start` and generator-owned dependency versions; canonical package has `dev` and `dev:reference`.
  - Exact input or fixture: Expo scripts both `expo start`; RN scripts both `react-native start`.
  - Interaction steps: Apply each profile and inspect package JSON.
  - Main behavior: Development aliases are copied while native package-owned scripts and versions remain authoritative.
  - Expected result: `dev` and `dev:reference` exist and are equal; `start` and native dependency versions are preserved.
  - Must change: Merge logic and tests.
  - Must not happen: Existing Vite/Nest merge behavior must not regress.
  - Planned command: `pnpm --filter create-mono-stack test -- native-scaffold-overlays`
  - Expected result before the code change: Only `*:reference` scripts are merged; `dev` is absent in generated native packages.
  - First observed run: pending
  - Passing rerun: pending

- [ ] TEST-MANIFEST-001: Native stack manifests validate and update correctly
  - Small task: Add native definitions to stack configuration and update exclusions.
  - Source: `scripts/stack-config.mjs`, `scripts/update-template.mjs`, and generated native records.
  - Test place: `core/create-mono-stack/test/stack-config.test.js` and update-template tests.
  - Starting state: Schema version 3 manifest with `mobile-expo` or `mobile-react-native` app records and matching profiles.
  - Exact input or fixture: Generators `expo` and `react-native`, profiles `expo/default` and `react-native/default`, paths `apps/expo` and `apps/mobile`.
  - Interaction steps: Parse the manifest and construct template-update arguments.
  - Main behavior: Native records are accepted and native app paths are handled by update logic.
  - Expected result: No old `web-vite`/`api-nest`-only validation error; update arguments contain the correct feature data and exclusions.
  - Must change: App definitions, generator/profile validation, canonical path map, and tests.
  - Must not happen: Existing Vite/Nest validation behavior changes.
  - Planned command: `pnpm --filter create-mono-stack test -- stack-config`
  - Expected result before the code change: Native app records are rejected as unknown or incompatible features.
  - First observed run: pending
  - Passing rerun: pending

- [ ] TEST-GENERATED-001: Generated Expo project installs, typechecks, and bundles
  - Small task: Validate the full Expo Copier boundary.
  - Source: User end-to-end verification requirement.
  - Test place: Local committed-template integration fixture or temporary local template snapshot.
  - Starting state: Template snapshot containing the completed canonical Expo app and generator profile.
  - Exact input or fixture: `--features mobile-expo`, generated `apps/expo`, reference API base URL from `.env.example`.
  - Interaction steps: Scaffold, install dependencies, run typecheck, export a bundle, inspect files and scripts.
  - Main behavior: Copier output is a runnable Expo reference app.
  - Expected result: Generated app has complete routes/UI/config, typecheck and bundle pass, and `dev` equals `dev:reference`.
  - Must change: Generated temporary project only.
  - Must not happen: Canonical app files may not be missing from the packaged/template source.
  - Planned command: `pnpm --filter create-mono-stack test:integration`
  - Expected result before the code change: Existing integration harness does not exercise the full native feature tree.
  - First observed run: pending
  - Passing rerun: pending

- [ ] TEST-GENERATED-002: Generated RN project installs, typechecks, and bundles
  - Small task: Validate the full bare RN Copier boundary.
  - Source: User end-to-end verification requirement.
  - Test place: Local committed-template integration fixture or temporary local template snapshot.
  - Starting state: Template snapshot containing the completed canonical RN app and generator profile.
  - Exact input or fixture: `--features mobile-react-native`, generated `apps/mobile`, RN CLI native directories.
  - Interaction steps: Scaffold, install dependencies, run typecheck, bundle from `index.js`, inspect files and scripts.
  - Main behavior: Copier output is a runnable bare RN reference app.
  - Expected result: Generated app has complete screens/UI/config, typecheck and bundle pass, and `dev` equals `dev:reference`.
  - Must change: Generated temporary project only.
  - Must not happen: Canonical overlay must not remove required generated native project directories.
  - Planned command: `pnpm --filter create-mono-stack test:integration`
  - Expected result before the code change: Existing integration harness does not exercise the full native feature tree.
  - First observed run: pending
  - Passing rerun: pending

- [ ] TEST-GATE-001: Affected package and repository gates pass
  - Small task: Complete final verification.
  - Source: Root `AGENTS.md` and package guidance.
  - Test place: Workspace command suite.
  - Starting state: All implementation and focused checks complete.
  - Exact input or fixture: Current worktree with only intended parity changes added to the active checklist.
  - Interaction steps: Run scaffolder tests, app typechecks, formatting, and the repository gate.
  - Main behavior: The complete change is buildable and repository-compliant.
  - Expected result: All commands exit 0; any pre-existing warning is recorded without suppressing errors.
  - Must change: Checklist records with real command results.
  - Must not happen: No skipped hooks, disabled checks, or weakened assertions.
  - Planned command: `pnpm --filter create-mono-stack test && pnpm --filter expo typecheck && pnpm --filter mobile typecheck && just check`
  - Expected result before the code change: Expo typecheck fails and native parity checks are incomplete.
  - First observed run: pending
  - Passing rerun: pending

## Missing-Case Review

- [ ] Normal valid values and successful results: TEST-FORM-001, TEST-EXPO-001 through TEST-EXPO-004, TEST-MOBILE-001 through TEST-MOBILE-004.
- [ ] Each separate validation rule and rejected value: TEST-FORM-002, TEST-FORM-003, TEST-FORM-004.
- [ ] Missing value: TEST-FORM-004 for unchecked agreement and required form fields.
- [ ] Explicit `null` value: Not applicable to controlled native fields; shared schema has no nullable form fields.
- [ ] Empty value: TEST-FORM-001 starts from empty defaults; invalid submit is covered by TEST-FORM-002 through TEST-FORM-004.
- [ ] Spaces-only text: TEST-EXPO-004 and TEST-MOBILE-004 for trimmed empty todo title.
- [ ] Wrong-type value: Not reachable through typed native controls; shared Zod schema remains authoritative.
- [ ] Bad-format value: TEST-FORM-004 for unsupported category selection; the UI exposes only valid enum values.
- [ ] Unsupported value: TEST-FORM-004 and missing route `missing-id` in TEST-EXPO-004 and TEST-MOBILE-004.
- [ ] Duplicate value: Not applicable; no duplicate submission behavior is defined by the existing demos.
- [ ] Conflicting values: TEST-FORM-001 through TEST-FORM-004 cover related boolean and field validation state.
- [ ] Exact minimum: TEST-FORM-002, TEST-FORM-003, TEST-FORM-004.
- [ ] Below minimum: TEST-FORM-002, TEST-FORM-003, TEST-FORM-004.
- [ ] Exact maximum: TEST-FORM-002 and TEST-FORM-003.
- [ ] Above maximum: TEST-FORM-002 and TEST-FORM-003.
- [ ] Each choice: TEST-FORM-004 covers `bug`, `feature`, and `docs`.
- [ ] Each branch: TEST-EXPO-001, TEST-MOBILE-001, and the referenced feature cases.
- [ ] Empty data: TEST-EXPO-002 and TEST-MOBILE-002 for table no-results; TEST-EXPO-003 and TEST-MOBILE-003 for empty todo lists.
- [ ] One item: TEST-EXPO-003 and TEST-MOBILE-003 after one todo is created.
- [ ] Many items: TEST-EXPO-002 and TEST-EXPO-004 / TEST-MOBILE-004 item lists.
- [ ] Allowed state change: TEST-EXPO-004 and TEST-MOBILE-004 edit, create, toggle, and delete actions.
- [ ] Blocked state change: TEST-EXPO-004 and TEST-MOBILE-004 reject empty trimmed title updates.
- [ ] Not found: TEST-EXPO-004 and TEST-MOBILE-004 with `missing-id`.
- [ ] Dependency failure: Existing query hooks own rollback behavior; native UI must render an error/alert state during manual API smoke checks.
- [ ] Timeout: Not separately applicable; no timeout policy exists in the current example query layer.
- [ ] Unexpected error: Native query error state and alert behavior are included in the feature implementation.
- [ ] Signed-out access: Not applicable; the example apps have no auth boundary.
- [ ] Wrong-permission access: Not applicable; the example apps have no authorization boundary.
- [ ] Wrong-owner access: Not applicable; the example reference API exposes user filtering but no auth ownership rule.
- [ ] Wrong-account access: Not applicable; no account selection exists in the demos.
- [ ] Required data changes: TEST-EXPO-003, TEST-EXPO-004, TEST-MOBILE-003, TEST-MOBILE-004.
- [ ] Required outside calls: Shared query/API hooks in the same cases; no direct transport calls.
- [ ] Required messages: TEST-FORM-001 through TEST-FORM-004 and not-found cases.
- [ ] Required events: Native press, text, select, switch, checkbox, and navigation events in TEST-UI-001, TEST-UI-002.
- [ ] Required file changes: TEST-OVERLAY-001, TEST-OVERLAY-002, TEST-SCRIPTS-001, TEST-MANIFEST-001.
- [ ] Required navigation: TEST-EXPO-001, TEST-EXPO-003, TEST-EXPO-004, TEST-MOBILE-001, TEST-MOBILE-003, TEST-MOBILE-004.
- [ ] Work that must not happen after rejection or failure: TEST-FORM-002, TEST-FORM-003, TEST-FORM-004, TEST-EXPO-004, TEST-MOBILE-004.
- [ ] Repeated requests: Existing optimistic hooks own query cancellation/invalidation; no new retry behavior is added.
- [ ] Retries: Not applicable beyond the existing query client configuration.
- [ ] Duplicate delivery: Not applicable; no external webhook or queue boundary exists.
- [ ] Existing callers that must keep working: Existing `apps/expo` and `apps/mobile` entries, start scripts, and shared package imports.
- [ ] Stored data that must keep working: Existing todo and todo-item API shapes remain unchanged.
- [ ] Public behavior that must keep working: Existing Vite/Nest scaffolding and native generator selection tests.
- [ ] Loading view: TEST-EXPO-003, TEST-EXPO-004, TEST-MOBILE-003, TEST-MOBILE-004.
- [ ] Empty view: TEST-EXPO-002, TEST-EXPO-003, TEST-EXPO-004, TEST-MOBILE-002, TEST-MOBILE-003, TEST-MOBILE-004.
- [ ] Success view: TEST-FORM-001 and all successful data mutation cases.
- [ ] Error view: TEST-FORM-002 through TEST-FORM-004 and manual query error checks.
- [ ] Retry view: Not applicable; current example query clients disable retries.
- [ ] Values that affect one another, check order, or multiple errors: TEST-FORM-001 through TEST-FORM-004 and table filter/sort state in TEST-EXPO-002 / TEST-MOBILE-002.
- [x] No broad case hides situations that could pass or fail separately.
- [x] No unresolved source conflict blocks implementation; NativeWind v5 without gluestack is the latest confirmed decision.
- [x] No observed test result has been written before its command runs.

## Implementation Plan

- [ ] Establish the Expo compatibility slice.
  - [ ] Write and run TEST-TOOLCHAIN-001 before changing the Expo implementation.
  - [ ] Repair NativeWind v5 CSS-first files and remove gluestack imports.
  - [ ] Add the smallest local UI control and rerun the focused check.
- [ ] Establish the bare RN compatibility slice.
  - [ ] Write and run TEST-TOOLCHAIN-002 before changing the RN implementation.
  - [ ] Add the NativeWind v5 Metro/CSS pipeline and smallest local UI control.
  - [ ] Rerun the focused bundle and typecheck.
- [ ] Build the Expo local UI/form system and screens in route order.
  - [ ] Record focused failures before each correction.
  - [ ] Keep changed TSX files under 300 lines and extract repeated rows/field controls.
- [ ] Build the bare RN local UI/form system and screens in stack order.
  - [ ] Preserve the JS-only canonical app boundary.
  - [ ] Keep changed TSX files under 300 lines and extract repeated rows/field controls.
- [ ] Update generator profiles, script merging, stack metadata, and tests.
  - [ ] Extend fixture trees before changing overlay assertions.
  - [ ] Preserve Vite and Nest profile behavior.
- [ ] Run generated-project and repository verification.
  - [ ] Record every failure in the matching test case before correcting it.
  - [ ] Mark parent items complete only after all child cases pass.

## Verification

- [ ] Confirm implementation followed this checklist.
- [ ] Run each planned case and record results against its test ID.
- [ ] Record observed failures before making corrections.
- [ ] Fix failures, rerun the relevant checks, and record final results.
- [ ] Run `pnpm --filter create-mono-stack test`.
- [ ] Run `pnpm --filter expo typecheck` and Expo bundle/export validation.
- [ ] Run `pnpm --filter mobile typecheck` and RN bundle validation.
- [ ] Run `pnpm exec prettier --check` on changed files.
- [ ] Run `just check`.
- [ ] Review the complete diff and re-scan this checklist for stale items.

## Validation Notes

- TEST-TOOLCHAIN-001: Expo initially failed on missing gluestack modules and then on the lightningcss/CSS parser mismatch. Pinning lightningcss to 1.30.1 and using the documented CSS imports produced a passing Expo export.
- TEST-TOOLCHAIN-002: Mobile initially failed because the RN CLI dependency, project-root resolution, Babel runtime helper resolution, and NativeWind polyfill configuration were incomplete. The corrected RN 0.87 bundle passed and copied 25 assets.
- TEST-TOOLCHAIN-003: A temporary RN 0.86.2 alignment passed, but the fallback was discarded after the corrected hybrid Metro configuration passed on RN 0.87.
- TEST-OVERLAY-001 and TEST-OVERLAY-002: The focused native overlay assertions passed after requiring the expanded config, route, UI, form, and script files.
  - TEST-MANIFEST-001: The focused manifest and template-update tests initially failed on old error/exclusion expectations; updated assertions passed with native app metadata.
  - TEST-GATE-001: `just check` reached the existing `next:lint` task and failed before completing with `Cannot find module 'next/dist/compiled/babel/eslint-parser'`; no native lint/typecheck failure was reported in that run.

## Risks and Follow-Up

- [ ] NativeWind v5 is preview software and bare RN Metro support is less documented than Expo.
- [ ] `react-native-reanimated` and `crypto.randomUUID` compatibility must be validated on the current RN 0.87 runtime.
- [ ] Device/simulator builds require local Xcode or Android tooling and are not part of the ordinary repository gate.
- [ ] A shared native component package remains a separate future task.
