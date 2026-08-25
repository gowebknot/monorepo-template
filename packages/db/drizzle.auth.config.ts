import { defineConfig } from "drizzle-kit";

import { serverEnv } from "@monorepo-template/env/server";

export default defineConfig({
  schema: "./src/auth-schema.ts",
  out: "./drizzle/auth",
  dialect: "postgresql",
  dbCredentials: {
    url: serverEnv.DATABASE_URL
  }
});
