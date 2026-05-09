import { describe, expect, it } from "vitest";
import { cn, formatCurrency } from "@/lib/utils";

describe("ui utility helpers", () => {
  it("merges class names without losing later Tailwind overrides", () => {
    expect(cn("rounded-sm bg-red-500", "bg-blue-500")).toContain("bg-blue-500");
  });

  it("formats rupee amounts consistently for finance surfaces", () => {
    expect(formatCurrency("1234.5")).toBe("₹1,234.50");
  });
});
