import {
  createValidationError,
  validateCompleteDate,
  validateRequired,
} from "../validationHelpers";

export function validateEhrung(
  values,
  existingHonors = [],
  currentHonorId = null,
) {
  const validationErrors = [];

  const honorTypeId = values?.honorTypeId ?? "";
  const honorDate = values?.honorDate ?? "";

  validateRequired(
    validationErrors,
    "honorTypeId",
    honorTypeId,
    "Ehrungsart ist Pflicht",
  );

  validateCompleteDate(
    validationErrors,
    "honorDate",
    honorDate,
    "Datum muss vollständig und gültig im Format TT.MM.JJJJ sein",
  );

  if (String(honorTypeId).trim()) {
    const duplicate = existingHonors.some(
      (honor) =>
        String(honor.honorTypeId) === String(honorTypeId) &&
        String(honor.honorId) !== String(currentHonorId),
    );

    if (duplicate) {
      validationErrors.push(
        createValidationError(
          "honorTypeId",
          "Diese Ehrungsart ist für das Mitglied bereits erfasst",
        ),
      );
    }
  }

  return validationErrors;
}
