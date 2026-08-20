import { createWebEnv } from "./create-web-env.js";

export { createWebEnv } from "./create-web-env.js";
export {
  webClientEnvSchema,
  webEnvSchema,
  webServerEnvSchema
} from "./create-web-env.js";

export const webEnv = createWebEnv(import.meta.env);
