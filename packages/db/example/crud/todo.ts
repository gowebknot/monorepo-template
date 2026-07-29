import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import { todos } from "#example/schema/todo";

type Db = BetterSQLite3Database;

export interface CreateTodoInput {
  userId: string;
  title: string;
}

export interface UpdateTodoInput {
  title?: string;
}

export async function createTodo(db: Db, input: CreateTodoInput) {
  const now = new Date();
  const [todo] = await db
    .insert(todos)
    .values({
      id: crypto.randomUUID(),
      userId: input.userId,
      title: input.title,
      createdAt: now,
      updatedAt: now
    })
    .returning();
  return todo;
}

export async function getTodoById(db: Db, id: string) {
  const [todo] = await db.select().from(todos).where(eq(todos.id, id));
  return todo;
}

export async function listTodosByUser(db: Db, userId: string) {
  return db.select().from(todos).where(eq(todos.userId, userId));
}

export async function updateTodo(db: Db, id: string, input: UpdateTodoInput) {
  const [todo] = await db
    .update(todos)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(todos.id, id))
    .returning();
  return todo;
}

export async function deleteTodo(db: Db, id: string) {
  const [todo] = await db.delete(todos).where(eq(todos.id, id)).returning();
  return todo;
}
