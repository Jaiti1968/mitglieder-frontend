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
      ? ""
      : values?.geburtsdatum
        ? parseGermanDateToIso(values.geburtsdatum)
        : "",
    plz: values?.plz ?? "",
    ort: values?.ort ?? "",
    strasseHausNr: values?.strasseHausNr ?? "",
  };
}
