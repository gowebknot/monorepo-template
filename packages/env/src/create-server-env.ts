import { createEnv } from "@t3-oss/env-core";

import { globalEnv } from "@/global-env";

export const serverEnvSchema = globalEnv.pick({
  NODE_ENV: true,
  DATABASE_URL: true,
  PORT: true,
  ALLOWED_ORIGINS: true
});

export const validateServerEnv = (
  config: Record<string, unknown>
): Record<string, unknown> => serverEnvSchema.parse(config);

export const createServerEnv = (runtimeEnv: NodeJS.ProcessEnv = process.env) =>
  createEnv({
    clientPrefix: "",
    client: {},
    server: serverEnvSchema.shape,
    runtimeEnv,
    emptyStringAsUndefined: true
  });
