# Maestro Todos Flow Evaluation

Use this prompt to evaluate output from the skill:

> Add Maestro coverage for a Todos screen where a signed-in user can filter, create, edit, and delete
> todos. Existing seed tooling can create a stable owned todo, another user's todo, and an empty user.
> The app supports validation for a missing title, duplicate submission prevention, offline errors, and
> retry. The flow runs on iOS and Android through Expo Go.

## Passing Output

- Inspects existing flows, app selectors, seed commands, Expo Go deep links, and platform differences.
- Preserves separate navigation-smoke and Todos CRUD flows, and uses the existing runner's platform
  commands and guaranteed service cleanup.
- Seeds the owned, other-user, and empty-user records specifically for tests and documents reset and
  cleanup; it does not use demo data or leftover state.
- Separates navigation, successful CRUD, validation, permission/ownership, empty, offline/retry, and
  duplicate-submission intents when each can fail independently.
- Uses visible labels and results, limited stable test IDs, polling assertions, and no sleeps or
  coordinates.
- Uses unique data for the todo created by the flow and verifies deletion and rejected side effects.
- Reports any branch blocked by missing device, CLI, fixture, or platform support rather than
  pretending the flow passed.

No device-backed result should be claimed when a runnable generated mobile project is unavailable.
