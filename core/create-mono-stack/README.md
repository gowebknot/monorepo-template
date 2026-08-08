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

Options:

```text
--name <name>       Project display name; defaults to the destination directory name
--python <path>     Python 3.10+ executable
--template <source> Override the canonical Git template source
--vcs-ref <ref>     Use a specific template tag, branch, or commit
```

The destination must not contain files. Install project dependencies after generation.

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
