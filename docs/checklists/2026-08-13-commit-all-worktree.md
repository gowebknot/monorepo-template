# Commit All Current Worktree Changes

- Checklist ID: CHECKLIST-20260813-commit-all-worktree
- Created: 2026-08-13
- Type: Commit checklist
- Source request: Commit every current worktree change.
- Related records:
  - [Detailed test planning](./2026-08-12-detailed-test-planning.md)
  - [Hybrid native reference profiles](./2026-08-12-hybrid-native-reference-profiles.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

Commit the complete current worktree snapshot, including native Vite/Nest scaffolding and reference
profiles, generated-template update tooling, portable test-planning policy improvements, synchronized
skill roots, focused policy tests, documentation, and validation records.

## Exact Acceptance Cases

- [x] TEST-COMMIT-001: Every tracked and untracked worktree path present before staging is included in
      the staged snapshot.
  - Small task: Stage the complete user-authorized worktree.
  - Source: User request.
  - Test place: Git status and staged file inventory.
  - Starting state: Current worktree inventory captured before staging.
  - Exact input or fixture: `git status --short` path list.
  - Interaction steps: Stage all files, then compare staged paths with the pre-stage inventory.
  - Main behavior: Preserve every current change in the commit.
  - Expected result: No current path is omitted or unexpectedly added.
  - Must change: Git index contains every current change.
  - Must not happen: No secrets, caches, or generated transient files are included.
  - Planned command: `git add -A && git diff --cached --name-status`.
  - Expected result before the code change: The index does not yet contain all worktree changes.
  - First observed run: Staged the complete pre-stage inventory with `git add -A`; the staged name-status
    inventory contains all 51 current paths and no transient files or credentials.
  - Passing rerun: `git diff --cached --name-status`, `git diff --cached --check`, and `git status --short`
    confirmed the complete staged snapshot.
- [x] TEST-COMMIT-002: Required repository validation passes or its exact blocker is documented.
  - Small task: Validate the complete snapshot.
  - Source: `AGENTS.md` repository checks and affected package guidance.
  - Test place: Root and affected package commands.
  - Starting state: Complete worktree staged or ready to stage.
  - Exact input or fixture: Current repository and generated-template fixtures.
  - Interaction steps: Run focused tests, package tests, lint, typecheck, formatting, sync checks, and
    whitespace validation.
  - Main behavior: Confirm the staged snapshot is commit-ready.
  - Expected result: Checks pass, or failures identify only documented environmental/unrelated blockers.
  - Must change: Only generated validation artifacts allowed by existing commands.
  - Must not happen: No validation bypasses, commits with skipped hooks, or external publishing.
  - Planned command: `just check` plus affected focused commands.
  - Expected result before the code change: Existing worktree may contain known formatting failures.
  - First observed run: `just check` completed successfully after formatting the affected native-scaffold
    and checklist files. The check reported one existing React Compiler warning, but no errors.
  - Passing rerun: `just check`; focused create-mono-stack tests passed 154/154, skills tests passed 140/140,
    core template tests passed 1/1, and staged whitespace validation passed.
- [ ] TEST-COMMIT-003: The commit has a Conventional Commit subject and contains no credentials.
  - Small task: Create the authorized commit.
  - Source: Repository commit rules and user authorization.
  - Test place: Staged diff review and commit hook.
  - Starting state: Intended files staged and reviewed.
  - Exact input or fixture: Staged diff and `feat`/`fix`/`docs`/`chore` scope.
  - Interaction steps: Inspect staged diff and recent history, then run `git commit` without bypasses.
  - Main behavior: Record one complete commit.
  - Expected result: Commit succeeds with a valid Conventional Commit subject.
  - Must change: Git history gains one commit containing the complete snapshot.
  - Must not happen: No amend, push, publish, tag, or hook bypass.
  - Planned command: `git commit -m "feat(template): add native reference profiles and test planning policy"`.
  - Expected result before the code change: No new commit exists for this snapshot.
  - First observed run: Pending.
  - Passing rerun: Pending.

## Final Review

- [ ] Confirm staged diff and status after commit.
- [ ] Confirm the new commit appears in recent history.
- [ ] Record any residual external blocker without changing unrelated work.
