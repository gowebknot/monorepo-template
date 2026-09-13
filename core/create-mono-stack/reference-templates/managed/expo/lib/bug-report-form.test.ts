import { describe, expect, it } from "vitest";
import { bugReportSchema } from "@/lib/bug-report-form";

describe("bugReportSchema", () => {
  it("requires terms agreement", () => {
    const result = bugReportSchema.safeParse({
      title: "Broken button",
      description: "The submit button does not respond to a click.",
      category: "bug",
      isPublic: true,
      agreeToTerms: false,
      password: "password"
    });

    expect(result.success).toBe(false);
  });
});
