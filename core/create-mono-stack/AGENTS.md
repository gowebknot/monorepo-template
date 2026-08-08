# AGENTS.md

## Purpose

`create-mono-stack` is the source-only npm launcher for creating projects from the repository's
Copier template. It is part of the root workspace but must never appear in generated projects.

## Public Contract

- Package name and executable: `create-mono-stack`.
- Default template source: `git@github.com:gowebknot/monorepo-template.git`.
- Require Node.js 20+ and Python 3.10+.
- Create projects without Docker or global Python package installation.
- Refuse non-empty destination directories.

## Rules

- Keep the launcher dependency-free when Node built-ins are sufficient.
- Execute Python and Copier with argument arrays; never interpolate user input into a shell command.
- Install the pinned requirements into a temporary virtual environment and remove it on success or
  failure.
- Keep `requirements/copier.txt` byte-for-byte synchronized with the repository-root copy.
- Keep all Copier and launcher tests under this package's `test/` directory.
- Use controlled local fixtures for unit tests. Do not contact the template remote or PyPI from
  ordinary tests.
- Any change to generated output must retain the `core/` exclusion and pass the create/update
  integration test.

## Layout

```text
bin/           # npm executable entrypoint
requirements/  # pinned Python Copier toolchain
src/           # launcher implementation
test/          # launcher, template, and Copier integration tests
```

## Validation

Run from the repository root:

```sh
pnpm --filter create-mono-stack test
pnpm --filter create-mono-stack lint
pnpm --filter create-mono-stack test:integration
```
