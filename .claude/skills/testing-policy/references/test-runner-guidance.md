# Test Runner Guidance

Use the scripts and configuration owned by the affected workspace. Do not assume that every package
uses the same runner.

- The Nest server currently uses Vitest for unit and HTTP e2e tests with its package-local
  configuration (`test` and `test:e2e` scripts).
- Skills and repository tooling use Node's built-in `node:test` runner through `pnpm skills:test`.
- Library packages may add their own runner; read their `package.json`, test configuration, and
  `AGENTS.md` before writing tests.

Prefer focused package commands first, followed by the repository's broader validation command when
the change crosses package boundaries.
