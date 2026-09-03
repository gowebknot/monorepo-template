import { z } from "zod";

export const healthResponseSchema = z.object({
  status: z.literal("ok").meta({
    description: "The server is ready to accept requests.",
    example: "ok"
  })
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
