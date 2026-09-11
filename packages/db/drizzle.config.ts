import { defineConfig } from "drizzle-kit";
import { serverEnv } from "@monorepo-template/env/server";

export default defineConfig({
  schema: "./example/schema/index.ts",
  out: "./example/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: serverEnv.DATABASE_URL
  }
});
