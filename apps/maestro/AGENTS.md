# AGENTS.md

## Purpose

`maestro-tests` owns mobile end-to-end regression flows for the `expo` reference app's Todos demo
(create + filter + delete), the native analogue of `playwright-tests` on the web side.

## One-time setup

Install the Maestro CLI (not an npm dependency):

    curl -Ls "https://get.maestro.mobile.dev" | bash

## Precondition (manual, per developer machine)

A booted iOS Simulator and/or Android Emulator with Expo Go already installed on each. Flows
deep-link into Expo Go via `exp://` links. There is no native build or prebuild step, but the
simulator/emulator and Expo Go must already exist and be running before `pnpm test` is invoked.

## Rules

- Invoke the `authentication-rbac` skill before adding or changing mobile authentication, protected
  navigation, role, permission, ownership, or forbidden-state flows. Use deterministic synthetic
  accounts and treat navigation checks as UX rather than security.

- Test user journeys through accessible, user-facing interactions: prefer visible text for buttons
  and headings; use `testID` selectors only for inputs with no visible label text.
- Keep each flow independent and rely on Maestro's built-in polling instead of arbitrary sleeps or
  fixed-duration wait commands.
- Generate unique test data per run instead of hardcoding values that could collide with a failed run.
- One user intent per flow file. Extend an existing flow before creating duplicate coverage.
- Keep this package separate from application runtime code; the only application-source dependency is
  the four `testID` props on `apps/expo/app/reference/todos.tsx`.

## Validation

Run from the repository root:

    pnpm --filter maestro-tests test          # both iOS and Android
    pnpm --filter maestro-tests test:ios      # iOS Simulator only
    pnpm --filter maestro-tests test:android  # Android Emulator only

The runner starts `apps/server` and `apps/expo` in reference mode, waits for ports 3001 and 8082,
runs all flows for each requested platform, and tears the dev servers down afterward. Device-backed
flows require the booted simulator/emulator described above and are not part of `just check`.
