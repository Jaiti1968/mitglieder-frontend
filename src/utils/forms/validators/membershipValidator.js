import {
  validateCompleteDate,
  validateDateRange,
  validateRequired,
} from "../validationHelpers";

export function validateMitgliedschaft(values) {
  const validationErrors = [];

  const eintritt = values?.eintritt ?? "";
  const austritt = values?.austritt ?? "";
  const mitgliedsstatusId = values?.mitgliedsstatusId ?? "";
  const stimmeId = values?.stimmeId ?? "";

  validateCompleteDate(
    validationErrors,
    "eintritt",
    eintritt,
    "Datum muss vollständig im Format TT.MM.JJJJ sein",
  );

  validateCompleteDate(
    validationErrors,
    "austritt",
    austritt,
    "Datum muss vollständig im Format TT.MM.JJJJ sein",
  );

  validateRequired(
    validationErrors,
    "mitgliedsstatusId",
    mitgliedsstatusId,
    "Mitgliederstatus ist Pflicht",
  );

  validateRequired(
    validationErrors,
    "stimmeId",
    stimmeId,
    "Stimme ist Pflicht",
  );

  validateDateRange(
    validationErrors,
    "eintritt",
    eintritt,
    "austritt",
    austritt,
    "Austritt darf nicht vor Eintritt liegen",
  );

  return validationErrors;
}
