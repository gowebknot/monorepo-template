# Revalidate Persisted Development Ports

- Checklist ID: CHECKLIST-20260821-revalidate-persisted-dev-ports
- Created: 2026-08-21
- Planning completed: 2026-08-21
- Type: Bug fix
- Source request: Recheck saved ports before starting generated apps so occupied ports are reassigned.
- Related checklist: [Multi-Instance Development Port Allocation](./2026-08-20-multi-instance-port-allocation.md)
- Related release: `create-mono-stack@0.1.16`
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Implementation Description

- Recheck every saved `dev` and `reference` port before keeping it.
- Reassign a saved port when the operating system reports it as occupied.
- Keep free saved assignments stable and keep ports unique within each mode.
- Apply the same rule to project creation/management and generated-project startup.

## Acceptance Criteria

- [x] A saved port that is occupied is replaced with the next free port.
- [x] A saved port that is free remains unchanged.
- [x] Newly assigned ports do not conflict with saved or occupied ports.
- [x] Generated project startup writes changed assignments to `.mono-stack.json` before apps launch.
- [x] The existing `abcd` reproduction no longer fails because of the saved `8083` port.
- [x] The availability probe detects ports bound on the wildcard address.
- [ ] No commit, tag, push, or publish happens until local validation passes.

## Exact Test Cases

### TEST-PORT-008: Reassign an occupied saved runtime port

- **Small task:** Recheck saved ports in the generated runtime allocator.
- **Source:** `/Users/mr_adventurous/my-adventures/experiments/abcd` fails with saved `reference: 8083` and `EADDRINUSE`.
- **Test place:** `scripts/dev-ports.test.mjs`.
- **Starting state:** One React Native app has `dev: 4100` and `reference: 4201`; `4100` is occupied and `4201` is free.
- **Exact input or fixture:** `ports: { dev: 4100, reference: 4101 }`, checker returns false only for `4100`.
- **Interaction steps:** Allocate both modes.
- **Main behavior:** The allocator validates an existing port before preserving it.
- **Expected result:** `dev` becomes `4101`; `reference` stays `4201`.
- **Must change:** Only the occupied saved assignment.
- **Must not happen:** The free saved assignment must not move.
- **Planned command:** `node --test scripts/dev-ports.test.mjs --test-name-pattern='saved runtime port'`
- **Expected result before the code change:** The test fails because the current allocator preserves occupied saved ports.
- **First observed run:** Failed as expected: the runtime allocator returned `dev: 4100` instead of `4101`.
- **Passing rerun:** The focused runtime allocator test passed and returned `dev: 4101` with `reference: 4201`.

### TEST-PORT-009: Reassign an occupied saved management port

- **Small task:** Recheck saved ports in the launcher allocator used by project creation and management.
- **Source:** `core/create-mono-stack/src/port-allocation.js` shares the same preservation bug.
- **Test place:** `core/create-mono-stack/test/port-allocation.test.js`.
- **Starting state:** One Nest app has `dev: 4200` and `reference: 4301`; `4200` is occupied and `4301` is free.
- **Exact input or fixture:** `ports: { dev: 4200, reference: 4201 }`, checker returns false only for `4200`.
- **Interaction steps:** Allocate both modes.
- **Main behavior:** The management allocator validates an existing port before preserving it.
- **Expected result:** `dev` becomes `4201`; `reference` stays `4301`.
- **Must change:** Only the occupied saved assignment.
- **Must not happen:** The free saved assignment must not move.
- **Planned command:** `node --test core/create-mono-stack/test/port-allocation.test.js --test-name-pattern='saved management port'`
- **Expected result before the code change:** The test fails because the current allocator preserves occupied saved ports.
- **First observed run:** Failed as expected: the management allocator returned `dev: 4200` instead of `4201`.
- **Passing rerun:** The focused management allocator test passed and returned `dev: 4201` with `reference: 4301`.

### TEST-PORT-010: Update a generated project before launch

