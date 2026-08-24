# Automated Generated Project Setup

Checklist ID: CHECKLIST-AUTOMATED-GENERATED-PROJECT-SETUP-001

## Scope

- [x] Add a generated-project `just setup` recipe that installs dependencies, starts Docker infrastructure, and builds the workspace.
  - [x] Use the generated lockfile for a reproducible dependency install.
  - [x] Start Compose services without starting persistent development servers.
  - [x] Build the workspace so the developer receives a verified project.
- [x] Add an interactive post-generation consent prompt to the create template script.
  - [x] Display every automated setup step before asking for approval.
  - [x] Run `just setup` only after explicit approval in an interactive terminal.
  - [x] Explain the exact manual next step when declined or non-interactive.
  - [x] Report setup failures with a rerun command without deleting the generated project.

## Acceptance Criteria

- Generated projects expose `just setup`.
- Approval runs the setup recipe from the generated project directory.
- Declining never runs setup commands and prints `cd <destination>` followed by `just setup`.
- Non-interactive creation never blocks on a prompt and prints the same manual next step.
- The prompt lists dependency installation, Docker Compose startup, and workspace build.

## Exact Validation Cases

### TEST-SETUP-001: Setup recipe contains the complete bootstrap sequence

- Small task: Add the generated-project setup recipe.
- Source: User request for one `just setup` recipe that performs installation, setup, and wiring.
- Test place: `core/create-mono-stack/test/copier-template.test.js` static template assertions.
- Starting state: `Justfile` has separate install/build recipes but no setup recipe.
- Exact input or fixture: Read the rendered `Justfile` recipe text.
- Interaction steps: Assert the recipe invokes frozen pnpm installation, Compose startup, and workspace build in order.
- Main behavior: One documented command prepares the generated workspace and services.
- Expected result: `just setup` contains `pnpm install --frozen-lockfile`, `docker compose up -d`, and `pnpm build`.
- Must change: Add only setup orchestration; do not start `pnpm dev`.
- Must not happen: No Dockerfile build or persistent development server runs automatically.
- Planned command: `pnpm --filter create-mono-stack test -- --test-name-pattern='TEST-SETUP-001'`.
- Expected result before the code change: Fails because the recipe and assertions do not exist.
- First observed run: The focused suite reached the new assertion but its initial negative check incorrectly matched the separate `dev` recipe; existing Ink tests also had an intermittent timeout.
- Passing rerun: `node --test test/cli.test.js test/copier-template.test.js --test-name-pattern='TEST-SETUP|TEST-DOCKER-001|opens the project wizard|keeps explicit CLI arguments'` passed all 44 selected tests.

### TEST-SETUP-002: Approval runs automated setup and reports completion

- Small task: Add the approval path after project generation.
- Source: User request to make the whole system ready after consent.
- Test place: `core/create-mono-stack/test/cli.test.js` with injected prompt and command dependencies.
- Starting state: Project generation returns a destination and no setup prompt exists.
- Exact input or fixture: Interactive input/output, approval result `true`, generated destination `/workspace/acme`.
- Interaction steps: Create the project, approve the displayed setup plan, capture the setup command and final log.
- Main behavior: Approved setup runs in the generated project directory.
- Expected result: `just setup` is invoked with `cwd=/workspace/acme`, then completion output identifies the project as ready.
- Must change: Add the setup command invocation after successful generation.
- Must not happen: Setup must not run before generation succeeds.
- Planned command: `pnpm --filter create-mono-stack test -- --test-name-pattern='TEST-SETUP-002'`.
- Expected result before the code change: Fails because no setup prompt or command invocation exists.
- First observed run: The approval case failed because no setup prompt or command invocation existed.
- Passing rerun: The focused launcher run passed `TEST-SETUP-002` and verified `just setup` runs in the generated project directory.

### TEST-SETUP-003: Declining approval prints the manual next step

