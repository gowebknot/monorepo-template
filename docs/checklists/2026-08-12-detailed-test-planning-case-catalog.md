# Detailed Test Planning Case Catalog

- Parent checklist: [Detailed Test Planning](./2026-08-12-detailed-test-planning.md)
- Purpose: Preserve the original task map and exact cases while keeping each active checklist file
  focused and below 300 lines.

## Small Task and Test Map

| Small task or rule                                   | Test IDs                              |
| ---------------------------------------------------- | ------------------------------------- |
| Reject broad headings and split broad work           | TEST-SKILL-019, TEST-SKILL-020        |
| Preserve real user flows                             | TEST-SKILL-034                        |
| Separate normal and rejected values                  | TEST-SKILL-022                        |
| Map every small task and rule                        | TEST-SKILL-023                        |
| Ask about missing rules                              | TEST-SKILL-024                        |
| Limit combined-value cases and keep table rows clear | TEST-SKILL-025, TEST-SKILL-026        |
| Keep all copied skill folders the same               | TEST-SKILL-027                        |
| Require plain English                                | TEST-SKILL-032                        |
| Review each easily missed situation separately       | TEST-SKILL-035 through TEST-SKILL-080 |
| Keep every case field in every policy file           | TEST-SKILL-081 through TEST-SKILL-086 |
| Keep planned and observed results separate per file  | TEST-SKILL-087 through TEST-SKILL-092 |
| Block conflicting rules in every policy file         | TEST-SKILL-093 through TEST-SKILL-098 |

## Exact Checks For This Change

The following fields apply to every row in the first table:

- Source: User request, repository rules, or a review correction named by the row.
- Test place: `scripts/test-planning-policy.test.mjs`.
- Starting state: The canonical workflow, guide, template, testing policy, checklist skill, and
  checklist reference are readable.
- Interaction steps: Read each named file and check the exact rule.
- Must change: Nothing; these are read-only text checks.
- Must not happen: No file writes, network calls, or product code runs.
- Planned command: `node --test scripts/test-planning-policy.test.mjs`.
- Expected result before the code change: The named case fails when its rule is absent.

| ID             | Small task               | Exact input or fixture                     | Main behavior                      | Expected result                                         | First observed run                                | Passing rerun                        |
| -------------- | ------------------------ | ------------------------------------------ | ---------------------------------- | ------------------------------------------------------- | ------------------------------------------------- | ------------------------------------ |
| TEST-SKILL-019 | Reject broad notes       | "add focused tests"                        | Check whether the note is complete | It is a heading only; exact cases are required          | Passed when first run separately                  | Passed in the final policy suite     |
| TEST-SKILL-020 | Split broad work         | A task with parts that can fail separately | Check when splitting stops         | Splitting continues at any depth                        | Failed because its first text check was too exact | Passed after the check was corrected |
| TEST-SKILL-022 | Separate rejected values | Normal and separately rejected values      | Check invalid-case detail          | One broad invalid-input case is not enough              | Passed when first run separately                  | Passed in the final policy suite     |
| TEST-SKILL-023 | Map work to tests        | Every small task and known rule            | Check the coverage map             | Every row maps to test IDs                              | Failed because its first text check was too exact | Passed after the check was corrected |
| TEST-SKILL-024 | Ask about missing rules  | Expected behavior with no trusted rule     | Check unanswered behavior          | Ask the user and block affected work                    | Passed when first run separately                  | Passed in the final policy suite     |
| TEST-SKILL-025 | Limit combined cases     | Related and unrelated values               | Check combination rules            | Related values combine; unrelated mixes are avoided     | Passed when first run separately                  | Passed in the final policy suite     |
| TEST-SKILL-026 | Keep rows trackable      | Rows in a table-based test                 | Check each row                     | Every row keeps its ID, input, and result               | Failed when one reference used different wording  | Passed after the wording was aligned |
| TEST-SKILL-032 | Require simple wording   | Task and test wording                      | Check writing rules                | Plain English is used and technical terms are explained | Failed before the rule was added                  | Passed after the rule was added      |
| TEST-SKILL-034 | Preserve real user flows | A flow with several interaction steps      | Check one focused behavior         | List all steps but name one main behavior               | Failed before the fields were added               | Passed after the fields were added   |