- **Small task:** Persist a reassigned port before generated apps start.
- **Source:** Root `dev` and `dev:reference` scripts run `scripts/dev-ports.mjs` before Turbo.
- **Test place:** Generated-project runtime integration using a disposable copy of `abcd`.
- **Starting state:** The copy has saved React Native `reference: 8083`, and a controlled local listener occupies `8083`.
- **Exact input or fixture:** A copy of `/Users/mr_adventurous/my-adventures/experiments/abcd` plus a listener on `127.0.0.1:8083`.
- **Interaction steps:** Run the generated reference preflight, inspect the manifest, then start reference apps.
- **Main behavior:** The preflight changes the occupied assignment before app launch.
- **Expected result:** The manifest contains a free replacement for `mobile-app-1.reference`; startup does not report `EADDRINUSE` for `8083`.
- **Must change:** Only the affected copied manifest and generated script state.
- **Must not happen:** The real `abcd` directory must not be changed during pre-release testing.
- **Planned command:** `pnpm dev:reference --concurrency 20`
- **Expected result before the code change:** The generated reference run can fail with `EADDRINUSE` for saved port `8083`.
- **First observed run:** The disposable preflight left `mobile-app-1.reference` at `8083`; the existing `127.0.0.1` probe reported the wildcard-bound process as available.
- **Passing rerun:** The disposable preflight changed `mobile-app-1.reference` from `8083` to `8085`; the full generated command reached all 16 apps without `EADDRINUSE`, then stopped because the disposable copy intentionally had no app `node_modules`.

### TEST-PORT-011: Detect wildcard-bound ports

- **Small task:** Check the same address family used by app servers when testing a port.
- **Source:** Local reproduction: `lsof` showed port `8083` bound on `*`, while the old `127.0.0.1` probe reported it free.
- **Test place:** `scripts/dev-ports.test.mjs` with a local TCP listener.
- **Starting state:** A local listener owns an ephemeral wildcard IPv4 port.
- **Exact input or fixture:** A `node:net` server listening on `0.0.0.0` with port `0`.
- **Interaction steps:** Read the assigned port and call `isPortAvailable` for it.
- **Main behavior:** The availability probe rejects the wildcard-bound port.
- **Expected result:** `isPortAvailable` returns `false` while the listener is active.
- **Must change:** The port probe's default bind address.
- **Must not happen:** The test must not depend on the existing `8083` process or any external service.
- **Planned command:** `node --test scripts/dev-ports.test.mjs --test-name-pattern='wildcard-bound'`
- **Expected result before the code change:** The test fails because the old probe checks only `127.0.0.1`.
- **First observed run:** A direct probe reported `127.0.0.1:8083` free while `0.0.0.0:8083` and `:::8083` were occupied.
- **Passing rerun:** The deterministic wildcard listener test passed.

## Test-To-Task Map

| Small task                     | Test IDs        |
| ------------------------------ | --------------- |
| Recheck runtime assignments    | `TEST-PORT-008` |
| Recheck management assignments | `TEST-PORT-009` |
| Persist changes before launch  | `TEST-PORT-010` |
| Detect wildcard-bound ports    | `TEST-PORT-011` |

## Risks And Non-Goals

- A port can become occupied after the preflight check and before the app binds; this change does not remove that race.
- Ports remain independently allocated for `dev` and `reference` modes.
- The real `abcd` project is updated only after a verified release is published.

## Validation Notes

- Focused runtime and management allocator tests passed after the persisted-port check was added.
- The wildcard-bound port test passed after changing the default probe address to `0.0.0.0`.
- The generated disposable project moved `mobile-app-1.reference` from `8083` to `8085` and reached
  all 16 reference tasks without `EADDRINUSE`; app startup then stopped because the disposable copy
  intentionally lacked app `node_modules`.
- The full launcher suite first had intermittent Ink timing failures in two different runs; the
  complete rerun then passed all `253/253` tests.
- Root `pnpm format:check` still reports only the unrelated pre-existing
  `apps/expo/tsconfig.json` change. All changed files pass focused formatting and `git diff --check`.
