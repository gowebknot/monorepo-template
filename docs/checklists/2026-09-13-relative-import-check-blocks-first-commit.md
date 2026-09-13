# Fix: staged relative-import check blocks every generated project's first commit

Checklist ID: 2026-09-13-relative-import-check-blocks-first-commit
Related checklists: none prior (new bug class)

## Change Tier

Tier: standard

## Context

User ran `git commit -m "chore: initialize project"` in a freshly generated project
(`jump-cloud-demo-2`) — exactly the step `create-mono-stack`'s own printed next-steps instruct — and
the pre-commit hook's `imports:check` step rejected the commit, listing well over a hundred relative
imports across `apps/dashboard/reference/**`, `apps/server/**`, `packages/env/**`,
`packages/api-client/**`, `scripts/**`, and more — effectively the entire generated codebase.

Root cause: `scripts/check-relative-imports.mjs`'s `getStagedSourceFiles()` runs
`git diff --cached --name-only`, which (confirmed empirically) returns **every** staged file when no
commit exists yet — `git diff --cached` compares the index against the empty tree in that case, not
against a prior commit. The check has no baseline file; it treats "not yet committed" content as
"newly added," so on a project's very first commit — before `git rev-parse --verify HEAD` can even
resolve — literally every file in the generated tree is staged for the first time and gets scanned
against the "no relative imports" rule. Reference content (`reference/` directories, shadcn UI
primitives, `packages/env`, `packages/api-client`, repo dev scripts) legitimately uses relative
imports internally (matching upstream conventions or this repo's own barrel-file exception in spirit),
and the check was only ever designed to flag _new_ violations introduced against an _existing_,
already-committed baseline (per `AGENTS.md`: "it intentionally permits existing baseline violations so
they can be migrated incrementally") — a baseline that, on a fresh `git init`, does not exist yet. This
means **every** generated project's mandatory first commit has always failed this way; it was never
caught because the only test that exercises a real end-to-end generation-then-commit cycle
(`copier-template.integration.test.js`) is Docker-based and has not been run in this session (or,
apparently, verified recently by anyone, given how directly this reproduces).

Confirmed empirically: `git diff --cached --name-only` in a repo with staged files but no commits
returns all of them (exit 0, not an error) — there is no natural "nothing to compare against" failure
that would have made this obvious without actually generating and committing a project.

## Implementation Contract

### Feature Boundaries

- Included: `scripts/check-relative-imports.mjs`'s `getStagedSourceFiles` (skip entirely when no
  commit exists yet, i.e. `git rev-parse --verify HEAD` fails).
- Excluded: rewriting the flagged reference/vendored content to use aliases (a separate, much larger,
  and largely unnecessary cleanup — most of these files are intentionally self-contained reference
  content); any change to the rule's behavior for a repository that already has a first commit
  (unaffected — this only changes behavior when `HEAD` cannot be resolved at all).
- Ownership: this script is repo dev-tooling, copied as-is into every generated project.

### Route-Group Ownership

Not applicable — a Git pre-commit hook script, not an HTTP route.

### User Journey

1. A user generates a project with `create-mono-stack`, then runs the CLI's own printed next step:
   `git add . && git commit -m "chore: initialize project"`.
2. The pre-commit hook's `imports:check` step now recognizes there is no prior commit and skips the
   relative-import scan entirely; the commit proceeds (assuming other checks pass).
3. Every subsequent commit in that project checks staged files against the rule exactly as before,
   with the first commit's content now correctly treated as the established baseline.

### Complete Test Matrix

| Test ID          | Path type | Small task                                                            | Trigger                                                                  | Expected result                                 | Status |
| ---------------- | --------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------- | ------ |
| TEST-IMPORTS-001 | non-happy | `getStagedSourceFiles` returns nothing when there is no commit yet    | Real temp git repo, `git init` + stage a relative-import file, no commit | Empty array; `checkFiles` reports zero failures | Passed |
| TEST-IMPORTS-002 | happy     | `getStagedSourceFiles` behaves exactly as before once a commit exists | Same repo, commit once, then stage a _new_ relative-import file          | The new file is still reported (no regression)  | Passed |

### Unresolved Conflicts

None found.

## Acceptance Criteria

- [x] `getStagedSourceFiles` skips the scan entirely when `git rev-parse --verify HEAD` fails (no
      commit yet), fixing every generated project's first commit.
- [x] Once a first commit exists, behavior is unchanged — new relative imports in later commits are
      still caught.
- [x] `node --test scripts/check-relative-imports.test.mjs` passes (5/5).
- [x] `pnpm imports:check` (this repo's own, now with a real `HEAD`) is unaffected — still passes.
- [x] `just check` passes.

## Exact Test Cases

### TEST-IMPORTS-001

- Small task: skip the check entirely before any commit exists.
- Source: the reported failure (`jump-cloud-demo-2`'s first `git commit` rejected due to ~150
  pre-existing reference/vendored relative imports).
- Test place: `scripts/check-relative-imports.test.mjs`.
- Starting state: a real `mkdtemp` directory, `git init`, one file with a relative import staged via
  `git add`, no commit made.
- Exact input or fixture: `getStagedSourceFiles(tempRepoRoot)`.
- Interaction steps: call the function against the temp repo before any commit exists.
- Main behavior: `git rev-parse --verify HEAD` fails (no such ref), so the function returns `[]`
  without even calling `git diff --cached`.
- Expected result: `[]`.
- Must change: nothing (read-only against the temp repo).
- Must not happen: the staged file appearing in the result.
- Planned command: `node --test scripts/check-relative-imports.test.mjs`.
- Expected result before the code change: fails — the staged file is returned, reproducing the exact
  reported bug.
- First observed run: Passed, unexpectedly — before the fix, `getStagedSourceFiles()` took no `cwd`
  argument at all, so the test's `getStagedSourceFiles(root)` silently ran `git diff --cached` against
  this repo's own real working directory (which had nothing staged at that moment), giving a
  coincidentally-correct empty result rather than exercising the temp repo. Recognized as a false
  pass caused by the missing parameter, not evidence the bug was already fixed; confirmed directly by
  running `node scripts/check-relative-imports.mjs --staged` inside a real temp repo with a staged
  relative-import file and no commit, which reproduced the exact reported failure (non-zero exit,
  violation listed).
- Passing rerun: Passed — after adding the `cwd` parameter and the `hasInitialCommit` guard, the test
  genuinely exercises the temp repo and returns `[]`; separately re-ran the same real-temp-repo CLI
  reproduction above against the fixed script and confirmed exit code 0 with no output.

### TEST-IMPORTS-002

- Small task: once a first commit exists, the check behaves exactly as before (no regression).
- Source: same file/behavior, opposite condition.
- Test place: `scripts/check-relative-imports.test.mjs`.
- Starting state: same temp repo, but now commit the first file, then stage a _second_ new file with
  a relative import.
- Exact input or fixture: `getStagedSourceFiles(tempRepoRoot)` called after the commit.
- Interaction steps: commit, stage a new file, call the function.
- Main behavior: `git rev-parse --verify HEAD` now succeeds, so the normal `git diff --cached` path
  runs exactly as before.
- Expected result: the array contains the newly staged file (not the already-committed one).
- Must change: nothing external.
- Must not happen: the already-committed first file reappearing (would indicate the diff base broke).
- Planned command: `node --test scripts/check-relative-imports.test.mjs`.
- Expected result before the code change: passes already (this path is unaffected by the bug) — locked
  in as a regression guard before touching the function.
- First observed run: Failed before the fix — same root cause as TEST-IMPORTS-001's missing `cwd`
  parameter, but in the opposite direction: the test expected `["second.ts"]` but got `[]`, since the
  unfixed function ignored `root` and checked this repo's own (empty at the time) staged set instead
  of the temp repo's.
- Passing rerun: Passed, 5/5 in the full file, after adding the `cwd` parameter.
