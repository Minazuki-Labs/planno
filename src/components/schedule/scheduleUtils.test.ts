import { describe, it, expect } from "vitest";
import {
  calculateBlockGeometry,
  generateEventDays,
  HOUR_HEIGHT_PX,
} from "./scheduleUtils";

describe("scheduleUtils", () => {
  describe("calculateBlockGeometry", () => {
    it("calculates top and height for standard 1 hour duration", () => {
      const { top, height } = calculateBlockGeometry("09:00", "10:00");
      expect(top).toBe(9 * HOUR_HEIGHT_PX);
      expect(height).toBe(1 * HOUR_HEIGHT_PX);
    });

    it("calculates top and height for half-hour times", () => {
      const { top, height } = calculateBlockGeometry("09:30", "11:00");
      expect(top).toBe(9.5 * HOUR_HEIGHT_PX);
      expect(height).toBe(1.5 * HOUR_HEIGHT_PX);
    });

    it("enforces minimum height of 24px for very short activities", () => {
      const { height } = calculateBlockGeometry("10:00", "10:05");
      expect(height).toBe(24);
    });
  });

  describe("generateEventDays", () => {
    it("generates days for single-day event", () => {
      const days = generateEventDays("2026/05/10");
      expect(days.length).toBe(1);
      expect(days[0].fullDate).toBe("2026-05-10");
      expect(days[0].dateNum).toBe(10);
    });

    it("generates days for a date range (inclusive, up to 7 days)", () => {
      const days = generateEventDays("2026/05/10 - 2026/05/12");
      expect(days.length).toBe(3);
      expect(days[0].fullDate).toBe("2026-05-10");
      expect(days[1].fullDate).toBe("2026-05-11");
      expect(days[2].fullDate).toBe("2026-05-12");
    });

    it("caps date range at 7 days maximum", () => {
      const days = generateEventDays("2026/05/01 - 2026/05/20");
      expect(days.length).toBe(7);
      expect(days[0].fullDate).toBe("2026-05-01");
      expect(days[6].fullDate).toBe("2026-05-07");
    });

    it("defaults to 4 days if date is unspecified or 'To Be Confirmed'", () => {
      const days = generateEventDays("To Be Confirmed");
      expect(days.length).toBe(4);
    });
  });
});
