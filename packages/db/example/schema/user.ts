import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { authAccounts, authSessions } from "#example/schema/auth";
import { todos } from "#example/schema/todo";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull()
});

export const usersRelations = relations(users, ({ many }) => ({
  authAccounts: many(authAccounts),
  authSessions: many(authSessions),
  todos: many(todos)
}));
