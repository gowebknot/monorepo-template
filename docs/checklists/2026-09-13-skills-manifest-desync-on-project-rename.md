# Skills manifest desyncs from renamed-project scope rewriting, breaking the first commit

Checklist ID: 2026-09-13-skills-manifest-desync-on-project-rename
Related checklists: [[2026-09-13-relative-import-check-blocks-first-commit]] (a different bug with the
same symptom — a fresh project's very first commit rejected by a mandatory pre-commit check),
[[2026-09-13-migrate-shipped-relative-imports-to-aliases]] (unrelated fix landed in the same prior
commit; not touched here)

## Change Tier

Tier: standard

## Context

The user generated a fresh project (`demo12312`) and ran `git commit -m "chore: initialize project"`
as their very first commit. The mandatory, hard-reject `skills:check --staged` pre-commit step (see
root `AGENTS.md`'s "Pre-commit hooks" section) failed with:

```
skills: Skill "create-minimal-package" does not match .skills-sync.json.
```

### Root cause

`copier.yml`'s only `_tasks` entry runs `node scripts/render-package-scope.mjs` immediately after
Copier finishes copying the template (before `pnpm install` ever runs). `renderPackageScope(root)`
walks the **entire** generated project tree (everything except `.git`, `.venv`, `dist`,
`node_modules`) and rewrites the literal text pattern `@monorepo-template/` to `@<project-scope>/` in
every text file it finds — with no exclusion for `skills/`, `.agents/skills/`, `.claude/skills/`, or
`.opencode/skills/`.

Four of this repository's own skills use `@monorepo-template/<name>` as an illustrative example of
this repo's own package-naming convention inside their prose (confirmed via
`grep -rl "monorepo-template" skills/*/SKILL.md skills/*/references/*.md`):

- `create-minimal-package` (`SKILL.md` and `references/minimal-package-pattern.md`)
- `end-to-end-api-flow` (`SKILL.md` and `references/layer-flow.md`)
- `frontend-standards` (`SKILL.md`)
- `jsx-component-extraction` (`SKILL.md`)

When a generated project's name differs from `monorepo-template` (essentially always), the scope
renderer silently rewrites these four skills' on-disk content in all four mirrored roots — but
`.skills-sync.json` (also shipped verbatim by Copier) still records the hash computed from the
**original, unrendered** content at authoring time in this repository. `skills:check`'s `checkRoot`
recomputes each skill's hash from current on-disk content and fails the very first name it finds that
does not match the manifest — alphabetically, `create-minimal-package` sorts before the other three
affected skills, which is why only it is named in the error (the other three are silently also
affected but never reached because `checkRoot` throws on the first mismatch).

This is 100% reproducible for every generated project whose name differs from `monorepo-template` —
confirmed by manually reproducing it against a scratch copy of this repository's own `skills/`,
`.agents/skills/`, `.claude/skills/`, `.opencode/skills/`, and `.skills-sync.json` with a
`package.json` named `"demo12312"`: running the real, unmodified `render-package-scope.mjs` followed
by the real, unmodified `skills.mjs check` reproduced the exact reported error message.

### Why not just stop rewriting the skills' text?

Leaving the four skills' `@monorepo-template/<name>` illustrative examples untouched after rename
would make their documentation actively wrong for the generated project: `create-minimal-package`
specifically instructs the reader that `pnpm package:create <name>` "sets `name` to
`@monorepo-template/<project-name>`" — a claim `render-package-scope.mjs` exists specifically to make
untrue (the whole point of the rename-fragile-imports fix landed earlier this session was to make
`package:create` actually emit `@<project-scope>/<name>`). The skill's example needs to track the
project's real scope; the manifest that verifies skill integrity needs to track whatever the skill's
real, current content is. Both are correct requirements; the bug is that only one of them currently
happens.

## Implementation Contract

### Feature Boundaries

- Included: after `render-package-scope.mjs` finishes rewriting file contents, recompute
  `.skills-sync.json`'s recorded hash for every skill it lists, based on the skill's current (already
  rendered) content under its own subdirectory of `skills/` — the canonical first synchronized root,
  which by construction of the uniform, extension-based tree walk always matches the other three
  mirrored roots byte-for-byte after rendering, so re-deriving from just one root is sufficient. Extract the
  hashing algorithm (`collectFiles`/`hashTree`) already used by `scripts/skills.mjs`'s
  `checkRoot`/`synchronize` into a new, dependency-free shared module (`scripts/skills-hash.mjs`) so
  both consumers can never independently drift out of sync on how a skill's hash is computed.
- Excluded: adding a second Copier `_tasks` entry that shells out to `scripts/skills.mjs sync`
  directly — that script's top-level `import { parseDocument } from "yaml"` requires `node_modules`,
  which does not exist yet when `_tasks` run (they run as part of `copier copy`, strictly before this
  CLI's own later `pnpm install --lockfile-only` step). Any fix must stay dependency-free, matching
  `render-package-scope.mjs`'s existing constraint (Node core only). Also excluded: re-auditing the
  rest of the repository for the pre-existing, unrelated multi-line-relative-import blind spot in
  `check-relative-imports.mjs` (`[^\n;]*?` cannot span newlines) beyond the one incidental instance
  inside the exact test file this fix touches (see Unresolved Conflicts).
- Ownership: `scripts/render-package-scope.mjs` owns generated-project scope rewriting;
  `scripts/skills.mjs` owns the skills-sync manifest format and its check/sync commands; the new
  `scripts/skills-hash.mjs` becomes the single shared owner of the hashing algorithm itself.

### Route-Group Ownership

Not applicable — a post-copy generation task and a pre-commit validation script, not an HTTP route.

### User Journey

1. A user generates a project named anything other than `monorepo-template` (the overwhelming common
   case) with any feature selection that includes at least one of the four affected skills (all four
   ship unconditionally to every project today, so effectively always).
2. Copier's post-copy task rewrites `@monorepo-template/` references in the four affected skills'
   prose to the project's own scope, and now also recomputes `.skills-sync.json` to match that
   rewritten content, in the same task run, before the user ever runs a command.
3. The user's first `git commit` runs the mandatory `skills:check --staged` step, which now finds
   every skill's on-disk content matching its manifest-recorded hash, and passes.
4. A user who instead names their project `monorepo-template` (the untouched-content edge case,
   already covered by `TEST-SCOPE-002`) sees no functional change: nothing rewrites, so the
   recomputed hash is identical to what was already recorded.

### Complete Test Matrix

| Test ID              | Path type | Small task                                                                               | Trigger                                                                                                                                                                   | Expected result                                                | Status |
| -------------------- | --------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------ |
| TEST-RENDERSCOPE-007 | happy     | `.skills-sync.json` is recomputed to match rendered skill content after a real rename    | `renderPackageScope(root)` against a fixture using the real `create-minimal-package` skill content, then `checkRoot(root)` from the real, unmodified `scripts/skills.mjs` | `checkRoot` resolves without throwing                          | Passed |
| TEST-RENDERSCOPE-008 | edge      | Missing `.skills-sync.json` (a stripped-down fork) does not crash the render task        | `renderPackageScope(root)` against a fixture with no manifest file present                                                                                                | Resolves normally; no file is created                          | Passed |
| TEST-SKILLSHASH-001  | happy     | Extracted `hashTree` produces the same digest as before extraction for identical content | `hashTree(path)` on two structurally identical directories                                                                                                                | Equal hex digests                                              | Passed |
| TEST-SKILLSHASH-002  | happy     | `hashTree` digests differ when content differs                                           | `hashTree(path)` on two directories differing by one byte                                                                                                                 | Different hex digests                                          | Passed |
| TEST-SKILLSHASH-003  | invalid   | A symlink inside the tree is rejected, matching the pre-extraction behavior              | `hashTree(path)` on a directory containing a symlink                                                                                                                      | Throws with the existing "Symlinks are not allowed..." message | Passed |
| (regression)         | happy     | Existing `scripts/skills.test.mjs` suite is unaffected by the extraction                 | `node --test scripts/skills.test.mjs`                                                                                                                                     | All existing tests still pass                                  | Passed |
| (regression)         | happy     | Existing `scripts/render-package-scope.test.mjs` suite is unaffected                     | `node --test scripts/render-package-scope.test.mjs`                                                                                                                       | All existing tests still pass                                  | Passed |

### Unresolved Conflicts

None found. One incidental item was considered and given a winning decision rather than left open:
`scripts/render-package-scope.test.mjs` has a pre-existing multi-line relative import that the
earlier alias-migration's `TEST-ALIASMIG-001` did not catch (`check-relative-imports.mjs`'s regex
cannot span newlines, a known, already-documented tool limitation, not a new discovery). Winning
decision: since this exact file is being edited directly for this fix's new tests, its own import is
corrected as a small incidental cleanup in the same edit, not as a repository-wide re-audit (which
stays out of scope, per Feature Boundaries above).

## Acceptance Criteria

- [x] `scripts/skills-hash.mjs` exists, exporting `collectFiles`/`hashTree` with identical behavior to
      the code it replaces in `scripts/skills.mjs`.
- [x] `scripts/skills.mjs` imports the shared hashing helpers instead of defining them locally; its
      own full test suite still passes unmodified.
- [x] `scripts/render-package-scope.mjs` recomputes `.skills-sync.json` after rendering, using the
      shared hashing helper, guarded against a missing manifest or missing `skills/` directory.
- [x] A real generated-project reproduction (scratch copy of this repo's skill roots + a renamed
      `package.json`) that previously failed `skills:check` now passes it after the fix, with no
      manual `pnpm skills:sync` needed.
- [x] `just check` passes.

## Validation Notes

- `node --test scripts/render-package-scope.test.mjs` — 8/8 passed (TEST-RENDERSCOPE-001 through 008).
- `node --test scripts/skills-hash.test.mjs` — 3/3 passed (TEST-SKILLSHASH-001/002/003).
- `node --test scripts/skills.test.mjs` — 4/4 passed, unaffected by the extraction.
- `pnpm skills:test` — 168/168 passed.
- `pnpm --filter create-mono-stack test` — 309/309 passed, unaffected (this fix touches only root
  `scripts/`, not `core/create-mono-stack`).
- `just check` — exit 0.
- Real end-to-end reproduction: a scratch copy of this repository's full `skills/`, `.agents/skills/`,
  `.claude/skills/`, `.opencode/skills/`, `.skills-sync.json`, and `skills-lock.json` with
  `package.json` renamed to `"demo12312"` (matching the user's actual project name) — before the fix,
  the real `skills.mjs check` failed with the exact reported message; after the fix, the real
  `render-package-scope.mjs` followed by the real `skills.mjs check` printed
  `Validated 20 portable skill(s).` and exited 0.

## Exact Test Cases

### TEST-RENDERSCOPE-007

- Small task: prove the manifest is recomputed to match rendered content, not left stale.
- Source: the user's reported failure; `scripts/skills.mjs`'s `checkRoot`.
- Test place: `scripts/render-package-scope.test.mjs`.
- Starting state: a temp directory containing real copies of `skills/create-minimal-package`,
  `.agents/skills/create-minimal-package`, `.claude/skills/create-minimal-package`, and
  `.opencode/skills/create-minimal-package` (all byte-identical, as in the real repository), a
  `package.json` named `"acme"`, and a `.skills-sync.json` recording that skill's hash computed from
  the **original, unrendered** content.
- Exact input or fixture: the real `create-minimal-package` skill tree (contains a literal
  `@monorepo-template/<project-name>` reference).
- Interaction steps: call `renderPackageScope(root)`, then call `checkRoot(root)` (imported from
  `#scripts/skills.mjs`).
- Main behavior: after rendering, the manifest's recorded hash for `create-minimal-package` matches
  its new, rewritten content.
- Expected result: `checkRoot(root)` resolves without throwing.
- Must change: `.skills-sync.json`'s hash for `create-minimal-package` in the fixture directory.
- Must not happen: `checkRoot` throwing `Skill "create-minimal-package" does not match
.skills-sync.json.`.
- Planned command: `node --test scripts/render-package-scope.test.mjs`.
- Expected result before the code change: fails — `checkRoot` throws the exact reported error,
  reproducing the user's bug automatically.
- First observed run: manually reproduced (not yet as an automated test) against a scratch copy of
  the real skill roots with `package.json` named `"demo12312"`: running the real, unmodified
  `render-package-scope.mjs` followed by the real, unmodified `skills.mjs check` printed exactly
  `skills: Skill "create-minimal-package" does not match .skills-sync.json.` and exited 1.
- Passing rerun: Passed. `node --test scripts/render-package-scope.test.mjs` — 8/8 tests passed,
  including `TEST-RENDERSCOPE-007`. Additionally re-ran the full manual reproduction after the fix,
  this time copying **all** skill roots (all 20 skills, not just `create-minimal-package`) into the
  scratch copy with `package.json` named `"demo12312"`: the fixed `render-package-scope.mjs` rewrote
  all four affected skills (`create-minimal-package`, `end-to-end-api-flow`, `frontend-standards`,
  `jsx-component-extraction`) to `@demo12312/...`, and the real, unmodified `skills.mjs check`
  printed `Validated 20 portable skill(s).` and exited 0 — the exact end-to-end scenario the user hit,
  now passing.

### TEST-RENDERSCOPE-008

- Small task: the render task must not crash when there is no skills-sync manifest to update.
- Source: defensive-coding parity with `scripts/skills.mjs`'s own `readManifest`, which already
  tolerates a missing manifest file.
- Test place: `scripts/render-package-scope.test.mjs`.
- Starting state: a temp directory with only a `package.json` (no `.skills-sync.json`, no `skills/`
  directory at all).
- Exact input or fixture: `{ "name": "acme" }`.
- Interaction steps: call `renderPackageScope(root)`.
- Main behavior: the render step completes normally with nothing to reconcile.
- Expected result: the call resolves; no `.skills-sync.json` file is created.
- Must change: nothing beyond what `renderPackageScope` already did before this fix.
- Must not happen: an ENOENT crash reading a manifest or skills directory that does not exist.
- Planned command: `node --test scripts/render-package-scope.test.mjs`.
- Expected result before the code change: N/A — this behavior does not exist yet; the case exists to
  lock in the new code's defensiveness, not to reproduce a prior bug.
- First observed run: N/A (new-behavior case, not a regression reproduction).
- Passing rerun: Passed, as part of the same `node --test scripts/render-package-scope.test.mjs` run
  above (8/8 passed).

### TEST-SKILLSHASH-001 through 003

- Small task: confirm the extracted hashing module preserves the exact behavior it replaces.
- Source: `scripts/skills.mjs`'s pre-extraction `collectFiles`/`hashTree` implementation.
- Test place: new `scripts/skills-hash.test.mjs`.
- Starting state: temp directories built per case (identical trees, one-byte-different trees, a tree
  containing a symlink).
- Exact input or fixture: small synthetic file trees created per case.
- Interaction steps: call `hashTree(path)` on each fixture and compare/assert as described.
- Main behavior: hashing is deterministic, content-sensitive, and rejects symlinks exactly as before.
- Expected result: see the matrix above.
- Must change: nothing (pure read-only hashing).
- Must not happen: a silent behavior change from the pre-extraction implementation.
- Planned command: `node --test scripts/skills-hash.test.mjs`.
- Expected result before the code change: the module does not exist yet — N/A, this is new coverage
  for newly extracted code, not a regression reproduction.
- First observed run: N/A.
- Passing rerun: Passed. `node --test scripts/skills-hash.test.mjs` — 3/3 tests passed.

## Missing-Case Review

1. Every small task maps to a test ID above; the two "regression" rows guard the two existing test
   suites this change touches indirectly.
2. No new user-facing contract, schema, route, or authorization surface is introduced; this is
   generation-time tooling and a repository maintenance script.
3. Boundary cases considered: missing manifest, missing skills directory, project renamed vs. project
   left as `monorepo-template` (no-op case, already covered by the existing `TEST-SCOPE-002`).
4. No retry/duplicate/permission cases apply — this is a single deterministic filesystem pass with no
   external state.
