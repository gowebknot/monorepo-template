import { describe, expect, it } from "vitest";
import { cn } from "@reference/lib/utils";

describe("cn", () => {
  it("combines non-empty classes", () => {
    expect(cn("text-sm", undefined, "font-medium")).toBe(
      "text-sm font-medium"
    );
  });

  it("keeps the last Tailwind class when utilities conflict", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
