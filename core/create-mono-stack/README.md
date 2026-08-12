# create-mono-stack

Package-manager launcher for the Go Webknot monorepo Copier template. This package lives under
`core/` because it maintains and distributes the template but is not copied into generated projects.

## Requirements

- Node.js 20 or newer
- Python 3.10 or newer, or consent for setup to install the latest Python
- Git and SSH access to `git@github.com:gowebknot/monorepo-template.git`

The launcher creates a temporary Python virtual environment, installs the pinned Copier requirements,
generates the project, initializes the project's persistent `.venv` for future template updates, and
removes the temporary environment. It does not use Docker or install global Python packages.

If Python is unavailable, setup first asks whether it may install Python. After consent, an existing
mise installation is preferred. If mise is unavailable, setup separately asks to install it; declining
mise uses the native platform package manager instead. Declining the Python installation stops setup
before project files are created and prints manual installation guidance.

The native fallback installs the platform's current Python package, then revalidates the version and
virtual-environment support. Older distributions that cannot provide Python 3.10 or newer stop with
manual installation guidance instead of continuing with an unsupported runtime.

Python discovery disables automatic installs from runtime-manager shims. Setup uses the launcher's
packaged Copier requirements for both virtual environments and removes generated output if a later
setup step fails.

## Usage

Run without arguments in an interactive terminal to open the Ink-powered project setup TUI:

```sh
pnpm create mono-stack
```

Type values and press Enter to continue; use the arrow keys for choices, and press Escape or Ctrl+C
to cancel before setup starts. The TUI collects the destination and project name, offers advanced
template and runtime settings, then confirms the complete configuration. It exits before Python,
Copier, or Git takes over the terminal.

For scripts or direct configuration, pass the destination and options explicitly:

```sh
pnpm create mono-stack my-project --name "My Project"
```

For an SSH configuration that uses a GitHub host alias, pass it as a transport-only override. Setup
stores the alias in the generated repository's local Git configuration, while Copier still records
`git@github.com:gowebknot/monorepo-template.git` in the generated project:

```sh
pnpm create mono-stack my-project \
  --name "My Project" \
  --git-host-alias github-webknot
```

Options:

```text
--name <name>       Project display name; defaults to the destination directory name
--git-host-alias <alias>
                     SSH host alias used only while Git accesses github.com
--python <path>     Python 3.10+ executable
--template <source> Override the canonical Git template source
--vcs-ref <ref>     Use a specific template tag, branch, or commit
```

The destination must not contain files. Setup initializes Git on `main` without creating a commit.
Install project dependencies and create the baseline commit after generation.

## Template Updates

Generated projects include `pnpm template:update`, a `mise.toml` declaration for the latest Python,
and a ready-to-use `.venv` with pinned Copier dependencies. It also refreshes generated npm
dependencies to their latest releases and updates the pnpm lockfile. Setup stores any alias passed with
`--git-host-alias` automatically. Because the local setting is not committed, configure it once after
cloning the project elsewhere or when repairing an older project:

```sh
git config --local mono-stack.template-host-alias github-webknot
pnpm template:update
```

The update wrapper applies the local setting to Copier and its cached Git mirror without changing the
generic `_src_path` in `.copier-answers.yml`.

## Local Development

From the repository root:

```sh
pnpm --filter create-mono-stack test
pnpm --filter create-mono-stack lint
node core/create-mono-stack/bin/create-mono-stack.js ../my-project \
  --name "My Project" \
  --template . \
  --vcs-ref HEAD
```

## License

Licensed under the [MIT License](LICENSE). Copyright (c) 2026 Webknot Technologies.
