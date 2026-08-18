# Add Vite framework reference templates

Checklist ID: `VITE-FRAMEWORK-REFERENCES-2026-08-17`

Status legend: `[ ]` pending, `[x]` complete, `[/]` partial.

Related checklists:

- [Observe Vite wizard selections](./2026-08-16-observe-vite-wizard-selections.md)
- [Isolate the Vite reference app](./2026-08-16-isolate-vite-reference-app.md)
- [Portable Vite wizard transport](./2026-08-16-portable-vite-wizard-transport.md)

## Decision and scope

The user selected code-only references. React Router v7, TanStack Router, RedwoodSDK, and Vike receive separate framework-specific code under `reference/`. These references do not add or replace configuration, dependencies, or scripts and are not promised to build independently. The existing plain React TypeScript profile remains the independently runnable reference profile.

Network calls, authorization, persistence, APIs, loading states, and error views do not apply. Profile tests use deterministic local fixtures. Current official `create-vite` source confirms that these choices delegate to separate framework CLIs; runtime observation remains authoritative and this repository does not copy Vite's full option catalog.

## Acceptance criteria and task map

| Small task                                                        | Test               |
| ----------------------------------------------------------------- | ------------------ |
| Select React Router v7 from observation and generated evidence    | TEST-PROFILE-101   |
| Select TanStack Router from observation and generated evidence    | TEST-PROFILE-102   |
| Select RedwoodSDK from observation and generated evidence         | TEST-PROFILE-103   |
| Select Vike from observation and generated evidence               | TEST-PROFILE-104   |
| Reject a matching label without generated dependency evidence     | TEST-PROFILE-105   |
| Copy a distinct code-only reference without touching native files | TEST-REFERENCE-101 |
| Preserve the native package exactly except for its final name     | TEST-REFERENCE-102 |
| Keep plain React TypeScript reference behavior unchanged          | TEST-REFERENCE-103 |
| Include all code-only templates in the published launcher package | TEST-PACKAGE-101   |
| Accept all four profile identifiers in generated stack metadata   | TEST-MANIFEST-101  |
| Document code-only limitations and profile mapping                | TEST-DOCS-101      |
| Keep the existing post-generation install instruction covered     | TEST-CLI-101       |

## Exact test cases

### TEST-PROFILE-101

- **Small task:** Select the React Router v7 code profile.
- **Source:** User request and Vite's official `React Router v7` delegated variant.
- **Test place:** `core/create-mono-stack/test/reference-profiles.test.js`.
- **Starting state:** A generated package contains `react`, `react-dom`, and `react-router`.
- **Exact input or fixture:** Observation `{ framework: "React", variant: "React Router v7" }`.
- **Interaction steps:** Detect a reference profile from the observation and package.
- **Main behavior:** Return `vite/react-router-v7`.
- **Expected result:** The React Router profile is selected.
- **Must change:** Nothing; detection is read-only.
- **Must not happen:** The plain React or another delegated profile is selected.
- **Planned command:** `node --test test/reference-profiles.test.js`.
- **Expected result before the code change:** Fails because the profile does not exist.
- **First observed run:** Failed because `vite/react-router-v7` did not exist.
- **Passing rerun:** Passed detection and isolated copy assertions.

### TEST-PROFILE-102

- **Small task:** Select the TanStack Router code profile.
- **Source:** User request and Vite's official `TanStack Router` delegated variant.
- **Test place:** `core/create-mono-stack/test/reference-profiles.test.js`.
- **Starting state:** A generated package contains `react`, `react-dom`, and `@tanstack/react-router`.
- **Exact input or fixture:** Observation `{ framework: "React", variant: "TanStack Router" }`.
- **Interaction steps:** Detect a reference profile from the observation and package.
- **Main behavior:** Return `vite/tanstack-router`.
- **Expected result:** The TanStack profile is selected.
- **Must change:** Nothing; detection is read-only.
- **Must not happen:** The plain React or another delegated profile is selected.
- **Planned command:** `node --test test/reference-profiles.test.js`.
- **Expected result before the code change:** Fails because the profile does not exist.
- **First observed run:** Failed because `vite/tanstack-router` did not exist.
- **Passing rerun:** Passed detection and isolated copy assertions.

