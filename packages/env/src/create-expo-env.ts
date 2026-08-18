import { createEnv } from "@t3-oss/env-core";

import { globalEnv } from "@/global-env";

export const expoEnvSchema = globalEnv.pick({
  NODE_ENV: true,
  EXPO_PUBLIC_APP_URL: true,
  EXPO_PUBLIC_API_BASE_URL: true
});

export const expoServerEnvSchema = expoEnvSchema.pick({
  NODE_ENV: true
});

export const expoClientEnvSchema = expoEnvSchema.pick({
  EXPO_PUBLIC_APP_URL: true,
  EXPO_PUBLIC_API_BASE_URL: true
});

export const createExpoEnv = (runtimeEnv: NodeJS.ProcessEnv = process.env) =>
  createEnv({
    server: expoServerEnvSchema.shape,
    clientPrefix: "EXPO_PUBLIC_",
    client: expoClientEnvSchema.shape,
    runtimeEnv,
    emptyStringAsUndefined: true
  });
