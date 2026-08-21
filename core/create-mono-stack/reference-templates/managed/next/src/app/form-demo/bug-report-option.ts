import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

export const bugReportSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters.")
    .max(32, "Title must be at most 32 characters."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(100, "Description must be at most 100 characters."),
  category: z.enum(["bug", "feature", "docs"]),
  isPublic: z.boolean(),
  agreeToTerms: z.boolean().refine((v) => v, "You must agree to the terms."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export const bugReportFormOption = formOptions({
  validators: {
    onChange: bugReportSchema
  },
  defaultValues: {
    title: "",
    description: "",
    category: "" as string,
    isPublic: false,
    agreeToTerms: false,
    password: ""
  }
});
