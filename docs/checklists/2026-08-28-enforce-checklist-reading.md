# Enforce Checklist Reading Before Implementation

Related checklists:

- [Implementation contract gate](./2026-08-27-implementation-contract-validator.md)
- [Agent skill enforcement](./2026-08-27-agent-skill-enforcement.md)
- [Strict relative import policy](./2026-08-24-strict-relative-import-policy.md)

## Implementation Contract

### Feature Boundaries

- Require an active implementation checklist before non-documentation edits.
- Require the agent to read the active checklist and every checklist explicitly declared under `Related checklists`.
- Enforce the read prerequisite in the Claude hook transcript path and OpenCode plugin session state.
- Do not infer relevance from filenames; the active checklist declares the historical records.

### Route-Group Ownership

- No application routes change. Route ownership is not applicable to tooling enforcement.
- The tooling gate owns edit permission for implementation paths; checklist documents remain editable while planning.

### User Journey

- Before planning: implementation edits are denied without a valid active checklist.
- During planning: the agent reads declared historical and active checklists.
- After required reads: implementation edits proceed.
- On missing reads: the gate rejects the edit with the exact checklist paths still required.

### Complete Test Matrix

| ID                 | Path type     | Source               | Test place                                 | Expected result                                        | Limitation                               |
| ------------------ | ------------- | -------------------- | ------------------------------------------ | ------------------------------------------------------ | ---------------------------------------- |
| TEST-CHECKLIST-001 | Valid         | Contract gate        | `scripts/implementation-contract.test.mjs` | Related checklist links are extracted                  | Markdown links must use repository paths |
| TEST-CHECKLIST-002 | Invalid       | Read prerequisite    | `scripts/skill-gate.test.mjs`              | Missing active/related reads are rejected              | Transcript format is Claude-specific     |
| TEST-CHECKLIST-003 | Valid         | Read prerequisite    | `scripts/skill-gate.test.mjs`              | Reads of active and declared checklists allow the edit | Does not prove semantic comprehension    |
| TEST-CHECKLIST-004 | Invalid       | OpenCode plugin gate | `scripts/opencode-plugin.test.mjs`         | Edit before checklist read is rejected                 | State is process/session scoped          |
| TEST-CHECKLIST-005 | Valid         | OpenCode plugin gate | `scripts/opencode-plugin.test.mjs`         | Read events followed by edit are allowed               | Depends on OpenCode hook events          |
| TEST-CHECKLIST-006 | Documentation | Workflow policy      | Exact scan and skills tests                | Workflow names explicit read-before-edit behavior      | External agents must use supported hooks |

### Unresolved Conflicts

- Historical checklist relevance is not inferable with certainty. **Resolved decision:** require explicit `Related checklists` declarations in the active checklist.
- Plan mode must permit checklist creation. **Resolved decision:** checklist paths remain exempt; implementation paths require the read state afterward.
- OpenCode hook APIs expose tool events rather than Claude transcripts. **Resolved decision:** use per-plugin-instance state and track successful `read` tool calls.

## Small Task Breakdown

- [x] Extract declared checklist paths from active checklist markdown.
- [x] Require active and declared checklist reads in the Claude gate.
- [x] Track checklist reads and enforce them in the OpenCode plugin.
- [x] Add focused rejection and success tests for both adapters.
- [/] Document the deterministic workflow and run the full validation gate. `just check` reached the existing flaky interactive launcher tests; 3 unrelated Ink timing cases failed in this run, while all tooling checks passed.

## Exact Test Cases

### TEST-CHECKLIST-001: Extract declared checklist paths

- **Small task:** Extract explicit related checklist paths.
- **Source:** This checklist's `Related checklists` contract.
- **Test place:** `scripts/skill-gate.test.mjs`.
- **Starting state:** Markdown contains two repository-relative checklist links and one external link.
- **Exact input or fixture:** `- [x](docs/checklists/a.md)` and `- docs/checklists/b.md`.
- **Interaction steps:** Call the extractor and inspect its returned paths.
- **Main behavior:** Only declared repository checklist paths are returned.
- **Expected result:** The two local paths are returned once each.
- **Must change:** Contract helper and test.
- **Must not happen:** External URLs or unrelated Markdown links are required.
- **Planned command:** `node --test scripts/skill-gate.test.mjs`.
- **Expected result before the code change:** The extractor/test does not exist.
- **First observed run:** Existing contract tests passed, but no extractor test existed yet.
- **Passing rerun:** `node --test scripts/skill-gate.test.mjs` passed the declared-path extraction case.

### TEST-CHECKLIST-002: Claude gate rejects missing reads

- **Small task:** Reject implementation edits when checklist reads are missing.
- **Source:** Test-first and checklist-tracking workflow.
- **Test place:** `scripts/skill-gate.test.mjs`.
- **Starting state:** Valid active checklist exists; transcript has no checklist read event.
- **Exact input or fixture:** Implementation edit for `src/example.ts` with empty transcript.
- **Interaction steps:** Evaluate the hook decision.
- **Main behavior:** Missing reads block the edit.
- **Expected result:** Denial names the active checklist and declared related checklist paths.
- **Must change:** Claude gate logic and test.
- **Must not happen:** Implementation edit must not be allowed.
- **Planned command:** `node --test scripts/skill-gate.test.mjs`.
- **Expected result before the code change:** A valid contract alone allows the edit.
- **First observed run:** Existing skill-gate tests passed; the valid checklist edit was allowed without any read event.
- **Passing rerun:** `node --test scripts/skill-gate.test.mjs` rejected the valid-contract edit and named both missing checklist paths.

