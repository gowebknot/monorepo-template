# Resolve PTY package-manager launch

Status legend: `[ ]` pending, `[x]` complete.

Parent: `2026-08-16-observe-vite-wizard-selections.md`

## Acceptance criteria

- [x] A PATH command backed by a Node shebang script is launched through the current Node executable.
- [x] A native executable continues to be passed directly to the PTY without changing its arguments.
- [x] The real Corepack-managed `pnpm` shim can start inside the PTY on this host.
- [x] Existing interactive-command and package tests remain green.

## Test cases

- [x] TEST-VITE-PTY-005 resolves a Node shebang PATH shim while preserving all original arguments.
- [x] TEST-VITE-PTY-006 leaves native executables unchanged.
- [x] Run the focused interactive-command test file.
- [x] Run the full `create-mono-stack` test suite.
- [x] Run a local PTY smoke test with `pnpm --version`.
