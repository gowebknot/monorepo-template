# Feature: Observe Vite Wizard Selections

Checklist ID: `CHECKLIST-VITE-WIZARD-OBSERVATION-2026-08-16`

Related history:

- [Native Vite and NestJS scaffolding](./2026-08-12-native-vite-nest-scaffolding.md)
- [Hybrid native reference profiles](./2026-08-12-hybrid-native-reference-profiles.md)
- [Complete hybrid native reference generation](./2026-08-14-complete-hybrid-native-reference-generation.md)

## Goal and acceptance criteria

- [x] Run the existing interactive Vite command without supplying a framework or variant.
- [x] Keep Vite attached to a real terminal while forwarding user input and Vite output unchanged.
- [x] Observe confirmed framework, variant, and linter labels without maintaining a Vite catalog.
- [x] Keep the raw terminal transcript in memory only and bound its size.
- [x] Never fail project creation merely because prompt observation cannot identify a selection.
- [x] Apply `vite/react-ts` only when both the observed choices and generated files identify the
      supported React TypeScript scaffold.
- [x] Store successfully observed Vite choices in `.mono-stack.json` without breaking existing
      schema-version-3 projects or template updates.
- [x] Preserve the existing cleanup behavior when Vite itself fails.

## Scope and constraints

- [x] Use a pseudo-terminal so Vite still sees an interactive terminal; ordinary output pipes are not
      sufficient because they change terminal detection.
- [x] Keep command and argument execution array-based and never interpolate user input into a shell.
- [x] Do not copy Vite's framework or variant catalog into this repository.
- [x] Do not record raw keystrokes or persist the raw terminal transcript.
- [x] Do not add support for the currently deferred Next.js, Express, Expo, or React Native generators
      in this change; they need their own generator-specific plans and tests.
- [x] Use deterministic fake terminal sessions in ordinary tests; do not contact npm or Vite's remote
      packages.

## Small tasks and test map

| Small task                                              | Tests                                                               |
| ------------------------------------------------------- | ------------------------------------------------------------------- |
| Read current Vite confirmation lines                    | TEST-VITE-OBSERVE-001, TEST-VITE-OBSERVE-002                        |
| Tolerate unknown or incomplete Vite output              | TEST-VITE-OBSERVE-003                                               |
| Forward terminal input and output unchanged             | TEST-VITE-PTY-001                                                   |
| Bound captured output and avoid raw persistence         | TEST-VITE-PTY-002                                                   |
| Propagate a Vite process failure                        | TEST-VITE-PTY-003                                                   |
| Restore the parent input lifecycle                      | TEST-VITE-PTY-004                                                   |
| Record observed choices in generated metadata           | TEST-VITE-MANIFEST-001                                              |
| Require observed and generated evidence for the profile | TEST-VITE-PROFILE-001, TEST-VITE-PROFILE-002, TEST-VITE-PROFILE-003 |
| Document the observation and fallback behavior          | TEST-VITE-DOCS-001                                                  |

## Exact test cases

### TEST-VITE-OBSERVE-001

- **Small task:** Read framework and variant labels from a completed Vite wizard transcript.
- **Source:** User request to intercept Vite's wizard for reading only; current Vite prompt labels.
- **Test place:** Unit test in `core/create-mono-stack/test/vite-wizard-observer.test.js`.
- **Starting state:** No previous observed answers.
- **Exact input or fixture:** An ANSI-colored transcript containing completed `Select a framework:` →
  `React` and `Select a variant:` → `TypeScript` prompts.
- **Interaction steps:** Pass the transcript chunks to the observer and finish observation.
- **Main behavior:** Extract the two confirmed labels.
- **Expected result:** `{ framework: "React", variant: "TypeScript" }`.
- **Must change:** The returned observation contains those two strings.
- **Must not happen:** No framework catalog lookup and no filesystem write occur.
- **Planned command:** `node --test core/create-mono-stack/test/vite-wizard-observer.test.js`.
- **Expected result before the code change:** The test fails because the observer module does not exist.
- **First observed run:** `node --test core/create-mono-stack/test/vite-wizard-observer.test.js`
  failed with `ERR_MODULE_NOT_FOUND` because `src/vite-wizard-observer.js` did not exist.
