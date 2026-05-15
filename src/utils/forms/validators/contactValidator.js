import { validateEmail, validateMaxLength } from "../validationHelpers";

export function validateKontakt(values) {
  const validationErrors = [];

  validateMaxLength(
    validationErrors,
    "email",
    values.email,
    100,
    "E-Mail darf maximal 100 Zeichen haben",
  );

  validateEmail(
    validationErrors,
    "email",
    values.email,
    "Bitte eine gültige E-Mail-Adresse eingeben",
  );

  validateMaxLength(
    validationErrors,
    "adresszusatz",
    values.adresszusatz,
    50,
    "Adresszusatz darf maximal 50 Zeichen haben",
  );

  return validationErrors;
}
