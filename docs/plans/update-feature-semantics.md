# Template Update Feature Semantics

- Status: `idea`
- Created: 2026-08-11
- Related checklist: `docs/checklists/2026-08-11-plan-update-feature-semantics.md`
- Related implementation: selectable stack generation and manifest-aware updates

## Problem

Generated projects will record which optional stack features were enabled during initial setup. The
template updater must decide how to handle optional features introduced or changed by later template
versions.

## Options

### Preserve Disabled Features

Treat the generated project's manifest as authoritative. Template updates preserve the original
selection and update only enabled features.

Benefits:

- Updates remain predictable and non-invasive.
- Disabled apps are not unexpectedly added to an existing project.
- The manifest remains a stable record of the project's intended stack.

Costs:

- Users must explicitly opt in to newly available features through a separate migration or setup
  command.
- The template needs a documented process for adding an optional feature later.

### Offer Newly Available Features

During `template:update`, detect optional features that are available in the new template version and
offer the user an explicit choice to add them.

Benefits:

- Existing projects can adopt new official stack presets without manual scaffolding.
- The updater can serve as the migration path for optional template capabilities.

Costs:

- Updates become interactive or require an explicit non-interactive policy.
- Adding files, dependencies, scripts, and workspace tasks may create conflicts.
- The updater needs migration rules for feature dependencies and removals.

## Decision Criteria

Evaluate each option against:

- Safety of updates to customized projects
- Non-interactive CI and automation support
- Reversibility of adding a feature
- Dependency and lockfile changes
- Copier conflict behavior
- Manifest versioning and migration requirements
- User clarity when a feature is added or remains disabled

## Open Questions

- Should disabled features remain disabled permanently, or should updates offer opt-in additions?
- If additions are offered, should the prompt run before or after Copier computes the update?
- How should non-interactive updates behave when a new feature is available?
- Can features be removed safely, or are removals always manual migrations?
- Should a feature addition update only the manifest, or also record a migration version?

## Scope Boundary

This plan records the decision for later. It does not change the generator, Copier variables, project
manifest format, or `scripts/update-template.mjs` behavior.
