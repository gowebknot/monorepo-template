# Task: Vendor the shadcn native skill into all four skill roots

- Checklist ID: CHECKLIST-20260816-vendor-shadcn-skill-all-roots
- Created: 2026-08-16
- Planning completed: 2026-08-16
- Type: Configuration (skill vendoring)
- Source request: "there is this skill which is not present anywhere else. I want this to present for all agents @.agents/skills/shadcn/"
- Related checklists:
  - Origin: [2026-08-15-skill-invocation-gate.md](2026-08-15-skill-invocation-gate.md)
- Affected paths: `skills/shadcn/`, `.agents/skills/shadcn/`, `.claude/skills/shadcn/`, `.opencode/skills/shadcn/`, `skills-lock.json`
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Context and Scope

- [x] Problem: `shadcn` exists only under `.agents/skills/shadcn/`, so Claude Code, OpenCode, and the
      canonical `skills/` source do not have it. The user wants it available to every agent.
- [x] Existing behavior: `shadcn` is a **native** (vendored) skill listed in `skills-lock.json`.
      `scripts/skills.mjs` reads that lock only through `readLockedNativeSkillNames` to **exclude**
      native skills from `pnpm skills:sync` and `pnpm skills:check` (`listPortableSkills`). No code
      consumes the lock's `computedHash`/`source`/`skillPath` fields.
- [x] Constraint: `shadcn` cannot become a portable skill. `validateSkill` rejects its extra
      frontmatter keys (`user-invocable`, `allowed-tools`) and its non-resource root directories
      (`evals/`, `agents/`, `rules/`), and it lacks the required portable resource dirs. It must stay
      native and be vendored as identical copies.
- [x] Non-goals: converting shadcn to a portable skill; changing shadcn's content; adding a native
      sync command to `skills.mjs`.

## Implementation Description

Copy the existing `.agents/skills/shadcn/` tree byte-for-byte into `skills/shadcn/`,
`.claude/skills/shadcn/`, and `.opencode/skills/shadcn/` so all four roots hold identical copies of
the native skill. `skills-lock.json` already lists `shadcn` (canonical `skillPath: skills/shadcn/SKILL.md`),
which now exists.

## Acceptance Criteria

- [x] `shadcn` is present in all four skill roots.
- [x] The four copies are byte-for-byte identical.
- [x] `pnpm skills:check` still passes and still reports the same portable-skill count (native skill
      stays excluded).
- [x] `shadcn` is absent from the portable manifest `.skills-sync.json` and present in `skills-lock.json`.
- [x] `just check` passes.

## Small Task and Test Map

| Small task or rule                          | Source                        | Test IDs        | Ready |
| ------------------------------------------- | ----------------------------- | --------------- | ----- |
| shadcn present in all four roots            | user request; AGENTS.md roots | TEST-SHADCN-001 | Ready |
| four copies byte-for-byte identical         | AGENTS.md "byte-for-byte"     | TEST-SHADCN-002 | Ready |
| portable check still green, native excluded | scripts/skills.mjs checkRoot  | TEST-SHADCN-003 | Ready |
| manifest excludes shadcn; lock includes it  | skills.mjs listPortableSkills | TEST-SHADCN-004 | Ready |
| full repo gate passes                       | Justfile `check`              | TEST-SHADCN-005 | Ready |

## Exact Test Cases To Complete

- [x] TEST-SHADCN-001: shadcn present in every skill root
  - Small task: vendor shadcn into all four roots
  - Source: user request; AGENTS.md "four roots must always be byte-for-byte identical"
  - Test place: shell check from repo root
  - Starting state: shadcn only in `.agents/skills/`
  - Exact input or fixture: the 15-file `.agents/skills/shadcn/` tree
  - Interaction steps: copy the tree into the other three roots, then test each directory exists
  - Main behavior: presence of `shadcn/` in each root
  - Expected result: all four report `present`
  - Must change: `skills/shadcn/`, `.claude/skills/shadcn/`, `.opencode/skills/shadcn/` created
  - Must not happen: no change to shadcn file contents
  - Planned command: `for r in skills .agents/skills .claude/skills .opencode/skills; do test -d "$r/shadcn" && echo ok || echo MISSING; done`
  - Expected result before the code change: three `MISSING`
  - First observed run: 2026-08-16 — skills/.claude/.opencode = MISSING, .agents = present
  - Passing rerun: 2026-08-16 — all four roots report `present`

