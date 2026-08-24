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
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://app:app@localhost:5432/app"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  POSTGRES_DB: z.string().min(1).default("app"),
  POSTGRES_USER: z.string().min(1).default("app"),
  POSTGRES_PASSWORD: z.string().min(1).default("app"),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  PGADMIN_DEFAULT_EMAIL: z.string().email().default("admin@example.test"),
  PGADMIN_DEFAULT_PASSWORD: z.string().min(1).default("admin"),
  PGADMIN_PORT: z.coerce.number().int().positive().default(5050),
  OPEN_DESIGN_PORT: z.coerce.number().int().positive().default(7456),
  OD_API_TOKEN: z.string().min(1).default("change-me"),
  OPENPANEL_DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://openpanel:openpanel@localhost:5433/openpanel"),
  OPENPANEL_REDIS_URL: z.string().min(1).default("redis://localhost:6380"),
  OPENPANEL_CLICKHOUSE_URL: z
    .string()
    .url()
    .default("http://localhost:8123/openpanel"),
  OPENPANEL_ENCRYPTION_KEY: z.string().min(1).default("change-me"),
  OPENPANEL_API_PORT: z.coerce.number().int().positive().default(3333),
  OPENPANEL_DASHBOARD_PORT: z.coerce.number().int().positive().default(3002),
  PORT: z.coerce.number().int().positive().default(3000),
  ALLOWED_ORIGINS: z.string().default("http://localhost:5173"),
  REFERENCE_PORT: z.coerce.number().int().positive().default(3001),
  REFERENCE_ALLOWED_ORIGINS: z.string().default("http://localhost:5173")
});
