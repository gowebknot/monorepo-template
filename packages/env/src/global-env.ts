import { z } from "zod";

export const globalEnv = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  WEB_PUBLIC_APP_URL: z.string().default("http://localhost:5173"),
  WEB_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:3001"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:3001"),
  EXPO_PUBLIC_APP_URL: z.string().default("http://localhost:8081"),
  EXPO_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:3001"),
  RN_PUBLIC_APP_URL: z.string().default("http://localhost:8081"),
  RN_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:3001"),
  DATABASE_URL: z.string().min(1).default("./local.db"),
  PORT: z.coerce.number().int().positive().default(3000),
  ALLOWED_ORIGINS: z.string().default("http://localhost:5173"),
  REFERENCE_PORT: z.coerce.number().int().positive().default(3001),
  REFERENCE_ALLOWED_ORIGINS: z.string().default("http://localhost:5173")
});