- [x] TEST-SHADCN-002: the four copies are byte-for-byte identical
  - Small task: identical vendored copies
  - Source: AGENTS.md byte-for-byte rule
  - Test place: shell `diff -r` from repo root
  - Starting state: only `.agents` copy exists
  - Exact input or fixture: the four `shadcn/` trees after copy
  - Interaction steps: `diff -r` each root against `.agents/skills/shadcn`
  - Main behavior: content equality across roots
  - Expected result: no diff output; exit 0 for each comparison
  - Must change: nothing further
  - Must not happen: no symlinks introduced (AGENTS.md forbids symlinks)
  - Planned command: `for r in skills .claude/skills .opencode/skills; do diff -r .agents/skills/shadcn "$r/shadcn" && echo "$r ok"; done; find skills/shadcn .claude/skills/shadcn .opencode/skills/shadcn -type l`
  - Expected result before the code change: diff errors (target dirs absent)
  - First observed run: 2026-08-16 — target dirs absent before copy
  - Passing rerun: 2026-08-16 — `diff -r` identical for all three roots; 0 symlinks; 15 files each root

- [x] TEST-SHADCN-003: portable check stays green with the native skill excluded
  - Small task: do not break skills:check
  - Source: `scripts/skills.mjs` `checkRoot`/`listPortableSkills`
  - Test place: `pnpm skills:check`
  - Starting state: 16 portable skills synchronized; shadcn native/excluded
  - Exact input or fixture: repository skill roots after the copy
  - Interaction steps: run `pnpm skills:check`
  - Main behavior: portable validation ignores shadcn and still finds identical portable sets
  - Expected result: exits 0, "Validated 16 portable skill(s)."
  - Must change: nothing
  - Must not happen: shadcn must not be counted or rejected
  - Planned command: `pnpm skills:check`
  - Expected result before the code change: passes with 16 (shadcn already excluded)
  - First observed run: 2026-08-16 — `pnpm skills:check` → "Validated 16 portable skill(s)."
  - Passing rerun: 2026-08-16 — after vendoring, `pnpm skills:check` → "Validated 16 portable skill(s)."

- [x] TEST-SHADCN-004: manifest excludes shadcn, lock includes it
  - Small task: keep native/portable separation intact
  - Source: `skills.mjs` native-lock handling
  - Test place: shell grep
  - Starting state: `.skills-sync.json` has no shadcn; `skills-lock.json` has shadcn
  - Exact input or fixture: both JSON files after the copy
  - Interaction steps: grep both files for `"shadcn"`
  - Main behavior: separation preserved
  - Expected result: `.skills-sync.json` → 0 matches; `skills-lock.json` → 1 match
  - Must change: nothing (no manifest edit expected)
  - Must not happen: shadcn must not be added to `.skills-sync.json`
  - Planned command: `grep -c '"shadcn"' .skills-sync.json; grep -c '"shadcn"' skills-lock.json`
  - Expected result before the code change: 0 and 1
  - First observed run: 2026-08-16 — `.skills-sync.json`=0, `skills-lock.json`=1
  - Passing rerun: 2026-08-16 — after vendoring, `.skills-sync.json`=0, `skills-lock.json`=1

- [x] TEST-SHADCN-005: full repository gate passes
  - Small task: no regression
  - Source: `Justfile` `check`
  - Test place: `just check`
  - Starting state: repo green before change
  - Exact input or fixture: full working tree after the copy
  - Interaction steps: run `just check`
  - Main behavior: lint + typecheck + format-check + skills-check + skills-test + template-test
  - Expected result: exit 0
  - Must change: nothing beyond the vendored files
  - Must not happen: no new lint/format failures from the vendored tree
  - Planned command: `just check`
  - Expected result before the code change: exit 0 (baseline already green)
  - First observed run: 2026-08-16 — `just check` FAILED at format-check (25 vendored + checklist files); fixed via TEST-SHADCN-006
  - Passing rerun: 2026-08-16 — `just check` exit 0 (176 tests pass; only the pre-existing web:lint warning, 0 errors)