- **Passing rerun:** `node --test core/create-mono-stack/test/vite-wizard-observer.test.js`
  passed all 3 observer cases.

### TEST-VITE-OBSERVE-002

- **Small task:** Read the optional linter label from a completed React Vite wizard transcript.
- **Source:** Current Vite React wizard asks which linter to use.
- **Test place:** Unit test in `core/create-mono-stack/test/vite-wizard-observer.test.js`.
- **Starting state:** Framework and variant confirmation lines are present.
- **Exact input or fixture:** The TEST-VITE-OBSERVE-001 transcript plus `Which linter to use?` →
  `ESLint`.
- **Interaction steps:** Pass the transcript in chunks that split the prompt text across chunk
  boundaries, then finish observation.
- **Main behavior:** Extract a linter even when terminal chunks split prompt text.
- **Expected result:** The result also contains `linter: "ESLint"`.
- **Must change:** The returned observation gains one linter field.
- **Must not happen:** Chunk boundaries must not lose or duplicate text.
- **Planned command:** `node --test core/create-mono-stack/test/vite-wizard-observer.test.js`.
- **Expected result before the code change:** The test fails because the observer module does not exist.
- **First observed run:** The focused observer command failed before running cases because the planned
  observer module did not exist.
- **Passing rerun:** The focused observer command passed, including the chunk-boundary case.

### TEST-VITE-OBSERVE-003

- **Small task:** Treat changed or incomplete Vite output as unknown.
- **Source:** Agreed fail-safe behavior when Vite changes its prompts.
- **Test place:** Unit test in `core/create-mono-stack/test/vite-wizard-observer.test.js`.
- **Starting state:** No previous observed answers.
- **Exact input or fixture:** `Vite is ready` with no known completed prompt.
- **Interaction steps:** Pass the text to the observer and finish observation.
- **Main behavior:** Return no claimed selection.
- **Expected result:** `null`.
- **Must change:** Nothing outside the returned value.
- **Must not happen:** No exception and no guessed framework or variant.
- **Planned command:** `node --test core/create-mono-stack/test/vite-wizard-observer.test.js`.
- **Expected result before the code change:** The test fails because the observer module does not exist.
- **First observed run:** The focused observer command failed before running cases because the planned
  observer module did not exist.
- **Passing rerun:** The focused observer command passed and returned `null` without throwing.

### TEST-VITE-PTY-001

- **Small task:** Forward terminal bytes without changing them.
- **Source:** User preference to read Vite's wizard without changing commands or input.
- **Test place:** Unit test in `core/create-mono-stack/test/interactive-command.test.js`.
- **Starting state:** A fake pseudo-terminal process and fake input/output streams are connected.
- **Exact input or fixture:** Command `pnpm`, arguments `create vite vite-web --no-immediate`, output
  bytes `Select a framework`, and input bytes representing one down-arrow plus Enter.
- **Interaction steps:** Start the runner, emit output, emit input, and close with exit code `0`.
- **Main behavior:** Forward the same bytes in both directions.
- **Expected result:** The output stream receives the exact Vite bytes, and the child receives the exact
  input bytes in their original order.
- **Must change:** Only the connected terminal streams and in-memory observation change.
- **Must not happen:** No shell command, rewritten input, raw-key log, or filesystem write.
- **Planned command:** `node --test core/create-mono-stack/test/interactive-command.test.js`.
- **Expected result before the code change:** The test fails because the interactive runner does not
  exist.
- **First observed run:** `node --test core/create-mono-stack/test/interactive-command.test.js`
  failed with `ERR_MODULE_NOT_FOUND` because `src/interactive-command.js` did not exist.
- **Passing rerun:** The focused proxy suite passed and verified unchanged arguments and terminal bytes.

### TEST-VITE-PTY-002

