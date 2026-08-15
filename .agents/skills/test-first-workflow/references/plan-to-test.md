# Plan-to-Test Guidance

Use this guide while planning. Its purpose is to turn a large request into small work items and exact
test cases before implementation starts.

## Work Order

1. Read the task request and applicable repository and package guidance during the planning phase.
2. For a new bug, scan and read relevant previous checklists, their updates, and the implementations
   and tests they describe before defining the fix.
3. Find the rules that already exist in schemas, validators, types, tests, code, and documentation.
4. Split the requested work into small parts as described below.
5. Write exact test cases for every smallest part and complete the Missing-Case Review.
6. Define implementation steps, dependencies, risks, and things that are outside the task.
7. Create a new unique checklist under
   `docs/checklists/<YYYY-MM-DD>-<implementation-summary-slug>.md` from the completed plan. The slug
   should describe the implementation included in the task. Never reuse an existing checklist for a
   new task.
8. For a commit or release checklist, add an `Implementation Description` section describing the
   concrete implementation included in that commit or release. This does not require creating a
   checklist for every commit or release.
9. Copy the small work items, exact cases, test map, and open questions into the checklist. Link it to
   every relevant previous checklist.
10. Begin tests and implementation only after the checklist captures the complete plan.
11. If later work finds committed previous work defective, append a dated update with the reason,
    evidence, impact, corrective action, validation, and a backlink to the bottom of the original
    checklist. Do not edit its prior plan, items, or statuses.

## Split Large Work Into Small Parts

Use as many checklist levels as the task needs. Do not stop at a feature, page, endpoint, service,
form, or file name.

1. Write the result requested by the user.
2. Under it, list each behavior a user or another system can notice.
3. Under each behavior, list its separate rules and choices.
4. Under each rule, list separate valid results, rejected results, errors, and state changes.
5. Keep splitting until each smallest item has one clear result that can be tested on its own.

Ask this question for every smallest item: "Could one part of this item pass while another part
fails?" If yes, split it again. A line such as "validate and save the form" must become at least one
item for validation and one item for saving because either one can fail on its own.

Broad parent items are useful summaries, but they are not ready work. Their smaller child items are
the work that receives test cases and implementation steps.

Use plain English for every task item, test case, expected result, required change, forbidden action,
reason, and question. If a technical term is needed, explain it in simple words the first time it is
used.

## Find the Real Rules

For each smallest work item, search these sources:

1. The user's request and acceptance criteria.
2. Shared schemas, validators, constants, and types.
3. Existing tests and sample data.
4. Current public behavior and implementation.
5. Repository and package documentation.

Write down the source beside each rule. If no source says what should happen, record an open question
and ask the user instead of guessing. Do not invent a restriction merely because it is common in
another product.

If trusted sources disagree, first check whether repository guidance clearly says which source wins.
If it does not, record the conflicting sources, ask the user, and block the affected test cases and
implementation until the conflict is resolved.

## One Exact Test Situation

One case covers one exact situation. Give it a `TEST-<AREA>-<NUMBER>` ID and include:

## Exact Test Case Rules

Every case must contain these fields: `Small task:`, `Source:`, `Test place:`, `Starting state:`,
`Exact input or fixture:`, `Interaction steps:`, `Main behavior:`, `Expected result:`, `Must change:`,
`Must not happen:`, `Planned command:`, `Expected result before the code change:`,
`First observed run:`, and `Passing rerun:`.

During planning, fill in `Planned command:` and `Expected result before the code change:`. Fill in
`First observed run:` only after its command has run. Fill in `Passing rerun:` only after its command
has run. Do not invent test results before running the command.

If trusted sources disagree, check which source wins under repository guidance. If no rule answers
that question, record the conflict, ask the user, and block the affected cases and implementation.

Use each field as follows:

- **Small task:** The one smallest work item this case proves.
- **Source:** Where the expected behavior is defined.
- **Test place:** The test kind and expected test file.
- **Starting state:** Existing records, signed-in state, screen state, dependency replies, clock, and
  other facts needed before the action.
- **Exact input or fixture:** Real sample values, not labels such as "bad input."
- **Interaction steps:** Every step needed to reach the result, such as enter a value and then submit.
- **Main behavior:** The one behavior or result being checked. Several Interaction steps are allowed
  when they are needed for that behavior.
- **Expected result:** The exact returned value, visible text, status, error code, or next state.
- **Must change:** Data, calls, events, navigation, or files that must change when relevant.
- **Must not happen:** Writes, calls, events, or navigation that must not happen when relevant.
- **Planned command:** The exact command to run after the checklist has been created.
- **Expected result before the code change:** The failure or other result expected from that first run.
- **First observed run:** Leave this pending during planning. After the checklist exists, record the
  command and real result before implementation.
- **Passing rerun:** The command and observed passing result after implementation.

Do not invent test results before running the command. Planning fills the Planned command and Expected
result fields. The First observed run and Passing rerun fields are filled only after those commands
have actually run.

