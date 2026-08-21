# Managed App Reference Profiles

- Checklist ID: CHECKLIST-20260821-managed-app-reference-profiles
- Created: 2026-08-21
- Type: Feature correction
- Source request: Managed apps must be flexible across generators and receive their reference code.
- Related checklist: [Project App Package Management](./2026-08-20-project-app-package-management.md)
- Related checklist: [Fix First Update Native Migration](./2026-08-21-fix-first-update-native-migration.md)
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Implementation Description

- Make `manage add-app` use the same generator-specific reference profiles as initial scaffolding.
- Package the canonical profile overlays needed by managed apps.
- Preserve generator-specific dependency and script merge rules.

## Acceptance Criteria

- [x] Every supported managed generator receives its default reference profile.
- [x] Reference code and profile metadata are present after adding an app.
- [x] Existing apps and user files remain unchanged.
- [ ] Managed React Native apps build and produce a Metro bundle.
- [x] The workflow remains extensible through profile definitions rather than generator-specific branching in `addApp`.

## Exact Test Cases

### TEST-MANAGED-001: Assign default profiles to supported generators

- **Small task:** Define the profile for each manageable generator.
- **Source:** `REFERENCE_PROFILES` and initial native scaffold defaults.
- **Test place:** `core/create-mono-stack/test/project-management.test.js`.
- **Starting state:** Manageable app definitions have null profiles for Next, Nest, Expo, and React Native.
- **Exact input or fixture:** Features `web-vite`, `web-next`, `api-nest`, `mobile-expo`, and `mobile-react-native`.
- **Interaction steps:** Add each app using a deterministic generator fixture.
- **Main behavior:** Each app record uses its generator's default profile.
- **Expected result:** Records contain `vite/react-ts`, `next/default`, `nestjs/default`, `expo/default`, and `react-native/default` respectively.
- **Must change:** App records and profile application calls.
- **Must not happen:** A supported generator records `referenceProfile: null`.
- **Planned command:** `node --test core/create-mono-stack/test/project-management.test.js --test-name-pattern='default profiles'`
- **Expected result before the code change:** Only `web-vite` has a default profile.
- **First observed run:** The existing management test failed because its raw generator fixture did not provide `apps/admin-next/package.json` for profile merging.
- **Passing rerun:** `node --test test/project-management.test.js` passed `TEST-MANAGE-001` and all 7 project-management tests.

### TEST-MANAGED-002: Apply reference overlay and package merge

- **Small task:** Apply a packaged reference profile to a managed app.
- **Source:** Existing `applyReferenceProfile` behavior used during initial scaffolding.
- **Test place:** `core/create-mono-stack/test/project-management.test.js`.
- **Starting state:** A generated app has native package metadata and no reference code.
- **Exact input or fixture:** A React Native fixture and `react-native/default` profile assets.
- **Interaction steps:** Run `addApp`, inspect the app files and package JSON.
- **Main behavior:** Reference files replace the profile-owned native source and dependencies merge.
- **Expected result:** `src`, `App.tsx`, `metro.config.js`, and `referenceProfile` are present; native dependencies remain authoritative.
- **Must change:** New app files, package JSON, manifest.
- **Must not happen:** Existing app sentinel files are changed.
- **Planned command:** `node --test core/create-mono-stack/test/project-management.test.js --test-name-pattern='reference overlay'`
- **Expected result before the code change:** New app has only raw CLI files and no reference profile.
- **First observed run:** The React Native profile test failed because overlay entries still copied from the generated app path instead of the packaged profile asset root.
- **Passing rerun:** `node --test test/project-management.test.js` passed `TEST-MANAGE-007`; `pnpm --filter create-mono-stack test:integration` also passed the generated-project flow.

### TEST-MANAGED-003: Preserve existing apps while adding a profiled app

- **Small task:** Verify the flexible workflow does not replace existing apps.
- **Source:** Existing project-management preservation contract.
- **Test place:** `core/create-mono-stack/test/project-management.test.js`.
- **Starting state:** Existing `apps/web/sentinel.txt` and `apps/server` are present.
- **Exact input or fixture:** Add `mobile-react-native` as `mobileApp3`.
- **Interaction steps:** Run `addApp`, inspect existing files and manifest.
- **Main behavior:** A new profiled app is added beside existing apps.
- **Expected result:** Existing sentinel remains unchanged and the manifest contains the new app.
- **Must change:** Only the new app, manifest, and lock/install outputs.
- **Must not happen:** Existing app directories are deleted or overlaid.
- **Planned command:** `node --test core/create-mono-stack/test/project-management.test.js --test-name-pattern='preserves existing apps'`
- **Expected result before the code change:** Existing preservation is covered only for an unprofiled Next app.
- **First observed run:** Covered by the existing preservation test and the new React Native profile test.
- **Passing rerun:** `node --test test/project-management.test.js` passed the preservation and profiled-app tests.

### TEST-MANAGED-004: Build and bundle a managed React Native app

- **Small task:** Verify the public managed-app boundary for React Native.
- **Source:** `mobileApp3` failure and Android Metro 500 report.
- **Test place:** Managed-app integration fixture.
- **Starting state:** A generated project has existing apps and no new app.
- **Exact input or fixture:** Add `mobileApp3` with the `mobile-react-native` profile.
- **Interaction steps:** Add the app, install dependencies, build Android, request the Android bundle.
- **Main behavior:** The managed app uses the same reference setup as an initially scaffolded app.
- **Expected result:** Android build succeeds and Metro returns HTTP `200`.
- **Must change:** New app and manifest only.
- **Must not happen:** Manual dependency or Metro edits are required.
- **Planned command:** `pnpm --filter mobileApp3 android`
- **Expected result before the code change:** Build fails with missing RN dependencies or Metro returns HTTP `500` for `@babel/runtime`.
- **First observed run:** `pnpm --filter mobileApp3 android` first failed on missing `@react-native/gradle-plugin`, then codegen, then incompatible safe-area context; Metro returned HTTP `500` for `@babel/runtime`.
- **Passing rerun:** Not run yet; Android/Metro validation remains pending against regenerated `ancd/mobileApp3`.

## Implementation Steps

- [x] Package canonical overlay assets for supported profiles.
- [x] Add managed profile metadata and reuse the existing profile application engine.
- [x] Apply profiles during `addApp` before manifest write and install.
- [x] Add focused unit and integration coverage.
- [ ] Regenerate `ancd/mobileApp3` through the corrected manager and commit the generated project separately.

## Validation Notes

- `pnpm --filter create-mono-stack test` passed 254/255 tests; one interactive wizard test timed out once and passed when rerun in isolation.
- `pnpm --filter create-mono-stack lint` initially failed because packaged Next assets were linted without their app dependencies; the launcher asset directory is now excluded from workspace lint, and lint passes.
- `pnpm --filter create-mono-stack test:integration` passed before and after separating managed packaged assets from initial live-template assets.
- `npm pack --dry-run` confirmed `reference-templates/managed/**` is included in the `create-mono-stack@0.1.19` package; no database file is packaged.