- **Small task:** Bound the observed terminal output.
- **Source:** Security and privacy requirement to avoid retaining an unbounded transcript.
- **Test place:** Unit test in `core/create-mono-stack/test/interactive-command.test.js`.
- **Starting state:** A fake pseudo-terminal is running with an observer capture limit of 32 bytes.
- **Exact input or fixture:** Two output chunks whose combined length is 64 bytes.
- **Interaction steps:** Emit both chunks and close with exit code `0`.
- **Main behavior:** Retain only the latest 32 bytes for parsing while forwarding all 64 bytes.
- **Expected result:** The visible output is complete and the observer receives no more than 32 bytes.
- **Must change:** The bounded in-memory observation contains only the allowed suffix.
- **Must not happen:** Output shown to the user must not be truncated and no transcript file is created.
- **Planned command:** `node --test core/create-mono-stack/test/interactive-command.test.js`.
- **Expected result before the code change:** The test fails because the interactive runner does not
  exist.
- **First observed run:** The focused terminal-runner command failed before running cases because the
  planned runner module did not exist.
- **Passing rerun:** The focused proxy suite passed; visible output stayed complete while parsing used
  bounded in-memory state.

### TEST-VITE-PTY-003

- **Small task:** Preserve a Vite process failure.
- **Source:** Existing native scaffold failure and cleanup contract.
- **Test place:** Unit test in `core/create-mono-stack/test/interactive-command.test.js`.
- **Starting state:** A fake pseudo-terminal is running.
- **Exact input or fixture:** The child exits with code `1` after writing `Vite failed`.
- **Interaction steps:** Start the runner, emit the error text, and close with code `1`.
- **Main behavior:** Reject the command with a clear failure.
- **Expected result:** The returned promise rejects with an error naming `pnpm` and exit code `1`.
- **Must change:** Error control flow reaches existing project cleanup.
- **Must not happen:** A failed command must not be reported as successful.
- **Planned command:** `node --test core/create-mono-stack/test/interactive-command.test.js`.
- **Expected result before the code change:** The test fails because the interactive runner does not
  exist.
- **First observed run:** The focused terminal-runner command failed before running cases because the
  planned runner module did not exist.
- **Passing rerun:** The focused proxy suite passed and preserved the non-zero exit failure.

### TEST-VITE-PTY-004

- **Small task:** Restore the parent input stream's paused state after Vite exits.
- **Source:** Final code review found that a resumed standard-input stream can keep the launcher alive.
- **Test place:** Unit test in `core/create-mono-stack/test/interactive-command.test.js`.
- **Starting state:** The fake parent input stream is paused before the interactive command starts.
- **Exact input or fixture:** A fake Vite terminal that exits successfully with code `0`.
- **Interaction steps:** Start the runner, close the child, and await the result.
- **Main behavior:** Restore the input stream to paused after cleanup.
- **Expected result:** `input.isPaused()` is `true` after the promise resolves.
- **Must change:** Temporary listeners and raw mode are removed or restored.
- **Must not happen:** The parent input stream must not stay active and keep the process alive.
- **Planned command:** `node --test core/create-mono-stack/test/interactive-command.test.js`.
- **Expected result before the code change:** The new assertion fails because cleanup restores raw mode
  but does not pause input.
- **First observed run:** `node --test core/create-mono-stack/test/interactive-command.test.js`
  ran four cases; the new lifecycle case failed because input remained active after child exit.
- **Passing rerun:** The focused proxy suite passed 4/4 after restoring the paused input state.

### TEST-VITE-MANIFEST-001

- **Small task:** Store successfully observed Vite choices in generated app metadata.
- **Source:** User request to probe the selections dynamically at runtime.
- **Test place:** Filesystem-backed unit test in
  `core/create-mono-stack/test/native-scaffold-selection.test.js` and manifest validation test in
  `core/create-mono-stack/test/stack-config.test.js`.
- **Starting state:** The selected feature is `web-vite`; the fake Vite session reports React,
  TypeScript, and ESLint; the generated fixture is React TypeScript.
- **Exact input or fixture:** Observation
  `{ framework: "React", variant: "TypeScript", linter: "ESLint" }`.
- **Interaction steps:** Scaffold the app and serialize/read `.mono-stack.json` app metadata.
- **Main behavior:** Preserve the observed labels as optional Vite selection metadata.
- **Expected result:** The Vite app record contains the exact observation and remains valid schema
  version 3.
- **Must change:** Only the Vite app record gains `selection`.
- **Must not happen:** Existing schema-version-3 manifests without `selection` must not fail.
- **Planned command:** `node --test core/create-mono-stack/test/native-scaffold-selection.test.js core/create-mono-stack/test/stack-config.test.js`.
- **Expected result before the code change:** The test fails because scaffold results do not carry
  observed selections and the manifest validator does not validate them.
