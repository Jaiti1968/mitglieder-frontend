import { describe, expect, it } from "vitest";
import { validateKontakt } from "../contactValidator";

describe("validateKontakt", () => {
  it("adds error for invalid email", () => {
    const result = validateKontakt({
      email: "max.example.de",
      adresszusatz: "",
    });

    expect(result).toEqual([
      {
        field: "email",
        message: "Bitte eine gültige E-Mail-Adresse eingeben",
      },
    ]);
  });

  it("accepts valid email", () => {
    const result = validateKontakt({
      email: "max@example.de",
      adresszusatz: "",
    });

    expect(result).toEqual([]);
  });

  it("adds error when email is too long", () => {
    const longEmail = `${"a".repeat(96)}@x.de`;

    const result = validateKontakt({
      email: longEmail,
      adresszusatz: "",
    });

    expect(result).toEqual([
      {
        field: "email",
        message: "E-Mail darf maximal 100 Zeichen haben",
      },
    ]);
  });

  it("adds error when address addition is too long", () => {
    const result = validateKontakt({
      email: "max@example.de",
      adresszusatz: "a".repeat(51),
    });

    expect(result).toEqual([
      {
        field: "adresszusatz",
        message: "Adresszusatz darf maximal 50 Zeichen haben",
      },
    ]);
  });

  it("adds multiple errors when several fields are invalid", () => {
    const longEmail = `${"a".repeat(95)}invalid`;

    const result = validateKontakt({
      email: longEmail,
      adresszusatz: "a".repeat(51),
    });

    expect(result).toEqual([
      {
        field: "email",
        message: "E-Mail darf maximal 100 Zeichen haben",
      },
      {
        field: "email",
        message: "Bitte eine gültige E-Mail-Adresse eingeben",
      },
      {
        field: "adresszusatz",
        message: "Adresszusatz darf maximal 50 Zeichen haben",
      },
    ]);
  });

  it("accepts valid contact data", () => {
    const result = validateKontakt({
      email: "max@example.de",
      adresszusatz: "c/o Beispiel",
    });

    expect(result).toEqual([]);
  });
});
