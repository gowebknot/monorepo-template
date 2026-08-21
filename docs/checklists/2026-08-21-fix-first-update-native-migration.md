# Fix First Update Native Migration

- Checklist ID: CHECKLIST-20260821-fix-first-update-native-migration
- Created: 2026-08-21
- Type: Bug fix and patch release
- Source request: A single `pnpm template:update` must regenerate named React Native root files.
- Related checklist: [Fix Named React Native Entry Files](./2026-08-21-fix-named-react-native-entry.md)
- Related release: `create-mono-stack@0.1.18`
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Implementation Description

- Move native root regeneration into Copier's post-update migration mechanism.
- Keep generated static Metro branches manifest-driven.
- Release the migration as `create-mono-stack@0.1.19`.

## Acceptance Criteria

- [ ] A project updating directly from `0.1.18` regenerates native roots in one command.
- [x] Copier runs the migration after the new template scripts are installed.
- [ ] Failed updates do not run the migration.
- [ ] `ancd` repairs a reverted `metro.config.js` in one update.
- [ ] The named Android bundle returns HTTP `200` after that update.

## Exact Test Cases

### TEST-MIGRATION-001: Configure a post-update native migration

- **Small task:** Register the preflight as a Copier migration.
- **Source:** Copier 9.17.1 migration settings and the first-update failure.
- **Test place:** `core/create-mono-stack/test/copier-template.test.js`.
- **Starting state:** `copier.yml` has no migration setting.
- **Exact input or fixture:** Parsed template configuration.
- **Interaction steps:** Parse `copier.yml` and inspect its migration configuration.
- **Main behavior:** The template declares a migration command, which defaults to after-update.
- **Expected result:** Migration runs `node scripts/dev-ports.mjs` after updates.
- **Must change:** Copier configuration only.
- **Must not happen:** Use `_tasks` or require a second template update.
- **Planned command:** `node --test core/create-mono-stack/test/copier-template.test.js --test-name-pattern='migration'`
- **Expected result before the code change:** No migration is configured.
- **First observed run:** Test passed after adding the migration assertion; the pre-change pattern matched no migration assertion.
- **Passing rerun:** `node --test --test-name-pattern='migration' test/copier-template.test.js` and full package suite passed.

### TEST-MIGRATION-002: Repair roots in one real update

- **Small task:** Verify Copier runs the migration after applying the new template.
- **Source:** The user must not commit and rerun `template:update`.
- **Test place:** Copier integration fixture with a named React Native project.
- **Starting state:** Project is at `0.1.18` with stale or missing root native files.
- **Exact input or fixture:** Named apps `apps/mobile-app-1` and `apps/mobile-app-2`.
- **Interaction steps:** Run one `pnpm template:update --defaults`, inspect root files, and request the Android bundle.
- **Main behavior:** One update installs and executes the migration.
- **Expected result:** Both root files contain static branches for both named apps; bundle returns HTTP `200`.
- **Must change:** Generated root native files and Copier answers.
- **Must not happen:** A second update or manual preflight command.
- **Planned command:** `pnpm template:update --defaults`
- **Expected result before the code change:** The first update removes or leaves root files stale without running the new preflight.
- **First observed run:** `pnpm --filter create-mono-stack test:integration` failed during the Copier update with status `4`: migrations are unsafe unless the update uses `--trust`.
- **Passing rerun:**

### TEST-MIGRATION-003: Keep migration failure-safe

- **Small task:** Ensure failed Copier updates do not invoke the root generator.
- **Source:** Existing update failure behavior.
- **Test place:** Copier migration test fixture.
- **Starting state:** Copier update fails before its after-update stage.
- **Exact input or fixture:** Controlled failing update command.
- **Interaction steps:** Run the failing update and inspect generated files.
- **Main behavior:** The update reports failure without post-update mutation.
- **Expected result:** Non-zero update status and no migration-generated files.
- **Must change:** Nothing after failure.
- **Must not happen:** The migration must not run.
- **Planned command:** `node --test core/create-mono-stack/test/copier-template.test.js --test-name-pattern='migration failure'`
- **Expected result before the code change:** No migration failure behavior is defined.
- **First observed run:** Not reached independently; the integration failure established the missing trust flag at the update boundary.
- **Passing rerun:**

## Release Steps

- [x] Add migration and tests.
- [x] Bump `create-mono-stack` to `0.1.19`.
- [x] Run tests, integration, package dry-run, and release checks; integration first exposed the missing Copier trust flag.
- [ ] Commit, push, tag, and publish `0.1.19`.
- [ ] Run one update in `ancd` and verify Metro.
