import { formatIsoDateToGerman } from "../dateHelpers";

export function createMitgliedschaftDefaults(mitgliedschaft = {}) {
  return {
    eintritt: formatIsoDateToGerman(mitgliedschaft?.eintritt),
    austritt: formatIsoDateToGerman(mitgliedschaft?.austritt),
    mitgliedsstatusId: mitgliedschaft?.mitgliedsstatusId ?? "",
    stimmeId: mitgliedschaft?.stimmeId ?? "",
    kammerchor: mitgliedschaft?.kammerchor ?? false,
  };
}