### Skill Copy Check

- [x] TEST-SKILL-027: All four skill folders contain the same files.
  - Small task: Keep copied skills synchronized.
  - Source: Repository skill rules.
  - Test place: `pnpm skills:check`.
  - Starting state: Canonical edits are complete.
  - Exact input or fixture: All 16 canonical skills and their three copied roots.
  - Interaction steps: Run `pnpm skills:sync`, then `pnpm skills:check`.
  - Main behavior: Validate identical skill copies.
  - Expected result: All 16 skills validate with no different copies.
  - Must change: Only intended copied skill files and saved hashes during synchronization.
  - Must not happen: No unrelated file changes.
  - Planned command: `pnpm skills:sync && pnpm skills:check`.
  - Expected result before the code change: The check fails until changed skills are synchronized.
  - First observed run: Both commands passed after the first synchronization.
  - Passing rerun: Both commands passed after the final synchronization.

### Missed-Case Rows

The following shared fields are part of every row from `TEST-SKILL-035` through `080`:

- Small task: Review the exact situation named in the row.
- Source: User request and second review correction.
- Test place: `scripts/test-case-coverage-policy.test.mjs`.
- Starting state: The case-design guide and checklist template are readable.
- Exact input or fixture: The exact situation named in the row.
- Interaction steps: Read both files and look for that exact situation.
- Main behavior: Require a separate checklist prompt for the named situation.
- Expected result: Both files name the situation; the template requires test IDs or a reason.
- Must change: Nothing; these are read-only text checks.
- Must not happen: No file writes, network calls, or product code runs.
- Planned command: `node --test scripts/test-case-coverage-policy.test.mjs`.
- Expected result before the code change: A row fails if either file omits its situation.
- Passing rerun: Every row passed in the final 46-case coverage run.

| ID             | Exact situation                 | First observed run                                       |
| -------------- | ------------------------------- | -------------------------------------------------------- |
| TEST-SKILL-035 | Missing value                   | Passed                                                   |
| TEST-SKILL-036 | Explicit `null` value           | Passed                                                   |
| TEST-SKILL-037 | Empty value                     | Passed                                                   |
| TEST-SKILL-038 | Spaces-only text                | Passed                                                   |
| TEST-SKILL-039 | Wrong value type                | Passed                                                   |
| TEST-SKILL-040 | Bad format                      | Passed                                                   |
| TEST-SKILL-041 | Unsupported value               | Passed                                                   |
| TEST-SKILL-042 | Duplicate value                 | Passed                                                   |
| TEST-SKILL-043 | Conflicting values              | Passed                                                   |
| TEST-SKILL-044 | Exact minimum                   | Passed                                                   |
| TEST-SKILL-045 | Closest value below the minimum | Passed                                                   |
| TEST-SKILL-046 | Exact maximum                   | Passed                                                   |
| TEST-SKILL-047 | Closest value above the maximum | Passed                                                   |
| TEST-SKILL-048 | Each choice                     | Passed                                                   |
| TEST-SKILL-049 | Each branch                     | Passed                                                   |
| TEST-SKILL-050 | Empty data                      | Failed because the template omitted this prompt          |
| TEST-SKILL-051 | One item                        | Passed                                                   |
| TEST-SKILL-052 | Many items                      | Failed because the template omitted this prompt          |
| TEST-SKILL-053 | Allowed state change            | Failed because the template grouped both state changes   |
| TEST-SKILL-054 | Blocked state change            | Passed                                                   |
| TEST-SKILL-055 | Not found                       | Passed                                                   |
| TEST-SKILL-056 | Dependency failure              | Passed                                                   |
| TEST-SKILL-057 | Timeout                         | Passed                                                   |
| TEST-SKILL-058 | Unexpected error                | Passed                                                   |
| TEST-SKILL-059 | Signed-out access               | Passed                                                   |
| TEST-SKILL-060 | Wrong-permission access         | Passed                                                   |
| TEST-SKILL-061 | Wrong-owner access              | Passed                                                   |
| TEST-SKILL-062 | Wrong-account access            | Passed                                                   |
| TEST-SKILL-063 | Required data changes           | Failed because the template grouped all required effects |
| TEST-SKILL-064 | Required outside calls          | Passed                                                   |
| TEST-SKILL-065 | Required messages               | Passed                                                   |
| TEST-SKILL-066 | Required events                 | Passed                                                   |
| TEST-SKILL-067 | Required file changes           | Passed                                                   |
| TEST-SKILL-068 | Required navigation             | Passed                                                   |
| TEST-SKILL-069 | Forbidden work after rejection  | Passed                                                   |
| TEST-SKILL-070 | Repeated request                | Passed                                                   |
| TEST-SKILL-071 | Retry                           | Passed                                                   |
| TEST-SKILL-072 | Duplicate delivery              | Passed                                                   |
| TEST-SKILL-073 | Existing callers                | Passed                                                   |
| TEST-SKILL-074 | Stored data                     | Passed                                                   |
| TEST-SKILL-075 | Existing public behavior        | Passed                                                   |
| TEST-SKILL-076 | Loading view                    | Passed                                                   |
| TEST-SKILL-077 | Empty view                      | Passed                                                   |
| TEST-SKILL-078 | Success view                    | Passed                                                   |
| TEST-SKILL-079 | Error view                      | Passed                                                   |
| TEST-SKILL-080 | Retry view                      | Passed                                                   |

