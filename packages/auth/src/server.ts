import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import type { BetterAuthOptions } from "better-auth";

import { authTables } from "@monorepo-template/db/auth-schema";

export { toNodeHandler } from "better-auth/node";

export type AuthServerEnvironment = {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  AUTH_TRUSTED_ORIGINS: string;
};

export type AuthServerDependencies = {
  database: Parameters<typeof drizzleAdapter>[0];
  environment: AuthServerEnvironment;
};

export type AuthServerOptions = BetterAuthOptions;

export const createMonorepoAuth = ({
  database,
  environment
}: AuthServerDependencies): ReturnType<typeof betterAuth> => {
  const options: BetterAuthOptions = {
    appName: "Monorepo Template",
    baseURL: environment.BETTER_AUTH_URL,
    basePath: "/api/auth",
    secret: environment.BETTER_AUTH_SECRET,
    database: drizzleAdapter(database, {
      provider: "pg",
      schema: authTables,
      schemaName: "auth",
      transaction: true
    }),
    trustedOrigins: environment.AUTH_TRUSTED_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      disableSessionRefresh: false,
      cookieCache: {
        enabled: false
      }
    }
  };

  return betterAuth(options);
};

export const createAuthServer = (options: AuthServerOptions) =>
  betterAuth(options);
