# Task: Gate checklist updates per item and deepen Implementation Plan nesting

- Checklist ID: CHECKLIST-20260821-checklist-doc-per-item-updates-and-detail
- Created: 2026-08-21
- Planning completed: 2026-08-21
- Type: Task
- Source request: The checklist doc is created at task start but only gets updated at the end instead
  of after each smallest item; the doc also reads as a summary rather than a detailed nested plan.
  The user wants the checklist updated immediately after finishing each task, then the next task
  picked from the doc, and the doc itself to carry real nested implementation detail.
- Related checklists:
  - Origin: [Checklist lifecycle policy](./2026-08-11-checklist-lifecycle.md)
  - Origin: [Plan-before-checklist workflow](./2026-08-11-plan-before-checklist-workflow.md)
  - Origin: [Test-first workflow checklist](./2026-08-11-test-first-workflow-checklist.md)
- Affected paths: `skills/test-first-workflow/SKILL.md`, `skills/test-first-workflow/templates/task-checklist.md`,
  `skills/test-first-workflow/references/plan-to-test.md`, `skills/checklist-tracking/SKILL.md`, and
  synchronized skill roots (`.agents/skills`, `.claude/skills`, `.opencode/skills`)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Planning Record

- [x] Planning phase completed before creating this checklist (plan approved via `ExitPlanMode`).
  - [x] Read the task request and the current `test-first-workflow`, `checklist-tracking`,
        `checklist-policy.md`, `plan-to-test.md`, and `task-checklist.md` content in full.
  - [x] Read the prior related 2026-08-11 checklists to avoid contradicting established lifecycle rules.
  - [x] Split the work into small items (below).
  - [x] Defined exact cases, implementation steps, dependencies, and risks (below).
- [x] This checklist captures the completed plan before implementation begins.

## Context and Scope

- [x] Problem: (1) the checklist file is only edited in a batch at the end of a task instead of
      immediately after each smallest item finishes; (2) the `## Implementation Plan` section of a
      generated checklist reads as a flat summary instead of a detailed nested plan.
- [x] Existing behavior: `## Checklist Lifecycle` and `## Checklist Coordination` in
      `test-first-workflow/SKILL.md`, and `## After Work` in `checklist-tracking/SKILL.md`, already
      permit in-place updates, but nothing inside the actual execution loop (`## Executable Code` /
      `## Validation Sequence`) makes writing the checklist file a blocking condition before picking
      the next item. The template's `## Implementation Plan` section is a fixed 3-bullet shape per
      small task, unlike the arbitrary-depth `## Small Task Breakdown`.
  - [x] Constraint: must not weaken or contradict the committed-checklist immutability / `## Updates`
        rules.
  - [x] Constraint: `skills/checklist-tracking/references/checklist-policy.md` and
        `scripts/skill-gate.mjs` / `.claude/skill-triggers.json` are out of scope (matching/status-table
        rules and trigger mechanism only, confirmed during planning).
  - [x] Non-goal: no behavior change to already-committed checklists; only active/new checklist
        behavior changes.
  - [x] Affected boundary: portable skill content synced across four roots (`skills/`, `.agents/skills/`,
        `.claude/skills/`, `.opencode/skills/`).

## Implementation Description

Not applicable (no commit or release is created directly by this checklist; this task edits skill
content only).

## Acceptance Criteria

- [x] The Executable Code loop in `test-first-workflow/SKILL.md` requires writing the finished item's
      status/results to the checklist file before picking the next item. (TEST-SKILL-165)
  - [x] The instruction is phrased as a blocking gate, not a suggestion.
  - [x] It does not conflict with the immutable-history rule for committed checklists.
- [x] `## Checklist Coordination` explicitly forbids batching checklist edits until the end of the
      task. (TEST-SKILL-166)
- [x] The Implementation Plan portion of a new checklist must nest to the same depth/concreteness as
      the Small Task Breakdown (exact files, exact functions/symbols/config keys, edge cases).
      (TEST-SKILL-167)
- [x] The `task-checklist.md` template's `## Implementation Plan` section demonstrates this deeper
      nesting and states "use as many checklist levels as needed." (TEST-SKILL-168)
- [x] `plan-to-test.md`'s `## Validation Sequence` contains the same per-item checklist-file-update
      gate between marking an item complete and starting the next item. (TEST-SKILL-169)
