import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
});

export type User = z.infer<typeof userSchema>;

export const createUserInputSchema = z.object({
  email: z.string(),
  name: z.string().optional().nullable()
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const updateUserInputSchema = z.object({
  email: z.string().optional(),
  name: z.string().optional().nullable()
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
