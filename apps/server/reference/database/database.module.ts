import { Global, Inject, Module } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import { createExampleDb, users } from '@repo/db/example';

import { EXAMPLE_DB } from './database.constants';

// Demo-only schema bootstrap: a real project applies migrations via
// `pnpm --filter @repo/db db:generate` / `db:migrate` instead.
const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS todo_items (
    id TEXT PRIMARY KEY,
    todo_id TEXT NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS auth_accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS auth_accounts_provider_account_id_idx
    ON auth_accounts(provider, provider_account_id);
  CREATE TABLE IF NOT EXISTS auth_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );
`;

const exampleDbProvider = {
  provide: EXAMPLE_DB,
  useFactory: () => createExampleDb(),
};

export type ExampleDb = ReturnType<typeof createExampleDb>;

@Global()
@Module({
  providers: [exampleDbProvider],
  exports: [EXAMPLE_DB],
})
export class DatabaseModule implements OnModuleInit {
  constructor(@Inject(EXAMPLE_DB) private readonly db: ExampleDb) {}

  onModuleInit() {
    this.db.$client.exec(SCHEMA_SQL);
    this.seed();
  }

  private seed() {
    const existing = this.db.select().from(users).all();
    if (existing.length === 0) {
      const now = new Date();
      this.db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          email: 'demo@example.com',
          name: 'Demo User',
          createdAt: now,
          updatedAt: now,
        })
        .run();
      console.log('[DatabaseModule] Seeded default user (demo@example.com)');
    }
  }
}
