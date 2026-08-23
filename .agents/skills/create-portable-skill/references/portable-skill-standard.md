# Portable Skill Standard

## Required layout

Every repository skill uses this structure:

```text
skills/<skill-name>/
├── SKILL.md
├── scripts/
├── references/
├── assets/
├── templates/
└── examples/
```

Keep all five directories even when unused. Preserve empty directories with
`.gitkeep`. Root-level files such as `LICENSE` are allowed; additional
root-level directories are not.

## Metadata

- Match the folder and `name`.
- Use 1-64 lowercase letters, digits, and single hyphens.
- Write a non-empty `description` of at most 1,024 characters.
- State what the skill does and the requests that should trigger it.
- Include only `name` and `description` in frontmatter.

## Resource categories

- `scripts/`: deterministic executable helpers; test every added script.
- `references/`: detailed documentation loaded only when relevant.
- `assets/`: files copied, transformed, or consumed in produced output.
- `templates/`: starting structures intended to be filled or customized.
- `examples/`: representative inputs, outputs, or completed samples.

Reference resources from `SKILL.md` with relative paths and explain when to
read or use them. Avoid duplicating the same guidance in multiple files. A skill that must remain
independently actionable may repeat a concise policy requirement; keep those copies textually aligned
and update them together when the policy changes.

## Portability

Do not rely on provider-specific frontmatter, invocation policy, tool grants,
dynamic shell injection, argument substitution, session variables, or
provider-specific metadata. Express the workflow as ordinary instructions and
portable scripts.

Run `pnpm skills:sync` after every change. Run `pnpm skills:check` before
committing.

## Locked native skills

Skills listed in the repository-root `skills-lock.json` are native upstream skills rather than
portable repository-authored skills. They are synchronized into the four discovery roots but are
excluded from portable metadata validation. A locked native skill may retain its upstream
provider-specific frontmatter or syntax; do not copy those conventions into portable skills.