- Small task: Preserve a safe manual path when the user declines.
- Source: User request to show the next step when auto execution is denied.
- Test place: `core/create-mono-stack/test/cli.test.js` with injected prompt result `false`.
- Starting state: Project generation succeeds in an interactive terminal.
- Exact input or fixture: Generated destination `/workspace/acme`, decline result `false`.
- Interaction steps: Complete generation, decline setup, inspect executed commands and output.
- Main behavior: Declining does not execute setup and gives an actionable command.
- Expected result: No `just setup` command runs; output includes `cd /workspace/acme` and `just setup`.
- Must change: Add decline guidance.
- Must not happen: Declining must not remove or roll back the generated project.
- Planned command: `pnpm --filter create-mono-stack test -- --test-name-pattern='TEST-SETUP-003'`.
- Expected result before the code change: Fails because decline behavior is not defined.
- First observed run: The decline case failed because no manual guidance or setup suppression existed.
- Passing rerun: The focused launcher run passed `TEST-SETUP-003` and confirmed no setup command was recorded.

### TEST-SETUP-004: Non-interactive creation remains non-blocking

- Small task: Avoid prompting when no interactive terminal is available.
- Source: Existing launcher contract that explicit and non-TTY creation is non-interactive.
- Test place: `core/create-mono-stack/test/cli.test.js` with non-TTY streams.
- Starting state: Project generation succeeds with `input.isTTY=false` and `output.isTTY=false`.
- Exact input or fixture: Explicit destination and generated stack result.
- Interaction steps: Run creation without a prompt provider, inspect command calls and output.
- Main behavior: Non-interactive creation skips auto execution and prints the manual path.
- Expected result: No prompt blocks and no setup command runs; output includes `just setup`.
- Must change: Gate setup consent on interactive streams.
- Must not happen: CI or scripted creation must not start Docker or mutate services unexpectedly.
- Planned command: `pnpm --filter create-mono-stack test -- --test-name-pattern='TEST-SETUP-004'`.
- Expected result before the code change: Fails because the post-generation setup behavior is absent.
- First observed run: The non-interactive case failed because no manual guidance or TTY gate existed.
- Passing rerun: The focused launcher run passed `TEST-SETUP-004` and confirmed no prompt or setup command was recorded.

## Implementation Plan

- [x] Add the `setup` recipe to `Justfile` and generated documentation.
  - [x] Run `pnpm install --frozen-lockfile` first.
  - [x] Run `docker compose up -d` second.
  - [x] Run `pnpm build` last.
- [x] Add a small injectable setup-consent prompt module under `core/create-mono-stack/src/`.
  - [x] Print the three commands and explain Docker host requirements.
  - [x] Return an explicit boolean without treating cancellation as approval.
- [x] Integrate the prompt and `just setup` invocation into `main` after successful generation.
- [x] Add focused CLI tests for approval, decline, and non-interactive behavior.
- [x] Update generated README guidance and template assertions.

## Risks and Non-Goals

- Docker daemon availability remains an environmental prerequisite for approved setup.
- QEMU may still require Linux KVM support; setup should report command failure without hiding it.
- `just setup` must not run `pnpm dev`, migrations, or irreversible database operations.

## Verification Commands

- `pnpm --filter create-mono-stack test -- --test-name-pattern='TEST-SETUP'`
- `pnpm --filter create-mono-stack test`
- `pnpm --filter create-mono-stack lint`
- `pnpm format:check`
- `just setup --dry-run` or equivalent recipe inspection in a generated fixture
- `git diff --check`

## Validation Notes

- The first focused rerun passed all four setup cases and the static recipe assertion after correcting the recipe test's broad `pnpm dev` match. The first lint run then reported an unused approval variable and regex indentation style violations; those are corrected before the final rerun.
- Final focused launcher tests passed 44 tests; package lint, repository formatting, `just --dry-run setup`, and `git diff --check` passed. The full launcher suite reached 269/270 passing with one unrelated intermittent Ink timing failure (`TEST-WIZARD-007`).
