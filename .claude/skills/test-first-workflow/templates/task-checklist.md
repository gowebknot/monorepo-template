# <Task Type>: <Task Title>

- Checklist ID: CHECKLIST-<YYYYMMDD>-<task-slug>
- Created: <YYYY-MM-DD>
- Planning completed: <YYYY-MM-DD>
- Type: <Task | Bug | Documentation | Configuration | Other>
- Source request: <short description or issue reference>
- Related checklists:
  - Origin: <link or `None`>
- Affected paths: <packages, apps, or files>
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Planning Record

- [ ] Confirm the planning phase was completed before creating this checklist.
  - [ ] Read the task request and applicable repository and package guidance.
  - [ ] For a bug, read relevant previous checklists, updates, implementations, and tests.
  - [ ] Define acceptance criteria, validation cases, implementation approach, dependencies, and risks.
- [ ] Confirm this checklist captures the completed plan before implementation begins.
  - [ ] Keep implementation work in this checklist's nested items.
  - [ ] Add a checklist item before making any scope or approach change.

## Context and Scope

- [ ] Define the problem or requested outcome.
- [ ] Record relevant existing behavior.
  - [ ] Record constraints and non-goals.
  - [ ] Record affected package, application, module, and public boundaries.

## Acceptance Criteria

- [ ] <Acceptance criterion>
  - [ ] <Supporting behavior>
    - [ ] <Detailed case or constraint>

## Validation Cases

- [ ] TEST-<AREA>-001: <happy-path behavior>
  - [ ] <assertion or observable result>
- [ ] TEST-<AREA>-002: <rejection, malformed, or error behavior>
  - [ ] <assertion or observable result>
- [ ] <Add boundary, authorization, state-transition, retry, idempotency, or compatibility cases when applicable>

## Implementation Plan

- [ ] <Workstream>
  - [ ] <Implementation step>
    - [ ] <Detailed sub-step>
- [ ] Preserve all affected contracts, consumers, and integration boundaries.
- [ ] Record links to related implementation files and prior checklists.

## Verification

- [ ] Confirm implementation followed the new checklist.
- [ ] Run focused tests or the applicable validation check.
- [ ] Record the observed result, including failures, before making corrections.
- [ ] Fix failures, rerun the relevant checks, and record the final result.
- [ ] Run affected package checks.
- [ ] Run required repository checks.
- [ ] Review the complete diff and re-scan this checklist for stale items.

## Validation Notes

Record active-task validation results here. Record each failure before correcting it, then record the
passing rerun before marking the related item complete. Keep these notes editable while the checklist
is uncommitted.

## Risks and Follow-Up

- [ ] <Risk, unresolved question, environment dependency, or follow-up>

If a later task corrects committed work, append a dated `## Updates` section at the bottom of this
file. Preserve all earlier plans, checklist items, and statuses.
