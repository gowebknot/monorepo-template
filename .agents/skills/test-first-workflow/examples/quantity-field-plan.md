# Quantity Field Planning Example

This is a planning example, not a product rule. The example request is: add a quantity field. Its
example schema requires a whole number from 1 through 10.

## Small Task and Test Map

| Smallest task                              | Test IDs                            |
| ------------------------------------------ | ----------------------------------- |
| Show the quantity field                    | TEST-FORM-001                       |
| Save the lowest allowed value              | TEST-FORM-002                       |
| Save a middle allowed value                | TEST-FORM-003                       |
| Save the highest allowed value             | TEST-FORM-004                       |
| Reject a missing value                     | TEST-FORM-005                       |
| Reject a value below the minimum           | TEST-FORM-006                       |
| Reject a value above the maximum           | TEST-FORM-007                       |
| Reject a decimal value                     | TEST-FORM-008                       |
| Show the validation message without saving | TEST-FORM-005 through TEST-FORM-008 |

## Exact Test Cases

### TEST-FORM-001

- Small task: Show the quantity field.
- Source: The example request requires a quantity field.
- Test place: UI test in `src/quantity-form.test.tsx`.
- Starting state: Render a new empty form.
- Exact input or fixture: No entered value.
- Interaction steps: Open the form.
- Main behavior: Display the quantity field.
- Expected result: A field labeled `Quantity` is visible.
- Must change: The form displays the new field.
- Must not happen: No save call runs.
- Planned command: `pnpm test -- quantity-form.test.tsx`.
- Expected result before the code change: The field query fails because the field is absent.
- First observed run: Pending; this example does not run a real product command.
- Passing rerun: Pending; this example does not run a real product command.

### TEST-FORM-002

- Small task: Save the lowest allowed value.
- Source: The example schema allows whole numbers from 1 through 10.
- Test place: UI test in `src/quantity-form.test.tsx`.
- Starting state: Render a new empty form with a mocked successful save.
- Exact input or fixture: Quantity `1`.
- Interaction steps: Enter `1`, then submit once.
- Main behavior: Save the lowest allowed quantity.
- Expected result: The save call receives quantity `1`.
- Must change: One save call runs with quantity `1`.
- Must not happen: No validation message appears.
- Planned command: `pnpm test -- quantity-form.test.tsx`.
- Expected result before the code change: The save assertion fails before quantity support exists.
- First observed run: Pending; this example does not run a real product command.
- Passing rerun: Pending; this example does not run a real product command.

### TEST-FORM-003

- Small task: Save a middle allowed value.
- Source: The example schema allows whole numbers from 1 through 10.
- Test place: UI test in `src/quantity-form.test.tsx`.
- Starting state: Render a new empty form with a mocked successful save.
- Exact input or fixture: Quantity `5`.
- Interaction steps: Enter `5`, then submit once.
- Main behavior: Save a middle allowed quantity.
- Expected result: The save call receives quantity `5`.
- Must change: One save call runs with quantity `5`.
- Must not happen: No validation message appears.
- Planned command: `pnpm test -- quantity-form.test.tsx`.
- Expected result before the code change: The save assertion fails before quantity support exists.
- First observed run: Pending; this example does not run a real product command.
- Passing rerun: Pending; this example does not run a real product command.

### TEST-FORM-004

- Small task: Save the highest allowed value.
- Source: The example schema allows whole numbers from 1 through 10.
- Test place: UI test in `src/quantity-form.test.tsx`.
- Starting state: Render a new empty form with a mocked successful save.
- Exact input or fixture: Quantity `10`.
- Interaction steps: Enter `10`, then submit once.
- Main behavior: Save the highest allowed quantity.
- Expected result: The save call receives quantity `10`.
- Must change: One save call runs with quantity `10`.
- Must not happen: No validation message appears.
- Planned command: `pnpm test -- quantity-form.test.tsx`.
- Expected result before the code change: The save assertion fails before quantity support exists.
- First observed run: Pending; this example does not run a real product command.
- Passing rerun: Pending; this example does not run a real product command.

### TEST-FORM-005

- Small task: Reject a missing value.
- Source: The example schema requires a quantity.
- Test place: UI test in `src/quantity-form.test.tsx`.
- Starting state: Render a new empty form with a mocked save.
- Exact input or fixture: No quantity value.
- Interaction steps: Leave quantity empty, then submit once.
- Main behavior: Reject the missing quantity.
- Expected result: The required-value message appears.
- Must change: The validation message becomes visible.
- Must not happen: No save call runs.
- Planned command: `pnpm test -- quantity-form.test.tsx`.
- Expected result before the code change: The required-message assertion fails.
- First observed run: Pending; this example does not run a real product command.
- Passing rerun: Pending; this example does not run a real product command.

### TEST-FORM-006

- Small task: Reject a value below the minimum.
- Source: The example schema sets the minimum quantity to `1`.
- Test place: UI test in `src/quantity-form.test.tsx`.
- Starting state: Render a new empty form with a mocked save.
- Exact input or fixture: Quantity `0`.
- Interaction steps: Enter `0`, then submit once.
- Main behavior: Reject the value below the minimum.
- Expected result: The minimum-value message appears.
- Must change: The validation message becomes visible.
- Must not happen: No save call runs.
- Planned command: `pnpm test -- quantity-form.test.tsx`.
- Expected result before the code change: The minimum-message assertion fails.
- First observed run: Pending; this example does not run a real product command.
- Passing rerun: Pending; this example does not run a real product command.

### TEST-FORM-007

- Small task: Reject a value above the maximum.
- Source: The example schema sets the maximum quantity to `10`.
- Test place: UI test in `src/quantity-form.test.tsx`.
- Starting state: Render a new empty form with a mocked save.
- Exact input or fixture: Quantity `11`.
- Interaction steps: Enter `11`, then submit once.
- Main behavior: Reject the value above the maximum.
- Expected result: The maximum-value message appears.
- Must change: The validation message becomes visible.
- Must not happen: No save call runs.
- Planned command: `pnpm test -- quantity-form.test.tsx`.
- Expected result before the code change: The maximum-message assertion fails.
- First observed run: Pending; this example does not run a real product command.
- Passing rerun: Pending; this example does not run a real product command.

### TEST-FORM-008

- Small task: Reject a decimal value.
- Source: The example schema allows only whole numbers.
- Test place: UI test in `src/quantity-form.test.tsx`.
- Starting state: Render a new empty form with a mocked save.
- Exact input or fixture: Quantity `1.5`.
- Interaction steps: Enter `1.5`, then submit once.
- Main behavior: Reject the decimal quantity.
- Expected result: The whole-number message appears.
- Must change: The validation message becomes visible.
- Must not happen: No save call runs.
- Planned command: `pnpm test -- quantity-form.test.tsx`.
- Expected result before the code change: The whole-number-message assertion fails.
- First observed run: Pending; this example does not run a real product command.
- Passing rerun: Pending; this example does not run a real product command.
