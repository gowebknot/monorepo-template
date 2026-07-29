import { createEnv } from "@t3-oss/env-core";

import { globalEnv } from "@/global-env";

export const webEnvSchema = globalEnv.pick({
  NODE_ENV: true,
  WEB_PUBLIC_APP_URL: true,
  WEB_PUBLIC_API_BASE_URL: true
});

export const webServerEnvSchema = webEnvSchema.pick({
  NODE_ENV: true
});

export const webClientEnvSchema = webEnvSchema.pick({
  WEB_PUBLIC_APP_URL: true,
  WEB_PUBLIC_API_BASE_URL: true
});

export const createWebEnv = (runtimeEnv: NodeJS.ProcessEnv = process.env) =>
  createEnv({
    server: webServerEnvSchema.shape,
    clientPrefix: "WEB_PUBLIC_",
    client: webClientEnvSchema.shape,
    runtimeEnv,
    emptyStringAsUndefined: true
  });
