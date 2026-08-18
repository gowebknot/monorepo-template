# Portable Vite wizard transport

Checklist ID: `PORTABLE-VITE-TRANSPORT-2026-08-16`

Status legend: `[ ]` pending, `[x]` complete, `[/]` partial.

Related active checklists:

- [Observe Vite wizard selections](2026-08-16-observe-vite-wizard-selections.md)
- [Resolve PTY package-manager launch](2026-08-16-resolve-pty-package-manager-launch.md)

## Context and rules

- [x] The launcher must behave consistently on macOS, Linux, and Windows.
- [x] Vite remains the owner of its framework and variant prompts.
- [x] The launcher may read Vite output but must not rewrite the Vite command or selected answers.
- [x] User-controlled arguments must remain an argument array and must not be interpolated into a shell command.
- [x] No network or external service is needed for deterministic tests.

## Small task breakdown and case map

- [x] Use the native PTY implementation when it starts successfully.
  - Test: `TEST-VITE-PTY-007`
- [x] Use one portable fallback when native PTY startup throws on macOS.
  - Test: `TEST-VITE-PTY-008`
- [x] Use the same portable fallback when native PTY startup throws on Linux.
  - Test: `TEST-VITE-PTY-009`
- [x] Use the same portable fallback when native PTY startup throws on Windows.
  - Test: `TEST-VITE-PTY-010`
- [x] Preserve every command argument as a separate value in the fallback.
  - Test: `TEST-VITE-PTY-011`
- [x] Forward fallback output through the existing observer and visible output path.
  - Test: `TEST-VITE-PTY-012`
- [x] Return a nonzero fallback exit through the existing command failure path.
  - Test: `TEST-VITE-PTY-013`
- [x] Resolve a Windows PowerShell package-manager shim without a shell command string.
  - Test: `TEST-VITE-PTY-014`

Common areas that do not apply: network, authorization, persistence, and API contracts are not used by this local process boundary.

## Exact test cases

### TEST-VITE-PTY-007

- **Small task:** Keep the native PTY success path.
- **Source:** Existing interactive command behavior.
- **Test place:** `core/create-mono-stack/test/interactive-command.test.js`.
- **Starting state:** A synthetic PTY factory returns a terminal child.
- **Exact input or fixture:** Command `pnpm` with arguments `create`, `vite`.
- **Interaction steps:** Create the transport and start the command.
- **Main behavior:** Native PTY is preferred.
- **Expected result:** The native child is returned and no portable child is spawned.
- **Must change:** The native factory receives the unchanged command and argument array.
- **Must not happen:** The fallback process factory must not run.
- **Planned command:** `node --test test/interactive-command.test.js`.
- **Expected result before the code change:** Fail because the transport factory is not exposed independently.
- **First observed run:** Failed because `createInteractiveSpawn` was not exported; the focused test file could not load.
- **Passing rerun:** Passed in the focused test run.

### TEST-VITE-PTY-008

- **Small task:** Recover from PTY startup failure on macOS.
- **Source:** User requirement for operating-system independence.
- **Test place:** `core/create-mono-stack/test/interactive-command.test.js`.
- **Starting state:** The native PTY factory throws and the platform fixture is `darwin`.
- **Exact input or fixture:** Command `node` with argument `fixture.js`.
- **Interaction steps:** Start the transport.
- **Main behavior:** The portable process fallback starts.
- **Expected result:** One portable child starts with inherited input and piped output.
- **Must change:** The fallback receives the same command and arguments.
- **Must not happen:** `/usr/bin/script` or another OS command must not be invoked.
- **Planned command:** `node --test test/interactive-command.test.js`.
- **Expected result before the code change:** Fail because the current fallback invokes macOS `script`.
- **First observed run:** Failed at module loading because the portable transport factory did not exist.
- **Passing rerun:** Passed in the focused test run.

### TEST-VITE-PTY-009

- **Small task:** Recover from PTY startup failure on Linux.
- **Source:** User requirement for operating-system independence.
- **Test place:** `core/create-mono-stack/test/interactive-command.test.js`.
- **Starting state:** The native PTY factory throws and the platform fixture is `linux`.
- **Exact input or fixture:** Command `node` with argument `fixture.js`.
- **Interaction steps:** Start the transport.
- **Main behavior:** The portable process fallback starts.
- **Expected result:** One portable child starts with inherited input and piped output.
- **Must change:** The fallback receives the same command and arguments.
- **Must not happen:** The native error must not escape before fallback is attempted.
- **Planned command:** `node --test test/interactive-command.test.js`.
- **Expected result before the code change:** Fail because Linux currently rethrows the PTY error.
- **First observed run:** Failed at module loading because the portable transport factory did not exist.
- **Passing rerun:** Passed in the focused test run.

### TEST-VITE-PTY-010

- **Small task:** Recover from PTY startup failure on Windows.
- **Source:** User requirement for operating-system independence.
- **Test place:** `core/create-mono-stack/test/interactive-command.test.js`.
- **Starting state:** The native PTY factory throws and the platform fixture is `win32`.
- **Exact input or fixture:** Command `node.exe` with argument `fixture.js`.
- **Interaction steps:** Start the transport.
- **Main behavior:** The portable process fallback starts.
- **Expected result:** One portable child starts with inherited input and piped output.
- **Must change:** The fallback receives the same command and arguments.
- **Must not happen:** PowerShell, `cmd.exe`, or a shell command string must be created.
- **Planned command:** `node --test test/interactive-command.test.js`.
- **Expected result before the code change:** Fail because Windows currently rethrows the PTY error.
- **First observed run:** Failed at module loading because the portable transport factory did not exist.
- **Passing rerun:** Passed in the focused test run.

