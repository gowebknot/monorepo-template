import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

import { createExampleDb, users, todos } from '@monorepo-template/db/example';

const require = createRequire(import.meta.url);

test('TEST-MIGRATE-005 reference startup migrates before seeding and is repeatable', () => {
  const { DatabaseModule } = require('#reference/database/database.module');
  const db = createExampleDb(':memory:');
  try {
    // A migration must not bypass Drizzle through the driver's exec API.
    db.$client.exec = () => {
      throw new Error('Direct driver execution is forbidden');
    };
    const module = new DatabaseModule(db);
    module.onModuleInit();
    module.onModuleInit();
    assert.equal(db.select().from(users).all().length, 1);
    assert.equal(db.select().from(users).get().email, 'demo@example.com');
    assert.deepEqual(db.select().from(todos).all(), []);
  } finally {
    db.$client.close();
  }
});
