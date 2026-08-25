import assert from "node:assert/strict";
import test from "node:test";

import { createMonorepoAuth } from "@monorepo-template/auth/server";

test("constructs the PostgreSQL email/password auth server", () => {
  const auth = createMonorepoAuth({
    database: {},
    environment: {
      BETTER_AUTH_URL: "http://localhost:3000",
      BETTER_AUTH_SECRET:
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      AUTH_TRUSTED_ORIGINS: "http://localhost:5173,expo://template"
    }
  });

  assert.equal(typeof auth.handler, "function");
  assert.equal(typeof auth.api.getSession, "function");
});