## Missing-Case Review

- [x] Normal valid values and successful results: TEST-SHADCN-001..005
- [x] Duplicate value (skill already in one root): TEST-SHADCN-001/002 (copy is idempotent overwrite)
- [x] Required file changes: TEST-SHADCN-001 (three new trees)
- [x] Work that must not happen (content edits, manifest pollution, symlinks): TEST-SHADCN-002/004
- [x] Existing behavior that must keep working (skills:check, just check): TEST-SHADCN-003/005
- [x] Formatting of vendored Markdown under prettier: covered by TEST-SHADCN-005 (`format:check`).
- [x] Open question — `skills-lock.json.computedHash` provenance: no code consumes it; leaving it
      unchanged. Recorded in Risks.

## Verification

- [x] Run each planned command and record results against its test ID in Validation Notes.
- [x] Record failures before corrections; record passing reruns before completing items.
- [x] Run `just check`.
- [x] Review the diff and re-scan this checklist for stale items.

## Validation Notes

- 2026-08-16 — TEST-SHADCN-001/002/003/004 passed on first run: all four roots present, `diff -r`
  identical (15 files each), no symlinks, `pnpm skills:check` → "Validated 16 portable skill(s).",
  `.skills-sync.json` shadcn=0, `skills-lock.json` shadcn=1.
- 2026-08-16 — TEST-SHADCN-005 First observed run: `just check` FAILED at `format-check`. Prettier
  flagged 25 files — the vendored `shadcn/**` under `skills/`, `.claude/skills/`, `.opencode/skills/`
  (upstream content, not Prettier-formatted) plus this checklist. Root cause: `.prettierignore` only
  exempted `.agents/skills/shadcn`, not the other roots. Scope change recorded as TEST-SHADCN-006.

## Discovered Work

- [x] TEST-SHADCN-006: `.prettierignore` exempts the vendored shadcn tree in every root
  - Small task: keep vendored shadcn content verbatim (do not reformat) and preserve byte-identity
  - Source: existing `.prettierignore` precedent (`.agents/skills/shadcn`); AGENTS.md byte-for-byte rule
  - Test place: `pnpm format:check` and `just check`
  - Starting state: only `.agents/skills/shadcn` ignored; other roots flagged by Prettier
  - Exact input or fixture: `.prettierignore` plus the four vendored trees
  - Interaction steps: add `skills/shadcn`, `.claude/skills/shadcn`, `.opencode/skills/shadcn` to
    `.prettierignore`; format this checklist with Prettier
  - Main behavior: Prettier ignores vendored shadcn in all roots; authored docs stay formatted
  - Expected result: `pnpm format:check` passes; vendored files unchanged (still identical to `.agents`)
  - Must change: `.prettierignore`; this checklist reformatted
  - Must not happen: no edits to any `shadcn/**` content; the four copies stay identical
  - Planned command: `pnpm format:check` then `diff -r .agents/skills/shadcn skills/shadcn`
  - Expected result before the code change: format:check fails on vendored shadcn files
  - First observed run: 2026-08-16 — format:check failed (25 files, see above)
  - Passing rerun: 2026-08-16 — `pnpm format:check` clean; `diff -r` confirms vendored trees unchanged and identical across roots

## Risks and Follow-Up

- [x] `skills-lock.json` `computedHash`/`source`/`skillPath` are metadata only — no code validates
      them. Left unchanged to avoid fabricating a value with unknown provenance. Follow-up: if a native
      lock verifier is ever added, recompute the hash then.
- [ ] The edit-time skill gate (`scripts/skill-gate.mjs`) matches `Edit|Write|MultiEdit|NotebookEdit`,
      not `Bash`; vendoring via `cp` is not gated. Acceptable here (skills were invoked), noted for
      awareness.
- [x] Consumer projects inherit shadcn automatically: skill roots and `skills-lock.json` are not in
      `copier.yml` `_exclude`. No separate propagation work needed.
