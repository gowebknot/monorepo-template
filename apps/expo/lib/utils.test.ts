import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("removes empty native class values", () => {
    expect(cn("items-center", false, undefined, "px-4")).toBe(
      "items-center px-4"
    );
  });
});
