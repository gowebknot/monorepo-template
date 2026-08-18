import { createEnv } from "@t3-oss/env-core";

import { globalEnv } from "@/global-env";

export const reactNativeEnvSchema = globalEnv.pick({
  NODE_ENV: true,
  RN_PUBLIC_APP_URL: true,
  RN_PUBLIC_API_BASE_URL: true
});

// React Native has no build-time client-prefix inlining like Vite/Next/Expo,
// so the app supplies the runtime map (e.g. from react-native-config or a
// committed config module) and this validates it.
export const createReactNativeEnv = (
  runtimeEnv: Record<string, string | undefined>
) =>
  createEnv({
    clientPrefix: "",
    client: {},
    server: reactNativeEnvSchema.shape,
    runtimeEnv,
    // React Native is a single trusted runtime with no browser client/server
    // split, so treat every variable as server-accessible.
    isServer: true,
    emptyStringAsUndefined: true
  });
