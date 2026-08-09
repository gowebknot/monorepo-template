# create-mono-stack

Package-manager launcher for the Go Webknot monorepo Copier template. This package lives under
`core/` because it maintains and distributes the template but is not copied into generated projects.

## Requirements

- Node.js 20 or newer
- Python 3.10 or newer
- Git and SSH access to `git@github.com:gowebknot/monorepo-template.git`

The launcher creates a temporary Python virtual environment, installs the pinned Copier requirements,
generates the project, and removes the environment. It does not use Docker or install global tools.

## Usage

```sh
pnpm create mono-stack my-project --name "My Project"
```

For an SSH configuration that uses a GitHub host alias, pass it as a transport-only override. Copier
still records `git@github.com:gowebknot/monorepo-template.git` in the generated project:

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

The destination must not contain files. Install project dependencies after generation.

## Template Updates

Generated projects include `pnpm template:update`. Developers who require an SSH alias configure it
once per clone after initializing Git:

```sh
git config --local mono-stack.template-host-alias github-webknot
pnpm template:update
```

The local setting is not committed. The update wrapper applies it to Copier and its cached Git mirror
without changing the generic `_src_path` in `.copier-answers.yml`.

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
