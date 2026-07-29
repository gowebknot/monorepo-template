---
name: create-portable-skill
description: Create or update portable repository Agent Skills that work consistently in Claude Code, Codex, and OpenCode. Use whenever the user asks to create, scaffold, add, generate, revise, synchronize, or validate a skill in this repository.
---

# Create Portable Skills

Create and maintain repository skills through the portable skill workflow.

1. Clarify the skill's purpose, triggering requests, expected workflow, and reusable resources. Discover repository facts before asking the user.
2. Read `references/portable-skill-standard.md` before creating or restructuring a skill.
3. For a new skill, run `pnpm skills:create <name> --description "<description>"` from the repository root. Use `templates/SKILL.md.template` when drafting its instructions.
4. Keep `SKILL.md` concise and imperative. Put executable helpers in `scripts/`, detailed knowledge in `references/`, output resources in `assets/`, fillable starting material in `templates/`, and representative inputs or outputs in `examples/`.
5. Use only portable `name` and `description` frontmatter. Do not add provider-specific invocation controls, substitutions, dynamic command injection, or metadata.
6. Test every added script and validate the skill with realistic example requests. Use `examples/minimal-skill.md` as a structural example, not as content to copy blindly.
7. Run `pnpm skills:sync`, then `pnpm skills:check`. Report conflicts without overwriting divergent changes.

Edit the canonical `skills/<name>/` copy. A skill created by a native agent may first appear under `.agents/skills/`, `.claude/skills/`, or `.opencode/skills/`; run synchronization to import it before continuing.
