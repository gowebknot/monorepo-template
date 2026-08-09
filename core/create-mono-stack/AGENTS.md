# AGENTS.md

## Purpose

`create-mono-stack` is the source-only npm launcher for creating projects from the repository's
Copier template. It is part of the root workspace but must never appear in generated projects.

## Public Contract

- Package name and executable: `create-mono-stack`.
- Default template source: `git@github.com:gowebknot/monorepo-template.git`.
- Optional SSH aliases are transport-only and must never replace the generic source in Copier answers.
- Require Node.js 20+ and Python 3.10+.
- Ask for explicit consent before installing Python or mise; declining Python must stop setup, while
  declining mise must use the native Python installer.
- Create projects without Docker or global Python package installation.
- Initialize generated projects on Git branch `main` without creating a commit.
- Refuse non-empty destination directories.

## Rules

- Keep the launcher dependency-free when Node built-ins are sufficient.
- Execute Python and Copier with argument arrays; never interpolate user input into a shell command.
- Disable runtime-manager auto-installation while probing Python so installation never precedes user
  consent.
- Validate SSH host aliases and append process-scoped Git configuration without replacing existing
  `GIT_CONFIG_*` entries.
- Remove ambient Git repository-routing variables from Copier and Git initialization subprocesses.
- Install the pinned requirements into a temporary virtual environment and remove it on success or
  failure.
- After generation, install the launcher's packaged pinned Copier requirements into the destination
  `.venv` so a custom template cannot choose setup-time Python packages.
- Remove partially generated output after setup failures, restoring a destination that was already an
  empty directory.
- Use mise without loading ambient project configuration while bootstrapping Python.
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
