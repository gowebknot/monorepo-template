import { Global, Inject, Module } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import {
  createExampleDb,
  migrateExampleDb,
  users,
} from '@monorepo-template/db/example';

import { EXAMPLE_DB } from '#reference/database/database.constants';

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
    migrateExampleDb(this.db);
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