### TEST-PROFILE-103

- **Small task:** Select the RedwoodSDK code profile.
- **Source:** User request and Vite's official `RedwoodSDK` delegated variant.
- **Test place:** `core/create-mono-stack/test/reference-profiles.test.js`.
- **Starting state:** A generated package contains `react`, `react-dom`, and `rwsdk`.
- **Exact input or fixture:** Observation `{ framework: "React", variant: "RedwoodSDK" }`.
- **Interaction steps:** Detect a reference profile from the observation and package.
- **Main behavior:** Return `vite/redwood-sdk`.
- **Expected result:** The RedwoodSDK profile is selected.
- **Must change:** Nothing; detection is read-only.
- **Must not happen:** The plain React or another delegated profile is selected.
- **Planned command:** `node --test test/reference-profiles.test.js`.
- **Expected result before the code change:** Fails because the profile does not exist.
- **First observed run:** Failed because `vite/redwood-sdk` did not exist.
- **Passing rerun:** Passed detection and isolated copy assertions.

### TEST-PROFILE-104

- **Small task:** Select the Vike code profile.
- **Source:** User request and Vite's official `Vike` delegated variant.
- **Test place:** `core/create-mono-stack/test/reference-profiles.test.js`.
- **Starting state:** A generated package contains `react`, `react-dom`, and `vike`.
- **Exact input or fixture:** Observation `{ framework: "React", variant: "Vike" }`.
- **Interaction steps:** Detect a reference profile from the observation and package.
- **Main behavior:** Return `vite/vike`.
- **Expected result:** The Vike profile is selected.
- **Must change:** Nothing; detection is read-only.
- **Must not happen:** The plain React or another delegated profile is selected.
- **Planned command:** `node --test test/reference-profiles.test.js`.
- **Expected result before the code change:** Fails because the profile does not exist.
- **First observed run:** Failed because `vite/vike` did not exist.
- **Passing rerun:** Passed detection and isolated copy assertions.

### TEST-PROFILE-105

- **Small task:** Require generated evidence for a delegated profile.
- **Source:** Existing observed-selection safety boundary.
- **Test place:** `core/create-mono-stack/test/reference-profiles.test.js`.
- **Starting state:** A generated plain React package has no delegated framework dependency.
- **Exact input or fixture:** Each of the four delegated labels paired with the plain package.
- **Interaction steps:** Detect each profile.
- **Main behavior:** Reject the profile whose dependency evidence is absent.
- **Expected result:** Every row returns `null`.
- **Must change:** Nothing.
- **Must not happen:** No label alone enables reference copying.
- **Planned command:** `node --test test/reference-profiles.test.js`.
- **Expected result before the code change:** Existing detection cannot distinguish these labels and profiles.
- **First observed run:** Passed before implementation, guarding the fail-closed boundary.
- **Passing rerun:** Passed after all delegated profiles were added.

### TEST-REFERENCE-101

- **Small task:** Copy distinct code-only reference assets while preserving the native scaffold.
- **Source:** User-selected code-only option and prior no-replacement requirement.
- **Test place:** `core/create-mono-stack/test/native-scaffold-overlays.test.js`.
- **Starting state:** Each native fixture has a distinct `src` marker and matching framework dependency.
- **Exact input or fixture:** Four observed delegated variants.
- **Interaction steps:** Scaffold each app and inspect its native marker and `reference/` tree.
- **Main behavior:** Copy the matching framework's code marker.
- **Expected result:** Each `reference/` contains only its profile's files and native markers remain unchanged.
- **Must change:** `reference/` and the final package name.
- **Must not happen:** No native source, configuration, dependency, or script is replaced.
- **Planned command:** `node --test test/native-scaffold-overlays.test.js`.
- **Expected result before the code change:** Fails because the profiles and assets do not exist.
- **First observed run:** Failed because no delegated profiles or packaged source trees existed.
- **Passing rerun:** Passed for all four distinct markers and preserved native file assertions.

### TEST-REFERENCE-102

