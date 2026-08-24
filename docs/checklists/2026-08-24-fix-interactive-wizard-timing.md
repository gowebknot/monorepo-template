# Fix Interactive Wizard Timing

Checklist ID: CHECKLIST-FIX-INTERACTIVE-WIZARD-TIMING-001

## Scope

- [x] Make the advanced-options wizard test deterministic when the screen transition is delayed.
  - [x] Preserve the existing user interaction and assertions.
  - [x] Wait for the rendered advanced sub-step after the terminal redraw settles.
  - [x] Verify the test passes repeatedly and in the full launcher suite.

## Acceptance Criteria

- `TEST-WIZARD-007` consistently reaches `Git SSH host alias` before pressing the down arrow.
- The test still verifies the question description and default-highlighted option description.
- No production wizard behavior changes unless reproduction proves a product race.

## Exact Validation Cases

### TEST-WIZARD-009: Advanced sub-step waits for the rendered screen

- Small task: Stabilize the advanced-options interaction test.
- Source: Existing `TEST-WIZARD-007` failure where the assertion saw `Ready to create` instead of the advanced sub-step.
- Test place: `core/create-mono-stack/test/interactive-wizard.test.js`.
- Starting state: A rendered wizard at the default destination screen.
- Exact input or fixture: Enter through default app names, select `Configure advanced options`, then select the first advanced step.
- Interaction steps: Send each key only after its expected frame appears; verify the SSH alias description and default choice description.
- Main behavior: The test synchronizes with Ink-rendered state rather than relying on a fixed delay.
- Expected result: The assertions pass every run.
- Must change: Test synchronization only unless production reproduction requires otherwise.
- Must not happen: Do not weaken or remove the description assertions.
- Planned command: `node --test test/interactive-wizard.test.js --test-name-pattern='TEST-WIZARD-007'`.
- Expected result before the code change: Intermittently times out or observes the previous screen.
- First observed run: The test passed once but had previously failed intermittently in the full launcher suite with the prior screen still visible.
- Passing rerun: `node --test test/interactive-wizard.test.js` passed 24/24 in three consecutive runs; `pnpm --filter create-mono-stack test` passed 270/270.

## Implementation Plan

- [x] Add the smallest missing expected-frame wait to `TEST-WIZARD-007`.
- [x] Run the focused test repeatedly and then the full launcher suite.
- [x] Update this checklist with observed results.

## Risks and Non-Goals

- This task does not change the setup recipe or post-generation consent behavior.
- Timing-only test changes must not hide real wizard state-transition failures.

## Verification Commands

- `node --test test/interactive-wizard.test.js --test-name-pattern='TEST-WIZARD-007'`
- `pnpm --filter create-mono-stack test`
- `pnpm --filter create-mono-stack lint`
- `pnpm format:check`
- `git diff --check`

## Validation Notes

- Added a second expected-frame check after the existing redraw delay in `sendInput`, preventing a transient matching frame from allowing the next keypress too early. Full launcher tests now pass 270/270.