- [x] `checklist-tracking/SKILL.md`'s `## After Work` states updates happen immediately per finished
      item, not batched. (TEST-SKILL-170)
- [x] `checklist-tracking/SKILL.md`'s `## Validation` includes a check against summary-only/flat
      Implementation Plan sections. (TEST-SKILL-171)
- [x] All four skill roots remain byte-for-byte identical after sync. (TEST-SKILL-172, TEST-SKILL-173)

## Small Task Breakdown

Use as many checklist levels as needed. Split an item again when two parts could pass or fail
separately. Every smallest item must have one clear result and link to exact test IDs.

- [x] A. `test-first-workflow/SKILL.md` wording changes
  - [x] A1. `## Executable Code` gains an explicit "write the checklist file now" gate step before the
        next item is picked
    - Test IDs: TEST-SKILL-165
    - Ready: Yes
  - [x] A2. `## Checklist Coordination` forbids end-of-task batching
    - Test IDs: TEST-SKILL-166
    - Ready: Yes
  - [x] A3. `## Create the Checklist From the Plan` requires Implementation Plan nesting depth to match
        Small Task Breakdown
    - Test IDs: TEST-SKILL-167
    - Ready: Yes
- [x] B. `templates/task-checklist.md` changes
  - [x] B1. `## Implementation Plan` rewritten with a deeper nested example and "as many levels as
        needed" instruction, mirroring `## Small Task Breakdown`
    - Test IDs: TEST-SKILL-168
    - Ready: Yes
- [x] C. `references/plan-to-test.md` changes
  - [x] C1. `## Validation Sequence` gains the same per-item checklist-file-update gate
    - Test IDs: TEST-SKILL-169
    - Ready: Yes
- [x] D. `checklist-tracking/SKILL.md` changes
  - [x] D1. `## After Work` states immediate per-item updates, no batching to task end
    - Test IDs: TEST-SKILL-170
    - Ready: Yes
  - [x] D2. `## Validation` gains an anti-summary/flat-Implementation-Plan check
    - Test IDs: TEST-SKILL-171
    - Ready: Yes
- [x] E. Skill sync and repository validation
  - [x] E1. Sync and confirm all four skill roots are identical
    - Test IDs: TEST-SKILL-172
    - Ready: Yes
  - [x] E2. Run the skills unit test suite
    - Test IDs: TEST-SKILL-173
    - Ready: Yes

## Rules and Open Questions

- [x] R1. The new per-item update instruction must not contradict "treat committed checklists as
      immutable history" or "do not add `## Updates` for ordinary uncommitted changes."
  - Source: `test-first-workflow/SKILL.md` `## Checklist Lifecycle` (lines 141-156);
    `checklist-tracking/SKILL.md` `## Checklist Lifecycle` (lines 24-33).
  - Test IDs: TEST-SKILL-165, TEST-SKILL-170
- [x] R2. The Implementation Plan nesting-depth requirement must reuse the existing "as many checklist
      levels as needed" / "split until one clear result" vocabulary already established for Small Task
      Breakdown, not invent new terminology.
  - Source: `test-first-workflow/SKILL.md` `## Split the Work Until Each Part Is Small` (lines 29-48);
    template `## Small Task Breakdown` (lines 53-64).
  - Test IDs: TEST-SKILL-167, TEST-SKILL-168

No open questions. No conflicting trusted sources: this task tightens existing, already-approved
wording and does not introduce a new source of truth.

## Small Task and Test Map

| Small task or rule                      | Source              | Test IDs       | Ready or missing detail |
| --------------------------------------- | ------------------- | -------------- | ----------------------- |
| A1 Executable Code gate                 | plan §1             | TEST-SKILL-165 | Ready                   |
| A2 Checklist Coordination no-batching   | plan §1             | TEST-SKILL-166 | Ready                   |
| A3 Implementation Plan depth rule       | plan §1             | TEST-SKILL-167 | Ready                   |
| B1 template Implementation Plan rewrite | plan §2             | TEST-SKILL-168 | Ready                   |
| C1 plan-to-test.md gate step            | plan §3             | TEST-SKILL-169 | Ready                   |
| D1 checklist-tracking immediate update  | plan §4             | TEST-SKILL-170 | Ready                   |
| D2 checklist-tracking anti-summary      | plan §4             | TEST-SKILL-171 | Ready                   |
| E1 four-root sync                       | plan "Skills sync"  | TEST-SKILL-172 | Ready                   |
| E2 `pnpm skills:test` passes            | plan "Verification" | TEST-SKILL-173 | Ready                   |

