# Fix "Detected unsettled top-level await" warning when Ctrl+C/Ctrl+D interrupts the setup prompt

Checklist ID: 2026-09-13-setup-prompt-interrupt-warning-fix
Related checklists: none prior (new bug class)

## Change Tier

Tier: standard

## Context

User ran the freshly published `create-mono-stack@0.1.57` via `pnpm dlx` and, right at the "Run
automated setup now? [y/N]" prompt, saw:

```
Warning: Detected unsettled top-level await at file:///.../bin/create-mono-stack.js:6
  await main();
  ^
```

Root cause, confirmed by research (Node.js issue
[nodejs/node#53497](https://github.com/nodejs/node/issues/53497)) and reproduced locally: the promise
returned by `node:readline/promises`' `interface.question()` never settles when the readline interface
is closed by a SIGINT (Ctrl+C) or EOF (Ctrl+D) before an answer is given — a known, still-open Node.js
core bug (reproduced here against Node v24.19.0). `core/create-mono-stack/src/setup-prompt.js`'s
`promptForSetup` calls `readline.question(...)` directly and awaits it with no other settlement path,
so an interrupted prompt leaves that awaited promise permanently pending; Node then reports it as an
"unsettled top-level await" once the event loop has nothing else to do.

Reproduced locally: a minimal script matching `bin/create-mono-stack.js`'s exact
`try { await main(); }` shape, with `main` awaiting a bare `readline.question(...)`, printed the
identical warning when sent `SIGINT` while the question was pending.

This is cosmetic (the process does still exit), but it's confusing and alarming — it looks like an
internal crash right as the user is asked a routine yes/no question, immediately after generation
already completed successfully. The fix: race `question()` against the interface's own `close` event
and resolve to "declined" (same as answering "N") on interruption, per the workaround documented in
the linked Node.js issue, adapted so cancellation is a soft decline rather than a thrown error (the
prompt is for an optional bonus step; project generation has already succeeded by this point, so an
error here would misleadingly suggest the whole setup failed).

## Implementation Contract

### Feature Boundaries

- Included: `core/create-mono-stack/src/setup-prompt.js`'s `promptForSetup`.
- Excluded: `bin/create-mono-stack.js` itself (no change needed — the fix is fully contained in not
  producing an unsettled promise in the first place); the Ink wizard's own Ctrl+C handling
  (`interactive-wizard.js`'s `useInput` already handles Escape/Ctrl+C explicitly and does not use
  `readline`, so it is not affected by this bug).
- Ownership: `create-mono-stack` owns this prompt.

### Route-Group Ownership

Not applicable — CLI prompt behavior, not an HTTP route.

### User Journey

1. A user runs `create-mono-stack` (interactively or via `pnpm dlx`), completes generation, and reaches
   "Run automated setup now? [y/N]".
2. They press Ctrl+C (or Ctrl+D) instead of typing an answer, intending to skip automated setup.
3. The CLI now prints no warning, treats this exactly like answering "N" (prints the manual
   `just setup` follow-up step), and exits normally.

### Complete Test Matrix

| Test ID           | Path type | Small task                                                              | Trigger                                                            | Expected result                                                       | Status |
| ----------------- | --------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------- | ------ |
| TEST-SETUPINT-001 | happy     | Normal "y" answer still resolves true                                   | Real `PassThrough` streams, write `"y\n"`                          | `promptForSetup` resolves `true`                                      | Passed |
| TEST-SETUPINT-002 | happy     | Normal "n"/empty answer still resolves false                            | Real `PassThrough` streams, write `"n\n"` / `"\n"`                 | `promptForSetup` resolves `false`                                     | Passed |
| TEST-SETUPINT-003 | non-happy | Interface closed (EOF/Ctrl+D) before an answer resolves false, no throw | Real `PassThrough` input stream, call `.end()` with no prior write | `promptForSetup` resolves `false`; no rejection, no unhandled warning | Passed |

### Unresolved Conflicts

None found.

## Acceptance Criteria

- [x] `promptForSetup` never leaves an unsettled promise when the readline interface closes before an
      answer (verified by racing `question()` against the interface's `close` event).
- [x] Interruption resolves to `false` (same effect as declining), not a thrown error — project
      generation has already succeeded by the time this prompt runs.
- [x] Normal y/N answers behave exactly as before (no regression).
- [x] `pnpm --filter create-mono-stack test` passes in full (308/308).
- [x] `just check` passes.

## Exact Test Cases

### TEST-SETUPINT-001

- Small task: a real "y" answer still resolves `true`.
- Source: existing `promptForSetup` contract (regex `/^y(?:es)?$/i`).
- Test place: `core/create-mono-stack/test/setup-prompt.test.js` (new file).
- Starting state: real `node:stream` `PassThrough` pair as input/output (not the mocked
  `{ input, output }` objects `cli.test.js` uses to bypass this function entirely).
- Exact input or fixture: write `"y\n"` to the input stream shortly after calling `promptForSetup`.
- Interaction steps: call `promptForSetup({ input, output })`, write the answer, await the result.
- Main behavior: `readline.question()` resolves normally; the race resolves to that answer.
- Expected result: `true`.
- Must change: nothing external.
- Must not happen: a warning, a hang, or a rejection.
- Planned command: `node --test core/create-mono-stack/test/setup-prompt.test.js`.
- Expected result before the code change: passes already (this path is unaffected by the bug) — locked
  in as a regression guard before touching the function.
- First observed run: 2026-09-13, passed against the unmodified `setup-prompt.js` (1ms), confirming
  this path is genuinely unaffected by the bug before touching the function.
- Passing rerun: 2026-09-13, passed against the fixed `setup-prompt.js` (part of the 3/3 rerun below).

### TEST-SETUPINT-002

- Small task: a real "n" (and a real empty/default) answer still resolves `false`.
- Source: same as TEST-SETUPINT-001.
- Test place: `core/create-mono-stack/test/setup-prompt.test.js`.
- Starting state: same real stream pair.
- Exact input or fixture: write `"n\n"` in one case, `"\n"` (bare Enter) in another.
- Interaction steps: call `promptForSetup`, write the answer, await the result.
- Main behavior: the regex rejects both, matching today's behavior.
- Expected result: `false` for both inputs.
- Must change: nothing external.
- Must not happen: a warning, a hang, or a rejection.
- Planned command: `node --test core/create-mono-stack/test/setup-prompt.test.js`.
- Expected result before the code change: passes already — locked in as a regression guard.
- First observed run: 2026-09-13, both "n" and empty-answer cases passed against the unmodified
  `setup-prompt.js` (0.76ms combined), confirmed unaffected before touching the function.
- Passing rerun: 2026-09-13, passed against the fixed `setup-prompt.js` (part of the 3/3 rerun below).

### TEST-SETUPINT-003

- Small task: closing the input stream (EOF, the same mechanism Ctrl+D/an interrupted `readline`
  interface uses) before any answer resolves `false` instead of hanging or leaving an unsettled
  promise.
- Source: Node.js issue nodejs/node#53497; local reproduction against Node v24.19.0 (`SIGINT` sent to a
  minimal script using bare `await readline.question(...)` printed the identical "unsettled top-level
  await" warning).
- Test place: `core/create-mono-stack/test/setup-prompt.test.js`.
- Starting state: real `PassThrough` input stream, no data written.
- Exact input or fixture: call `input.end()` (EOF) immediately after starting `promptForSetup`, before
  writing any line.
- Interaction steps: `const result = promptForSetup({ input, output }); input.end(); await result;`
  with a short timeout guard (`Promise.race` against a rejecting timer) so a regression hangs the test
  instead of hanging the whole suite indefinitely.
- Main behavior: the interface's `close` event fires (readline's standard EOF behavior); the race
  resolves to `false` instead of leaving `question()`'s promise pending forever.
- Expected result: `promptForSetup` resolves to `false` well within the timeout.
- Must change: nothing external.
- Must not happen: the returned promise staying pending past the timeout guard.
- Planned command: `node --test core/create-mono-stack/test/setup-prompt.test.js`.
- Expected result before the code change: fails — times out (the promise never settles, matching the
  real bug).
- First observed run: 2026-09-13, failed exactly as predicted — timed out after 2000ms with
  `Error: promptForSetup left an unsettled promise after the input stream closed`, reproducing the
  real bug directly (not just the SIGINT-based repro in the Context section).
- Passing rerun: 2026-09-13, passed in 0.92ms against the fixed `setup-prompt.js` — resolves instantly
  via the `close` event race instead of timing out; also manually re-confirmed the original SIGINT
  repro script no longer prints the "unsettled top-level await" warning after applying the same fix.
