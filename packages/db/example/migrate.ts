import { fileURLToPath } from "node:url";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const migrationsFolder = fileURLToPath(
  new URL("../example/migrations/", import.meta.url)
);

export function migrateExampleDb(db: BetterSQLite3Database) {
  try {
    migrate(db, { migrationsFolder });
  } catch (cause) {
    throw new Error(
      "Example database migration failed. Existing demo tables without migration history require an explicit baseline or a fresh database path; do not reset existing data automatically.",
      { cause }
    );
  }
}
