import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { createDb } from "#src/index";

export function createExampleDb(url?: string) {
  return createDb((databaseUrl) => drizzle(new Database(databaseUrl)), { url });
}
