# Stable Generated Server Start

- Checklist ID: CHECKLIST-20260812-stable-generated-server-start
- Created: 2026-08-12
- Type: Bug fix and generated-project reliability
- Related checklists:
  - [TypeScript 7 and Native Scaffolding Release](./2026-08-12-typescript7-native-scaffolding-release.md)
  - [Native Vite and Nest Scaffolding](./2026-08-12-native-vite-nest-scaffolding.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Acceptance Criteria

- [x] A newly generated Vite and NestJS project installs dependencies and starts `dev:reference` without manual package or TypeScript configuration edits.
- [x] Native Nest scaffolding preserves the repository's known TypeScript 6-compatible server toolchain.
- [x] The launcher resolves the current published template revision rather than an obsolete stable tag.

## Validation

- [x] Add focused regression assertions for native Nest package/config output.
- [x] Run launcher tests and Copier integration.
- [x] Generate a clean project, run `pnpm install`, and run `pnpm dev:reference`.
- [x] Run `just check` and record all failures and reruns.

## Validation Notes

- 2026-08-12: A clean project from published `0.1.7` required manual `@typescript/typescript6`, Nest TypeScript 6, and tsconfig fixes before starting; this reproduces the reported defect.
- 2026-08-12: Applying TypeScript 6 directly to the source server package caused the repository lint suite to fail on Jest typings; the source app was restored and compatibility is being isolated to native generated output.
- 2026-08-12: Clean local-template generation, install, and `pnpm dev:reference` reached both Vite and Nest reference-ready states after pinning generated Nest TypeScript to `6.0.2` and adding the reference tsconfig overlay.
- 2026-08-12: Final `just check` reached format validation and found only `pnpm-lock.yaml` formatting drift from dependency installation.
- 2026-08-12: Formatted `pnpm-lock.yaml`; final `just check`, 85 launcher tests, Copier integration, and `git diff --check` passed.
- 2026-08-12: Version `0.1.8` prepared for the generated-server reliability release.

## Updates

- 2026-08-12: The clean-start validation covered a partial NestJS reference overlay but did not prove
  that the final generated Vite app retained its template source/configuration or that either app
  retained all workspace dependencies. The replacement manifests therefore still made
  `pnpm install && pnpm dev:reference` unreliable. The corrective implementation and complete
  generated-output checks are tracked in
  [Hybrid Native Reference Profiles](./2026-08-12-hybrid-native-reference-profiles.md). Validation is
  pending in that checklist.
