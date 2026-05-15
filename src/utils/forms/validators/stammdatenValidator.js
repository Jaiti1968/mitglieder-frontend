import {
  validateCompleteDate,
  validateMaxLength,
  validateRequired,
} from "../validationHelpers";

export function validateStammdaten(values) {
  const validationErrors = [];

  const isFirma = values?.personFirma === true;
  const vorname = values?.vorname ?? "";
  const nachname = values?.nachname ?? "";
  const anrede = values?.anrede ?? "";
  const akademischerTitel = values?.akademischerTitel ?? "";
  const geburtsdatum = values?.geburtsdatum ?? "";
  const plz = values?.plz ?? "";
  const ort = values?.ort ?? "";
  const strasseHausNr = values?.strasseHausNr ?? "";

  if (!isFirma) {
    validateRequired(
      validationErrors,
      "vorname",
      vorname,
      "Vorname darf bei Personen nicht leer sein",
    );
  }

  validateRequired(
    validationErrors,
    "nachname",
    nachname,
    isFirma ? "Firmenname ist Pflicht" : "Nachname ist Pflicht",
  );

  if (!isFirma) {
    validateCompleteDate(
      validationErrors,
      "geburtsdatum",
      geburtsdatum,
      "Datum muss vollständig sein",
    );
  }

  validateMaxLength(
    validationErrors,
    "vorname",
    vorname,
    50,
    isFirma
      ? "Firmenzusatz darf maximal 50 Zeichen haben"
      : "Vorname darf maximal 50 Zeichen haben",
  );

  validateMaxLength(
    validationErrors,
    "nachname",
    nachname,
    50,
    isFirma
      ? "Firmenname darf maximal 50 Zeichen haben"
      : "Nachname darf maximal 50 Zeichen haben",
  );

  validateMaxLength(
    validationErrors,
    "anrede",
    anrede,
    50,
    "Anrede darf maximal 50 Zeichen haben",
  );

  validateMaxLength(
    validationErrors,
    "akademischerTitel",
    akademischerTitel,
    50,
    "Akademischer Titel darf maximal 50 Zeichen haben",
  );

  validateMaxLength(
    validationErrors,
    "plz",
    plz,
    50,
    "PLZ darf maximal 50 Zeichen haben",
  );

  validateMaxLength(
    validationErrors,
    "ort",
    ort,
    50,
    "Ort darf maximal 50 Zeichen haben",
  );

  validateMaxLength(
    validationErrors,
    "strasseHausNr",
    strasseHausNr,
    50,
    "Straße/Hausnummer darf maximal 50 Zeichen haben",
  );

  return validationErrors;
}