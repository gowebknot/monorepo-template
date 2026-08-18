# expo

Expo React Native reference app (Expo Router) in the workspace. Shares contracts, API client, and
query hooks with the other apps through the `@repo/*` packages. Its UI is a duplicated native layer
using NativeWind v5 and Tailwind v4.

```sh
pnpm --filter expo start
```

Copy `.env.example` to `.env.local` and point `EXPO_PUBLIC_API_BASE_URL` at your API before opening
the todos demo. Running on a device or simulator requires the Expo/native toolchain.
