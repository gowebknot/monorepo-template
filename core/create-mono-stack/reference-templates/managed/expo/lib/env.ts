import { createExpoEnv } from "@repo/env/expo";

// Expo inlines EXPO_PUBLIC_* variables into the bundle via process.env.
export const clientEnv = createExpoEnv({
  NODE_ENV: process.env.NODE_ENV,
  EXPO_PUBLIC_APP_URL: process.env.EXPO_PUBLIC_APP_URL,
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL
} as NodeJS.ProcessEnv);