## Exact Test Cases

A broad line such as "update the skills" is only a heading. Each exact case below is an exact text
scan (this is a non-executable, prose/skill-content change) or a repository validation command.

## Exact Test Case Rules

Every case must contain these fields: `Small task:`, `Source:`, `Test place:`, `Starting state:`,
`Exact input or fixture:`, `Interaction steps:`, `Main behavior:`, `Expected result:`, `Must change:`,
`Must not happen:`, `Planned command:`, `Expected result before the code change:`,
`First observed run:`, and `Passing rerun:`. Observed-result fields stay pending until their commands
actually run.

## Exact Test Cases To Complete

- [x] TEST-SKILL-165: Executable Code loop gates the next item on a checklist-file write.
  - Small task: A1
  - Source: R1
  - Test place: exact text scan, `skills/test-first-workflow/SKILL.md`
  - Starting state: `## Executable Code` has 8 numbered steps ending at "Refactor only after the
    behavior passes...", with no explicit instruction to write the checklist file before the next item.
  - Exact input or fixture: `skills/test-first-workflow/SKILL.md` after edit
  - Interaction steps: `grep -n -A12 "## Executable Code" skills/test-first-workflow/SKILL.md`
  - Main behavior: the section contains an explicit, blocking instruction to update the checklist file
    for the finished item before selecting the next smallest item.
  - Expected result: the grep output shows a step requiring the checklist file update as a condition
    before returning to "pick the next smallest task item."
  - Must change: `## Executable Code` section text.
  - Must not happen: no change to `## Checklist Lifecycle` immutability wording.
  - Planned command: `grep -n -A12 "## Executable Code" skills/test-first-workflow/SKILL.md`
  - Expected result before the code change: no line mentions writing/updating the checklist file inside
    this section.
  - First observed run: confirmed absent — `## Executable Code` (SKILL.md read in full during planning)
    had 8 steps with no checklist-file-write instruction.
  - Passing rerun: `grep -n -A14 "## Executable Code" skills/test-first-workflow/SKILL.md` — step 9 now
    requires writing status/results to the checklist file before the next item, step 10 loops back.
- [x] TEST-SKILL-166: Checklist Coordination forbids end-of-task batching.
  - Small task: A2
  - Source: R1
  - Test place: exact text scan, `skills/test-first-workflow/SKILL.md`
  - Starting state: `## Checklist Coordination` says "Keep the active checklist synchronized..." without
    forbidding deferring edits to task end.
  - Exact input or fixture: `skills/test-first-workflow/SKILL.md` after edit
  - Interaction steps: `grep -n -A6 "## Checklist Coordination" skills/test-first-workflow/SKILL.md`
  - Main behavior: the section explicitly states checklist edits happen immediately per item, never
    batched to the end of the task.
  - Expected result: grep output contains wording forbidding end-of-task batching.
  - Must change: `## Checklist Coordination` section text.
  - Must not happen: no change to the append-only `## Updates` rule for committed checklists.
  - Planned command: `grep -n "batch" skills/test-first-workflow/SKILL.md`
  - Expected result before the code change: no match.
  - First observed run: confirmed no match in current file (read in full during planning).
  - Passing rerun: `grep -n "batch" skills/test-first-workflow/SKILL.md` — line 198: "never batch
    checklist edits until the task ends" now present in `## Checklist Coordination`.
