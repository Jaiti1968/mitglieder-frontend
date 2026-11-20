import { describe, expect, it } from "vitest";
import { validateMemberCreation } from "./validateMemberCreation";

const validStammdaten = {
  personFirma: false,
  vorname: "Max",
  nachname: "Mustermann",
  geburtsdatum: "",
  plz: "",
};

const validKontakt = {
  email: "",
  adresszusatz: "",
};

const validMitgliedschaft = {
  eintritt: "",
  austritt: "",
  mitgliedsstatusId: "4",
  stimmeId: "6",
};

describe("validateMemberCreation", () => {
  it("erlaubt das Anlegen bei gültigen Angaben", () => {
    const result = validateMemberCreation(
      validStammdaten,
      validKontakt,
      validMitgliedschaft,
    );

    expect(result.canCreate).toBe(true);
    expect(result.stammdatenErrors).toEqual([]);
    expect(result.kontaktErrors).toEqual([]);
    expect(result.mitgliedschaftErrors).toEqual([]);
  });

  it("verhindert das Anlegen bei fehlendem Nachnamen", () => {
    const result = validateMemberCreation(
      { ...validStammdaten, nachname: "" },
      validKontakt,
      validMitgliedschaft,
    );

    expect(result.canCreate).toBe(false);
    expect(result.stammdatenErrors.length).toBeGreaterThan(0);
  });

  it("verhindert das Anlegen bei ungültiger E-Mail-Adresse", () => {
    const result = validateMemberCreation(
      validStammdaten,
      { ...validKontakt, email: "max@" },
      validMitgliedschaft,
    );

    expect(result.canCreate).toBe(false);
    expect(result.kontaktErrors.length).toBeGreaterThan(0);
  });

  it("verhindert das Anlegen bei ungültigem Eintrittsdatum", () => {
    const result = validateMemberCreation(validStammdaten, validKontakt, {
      ...validMitgliedschaft,
      eintritt: "31.02.2026",
    });

    expect(result.canCreate).toBe(false);
    expect(result.mitgliedschaftErrors.length).toBeGreaterThan(0);
  });

  it("verhindert das Anlegen bei Austritt vor Eintritt", () => {
    const result = validateMemberCreation(validStammdaten, validKontakt, {
      ...validMitgliedschaft,
      eintritt: "01.01.2026",
      austritt: "01.01.2025",
    });

    expect(result.canCreate).toBe(false);
    expect(result.mitgliedschaftErrors.length).toBeGreaterThan(0);
  });

  it("erlaubt das Anlegen einer Firma ohne Vornamen", () => {
    const result = validateMemberCreation(
      {
        ...validStammdaten,
        personFirma: true,
        vorname: "",
        nachname: "Muster GmbH",
      },
      validKontakt,
      validMitgliedschaft,
    );

    expect(result.canCreate).toBe(true);
  });
});
