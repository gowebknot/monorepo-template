import { defineConfig } from "drizzle-kit";
import { serverEnv } from "@repo/env/server";

export default defineConfig({
  schema: "./example/schema/index.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: serverEnv.DATABASE_URL
  }
});
