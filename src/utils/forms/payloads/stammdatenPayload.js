import { parseGermanDateToIso } from "../dateHelpers";

export function createStammdatenPayload(values) {
  return {
    personFirma: values?.personFirma === true,
    anrede: values?.personFirma ? "" : (values?.anrede ?? ""),
    akademischerTitel: values?.personFirma
      ? ""
      : (values?.akademischerTitel ?? ""),
    vorname: values?.vorname ?? "",
    nachname: values?.nachname ?? "",
    geburtsdatum: values?.personFirma
      ? null
      : values?.geburtsdatum
        ? parseGermanDateToIso(values.geburtsdatum)
        : null,
    plz: values?.plz ?? "",
    ort: values?.ort ?? "",
    strasseHausNr: values?.strasseHausNr ?? "",
  };
}
