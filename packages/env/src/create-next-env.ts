import { createEnv } from "@t3-oss/env-core";

import { globalEnv } from "@/global-env";

export const nextEnvSchema = globalEnv.pick({
  NODE_ENV: true,
  NEXT_PUBLIC_APP_URL: true,
  NEXT_PUBLIC_API_BASE_URL: true
});

export const nextServerEnvSchema = nextEnvSchema.pick({
  NODE_ENV: true
});

export const nextClientEnvSchema = nextEnvSchema.pick({
  NEXT_PUBLIC_APP_URL: true,
  NEXT_PUBLIC_API_BASE_URL: true
});

export const createNextEnv = (runtimeEnv: NodeJS.ProcessEnv = process.env) =>
  createEnv({
    server: nextServerEnvSchema.shape,
    clientPrefix: "NEXT_PUBLIC_",
    client: nextClientEnvSchema.shape,
    runtimeEnv,
    emptyStringAsUndefined: true
  });
