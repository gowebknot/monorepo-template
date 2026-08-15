# Task: Enforce skill invocation at phase transitions (write-time gate + portable rule)

- Checklist ID: CHECKLIST-20260815-skill-invocation-gate
- Created: 2026-08-15
- Planning completed: 2026-08-15
- Type: Task
- Source request: Agents skip invoking a required skill when moving from a non-editing phase (plan/research/Q&A) into implementation because they "already have context," so code bypasses the skill's rules. User approved a write-time hook + portable rule, covering all path-detectable skills, shipped to consumer apps too.
- Related checklists:
  - Origin: None (first checklist in this repo's `docs/checklists/`)
- Affected paths: `scripts/skill-gate.mjs`, `scripts/skill-gate.test.mjs`, `.claude/skill-triggers.json`, `.claude/settings.json`, `AGENTS.md`, `.gitignore`, `package.json`, `core/create-mono-stack/test/copier-template.integration.helpers.js`
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Planning Record

- [x] Planning phase completed before creating this checklist (plan approved via ExitPlanMode).
  - [x] Read task request and applicable guidance (AGENTS.md skill boundaries, husky hooks, copier `_exclude`).
  - [x] Found rules: skill triggers in AGENTS.md list + skill descriptions; hook capabilities from Claude Code docs; transcript Skill-call shape confirmed from real transcripts.
  - [x] Split work into small items (below).
  - [x] Defined exact cases, steps, dependencies, risks (below).
- [x] This checklist captures the completed plan before implementation begins.

## Context and Scope

- [x] Problem: skill invocation skipped on phase transition → code written without the skill's rules loaded.
- [x] Existing behavior: skills are advisory (model-invoked). Deterministic enforcement today is commit-time husky (`lint-staged`, `skills:check --staged`). No `.claude/settings.json` exists.
- [x] Constraints/non-goals:
  - A hook cannot read intent; only file-path/content-detectable triggers are hard-gated.
  - Intent-only skills (`code-review`, `release-flow`, `end-to-end-api-flow`, `observability`, `security-testing-policy`, `jsx-component-extraction`) stay advisory in the AGENTS.md rule.
  - The Claude hook does not cover Codex/OpenCode; the AGENTS.md rule does.
  - Must not deadlock: editing the checklist artifact must remain allowed.
- [x] Affected boundary: repository tooling (`scripts/`, `.claude/`), agent instructions (`AGENTS.md`), template propagation (copier).

## Implementation Description

Not applicable (no commit/release created by this checklist).

## Acceptance Criteria

- [x] A `PreToolUse` hook denies `Edit`/`Write`/`MultiEdit`/`NotebookEdit` when a skill required for the target path was not invoked this session, and allows it once the skill(s) are invoked.
- [x] "Required" = always `test-first-workflow` plus path-matched skills from a committed, editable trigger table.
- [x] Plan mode, exempt paths (checklist/`.claude/`/generated dirs), and a documented opt-out never block.
- [x] The gate, its table, and the AGENTS.md rule propagate to generated consumer projects.
- [x] All checks green: focused gate tests, `test:integration`, `just check`.

## Small Task Breakdown

- [x] A. Decision logic that maps an edit to missing required skills.
  - [x] A1. `collectRequired(relPath, triggers)` returns `always` ∪ every rule whose `when` glob matches.
    - Test IDs: TEST-GATE-002, TEST-GATE-004, TEST-GATE-006, TEST-GATE-007, TEST-GATE-013
    - Ready: Yes
  - [x] A2. `evaluate(...)` denies when required − invoked is non-empty, allows otherwise.
    - Test IDs: TEST-GATE-001, TEST-GATE-003, TEST-GATE-005
    - Ready: Yes
  - [x] A3. Bypass conditions: plan mode, exempt globs, `SKILL_GATE_DISABLE`, no file path.
    - Test IDs: TEST-GATE-008, TEST-GATE-009, TEST-GATE-010, TEST-GATE-011, TEST-GATE-012
    - Ready: Yes
  - [x] A4. Deny reason names each missing skill and states prior context is not an exemption.
    - Test IDs: TEST-GATE-019
    - Ready: Yes
- [x] B. Transcript reading of invoked skills.
  - [x] B1. `parseInvokedSkills(text)` collects every `name:"Skill"` `input.skill`; empty when none; robust to unrelated lines.
    - Test IDs: TEST-GATE-014, TEST-GATE-015, TEST-GATE-016
    - Ready: Yes
- [x] C. Committed configuration.
  - [x] C1. `.claude/skill-triggers.json` valid; every named skill exists under `skills/`.
    - Test IDs: TEST-GATE-017
    - Ready: Yes
  - [x] C2. `.claude/settings.json` valid; registers the PreToolUse matcher → `skill-gate.mjs`.
    - Test IDs: TEST-GATE-018
    - Ready: Yes
- [x] D. Portable rule + gitignore + test wiring.
  - [x] D1. AGENTS.md "phase transition is not an exemption" clause added.
    - Test IDs: validated by `just check` (format/existing policy tests); no new unit case.
    - Ready: Yes
  - [x] D2. `.gitignore` ignores `.claude/settings.local.json`.
    - Test IDs: covered incidentally; verified by inspection.
    - Ready: Yes
  - [x] D3. `scripts/skill-gate.test.mjs` registered in `package.json` `skills:test`.
    - Test IDs: TEST-GATE-000 (suite runs under skills:test)
    - Ready: Yes
- [x] E. Propagation to consumer apps.
  - [x] E1. Generated project contains the gate script, trigger table, and settings.
    - Test IDs: TEST-GATE-021
    - Ready: Yes

## Rules and Open Questions

- [x] R1. Always require `test-first-workflow` for any non-exempt edit.
  - Source: `skills/test-first-workflow` description ("Required at the start of every repository task"); AGENTS.md "Mandatory Agent Workflow".
  - Test IDs: TEST-GATE-001, TEST-GATE-013
- [x] R2. Path→skill triggers mirror the AGENTS.md skill-boundary list (testing-policy, contract-validation, backend-standards, frontend-standards, react-19).
  - Source: AGENTS.md "Load the additional skills when their task boundaries apply".
  - Test IDs: TEST-GATE-002, TEST-GATE-004, TEST-GATE-006, TEST-GATE-007
- [x] R3. Never block plan mode, exempt paths, the opt-out, or edits without a file path.
  - Source: This task's constraints; Claude Code hook semantics (`permission_mode`, deadlock avoidance).
  - Test IDs: TEST-GATE-008..012
- No open questions. No conflicting trusted sources.

## Small Task and Test Map

| Small task or rule            | Source                         | Test IDs                      | Ready |
| ----------------------------- | ------------------------------ | ----------------------------- | ----- |
| A1 collectRequired glob union | AGENTS.md skill list           | TEST-GATE-002/004/006/007/013 | Ready |
| A2 evaluate allow/deny        | task constraints               | TEST-GATE-001/003/005         | Ready |
| A3 bypass conditions          | task constraints               | TEST-GATE-008/009/010/011/012 | Ready |
| A4 deny message               | user request (actionable deny) | TEST-GATE-019                 | Ready |
| B1 parseInvokedSkills         | transcript shape (confirmed)   | TEST-GATE-014/015/016         | Ready |
| C1 trigger table integrity    | skills/ dirs                   | TEST-GATE-017                 | Ready |
| C2 settings registration      | Claude Code hooks docs         | TEST-GATE-018                 | Ready |
| E1 consumer propagation       | copier `_exclude` (not listed) | TEST-GATE-021                 | Ready |

## Exact Test Cases To Complete

- [x] TEST-GATE-001: Source edit with no skills invoked is denied naming test-first-workflow.
  - Small task: A2
  - Source: R1
  - Test place: unit, `scripts/skill-gate.test.mjs`
  - Starting state: fixture triggers table (always=[test-first-workflow]); invokedSkills=∅
  - Exact input or fixture: `{ filePath: "scripts/skill-gate.mjs", permissionMode: "default", invokedSkills: new Set(), env: {} }`
  - Interaction steps: call `evaluate(...)`
  - Main behavior: allow/deny decision + missing list
  - Expected result: `allow === false`, `missing` includes `"test-first-workflow"`
  - Must change: nothing (pure function)
  - Must not happen: no filesystem/network access
  - Planned command: `node --test scripts/skill-gate.test.mjs`
  - Expected result before the code change: fail (module `scripts/skill-gate.mjs` does not exist → import error)
  - First observed run: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` failed to load (Cannot find module ./skill-gate.mjs); no case executed.
  - Passing rerun: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` passed (20/20).
- [x] TEST-GATE-002: apps/server edit with only test-first-workflow invoked is denied naming backend-standards.
  - Small task: A1/A2
  - Source: R2
  - Test place: unit
  - Starting state: fixture triggers with rule `apps/server/**`→backend-standards
  - Exact input or fixture: `filePath:"apps/server/src/app.controller.ts"`, `invokedSkills:{test-first-workflow}`
  - Interaction steps: call `evaluate(...)`
  - Main behavior: missing conditional skill detected
  - Expected result: `allow===false`, `missing` includes `"backend-standards"`, excludes `"test-first-workflow"`
  - Must change: nothing
  - Must not happen: no other skill required
  - Planned command: `node --test scripts/skill-gate.test.mjs`
  - Expected result before the code change: fail (no module)
  - First observed run: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` failed to load (Cannot find module ./skill-gate.mjs); no case executed.
  - Passing rerun: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` passed (20/20).
- [x] TEST-GATE-003: apps/server edit with test-first-workflow + backend-standards invoked is allowed.
  - Small task: A2
  - Source: R2
  - Test place: unit
  - Starting state: same fixture
  - Exact input or fixture: `filePath:"apps/server/src/app.controller.ts"`, `invokedSkills:{test-first-workflow,backend-standards}`
  - Interaction steps: call `evaluate(...)`
  - Main behavior: all required satisfied
  - Expected result: `allow===true`, `missing` empty
  - Must change: nothing
  - Must not happen: no deny
  - Planned command: `node --test scripts/skill-gate.test.mjs`
  - Expected result before the code change: fail (no module)
  - First observed run: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` failed to load (Cannot find module ./skill-gate.mjs); no case executed.
  - Passing rerun: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` passed (20/20).
- [x] TEST-GATE-004: apps/web `.tsx` edit missing react-19 is denied even when frontend-standards invoked (rule union).
  - Small task: A1
  - Source: R2 (two rules match one path)
  - Test place: unit
  - Starting state: fixture with `apps/web/**`→frontend-standards and `**/*.tsx`→react-19
  - Exact input or fixture: `filePath:"apps/web/src/components/Card.tsx"`, `invokedSkills:{test-first-workflow,frontend-standards}`
  - Interaction steps: call `evaluate(...)`
  - Main behavior: union of both rules required
  - Expected result: `allow===false`, `missing` == `["react-19"]`
  - Must change: nothing
  - Must not happen: frontend-standards not reported missing
  - Planned command: `node --test scripts/skill-gate.test.mjs`
  - Expected result before the code change: fail (no module)
  - First observed run: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` failed to load (Cannot find module ./skill-gate.mjs); no case executed.
  - Passing rerun: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` passed (20/20).
- [x] TEST-GATE-005: apps/web `.tsx` edit with test-first-workflow + frontend-standards + react-19 is allowed.
  - Small task: A2
  - Source: R2
  - Test place: unit
  - Starting state: same fixture
  - Exact input or fixture: same path, `invokedSkills:{test-first-workflow,frontend-standards,react-19}`
  - Interaction steps: call `evaluate(...)`
  - Main behavior: all satisfied
  - Expected result: `allow===true`, `missing` empty
  - Planned command: `node --test scripts/skill-gate.test.mjs`
  - Expected result before the code change: fail (no module)
  - First observed run: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` failed to load (Cannot find module ./skill-gate.mjs); no case executed.
  - Passing rerun: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` passed (20/20).
- [x] TEST-GATE-006: test-file edit missing testing-policy is denied.
  - Small task: A1
  - Source: R2 (`**/*.test.*`→testing-policy)
  - Test place: unit
  - Exact input or fixture: `filePath:"packages/db/src/foo.test.ts"`, `invokedSkills:{test-first-workflow}`
  - Expected result: `allow===false`, `missing` includes `"testing-policy"`
  - Planned command: `node --test scripts/skill-gate.test.mjs`
  - Expected result before the code change: fail (no module)
  - First observed run: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` failed to load (Cannot find module ./skill-gate.mjs); no case executed.
  - Passing rerun: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` passed (20/20).
- [x] TEST-GATE-007: packages/entities edit missing contract-validation is denied.
  - Small task: A1
  - Source: R2 (`packages/entities/**`→contract-validation)
  - Test place: unit
  - Exact input or fixture: `filePath:"packages/entities/src/user.ts"`, `invokedSkills:{test-first-workflow}`
  - Expected result: `allow===false`, `missing` includes `"contract-validation"`
  - Planned command: `node --test scripts/skill-gate.test.mjs`
  - Expected result before the code change: fail (no module)
  - First observed run: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` failed to load (Cannot find module ./skill-gate.mjs); no case executed.
  - Passing rerun: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` passed (20/20).
- [x] TEST-GATE-008: plan mode allows regardless of missing skills.
  - Small task: A3
  - Source: R3 (edits already blocked in plan mode by harness)
  - Test place: unit
  - Exact input or fixture: `filePath:"apps/server/src/x.ts"`, `permissionMode:"plan"`, `invokedSkills:∅`
  - Expected result: `allow===true`
  - Planned command: `node --test scripts/skill-gate.test.mjs`
  - Expected result before the code change: fail (no module)
  - First observed run: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` failed to load (Cannot find module ./skill-gate.mjs); no case executed.
  - Passing rerun: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` passed (20/20).
- [x] TEST-GATE-009: edit under `docs/checklists/` allowed (exempt) with no skills.
  - Small task: A3
  - Source: R3 (deadlock avoidance — the skill creates this file)
  - Test place: unit
  - Exact input or fixture: `filePath:"docs/checklists/2026-08-15-x.md"`, `invokedSkills:∅`
  - Expected result: `allow===true`
  - Planned command: `node --test scripts/skill-gate.test.mjs`
  - Expected result before the code change: fail (no module)
  - First observed run: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` failed to load (Cannot find module ./skill-gate.mjs); no case executed.
  - Passing rerun: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` passed (20/20).
- [x] TEST-GATE-010: `SKILL_GATE_DISABLE` set allows regardless.
  - Small task: A3
  - Source: R3 (consumer opt-out)
  - Test place: unit
  - Exact input or fixture: `filePath:"apps/server/src/x.ts"`, `invokedSkills:∅`, `env:{SKILL_GATE_DISABLE:"1"}`
  - Expected result: `allow===true`
  - Planned command: `node --test scripts/skill-gate.test.mjs`
  - Expected result before the code change: fail (no module)
  - First observed run: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` failed to load (Cannot find module ./skill-gate.mjs); no case executed.
  - Passing rerun: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` passed (20/20).
- [x] TEST-GATE-011: edit under `.claude/` allowed (exempt).
  - Small task: A3
  - Source: R3 (gate infra must be editable)
  - Test place: unit
  - Exact input or fixture: `filePath:".claude/skill-triggers.json"`, `invokedSkills:∅`
  - Expected result: `allow===true`
  - Planned command: `node --test scripts/skill-gate.test.mjs`
  - Expected result before the code change: fail (no module)
  - First observed run: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` failed to load (Cannot find module ./skill-gate.mjs); no case executed.
  - Passing rerun: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` passed (20/20).
- [x] TEST-GATE-012: input with no file path allowed (nothing to gate).
  - Small task: A3
  - Source: R3
  - Test place: unit
  - Exact input or fixture: `filePath: undefined`, `invokedSkills:∅`
  - Expected result: `allow===true`
  - Planned command: `node --test scripts/skill-gate.test.mjs`
  - Expected result before the code change: fail (no module)
  - First observed run: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` failed to load (Cannot find module ./skill-gate.mjs); no case executed.
  - Passing rerun: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` passed (20/20).
- [x] TEST-GATE-013: plain source edit with test-first-workflow invoked allowed (only always-rule applies).
  - Small task: A1/A2
  - Source: R1
  - Test place: unit
  - Exact input or fixture: `filePath:"scripts/update-template.mjs"`, `invokedSkills:{test-first-workflow}`
  - Expected result: `allow===true`, `missing` empty
  - Planned command: `node --test scripts/skill-gate.test.mjs`
  - Expected result before the code change: fail (no module)
  - First observed run: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` failed to load (Cannot find module ./skill-gate.mjs); no case executed.
  - Passing rerun: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` passed (20/20).
- [x] TEST-GATE-014: parseInvokedSkills collects multiple Skill calls.
  - Small task: B1
  - Source: transcript shape `"name":"Skill","input":{"skill":"..."}` (confirmed from real transcripts)
  - Test place: unit
  - Exact input or fixture: text with two lines containing `"name":"Skill","input":{"skill":"test-first-workflow"}` and `...{"skill":"testing-policy"}`
  - Expected result: Set equals `{test-first-workflow, testing-policy}`
  - Planned command: `node --test scripts/skill-gate.test.mjs`
  - Expected result before the code change: fail (no module)
  - First observed run: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` failed to load (Cannot find module ./skill-gate.mjs); no case executed.
  - Passing rerun: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` passed (20/20).
- [x] TEST-GATE-015: parseInvokedSkills returns empty when no Skill call present.
  - Small task: B1
  - Source: same
  - Test place: unit
  - Exact input or fixture: text with only `"name":"Write"` tool_use lines
  - Expected result: empty Set
  - Planned command: `node --test scripts/skill-gate.test.mjs`
  - Expected result before the code change: fail (no module)
  - First observed run: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` failed to load (Cannot find module ./skill-gate.mjs); no case executed.
  - Passing rerun: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` passed (20/20).
- [x] TEST-GATE-016: parseInvokedSkills tolerates unrelated/malformed lines without throwing.
  - Small task: B1
  - Source: robustness (transcript has many line types incl. non-JSON fragments)
  - Test place: unit
  - Exact input or fixture: text with a blank line, a non-JSON line, and one valid Skill line
  - Expected result: Set equals `{test-first-workflow}`; no exception
  - Planned command: `node --test scripts/skill-gate.test.mjs`
  - Expected result before the code change: fail (no module)
  - First observed run: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` failed to load (Cannot find module ./skill-gate.mjs); no case executed.
  - Passing rerun: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` passed (20/20).
- [x] TEST-GATE-017: `.claude/skill-triggers.json` parses and only names real skills.
  - Small task: C1
  - Source: `skills/<name>` directories
  - Test place: unit (reads real repo files)
  - Exact input or fixture: real `.claude/skill-triggers.json`; real `skills/` listing
  - Expected result: JSON.parse succeeds; every name in `always` and each rule's `require` has a directory `skills/<name>`
  - Planned command: `node --test scripts/skill-gate.test.mjs`
  - Expected result before the code change: fail (file does not exist)
  - First observed run: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` failed to load (Cannot find module ./skill-gate.mjs); no case executed.
  - Passing rerun: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` passed (20/20).
- [x] TEST-GATE-018: `.claude/settings.json` registers the PreToolUse gate.
  - Small task: C2
  - Source: Claude Code hooks contract
  - Test place: unit (reads real repo file)
  - Exact input or fixture: real `.claude/settings.json`
  - Expected result: parses; a `PreToolUse` entry whose matcher contains `Edit`, `Write`, `MultiEdit` and a hook command referencing `skill-gate.mjs`
  - Planned command: `node --test scripts/skill-gate.test.mjs`
  - Expected result before the code change: fail (file does not exist)
  - First observed run: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` failed to load (Cannot find module ./skill-gate.mjs); no case executed.
  - Passing rerun: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` passed (20/20).
- [x] TEST-GATE-019: deny reason is actionable.
  - Small task: A4
  - Source: user request (deny must tell the agent what to do)
  - Test place: unit
  - Exact input or fixture: TEST-GATE-002 input
  - Expected result: `reason` contains each missing skill name and the phrase indicating prior context/approved plan is not an exemption
  - Planned command: `node --test scripts/skill-gate.test.mjs`
  - Expected result before the code change: fail (no module)
  - First observed run: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` failed to load (Cannot find module ./skill-gate.mjs); no case executed.
  - Passing rerun: 2026-08-15 — `node --test scripts/skill-gate.test.mjs` passed (20/20).
- [x] TEST-GATE-021: generated consumer project ships the gate.
  - Small task: E1
  - Source: copier `_exclude` does not list these paths
  - Test place: integration, `core/create-mono-stack/test/copier-template.integration.helpers.js`
  - Starting state: a project generated by the integration harness
  - Exact input or fixture: generated `projectRoot`
  - Interaction steps: read the three files
  - Main behavior: files exist with expected content
  - Expected result: `scripts/skill-gate.mjs` exists; `.claude/skill-triggers.json` parses with `always` including `test-first-workflow`; `.claude/settings.json` references `skill-gate.mjs`
  - Must change: nothing
  - Must not happen: no core/create-mono-stack references leak
  - Planned command: `pnpm --filter create-mono-stack test:integration`
  - Expected result before the code change: fail (files absent in generated project)
  - First observed run: 2026-08-15 — not executed before implementation; documented expectation was fail (files absent in the generated project).
  - Passing rerun: 2026-08-15 — `pnpm --filter create-mono-stack test:integration` passed; generated project contains scripts/skill-gate.mjs, .claude/skill-triggers.json (always includes test-first-workflow), and .claude/settings.json referencing skill-gate.mjs.

## Missing-Case Review

- [x] Normal valid values and successful results: TEST-GATE-003, 005, 013
- [x] Each separate validation rule and rejected value: TEST-GATE-002, 004, 006, 007 (one per path rule)
- [x] Missing value: TEST-GATE-012 (no file path)
- [x] Explicit `null` value: N/A — inputs come from the hook contract; absence is covered by TEST-GATE-012.
- [x] Empty value: TEST-GATE-015 (empty invoked set), TEST-GATE-012
- [x] Spaces-only text: N/A — file paths are provided by the harness, not free-form user text.
- [x] Wrong-type value: N/A — parseInvokedSkills reads text; TEST-GATE-016 covers malformed lines.
- [x] Bad-format value: TEST-GATE-016 (malformed transcript line)
- [x] Unsupported value: N/A — only Edit/Write/MultiEdit/NotebookEdit are matched by settings; others never reach the script.
- [x] Duplicate value: N/A — invoked skills is a Set; duplicates collapse (implicit in TEST-GATE-014).
- [x] Conflicting values: N/A — no conflicting rules; union semantics are additive.
- [x] Exact/near limits (min/max/below/above): N/A — no numeric limits.
- [x] Each choice: TEST-GATE-008 (plan), 009 (checklist), 010 (opt-out), 011 (.claude) cover each bypass branch.
- [x] Each branch: allow vs deny both covered (003/005/013 allow; 001/002/004/006/007 deny).
- [x] Empty/one/many items: TEST-GATE-015 (none), 001 (one required), 004 (many required).
- [x] Allowed state change / Blocked state change: N/A — pure function, no state.
- [x] Not found: TEST-GATE-017 asserts no unknown skill names (catches a name with no `skills/` dir).
- [x] Dependency failure / Timeout / Unexpected error: TEST-GATE-016 (unreadable/odd transcript content tolerated).
- [x] Permissions/owner/account access: N/A — not an auth feature.
- [x] Required file changes / calls / messages / events / navigation: N/A — decision function; the only output is allow/deny + reason (TEST-GATE-019).
- [x] Work that must not happen after rejection: deny returns no allow and requires no side effects (asserted implicitly by pure-function cases).
- [x] Repeated requests / retries / duplicate delivery: N/A — stateless per call.
- [x] Existing callers / stored data / public behavior that must keep working: TEST-GATE-021 (consumer generation still succeeds); `just check` (existing suites still pass).
- [x] UI views (loading/empty/success/error/retry): N/A — no UI.
- [x] Values that affect one another / order / multiple errors: TEST-GATE-004 (two rules combine), TEST-GATE-019 (multiple missing skills listed together).
- [x] No broad case hides separable situations.
- [x] Every open question answered (none).
- [x] Every trusted-source conflict resolved (none).
- [x] No observed result written before its command ran (First/Passing results recorded after each command).

## Validation Cases for Non-Code Work

- [x] AGENTS.md rule (D1): validated by `just check` (prettier/format + existing skill-policy tests still pass) and by inspection that the "phase transition" clause is present under "Mandatory Agent Workflow". No new unit test; the change is prose.
- [x] `.gitignore` (D2): inspection that `.claude/settings.local.json` is ignored; `git check-ignore` optional.

## Implementation Plan

- [x] E-first is not possible (integration depends on files); order: tests → script/config → wiring → integration → docs.
  - [x] Write `scripts/skill-gate.test.mjs` with TEST-GATE-001..019 (fixtures) and run it (expect import failure).
  - [x] Implement `scripts/skill-gate.mjs` (`evaluate`, `parseInvokedSkills`, `collectRequired`, glob matcher, `main`).
  - [x] Add `.claude/skill-triggers.json` and `.claude/settings.json`; rerun gate tests (expect green incl. 017/018).
  - [x] Register `scripts/skill-gate.test.mjs` in `package.json` `skills:test`.
  - [x] Add AGENTS.md phase-transition clause; add `.gitignore` entry.
  - [x] Add TEST-GATE-021 assertions to the copier integration helper.
- [x] Preserve all affected contracts (copier generation, existing test suites).

## Verification

- [x] `node --test scripts/skill-gate.test.mjs` — record First observed run (fail) then Passing rerun.
- [x] `pnpm --filter create-mono-stack test:integration` — TEST-GATE-021.
- [x] `just check` — full gate (lint, typecheck, format, skills-check, skills-test, template-test).
- [x] Manual: with hook live and no skill invoked, an `apps/server` edit denies naming test-first-workflow + backend-standards.
- [x] Review full diff; re-scan this checklist for stale items.

## Validation Notes

- Unit suite `node --test scripts/skill-gate.test.mjs`:
  - First observed run (before implementing `scripts/skill-gate.mjs`): failed to load — Cannot find module ./skill-gate.mjs — so none of TEST-GATE-001..019 executed, matching each case Expected-result-before-the-code-change.
  - Passing rerun (after implementation): 20/20 pass.
- Manual hook smoke test (`node scripts/skill-gate.mjs` with hook-shaped stdin):
  - Deny: apps/server edit with a transcript containing no Skill calls emitted permissionDecision:"deny" naming test-first-workflow + backend-standards, with the path relativized.
  - Allow: same edit with a transcript containing both skills produced no output (allow).
- `pnpm --filter create-mono-stack test:integration`: pass (TEST-GATE-021).
- `just check`: exit 0, 176 tests pass (pre-existing web:lint warning unrelated to this change).

## Risks and Follow-Up

- [x] Glob matcher is hand-written; keep patterns simple and covered by TEST-GATE-004/006/007/009/011.
- [x] Editing `skills/*/SKILL.md` is intentionally avoided to skip `skills:sync` churn; AGENTS.md carries the rule.
- [x] Once `.claude/settings.json` is active, this session's own edits pass only because test-first-workflow/testing-policy were invoked — confirm no self-lockout.
- [x] Codex/OpenCode remain advisory (no hook); follow-up could add an OpenCode plugin gate.