- **Small task:** Keep delegated native package contents authoritative.
- **Source:** User selected code-only references, not runnable overlays.
- **Test place:** `core/create-mono-stack/test/native-scaffold-overlays.test.js`.
- **Starting state:** A delegated native package contains custom scripts, dependency versions, and metadata.
- **Exact input or fixture:** TanStack Router selection with a native-only package marker.
- **Interaction steps:** Apply the profile and read the final package.
- **Main behavior:** Change only the temporary package name.
- **Expected result:** Scripts, dependencies, development dependencies, and metadata exactly match the native values.
- **Must change:** `name` only.
- **Must not happen:** No reference lifecycle script or template dependency is added.
- **Planned command:** `node --test test/native-scaffold-overlays.test.js`.
- **Expected result before the code change:** Fails because no delegated code-only merge policy exists.
- **First observed run:** Failed because no delegated code-only merge policy existed.
- **Passing rerun:** Passed exact native package equality with only the final name changed.

### TEST-REFERENCE-103

- **Small task:** Preserve the plain React TypeScript runnable reference.
- **Source:** Existing accepted behavior from the isolation checklist.
- **Test place:** Existing profile and overlay regression tests.
- **Starting state:** A plain React TypeScript native fixture and observation.
- **Exact input or fixture:** Variant `TypeScript` with `src/main.tsx` evidence.
- **Interaction steps:** Scaffold and inspect profile, reference files, dependencies, and scripts.
- **Main behavior:** Continue selecting `vite/react-ts` and merging its runnable reference requirements.
- **Expected result:** Existing assertions remain green.
- **Must change:** Nothing beyond established reference behavior.
- **Must not happen:** Delegated profile work weakens or reroutes the plain profile.
- **Planned command:** `node --test test/reference-profiles.test.js test/native-scaffold-overlays.test.js`.
- **Expected result before the code change:** Passes; this is a regression guard.
- **First observed run:** Passed before implementation as a regression guard.
- **Passing rerun:** Passed after delegated profile implementation.

### TEST-PACKAGE-101

- **Small task:** Ship code-only template assets with the npm launcher.
- **Source:** Launcher execution must work when installed rather than run from the repository.
- **Test place:** `core/create-mono-stack/test/publish.test.js` or a package manifest assertion.
- **Starting state:** `core/create-mono-stack/package.json` defines the published file list.
- **Exact input or fixture:** The `reference-templates` asset directory.
- **Interaction steps:** Inspect the package file allowlist.
- **Main behavior:** Include the asset directory.
- **Expected result:** `files` contains `reference-templates`.
- **Must change:** Package allowlist only.
- **Must not happen:** No publish, registry call, or version change.
- **Planned command:** `node --test test/publish.test.js`.
- **Expected result before the code change:** Fails because the directory is not packaged.
- **First observed run:** Failed because `reference-templates` was absent from the package allowlist.
- **Passing rerun:** Passed the manifest assertion; a real tarball listed all four source trees.

### TEST-DOCS-101

- **Small task:** Explain delegated code-only reference behavior.
- **Source:** User selected option 2 and users must not infer build guarantees.
- **Test place:** `core/create-mono-stack/test/copier-template.test.js` exact documentation scan.
- **Starting state:** Generated and launcher documentation describe only plain React TypeScript reference mode.
- **Exact input or fixture:** React Router v7, TanStack Router, RedwoodSDK, and Vike profile names plus `code-only` limitation text.
- **Interaction steps:** Scan both documentation sources.
- **Main behavior:** Document all profile names and the lack of configuration/lifecycle changes.
- **Expected result:** Exact assertions find all four names and the limitation.
- **Must change:** Documentation only.
- **Must not happen:** Documentation promises independent build or development support.
- **Planned command:** `node --test test/copier-template.test.js`.
- **Expected result before the code change:** Fails because these profiles are not documented.
- **First observed run:** Failed because the delegated profiles and code-only limitation were undocumented.
- **Passing rerun:** Passed across source, launcher, and generated-project documentation.

### TEST-MANIFEST-101