- [x] TEST-SKILL-167: Create the Checklist From the Plan requires Implementation Plan nesting to match
      Small Task Breakdown depth.
  - Small task: A3
  - Source: R2
  - Test place: exact text scan, `skills/test-first-workflow/SKILL.md`
  - Starting state: `## Create the Checklist From the Plan` lists what to copy into the checklist but
    does not require Implementation Plan detail to match Small Task Breakdown nesting depth.
  - Exact input or fixture: `skills/test-first-workflow/SKILL.md` after edit
  - Interaction steps: `grep -n -A25 "## Create the Checklist From the Plan" skills/test-first-workflow/SKILL.md`
  - Main behavior: the section states Implementation Plan items must nest to the same depth/concreteness
    (exact files, functions/symbols, edge cases) as Small Task Breakdown items.
  - Expected result: grep output contains this requirement.
  - Must change: `## Create the Checklist From the Plan` section text.
  - Must not happen: no change to the checklist path/slug convention.
  - Planned command: `grep -n "same depth" skills/test-first-workflow/SKILL.md`
  - Expected result before the code change: no match.
  - First observed run: confirmed no match in current file (read in full during planning).
  - Passing rerun: `grep -n "same depth" skills/test-first-workflow/SKILL.md` — line 125: "Nest the
    implementation steps to the same depth and concreteness as the small task breakdown" now present.
- [x] TEST-SKILL-168: Template Implementation Plan section is nested and instructs arbitrary depth.
  - Small task: B1
  - Source: R2
  - Test place: exact text scan, `skills/test-first-workflow/templates/task-checklist.md`
  - Starting state: `## Implementation Plan` is a fixed 3-bullet shape per small task with no "as many
    levels as needed" instruction.
  - Exact input or fixture: `skills/test-first-workflow/templates/task-checklist.md` after edit
  - Interaction steps: `grep -n -A15 "## Implementation Plan" skills/test-first-workflow/templates/task-checklist.md`
  - Main behavior: the section shows a deeper nested example (workstream → small task → exact
    file/module → exact function/symbol → step → edge case → verification) and states "Use as many
    checklist levels as needed."
  - Expected result: grep output shows both the deeper nested example and the instruction sentence.
  - Must change: `## Implementation Plan` template section only.
  - Must not happen: no change to `## Small Task Breakdown` or `## Verification` template sections.
  - Planned command: `grep -n "as many checklist levels as needed" skills/test-first-workflow/templates/task-checklist.md`
  - Expected result before the code change: one match (from `## Small Task Breakdown` only).
  - First observed run: confirmed exactly one match, in `## Small Task Breakdown` (line 55), before this
    change.
  - Passing rerun: `grep -n "as many checklist levels as needed" skills/test-first-workflow/templates/task-checklist.md`
    — two matches now: line 55 (Small Task Breakdown) and line 187 (Implementation Plan), which also
    gained a nested Workstream → Small task → file → function/symbol → step → edge case → test example.
- [x] TEST-SKILL-169: Validation Sequence gates the next item on a checklist-file write.
  - Small task: C1
  - Source: R1
  - Test place: exact text scan, `skills/test-first-workflow/references/plan-to-test.md`
  - Starting state: `## Validation Sequence` step 9 marks the item complete and step 10 marks parents
    complete, with no explicit instruction to write that status to the checklist file before step 1
    repeats for the next item.
  - Exact input or fixture: `skills/test-first-workflow/references/plan-to-test.md` after edit
  - Interaction steps: `grep -n -A15 "## Validation Sequence" skills/test-first-workflow/references/plan-to-test.md`
  - Main behavior: the sequence explicitly requires writing the finished item's status/results to the
    checklist file on disk before starting the next smallest item.
  - Expected result: grep output shows this step between "mark complete" and returning to step 1.
  - Must change: `## Validation Sequence` list only.
  - Must not happen: no change to the `## Checklist Lifecycle` recap earlier in the same file.
  - Planned command: `grep -n "before starting the next" skills/test-first-workflow/references/plan-to-test.md`
  - Expected result before the code change: no match.
  - First observed run: confirmed no match in current file (read in full during planning).
  - Passing rerun: `grep -n "before starting the next" skills/test-first-workflow/references/plan-to-test.md`
    — line 229: new step 11 requires writing status/results to the checklist file before the next item;
    former step 11 (committed-defect updates) renumbered to step 12.
