import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { createDb } from "./db.js";

export function createPostgresDb(url?: string) {
  return createDb(
    (databaseUrl) => drizzle(new Pool({ connectionString: databaseUrl })),
    {
      url
    }
  );
}