- **Small task:** Accept every delegated profile in generated stack metadata.
- **Source:** Generated apps record the selected reference profile in `.mono-stack.json`.
- **Test place:** `core/create-mono-stack/test/stack-config.test.js`.
- **Starting state:** A valid schema-version-3 stack manifest contains one Vite app.
- **Exact input or fixture:** Each profile identifier: `vite/react-router-v7`, `vite/tanstack-router`, `vite/redwood-sdk`, and `vite/vike`.
- **Interaction steps:** Validate the manifest once per identifier.
- **Main behavior:** Accept each identifier for `web-vite`.
- **Expected result:** Validation returns the manifest without error.
- **Must change:** Nothing; validation is read-only.
- **Must not happen:** Unknown profile identifiers become accepted.
- **Planned command:** `node --test test/stack-config.test.js`.
- **Expected result before the code change:** Fails because the validator knows only `vite/react-ts`.
- **First observed run:** Failed because `vite/react-router-v7` was unknown to stack validation.
- **Passing rerun:** Passed for all four delegated profile identifiers.

### TEST-CLI-101

- **Small task:** Keep the existing post-generation install instruction covered by its CLI snapshot.
- **Source:** `main()` currently instructs users to run `pnpm install`, and project documentation shows the same required step.
- **Test place:** `core/create-mono-stack/test/cli.test.js`.
- **Starting state:** The wizard completes with a mocked project creation.
- **Exact input or fixture:** Empty CLI arguments in a TTY with destination `/workspace/acme-platform`.
- **Interaction steps:** Run `main()` and capture the completion message.
- **Main behavior:** Include `pnpm install` before Git staging.
- **Expected result:** The assertion matches the existing completion output.
- **Must change:** The stale expected message only.
- **Must not happen:** Production completion behavior changes.
- **Planned command:** `node --test --test-name-pattern="opens the project wizard" test/cli.test.js`.
- **Expected result before the code change:** Fails because the expected message omits the existing install instruction.
- **First observed run:** Failed with exactly one added `pnpm install` output line.
- **Passing rerun:** Passed after synchronizing the stale expected message.

## Implementation and validation

Validation notes:

- The first focused run failed for all four missing profile detections and copies, and for the missing npm package allowlist entry. The plain React regression and missing-evidence rejection already passed.
- The manifest and documentation baseline also failed as planned: delegated profile identifiers were unknown and none of the four code-only references or their limitation was documented.
- The first implementation rerun passed every profile, copy, package, and manifest case. The documentation case found the correct sentence split across a Markdown line break and its negative assertion could mistake “not independently runnable” for a promise; the assertion was corrected to accept whitespace and require the explicit negative wording.
- The attempted npm artifact check `pnpm pack --dry-run` failed because pnpm 9 does not support that option. Validation will instead pack into an ephemeral `/tmp` directory and inspect the tarball without publishing.
- The real tarball inspection passed and listed all four template directories. The first repository-wide gate then reached formatting and reported three changed files; no lint or typecheck errors occurred before that formatting stop.
- After formatting, the gate reached the launcher suite and exposed an unrelated stale CLI snapshot that omitted the production `pnpm install` next step. A focused rerun reproduced the same one-line mismatch; production behavior will remain unchanged and only the assertion will be synchronized.
- Final `just check` passed lint, typecheck, formatting, skill checks/tests, and all 215 launcher/template tests. Final review found no configuration replacement, package mutation, profile ambiguity, packaging omission, or validation bypass.

- [x] Add focused failing profile, copy, package, and documentation tests.
- [x] Add four source-only framework templates to the launcher package.
- [x] Make profile detection consider observation and matching generated dependencies.
- [x] Add code-only copy and package-preservation behavior.
- [x] Update stack manifest validation for the four profile identifiers.
- [x] Document the supported profiles and explicit limitation.
- [x] Run focused tests, package tests, formatting, and `just check`.

## Risks

- Delegated framework CLIs can change their generated dependency names; missing evidence must fail closed rather than copy the wrong reference.
- Code-only references may require manual integration into the native framework and must never be presented as independently runnable.
- Template assets must be included in npm packaging without triggering a release or version change.