### TEST-VITE-PTY-011

- **Small task:** Preserve argument boundaries in fallback mode.
- **Source:** Security rule against shell interpolation.
- **Test place:** `core/create-mono-stack/test/interactive-command.test.js`.
- **Starting state:** Native PTY startup throws.
- **Exact input or fixture:** Arguments `fixture with spaces.js` and `value;still-one-argument`.
- **Interaction steps:** Start the portable fallback.
- **Main behavior:** Arguments remain separate array entries.
- **Expected result:** The process factory receives the exact two entries.
- **Must change:** Only the process call is recorded.
- **Must not happen:** No quoting, joining, parsing, or shell option is used.
- **Planned command:** `node --test test/interactive-command.test.js`.
- **Expected result before the code change:** Fail because the existing fallback prepends an OS utility and its arguments.
- **First observed run:** Failed at module loading because the portable transport factory did not exist.
- **Passing rerun:** Passed in the focused test run.

### TEST-VITE-PTY-012

- **Small task:** Keep fallback output observable and visible.
- **Source:** Vite wizard observation requirement.
- **Test place:** `core/create-mono-stack/test/interactive-command.test.js`.
- **Starting state:** A fallback child exposes synthetic standard output and error streams.
- **Exact input or fixture:** Standard output `Select a framework` and standard error `warning`.
- **Interaction steps:** Register a data handler and emit both chunks.
- **Main behavior:** Both output streams reach the handler.
- **Expected result:** The handler receives both exact chunks.
- **Must change:** Data subscriptions are attached and disposable.
- **Must not happen:** Output must not be swallowed or modified.
- **Planned command:** `node --test test/interactive-command.test.js`.
- **Expected result before the code change:** The macOS-only adapter may pass; the portable factory case does not exist.
- **First observed run:** Failed at module loading because the portable transport factory did not exist.
- **Passing rerun:** Passed in the focused test run.

### TEST-VITE-PTY-013

- **Small task:** Preserve fallback failure reporting.
- **Source:** Existing failed interactive command behavior.
- **Test place:** `core/create-mono-stack/test/interactive-command.test.js`.
- **Starting state:** A fallback child closes with exit code 7.
- **Exact input or fixture:** Command `pnpm create vite`.
- **Interaction steps:** Run the command and emit close code 7.
- **Main behavior:** The command rejects with its logical command and exit code.
- **Expected result:** Error text is `pnpm failed with exit code 7.`.
- **Must change:** Process listeners are cleaned up.
- **Must not happen:** The run must not resolve successfully.
- **Planned command:** `node --test test/interactive-command.test.js`.
- **Expected result before the code change:** Fail because there is no injectable portable fallback path.
- **First observed run:** Failed at module loading because the portable transport factory did not exist.
- **Passing rerun:** Passed in the focused test run.

### TEST-VITE-PTY-014

- **Small task:** Launch a Windows package-manager shim without command-string interpolation.
- **Source:** User requirement for Windows support and the security rule against shell interpolation.
- **Test place:** `core/create-mono-stack/test/interactive-command.test.js`.
- **Starting state:** A synthetic Windows PATH directory contains executable `pnpm.ps1`.
- **Exact input or fixture:** Command `pnpm` with arguments `create`, `vite` and platform `win32`.
- **Interaction steps:** Resolve the interactive command.
- **Main behavior:** The PowerShell shim is selected explicitly.
- **Expected result:** Command is `powershell.exe`; arguments are `-NoLogo`, `-NoProfile`, `-File`, the exact shim path, `create`, `vite`.
- **Must change:** The shim path is inserted as one argument.
- **Must not happen:** No `.cmd` command string, quoting, joining, or `shell: true` is used.
- **Planned command:** `node --test test/interactive-command.test.js`.
- **Expected result before the code change:** Fail because the current resolver only searches the host executable name.
- **First observed run:** Failed because the resolver returned the unresolved `pnpm` command instead of the synthetic `pnpm.ps1` shim.
- **Passing rerun:** Passed; the resolver returned `powershell.exe` with the shim and Vite arguments kept as separate entries.

## Implementation and verification

- [x] Replace the macOS utility adapter with a portable child-process adapter.
- [x] Keep native PTY as the preferred transport on every operating system.
- [x] Keep command and argument boundaries intact without `shell: true`.
- [x] Run the focused tests before and after implementation and record results.
- [x] Resolve Windows PowerShell shims as an executable plus argument array.

Validation note: the first targeted Prettier command used an incorrect relative checklist path and reported no matching file; the corrected repository-root validation is recorded below.

- [x] Run the launcher test and lint commands.
- [x] Run `just check`.

## Dependencies and risks

- [x] Dependency: Node's built-in child-process and stream APIs are available on all supported Node versions.
- [x] Risk: A fallback child sees inherited terminal input but piped output; tests verify observation, while the native PTY remains preferred.
- [x] Risk: Platform command shims still depend on native PTY when required; the launcher resolves Node shebang shims before transport startup.
