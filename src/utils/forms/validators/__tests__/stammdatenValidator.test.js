import { describe, expect, it } from "vitest";
import { validateStammdaten } from "../stammdatenValidator";

describe("validateStammdaten", () => {
  it("adds error when person has no first name", () => {
    const result = validateStammdaten({
      personFirma: false,
      vorname: "",
      nachname: "Mustermann",
      plz: "99084",
    });

    expect(result).toEqual([
      {
        field: "vorname",
        message: "Vorname darf bei Personen nicht leer sein",
      },
    ]);
  });

  it("does not require first name for company", () => {
    const result = validateStammdaten({
      personFirma: true,
      vorname: "",
      nachname: "Muster GmbH",
      plz: "99084",
    });

    expect(result).toEqual([]);
  });

  it("adds error when last name or company name is missing", () => {
    const result = validateStammdaten({
      personFirma: false,
      vorname: "Max",
      nachname: "",
      plz: "99084",
    });

    expect(result).toEqual([
      {
        field: "nachname",
        message: "Nachname ist Pflicht",
      },
    ]);
  });

  it("adds error for invalid postal code", () => {
    const result = validateStammdaten({
      personFirma: false,
      vorname: "Max",
      nachname: "Mustermann",
      plz: "1234",
    });

    expect(result).toEqual([
      {
        field: "plz",
        message: "PLZ muss aus genau 5 Ziffern bestehen",
      },
    ]);
  });

  it("accepts valid postal code", () => {
    const result = validateStammdaten({
      personFirma: false,
      vorname: "Max",
      nachname: "Mustermann",
      plz: "99084",
    });

    expect(result).toEqual([]);
  });

  it("accepts empty postal code", () => {
    const result = validateStammdaten({
      personFirma: false,
      vorname: "Max",
      nachname: "Mustermann",
      plz: "",
    });

    expect(result).toEqual([]);
  });

  it("adds multiple errors when multiple fields are invalid", () => {
    const result = validateStammdaten({
      personFirma: false,
      vorname: "",
      nachname: "",
      plz: "12",
    });

    expect(result).toEqual([
      {
        field: "vorname",
        message: "Vorname darf bei Personen nicht leer sein",
      },
      {
        field: "nachname",
        message: "Nachname ist Pflicht",
      },
      {
        field: "plz",
        message: "PLZ muss aus genau 5 Ziffern bestehen",
      },
    ]);
  });
});
