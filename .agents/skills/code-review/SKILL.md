---
name: code-review
description: "Use when reviewing a change, pull request, patch, refactor, migration, configuration update, dependency change, or release preparation. Prioritize correctness, security, behavioral regressions, contract and boundary violations, data-loss risks, test gaps, maintainability problems, and missing validation; report concrete, actionable findings with file and line references before summarizing the change."
---

# Code Review

Review changes for defects and risk, not merely for style preference.

## Review Order

1. Read repository and package guidance before evaluating the change.
2. Inspect the complete diff and relevant surrounding code, tests, contracts, configuration, and
   callers. Do not review only the changed lines.
3. Verify the intended behavior against the task, acceptance criteria, and public interfaces.
4. Trace changed data and control flow across package, process, persistence, and user boundaries.
5. Run or inspect focused validation and identify missing cases.

## Findings

Prioritize findings in this order:

- Data loss, security vulnerabilities, authorization bypasses, or unsafe external effects.
- Incorrect behavior, broken contracts, race conditions, failure handling, or compatibility breaks.
- Missing migrations, incomplete rollout handling, or incorrect configuration and environment use.
- Missing tests for important behavior, error paths, boundaries, or regressions.
- Maintainability problems that make defects likely or violate repository architecture.

Each finding must include the file and line reference, concrete problem, impact, and recommended fix.
Distinguish confirmed defects from questions or residual risks. Do not report formatting preferences as
findings when automated tooling already owns that concern.

## Review Boundaries

- Check public exports, runtime validation, authorization, error mapping, logging, redaction, retries,
  idempotency, and resource cleanup when relevant.
- Check that tests assert behavior rather than implementation details and that mocks do not hide broken
  integration boundaries.
- Check changed files remain under 300 lines and retain one cohesive responsibility.
- Check documentation, checklist statuses, release notes, and generated artifacts when the change
  affects them.
- Flag any use of `--no-verify`, `--no-hooks`, `HUSKY=0`, skipped hooks, disabled checks, or equivalent
  validation bypasses.
- Treat an unauthorized commit, amend, push, force-push, tag, publish, release, or deploy as a
  repository-process violation.

## Report

List findings first, ordered by severity. Then list open questions, assumptions, testing gaps, and a
brief change summary. If no findings exist, state that explicitly and identify residual risks or
validation gaps.
