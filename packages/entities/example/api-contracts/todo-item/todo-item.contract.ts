import { z } from "zod";

export const todoItemSchema = z.object({
  id: z.string(),
  todoId: z.string(),
  title: z.string(),
  completed: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
});

export type TodoItem = z.infer<typeof todoItemSchema>;

export const createTodoItemInputSchema = z.object({
  todoId: z.string(),
  title: z.string(),
  completed: z.boolean().optional()
});

export type CreateTodoItemInput = z.infer<typeof createTodoItemInputSchema>;

export const updateTodoItemInputSchema = z.object({
  title: z.string().optional(),
  completed: z.boolean().optional()
});

export type UpdateTodoItemInput = z.infer<typeof updateTodoItemInputSchema>;