- [x] TEST-SKILL-170: checklist-tracking After Work requires immediate per-item updates.
  - Small task: D1
  - Source: R1
  - Test place: exact text scan, `skills/checklist-tracking/SKILL.md`
  - Starting state: `## After Work` lists update mechanics but does not state updates happen
    immediately per item rather than batched at task end.
  - Exact input or fixture: `skills/checklist-tracking/SKILL.md` after edit
  - Interaction steps: `grep -n -A10 "## After Work" skills/checklist-tracking/SKILL.md`
  - Main behavior: the section states items are updated immediately when the smallest item finishes,
    not batched until the task ends.
  - Expected result: grep output contains this rule near the top of `## After Work`.
  - Must change: `## After Work` section text.
  - Must not happen: no change to the `[x]`/`[ ]`/`[/]` status-symbol rules.
  - Planned command: `grep -n "immediately" skills/checklist-tracking/SKILL.md`
  - Expected result before the code change: no match.
  - First observed run: confirmed no match in current file (read in full during planning).
  - Passing rerun: `grep -n "immediately" skills/checklist-tracking/SKILL.md` — line 37: "Update items
    immediately when the smallest item finishes; never batch checklist edits until the task ends" now
    leads `## After Work`.
- [x] TEST-SKILL-171: checklist-tracking Validation rejects summary-only Implementation Plan sections.
  - Small task: D2
  - Source: R2
  - Test place: exact text scan, `skills/checklist-tracking/SKILL.md`
  - Starting state: `## Validation` lists 4 pre-finalization checks with no check comparing
    Implementation Plan nesting depth to Small Task Breakdown depth.
  - Exact input or fixture: `skills/checklist-tracking/SKILL.md` after edit
  - Interaction steps: `grep -n -A8 "## Validation" skills/checklist-tracking/SKILL.md`
  - Main behavior: the checklist adds a check confirming Implementation Plan nesting is not flatter
    than its matching Small Task Breakdown item.
  - Expected result: grep output shows a new bullet performing this comparison.
  - Must change: `## Validation` section only.
  - Must not happen: no change to the other 4 existing validation bullets.
  - Planned command: `grep -n "Implementation Plan" skills/checklist-tracking/SKILL.md`
  - Expected result before the code change: no match (the term does not appear in this file today).
  - First observed run: confirmed no match in current file (read in full during planning).
  - Passing rerun: `grep -n "Implementation Plan" skills/checklist-tracking/SKILL.md` — lines 114-115:
    new `## Validation` bullet rejects an Implementation Plan flatter than its Small Task Breakdown item.
- [x] TEST-SKILL-172: All four skill roots remain identical after sync.
  - Small task: E1
  - Source: repository skill-sync requirement (`AGENTS.md` "Skills system")
  - Test place: repository command, `pnpm skills:check`
  - Starting state: `skills/test-first-workflow` and `skills/checklist-tracking` edited; other roots not
    yet synced.
  - Exact input or fixture: repository working tree after edits A1-D2
  - Interaction steps: run `pnpm skills:sync`, then `pnpm skills:check`
  - Main behavior: all four roots (`skills/`, `.agents/skills/`, `.claude/skills/`, `.opencode/skills/`)
    are byte-for-byte identical.
  - Expected result: `pnpm skills:check` exits 0 and reports all skills validated.
  - Must change: `.agents/skills`, `.claude/skills`, `.opencode/skills` mirrors of the two edited skills,
    and `.skills-sync.json`.
  - Must not happen: any content drift between roots.
  - Planned command: `pnpm skills:sync && pnpm skills:check`
  - Expected result before the code change: not applicable (command only meaningful after edits).
  - First observed run: `pnpm skills:sync` reported "Synchronized 16 portable skill(s)."
  - Passing rerun: `pnpm skills:check` reported "Validated 16 portable skill(s)." — all four roots
    identical; `.agents/skills`, `.claude/skills`, `.opencode/skills`, and `.skills-sync.json` staged.
- [x] TEST-SKILL-173: Skills unit test suite passes.
  - Small task: E2
  - Source: repository test requirement (`AGENTS.md` "Turbo pipeline" — skills tests run via
    `pnpm skills:test`)
  - Test place: repository command, `pnpm skills:test`
  - Starting state: skills test suite currently passing on `master`.
  - Exact input or fixture: repository working tree after edits and sync
  - Interaction steps: run `pnpm skills:test`
  - Main behavior: structural/frontmatter/sync validation for all skills, including the two edited ones,
    still passes.
  - Expected result: all skills tests pass (0 failures).
  - Must change: nothing (validation only).
  - Must not happen: any regression in unrelated skills.
  - Planned command: `pnpm skills:test`
  - Expected result before the code change: not applicable (command only meaningful after edits).
  - First observed run: `pnpm skills:test` reported 97 tests, 97 pass, 0 fail.
  - Passing rerun: same run as First observed run — `pnpm skills:test` passed on the first attempt
    after implementation (97/97), so no separate failing run occurred for this case.

