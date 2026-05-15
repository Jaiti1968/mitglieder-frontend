import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { isCompleteDate, isDateBefore, isDateInFuture } from "../dateHelpers";

describe("dateHelpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-15T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("isCompleteDate", () => {
    it("returns true for complete valid date", () => {
      expect(isCompleteDate("15.05.2026")).toBe(true);
    });

    it("returns false for incomplete date", () => {
      expect(isCompleteDate("15.05")).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(isCompleteDate("")).toBe(false);
    });

    it("returns false for invalid format", () => {
      expect(isCompleteDate("2026-05-15")).toBe(false);
    });
  });

  describe("isDateBefore", () => {
    it("returns true when first date is before second", () => {
      expect(isDateBefore("14.05.2026", "15.05.2026")).toBe(true);
    });

    it("returns false when dates are equal", () => {
      expect(isDateBefore("15.05.2026", "15.05.2026")).toBe(false);
    });

    it("returns false when first date is after second", () => {
      expect(isDateBefore("16.05.2026", "15.05.2026")).toBe(false);
    });

    it("returns false when one date is empty", () => {
      expect(isDateBefore("15.05.2026", "")).toBe(false);
    });
  });

  describe("isDateInFuture", () => {
    it("returns true for future date", () => {
      expect(isDateInFuture("16.05.2026")).toBe(true);
    });

    it("returns false for today", () => {
      expect(isDateInFuture("15.05.2026")).toBe(false);
    });

    it("returns false for past date", () => {
      expect(isDateInFuture("14.05.2026")).toBe(false);
    });

    it("returns false for empty date", () => {
      expect(isDateInFuture("")).toBe(false);
    });
  });
});
