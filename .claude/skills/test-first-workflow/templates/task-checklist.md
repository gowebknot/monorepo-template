# <Task Type>: <Task Title>

- Checklist ID: CHECKLIST-<YYYYMMDD>-<implementation-summary-slug>
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
  - [ ] Find rules in the request, schemas, validators, types, existing tests, code, and documentation.
  - [ ] Split large work into small items that can each be tested on their own.
  - [ ] Define exact cases, implementation steps, dependencies, and risks.
- [ ] Confirm this checklist captures the completed plan before implementation begins.
  - [ ] Keep implementation work in this checklist's nested items.
  - [ ] Add a checklist item before making any scope or approach change.
  - [ ] Do not begin while a small task is still broad, a known rule has no case, or an expected result
        is unknown.

Use plain English throughout this checklist. If a technical term is unavoidable, explain it in simple
words the first time it appears.

If trusted sources disagree, check whether repository guidance clearly says which source wins. If it
does not, record the conflict, ask the user, and block the affected work until it is resolved.

## Context and Scope

- [ ] Define the problem or requested outcome.
- [ ] Record relevant existing behavior.
  - [ ] Record constraints and non-goals.
  - [ ] Record affected package, application, module, and public boundaries.

## Implementation Description

For a checklist covering a commit or release, describe the concrete implementation included in that
commit or release here. A commit or release does not require a checklist solely because it exists.

- <Implementation summary, or `Not applicable` for other checklist types>

## Acceptance Criteria

- [ ] <Acceptance criterion>
  - [ ] <Supporting behavior>
    - [ ] <Detailed case or constraint>

## Small Task Breakdown

Use as many checklist levels as needed. Split an item again when two parts could pass or fail
separately. Every smallest item must have one clear result and link to exact test IDs.

- [ ] <Requested result or large work area>
  - [ ] <User-visible or system-visible behavior>
    - [ ] <Separate rule, choice, success path, failure path, or state change>
      - [ ] <Smallest task with one result that can be tested on its own>
        - Test IDs: <TEST-AREA-001, TEST-AREA-002>
        - Ready: <Yes, or explain what must still be split or answered>

## Rules and Open Questions

- [ ] <Rule written in exact terms>
  - Source: <request, schema, validator, type, test, code, or documentation link>
  - Test IDs: <TEST-AREA-001>
- [ ] <Open question about an expected result>
  - Sources checked: <paths or links>
  - Conflicting sources: <links and disagreement, or `None`>
  - Needed answer: <plain-English question for the user>
  - Blocking items: <small task and test IDs that cannot proceed>

## Small Task and Test Map

Every smallest task and every known rule must map to one or more test IDs before implementation.

| Small task or rule             | Source                   | Test IDs        | Ready or missing detail |
| ------------------------------ | ------------------------ | --------------- | ----------------------- |
| <exact checklist item or rule> | <path, request, or link> | <TEST-AREA-001> | <Ready>                 |

## Exact Test Cases

A broad line such as "test validation," "add focused tests," "test errors," or "cover edge cases" is
only a heading. Add one block like this for every exact situation below it.

## Exact Test Case Rules

Every case must contain these fields: `Small task:`, `Source:`, `Test place:`, `Starting state:`,
`Exact input or fixture:`, `Interaction steps:`, `Main behavior:`, `Expected result:`, `Must change:`,
`Must not happen:`, `Planned command:`, `Expected result before the code change:`,
`First observed run:`, and `Passing rerun:`.

During planning, fill in `Planned command:` and `Expected result before the code change:`. Fill in
`First observed run:` only after its command has run. Fill in `Passing rerun:` only after its command
has run. Do not invent test results before running the command.

If trusted sources disagree, check which source wins under repository guidance. If no rule answers
that question, record the conflict, ask the user, and block the affected work.

If no trusted source defines the expected behavior, search the repository. If the answer is still
unknown, record the open question, ask the user, and block the affected work until it is resolved.

## Exact Test Cases To Complete

- [ ] TEST-<AREA>-001: <one exact situation and result>
  - Small task: <one item from Small Task Breakdown>
  - Source: <where the expected behavior is defined>
  - Test place: <unit, schema, integration, API, UI, end-to-end, or other check and expected file>
  - Starting state: <exact records, screen state, signed-in state, dependency replies, or other setup>
  - Exact input or fixture: <real sample values>
  - Interaction steps: <every step needed, such as enter a value and then submit>
  - Main behavior: <the one behavior or result being checked>
  - Expected result: <exact value, text, status, error, or next state>
  - Must change: <data, calls, events, files, or navigation, or why this does not apply>
  - Must not happen: <writes, calls, events, or navigation, or why this does not apply>
  - Planned command: <exact command to run after this checklist exists>
  - Expected result before the code change: <expected failure or other expected starting result>
  - First observed run: <leave pending during planning; after running, record command and real result>
  - Passing rerun: <leave pending during planning; after implementation, record command and real result>

