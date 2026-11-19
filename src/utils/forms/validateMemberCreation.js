import {
  validateStammdaten,
  validateKontakt,
  validateMitgliedschaft,
} from "./validators";

export function validateMemberCreation(stammdaten, kontakt, mitgliedschaft) {
  const stammdatenErrors = validateStammdaten(stammdaten);
  const kontaktErrors = validateKontakt(kontakt);
  const mitgliedschaftErrors = validateMitgliedschaft(mitgliedschaft);

  return {
    stammdatenErrors,
    kontaktErrors,
    mitgliedschaftErrors,
    canCreate:
      stammdatenErrors.length === 0 &&
      kontaktErrors.length === 0 &&
      mitgliedschaftErrors.length === 0,
  };
}