## Missing-Case Review

- [x] Normal valid values and successful results: TEST-SKILL-165 through TEST-SKILL-173 cover the
      intended edits and their validation.
- [x] Each separate validation rule and rejected value: not applicable — this task edits prose
      instructions, not a validated input schema.
- [x] Missing value: not applicable — no input field.
- [x] Explicit `null` value: not applicable.
- [x] Empty value: not applicable.
- [x] Spaces-only text: not applicable.
- [x] Wrong-type value: not applicable.
- [x] Bad-format value: covered by `pnpm skills:check` (TEST-SKILL-172), which validates skill
      structure/frontmatter.
- [x] Unsupported value: not applicable.
- [x] Duplicate value: not applicable.
- [x] Conflicting values: covered by R1/R2 — new wording checked against existing immutability and
      nesting-vocabulary rules to avoid contradiction (TEST-SKILL-165, TEST-SKILL-170, TEST-SKILL-167,
      TEST-SKILL-168).
- [x] Exact minimum / below minimum / exact maximum / above maximum: not applicable — no numeric limit.
- [x] Each choice / each branch: not applicable — no branching logic.
- [x] Empty data / one item / many items: not applicable.
- [x] Allowed state change / blocked state change: not applicable — no state machine.
- [x] Not found / dependency failure / timeout / unexpected error: not applicable — no runtime code
      path.
- [x] Signed-out / wrong-permission / wrong-owner / wrong-account access: not applicable.
- [x] Required data changes, outside calls, messages, events, files, navigation: the required file
      changes are the four skill files listed under "Affected paths"; no other required changes.
- [x] Work that must not happen after rejection or failure: not applicable — no rejection path.
- [x] Repeated requests / retries / duplicate delivery: not applicable.
- [x] Existing callers / stored data / public behavior that must keep working: committed checklists
      keep their existing immutable-history behavior unchanged (R1, verified by TEST-SKILL-165,
      TEST-SKILL-170).
- [x] Loading / empty / success / error / retry views: not applicable — no UI.
- [x] Values that affect one another, check order, or multiple errors: not applicable.
- [x] Confirm no broad case hides situations that could pass or fail separately: each of the 7 wording
      edits (A1-D2) has its own test ID rather than one combined "update the skills" case.
- [x] Confirm every open question is answered before its blocked work begins: no open questions were
      recorded.
- [x] Confirm every conflict between trusted sources is resolved before its blocked work begins: no
      conflicts found; R1/R2 confirm compatibility with existing rules.
- [x] Confirm no observed test result was written before its command ran: `First observed run` fields
      above were filled only from files already read in full during planning; `Passing rerun` fields are
      left pending until the commands run after implementation.

## Validation Cases for Non-Code Work

This entire task is non-executable, prose/skill-content work. Every case above uses an exact text scan
(`grep`) or a repository synchronization/test command (`pnpm skills:sync`, `pnpm skills:check`,
`pnpm skills:test`) rather than a unit test.

## Implementation Plan

- [x] A. `test-first-workflow/SKILL.md`
  - [x] A1. `## Executable Code` — insert a gate step
    - [x] Locate the numbered list (steps 1-8) in `skills/test-first-workflow/SKILL.md`.
    - [x] After step 7 ("Fix failures, rerun the checks, and record the passing result..."), add a new
          step requiring: write the finished item's status and results into the checklist file now;
          do not select the next smallest item until the file on disk reflects that status.
    - [x] Reframe step 1 as returning to "pick the next smallest task item" only after that gate.
    - [x] Verify: `TEST-SKILL-165`.
  - [x] A2. `## Checklist Coordination` — forbid batching
    - [x] Add a sentence forbidding deferring checklist edits to end-of-task; edits happen immediately
          after each smallest item.
    - [x] Preserve the existing "treat committed checklists as immutable history" sentence unchanged.
    - [x] Verify: `TEST-SKILL-166`.
  - [x] A3. `## Create the Checklist From the Plan` — nesting-depth requirement
    - [x] Add a sentence requiring Implementation Plan items to nest to the same depth/concreteness as
          Small Task Breakdown items (exact files, functions/symbols, edge cases), not a generic
          per-task summary.
    - [x] Verify: `TEST-SKILL-167`.
