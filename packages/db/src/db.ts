import { serverEnv } from "@repo/env/server";

export interface DatabaseConnectionOptions {
  url?: string;
}

export function getDatabaseUrl(options: DatabaseConnectionOptions = {}) {
  return options.url ?? serverEnv.DATABASE_URL;
}

export function createDb<TDatabase>(
  connect: (url: string) => TDatabase,
  options?: DatabaseConnectionOptions
) {
  return connect(getDatabaseUrl(options));
}
