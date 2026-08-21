import { createNextEnv } from "@repo/env/next";

// Next.js only inlines `process.env.NEXT_PUBLIC_*` for literal member access,
// so the runtime map is spelled out here rather than passing `process.env`.
export const clientEnv = createNextEnv({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL
} as NodeJS.ProcessEnv);
