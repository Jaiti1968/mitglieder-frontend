import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { validateDatenschutz } from "../datenschutzValidator";

describe("validateDatenschutz", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-15T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds error for incomplete date", () => {
    const result = validateDatenschutz({
      datumDatenschutz: "15.05",
    });

    expect(result).toEqual([
      {
        field: "datumDatenschutz",
        message: "Datum muss vollständig im Format TT.MM.JJJJ sein",
      },
    ]);
  });

  it("adds error for future date", () => {
    const result = validateDatenschutz({
      datumDatenschutz: "16.05.2026",
    });

    expect(result).toEqual([
      {
        field: "datumDatenschutz",
        message: "Datum Datenschutz darf nicht in der Zukunft liegen",
      },
    ]);
  });

  it("accepts valid date", () => {
    const result = validateDatenschutz({
      datumDatenschutz: "15.05.2026",
    });

    expect(result).toEqual([]);
  });

  it("accepts empty optional date", () => {
    const result = validateDatenschutz({
      datumDatenschutz: "",
    });

    expect(result).toEqual([]);
  });
});
