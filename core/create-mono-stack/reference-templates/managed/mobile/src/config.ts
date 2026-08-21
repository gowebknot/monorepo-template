// React Native has no build-time env inlining. Replace these defaults with your
// own mechanism (for example react-native-config) as the app grows; the values
// are validated by `@repo/env/react-native` in `src/lib/env.ts`.
export const runtimeConfig: Record<string, string> = {
  NODE_ENV: "development",
  RN_PUBLIC_APP_URL: "http://localhost:8081",
  RN_PUBLIC_API_BASE_URL: "http://localhost:3001"
};
