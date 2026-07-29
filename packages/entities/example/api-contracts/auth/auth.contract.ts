import { z } from "zod";

export const authAccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  createdAt: z.iso.datetime()
});

export type AuthAccount = z.infer<typeof authAccountSchema>;

export const createAuthAccountInputSchema = z.object({
  userId: z.string(),
  provider: z.string(),
  providerAccountId: z.string()
});

export type CreateAuthAccountInput = z.infer<
  typeof createAuthAccountInputSchema
>;

export const authSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  token: z.string(),
  expiresAt: z.iso.datetime(),
  createdAt: z.iso.datetime()
});

export type AuthSession = z.infer<typeof authSessionSchema>;

export const createAuthSessionInputSchema = z.object({
  userId: z.string(),
  token: z.string(),
  expiresAt: z.iso.datetime()
});

export type CreateAuthSessionInput = z.infer<
  typeof createAuthSessionInputSchema
>;