- **First observed run:** The focused native-scaffold command failed because Vite app records did not
  contain the observed selection.
- **Passing rerun:** The native scaffold and manifest suite passed with optional selection metadata and
  legacy manifests.

### TEST-VITE-PROFILE-001

- **Small task:** Apply the React TypeScript profile when observation and files agree.
- **Source:** Agreed profile safety rule and existing `vite/react-ts` profile.
- **Test place:** Filesystem-backed test in
  `core/create-mono-stack/test/native-scaffold-overlays.test.js`.
- **Starting state:** Generated dependencies and files match React TypeScript.
- **Exact input or fixture:** Observed framework `React` and variant `TypeScript`.
- **Interaction steps:** Scaffold the Vite app and inspect its record and overlaid source.
- **Main behavior:** Apply `vite/react-ts`.
- **Expected result:** The record names `vite/react-ts` and the reference files are present.
- **Must change:** The supported reference overlay is applied.
- **Must not happen:** Observation must not be discarded.
- **Planned command:** `node --test core/create-mono-stack/test/native-scaffold-overlays.test.js`.
- **Expected result before the code change:** Existing file-only detection passes, but the new observed
  selection assertion fails.
- **First observed run:** The focused overlay command failed because file-only detection applied the
  React profile despite the observed Vue selection.
- **Passing rerun:** The focused overlay suite passed and applied `vite/react-ts` when both sources agreed.

### TEST-VITE-PROFILE-002

- **Small task:** Skip the profile when observed selection and generated files disagree.
- **Source:** Agreed fail-closed profile behavior.
- **Test place:** Filesystem-backed test in
  `core/create-mono-stack/test/native-scaffold-overlays.test.js`.
- **Starting state:** Generated fixture resembles React TypeScript.
- **Exact input or fixture:** Observed framework `Vue` and variant `TypeScript`.
- **Interaction steps:** Scaffold the Vite app and inspect its record and source.
- **Main behavior:** Refuse the React profile because observed and generated evidence conflict.
- **Expected result:** `referenceProfile` is `null`, selection is retained, and native source remains.
- **Must change:** The record captures the observation.
- **Must not happen:** React reference files must not replace the native source.
- **Planned command:** `node --test core/create-mono-stack/test/native-scaffold-overlays.test.js`.
- **Expected result before the code change:** The test fails because file-only detection applies the
  React profile despite the conflicting observation.
- **First observed run:** The focused overlay command failed because file-only detection applied the
  React profile despite the observed Oxlint selection.
- **Passing rerun:** The focused overlay suite passed and retained native source for conflicting evidence.

### TEST-VITE-PROFILE-003

- **Small task:** Preserve the selected Vite linter.
- **Source:** Vite's current React wizard offers ESLint or Oxlint; the existing reference profile is
  ESLint-specific.
- **Test place:** Filesystem-backed test in
  `core/create-mono-stack/test/native-scaffold-overlays.test.js`.
- **Starting state:** Generated files match React TypeScript with Oxlint.
- **Exact input or fixture:** Observed framework `React`, variant `TypeScript`, and linter `Oxlint`.
- **Interaction steps:** Scaffold the Vite app and inspect its record and source.
- **Main behavior:** Keep the native app because applying the profile would replace the chosen linter.
- **Expected result:** `referenceProfile` is `null`, selection is retained, and native source remains.
- **Must change:** The record captures the Oxlint choice.
- **Must not happen:** ESLint reference configuration must not replace Oxlint.
- **Planned command:** `node --test core/create-mono-stack/test/native-scaffold-overlays.test.js`.
- **Expected result before the code change:** The test fails because file-only detection applies the
  React profile without knowing the selected linter.
- **First observed run:** `node --test core/create-mono-stack/test/copier-template.test.js`
  failed because both README files lacked the planned explanation. The same run also exposed the
  exact launcher dependency assertion, which needed the new workspace-local `node-pty` dependency in
  its expected value.
- **Passing rerun:** The focused overlay suite passed and retained native Oxlint configuration.

### TEST-VITE-DOCS-001

