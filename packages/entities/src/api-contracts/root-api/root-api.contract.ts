import { z } from "zod";

export const rootApiResponseSchema = z.object({
  status: z.string()
});

export type RootApiResponse = z.infer<typeof rootApiResponseSchema>;
