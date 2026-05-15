import { formatIsoDateToGerman } from "../dateHelpers";

export function createStammdatenDefaults(stammdaten = {}) {
  return {
    personFirma: stammdaten?.personFirma ?? false,
    anrede: stammdaten?.anrede ?? "Herr",
    akademischerTitel: stammdaten?.akademischerTitel ?? "",
    vorname: stammdaten?.vorname ?? "",
    nachname: stammdaten?.nachname ?? "",
    geburtsdatum: formatIsoDateToGerman(stammdaten?.geburtsdatum),
    plz: stammdaten?.plz ?? "",
    ort: stammdaten?.ort ?? "",
    strasseHausNr: stammdaten?.strasseHausNr ?? "",
  };
}
