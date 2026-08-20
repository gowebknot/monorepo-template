import { createEnv } from "@t3-oss/env-core";

import { globalEnv } from "@/global-env";

export const referenceServerEnvSchema = globalEnv.pick({
  NODE_ENV: true,
  DATABASE_URL: true,
  REFERENCE_PORT: true,
  REFERENCE_ALLOWED_ORIGINS: true
});

export const validateReferenceServerEnv = (
  config: Record<string, unknown>
): Record<string, unknown> => referenceServerEnvSchema.parse(config);

export const createReferenceServerEnv = (
  runtimeEnv: NodeJS.ProcessEnv = process.env
) =>
  createEnv({
    clientPrefix: "",
    client: {},
    server: referenceServerEnvSchema.shape,
    runtimeEnv,
    emptyStringAsUndefined: true
  });

export const referenceServerEnv = createReferenceServerEnv();
