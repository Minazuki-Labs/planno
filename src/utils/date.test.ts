import { describe, it, expect } from "vitest";
import { formatToYMD } from "./date";

describe("formatToYMD", () => {
  it("returns empty string if input is empty", () => {
    expect(formatToYMD("")).toBe("");
  });

  it("formats ISO date string into YYYY/MM/DD", () => {
    expect(formatToYMD("2026-11-19")).toBe("2026/11/19");
  });

  it("pads single digit month and day with zero", () => {
    const date = new Date(2025, 3, 5); // April 5, 2025
    expect(formatToYMD(date.toISOString())).toBe("2025/04/05");
  });
});
