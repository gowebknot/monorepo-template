import assert from "node:assert/strict";
import test from "node:test";

import { serverEnvSchema } from "../dist/server-env.js";

const baseConfig = {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://app:app@localhost:5432/app",
  PORT: 3000,
  ALLOWED_ORIGINS: "http://localhost:5173",
  BETTER_AUTH_URL: "http://localhost:3000",
  BETTER_AUTH_SECRET: "0123456789abcdef0123456789abcdef",
  AUTH_TRUSTED_ORIGINS: "http://localhost:5173"
};

test("accepts valid Better Auth server configuration", () => {
  const parsed = serverEnvSchema.parse(baseConfig);

  assert.equal(parsed.BETTER_AUTH_URL, baseConfig.BETTER_AUTH_URL);
  assert.equal(parsed.BETTER_AUTH_SECRET, baseConfig.BETTER_AUTH_SECRET);
});

test("rejects a Better Auth secret shorter than 32 characters", () => {
  assert.throws(() =>
    serverEnvSchema.parse({
      ...baseConfig,
      BETTER_AUTH_SECRET: "too-short"
    })
  );
});
