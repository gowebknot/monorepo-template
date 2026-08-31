# Light Change Record

Use this for a light-tier change only: a single configuration value, port number, dependency
version bump, copy-only wording tweak, or documentation fix with no runtime behavior, contract,
route, authorization, endpoint, or end-to-end test impact, done as one small cohesive set of edits.

Do not create a file under `docs/checklists/` for a light-tier change. Paste the block below into
your response before the first edit, then paste it again with `Recorded results:` filled in into
the commit message body.

If any disqualifier is "yes", stop: use [task-checklist.md](task-checklist.md) at standard tier, or
split the work into a large-tier parent checklist with standard-tier child checklists.

## Attestation

```
LIGHT-TIER-ATTESTATION
1. Changes runtime behavior, control flow, or a conditional branch: <yes or no>
2. Adds or changes an API contract, schema, DTO, validator, or shared type: <yes or no>
3. Changes a route, navigation, form behavior, or user-facing validation: <yes or no>
4. Touches authentication, authorization, sessions, roles, permissions, or ownership: <yes or no>
5. Adds or changes an endpoint, background job, scheduled task, or data migration: <yes or no>
6. Adds or modifies an e2e/integration/behavior test or any file under apps/playwright or apps/maestro: <yes or no>
7. Needs more than one small cohesive edit, or is really a large multi-behavior change: <yes or no>
```

## Acceptance Criteria

- One to three plain-English criteria for "this change is done and correct".

## Validation Cases

- Exact command — expected result.

## Recorded Results

- Exact command — observed result before the change.
- Exact command — observed result after the change.