### TEST-CHECKLIST-003: Claude gate allows complete reads

- **Small task:** Allow implementation edits after all required checklist reads.
- **Source:** Test-first and checklist-tracking workflow.
- **Test place:** `scripts/skill-gate.test.mjs`.
- **Starting state:** Valid active checklist and transcript read all declared paths.
- **Exact input or fixture:** Read events for the active checklist and each related checklist, then edit `src/example.ts`.
- **Interaction steps:** Evaluate the hook decision.
- **Main behavior:** Complete read state satisfies the gate.
- **Expected result:** The edit is allowed when required skills are also invoked.
- **Must change:** Claude gate logic and test.
- **Must not happen:** A checklist read must not be treated as a missing skill.
- **Planned command:** `node --test scripts/skill-gate.test.mjs`.
- **Expected result before the code change:** Read events are ignored and the new prerequisite is not enforced.
- **First observed run:** Existing skill-gate tests passed; transcript checklist reads were not tracked.
- **Passing rerun:** `node --test scripts/skill-gate.test.mjs` allowed the edit after both checklist paths appeared in the transcript read set.

### TEST-CHECKLIST-004: OpenCode rejects edit before reads

- **Small task:** Enforce read state in the OpenCode adapter.
- **Source:** OpenCode implementation-contract plugin.
- **Test place:** `scripts/opencode-plugin.test.mjs`.
- **Starting state:** Plugin instance sees a valid active checklist but no prior read event.
- **Exact input or fixture:** `tool.execute.before` for `edit` targeting `src/example.ts`.
- **Interaction steps:** Invoke the edit hook before invoking any checklist read.
- **Main behavior:** The plugin blocks the edit.
- **Expected result:** The hook throws a missing-checklist-read error.
- **Must change:** OpenCode plugin and test.
- **Must not happen:** Valid contract alone must not bypass the read prerequisite.
- **Planned command:** `node --test scripts/opencode-plugin.test.mjs`.
- **Expected result before the code change:** The plugin allows the valid edit.
- **First observed run:** Existing OpenCode plugin tests passed; a valid edit was allowed without reading the checklist.
- **Passing rerun:** `node --test scripts/opencode-plugin.test.mjs` passed the rejection case; the valid edit now requires a checklist read.

### TEST-CHECKLIST-005: OpenCode allows edit after reads

- **Small task:** Permit edits after successful checklist reads.
- **Source:** OpenCode plugin hook contract.
- **Test place:** `scripts/opencode-plugin.test.mjs`.
- **Starting state:** Plugin has observed successful reads of active and related checklists.
- **Exact input or fixture:** Read events for all declared paths followed by `edit` on `src/example.ts`.
- **Interaction steps:** Invoke read hooks, then the edit hook.
- **Main behavior:** Complete read state allows the edit.
- **Expected result:** No hook error is thrown.
- **Must change:** OpenCode plugin and test.
- **Must not happen:** Reading unrelated files must not satisfy the prerequisite.
- **Planned command:** `node --test scripts/opencode-plugin.test.mjs`.
- **Expected result before the code change:** Read events are not tracked.
- **First observed run:** Existing OpenCode plugin tests passed; read events were not tracked.
- **Passing rerun:** `node --test scripts/opencode-plugin.test.mjs` passed the successful-read case, including the declared related checklist.

### TEST-CHECKLIST-006: Workflow documentation is explicit

- **Small task:** Document the mechanical read-before-edit sequence.
- **Source:** User request and repository workflow rules.
- **Test place:** Exact content scan and `pnpm skills:test`.
- **Starting state:** Existing docs require a checklist but do not require proof of reading it.
- **Exact input or fixture:** Root workflow and gate error messages.
- **Interaction steps:** Scan for `Related checklists`, `read`, and `before editing` requirements, then run skills tests.
- **Main behavior:** Agents receive the same deterministic process in guidance and errors.
- **Expected result:** Documentation and tests pass.
- **Must change:** Root guidance and gate diagnostics.
- **Must not happen:** No claim that the gate proves comprehension.
- **Planned command:** `pnpm skills:test && pnpm format:check`.
- **Expected result before the code change:** The read-before-edit wording is absent.
- **First observed run:** Existing workflow and gate tests passed, but no read-before-edit requirement was mechanically documented or enforced.
- **Passing rerun:** `pnpm skills:test` passed 128 tests and `pnpm format:check` passed after formatting the gate, plugin, and checklist.

## Validation Notes

- Initial focused gate tests passed before the new cases were added, confirming that valid edits were previously allowed without checklist reads.
- The first post-implementation formatting run failed for the OpenCode plugin, gate, and active checklist; those files require formatting before final validation.
- One `just check` run reached the existing interactive launcher suite and had one unrelated Ink timing failure (`navigates backward through selectable wizard screens`); all other checks in that run passed.
- The later full validation run had three existing Ink timing failures; focused checklist-gate tests, lint, typecheck, formatting, skills, API tests, and the remaining launcher tests passed.
