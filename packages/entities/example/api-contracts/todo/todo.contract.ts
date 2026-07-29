import { z } from "zod";

export const todoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
});

export type Todo = z.infer<typeof todoSchema>;

export const createTodoInputSchema = z.object({
  userId: z.string(),
  title: z.string()
});

export type CreateTodoInput = z.infer<typeof createTodoInputSchema>;

export const updateTodoInputSchema = z.object({
  title: z.string().optional()
});

export type UpdateTodoInput = z.infer<typeof updateTodoInputSchema>;
