import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  validateRequired,
  validateMaxLength,
  validateEmail,
  validatePostalCode,
  validateCompleteDate,
  validateDateRange,
  validateNotFutureDate,
} from "../validationHelpers";

describe("validationHelpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-15T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("validateRequired", () => {
    it("adds an error when value is empty", () => {
      const errors = [];

      validateRequired(errors, "vorname", "", "Vorname ist erforderlich.");

      expect(errors).toEqual([
        { field: "vorname", message: "Vorname ist erforderlich." },
      ]);
    });

    it("adds an error when value contains only spaces", () => {
      const errors = [];

      validateRequired(errors, "vorname", "   ", "Vorname ist erforderlich.");

      expect(errors).toEqual([
        { field: "vorname", message: "Vorname ist erforderlich." },
      ]);
    });

    it("does not add an error when value is present", () => {
      const errors = [];

      validateRequired(errors, "vorname", "Max", "Vorname ist erforderlich.");

      expect(errors).toEqual([]);
    });
  });

  describe("validateMaxLength", () => {
    it("adds an error when value is longer than maxLength", () => {
      const errors = [];

      validateMaxLength(errors, "adresszusatz", "123456", 5, "Zu lang.");

      expect(errors).toEqual([{ field: "adresszusatz", message: "Zu lang." }]);
    });

    it("does not add an error when value length equals maxLength", () => {
      const errors = [];

      validateMaxLength(errors, "adresszusatz", "12345", 5, "Zu lang.");

      expect(errors).toEqual([]);
    });

    it("does not add an error when value is empty", () => {
      const errors = [];

      validateMaxLength(errors, "adresszusatz", "", 5, "Zu lang.");

      expect(errors).toEqual([]);
    });
  });

  describe("validateEmail", () => {
    it("adds an error for invalid email", () => {
      const errors = [];

      validateEmail(errors, "email", "max.example.de", "Ungültige E-Mail.");

      expect(errors).toEqual([
        { field: "email", message: "Ungültige E-Mail." },
      ]);
    });

    it("does not add an error for valid email", () => {
      const errors = [];

      validateEmail(errors, "email", "max@example.de", "Ungültige E-Mail.");

      expect(errors).toEqual([]);
    });

    it("does not add an error when email is empty", () => {
      const errors = [];

      validateEmail(errors, "email", "", "Ungültige E-Mail.");

      expect(errors).toEqual([]);
    });
  });

  describe("validatePostalCode", () => {
    it("adds an error for postal code with less than 5 digits", () => {
      const errors = [];

      validatePostalCode(errors, "plz", "9908", "PLZ muss 5-stellig sein.");

      expect(errors).toEqual([
        { field: "plz", message: "PLZ muss 5-stellig sein." },
      ]);
    });

    it("adds an error for postal code with letters", () => {
      const errors = [];

      validatePostalCode(errors, "plz", "99A84", "PLZ muss 5-stellig sein.");

      expect(errors).toEqual([
        { field: "plz", message: "PLZ muss 5-stellig sein." },
      ]);
    });

    it("does not add an error for valid postal code", () => {
      const errors = [];

      validatePostalCode(errors, "plz", "99084", "PLZ muss 5-stellig sein.");

      expect(errors).toEqual([]);
    });

    it("does not add an error when postal code is empty", () => {
      const errors = [];

      validatePostalCode(errors, "plz", "", "PLZ muss 5-stellig sein.");

      expect(errors).toEqual([]);
    });
  });

  describe("validateCompleteDate", () => {
    it("adds an error for incomplete date", () => {
      const errors = [];

      validateCompleteDate(
        errors,
        "geburtsdatum",
        "15.05",
        "Datum unvollständig.",
      );

      expect(errors).toEqual([
        { field: "geburtsdatum", message: "Datum unvollständig." },
      ]);
    });

    it("does not add an error for complete date", () => {
      const errors = [];

      validateCompleteDate(
        errors,
        "geburtsdatum",
        "15.05.2026",
        "Datum unvollständig.",
      );

      expect(errors).toEqual([]);
    });

    it("does not add an error when date is empty", () => {
      const errors = [];

      validateCompleteDate(errors, "geburtsdatum", "", "Datum unvollständig.");

      expect(errors).toEqual([]);
    });
  });

  describe("validateDateRange", () => {
    it("adds an error when end date is before start date", () => {
      const errors = [];

      validateDateRange(
        errors,
        "eintritt",
        "15.05.2026",
        "austritt",
        "14.05.2026",
        "Austritt darf nicht vor Eintritt liegen.",
      );

      expect(errors).toEqual([
        {
          field: "austritt",
          message: "Austritt darf nicht vor Eintritt liegen.",
        },
      ]);
    });

    it("does not add an error when end date is after start date", () => {
      const errors = [];

      validateDateRange(
        errors,
        "eintritt",
        "15.05.2026",
        "austritt",
        "16.05.2026",
        "Austritt darf nicht vor Eintritt liegen.",
      );

      expect(errors).toEqual([]);
    });

    it("does not add an error when one date is empty", () => {
      const errors = [];

      validateDateRange(
        errors,
        "eintritt",
        "15.05.2026",
        "austritt",
        "",
        "Austritt darf nicht vor Eintritt liegen.",
      );

      expect(errors).toEqual([]);
    });
  });

  describe("validateNotFutureDate", () => {
    it("adds an error when date is in the future", () => {
      const errors = [];

      validateNotFutureDate(
        errors,
        "geburtsdatum",
        "16.05.2026",
        "Datum darf nicht in der Zukunft liegen.",
      );

      expect(errors).toEqual([
        {
          field: "geburtsdatum",
          message: "Datum darf nicht in der Zukunft liegen.",
        },
      ]);
    });

    it("does not add an error when date is today", () => {
      const errors = [];

      validateNotFutureDate(
        errors,
        "geburtsdatum",
        "15.05.2026",
        "Datum darf nicht in der Zukunft liegen.",
      );

      expect(errors).toEqual([]);
    });

    it("does not add an error when date is in the past", () => {
      const errors = [];

      validateNotFutureDate(
        errors,
        "geburtsdatum",
        "14.05.2026",
        "Datum darf nicht in der Zukunft liegen.",
      );

      expect(errors).toEqual([]);
    });
  });
});