Separate two situations when they use a different rule, input group, branch, state, or expected
result that could fail independently. Similar cases may be rows in one table-based test, but every row
must keep its test ID, exact values, and expected result.

## Find Every Needed Case

For every smallest task item and every real rule, check the following list. Add separate cases when
the situations can reach the code and should behave differently:

- Normal valid values and successful results.
- Each validation rule and each separate kind of rejected value.
- Missing value, explicit `null`, empty value, spaces-only text, and wrong value type.
- Bad format, unsupported value, duplicate value, and values that conflict with each other.
- An exact minimum, the closest value below it, an exact maximum, and the closest value above it.
- Each choice or branch.
- Empty data, one item, and many items when the amount changes behavior.
- Each allowed state change and each blocked state change.
- Not found, dependency failure, timeout, and unexpected error.
- Signed out, wrong permission, wrong owner, or wrong account when access control applies.
- Required data changes, outside calls, messages, events, files, or navigation.
- Work that must not happen after a rejected request or error.
- A repeated request, retry, or duplicate delivery when the operation can happen more than once.
- Old callers, stored data, or public behavior that must continue to work.
- Loading, empty, success, error, and retry views when a user interface owns those states.

Test two or more values together when one changes the expected behavior of another, when the order of
checks matters, or when the product must show more than one error at once. Otherwise, test each rule
with the other values valid. Do not list every possible mix of unrelated values.

## Missing-Case Review

Complete this review before creating the checklist:

1. Map every smallest task item to one or more test IDs.
2. Map every discovered rule to one or more test IDs.
3. Review every case area in the list above. Write its test IDs or a plain-English reason it does not
   apply.
4. Confirm every test case contains exact sample values and exact expected checks.
5. Confirm no case hides situations that could fail independently.
6. Confirm every unknown expected result is answered or recorded as a blocking question.
7. Confirm every disagreement between trusted sources is resolved or recorded as a blocking question.
8. Confirm observed-result fields are still pending until their commands run.

"Add focused tests," "test validation," "test errors," and "cover edge cases" do not pass this
review. They may be headings only when exact cases are listed below them.

Do not begin tests or implementation until this review is complete.

## Checklist Lifecycle

1. Treat a staged or unstaged but uncommitted checklist as an active working document.
2. For the same task, re-plan scope or approach changes, then edit the active checklist in place before
   implementing them. Do not add `## Updates` for ordinary uncommitted changes.
3. Record active validation failures under the current validation item or `## Validation Notes` before
   correcting them, then record the passing rerun.
4. Treat a committed checklist as immutable history. A genuinely new task or bug gets a new checklist,
   and a later correction to committed work is recorded in a bottom `## Updates` section on the original.

## Test IDs

Use `TEST-<AREA>-<NUMBER>` for durable test case IDs:

```text
TEST-API-001
TEST-SERVER-002
TEST-QUERY-003
```

Use the owning package or module for `AREA`, and keep numbering stable when cases are reordered.

## Simple Example

This example shows the method only. Do not copy its made-up rules into another task.

Request: Add a quantity field. The existing schema says it must be a whole number from 1 through 10.

Small task breakdown:

- Show the quantity field.
- Accept a valid quantity.
  - Save the lowest allowed value.
  - Save a middle allowed value.
  - Save the highest allowed value.
- Reject an invalid quantity.
  - Reject a missing value.
  - Reject a value below the minimum.
  - Reject a value above the maximum.
  - Reject a decimal value.
- Show the validation message without saving.

Exact cases include:

- `TEST-FORM-001`: Start with an empty form, enter `1`, submit once, and expect quantity `1` to be
  saved.
- `TEST-FORM-002`: Start with an empty form, enter `10`, submit once, and expect quantity `10` to be
  saved.
- `TEST-FORM-003`: Start with an empty form, enter `0`, submit once, expect the schema's minimum-value
  error, and expect no save call.
- `TEST-FORM-004`: Start with an empty form, enter `11`, submit once, expect the schema's maximum-value
  error, and expect no save call.
- `TEST-FORM-005`: Start with an empty form, enter `1.5`, submit once, expect the schema's whole-number
  error, and expect no save call.

"Test quantity validation" would be only a heading. It would not be a complete plan because it hides
the exact situations above.

## Validation Sequence

1. Pick one smallest task item and its exact cases from the checklist.
2. Write those cases.
3. Run them before implementation when a useful failing result is possible.
4. Record the First observed run against the matching test IDs before changing implementation.
5. Implement the smallest change needed for those cases.
6. Run the exact cases, then the package-level checks.
7. Record every result, including failures, before fixing the next problem.
8. Fix failures, rerun the checks, and record the passing result for each case ID.
9. Mark the smallest item complete only after all of its cases pass.
10. Mark parent items complete only after all smaller items below them are complete.
11. For a later defect in committed prior work, append the update to the bottom of its original
    checklist without changing the earlier content.
