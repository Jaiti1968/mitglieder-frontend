import {
  validateCompleteDate,
  validateDateRange,
  validateNotFutureDate,
} from "../validationHelpers";

export function validateChorkleidung(values) {
  const validationErrors = [];

  validateCompleteDate(
    validationErrors,
    "uebergabeAm",
    values?.uebergabeAm,
    "Datum muss vollständig im Format TT.MM.JJJJ sein",
  );
  validateCompleteDate(
    validationErrors,
    "datumAnteil",
    values?.datumAnteil,
    "Datum muss vollständig im Format TT.MM.JJJJ sein",
  );
  validateCompleteDate(
    validationErrors,
    "rueckgabeAm",
    values?.rueckgabeAm,
    "Datum muss vollständig im Format TT.MM.JJJJ sein",
  );
  validateCompleteDate(
    validationErrors,
    "kaufdatum",
    values?.kaufdatum,
    "Datum muss vollständig im Format TT.MM.JJJJ sein",
  );
  validateCompleteDate(
    validationErrors,
    "sommerkleidungErhalten",
    values?.sommerkleidungErhalten,
    "Datum muss vollständig im Format TT.MM.JJJJ sein",
  );
  validateCompleteDate(
    validationErrors,
    "sommerkleidungRueckgabe",
    values?.sommerkleidungRueckgabe,
    "Datum muss vollständig im Format TT.MM.JJJJ sein",
  );

  validateNotFutureDate(
    validationErrors,
    "uebergabeAm",
    values?.uebergabeAm,
    "Übergabe am darf nicht in der Zukunft liegen",
  );
  validateNotFutureDate(
    validationErrors,
    "sommerkleidungErhalten",
    values?.sommerkleidungErhalten,
    "Sommerkleidung erhalten darf nicht in der Zukunft liegen",
  );

  validateDateRange(
    validationErrors,
    "uebergabeAm",
    values?.uebergabeAm,
    "rueckgabeAm",
    values?.rueckgabeAm,
    "Rückgabe darf nicht vor Übergabe liegen",
  );
  validateDateRange(
    validationErrors,
    "sommerkleidungErhalten",
    values?.sommerkleidungErhalten,
    "sommerkleidungRueckgabe",
    values?.sommerkleidungRueckgabe,
    "Sommerkleidung-Rückgabe darf nicht vor Erhalt liegen",
  );

  validateKaufpreis(validationErrors, values?.kaufpreis);

  return validationErrors;
}

function validateKaufpreis(validationErrors, value) {
  if (value === "" || value === null || value === undefined) {
    return;
  }

  const kaufpreis = parseKaufpreis(value);

  if (kaufpreis === null || Number.isNaN(kaufpreis)) {
    validationErrors.push({
      field: "kaufpreis",
      message: "Kaufpreis muss eine Zahl sein",
    });
    return;
  }

  if (kaufpreis < 0) {
    validationErrors.push({
      field: "kaufpreis",
      message: "Kaufpreis darf nicht negativ sein",
    });
  }
}

export function parseKaufpreis(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const normalizedValue = String(value).trim().replace(",", ".");
  const parsedValue = Number(normalizedValue);

  return Number.isNaN(parsedValue) ? NaN : parsedValue;
}
