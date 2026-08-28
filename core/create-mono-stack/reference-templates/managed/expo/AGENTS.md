# AGENTS.md

## Purpose

`expo` is an Expo React Native reference app (Expo Router) for the monorepo template. It mirrors the
web apps' todos demo (create + filter + delete) using the shared workspace packages, so the same
contracts and data layer power web and native clients.

## Conventions

- Invoke the `authentication-rbac` skill before changing generated authentication, protected Expo
  Router layouts, roles, permissions, or authorization UX. Navigation gating must never replace
  API-side authorization.

- File-based routing with Expo Router under `app/` (`_layout.tsx` stack, `index.tsx`, `todos.tsx`).
  The entry is `index.ts` → `import "expo-router/entry"`; `package.json` `main` stays `index.ts`.
- UI uses React Native primitives (`View`, `Text`, `TextInput`, `Pressable`, `FlatList`) with
  NativeWind v5 and Tailwind v4 — no DOM or gluestack. The `@/*` alias maps to the app root.
- Server state comes from `@monorepo-template/query-client/example`; contracts/types from `@monorepo-template/entities/example`;
  HTTP from `@monorepo-template/api-client/example`. Do not redefine these locally.
- Environment access goes through `@monorepo-template/env/expo` (`createExpoEnv`). Only `EXPO_PUBLIC_*` variables
  reach the bundle, and `lib/env.ts` spells out the runtime map so Expo can inline them.

Native styling uses the CSS-first NativeWind v5 setup in `globals.css`, `metro.config.js`, and
`postcss.config.js`. The local `components/ui` directory is intentionally app-owned and replaces the
unavailable gluestack v5 combination.

## Validation

```sh
pnpm --filter expo typecheck
pnpm --filter expo start   # requires the Expo/native toolchain to run a device
```

Building or running on a device needs the local native toolchain (Xcode / Android SDK); scaffolding
with `--skip-install` only lays down the JavaScript project.
