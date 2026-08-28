# AGENTS.md

## Purpose

`mobile` is a bare React Native reference app for the monorepo template. It mirrors the web apps'
todos demo (create + filter + delete) using the shared workspace packages, so the same contracts and
data layer power web and native clients.

## Conventions

- Invoke the `authentication-rbac` skill before changing generated authentication, protected
  navigation, roles, permissions, or authorization UX. React Navigation checks are presentation
  only; the API remains the authorization boundary.

- Navigation uses `@react-navigation/native` + native-stack (`src/app.tsx` sets up `Home`, `FormDemo`,
  `TableDemo`, `Reference`, `Todos`, and `TodoDetail` screens). The entry stays `index.js` →
  `AppRegistry.registerComponent`.
- UI uses React Native primitives (`View`, `Text`, `TextInput`, `Pressable`, `FlatList`) with
  NativeWind v5 and Tailwind v4 — no DOM or shadcn. Local implementation imports use the `@/*`
  alias mapped to `src/`; shared workspace packages use their `@monorepo-template/*` names.
- Server state comes from `@monorepo-template/query-client/example`; contracts/types from `@monorepo-template/entities/example`;
  HTTP from `@monorepo-template/api-client/example`. Do not redefine these locally.
- Environment: React Native has no build-time env inlining, so `src/config.ts` holds the runtime map
  and `src/lib/env.ts` validates it through `@monorepo-template/env/react-native` (`createReactNativeEnv`). Swap
  `src/config.ts` for a native env loader (e.g. react-native-config) in a real app.

- Native styling uses NativeWind v5 and Tailwind v4 through `src/global.css`, the CSS-aware Metro
  configuration, and the local `src/components/ui` primitives. Local implementation imports use the
  `@/*` alias mapped to `src/`; relative imports remain acceptable in barrel files.

## Native project files

This canonical app ships only the JavaScript project. Generate the `ios/` and `android/` native
projects with the React Native CLI, and building/running requires the local native toolchain (Xcode /
Android SDK / CocoaPods). Scaffolding with `--skip-install` only lays down the JavaScript project.

## Validation

```sh
pnpm --filter mobile typecheck
```
