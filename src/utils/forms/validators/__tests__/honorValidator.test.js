import { describe, expect, it } from "vitest";
import { validateEhrung } from "../honorValidator";

describe("validateEhrung", () => {
  it("rejects a missing honor type", () => {
    const result = validateEhrung({
      honorTypeId: "",
      honorDate: "",
    });

    expect(result).toEqual([
      {
        field: "honorTypeId",
        message: "Ehrungsart ist Pflicht",
      },
    ]);
  });

  it("accepts an empty honor date", () => {
    const result = validateEhrung({
      honorTypeId: 1,
      honorDate: "",
    });

    expect(result).toEqual([]);
  });

  it("rejects an incomplete honor date", () => {
    const result = validateEhrung({
      honorTypeId: 1,
      honorDate: "15.05",
    });

    expect(result).toEqual([
      {
        field: "honorDate",
        message: "Datum muss vollständig und gültig im Format TT.MM.JJJJ sein",
      },
    ]);
  });

  it("rejects an invalid calendar date", () => {
    const result = validateEhrung({
      honorTypeId: 1,
      honorDate: "31.02.2026",
    });

    expect(result).toHaveLength(1);
    expect(result[0].field).toBe("honorDate");
  });

  it("accepts a valid leap day", () => {
    const result = validateEhrung({
      honorTypeId: 1,
      honorDate: "29.02.2024",
    });

    expect(result).toEqual([]);
  });

  it("accepts a future honor date", () => {
    const result = validateEhrung({
      honorTypeId: 1,
      honorDate: "15.05.2035",
    });

    expect(result).toEqual([]);
  });

  it("rejects a duplicate honor type", () => {
    const existingHonors = [
      { honorId: 10, honorTypeId: 1 },
      { honorId: 11, honorTypeId: 2 },
    ];

    const result = validateEhrung(
      { honorTypeId: "1", honorDate: "" },
      existingHonors,
    );

    expect(result).toEqual([
      {
        field: "honorTypeId",
        message: "Diese Ehrungsart ist für das Mitglied bereits erfasst",
      },
    ]);
  });

  it("accepts a different honor type", () => {
    const existingHonors = [{ honorId: 10, honorTypeId: 1 }];

    const result = validateEhrung(
      { honorTypeId: 2, honorDate: "" },
      existingHonors,
    );

    expect(result).toEqual([]);
  });

  it("does not treat the current honor as a duplicate", () => {
    const existingHonors = [{ honorId: 10, honorTypeId: 1 }];

    const result = validateEhrung(
      { honorTypeId: "1", honorDate: "15.05.2026" },
      existingHonors,
      10,
    );

    expect(result).toEqual([]);
  });

  it("rejects another honor with the same type during editing", () => {
    const existingHonors = [
      { honorId: 10, honorTypeId: 1 },
      { honorId: 11, honorTypeId: 2 },
    ];

    const result = validateEhrung(
      { honorTypeId: 2, honorDate: "" },
      existingHonors,
      10,
    );

    expect(result).toEqual([
      {
        field: "honorTypeId",
        message: "Diese Ehrungsart ist für das Mitglied bereits erfasst",
      },
    ]);
  });

  it("reports multiple validation errors", () => {
    const result = validateEhrung({
      honorTypeId: "",
      honorDate: "31.02.2026",
    });

    expect(result).toHaveLength(2);
    expect(result.map((error) => error.field)).toEqual([
      "honorTypeId",
      "honorDate",
    ]);
  });
});