## Missing-Case Review

For each line, add test IDs or explain why it does not apply. Do not write only "not applicable."

- [ ] Normal valid values and successful results: <test IDs or reason>
- [ ] Each separate validation rule and rejected value: <test IDs or reason>
- [ ] Missing value: <test IDs or reason>
- [ ] Explicit `null` value: <test IDs or reason>
- [ ] Empty value: <test IDs or reason>
- [ ] Spaces-only text: <test IDs or reason>
- [ ] Wrong-type value: <test IDs or reason>
- [ ] Bad-format value: <test IDs or reason>
- [ ] Unsupported value: <test IDs or reason>
- [ ] Duplicate value: <test IDs or reason>
- [ ] Conflicting values: <test IDs or reason>
- [ ] Exact minimum: <test IDs or reason>
- [ ] Below minimum: <test IDs or reason>
- [ ] Exact maximum: <test IDs or reason>
- [ ] Above maximum: <test IDs or reason>
- [ ] Each choice: <test IDs or reason>
- [ ] Each branch: <test IDs or reason>
- [ ] Empty data: <test IDs or reason>
- [ ] One item: <test IDs or reason>
- [ ] Many items: <test IDs or reason>
- [ ] Allowed state change: <test IDs or reason>
- [ ] Blocked state change: <test IDs or reason>
- [ ] Not found: <test IDs or reason>
- [ ] Dependency failure: <test IDs or reason>
- [ ] Timeout: <test IDs or reason>
- [ ] Unexpected error: <test IDs or reason>
- [ ] Signed-out access: <test IDs or reason>
- [ ] Wrong-permission access: <test IDs or reason>
- [ ] Wrong-owner access: <test IDs or reason>
- [ ] Wrong-account access: <test IDs or reason>
- [ ] Required data changes: <test IDs or reason>
- [ ] Required outside calls: <test IDs or reason>
- [ ] Required messages: <test IDs or reason>
- [ ] Required events: <test IDs or reason>
- [ ] Required file changes: <test IDs or reason>
- [ ] Required navigation: <test IDs or reason>
- [ ] Work that must not happen after rejection or failure: <test IDs or reason>
- [ ] Repeated requests: <test IDs or reason>
- [ ] Retries: <test IDs or reason>
- [ ] Duplicate delivery: <test IDs or reason>
- [ ] Existing callers that must keep working: <test IDs or reason>
- [ ] Stored data that must keep working: <test IDs or reason>
- [ ] Public behavior that must keep working: <test IDs or reason>
- [ ] Loading view: <test IDs or reason>
- [ ] Empty view: <test IDs or reason>
- [ ] Success view: <test IDs or reason>
- [ ] Error view: <test IDs or reason>
- [ ] Retry view: <test IDs or reason>
- [ ] Values that affect one another, check order, or multiple errors: <test IDs or reason>
- [ ] Confirm no broad case hides situations that could pass or fail separately.
- [ ] Confirm every open question is answered before its blocked work begins.
- [ ] Confirm every conflict between trusted sources is resolved before its blocked work begins.
- [ ] Confirm no observed test result was written before its command ran.

## Validation Cases for Non-Code Work

Use the same exact test-case format for documentation, configuration, skill, and metadata work. The
action may be a parser, formatter, synchronization command, file comparison, link check, or exact
text scan.

## Implementation Plan

- [ ] <Workstream>
  - [ ] <Small task copied from Small Task Breakdown>
    - [ ] Write the planned test IDs: <TEST-AREA-001>
    - [ ] Make the smallest implementation change for those tests.
    - [ ] Record the First observed run and later Passing rerun in the exact case blocks.
- [ ] Preserve all affected contracts, consumers, and integration boundaries.
- [ ] Record links to related implementation files and prior checklists.

## Verification

- [ ] Confirm implementation followed the new checklist.
- [ ] Run each planned case and record results against its test ID.
- [ ] Record the observed result, including failures, before making corrections.
- [ ] Fix failures, rerun the relevant checks, and record the final result.
- [ ] Run affected package checks.
- [ ] Run required repository checks.
- [ ] Review the complete diff and re-scan this checklist for stale items.

## Validation Notes

Record active-task validation results here. Record each failure before correcting it, then record the
passing rerun before marking the related item complete. Keep these notes editable while the checklist
is uncommitted. Do not invent test results before running the command.

## Risks and Follow-Up

- [ ] <Risk, unresolved question, environment dependency, or follow-up>

If a later task corrects committed work, append a dated `## Updates` section at the bottom of this
file. Preserve all earlier plans, checklist items, and statuses.
