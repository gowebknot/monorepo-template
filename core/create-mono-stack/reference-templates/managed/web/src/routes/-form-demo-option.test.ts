import { describe, expect, it } from "vitest";
import { bugReportSchema } from "@reference/routes/-form-demo-option";

const validReport = {
  title: "Broken button",
  description: "The submit button does not respond to a click.",
  category: "bug" as const,
  isPublic: true,
  agreeToTerms: true,
  password: "password"
};

describe("bugReportSchema", () => {
  it("accepts a valid report", () => {
    expect(bugReportSchema.safeParse(validReport).success).toBe(true);
  });

  it.each([
    ["a short title", { title: "Bug" }],
    ["a short description", { description: "Too short" }],
    ["an unsupported category", { category: "other" }],
    ["unchecked terms", { agreeToTerms: false }],
    ["a short password", { password: "short" }]
  ])("rejects %s", (_label, change) => {
    expect(
      bugReportSchema.safeParse({ ...validReport, ...change }).success
    ).toBe(false);
  });
});
