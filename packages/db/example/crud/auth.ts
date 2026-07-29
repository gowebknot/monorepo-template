import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import { authAccounts, authSessions } from "#example/schema/auth";

type Db = BetterSQLite3Database;

export interface CreateAuthAccountInput {
  userId: string;
  provider: string;
  providerAccountId: string;
}

export async function createAuthAccount(db: Db, input: CreateAuthAccountInput) {
  const [authAccount] = await db
    .insert(authAccounts)
    .values({
      id: crypto.randomUUID(),
      userId: input.userId,
      provider: input.provider,
      providerAccountId: input.providerAccountId,
      createdAt: new Date()
    })
    .returning();
  return authAccount;
}

export async function getAuthAccountById(db: Db, id: string) {
  const [authAccount] = await db
    .select()
    .from(authAccounts)
    .where(eq(authAccounts.id, id));
  return authAccount;
}

export async function listAuthAccountsByUser(db: Db, userId: string) {
  return db.select().from(authAccounts).where(eq(authAccounts.userId, userId));
}

export async function deleteAuthAccount(db: Db, id: string) {
  const [authAccount] = await db
    .delete(authAccounts)
    .where(eq(authAccounts.id, id))
    .returning();
  return authAccount;
}

export interface CreateAuthSessionInput {
  userId: string;
  token: string;
  expiresAt: Date;
}

export async function createAuthSession(db: Db, input: CreateAuthSessionInput) {
  const [authSession] = await db
    .insert(authSessions)
    .values({
      id: crypto.randomUUID(),
      userId: input.userId,
      token: input.token,
      expiresAt: input.expiresAt,
      createdAt: new Date()
    })
    .returning();
  return authSession;
}

export async function getAuthSessionByToken(db: Db, token: string) {
  const [authSession] = await db
    .select()
    .from(authSessions)
    .where(eq(authSessions.token, token));
  return authSession;
}

export async function listAuthSessionsByUser(db: Db, userId: string) {
  return db.select().from(authSessions).where(eq(authSessions.userId, userId));
}

export async function deleteAuthSession(db: Db, id: string) {
  const [authSession] = await db
    .delete(authSessions)
    .where(eq(authSessions.id, id))
    .returning();
  return authSession;
}
