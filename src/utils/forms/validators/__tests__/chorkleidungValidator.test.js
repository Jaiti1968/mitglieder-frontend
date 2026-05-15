import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { validateChorkleidung } from "../chorkleidungValidator";

describe("validateChorkleidung", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-15T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds error when handover date is in the future", () => {
    const result = validateChorkleidung({
      uebergabeAm: "16.05.2026",
    });

    expect(result).toEqual([
      {
        field: "uebergabeAm",
        message: "Übergabe am darf nicht in der Zukunft liegen",
      },
    ]);
  });

  it("adds error when return date is before handover date", () => {
    const result = validateChorkleidung({
      uebergabeAm: "15.05.2026",
      rueckgabeAm: "14.05.2026",
    });

    expect(result).toEqual([
      {
        field: "rueckgabeAm",
        message: "Rückgabe darf nicht vor Übergabe liegen",
      },
    ]);
  });

  it("adds error when summer clothing return is before received date", () => {
    const result = validateChorkleidung({
      sommerkleidungErhalten: "15.05.2026",
      sommerkleidungRueckgabe: "14.05.2026",
    });

    expect(result).toEqual([
      {
        field: "sommerkleidungRueckgabe",
        message: "Sommerkleidung-Rückgabe darf nicht vor Erhalt liegen",
      },
    ]);
  });

  it("adds error for negative purchase price", () => {
    const result = validateChorkleidung({
      kaufpreis: "-10",
    });

    expect(result).toEqual([
      {
        field: "kaufpreis",
        message: "Kaufpreis darf nicht negativ sein",
      },
    ]);
  });

  it("adds error for invalid purchase price text", () => {
    const result = validateChorkleidung({
      kaufpreis: "abc",
    });

    expect(result).toEqual([
      {
        field: "kaufpreis",
        message: "Kaufpreis muss eine Zahl sein",
      },
    ]);
  });

  it("adds multiple errors when several fields are invalid", () => {
    const result = validateChorkleidung({
      uebergabeAm: "16.05.2026",
      rueckgabeAm: "14.05.2026",
      kaufpreis: "-5",
    });

    expect(result).toEqual([
      {
        field: "uebergabeAm",
        message: "Übergabe am darf nicht in der Zukunft liegen",
      },
      {
        field: "rueckgabeAm",
        message: "Rückgabe darf nicht vor Übergabe liegen",
      },
      {
        field: "kaufpreis",
        message: "Kaufpreis darf nicht negativ sein",
      },
    ]);
  });

  it("accepts valid chorkleidung data", () => {
    const result = validateChorkleidung({
      uebergabeAm: "15.05.2026",
      rueckgabeAm: "",
      sommerkleidungErhalten: "14.05.2026",
      sommerkleidungRueckgabe: "",
      kaufpreis: "49,90",
    });

    expect(result).toEqual([]);
  });
});
