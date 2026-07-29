import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import { users } from "#example/schema/user";

type Db = BetterSQLite3Database;

export interface CreateUserInput {
  email: string;
  name?: string | null;
}

export interface UpdateUserInput {
  email?: string;
  name?: string | null;
}

export async function createUser(db: Db, input: CreateUserInput) {
  const now = new Date();
  const [user] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      email: input.email,
      name: input.name ?? null,
      createdAt: now,
      updatedAt: now
    })
    .returning();
  return user;
}

export async function getUserById(db: Db, id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function listUsers(db: Db) {
  return db.select().from(users);
}

export async function updateUser(db: Db, id: string, input: UpdateUserInput) {
  const [user] = await db
    .update(users)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user;
}

export async function deleteUser(db: Db, id: string) {
  const [user] = await db.delete(users).where(eq(users.id, id)).returning();
  return user;
}
