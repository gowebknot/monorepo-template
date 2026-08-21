# mobile

Bare React Native reference app in the workspace. Shares contracts, API client, and query hooks with
the other apps through the `@repo/*` packages. Its UI is a duplicated native layer using NativeWind
v5 and Tailwind v4.

```sh
pnpm --filter mobile start
```

Edit `src/config.ts` (or wire a native env loader) to point `RN_PUBLIC_API_BASE_URL` at your API.
Generate the `ios/`/`android/` native projects and use the native toolchain (Xcode / Android SDK) to
build and run on a device or simulator.
