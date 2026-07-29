import { createWebEnv } from "@/create-web-env";

export { createWebEnv } from "@/create-web-env";
export {
  webClientEnvSchema,
  webEnvSchema,
  webServerEnvSchema
} from "@/create-web-env";

export const webEnv = createWebEnv();