- [x] B. `templates/task-checklist.md`
  - [x] B1. `## Implementation Plan` — deepen the nested example
    - [x] Add "Use as many checklist levels as needed" instruction text above the example, mirroring
          `## Small Task Breakdown`.
    - [x] Replace the fixed 3-bullet example with a nested example: Workstream → Small task → exact
          file/module → exact function/component/symbol → step-by-step change → edge case handled →
          verification/test IDs.
    - [x] Verify: `TEST-SKILL-168`.
- [x] C. `references/plan-to-test.md`
  - [x] C1. `## Validation Sequence` — insert the same gate step
    - [x] Between step 9 ("Mark the smallest item complete...") and the loop returning to step 1, add a
          step requiring the checklist file to reflect this item's status before the next item starts.
    - [x] Verify: `TEST-SKILL-169`.
- [x] D. `checklist-tracking/SKILL.md`
  - [x] D1. `## After Work` — immediate update rule
    - [x] Add a leading rule: items are updated immediately when the smallest item finishes, never
          batched until the task ends.
    - [x] Verify: `TEST-SKILL-170`.
  - [x] D2. `## Validation` — anti-summary check
    - [x] Add a bullet: confirm Implementation Plan nesting is not flatter than its matching Small Task
          Breakdown item (reject summary-only Implementation Plan sections).
    - [x] Verify: `TEST-SKILL-171`.
- [x] E. Sync and validate
  - [x] E1. Run `pnpm skills:sync`; confirm `.agents/skills`, `.claude/skills`, `.opencode/skills` match
        `skills/` for both edited skills. Verify: `TEST-SKILL-172`.
  - [x] E2. Run `pnpm skills:test`. Verify: `TEST-SKILL-173`.
- [x] Preserve all affected contracts, consumers, and integration boundaries: no consumer code reads
      skill Markdown structurally; only prose changes, so no contract impact.
- [x] Record links to related implementation files and prior checklists: see "Related checklists" above.

## Verification

- [x] Confirm implementation followed this checklist.
- [x] Run each planned case and record results against its test ID.
- [x] Record the observed result, including failures, before making corrections.
- [x] Fix failures, rerun the relevant checks, and record the final result.
- [x] Run `pnpm skills:sync`.
- [x] Run `pnpm skills:check`.
- [x] Run `pnpm skills:test`.
- [x] Run Prettier validation for changed Markdown files.
- [x] Review the complete diff and re-scan this checklist for stale items.

## Validation Notes

Record active-task validation results here. Record each failure before correcting it, then record the
passing rerun before marking the related item complete. Keep these notes editable while the checklist
is uncommitted.

- 2026-08-21: Planning-phase file reads confirmed the "before" state for TEST-SKILL-165, 166, 167, 168,
  169, 170, 171 (each phrase absent, as recorded in each case's `First observed run`).
- 2026-08-21: `pnpm skills:sync` and `pnpm skills:check` passed (16/16 portable skills). `pnpm
skills:test` passed (97/97). All seven wording checks (TEST-SKILL-165 through TEST-SKILL-171) passed
  via exact text scan.
- 2026-08-21: `npx prettier --check` on all changed files failed for this checklist file itself
  (`docs/checklists/2026-08-21-checklist-doc-per-item-updates-and-detail.md`) — likely the
  `Small Task and Test Map` table's uneven column padding. The four skill-content files and their three
  synced mirrors passed.
- 2026-08-21: Ran `npx prettier --write` on the checklist file, then reran `npx prettier --check` on it
  — passed ("All matched files use Prettier code style!").

## Risks and Follow-Up

- [x] Risk: an overly rigid "gate" wording could read as blocking even trivial one-item tasks. Mitigated
      by scoping the gate to "the next smallest item," matching the existing execution-loop granularity
      already used throughout `test-first-workflow`.
- [x] Follow-up (out of scope here): whether `## Missing-Case Review` in the template should also gain a
      line confirming per-item checklist updates happened; not required by the user's request, left for a
      future task if it comes up in practice.

If a later task corrects committed work, append a dated `## Updates` section at the bottom of this
file. Preserve all earlier plans, checklist items, and statuses.
