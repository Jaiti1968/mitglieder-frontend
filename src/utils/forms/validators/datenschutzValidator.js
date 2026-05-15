import {
  validateCompleteDate,
  validateNotFutureDate,
} from "../validationHelpers";

export function validateDatenschutz(values) {
  const validationErrors = [];
  const datumDatenschutz = values?.datumDatenschutz ?? "";

  validateCompleteDate(
    validationErrors,
    "datumDatenschutz",
    datumDatenschutz,
    "Datum muss vollständig sein",
  );

  validateNotFutureDate(
    validationErrors,
    "datumDatenschutz",
    datumDatenschutz,
    "Datum Datenschutz darf nicht in der Zukunft liegen",
  );

  return validationErrors;
}