- **Small task:** Explain Vite-owned selection observation and fallback behavior.
- **Source:** User-facing behavior change.
- **Test place:** Exact-text assertions in `core/create-mono-stack/test/copier-template.test.js`.
- **Starting state:** Launcher and root README describe interactive Vite but not observation.
- **Exact input or fixture:** Root and launcher README content.
- **Interaction steps:** Read both files through the existing template test.
- **Main behavior:** Document that Vite owns the wizard and unknown choices remain native.
- **Expected result:** Both documents contain those two facts without claiming a maintained catalog.
- **Must change:** Documentation describes the observable behavior.
- **Must not happen:** Documentation must not claim that `create-mono-stack` selects Vite variants.
- **Planned command:** `node --test core/create-mono-stack/test/copier-template.test.js`.
- **Expected result before the code change:** The new assertions fail because the text is absent.
- **First observed run:** Pending.
- **Passing rerun:** The Copier/template documentation suite passed 14/14.

## Missing-case review

- [x] Success paths map to TEST-VITE-OBSERVE-001/002, TEST-VITE-PTY-001,
      TEST-VITE-MANIFEST-001, and TEST-VITE-PROFILE-001.
- [x] Unknown prompt output maps to TEST-VITE-OBSERVE-003.
- [x] Dependency/process failure maps to TEST-VITE-PTY-003 and existing project-cleanup tests.
- [x] Conflicting evidence maps to TEST-VITE-PROFILE-002 and linter preservation maps to
      TEST-VITE-PROFILE-003.
- [x] Bounded sensitive data handling maps to TEST-VITE-PTY-002.
- [x] Missing optional selection remains covered by existing schema-version-3 manifest tests.
- [x] Duplicate app selection does not apply because this change preserves the existing one-app-per-
      feature contract.
- [x] Live external network behavior is excluded from ordinary tests and remains owned by the explicit
      integration command.

## Implementation steps

- [x] Add focused observer tests and record their first failure.
- [x] Implement ANSI-safe, catalog-free prompt observation.
- [x] Add focused pseudo-terminal runner tests and record their first failure.
- [x] Add the repository-local pseudo-terminal dependency and implement byte-for-byte forwarding with
      bounded in-memory observation.
- [x] Route only Vite scaffolding through the interactive runner; leave other commands unchanged.
- [x] Add manifest and profile tests and record their first failures.
- [x] Carry optional selection metadata through native scaffolding and validate it on manifest reads.
- [x] Require observed and generated evidence to agree before applying the Vite profile.
- [x] Add documentation assertions, record their first failure, and update documentation.
- [x] Run focused tests, package tests, lint, formatting check, template integration, and `just check`.

## Risks

- [x] Vite may change prompt wording or terminal drawing; observation must return unknown without
      blocking generation.
- [x] Pseudo-terminal packages contain native code; verify supported Node/platform installation and
      keep the dependency workspace-local.
- [x] Terminal resize and signal cleanup can leak listeners; cover lifecycle cleanup in the runner.
- [x] Raw terminal output can contain unexpected text; never persist it and retain only a bounded
      suffix in memory.

## Validation notes

- 2026-08-16: The focused observer suite passed 3/3.
- 2026-08-16: The focused terminal proxy suite passed 4/4 after the final lifecycle review.
- 2026-08-16: The focused native scaffold, profile, and manifest suite passed 53/53.
- 2026-08-16: The focused Copier/template documentation suite passed 14/14.
- 2026-08-16: The targeted Prettier write formatted supported changed files but returned an error for
  `README.md.jinja` because Prettier has no parser for `.jinja`; the repository's format command does
  not include that extension, and the exact adapter-content test validates the file instead.
- 2026-08-16: The first integration attempt was blocked by sandbox access to the local Docker socket.
  The approved rerun reached generation and then failed because the controlled Vite fixture used the
  old plain-command boundary, so no observed selection was available and the fail-closed rule skipped
  the web profile. The fixture must model the new interactive result before rerunning.
- 2026-08-16: The corrected Docker integration passed copy, native profile application, update,
  install, build, reference development, and cleanup.
- 2026-08-16: Final `just check` passed lint, typecheck, format checking, skill checks/tests, and the
  190-test template suite. The existing web lint warning for TanStack Table remained non-blocking.