All rows above passed in the final rerun. The four rows with an earlier failure passed after the
template gained separate prompts for their exact situations.

### Per-File Contract Rows

These shared fields apply to `TEST-SKILL-081` through `098`:

- Small task: Protect one rule in one exact policy file.
- Source: Final review correction.
- Test place: `scripts/test-policy-file-contracts.test.mjs`.
- Starting state: The named canonical policy file is readable.
- Exact input or fixture: The exact field list, result-timing rule, or conflict rule named below.
- Interaction steps: Read only the named file and check the named rule.
- Main behavior: Prevent one policy file from relying on another for required instructions.
- Expected result: The named file contains the complete rule.
- Must change: Nothing; these are read-only text checks.
- Must not happen: No file writes, network calls, or product code runs.
- Planned command: `node --test scripts/test-policy-file-contracts.test.mjs`.
- Expected result before the code change: A case fails when its named file omits the rule.
- Passing rerun: All 18 cases passed after every policy file received the complete contract.

| ID             | Exact policy file   | Exact rule                                      | First observed run                        | Passing rerun                      |
| -------------- | ------------------- | ----------------------------------------------- | ----------------------------------------- | ---------------------------------- |
| TEST-SKILL-081 | Workflow            | Every exact case field                          | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-082 | Guide               | Every exact case field                          | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-083 | Template            | Every exact case field                          | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-084 | Testing policy      | Every exact case field                          | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-085 | Checklist skill     | Every exact case field                          | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-086 | Checklist reference | Every exact case field                          | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-087 | Workflow            | Planned and observed results stay separate      | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-088 | Guide               | Planned and observed results stay separate      | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-089 | Template            | Planned and observed results stay separate      | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-090 | Testing policy      | Planned and observed results stay separate      | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-091 | Checklist skill     | Planned and observed results stay separate      | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-092 | Checklist reference | Planned and observed results stay separate      | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-093 | Workflow            | Conflicting sources ask the user and block work | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-094 | Guide               | Conflicting sources ask the user and block work | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-095 | Template            | Conflicting sources ask the user and block work | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-096 | Testing policy      | Conflicting sources ask the user and block work | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-097 | Checklist skill     | Conflicting sources ask the user and block work | Failed: exact contract section was absent | Passed after the section was added |
| TEST-SKILL-098 | Checklist reference | Conflicting sources ask the user and block work | Failed: exact contract section was absent | Passed after the section was added |
